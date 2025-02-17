var masterNpcName = "The bossman"; // Change to master npc's name


var masterNpc;
var recentCollisions = new Array();

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
    if(id == 0 && npc.hasTempData("isRightPose")) { // Check if player has left pose
        var search = npc.getSurroundingEntities(0, 1);
        var searchArray = new Array();
        for(i = 0; i < search.length; i++) {
            searchArray.push(search[i]);
        }
        if(searchArray.indexOf(npc.getTempData("activePlayer")) < 0) { // Check if player leaves npc collision
            var animData = npc.getTempData("activePlayer").getAnimationData();
            if(animData.getAnimation() == npc.getAnimationData().getAnimation()) { // Remove animation if player has npc's animation
                animData.setEnabled(false);
                animData.setAnimation(null);
                animData.updateClient();
            }
        }
    } 
}

function collide(e) { // Check for player collision
    var npc = e.npc;
    var player = e.getEntity();
    if(npc.hasTempData("isRightPose") && player == npc.getTempData("activePlayer")) { // Only check player collision if npc posing
        setPlayerPose(player, npc.getAnimationData().getAnimation());
        npc.timers.forceStart(0, 10, true); // Check if player has left the pose
    }
}

function setPlayerPose(targetPlayer, Pose) { // Set a player's animation
    var animData = targetPlayer.getAnimationData();
    animData.setEnabled(true);
    animData.setAnimation(Pose);
    animData.updateClient();
}
