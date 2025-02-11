var previousTargets = new Array();
var lethalDam = 1; // Damage of lethal poison
var arenaSize = 100; // Arena size - used for removing stacks from players no longer in the fight

function init(e) {
    var npc = e.npc;
    npc.timers.forceStart(0, 40, true);
}

function timer(e) {
    var npc = e.npc;
    var id = e.id;
    if(id == 0) {
        poisonTick(npc); // Do poison tick on timer
    }
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
    var t = e.getAttackTarget();
    addLethalPoison(t);
}
