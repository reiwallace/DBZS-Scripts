// Kale.js
// AUTHOR: Noxie

// Changeables
var cauliflaName = "Caulifla"; // Name of accompanying caulifla npc
var arenaCenter = [0, 0, 0]; // Center of arean to knock player towards
var telegraphTimer = 20; // Timer between announcing attacks and actually using them
var maxDistanceFromCenter = 10; // Tp player to center if they are too far away
var originalMeleeSpeed = 20; // Melee speed to set back to after reseting
var resetTime = 600; // Number of seconds since meleeing a player or being hit to reset

// Ki blast
var kiBlastVoiceline = "&2&lI got this!"; // Line said by kale before shooting her ki blast
var kiBlastCooldown = 200; // Cooldown of ki blast ability
var kiBlastDamage = 1; // Damage of ki blast
var kiBlastSpeed = 2; // Speed of ki blast
var kiBlastColor = 6; // Color of ki blast - 6 = green

// Assist ability
var caulifaAssistVoiceline = "&c&lHold them there Kale!"; // Line said by caulifla when charging her beam attack
var cauliflaFireVoiceline = "&c&lNo dodging this one!"; // Line said by caulifla when she fires her beam attack
var kaleAssistVoiceline = "&2&lI've got them Caulifla!"; // Line said by kale when holding the player
var assistAbilityCooldown = 600; // Cooldown of assist ability
var assistTelegraphTimer = 60; // How long the player has to block in ticks
var holdDuration = 70; // How long the player is held for by the assist ability (set a little longer than telegraph)
var kickSpeed = 3; // Speed player is moved to the center of the arena (make smaller for smaller arenas)
var holdDistance = 1; // Distance in blocks kale will be from the player when holding them
var firingDistance = 8; // Distace in blocks caulifla will fire the beam at the player from
var assistOverlayId = 111; // Id of the overlay telling player to block.
var assistOverlayText = "Caulifla is aiming an attack at you! Block Now!"; // Indicator the player should block during the beam attack
var assistOverlayColor = "16754215"; // Color of overlay text - decimal
var assistOverlaySize = 2; // Size of assist overlay text
var assistBeamDamage = 100000; // Damage of unblocked assist beam
var assistBeamBlockDamage = 1; // Damage of blocked assist beam
var assistBeamSpeed = 3; // Speed of assist beam
var assistBeamColor = 4; // Color of the assist beam - 4 = red

var playerPos;
var cauliflaPos;
var kalePos;
var caulifla;
var target;

// Timers
var KI_BLAST_TELEGRAPH = 0;
var KI_BLAST = 1;
var BEGIN_ASSIST = 2;
var HOLD_PLAYER = 3;
var STOP_HOLD = 4;
var ASSIST_FIRE = 5;
var KICK_DELAY = 6;
var RESET = 7;

function init(event)
{
    var npc = event.npc;
    var search = npc.getSurroundingEntities(40,2); // Search for caulifla
    for(i = 0; i < search.length; i++) {
        if(search[i].getName() == cauliflaName) {
            caulifla = search[i];
            break;
        }
    }
    npc.setTempData("Attacking", false);
}

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(RESET):
            reset(npc);
            break;
        case(KI_BLAST_TELEGRAPH):
            if(!npc.getTempData("Attacking")) {
                npc.say(kiBlastVoiceline);
                npc.timers.forceStart(KI_BLAST, telegraphTimer, false);
            }
            break;
        case(KI_BLAST):
            kiAttack(npc, 1, kiBlastDamage, kiBlastSpeed, kiBlastColor);
            break;
        case(BEGIN_ASSIST):
            if(arenaCenter[1] == 0) {
                npc.say("Cannot use Assist Attack - Please change arena center")
            } else if(caulifla == null || caulifla.getHealth() < 1) {
                return;
            } else if(target != null) {
                caulifla.setTempData("Attacking", true); // Stop npcs from performing other attacks
                npc.setTempData("Attacking", true);
                caulifla.setMeleeSpeed(10000); // Make npcs stop meleeing during assist
                npc.setMeleeSpeed(10000);
                caulifla.setRotationType(1);
                caulifla.say(caulifaAssistVoiceline);
                npc.say(kaleAssistVoiceline);
                moveEntity(target, arenaCenter[0], arenaCenter[1], arenaCenter[2], kickSpeed); // Kick player towards center of arena
                npc.timers.forceStart(KICK_DELAY, 8, false); // Allow the player to travel breifly before being grabbed
            }
            break;
        case(KICK_DELAY):
            npc.playSound("jinryuudragonbc:DBC4.block2", 50, 1);
            playerPos = [target.getX(), target.getY(), target.getZ()]; // Save player coordinates
            positionBosses(target, npc, caulifla); // Move bosses to hold player and fire attack
            speak(target, assistOverlayText, assistOverlayColor, assistOverlaySize, assistOverlayId);
            npc.timers.forceStart(HOLD_PLAYER, 0, true);
            npc.timers.forceStart(ASSIST_FIRE, assistTelegraphTimer,false);
            npc.timers.forceStart(STOP_HOLD, holdDuration, false);
            break;
        case(HOLD_PLAYER):
            if(Math.abs(Math.abs(target.getX()) - Math.abs(arenaCenter[0])) > maxDistanceFromCenter || Math.abs(Math.abs(target.getY()) - Math.abs(arenaCenter[1])) > maxDistanceFromCenter || Math.abs(Math.abs(target.getZ()) - Math.abs(arenaCenter[2])) > maxDistanceFromCenter) {
                // If player is more than 10 blocks away from the center of the arena in any direction tp them to the center
                npc.executeCommand("/tp " + target.getName() + " " + arenaCenter[0] + " " + arenaCenter[1] + " " + arenaCenter[2]);
                playerPos = [target.getX(), target.getY(), target.getZ()]; // Save new player coordinates
                positionBosses(target, npc, caulifla);
            } else {
                // Move player and npc's to their position
                caulifla.setRotation(getAngle(caulifla, target));
                moveEntity(caulifla, cauliflaPos[0], cauliflaPos[1], cauliflaPos[2], 0.1);
                moveEntity(npc, kalePos[0], kalePos[1], kalePos[2], 0.1);
                moveEntity(target, playerPos[0], playerPos[1], playerPos[2], 0.1);
            }
            break;
        case(ASSIST_FIRE):
            caulifla.say(cauliflaFireVoiceline);
            if(target.getDBCPlayer().isBlocking()) { // If target is blocking do reduced damage
                kiAttack(caulifla, 3, assistBeamBlockDamage, assistBeamSpeed, assistBeamColor);
            } else {
                kiAttack(caulifla, 3, assistBeamDamage, assistBeamSpeed, assistBeamColor);
            } 
            break;
        case(STOP_HOLD):
            npc.timers.stop(HOLD_PLAYER);
            target.closeOverlay(assistOverlayId);
            caulifla.setRotationType(0); // Let caulifla go back to hitting her player
            caulifla.setMeleeSpeed(originalMeleeSpeed); // Set melee speed back
            npc.setMeleeSpeed(originalMeleeSpeed);
            npc.setTempData("Attacking", false); // Let bosses go back to attacking
            caulifla.setTempData("Attacking", false);
            break;
    }
}

function meleeAttack(event)
{ // Begin reset timer on swing
    event.npc.timers.forceStart(RESET, resetTime, false);
}

function damaged(event)
{ // Begin reset timer on damaged
    event.npc.timers.forceStart(RESET, resetTime, false);
}

function killed(event)
{ // Reset if killed
    reset(event.npc);
}

function kills(event)
{ // Reset if killing a player and no other players around
    var npc = event.npc;
    var playerCheck = npc.getSurroundingEntities(50, 1);
    if(playerCheck.length < 1) reset;
}

function target(event)
{ // Set target and begin reset timer on swing
    var npc = event.npc;
    target = event.getTarget();
    if(!npc.timers.has(KI_BLAST_TELEGRAPH)) { // Start timers if not active
        npc.timers.forceStart(KI_BLAST_TELEGRAPH, kiBlastCooldown, true); // Start ability timer
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
    caulifla.setTempData("Attacking", false);
    caulifla.setMeleeSpeed(originalMeleeSpeed);
    npc.setMeleeSpeed(originalMeleeSpeed);
    caulifla.setRotationType(0);
    target.closeOverlay(assistOverlayId);
}

/** Fires a dbc ki attack from the npc wth a set damage and speed
 * @param {ICustomNpc} npc - Npc shooting the ki
 * @param {int} type - type of ki to shoot
 * @param {int} damage - Damage of the ki
 * @param {int} speed - Speed of the ki
 * @param {int} color - Color of the ki
 */
function kiAttack(npc, type, damage, speed, color)
{
    npc.executeCommand("/dbcspawnki " + type + " " + speed + " " + damage + " 0 " + color + " 10 1 100 " + npc.x + " " + npc.y + " " + npc.z + "");
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
    if(firingNpc == null || holdingNpc == null || target == null) return;
    var angle = target.getRotation();
    var dx = -Math.sin(angle*Math.PI/180);
    var dz = Math.cos(angle*Math.PI/180);

    setPosition(holdingNpc, target.getX() + dx * -holdDistance, target.getY(), target.getZ() + dz * -holdDistance);
    setPosition(firingNpc, target.getX() + dx * firingDistance, target.getY(), target.getZ() + dz * firingDistance);
    kalePos = [holdingNpc.getX(), holdingNpc.getY(), holdingNpc.getZ()];
    cauliflaPos = [firingNpc.getX(), firingNpc.getY(), firingNpc.getZ()];
    firingNpc.setRotation(getAngle(firingNpc, target));
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
    var dx = entity1.getX() - entity2.getX();
    var dz = entity1.getZ() - entity2.getZ();
    var theta = Math.atan2(dx, -dz);
    theta *= 180 / Math.PI
    if (theta < 0) theta += 360;
    return theta;
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