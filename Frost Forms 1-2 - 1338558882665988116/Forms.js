// Forms.js
// AUTHOR: Noxie

// Tuning knobs
var baseDam = 10; // Base melee damage
var baseRegen = 10; // Base health regen
var movementSpeed = 7; // Boss movement speed
var formMulti = 1.5; // Form damage and regen multiplier
var arenaCenter = [-258, 56, -843]; // Spot npc is tped to when transforming
var resetTime = 600; // Time after last being damage that the npc resets
var transformPercent = 0.55; // Percent health the boss transforms at 
var formName = "FrostTransformation"; // Form used to give frost his aura

// Transformation text
var transformText1 = "&b&lTransform text1"; // Line spoken at the beginning of transformation
var transformText2 = "&b&lTransform text2"; // Line spoken in the middle of transformation
var transformText3 = "&b&lTransform text3"; // Line spoken at the end of transformation

// Timers
var RESET = 10;
var TRANSFORMATION_ANIMATION = 11;
var END_TRANSFORMATION = 12;

// Global variables
var COUNT = 0;



/** Reset the npc to base form, set required temp data
 * @param {InitEvent} event - blame riken for this
 */
function init(event)
{
    var npc = event.npc;
    DBCAPI.getDBCDisplay(npc).transform(DBCAPI.getForm(formName)); // Ensure right aura is enabled
    npc.setTempData("Movement Speed", movementSpeed);
    npc.setTempData("Reset Time", resetTime)
    reset(npc); // Reset timers and form
}

/** Timers
* @param {TimerEvent} event - blame riken for this 
*/
function timer(event)
{ 
    var npc = event.npc;
    switch(event.id) {
        case(RESET):
            reset(npc);
            break;
        case(TRANSFORMATION_ANIMATION):
            if(!npc.timers.has(END_TRANSFORMATION)) { // Stop timer once transformation is complete
                npc.timers.stop(TRANSFORMATION_ANIMATION);
            }
            if(npc.getTempData("Form") != 2) {
                npc.setSize(npc.getSize() + 1); // Grow
                npc.playSound("jinryuudragonbc:DBC3.force", 100, 1);
            }
            if(COUNT == 1) { // Say second line halfway through transforming
                npc.say(transformText2);
            }
            COUNT++;
            break;
        case(END_TRANSFORMATION):
            npc.say(transformText3);
            DBCAPI.getDBCDisplay(npc).setEnabled(false); // Disable aura
            npc.setSpeed(movementSpeed); // Let boss move again
            npc.setFaction(2); // Make boss targetable
            changeForm(npc, baseDam * formMulti, baseRegen * formMulti, 6, 2); // Change model
            npc.setTempData("Transforming", false);
            lightningSpam(npc);
            break;
    }
}

/** Hp breakpoint detection for transforming
 * @param {DamagedEvent} event - blame riken for this
 */
function damaged(event)
{
    var npc = event.npc;
    npc.timers.forceStart(RESET, resetTime, false); // Reset if not hit in a set amount of time
    if(npc.getHealth() < npc.getMaxHealth() * transformPercent && npc.getTempData("Form") == 1) { // P2 transformation
        npc.say(transformText1);
        npc.setX(arenaCenter[0]);
        npc.setY(arenaCenter[1]);
        npc.setZ(arenaCenter[2]);
        npc.setSpeed(0); // Make npc stand still
        npc.setFaction(0); // Make npc untargetable
        COUNT = 0;
        DBCAPI.getDBCDisplay(npc).setEnabled(true); // Enable aura
        npc.setTempData("Transforming", true);
        npc.timers.forceStart(TRANSFORMATION_ANIMATION, 50, true); // Grow timer
        npc.timers.forceStart(END_TRANSFORMATION, 200, false); // End transformation timer
    }
}

/** Reset on dying
 * @param {DiedEvent} event - blame riken for this 
 */
function killed(event)
{
    reset(event.npc);
}

/** Reset on killing the player
 * @param {KilledEntityEvent} event - blame riken for this 
 */
function kills(event)
{
    reset(event.npc);
}

/** Revert to first form and clear timers
 * @param {ICustomNpc} npc - Npc to reset
 */
function reset(npc)
{
    changeForm(npc, baseDam, baseRegen, 5, 1);
    DBCAPI.getDBCDisplay(npc).setEnabled(false);
    npc.setTempData("Transforming", false);
    npc.setSpeed(movementSpeed);
    npc.setFaction(2);
    for(i = 2; i < 12; i++) { // Resetting timers manually to keep poison reset
        npc.timers.stop(i);
    }
}

/** Change npc's stats, model and temp data
 * @param {ICustomNpc} npc - Npc to change form of
 * @param {int} melee - Melee damage to set to
 * @param {int} regen - Regeneration to set to
 * @param {int} size - Size of the npc to set to
 * @param {int} form - Form to change to
 */
function changeForm(npc, melee, regen, size, form)
{
    npc.setMeleeStrength(melee);
    npc.setCombatRegen(regen);
    npc.setSize(size);
    npc.setTempData("Form", form);
    npc.getModelData().setEntity("JinRyuu.DragonBC.common.Npcs.EntityFrost" + form);
    npc.setTexture("jinryuudragonbc:npcs/frost" + form + ".png"); // Apply new model's skin
}

/** Lighting animation at the end of the transforming
 * @param {ICustomNpc} npc - Npc to spam lightning around
*/
function lightningSpam(npc)
{
    function getRandomInt(min, max) {  // Get a random number
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    for(i = 0; i < 10; i++) { // Spam lightning in random spots nearby
        npc.world.thunderStrike(npc.x + getRandomInt(-3, 3), npc.y, npc.z + getRandomInt(-3, 3));
    }
}