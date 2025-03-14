// Changeables
var kaleNpcName = "Kale"; // Name of accompanying kale npc
var abilityInterval = 100; // Time between abilities in ticks

var homingKiShots = 8; // Number of homing ki shots to fire
var homingKiDamage = 100; // Damage of homing ki attack

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
                    homeKi(HOMING_KI_ENTITIES[i], TARGET_ONE);
                } else {
                    homeKi(HOMING_KI_ENTITIES[i], TARGET_TWO);
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
function homeKi(ki, target)
{
    if(ki != null) {
        /*  Directional math
         * 
         */
        ki.setMotion(x, y, z);
    }
}

/** Clear timers and delete extra ki
 * @param {ICustomNpc} npc - Npc to reset
 */
function reset(npc) {
    for(i = 0; i < HOMING_KI_ENTITIES.length; i++){
        if(HOMING_KI_ENTITIES[i] != null) {
            HOMING_KI_ENTITIES[i].despawn();
        }
    }
    npc.timers.clear();
}