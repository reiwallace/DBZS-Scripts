var previousTargets = new Array();
// Tuning Knobs
var GCLocations = [[-258, 55, -843], [-258, 55, -830], [-258, 55, -856], [-248, 55, -843], [-270, 55, -843]]; // Locations of gravity chambers
var arenaSize = 50; // Size of arena - used for damaging poisoned players

var nonLethalStaminaMax = 0.25; // Non-lethal max stamina
var nonLethalDuration = 100; // Duration of Non-lethal poison ticks
var nonLethalGravity = 1000; // Gravity to be put on the player

var overlayID = 0; // ID for poison stacks overlay
var overlayText = "Lethal Poison: "; // Text displayed on screen to show poison stacks - has the number of stacks added right after
var lethalDam = 0.02; // Percentage of health done per stack of poison per tick
var poisonTickSpeed = 40; // Speed poison ticks in well ticks
var meditationStackRed = 5; // Number ticks between reducing stacks

var meleeSpecialTelegraphTimer = 30; // Telegraph timer for melee special attack
var meleeSpecialRange = 3; // Range for p2 melee special attack
var meleeSpecialStacks = 15; // Number of stacks applied by p2 melee special attack

var kiLazerTelegraphTimer = 20; // Telegraph for single lazer
var kiBarrageTelegraphTimer = 30; // Telegraph for ki barrage
var lazerDamage = 10; // Damage of ki attack
var maxLazers = 15; // Amount of shots per ki vomit

var nonLethalLine = "&2&lNon-lethal Poison"; // Attack line for non-lethal poison
var kiLazerLine = "&9&lKi lazer"; // Attack line for ki lazer
var meleeSpecialLine = "&6&lMelee Special"; // Attack line for special melee attack
var kiBarrageLine = "&1&lKi lazer barrage"; // Attack line for ki lazer barrage

var angle = 0;
var target;
var DBCTarget;
var count = 0;
var toReset = new Array();

function timer(e) {
    var npc = e.npc;
    var id = e.id;
    if(id == 0) { // Do poison tick on timer
        poisonTick(npc); 
    } else if(id == 1 && target != null && npc.getTempData("Form") == 2 && DBCTarget.getJRMCSE().contains("A") && target.getTempData("Lethal Poison") > 0) {
        // Lower poison stacks if player is meditating and has at least 1 stack
        incrementLethalPoison(target, -1)
    } else if(id == 2) { // Decide ability
        chooseAbility(npc);
    } else if(id == 3 && DBCTarget != null) { // Non-lethal poison timer
        nonLethalEffects(npc, DBCTarget);
    } else if(id == 4) { // Fire single Ki attack
        fireLazer(npc);
    } else if(id == 5) {
        telegraphMelee(npc, "plug:textures/blocks/concrete_periwinkle.png", meleeSpecialTelegraphTimer, 5, 6)
    } else if(id == 6) { // Big melee
        specialMeleeAttack(npc);
    } else if(id == 7) { // Ki barrage telegraph
        npc.timers.forceStart(8, 0, true);
    } else if(id == 8) { // Ki barrage
        fireLazer(npc);
        count++;
        if(count > maxLazers) { // Stop after 15 shots
            npc.timers.stop(8);
        }
    }
}

function getRandomInt(min, max) {  // Get a random number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseAbility(npc) { // Decide which attack to use
    var abilityChoice = getRandomInt(0, 1);
    if(npc.getTempData("Form") == 1 && !npc.getTempData("Transforming")) { // Phase 1 attacks
        if(abilityChoice == 0) { // Non-lethal Poison
            npc.say(nonLethalLine);
            npc.playSound("jinryuudragonbc:DBC4.block2", 100, 1);
            var nearestGCArray = findNearestGC(npc.getPosition());
            var block = npc.world.getBlock(nearestGCArray[0], nearestGCArray[1], nearestGCArray[2]); // Find nearest gravity chamber block
            var tile = block.getTileEntity();
            var nbt = tile.getNBT();
            nbt.setFloat('gravity', nonLethalGravity); // Set chamber gravity
            nbt.setFloat('BurnTime', nonLethalDuration); // Set chamber duration to nonLethal duration
            tile.readFromNBT(nbt);
            count = 0;
            npc.timers.forceStart(3, 1, true); // Disable turbo and apply stamina reduction
        } else if(abilityChoice == 1) { // Ki lazer
            npc.say(kiLazerLine);
            npc.timers.forceStart(4, kiLazerTelegraphTimer, false);
        }
    } else if(npc.getTempData("Form") == 2 && !npc.getTempData("Transforming")) { // Phase 2 attacks
        if(abilityChoice == 0) { // Melee special
            npc.say(meleeSpecialLine); 
            npc.setSpeed(0);
            angle = 0;
            particles = new Array();
            npc.timers.forceStart(5, 0.5, true); // Start animation timer
            npc.timers.forceStart(6, meleeSpecialTelegraphTimer, false);
        } else if(abilityChoice == 1) { // Ki lazer barrage
            npc.say(kiBarrageLine);
            count = 0;
            npc.timers.forceStart(7, kiBarrageTelegraphTimer, false);
        }
    }
}

function incrementLethalPoison(target, increment) { // Add a stack of lethal poison to a target
    if(target != null) {
        target.setTempData("Lethal Poison", target.getTempData("Lethal Poison") + increment); // Increment temp data
        poisonStackDisplay(target, overlayText + target.getTempData("Lethal Poison"), 3655475, 1, overlayID); // Set poison overlay
    }
}

function poisonTick(npc) { // Function to execute poison damage on nearby players with stacks as well as removing stacks when not in p2 anymore
    var nearbyPlayers = npc.getSurroundingEntities(arenaSize, 1);
    var nearbyPlayers2 = new Array();
    for(i = 0; i < nearbyPlayers.length; i++) {
        var poisonStacks = nearbyPlayers[i].getTempData("Lethal Poison");
        if(nearbyPlayers[i] != null && poisonStacks > 0 && nearbyPlayers[i].getMode() != 1 && !nearbyPlayers[i].getDBCPlayer().isDBCFusionSpectator() && npc.getTempData("Form") == 2) {
        // Only damage players that have at least one lethal poison stack, are not in creative and are not a fusion spectator.    
            var DBCPlayer = nearbyPlayers[i].getDBCPlayer();
            DBCPlayer.setHP(DBCPlayer.getHP() - (DBCPlayer.getMaxHP() * lethalDam * poisonStacks));
        }
        nearbyPlayers2.push(nearbyPlayers[i]); // Add player to non entity array
    } 
    for(i = 0; i < toReset.length; i++) { // Reset stacks of players no longer in range or if the boss dies
        if(toReset[i] != null && (npc.getTempData("Form") != 2 || nearbyPlayers2.indexOf(toReset[i]) < 0)) {
            toReset[i].removeTempData("Lethal Poison");
            toReset[i].closeOverlay(overlayID);
            toReset.splice(i);
        } 
    }
}

function poisonStackDisplay(player, text, color, size, speakID) { // Slightly modified version of my 'speak' function
    player.closeOverlay(speakID);
    var speechOverlay = API.createCustomOverlay(speakID); // Create overlay with id
    var x = 480 - Math.floor((text.length) * 2.5) * size; // Calculate centre position
    var y = 246 - Math.floor(size * 6.5);
    speechOverlay.addLabel(1, text, x, y, 0, 0, color); // Add label in the middle of the screen with the given color
    speechOverlay.getComponent(1).setScale(size); // Resize the label
    player.showCustomOverlay(speechOverlay); // Place the overlay on the player's screen
    speechOverlay.update(player); // Update the label to be visible
}

function specialMeleeAttack(npc) { // Apply poison stacks to player if they are in range
    var playersToHit = npc.getSurroundingEntities(meleeSpecialRange, 1); // Get players in range
    for(i = 0; i < playersToHit.length; i++) {
        if(playersToHit[i] != null) {
            incrementLethalPoison(playersToHit[i], meleeSpecialStacks); // Increment by x number of stacks
        }
    }
    npc.playSound("jinryuudragonbc:DBC4.disckill", 100, 1);
    npc.setSpeed(npc.getTempData("Movement Speed"));
}

function telegraphMelee(npc, particlePath, duration, timerNo, finishTimer) {
    function createParticle(npc, x, y, z) { // Particle creation
        var particle = API.createParticle(particlePath);
        particle.setSize(16, 16);
        particle.setMaxAge(30);
        particle.setAlpha(1, 0, 0.2, 15);
        particle.setPosition(x, y, z);
        particle.setScale(5, 5, 0, 5);
        particle.spawn(npc.getWorld());
    }

    var dx = -Math.sin(angle*Math.PI/180) * 5; // Rotational positioning math
    var dz = Math.cos(angle*Math.PI/180) * 5;
    createParticle(npc, npc.x+dx, npc.y + 0.5, npc.z+dz);
    createParticle(npc, npc.x+-dx, npc.y + 0.5, npc.z+-dz);
    angle += 360/(duration*2);

    if(!npc.timers.has(finishTimer)) { // Stop rotation if telegraph done
        npc.timers.stop(timerNo);
    }
}

function nonLethalEffects(npc, DBCTarget) { // Applies effects of non-lethal poison
    count += 2;
    if(DBCTarget != null) { // Disable turbo and lower stamina
        var loweredStamina = DBCTarget.getMaxStamina() * nonLethalStaminaMax;
        DBCTarget.setTurboState(false);
        if(DBCTarget.getStamina() > loweredStamina) {
            DBCTarget.setStamina(loweredStamina);
        }
    }
    if(count > nonLethalDuration) { // End loop after set amount of time
            npc.timers.stop(3);
    }
}

function findNearestGC(npcPos) { // Find the nearest gravity chamber for a 2d array of coordinates
    var proximity = 1000; // Distance to nearest gc
    var nearestGC = new Array(); // Array of gc
    for(i = 0; i < GCLocations.length; i++) {
        var distanceToi = npcPos.distanceTo(GCLocations[i][0], GCLocations[i][1], GCLocations[i][2]); // Calculate how far away npc is to gravity chamber
        if(proximity > distanceToi) { // If selected gravity chamber is closer than all others set variables
            proximity = distanceToi;
            nearestGC = GCLocations[i];
        }
    }
    return nearestGC;
}

function fireLazer(npc) { // Lazer attack thats actually a blast
    npc.executeCommand("/dbcspawnki 1 1 " + lazerDamage + " 0 4 10 1 100 " + npc.x + " " + npc.y + " " + npc.z + "");
}

function meleeAttack(e) { // Apply poison on melee swing
    var npc = e.npc;
    target = npc.getAttackTarget();
    DBCTarget = target.getDBCPlayer();
    npc.timers.forceStart(10, npc.getTempData("Reset Time"), false);
    if(toReset.indexOf(target) < 0) {
        toReset.push(target);
    }
    if(!npc.timers.has(0) || !npc.timers.has(1) || !npc.timers.has(2)) {
        npc.timers.forceStart(0, poisonTickSpeed, true); // Start poison tick timer
        npc.timers.forceStart(1, meditationStackRed, true); // Start poison tick timer
        npc.timers.forceStart(2, 200, true); // Start ability timer
    }
    if(npc.getTempData("Form") == 2) { // Apply lethal poison on melees in p2
        incrementLethalPoison(target, 1);
    }
}