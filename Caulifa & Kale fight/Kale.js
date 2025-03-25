// Kale.js
// AUTHOR: Noxie

// Changeables
var cauliflaName = "Caulifla"; // Name of accompanying kale npc
var arenaCenter = [0, 0, 0]; // Center of arean to knock player towards
var telegraphTimer = 20; // Timer between announcing attacks and actually using them
var maxDistanceFromCenter = 10; // Tp player to center if they are too far away

// Ki blast
var kiBlastVoiceline = "I got this!"; // Line said by kale before shooting her ki blast
var kiBlastCooldown = 200; // Cooldown of ki blast ability
var kiBlastDamage = 1; // Damage of ki blast
var kiBlastSpeed = 2; // Speed of ki blast
var kiBlastColor = 6; // Color of ki blast - 6 = green

// Assist ability
var caulifaAssistVoiceline = "Hold them there Kale!"; // Line said by caulifla when charging her beam attack
var cauliflaFireVoiceline = "No dodging this one!"; // Line said by caulifla when she fires her beam attack
var kaleAssistVoiceline = "I've got them Caulifla!"; // Line said by kale when holding the player
var assistAbilityCooldown = 600; // Cooldown of assist ability
var assistTelegraphTimer = 20; // How long the player has to block in ticks
var holdDuration = 30; // How long the player is held for by the assist ability (set a little longer than telegraph)
var kickSpeed = 3; // Speed player is moved to the center of the arena (make smaller for smaller arenas)
var holdDistance = 1; // Distance in blocks kale will be from the player when holding them
var firingDistance = 8; // Distace in blocks caulifla will fire the beam at the player from
var assistOverlayId = 111; // Id of the overlay telling player to block.
var assistOverlayText = "Caulifla is aiming an attack at you! Block Now!"; // Indicator the player should block during the beam attack

var PLAYER_POS;
var CAULIFLA;
var TARGET;

// Timers
var KI_BLAST_TELEGRAPH = 0;
var KI_BLAST = 1;
var BEGIN_ASSIST = 2;
var HOLD_PLAYER = 3;
var STOP_HOLD = 4;
var ASSIST_FIRE = 5;

function init(event)
{
    var npc = event.npc;
    var search = npc.getSurroundingEntities(40,2); // Search for caulifla
    for(i = 0; i < search.length; i++) {
        if(search[i].getName() == cauliflaName) {
            CAULIFLA = search[i];
            break;
        }
    }
}

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(KI_BLAST_TELEGRAPH):
            if(!npc.getTempData("Attacking")) {
                npc.say(kiBlastVoiceline);
                npc.timers.forceStart(KI_BLAST, telegraphTimer, false);
            }
            break;
        case(KI_BLAST):
            kiAttack(npc, kiBlastDamage, kiBlastSpeed, kiBlastColor);
            break;
        case(BEGIN_ASSIST):
            if(arenaCenter[1] == 0) {
                npc.say("Cannot use Assist Attack - Please change arena center")
            } else if(TARGET != null) {
                CAULIFLA.setTempData("Attacking", true);
                npc.setTempData("Attacking", true);
                CAULIFLA.say(caulifaAssistVoiceline);
                npc.say(kaleAssistVoiceline);
                movePlayer(TARGET, arenaCenter[0], arenaCenter[1], arenaCenter[2], kickSpeed); // Kick player towards center of arena
                npc.timers.forceStart(KICKDELAY, 5, false);
            }
            break;
        case(KICK_DELAY):
            PLAYER_POS = [TARGET.getX(), TARGET.getY(), TARGET.getZ()]; // Save player coordinates
            positionBosses(TARGET, npc, CAULIFLA); // Move bosses to hold player and fire attack
            speak(TARGET, overlayText, overlayColor, overlaySize, overlayID);
            npc.timers.forceStart(HOLD_PLAYER, 0, true);
            npc.timers.forceStart()
            npc.timers.forceStart(STOP_HOLD, holdDuration, false);
            break;
        case(HOLD_PLAYER):
            if(Math.abs(Math.abs(TARGET.getX()) - Math.abs(arenaCenter[0])) > maxDistanceFromCenter || Math.abs(Math.abs(TARGET.getY()) - Math.abs(arenaCenter[1])) > maxDistanceFromCenter || Math.abs(Math.abs(TARGET.getZ()) - Math.abs(arenaCenter[2])) > maxDistanceFromCenter) {
                // If player is more than 10 blocks away from the center of the arena in any direction tp them to the center
                npc.executeCommand("/tp " + TARGET.getName() + " " + arenaCenter[0] + " " + arenaCenter[1] + " " + arenaCenter[2]);
                PLAYER_POS = [TARGET.getX(), TARGET.getY(), TARGET.getZ()]; // Save new player coordinates
                positionBosses(TARGET, npc, CAULIFLA);
            } else {
                moveEntity(TARGET, PLAYER_POS[0], PLAYER_POS[1], PLAYER_POS[2], 0.05);
            }
            break;
        case(ASSIST_FIRE):

            break;
        case(STOP_HOLD):
            npc.timers.stop(HOLD_PLAYER);
            TARGET.closeOverlay(overlayID);
            npc.setTempData("Attacking", false);
            CAULIFLA.setTempData("Attacking", false);
            break
    }
}

function meleeAttack(event)
{ // Set target and begin reset timer on swing
    var npc = event.npc;
    TARGET = npc.getAttackTarget();
    DBC_TARGET = TARGET.getDBCPlayer();
    npc.timers.forceStart(10, npc.getTempData("Reset Time"), false); // Reset if doesn't melee a target for set time
    if(!npc.timers.has(KI_BLAST_TELEGRAPH)) { // Start timers if not active
        npc.timers.forceStart(KI_BLAST_TELEGRAPH, abilityInterval, true); // Start ability timer
        npc.timers.forceStart(BEGIN_ASSIST, assistAbilityCooldown, true);
    }
}

/** Resets npc's timers and temp data
 * @param {ICustomNpc} npc - Npc to reset
 */
function reset(npc)
{
    npc.timers.clear();
    npc.setTempData("Attacking", false);
    CAULIFLA.setTempData("Attacking", false);
    CAULIFLA.setRotationType(0);
    TARGET.closeOverlay(overlayID);
}

/** Fires a dbc ki attack from the npc wth a set damage and speed
 * @param {ICustomNpc} npc - Npc shooting the ki
 * @param {int} damage - Damage of the ki
 * @param {int} speed - Speed of the ki
 * @param {int} color - Color of the ki
 */
function kiAttack(npc, damage, speed, color)
{
    npc.executeCommand("/dbcspawnki 1 " + speed + " " + damage + " 0 " + color + " 10 1 100 " + npc.x + " " + npc.y + " " + npc.z + "");
}

/** Moves an entity towards a set of coordinates in 3d space
 * @param {IEntity} entity - Entity to move
 * @param {int} cx - x coordinate to move towards
 * @param {int} cy - y coordinate to move towards
 * @param {int} cz - z coordinate to move towards
 * @param {double} speed - speed to move entity at
 */
function moveEntity(entity, cx, cy, cz, speed)
{ // Credit to InfiniteIke for the math here
    if(entity != null) {
        var direction = { // we calculate the direction of the rush
            x: cx - entity.x,
            y: cy - entity.y,
            z: cz - entity.z
        }
        var length = Math.sqrt(Math.pow(direction.x, 2) + Math.pow(direction.y, 2) + Math.pow(direction.z, 2)) //we calculate the length of the direction
        var direction = [(direction.x / length), (direction.y / length), (direction.z / length)] //and then we normalize it and store it in the direction variable
        entity.setMotion(direction[0] * speed, direction[1] * speed, direction[2] * speed);
    }
}
/** Sets position of kale and caulifla for kale's assist ability based on the target's position
 * @param {IEntity} target - Target to base positioning on
 * @param {ICustomNpc} holdingNpc - Npc(Kale) holding the player
 * @param {ICustomNpc} firingNpc - Npc(caulifla) firing the attack
 */
function positionBosses(target, holdingNpc, firingNpc)
{
    var angle = target.getRotation();
    var dx = -Math.sin(angle*Math.PI/180);
    var dz = Math.cos(angle*Math.PI/180);

    firingNpc.setRotationType(1);
    CAULIFLA.setRotation();
    setPosition(holdingNpc, target.getX() + dx * -holdDistance, target.getY(), target.getZ() + dz * -holdDistance);
    setPosition(firingNpc, target.getX() + dx * firingDistance, target.getY(), target.getZ() + dz * firingDistance);
}

/** Sets an entitie's position (doesnt work on players)
 * @param {IEntity} entity 
 * @param {double} x - X position 
 * @param {double} y - Y position
 * @param {double} z - Z position
 */
function setPosition(entity, x, y, z)
{
    entity.setX(x);
    entity.setY(y);
    entity.setZ(z);
}

/** Gets the angle from one entity to another
 * @param {IEntity} entity1 - Initial entity to get angle from 
 * @param {IEntity} entity2 - Second entity to get angle to
 */
function getAngle(entity1, entity2) 
{

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
    var y = 246 - Math.floor(size * 6.5);
    speechOverlay.addLabel(1, text, x, y, 0, 0, color); // Add label in the middle of the screen with the given color
    speechOverlay.getComponent(1).setScale(size); // Resize the label
    player.showCustomOverlay(speechOverlay); // Place the overlay on the player's screen
    speechOverlay.update(player); // Update the label to be visible
}