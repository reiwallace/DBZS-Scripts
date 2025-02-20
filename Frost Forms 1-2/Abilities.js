var previousTargets = new Array();
// Tuning Knobs
var nonLethalStaminaMax = 0.25; // Non-lethal max stamina
var nonLethalClockMax = 100; // Duration of Non-lethal poison ticks
var lethalDam = 1; // Damage of lethal poison
var arenaSize = 100; // Arena size - used for removing stacks from players no longer in the fight
var telegraphTimer = 20; // Telegraph time for attacks
var meleeSpecialRange = 3; // Range for p2 melee special attack
var meleeSpecialStacks = 5; // Number of stacks applied by p2 melee special attack
var meditationStackRed = 10; // Number ticks between reducing stacks
var poisonTickSpeed = 40; // Speed poison ticks in well ticks
var nonLethalLine = "&2&lNon-lethal Poison"; // Attack line for non-lethal poison
var kiLazerLine = "&9&lKi lazer"; // Attack line for ki lazer
var meleeSpecialLine = "&6&lMelee Special"; // Attack line for special melee attack
var kiBarrageLine = "&1&lKi lazer barrage"; // Attack line for ki lazer barrage

var resetThisMan;
var nonLethalClock;
var target;
var DBCTarget;
var angle;
var heightIncrement;
var count;

function init(e) {
    var npc = e.npc;
    npc.timers.forceStart(0, poisonTickSpeed, true); // Start poison tick timer
    npc.timers.forceStart(1, meditationStackRed, true); // Start poison tick timer
    npc.timers.forceStart(2, 200, true); // Start ability timer
}

function timer(e) {
    var npc = e.npc;
    var id = e.id;
    if(id == 0) {
        poisonTick(npc); // Do poison tick on timer
    } else if(id == 1 && target != null && npc.getTempData("Form") == 2 && DBCTarget.getJRMCSE().contains("A") && target.getTempData("Lethal Poison") > 0) {
        // Lower poison stacks if player is meditating and has at least 1 stack
        incrementLethalPoison(target, -1)
    } else if(id == 2) { // Decide ability
        chooseAbility(npc);
    } else if(id == 3 && DBCTarget != null) { // Non-lethal poison timer
        resetThisMan = DBCTarget;
        if(DBCTarget.getSkills().contains("DS")) {
            resetThisMan = DBCTarget.getSkillLevel("Dash");
        }
        target.addPotionEffect​(2, nonLethalClockMax/20, 200, true);
        nonLethalEffects(npc, DBCTarget);
    } else if(id == 4) { // Fire single Ki attack
        fireLazer(npc);
    } else if(id == 5) { // Big melee
        poisonAoe(npc);
    } else if(id == 6) { // Ki barrage telegraph
        npc.timers.forceStart(7, 0, true);
    } else if(id == 7) { // Ki vomit
        fireLazer(npc);
        count++;
        if(count > 15) { // Stop after 15 shots
            npc.timers.stop(7);
        }
    }
}

function getRandomInt(min, max) {  // Get a random number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseAbility(npc) { // Decide which attack to use
    var abilityChoice = getRandomInt(0, 1);
    if(npc.getTempData("Form") == 1) { // Phase 1 attacks
        if(abilityChoice == 0) { // Non-lethal Poison
            npc.say(nonLethalLine);
            npc.timers.forceStart(3, 1, true);
        } else if(abilityChoice == 1) { // Ki lazer
            npc.say(kiLazerLine);
            npc.timers.forceStart(4, telegraphTimer, false);
        }
    } else if(npc.getTempData("Form") == 2) { // Phase 2 attacks
        if(abilityChoice == 0) { // Melee special
            npc.say(meleeSpecialLine); 
            npc.timers.forceStart(5, telegraphTimer, false);
        } else if(abilityChoice == 1) { // Ki lazer barrage
            npc.say(kiBarrageLine);
            count = 0;
            npc.timers.forceStart(6, telegraphTimer, false);
        }
    }
}

function incrementLethalPoison(target, increment) { // Add a stack of lethal poison to a target
    if(target != null && !target.hasTempData("Lethal Poison") && increment > 0) { // Create temp data if non existent
        target.setTempData("Lethal Poison", 1);
    } else if(target != null) {
        target.setTempData("Lethal Poison", target.getTempData("Lethal Poison") + increment); // Increment temp data
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

function nonLethalEffects(npc, DBCTarget) { // Applies effects of non-lethal poison
    nonLethalClock++;
    if(DBCTarget != null) { // Disable turbo and lower stamina
        var loweredStamina = DBCTarget.getMaxStamina() * nonLethalStaminaMax;
        DBCTarget.setTurboState(false);
        if(DBCTarget.getStamina() > loweredStamina) {
            DBCTarget.setStamina(loweredStamina);
        }
    }
    if(nonLethalClock > nonLethalClockMax) { // End loop after set amount of time
            npc.timers.stop(2);
    }
}

function fireLazer(npc) { // Lazer attack thats actually a blast
    npc.executeCommand("/dbcspawnki 1 1 " + lazerDamage + " 0 4 10 1 100 " + npc.x + " " + npc.y + " " + npc.z + "");
}

function poisonAoe(npc) { // Apply poison stacks to player if they are in range
    var playersToHit = npc.getSurroundingEntities(meleeSpecialRange, 1);
    for(i = 0; i < playersToHit.length; i++) {
        if(playersToHit[i] != null) {
            for(n = 0; n < meleeSpecialStacks; i++) { // Apply adjustable amount of stacks
                addLethalPoison(playersToHit[i]);
            }
        }
    }
}

function meleeAttack(e) { // Apply poison on melee swing
    var npc = e.npc;
    target = e.getAttackTarget();
    DBCTarget = target.getDBCPlayer();
    if(npc.getTempData("Form") == 2) {
        addLethalPoison(target);
    }
}
