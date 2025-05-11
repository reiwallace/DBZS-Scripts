// ZSwordNpc.js
// AUTHOR: Noxie

// CHANGE THESE
var PLAYER_POSITION = [0, 0, 0]; // Position player is teleported to for the minigame
var IDLE_ANIMATION_NAME = "New"; // Animation names (can use the same animation for multiple)
var PLAYER_ROTATION = 180; // Horizontal roation to lock player at (can use player.getRotation() to find this)
var PLAYER_PITCH = -10; // Vertical roation to lock player at (can use player.getPitch() to find this)

//CONFIG
var ROUND_INTERVAL = 20; // Time between rounds in ticks
var ROUND_DURATION = 200; // Max duration of rounds in ticks
var GRACE_DURATION = 40; // Duration of grace period player has before they are checked for failing in ticks
var FAIL_DRAIN = 0.1; // Ki drain from failing 0-1
var POINTS_TO_WIN = 10;
var WIN_TEXT = "win text"; // Text said by the npc when the player wins
var LOSE_TEXT = "lose text"; // Text said by the npc when the player loses

var SPAM_TEXT = "&cThe sword seems loose: try repeatedly hitting &c"; // Text before telling the player to spam
var SPAM_OVERLAY_TEXT = "Spam "; // Text that appears on player's screen when they need to spam
var SPAM_COLOR = 15014947; // Decimal color code used for spam overlay
var HOLD_TEXT = "&eGive it some more force: try holding "; // Text before telling the player to hold
var HOLD_OVERLAY_TEXT = "Hold "; // Text that appears on player's screen when they need to hold
var HOLD_COLOR = 16764672; // Decimal color code used for spam overlay
var SINGLE_TEXT = "&3Be gentle: it only needs one "; // Text before telling the player to left click
var SINGLE_OVERLAY_TEXT = "Tap "; // Text that appears on player's screen when they need to press once
var SINGLE_COLOR = 6002943; // Decimal color code used for spam overlay
var SUCESS_TEXT = "&2&lThat's it the sword is breaking loose"; // Text said when a player succeeds in a round
var FAIL_TEXT = "&4&oThat didn't work"; // Text said when a player fails a round
var OVERLAY_ID = 111; // Id used for the ingame overlay
var OVERLAY_SIZE = 2;

// DONT CHANGE THESE
var activePlayer;
var points = 0;
var losses = 0;
var BUTTONS = [0, 1]; // Buttons available in the game 0 = Left click, 1 = Right click
var ACTIONS = ["Spam", "Hold", "Single"]; // Action options, SPAM = spam button, HOLD = hold button, SINGLE = press button once

// Npc timers
var ESCAPE_DETECTION = 0;
var DECIDE_ROUND = 1;
var PASS_ROUND = 2;
var FAIL_ROUND = 3;

// Player timers
var SPAM_GRACE = 1;
var SPAM_CHECK = 0;
var HOLD_GRACE = 2;

function init(event)
{
    var npc = event.npc;
    npc.timers.clear();
    reset(npc);
}

// TEMPORARY WAY TO START THE GAME
function interact(event)
{
    var npc = event.npc;
    startGame(npc, event.getPlayer());
}

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(ESCAPE_DETECTION): // Timer to keep player in position
            // COORDINATE DEBUG
            if(PLAYER_POSITION[1] == 0) {
                npc.say("DEBUG: EDIT PLAYER_POSITION");
                reset(npc);
                break;
            }

            // Reset if player is null
            if(activePlayer == null) {
                npc.say("Player is null");
                reset(npc);
                break;
            }

            // Check if player tries to walk away
            var escapeCheck = Boolean(
                Math.abs(Math.abs(activePlayer.getX()) - Math.abs(PLAYER_POSITION[0])) > 0.5 ||
                Math.abs(Math.abs(activePlayer.getY()) - Math.abs(PLAYER_POSITION[1])) > 0.5 ||
                Math.abs(Math.abs(activePlayer.getZ()) - Math.abs(PLAYER_POSITION[2])) > 0.5
            );

            // Check if the player has teleported away
            var tpCheck = Boolean(
                Math.abs(Math.abs(activePlayer.getX()) - Math.abs(PLAYER_POSITION[0])) > 30 ||
                Math.abs(Math.abs(activePlayer.getY()) - Math.abs(PLAYER_POSITION[1])) > 30 ||
                Math.abs(Math.abs(activePlayer.getZ()) - Math.abs(PLAYER_POSITION[2])) > 30
            );

            // Reset game
            if(tpCheck) {
                reset(npc);
                break;
            }
            // Teleport player back to position
            if(escapeCheck) npc.executeCommand("/tp " + activePlayer.getName() + " " + PLAYER_POSITION[0] + " " + PLAYER_POSITION[1] + " " + PLAYER_POSITION[2]);

            // Camera detection
            var cameraCheck = Boolean(
                Math.abs(Math.abs(activePlayer.getPitch()) - Math.abs(PLAYER_PITCH)) > 0 ||
                Math.abs(Math.abs(activePlayer.getRotation()) - Math.abs(PLAYER_ROTATION)) > 0
            );

            // Move player camera back
            if(!cameraCheck) return;
            activePlayer.setPitch(PLAYER_PITCH);
            activePlayer.setRotation(PLAYER_ROTATION);
            break;

        case(DECIDE_ROUND):
            // End game if player is null
            if(activePlayer == null) reset(npc);
            clearPlayerTempData(activePlayer);

            // Decide which button and action for the player to press
            var button = getRandomInt(0, BUTTONS.length - 1);
            var action = getRandomInt(0, ACTIONS.length - 1);

            // Configure player data
            activePlayer.setTempData("action", ACTIONS[action]);
            activePlayer.setTempData("button", button);
            activePlayer.setTempData("gameNpc", npc);
            activePlayer.setTempData("roundPass", false);
            var mouseKey = button ? "Right" : "Left";           // CHANGE HERE FOR ROUND TEXT

            // Change round options based on Button choice
            switch(action) {
                case(0): // Set up for spamming
                    npc.say(SPAM_TEXT + mouseKey + " click.");  
                    speak(activePlayer, SPAM_OVERLAY_TEXT + mouseKey + " click", SPAM_COLOR, OVERLAY_SIZE, OVERLAY_ID);
                    activePlayer.setTempData("spamGrace", true);
                    activePlayer.setTempData("spamCount", 0);
                    activePlayer.timers.forceStart(SPAM_GRACE, GRACE_DURATION, false);
                    break;

                case(1): // Set up for holding
                    npc.say(HOLD_TEXT + mouseKey + " click.");  
                    speak(activePlayer, HOLD_OVERLAY_TEXT + mouseKey + " click", HOLD_COLOR, OVERLAY_SIZE, OVERLAY_ID);
                    activePlayer.timers.forceStart(HOLD_GRACE, GRACE_DURATION, false);
                    break;

                case(2): // Set up for single click
                    npc.say(SINGLE_TEXT + mouseKey + " click.");  
                    speak(activePlayer, SINGLE_OVERLAY_TEXT + mouseKey + " click", SINGLE_COLOR, OVERLAY_SIZE, OVERLAY_ID);
                    activePlayer.timers.forceStart(HOLD_GRACE, GRACE_DURATION, false); // Using hold grace again tehe
                    break;
            }
            npc.timers.forceStart(PASS_ROUND, ROUND_DURATION, false);
            break;

        case(FAIL_ROUND):
            if(activePlayer == null) reset();
            npc.timers.stop(PASS_ROUND);
            npc.say(FAIL_TEXT);
            losses++;

            // Calculate new ki value after round drain
            var dbcPlayer = activePlayer.getDBCPlayer();
            var newKi = dbcPlayer.getMaxKi() * (1 - FAIL_DRAIN * losses);
            if(newKi > 0) { // If the ki isn't below lower ki and start a new round
                dbcPlayer.setKi(newKi);
                npc.timers.forceStart(DECIDE_ROUND, ROUND_INTERVAL, false);
                clearPlayerTempData(activePlayer);
            } else { // Player loses and sets ki to 0
                dbcPlayer.setKi(0);
                lose(npc);
                break;
            }

            // Reset animation
            var animation = API.getAnimations().get(IDLE_ANIMATION_NAME);
            setNpcPose(activePlayer, animation);
            break;

        case(PASS_ROUND):
            if(!activePlayer.getTempData("roundPass")) { // Fail if player times out
                npc.timers.forceStart(FAIL_ROUND, 0, false);
                return;
            }
            npc.say(SUCESS_TEXT);
            points++;

            // Check if the player has won
            if(points >= POINTS_TO_WIN) win(npc);
            else {
                npc.timers.forceStart(DECIDE_ROUND, ROUND_INTERVAL, false);
                clearPlayerTempData(activePlayer);
            }

            // Reset Animation
            var animation = API.getAnimations().get(IDLE_ANIMATION_NAME);
            setNpcPose(activePlayer, animation);
            break;
    }
}

/** Clears temp data put on the player during the game
 * @param {IPlayer} player - Player with temp data to remove
 */ 
function clearPlayerTempData(player)
{ // I love temp data
    if(player == null) return;
    player.removeTempData("action");
    player.removeTempData("button");
    player.removeTempData("gameNpc");
    player.removeTempData("roundPass");
    player.removeTempData("spamGrace");
    player.removeTempData("spamCount");
    player.removeTempData("singleClicked");
    cancelSpeak(player, OVERLAY_ID);
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

/** Reset target npc's animations
 * @param {ICustomNpc or IPlayer} targetNpc - Player or Npc to reset animation and temp data of 
 */
function resetNPC(targetNpc)
{
    var animData = targetNpc.getAnimationData();
    animData.setEnabled(false);
    animData.setAnimation(null);
    animData.updateClient();
}

/** Resets the game
 * @param {ICustomNpc} npc 
 */
function reset(npc)
{   
    npc.timers.clear();
    if(activePlayer == null) return;
    activePlayer.removeTempData("swordGamePlayer"); // Seperate because I'm a goof
    clearPlayerTempData(activePlayer);
    resetNPC(activePlayer);
    activePlayer = null;
}

/** Returns a random number between two values
* @param {int} min - the minimum number to generate a value from
* @param {int} max - the minimum number to generate a value from 
*/
function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Starts the minigame 
 * @param {ICustomNpc} npc - Npc running the game
 * @param {IPlayer} player - Player who will be playing the game
 */
function startGame(npc, player)
{
    if(activePlayer != null) return;
    npc.timers.forceStart(ESCAPE_DETECTION, 5, true);
    activePlayer = player;
    points = 0;
    losses = 0;
    activePlayer.setTempData("swordGamePlayer", true);
    npc.timers.forceStart(DECIDE_ROUND, ROUND_INTERVAL, false);
    var animation = API.getAnimations().get(IDLE_ANIMATION_NAME);
    setNpcPose(activePlayer, animation);
}

/** Function executed on player winning
 * @param {ICustomNpc} npc - Game npc 
 */
function win(npc)
{
    npc.say(WIN_TEXT);
    reset(npc);
}

/** Function executed on player losing
 * @param {ICustomNpc} npc - Game npc 
 */
function lose(npc)
{
    npc.say(LOSE_TEXT);
    reset(npc);
}

/**
 * Places a speech overlay on the player's screen.
 *
 * @param {IPlayer} player - The player object on whose screen the overlay will be displayed.
 * @param {string} text - The text to display on the player's screen.
 * @param {string} color - The color of the text in hexadecimal format.
 * @param {number} size - The font size of the text.
 * @param {string} speakID - The ID of the text overlay.
 */
function speak(player, text, color, size, speakID) 
{ 
    var speechOverlay = API.createCustomOverlay(speakID); // Create overlay with id
    var x = 480 - Math.floor((text.length) * 2.5) * size; // Calculate centre position
    var y = (246 - Math.floor(size * 6.5)) * 1.4;
    speechOverlay.addLabel(1, text, x, y, 0, 0, color); // Add label in the middle of the screen with the given color
    speechOverlay.getComponent(1).setScale(size); // Resize the label
    player.showCustomOverlay(speechOverlay); // Place the overlay on the player's screen
    speechOverlay.update(player); // Update the label to be visible
}

/**
 * Removes the speech overlay from the player's screen.
 *
 * @param {IPlayer} player - The player object from whose screen the overlay will be removed.
 * @param {string} speakID - The ID of the text overlay to remove.
 */
function cancelSpeak(player, speakID) 
{ 
    player.closeOverlay(speakID); 
}