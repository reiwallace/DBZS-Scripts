// Caulifla.js
// AUTHOR: Noxie

// Changeables
var kaleNpcName = "Kale"; // Name of accompanying kale npc
var abilityInterval = 100; // Time between abilities in ticks

var homingKiShots = 8; // Number of homing ki shots to fire
var homingKiDamage = 100; // Damage of homing ki attack
var homingSpeed = 1; // Speed homing shots well... home

var KALE;
var TARGET_ONE;
var TARGET_TWO;
var COUNT;
var TO_RESET;
var HOMING_KI_ENTITIES;

// Timers
var RESET_TIMER = 0;
var CHOOSE_ABILITY = 1;
var FIRE
var HOMING_KI_TIMER = 3;

var HOMING_KI = 0;

function init(event)
{
    var npc = event.npc;
    var search = npc.getSurroundingEntities(40,2); // Search for kale
    for(i = 0; i < search.length; i++) {
        if(search[i].getName() == kaleName) {
            KALE = search[i];
            break;
        }
    }
}

function timer(event) {
    var npc = event.npc;
    switch(event.timer) {
        case(CHOOSE_ABILITY):
            chooseAbility(npc);
            break;
        case(HOMING_KI_TIMER):
            if(count > 8) { 
                npc.timers.stop(HOMING_KI_TIMER);
            }
            for(i = 0; i < HOMING_KI_ENTITIES.length; i++) {
                if(i < homingKiShots/2 || TARGET_TWO == null) {
                    homeKi(HOMING_KI_ENTITIES[i], TARGET_ONE, homingSpeed);
                } else {
                    homeKi(HOMING_KI_ENTITIES[i], TARGET_TWO, homingSpeed);
                }
            }
            COUNT++;
            break;
    }
}

function meleeAttack(event)
{ // Set target and begin reset timer on swing
    var npc = event.npc;
    TARGET = npc.getAttackTarget();
    DBC_TARGET = TARGET.getDBCPlayer();
    npc.timers.forceStart(10, npc.getTempData("Reset Time"), false); // Reset if doesn't melee a target for set time
    if(TO_RESET.indexOf(TARGET) < 0) { // Add reset targets if not in array already
        TO_RESET.push(TARGET);
    }
    if(!npc.timers.has(CHOOSE_ABILITY)) {
        npc.timers.forceStart(CHOOSE_ABILITY, abilityInterval, true); // Start ability timer
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

/** Chooses and executes an ability from the npc's pool of abilities
* @param {ICustomNpc} npc - npc that executes the abilities 
*/
function chooseAbility(npc)
{
    playerScan(npc);
    switch(getRandomInt(0, 1)){
        case(HOMING_KI):
            HOMING_KI_ENTITIES = new Array();
            for(i = 0; i < homingKiShots; i++) {
                fireHomingKi(npc);
            }
            npc.timers.forceStart(HOMING_KI_TIMER, 5, true);
            break;
        case(2):

            break;
    }
}

/** Fires a ki attack and adds it to the ki attack array for homing
 * @param {ICustomNpc} npc - npc to fire ki from
*/
function fireHomingKi(npc)
{
    npc.executeCommand("/dbcspawnki 1 0 " + homingKiDamage + " 0 4 10 1 100 " + npc.x + " " + npc.y + " " + npc.z + "");
    var kiScan = npc.getSurroundingEntities(10);
    for(i = 0; i < kiScan.length; i++) {
        if(kiScan[i].getType() == 0 && HOMING_KI_ENTITIES.indexOf(kiScan[i]) < 0) {
            HOMING_KI_ENTITIES.push(kiScan[i])
            kiScan[i].setMotion(0, 0, 0);
        }
    }
}

/** Sets a ki attack's motion towards a target
 * @param {*} ki - Ki attack to change motion of
 * @param {*} target - Target to head towards
 */
function homeKi(ki, target, speed)
{ // Credit to InfiniteIke for the math here
    if(ki != null) {
        var direction = { // we calculate the direction of the rush
            x: target.x - ki.x,
            y: target.y - ki.y,
            z: target.z - ki.z
        }
        var length = Math.sqrt(Math.pow(direction.x, 2) + Math.pow(direction.y, 2) + Math.pow(direction.z, 2)) //we calculate the length of the direction
        var direction = [(direction.x / length), (direction.y / length), (direction.z / length)] //and then we normalize it and store it in the direction variable
        ki.setMotion(direction[0] * speed, direction[1] * speed, direction[2]) * speed;
    }
}

/** Finds the two closest players to the npc and saves them as variables
 * @param {ICustomNpc} npc - The npc to scan for players around
 */
function scanPlayers(npc)
{
    var playerScan = npc.getSurroundingEntities(40, 1);
    if(playerScan[0] != null) {
        TARGET_ONE = playerScan[0];
    }
    if(playerScan[1] != null) {
        TARGET_TWO = playerScan[1];
    }
}

/** Clear timers and delete extra ki
 * @param {ICustomNpc} npc - Npc to reset
 */
function reset(npc)
{
    for(i = 0; i < HOMING_KI_ENTITIES.length; i++){
        if(HOMING_KI_ENTITIES[i] != null) {
            HOMING_KI_ENTITIES[i].despawn();
        }
    }
    npc.timers.clear();
}