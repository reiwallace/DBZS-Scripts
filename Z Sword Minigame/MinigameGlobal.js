// MinigameGlobal.js
// AUTHOR: Noxie

var SPAM_INTERVAL = 7; // Max number of ticks between player spams

// Player timers
var SPAM_CHECK = 0;
var SPAM_GRACE = 1;
var HOLD_GRACE = 2;

// Npc timers
var FAIL_ROUND = 3;

function mouseClicked(event)
{
    var player = event.player;
    if(player.getTempData("swordGamePlayer") && event.getButton() == player.getTempData("button")) {
        // If player is an active sword game player and is pressing the right button
        switch(player.getTempData("actions")) {
            case("SPAM"):
                // Check if the player is spamming quick enough
                if(!event.buttonDown()) return;
                player.timers.forceStart(SPAM_CHECK, SPAM_INTERVAL, false);
                break;
            case("HOLD"):
                // Fail round if player stops holding the key
                if(event.buttonDown) player.setTempData("roundPass", true);
                else npc.timers.forceStart(FAIL_ROUND, 0, false);
                break;
            case("SINGLE"):
                // Fail round if player clicks again
                if(player.getTempData("singleClicked")) npc.timers.forceStart(FAIL_ROUND, 0, false);
                // Clicking the first time
                else{
                    player.setTempData("singleClicked", true);
                    player.setTempData("roundPass", true);
                }
                break;
        }
    }
}

function timer(event)
{
    var player = event.getPlayer();
    var npc = player.getTempData("gameNpc");
    switch(event.id) {
        case(SPAM_GRACE):
            // Remove spam grace period
            player.removeTempData("spamGrace");
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