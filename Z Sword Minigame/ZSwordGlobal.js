// ZSwordGlobal.js
// AUTHOR: Noxie

var SPAM_INTERVAL = 7; // Max number of ticks between player spams
var SPAM_COUNT = 10; // Number of spams needed
var SINGLE_CLICK_WIN_DELAY = 20; // Delay after single pressing to end the round
var HOLD_WIN_DELAY = 40; // Delay after single pressing to end the round

// Animation names (can use the same animation for multiple)
var LEFT_SPAM_ANIMATION_NAME = "SPAM";
var LEFT_HOLD_ANIMATION_NAME = "HOLD";
var LEFT_SINGLE_ANIMATION_NAME = "SINGLE";
var RIGHT_SPAM_ANIMATION_NAME = "SPAM";
var RIGHT_HOLD_ANIMATION_NAME = "HOLD";
var RIGHT_SINGLE_ANIMATION_NAME = "SINGLE";

// Player timers
var SPAM_CHECK = 0;
var SPAM_GRACE = 1;
var HOLD_GRACE = 2;

// Npc timers
var PASS_ROUND = 2;
var FAIL_ROUND = 3;

function mouseClicked(event)
{
    var player = event.player;
    var npc = player.getTempData("gameNpc")
    if(player.getTempData("swordGamePlayer") && event.getButton() == player.getTempData("button")) {
        // If player is an active sword game player and is pressing the right button
        switch(player.getTempData("action")) {
            case("Spam"):
                // Check if the player is spamming quick enough
                if(!event.buttonDown()) return;
                if(event.getButton() == 0) var animation = API.getAnimations().get(LEFT_SPAM_ANIMATION_NAME);
                else var animation = API.getAnimations().get(RIGHT_SPAM_ANIMATION_NAME);
                setNpcPose(player, animation);
                player.timers.forceStart(SPAM_CHECK, SPAM_INTERVAL, false);
                player.setTempData("spamCount", player.getTempData("spamCount") + 1);
                
                if(player.getTempData("spamCount") >= SPAM_COUNT) {
                    player.setTempData("roundPass", true)
                    npc.timers.forceStart(PASS_ROUND, 0, false);
                } 
                break;
            case("Hold"):
                // Fail round if player stops holding the key
                if(event.buttonDown) {
                    if(event.getButton() == 0) var animation = API.getAnimations().get(LEFT_HOLD_ANIMATION_NAME);
                    else var animation = API.getAnimations().get(RIGHT_HOLD_ANIMATION_NAME);
                    setNpcPose(player, animation);
                    player.setTempData("roundPass", true);
                    npc.timers.forceStart(PASS_ROUND, HOLD_WIN_DELAY, false);
                }
                else npc.timers.forceStart(FAIL_ROUND, 0, false);
                
                break;
            case("Single"):
                if(event.buttonDown()) return;
                // Fail round if player clicks again
                if(event.getButton() == 0) var animation = API.getAnimations().get(LEFT_SINGLE_ANIMATION_NAME);
                else var animation = API.getAnimations().get(RIGHT_SINGLE_ANIMATION_NAME);
                setNpcPose(player, animation);
                if(player.hasTempData("singleClicked")) npc.timers.forceStart(FAIL_ROUND, 0, false);
                // Clicking the first time
                else{
                    player.setTempData("singleClicked", true);
                    player.setTempData("roundPass", true);
                    npc.timers.forceStart(PASS_ROUND, SINGLE_CLICK_WIN_DELAY, false);
                }
                break;
        }
    }
}

function timer(event)
{
    var player = event.getPlayer();
    var npc = player.getTempData("gameNpc");
    if(npc == null) return;
    switch(event.id) {
        case(SPAM_GRACE):
            // Remove spam grace period
            player.removeTempData("spamGrace");
            if(player.getTempData("spamCount") < 1) {
                npc.timers.forceStart(FAIL_ROUND, 0, false) 
                return;
            }
            player.timers.forceStart(SPAM_CHECK, SPAM_INTERVAL, false);
            break;
        case(SPAM_CHECK):
            // Grace period for player to start spamming
            if(player.hasTempData("spamGrace")) return;
            // Generate event on npc
            npc.timers.forceStart(FAIL_ROUND, 0, false); 
            break;
        case(HOLD_GRACE):
            // Fail player if they dont hold in time
            if(!player.getTempData("roundPass")) npc.timers.forceStart(FAIL_ROUND, 0, false); 
            break;
    }
}

/** Sets a given npc's animation to one provided
 * @param {IPlayer} player - The npc to the animation of
 * @param {IAnimation} animation - animation to set npc to
 */
function setNpcPose(player, animation)
{
    var animData = player.getAnimationData();
    animData.setEnabled(true);
    animData.setAnimation(animation);
    animData.updateClient();
}