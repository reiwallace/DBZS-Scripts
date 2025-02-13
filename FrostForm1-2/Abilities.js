var previousTargets = new Array();
// Tuning Knobs
var staminaReduction = 0.75; // Lethal stamina reduction percentage 0-1
var lethalDam = 1; // Damage of lethal poison
var arenaSize = 100; // Arena size - used for removing stacks from players no longer in the fight


var originalStamina;
var target;
var DBCTarget;

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
    } else if(id == 2) {

    }
}

function getRandomInt(min, max) {  // Get a random number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseAbility(npc) { // Decide which attack to use
    var abilityChoice = getRandomInt(0, 1);
    if(npc.getTempData("Form") == 1) { // Phase 1 attacks
        if(abilityChoice == 0) {
            nonLethalPoison(npc);
        } else if(abilityChoice == 1) {
            
        }
    } else if(npc.getTempData("Form") == 2) { // Phase 2 attacks
        if(abilityChoice == 0) {

        } else if(abilityChoice == 1) {
            
        }
    }
}

function nonLethalPoison(npc) {
    npc.say("Epic line");
    target.setTempData("Non-lethal Poison", true);
    npc.times.forceStart(2, 10, true);
}

function addLethalPoison(target) { // Add a stack of lethal poison to a target
    if(target != null && !target.hasTempData("Lethal Poison")) {
        target.setTempData("Lethal Poison", 1);
    } else if(target != null) {
        target.setTempData("Lethal Poison", target.getTempData("Lethal Poison") + 1);
    }
}

function subtractLethalPoison(target) { // Remove a stack of lethal poison from a target
    if(target != null && target.getTempData("Lethal Poison") > 0) {
        target.setTempData("Lethal Poison", target.getTempData("Lethal Poison") - 1);
    } 
}

function resetLethalPoison(target) { // Remove all Lethal poison stacks on a target
    if(target != null && target.getTempData("Lethal Poison") > 0) {
        target.removeTempData("Lethal Poison");
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

function meleeAttack(e) { // Apply poison on melee swing
    target = e.getAttackTarget();
    DBCTarget = target.getDBCPlayer();
    addLethalPoison(target);
}
