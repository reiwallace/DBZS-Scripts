var masterNpcName = "The bossman"; // Change to master npc's name
var selectionDelay = 20; // How long the player needs to stand on the npc to confirm selection

var masterNpc;
var nearbyPlayer;

function init(e) {
    var npc = e.npc;
    var search = npc.getSurroundingEntities(20,2); // Search for master npc
    for(i = 0; i < search.length; i++) {
        if(search[i].getName() == masterNpcName) {
            masterNpc = search[i];
            break;
        }
    }
}

function timer(e) {
    var npc = e.npc;
    var id = e.id;
    if(id == 0) { // Confirm selection after delay
        var checkPlayer = npc.getSurroundingEntities(1, 1);
        if(checkPlayer.length > 0 && npc.getTempData("isRightPose")) {
            masterNpc.timers.forceStart(3, 1, false); // Fire off win signal to master npc
        } else if(checkPlayer.length > 0 && !npc.getTempData("isRightPose")) {
            masterNpc.timers.forceStart(4, 1, false); // Fire off lose signal to master npc
        }
    }
}

function collide(e) { // Check for player collision
    var npc = e.npc;
    var player = e.getEntity();
    if(npc.hasTempData("isRightPose") && !npc.timers.has(0)) { // Only check player collision if npc posing
        player.sendMessage("&oPose selected.");
        player.sendMessage("&oStand still to confirm pose.");
        setPlayerPose(player, npc.getAnimationData().getAnimation());
        npc.timers.forceStart(0, selectionDelay, false);
    }
}

function setPlayerPose(targetPlayer, Pose) { // Set a player's animation
    var animData = targetPlayer.getAnimationData();
    animData.setEnabled(true);
    animData.setAnimation(Pose);
    animData.updateClient();
}
