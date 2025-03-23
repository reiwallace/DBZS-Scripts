// Kale.js
// AUTHOR: Noxie

// Changeables
var cauliflaName = "Caulifla"; // Name of accompanying kale npc
var arenaCenter = [0, 0, 0]; // Center of arean to knock player towards
var telegraphTimer = 20; // Timer between announcing attacks and actually using them
var maxDistanceFromCenter = 10; // Tp player to center if they are too far away

var kiBlastVoiceline = "I got this!"; // Line said by kale before shooting her ki blast
var kiBlastCooldown = 200; // Cooldown of ki blast ability
var kiBlastDamage = 1; // Damage of ki blast
var kiBlastSpeed = 2; // Speed of ki blast
var kiBlastColor = 6; // Color of ki blast - 6 = green

var assistAbilityCooldown = 600; // Cooldown of assist ability
var kickSpeed = 3; // Speed player is moved to the center of the arena (make smaller for smaller arenas)

var PLAYER_POS;
var CAULIFLA;
var TARGET;

// Timers
var KI_BLAST_TELEGRAPH = 0;
var KI_BLAST = 1;
var ASSIST_ATTACK = 2;
var HOLD_PLAYER = 3;
var STOP_HOLD = 4;

function init(event)
{
    var npc = event.npc;
    var search = npc.getSurroundingEntities(40,2); // Search for kale
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
        case(ASSIST_ATTACK):
            if(arenaCenter[1] == 0) {
                npc.say("Cannot use Assist Attack - Please change arena center")
            } else if(TARGET != null) {
                CAULIFLA.say(caulifaAssistVoiceline);
                npc.say(kaleAssistVoiceline);
                movePlayer(TARGET, arenaCenter[0], arenaCenter[1], arenaCenter[2], kickSpeed);
                PLAYER_POS = [TARGET.getX(), TARGET.getY(), TARGET.getZ()];
                npc.timers.forceStart(HOLD_PLAYER, 0, true);
                npc.timers.forceStart(STOP_HOLD, holdDuration, false);
            }
            break;
        case(HOLD_PLAYER):
            if(Math.abs(Math.abs(TARGET.getX()) - Math.abs(arenaCenter[0])) > maxDistanceFromCenter || Math.abs(Math.abs(TARGET.getY()) - Math.abs(arenaCenter[1])) > maxDistanceFromCenter || Math.abs(Math.abs(TARGET.getZ()) - Math.abs(arenaCenter[2])) > maxDistanceFromCenter) {
                npc.executeCommand("/tp " + TARGET.getName() + " " + arenaCenter[0] + " " + arenaCenter[1] + " " + arenaCenter[2]);
                PLAYER_POS = [TARGET.getX(), TARGET.getY(), TARGET.getZ()];
            } else {
                movePlayer(TARGET, PLAYER_POS[0], PLAYER_POS[1], PLAYER_POS[2], 0.05);
            }
            break;
        case(STOP_HOLD):
            npc.timers.stop(HOLD_PLAYER);
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
        npc.timers.forceStart(ASSIST_ATTACK, assistAbilityCooldown, true);
    }
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