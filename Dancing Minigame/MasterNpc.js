// Change these
var poseNames = ["pose1", "pose2", "pose3", "pose4", "pose5"]; // Pose names - can add as many as needed
var silhouetteName = "Silhouette"; // Name of silhouette npcs

var numberOfWins = 5; // Number of WINS needed
var roundLength = 200; // Round length in ticks (please use a number that plays nice with seconds)
var roundBreak = 20; // Time between rounds
var failDamage = 1; // Damage for failing round

var countDownFrom = 60; // When the npc starts counting down
var overlayText = "&1&lRemaining: "; // Text to display at the top of the screen on the counter
var overlayID = 1; // ID of the counter overlay

var passText = "&a&lI am glad that this time you did not come &a&lunprepared."; // Text on player passing a round
var failText = "&c&lWhat a fool you arevent."; // Text on player failing a round
var winText = "&l&6This is the end. The bitter, bitter end."; // Text on player winning the game

var playerExitTimer = 100; // Time after leaving the active player leaving the arena for the npc to reset

var questID = 0; // Id of quest to be completed

// Global variables
var CORRECT_POSE;
var ACTIVE_PLAYER;
var WINS = 0;
var CURRENT_ROUND = 0;
var COUNTER;
var SILHOUETTES = new Array();

// Timers
var START_ROUND = 0;
var END_ROUND = 1;
var ROUND_TIMER = 2;
var FIREWORKS = 3;
var CHECK_FOR_EXITING = 10;
var PLAYER_EXITED = 11;

// Event functions
function init(event)
{
    var npc = event.npc;
    var search = npc.getSurroundingEntities(20,2); // Find nearby npcs
    SILHOUETTES = new Array();
    for(i = 0; i < search.length; i++) { // yes this game sucks (cant splice entity arrays for some reason)
        if(search[i].getName() == silhouetteName) {
            SILHOUETTES.push(search[i]);
        } 
    }
    resetAll(npc);
}

function interact(event)
{
    newGame(event.npc, event.getPlayer());
}

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(START_ROUND):
            if(ACTIVE_PLAYER != null) {
                CURRENT_ROUND++;
                COUNTER = roundLength/20 - 1;
                npc.say("&lRound " + CURRENT_ROUND);
                decidePoses(npc);
                npc.timers.forceStart(END_ROUND, roundLength - 1, false); // End round after timer
                npc.timers.forceStart(ROUND_TIMER, 19, true); // Start round countdown
            }
            break;
        case(END_ROUND):
            if(ACTIVE_PLAYER.getAnimationData().getAnimation() == CORRECT_POSE) { // Pass round if player has correct pose
                WINS++; // Increment WINS
                if(WINS == 5) { // If player has enough WINS
                    endRound(npc, false, winText);
                    endGame(npc);
                } else { // If win condition not met continue game
                    endRound(npc, true, passText);
                }
            } else { // Fail round
                endRound(npc, true, failText);
                punishPlayer(npc);
            }
            break;
        case(ROUND_TIMER):
            setCounterOverlay(ACTIVE_PLAYER, overlayText, overlayID, COUNTER);
            if(npc.timers.has(END_ROUND) && npc.timers.ticks(END_ROUND) < countDownFrom) {
                npc.say("" + COUNTER); // Chat COUNTER
            }
            COUNTER--;
            break;
        case(FIREWORKS):
            spawnFirework(npc, npc.x + getRandomInt(-5, 5), npc.y + getRandomInt(0, 7), npc.z + getRandomInt(-5, 5)); // Spawn firework at random position
            COUNTER++;
            if(COUNTER > 10) { // Stop after firing off 10 fireworks
                npc.timers.stop(FIREWORKS);
            }
            break;  
        case(CHECK_FOR_EXITING):
            var playerCheck = npc.getSurroundingEntities(10, 1);
            var playerCheckArray = new Array(); 
            for(i = 0; i < playerCheck.length; i++) { // Pushing entities to new array because of surroundingEntities quirks
                playerCheckArray.push(playerCheck[i]);
            }
            if(playerCheckArray.indexOf(ACTIVE_PLAYER) < 0 && !npc.timers.has(PLAYER_EXITED)) {
                // Check if player is not in range, don't repeat if grace period already active
                npc.timers.forceStart(PLAYER_EXITED, playerExitTimer, false);
                break;
            }
            break;
        case(PLAYER_EXITED):
            var playerCheck = npc.getSurroundingEntities(10, 1);
            var playerCheckArray = new Array(); 
            for(i = 0; i < playerCheck.length; i++) { // Pushing entities to new array because of surroundingEntities quirks
                playerCheckArray.push(playerCheck[i]);
            }
            if(playerCheckArray.indexOf(ACTIVE_PLAYER) < 0) {
                resetAll(npc);
                break;
            }
            break;       
    }
}

/** Returns a random number between two values
* @param {int} min - the minimum number to generate a value from
* @param {int} max - the minimum number to generate a value from 
*/
function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Function to randomly select a correct pose for the npc and a random silhouette
 * as well as assigning random poses to every other npc
 * @param {ICustomNpc} npc - Master npc who will decide silhouette poses
 */
function decidePoses(npc)
{
    var poses = getPoses();
    var correctNpcIndex = getRandomInt(0, SILHOUETTES.length - 1);
    CORRECT_POSE = poses[getRandomInt(0, poses.length - 1)]; 
    poses.splice(poses.indexOf(CORRECT_POSE), 1); // Remove correct pose from pool
    setNpcPose(npc, CORRECT_POSE, true);
    for(i = 0; i < SILHOUETTES.length; i++) { // Set silhouette poses
        if(i == correctNpcIndex) { // Correct npc
            setNpcPose(SILHOUETTES[i], CORRECT_POSE, true); 
        } else { // Incorrect npcs
            var randomPose = getRandomInt(0, poses.length - 1);
            setNpcPose(SILHOUETTES[i], poses[randomPose], false);
            poses.splice(randomPose, 1); // Remove used pose from the pool
        }
    }
}

/** Gets an array of poses from aa array of pose names
 * @returns {IAnimation[]} poses - An array of animations gotten from a list of animation names
 */
function getPoses()
{
    var poses = new Array();
    for(i = 0; i < poseNames.length; i++) { // Initialise animations
        poses.push(API.getAnimations().get(poseNames[i]));
    }
    return poses;
}

/** Sets a given npc's animation to one provided
 * Sets two temp datas to define whether an npc is correct or not as well as telling that npc the current player
 * @param {ICustomNpc} targetNpc - The npc to the animation of
 * @param {IAnimation} pose - The animation to be applied to the npc
 * @param {Boolean} isRightPose - Whether this is the correct pose for the round
 */
function setNpcPose(targetNpc, Pose, isRightPose)
{
    var animData = targetNpc.getAnimationData();
    animData.setEnabled(true);
    animData.setAnimation(Pose);
    animData.updateClient();
    targetNpc.setTempData("isRightPose", isRightPose);
    targetNpc.setTempData("ACTIVE_PLAYER", ACTIVE_PLAYER);
}

/** End round stopping poses, timers and giving an round outcome message
 * @param {ICustomNpc} npc - The master npc to be used to manipulate timers and say
 * @param {Boolean} doNext - Whether to start a new round or not
 * @param {String} outcomeText - The text to be said by the npc
 */
function endRound(npc, doNext, outcomeText) 
{
    npc.say(outcomeText);
    npc.timers.stop(END_ROUND);
    npc.timers.stop(ROUND_TIMER);
    resetPoses(npc);
    if(doNext) {
        npc.timers.forceStart(START_ROUND, roundBreak, false); // Short break between rounds
    }
}

/** Strikes the failing player with lightning and inflicts them with damage
 * @param {ICustomNpc} npc - The npc to execute methods with
 */
function punishPlayer(npc)
{
    npc.world.thunderStrike(ACTIVE_PLAYER.getPosition()); // Lightning strike the player
    ACTIVE_PLAYER.hurt(failDamage);
}

/** Ends the game resetting all npcs and starts fireworks
 * @param {ICustomNpc} npc - Master npc to be reset and execute commands 
 */
function endGame(npc)
{ // End the game, complete quest and reset npcs
    npc.executeCommand("/kamkeel quest finish " + ACTIVE_PLAYER.getName() + " " + questID);
    COUNTER = 0;
    resetAll(npc);
    npc.timers.forceStart(FIREWORKS, 8, true);
}

/** Sets the active player for the game resets counters and starts a new round
 * also starts a timer to check if the player leaves the range of the arena
 * @param {ICustomNpc} npc - The master npc to manipulate timers with
 * @param {IPlayer} player - The player playing the game
 */
function newGame(npc, player)
{

    ACTIVE_PLAYER = player;
    ACTIVE_PLAYER.getAnimationData().setAnimation(null); // Reset player animation
    WINS = 0;
    CURRENT_ROUND = 0;
    npc.timers.stop(FIREWORKS);
    npc.timers.forceStart(START_ROUND, roundBreak, false);
    npc.timers.forceStart(CHECK_FOR_EXITING, 20, true);
}

/** Resets the poses of the active player as well as silhouettes and the master npc
 * @param {ICustomNpc} npc - Master npc
 */
function resetPoses(npc)
{
    if(ACTIVE_PLAYER != null) { // Reset player animation
        resetNPC(ACTIVE_PLAYER);
        ACTIVE_PLAYER.getAnimationData().setAnimation(null);
        ACTIVE_PLAYER.closeOverlay(overlayID);
    }
    for(i = 0; i < SILHOUETTES.length; i++) { // Reset silhouettes
        resetNPC(SILHOUETTES[i]);
    }
    resetNPC(npc); // Reset master npc
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
    targetNpc.removeTempData("isRightPose");
}

/** Resets game by stopping timers and resetting all poses
 * @param {ICustomNpc} npc - Master npc to reset timers and pose of 
 */
function resetAll(npc)
{
    npc.timers.clear();
    resetPoses(npc);
}

/**
 * @param {IPlayer} player - The player object on whose screen the overlay will be displayed.
 * @param {string} text - The text to display on the player's screen.
 * @param {Int} value - The counter value to be displayed
 * @param {string} speakID - The ID of the text overlay.
 */
function setCounterOverlay(player, text, counterID, value)
{ // Place speech overlay on player's screen
    player.closeOverlay(counterID); 
    var speechOverlay = API.createCustomOverlay(counterID); // Create overlay with id
    if(value < 10) {
        speechOverlay.addLabel(1, text + "0" + value, 442, 20, 0, 0);
    } else {
        speechOverlay.addLabel(1, text + "" + value, 442, 20, 0, 0);
    }
    player.showCustomOverlay(speechOverlay); // Place the overlay on the player's screen
    speechOverlay.update(player); // Update the label to be visible
}


/** Spawns firework-like particle effects at a target location and plays a random firework sound
 * @param {ICustomNpc} npc - Npc to spawn fireworks from
 * @param {Int} x - X value to spawn firework explosion at
 * @param {Int} y - Y value to spawn firework explosion at
 * @param {Int} z - Z value to spawn firework explosion at
 */
function spawnFirework(npc, x, y, z)
{
    var sounds = ["minecraft:fireworks.largeBlast", "minecraft:fireworks.largeBlast_far", "minecraft:fireworks.blast_far", "minecraft:fireworks.blast"];
    npc.world.spawnParticle("fireworksSpark", x, y, z, 0, 0, 0, 0.5, 40);
    npc.world.spawnParticle("spell", x, y, z, 0, 0, 0, 1, 40);
    npc.playSound(sounds[getRandomInt(0, sounds.length - 1)], 100, 1); // Play firework sound from list
}