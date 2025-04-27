// ZSwordNpc.js
// AUTHOR: Noxie

// Changeables
var PLAYER_POSITION = [-226.5, 57.0, -759.5]; // Position player is teleported to for the minigame
var BUTTONS = [0, 1]; // Buttons available in the game 0 = Left click, 1 = Right click
var ACTIONS = ["SPAM", "HOLD", "SINGLE"]; // Action options, SPAM = spam button, HOLD = hold button, SINGLE = press button once
var ROUND_INTERVAL = 20; // Time between rounds in ticks
var ROUND_DURATION = 100; // Max duration of rounds
var GRACE_DURATION = 30; // Duration of grace period player has before they are checked for failing in ticks
var FAIL_DRAIN = 0.1; // Ki drain from failing 0-1
var POINTS_TO_WIN = 10;
var PLAYER_ROTATION = 180; // Horizontal roation to lock player at (can use player.getRotation() to find this)
var PLAYER_PITCH = 34; // Vertical roation to lock player at (can use player.getRotation() to find this)


// Animation names (can use the same animation for multiple)
var IDLE_ANIMATION_NAME = "New";

var activePlayer;
var points = 0;

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
            // Reset if player is null
            if(activePlayer == null) {
                npc.say("Player is null");
                reset(npc);
                break;
            }
            // Check if player tries to walk away
            var escapeCheck = Boolean(
                activePlayer.getX() != PLAYER_POSITION[0] ||
                activePlayer.getY() != PLAYER_POSITION[1] ||
                activePlayer.getZ() != PLAYER_POSITION[2]
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
            if(cameraCheck) {
                activePlayer.setPitch(PLAYER_PITCH);
                activePlayer.setRotation(PLAYER_ROTATION);
            }
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
            npc.say("Button " + button);
            npc.say("Action " + ACTIONS[action]);
            // Change round options based on Button choice
            switch(action) {
                case(0): // Set up for spamming
                    activePlayer.setTempData("spamGrace", true);
                    activePlayer.setTempData("spamCount", 0);
                    activePlayer.timers.forceStart(SPAM_GRACE, GRACE_DURATION, false);
                    break;
                case(1): // Set up for holding
                    activePlayer.timers.forceStart(HOLD_GRACE, GRACE_DURATION, false);
                    break;
                case(2): // Set up for single click
                    activePlayer.timers.forceStart(HOLD_GRACE, GRACE_DURATION, false); // Using hold grace again tehe
                    break;
            }
            npc.timers.forceStart(PASS_ROUND, ROUND_DURATION, false);
            break;
        case(FAIL_ROUND):
            npc.timers.stop(PASS_ROUND);
            var animation = API.getAnimations().get(IDLE_ANIMATION_NAME);
            setNpcPose(activePlayer, animation);
            var dbcPlayer = activePlayer.getDBCPlayer();
            // Calculate new ki value after round drain
            var newKi = dbcPlayer.getKi() - dbcPlayer.getMaxKi() * FAIL_DRAIN;
            if(newKi > 0) { // If the ki isn't below lower ki and start a new round
                dbcPlayer.setKi(newKi);
                npc.timers.forceStart(DECIDE_ROUND, ROUND_INTERVAL, false);
                clearPlayerTempData(activePlayer);
            }
            else { // Player loses and sets ki to 0
                dbcPlayer.setKi(0);
                lose(npc);
            }
            break;
        case(PASS_ROUND):
            if(!activePlayer.getTempData("roundPass")) { // Fail if player times out
                npc.timers.forceStart(FAIL_ROUND, 0, false);
                return;
            }
            var animation = API.getAnimations().get(IDLE_ANIMATION_NAME);
            setNpcPose(activePlayer, animation);
            // Check if the player has won
            points++;
            if(points >= POINTS_TO_WIN) win(npc);
            else {
                npc.timers.forceStart(DECIDE_ROUND, ROUND_INTERVAL, false);
                clearPlayerTempData(activePlayer);
            }
            break;
    }
}

/** Clears temp data put on the player during the game
 * @param {IPlayer} player - Player with temp data to remove
 */ 
function clearPlayerTempData(player)
{ // I love temp data
    player.removeTempData("action");
    player.removeTempData("button");
    player.removeTempData("gameNpc");
    player.removeTempData("roundPass");
    player.removeTempData("spamGrace");
    player.removeTempData("spamCount");
    player.removeTempData("singleClicked");
    resetNPC(player);
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
    npc.timers.forceStart(ESCAPE_DETECTION, 5, true);
    activePlayer = player;
    points = 0;
    activePlayer.setTempData("swordGamePlayer", true);
    npc.timers.forceStart(DECIDE_ROUND, ROUND_INTERVAL, false);
}

/** Function executed on player winning
 * @param {ICustomNpc} npc - Game npc 
 */
function win(npc)
{
    npc.say("win");
    reset(npc);
}

/** Function executed on player losing
 * @param {ICustomNpc} npc - Game npc 
 */
function lose(npc)
{
    npc.say("lose");
    reset(npc);
}