// Caulifla.js
// AUTHOR: Noxie

// Changeables
var kaleNpcName = "Kale"; // Name of accompanying kale npc
var abilityInterval = 300; // Time between abilities in ticks
var telegraphTimer = 20; // Time of telegraph in ticks
var arenaSize = 40; // Rough size of arena for player scanning
var resetTime = 600; // Number of seconds since meleeing a player or being hit to reset

var homingKiVoiceline = "Can you keep up with this?"; // Npc says before firing homing projectiles
var homingKiShots = 8; // Number of homing ki shots to fire
var homingKiDamage = 1; // Damage of homing ki attack
var homingKiSize = 1; // Size of hominh ki attack
var homingSpeed = 1; // Speed homing shots well... home
var homingKiProjectile = "customnpcs:npcOrb"; // Item id of projectile to use
var homingKiProjectileVariation = 1; // second id

var beamVoiceline = "Take this!!"; // Npc says before shooting the beam attack
var beamDamage = 1; // Damage of beam attack
var beamSpeed = 1; // Speed of beam attack
var beamColor = 4; // Color of the beam attack - 4 = red

var KALE;
var TARGET_ONE;
var TARGET_TWO;
var COUNT;
var TO_RESET;
var HOMING_KI_ENTITIES;
var ABILITY = true;

// Timers
var RESET_TIMER = 0;
var CHOOSE_ABILITY = 1;
var SHOOT_HOMING_KI = 2;
var HOMING_KI_TIMER = 3;
var HOMING_KI_TELEGRAPH = 4;
var BEAM_TELEGRAPH = 5;
var DESPAWN_HOMING_KI = 6;
var RESET = 7;

// Ability no.
var HOMING_KI = false;
var BEAM = true;

function init(event)
{
    var npc = event.npc;
    var search = npc.getSurroundingEntities(40,2); // Search for kale
    npc.timers.clear();
    for(i = 0; i < search.length; i++) {
        if(search[i].getName() == kaleNpcName) {
            KALE = search[i];
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
        case(CHOOSE_ABILITY):
            chooseAbility(npc);
            break;
        case(HOMING_KI_TELEGRAPH):
            npc.timers.forceStart(SHOOT_HOMING_KI, 3, true);
            npc.timers.forceStart(HOMING_KI_TIMER, 5, true);
            break;
        case(SHOOT_HOMING_KI): // Fires the projectile and adds it to an array.
            if(npc.getTempData("Attacking")) {
                ABILITY = HOMING_KI
                return;
            }
            fireProjectile(npc, TARGET_ONE);
            var projectileSearch = npc.getSurroundingEntities(20);
            for(i = 0; i < projectileSearch.length; i++){
                if(projectileSearch[i].getType() == 7 && HOMING_KI_ENTITIES.indexOf(projectileSearch[i] < 0)) {
                    HOMING_KI_ENTITIES.push(projectileSearch[i]);
                }
            }
            COUNT++;
            if(COUNT > homingKiShots) { // Stop timer after firing desired number of shotss
                npc.timers.stop(SHOOT_HOMING_KI);
            }
            break;
        case(HOMING_KI_TIMER): // Homes half of the projectiles onto one target and half onto the other.
            for(i = 0; i < HOMING_KI_ENTITIES.length; i++) {
                if(i < homingKiShots/2 || TARGET_TWO == null) { // Home half the shots in on target one
                    homeKi(HOMING_KI_ENTITIES[i], TARGET_ONE, homingSpeed);
                } else { // Home half the shots in on target two
                    homeKi(HOMING_KI_ENTITIES[i], TARGET_TWO, homingSpeed);
                }
            }
            break;
        case(DESPAWN_HOMING_KI): // Despawns homing ki before next attack
            despawnEntities(HOMING_KI_ENTITIES);
            break;
        case(BEAM_TELEGRAPH):
            if(npc.getTempData("Attacking")) {
                ABILITY = BEAM ;
                return;
            }
            kiAttack(npc, beamDamage, beamSpeed, beamColor);
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
    TARGET = event.getTarget();
    if(!npc.timers.has(CHOOSE_ABILITY)) {
        npc.timers.forceStart(CHOOSE_ABILITY, abilityInterval, true); // Start ability timer
    }
}

/** Clear timers and delete extra ki
 * @param {ICustomNpc} npc - Npc to reset
 */
function reset(npc)
{
    despawnEntities(HOMING_KI_ENTITIES);
    npc.timers.clear();
}

/** Returns a random number between two values
* @param {int} min - the minimum number to generate a value from
* @param {int} max - the minimum number to generate a value from 
*/
function getRandomInt(min, max)
{  
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Chooses and executes an ability from the npc's pool of abilities
* @param {ICustomNpc} npc - npc that executes the abilities 
*/
function chooseAbility(npc)
{
    scanPlayers(npc);
    if(npc.getTempData("Attacking")) return; // Don't perform an attack if doing assist ability
    switch(ABILITY) {
        case(HOMING_KI): // Reset ki entities array 
            despawnEntities(HOMING_KI_ENTITIES);
            HOMING_KI_ENTITIES = new Array();
            COUNT = 0;
            scanPlayers(npc);
            npc.say(homingKiVoiceline);
            npc.timers.forceStart(HOMING_KI_TELEGRAPH, telegraphTimer, false);
            break;
        case(BEAM):
            npc.say(beamVoiceline);
            npc.timers.forceStart(BEAM_TELEGRAPH, telegraphTimer, false);
            break;
    }
    ABILITY = !ABILITY;
}

/** Fires a projectile 
 * @param {ICustomNpc} npc - npc to fire projectile from
*/
function fireProjectile(npc, target)
{
    if(target != null) {
        npc.playSound("jinryuudragonbc:DBC2.blast", 50, 1);
        var item = API.createItem(homingKiProjectile, homingKiProjectileVariation, homingKiSize);
        npc.shootItem(target, item, 100);
    }
}

/** Sets a ki attack's motion towards a target
 * @param {IProjectile} ki - Ki attack to change motion of
 * @param {IEntity} target - Target to head towards
 * 
 */
function homeKi(ki, target, speed)
{ // Credit to InfiniteIke for the math here
    if(ki != null) {
        var direction = { // we calculate the direction of the rush
            x: target.x - ki.x,
            y: target.y + 1 - ki.y,
            z: target.z - ki.z
        }
        var length = Math.sqrt(Math.pow(direction.x, 2) + Math.pow(direction.y, 2) + Math.pow(direction.z, 2)) //we calculate the length of the direction
        var direction = [(direction.x / length), (direction.y / length), (direction.z / length)] //and then we normalize it and store it in the direction variable
        ki.setMotion(direction[0] * speed, direction[1] * speed, direction[2] * speed);
    }
}

/** Finds the two closest players to the npc and saves them as variables
 * @param {ICustomNpc} npc - The npc to scan for players around
 */
function scanPlayers(npc)
{
    var playerScan = npc.getSurroundingEntities(arenaSize, 1);
    if(playerScan.length > 0 && playerScan[0] != null) {
        TARGET_ONE = playerScan[0];
    }
    if(playerScan.length > 1 && playerScan[1] != null) {
        TARGET_TWO = playerScan[1];
    }
}

/** Fires a dbc ki attack from the npc wth a set damage and speed
 * @param {ICustomNpc} npc - Npc shooting the ki
 * @param {int} damage - Damage of the ki
 * @param {int} speed - Speed of the ki
 * @param {int} color - Color of the ki
 */
function kiAttack(npc, damage, speed, color, size)
{
    npc.executeCommand("/dbcspawnki 3 " + speed + " " + damage + " 0 " + color + " 10 1 100 " + npc.x + " " + npc.y + " " + npc.z + "");
}

/** Despawns all entities in an array if valid
 * @param {IEntity[]} entityArray 
 */
function despawnEntities(entityArray)
{
    if(entityArray == null) return;
    for(i = 0; i < entityArray.length; i++) {
        if(entityArray[i] != null) entityArray[i].despawn();
    }
}