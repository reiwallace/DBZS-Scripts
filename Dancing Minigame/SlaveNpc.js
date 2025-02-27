// Changeables
var masterNpcName = "The bossman"; // Change to master npc's name

var MASTER_NPC;

//Timers
var CHECK_COLLISION = 0;

// Scan for master npc 
function init(event)
{
    var search = event.npc.getSurroundingEntities(20,2); // Search for master npc
    for(i = 0; i < search.length; i++) {
        if(search[i].getName() == masterNpcName) {
            MASTER_NPC = search[i];
            break;
        }
    }
}

// Periodically check if player has left collision hitbox
function timer(event)
{
    var npc = event.npc;
    if(event.id == CHECK_COLLISION && npc.hasTempData("isRightPose")) { // Check if player has left pose
        var search = npc.getSurroundingEntities(0, 1);
        var searchArray = new Array();
        for(i = 0; i < search.length; i++) {
            searchArray.push(search[i]);
        }
        if(searchArray.indexOf(npc.getTempData("ACTIVE_PLAYER")) < 0 && npc.getTempData("ACTIVE_PLAYER").getAnimationData().getAnimation() == npc.getAnimationData().getAnimation()) { 
            // If active player is not collision range and has the npc's current animation reset the player
            resetNPC(npc.getTempData("ACTIVE_PLAYER"));
        }
    } 
}

// Change player animation if colliding when a round is active
function collide(event)
{
    var npc = event.npc;
    var player = event.getEntity();
    if(npc.hasTempData("isRightPose") && player == npc.getTempData("ACTIVE_PLAYER")) { // Only check player collision if npc posing
        setPlayerPose(player, npc.getAnimationData().getAnimation());
        npc.timers.forceStart(CHECK_COLLISION, 10, true); // Check if player has left the collision range
    }
}

/** Reset target npc's animations and temp data
 * @param {ICustomNpc or IPlayer} targetNpc - Player or Npc to reset animation and temp data of 
 */
function resetNPC(targetNpc)
{
    var animData = targetNpc.getAnimationData();
    animData.setEnabled(false);
    animData.setAnimation(null);
    animData.updateClient();
}

/** Update player's animation to one given
 * @param {IPlayer} targetPlayer - The player to set the pose of 
 * @param {IAnimation} Pose - Pose to set the player to 
 */
function setPlayerPose(targetPlayer, Pose) { // Set a player's animation
    var animData = targetPlayer.getAnimationData();
    animData.setEnabled(true);
    animData.setAnimation(Pose);
    animData.updateClient();
}
