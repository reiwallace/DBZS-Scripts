// ZSwordGlobal.js
// AUTHOR: Noxie

var SPAM_INTERVAL = 7; // Max number of ticks between player spams
var SPAM_COUNT = 10; // Number of spams needed
var SINGLE_CLICK_WIN_DELAY = 20; // Delay after single pressing to end the round
var HOLD_WIN_DELAY = 40; // Delay after single pressing to end the round

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
            case("SPAM"):
                // Check if the player is spamming quick enough
                if(!event.buttonDown()) return;
                player.timers.forceStart(SPAM_CHECK, SPAM_INTERVAL, false);
                player.setTempData("spamCount", player.getTempData("spamCount") + 1);
                player.sendMessage("spamming");
                if(player.getTempData("spamCount") >= SPAM_COUNT) {
                    player.setTempData("roundPass", true)
                    npc.timers.forceStart(PASS_ROUND, 0, false);
                } 
                break;
            case("HOLD"):
                // Fail round if player stops holding the key
                if(event.buttonDown) {
                    player.setTempData("roundPass", true);
                    npc.timers.forceStart(PASS_ROUND, HOLD_WIN_DELAY, false);
                }
                else npc.timers.forceStart(FAIL_ROUND, 0, false);
                player.sendMessage("holding");
                break;
            case("SINGLE"):
                if(event.buttonDown()) return;
                // Fail round if player clicks again
                player.sendMessage("single");
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