var guiId = 11; // Id of gui used to stun player
var stunLength = 100; // Length of stun in ticks
var stunTimerColor = 16711680; // Color of stun text
var stunTimerSize = 2; // Size of stun text
var stunTimerId = 111; // Id of overlay to display stun duration

var GUI = api.createCustomGui(guiId, 1, 1, false); // Creates customGui
var COUNTER;

/** Essential timers for the stun.
 */
function timer(event)
{
    switch(event.id) {
        case(STUN_OPENER):
            stun(TARGET, GUI);
            break;
        case(STUN_TIMER_OVERLAY):
            COUNTER--;
            stunTimerOverlay(TARGET, "Stunned for: " + COUNTER + " Seconds.", )
            break;
        case(STUN_END_TIMER):
            endStun(TARGET);
    }
}

/** Starts stun timers and applies it to the target
 * @param {IPlayer} TARGET - Target to apply stun to.
 */
function startStun(TARGET)
{
    COUNTER = 5;
    stunTimerOverlay(TARGET, "Stunned for: " + COUNTER + " Seconds.", stunTimerColor, stunTimerSize, stunTimerId); // Apply timer overlay
    npc.timers.forceStart(STUN_OPENER, 0, true);
    npc.timers.forceStart(STUN_END_TIMER, stunLength, false);
    npc.timers.forceStart(STUN_TIMER_OVERLAY, 19, false);
}

/** Applys a customGui to the player if they do not have it so they cannot move
 * @param {*} TARGET - Target to apply customGui to
 * @param {*} gui - Gui to play on the player's screen (ideally a blank one)
 */
function stun(TARGET, gui)
{
    if(TARGET != null && TARGET.getCustomGui() == null) {
        TARGET.showCustomGui(gui); // Open gui on player's screen
    }
}

/** Closes open overlays and Guis on the player and stops timers
 * @param {*} TARGET - Target to end stun on
 */
function endStun(TARGET)
{
    npc.timers.stop(STUN_OPENER);
    npc.timers.stop(STUN_TIMER_OVERLAY);
    if(TARGET != null) { // Close overlay if player exists
        TARGET.closeOverlay(overlayId)
        if(TARGET.getCustomGui() != null) { // Close gui if it's open
            TARGET.closeGui();
        }
    }
}

/** Places a speech overlay on the player's screen.
 * @param {IPlayer} player - The player object on whose screen the overlay will be displayed.
 * @param {string} text - The text to display on the player's screen.
 * @param {string} color - The color of the text in hexadecimal format.
 * @param {number} size - The font size of the text.
 * @param {string} speakID - The ID of the text overlay.
 */
function stunTimerOverlay(player, text, color, size, speakID)
{ // Using noxie's speak function
    player.closeOverlay(speakID);
    var speechOverlay = API.createCustomOverlay(speakID);
    var x = player.getScreenSize().getWidth()/4 - Math.floor((text.length) * 2.5) * size;
    var y = player.getScreenSize().getHeight()/4 - Math.floor(size * 6.5);
    speechOverlay.addLabel(1, text, x, y, 0, 0, color);
    speechOverlay.getComponent(1).setScale(size);
    player.showCustomOverlay(speechOverlay);
    speechOverlay.update(player);
}