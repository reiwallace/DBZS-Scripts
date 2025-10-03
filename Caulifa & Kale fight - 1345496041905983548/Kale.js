// Kale.js
// AUTHOR: Noxie

// CHANGE THESE
var cauliflaNpcName = "Caulifla"; // Name of accompanying caulifla npc
var arenaCenter = [0, 0, 0]; // Centre of arena to knock player towards

// CONFIG
var telegraphTimer = 20; // Timer between announcing attacks and actually using them
var maxDistanceFromCenter = 10; // Tp player to center if they are too far away

// KI BLAST CONFIG
var kiBlastVoiceline = "&2&lI got this!"; // Line said by kale before shooting her ki blast
var kiBlastCooldown = 230; // Cooldown of ki blast ability
var kiBlast = DBCAPI.createKiAttack(
    1, // Type
    2, // Speed
    1, // Damage
    false, 6, 0, true, 100 // Effect, colour, density, sound, charge
);

// ASSIST ATTACK CONFIG
var caulifaAssistVoiceline = "&c&lHold them there Kale!"; // Line said by caulifla when charging her beam attack
var cauliflaFireVoiceline = "&c&lNo dodging this one!"; // Line said by caulifla when she fires her beam attack
var kaleAssistVoiceline = "&2&lI've got them Caulifla!"; // Line said by kale when holding the player
var assistAbilityCooldown = 600; // Cooldown of assist ability
var assistTelegraphTimer = 60; // How long the player has to block in ticks
var holdDuration = 70; // How long the player is held for by the assist ability (set a little longer than telegraph)
var kickSpeed = 3; // Speed player is moved to the center of the arena (make smaller for smaller arenas)
var holdDistance = 1; // Distance in blocks kale will be from the player when holding them
var firingDistance = 8; // Distace in blocks caulifla will fire the beam at the player from
var assistOverlayId = 112; // Id of the overlay telling player to block.
var assistOverlayText = "Caulifla is aiming an attack at you! Block Now!"; // Indicator the player should block during the beam attack
var assistOverlayColor = "16754215"; // Color of overlay text - decimal
var assistOverlaySize = 2; // Size of assist overlay text
var assistBeamDamage = 100000; // Damage of unblocked assist beam
var assistBeamBlockDamage = 1; // Damage of blocked assist beam
var assistBeam = DBCAPI.createKiAttack(
    3, // Type
    3, // Speed
    1, // Damage
    false, 4, 0, true, 100 // Effect, colour, density, sound, charge
);

// DONT EDIT
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

function init(event)
{
    var npc = event.npc;
    var search = npc.getSurroundingEntities(40,2); // Search for caulifla
    for(i = 0; i < search.length; i++) {
        if(search[i].getName() == cauliflaNpcName) {
            caulifla = search[i];
            break;
        }
    }
    reset(npc);
}

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(KI_BLAST_TELEGRAPH):
            // Don't fire ki blast if performing another attack
            if(npc.getTempData("Attacking") || !lib.isPlayer(npc.getAttackTarget())) return;
            npc.say(kiBlastVoiceline);
            npc.timers.forceStart(KI_BLAST, telegraphTimer, false);
            break;

        case(KI_BLAST):
            DBCAPI.fireKiAttack(npc, kiBlast)
            break;

        case(BEGIN_ASSIST):
            target = npc.getAttackTarget();
            if(arenaCenter[1] == 0) {
                npc.say("Cannot use Assist Attack - Please change arena center");
                return;
            } else if(caulifla == null || caulifla.getHealth() < 1 || !target) return;

            // Set attacking temp data and position entities
            caulifla.setTempData("Attacking", true); 
            npc.setTempData("Attacking", true);
            caulifla.setRotationType(1);
            caulifla.say(caulifaAssistVoiceline);
            npc.say(kaleAssistVoiceline);

            moveEntity(target, arenaCenter[0], arenaCenter[1], arenaCenter[2], kickSpeed); // Kick player towards center of arena
            npc.timers.forceStart(KICK_DELAY, 8, false); // Allow the player to travel breifly before being grabbed
            break;

        case(KICK_DELAY):
            npc.playSound("jinryuudragonbc:DBC4.block2", 50, 1);
            playerPos = [target.getX(), target.getY(), target.getZ()]; // Save player coordinates
            positionBosses(target, npc, caulifla); // Move bosses to hold player and fire attack
            lib.speak(target, assistOverlayText, assistOverlayColor, assistOverlaySize, 0, 0, holdDuration, assistOverlayId);
            npc.timers.forceStart(HOLD_PLAYER, 0, true);
            npc.timers.forceStart(ASSIST_FIRE, assistTelegraphTimer,false);
            npc.timers.forceStart(STOP_HOLD, holdDuration, false);
            break;

        case(HOLD_PLAYER):
            if(target.getPosition().distanceTo(arenaCenter[0], arenaCenter[1], arenaCenter[2]) > maxDistanceFromCenter) {
                // If player is more than 10 blocks away from the center of the arena in any direction tp them to the center
                npc.executeCommand("/tp " + target.getName() + " " + arenaCenter[0] + " " + arenaCenter[1] + " " + arenaCenter[2]);
                playerPos = [target.getX(), target.getY(), target.getZ()]; // Save new player coordinates
                positionBosses(target, npc, caulifla);
            } else {
                // Move player and npc's to their position
                caulifla.setRotation(lib.getAngleToEntity(caulifla, target));
                moveEntity(caulifla, cauliflaPos[0], cauliflaPos[1], cauliflaPos[2], 0.1);
                moveEntity(npc, kalePos[0], kalePos[1], kalePos[2], 0.1);
                moveEntity(target, playerPos[0], playerPos[1], playerPos[2], 0.1);
            }
            break;

        case(ASSIST_FIRE):
            caulifla.say(cauliflaFireVoiceline);
            var damage = target.getDBCPlayer().isBlocking() ? assistBeamBlockDamage : assistBeamDamage
            assistBeam.setDamage(damage);
            DBCAPI.fireKiAttack(caulifla, assistBeam);
            break;

        case(STOP_HOLD):
            npc.timers.stop(HOLD_PLAYER);
            caulifla.setRotationType(0); // Let caulifla go back to hitting her player
            target = null;
            npc.setTempData("Attacking", false); // Let bosses go back to attacking
            caulifla.setTempData("Attacking", false);
            break;
    }
}

function tick(event)
{    
    if(lib.checkReset(event.npc)) reset(npc);
}

function killed(event)
{ // Reset if killed
    reset(event.npc);
}

function meleeAttack(event)
{
    if(event.npc.getTempData("Attacking")) event.setCancelled(true);
} 

function target(event)
{ // Set target and begin reset timer on swing
    var npc = event.npc;
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
    caulifla.setRotationType(0);
}

/** Moves an entity towards a set of coordinates in 3d space
 * @param {IEntity} entity - Entity to move
 * @param {int} cx - x coordinate to move towards
 * @param {int} cy - y coordinate to move towards
 * @param {int} cz - z coordinate to move towards
 * @param {double} speed - speed to move entity at
 */
function moveEntity(entity, cx, cy, cz, speed)
{ 
    var direction = lib.get3dDirection([entity.x, entity.y, entity.z], [cx, cy, cz]);
    entity.setMotion(direction[0] * speed, direction[1] * speed, direction[2] * speed);
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
    firingNpc.setRotation(lib.getAngleToEntity(firingNpc, target));
}

/** Sets an entity's position (doesnt work on players)
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