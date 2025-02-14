var masterNpcName = "The bossman"; // Change to master npc's name
var selectionDelay = 20; // How long the player needs to stand on the npc to confirm selection

var masterNpc;
var nearbyPlayer;

function init() {
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
        var checkPlayer = getSurroundingEntities(0, 1);
        if(checkPlayer.length > 0) {
            masterNpc.timers.forceStart(11, 1, false); // Fire off signal to master npc
        }
    }
}

function collide(e) { // Check for player collision
    var npc = e.npc;
    var player = e.getEntity();
    if(npc.hasTempData("isRightPose")) { // Only check player collision if npc posing
        npc.say("Pose selected.");
        npc.say("Stand still to confirm pose.");
        npc.timers.forceStart(0, selectionDelay, false);
    }
}
