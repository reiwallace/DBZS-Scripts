var previousTargets = new Array();
// Tuning Knobs
var nonLethalStaminaMax = 0.25; // Non-lethal max stamina
var nonLethalClockMax = 100; // Duration of Non-lethal poison ticks
var lethalDam = 1; // Damage of lethal poison
var arenaSize = 100; // Arena size - used for removing stacks from players no longer in the fight

var nonLethalClock;
var target;
var DBCTarget;
var angle;
var heightIncrement;

function init(e) {
    var npc = e.npc;
    npc.timers.forceStart(0, 40, true); // Start poison tick timer
    npc.timers.forceStart(1, 200, true); // Start ability timer
}

function timer(e) {
    var npc = e.npc;
    var id = e.id;
    if(id == 0) {
        poisonTick(npc); // Do poison tick on timer
    } else if(id == 1) {
        chooseAbility(npc);
    } else if(id == 2) { // Non-lethal poison timer
        nonLethalClock++;
        // INSERT WEIGHT CODE
        if(DBCTarget != null) { // Disable turbo and lower stamina
            var loweredStamina = DBCTarget.getMaxStamina() * nonLethalStaminaMax;
            DBCTarget.setTurboState(false);
            if(DBCTarget.getStamina() > loweredStamina) {
                DBCTarget.setStamina(loweredStamina);
            }
        }
        if(nonLethalClock > nonLethalClockMax) { // End loop after set amount of time
            npc.timers.stop(2);
        } else if(id == 3) {
            var dx = -Math.sin(angle*Math.PI/180) * 0.5;
            var dz = Math.cos(angle*Math.PI/180) * 0.5;
            npc.world.spawnParticle("magicCrit", npc.x+dx, npc.y + heightIncrement, npc.z+dz, 0, 0, 0, 0, 5);
            heightIncrement += 0.2;
            angle += 36;
            if(!npc.timers.has(4)) {
                npc.timers.stop(3);
            }
        } else if(id == 4) {
            fireLazer(npc);
        }
    }
}

function getRandomInt(min, max) {  // Get a random number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseAbility(npc) { // Decide which attack to use
    var abilityChoice = getRandomInt(0, 1);
    if(npc.getTempData("Form") == 1) { // Phase 1 attacks
        if(abilityChoice == 0) {
            npc.say("Epic line");
            target.addPotionEffect(2, 10, 5, true);
            npc.timers.forceStart(2, 1, true);
        } else if(abilityChoice == 1) {
            npc.say("A");
            angle = 0;
            heightIncrement = 0;
            npc.timers.forceStart(3, 1, true);
            npc.timers.forceStart(4, 20, false);
        }
    } else if(npc.getTempData("Form") == 2) { // Phase 2 attacks
        if(abilityChoice == 0) {

        } else if(abilityChoice == 1) {
            
        }
    }
}

function addLethalPoison(target) { // Add a stack of lethal poison to a target
    if(target != null && !target.hasTempData("Lethal Poison")) { // Create temp data if non existent
        target.setTempData("Lethal Poison", 1);
    } else if(target != null) {
        target.setTempData("Lethal Poison", target.getTempData("Lethal Poison") + 1); // Increment temp data
    }
}

function subtractLethalPoison(target) { // Remove a stack of lethal poison from a target
    if(target != null && target.getTempData("Lethal Poison") > 0) {
        target.setTempData("Lethal Poison", target.getTempData("Lethal Poison") - 1); // Lower temp data
    } 
}

function resetLethalPoison(target) { // Remove all Lethal poison stacks on a target
    if(target != null && target.getTempData("Lethal Poison") > 0) {
        target.removeTempData("Lethal Poison"); // Delete temp data
    } 
}

function poisonTick(npc) { // Function to execute poison damage on nearby players with stacks
    var nearbyPlayers = npc.getSurroundingEntities(arenaSize, 1);
    // Change poison damage
    for(i = 0; i < nearbyPlayers.length; i++) {
        var toDamageTarget = nearbyPlayers[i];
        var poisonStacks = toDamageTarget.getTempData("Lethal Poison");
        if(toDamageTarget != null && poisonStacks > 0 && toDamageTarget.getMode() != 1 && !toDamageTarget.getDBCPlayer().isDBCFusionSpectator()) {
        // Only damage players that have at least one lethal poison stack, are not in creative and are not a fusion spectator.    
        var DBCPlayer = toDamageTarget.getDBCPlayer();
            DBCPlayer.setBody(DBCPlayer.getBody() - lethalDam * poisonStacks);
        }
    }
}

function fireLazer{npc} { // Lazer attack thats actually a blast
    npc.executeCommand("/dbcspawnki 1 1 " + lazerDamage + " 0 4 10 1 100 " + npc.x + " " + npc.y + " " + npc.z + "");
}

function meleeAttack(e) { // Apply poison on melee swing
    var npc = e.npc;
    target = e.getAttackTarget();
    DBCTarget = target.getDBCPlayer();
    if(npc.getTempData("Form") == 2) {
        addLethalPoison(target);
    }
}
