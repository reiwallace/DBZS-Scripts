// ZSwordGlobal.js
// AUTHOR: Noxie

// CHANGE THESE
// Animation names (can use the same animation for multiple)
var LEFT_SPAM_ANIMATION_NAME = "SPAM";
var LEFT_HOLD_ANIMATION_NAME = "HOLD";
var LEFT_SINGLE_ANIMATION_NAME = "SINGLE";
var RIGHT_SPAM_ANIMATION_NAME = "SPAM";
var RIGHT_HOLD_ANIMATION_NAME = "HOLD";
var RIGHT_SINGLE_ANIMATION_NAME = "SINGLE";

// CONFIG
var SPAM_INTERVAL = 7; // Max number of ticks between player spams
var SPAM_COUNT = 10; // Number of spams needed
var SINGLE_CLICK_WIN_DELAY = 20; // Delay after single pressing to end the round
var HOLD_WIN_DELAY = 40; // Delay after single pressing to end the round

// DONT CHANGE THESE
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
    var playerAnimationHandler = player.getTempData("animationHandler");
    var npc = player.getTempData("gameNpc")
    if(!(player.getTempData("swordGamePlayer") && event.getButton() == player.getTempData("button"))) return;
    // If player is an active sword game player and is pressing the right button
    switch(player.getTempData("action")) {
        case("Spam"):
            // Check if the player is spamming quick enough
            if(event.buttonDown()) return;
            if(event.getButton() == 0) playerAnimationHandler.setAnimation(LEFT_SPAM_ANIMATION_NAME);
            else playerAnimationHandler.setAnimation(RIGHT_SPAM_ANIMATION_NAME);
            player.timers.forceStart(SPAM_CHECK, SPAM_INTERVAL, false);
            player.setTempData("spamCount", player.getTempData("spamCount") + 1);
                
            // Check if player passes spam count
            if(player.getTempData("spamCount") <= SPAM_COUNT) return;
            player.setTempData("roundPass", true)
            npc.timers.forceStart(PASS_ROUND, 0, false);
            break;

        case("Hold"):
            // Fail round if player stops holding the key
            if(event.buttonDown) {
                if(event.getButton() == 0) playerAnimationHandler.setAnimation(LEFT_HOLD_ANIMATION_NAME);
                else playerAnimationHandler.setAnimation(RIGHT_HOLD_ANIMATION_NAME);
                player.setTempData("roundPass", true);
                npc.timers.forceStart(PASS_ROUND, HOLD_WIN_DELAY, false);
            }
            else npc.timers.forceStart(FAIL_ROUND, 0, false);
            break;
    
        case("Single"):
            if(event.buttonDown()) return;
            // Fail round if player clicks again
            if(event.getButton() == 0) playerAnimationHandler.setAnimation(LEFT_SINGLE_ANIMATION_NAME);
            else playerAnimationHandler.setAnimation(RIGHT_SINGLE_ANIMATION_NAME);
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