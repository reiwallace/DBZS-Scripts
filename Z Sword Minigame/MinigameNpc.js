// MinigameNpc.js
// AUTHOR: Noxie

// Changeables
var PLAYER_POSITION = [-226.5, 57.0, -759.5]; // Position player is teleported to for the minigame
var BUTTONS = [0, 1]; // Buttons available in the game 0 = Left click, 1 = Right click
var PLAYER_TEMP_DATA = "swordGamePlayer"; // Temp data name assigned to active player for input detection

var activePlayer;

// Timers
var ESCAPE_DETECTION = 0;
var DECIDE_BUTTON = 1;

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
            // Check if the player tries to walk away
            if(activePlayer == null) {
                npc.say("Player is null");
                reset(npc);
                break;
            }
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
            if(escapeCheck) {
                npc.executeCommand("/tp " + activePlayer.getName() + " " + PLAYER_POSITION[0] + " " + PLAYER_POSITION[1] + " " + PLAYER_POSITION[2]);
            }
            break;
        case(DECIDE_BUTTON): // Decide which button for the player to press
            var button = getRandomInt(0, BUTTONS.length);
            break;
    }
}

/** Resets the game
 * @param {ICustomNpc} npc 
 */
function reset(npc)
{   
    npc.timers.clear();
    activePlayer.removeTempData(PLAYER_TEMP_DATA);
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
}