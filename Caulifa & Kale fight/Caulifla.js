// Caulifla.js
// AUTHOR: Noxie

// CONFIG
var kaleNpcName = "Kale"; // Name of accompanying kale npc
var abilityInterval = 300; // Time between abilities in ticks
var telegraphTimer = 20; // Time of telegraph in ticks
var resetTime = 600; // Number of seconds since meleeing a player or being hit to reset

var homingKiVoiceline = "&c&lCan you keep up with this?"; // Npc says before firing homing projectiles
var homingKiItem = API.createItem("customnpcs:npcOrb", 1, 1);
var homingKiShots = 8; // Number of homing ki shots to fire
var homingKiDamage = 1; // Damage of homing ki attack
var homingSpeed = 0.7; // Speed homing shots well... home

var beamVoiceline = "&c&lTake this!!"; // Npc says before shooting the beam attack
var beamTelegraphSound = "jinryuudragonbc:DBC4.blacktp";
var beam = DBCAPI.createKiAttack(
    3, // Type
    1, // Speed
    1, // Damage
    false, 4, 0, true, 100 // Effect, colour, density, sound, charge
);

// DO NOT EDIT
var kale;
var targetOne;
var targetTwo;
var count;
var homingKiEntities;
var ability = true;

// Timers
var RESET_TIMER = 0;
var CHOOSE_ABILITY = 1;
var SHOOT_HOMING_KI = 2;
var HOMING_KI_TIMER = 3;
var HOMING_KI_TELEGRAPH = 4;
var BEAM_TELEGRAPH = 5;
var DESPAWN_HOMING_KI = 6;

// Ability no.
var HOMING_KI = false;
var BEAM = true;

function init(event)
{
    var npc = event.npc;
    var search = npc.getSurroundingEntities(40,2); // Search for kale
    reset(npc);
    for(i = 0; i < search.length; i++) {
        if(search[i].getName() == kaleNpcName) {
            kale = search[i];
            break;
        }
    }
    npc.setTempData("Attacking", false);
}

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(CHOOSE_ABILITY):
            chooseAbility(npc);
            break;

        case(HOMING_KI_TELEGRAPH):
            // Start homing timer and ki fire timer
            npc.timers.forceStart(SHOOT_HOMING_KI, 3, true);
            npc.timers.forceStart(HOMING_KI_TIMER, 1, true);
            break;

        case(SHOOT_HOMING_KI): // Fires the projectile and adds it to an array.
            if(!lib.isPlayer(npc.getAttackTarget())) return;
            if(npc.getTempData("Attacking")) {
                ability = HOMING_KI
                return;
            }

            // Fire Projectile
            npc.shootItem(npc.getAttackTarget(), homingKiItem, 100);
            npc.playSound("jinryuudragonbc:DBC2.blast", 50, 1);

            // Scan for projectile and push it to homing array
            var projectileSearch = npc.getSurroundingEntities(3);
            for(i = 0; i < projectileSearch.length; i++){
                if(projectileSearch[i].getType() == 7 && homingKiEntities.indexOf(projectileSearch[i] < 0)) {
                    homingKiEntities.push(projectileSearch[i]);
                }
            }
            
            // Stop timer after firing desired number of shots
            count++;
            if(count > homingKiShots) npc.timers.stop(SHOOT_HOMING_KI);
            break;

        case(HOMING_KI_TIMER): // Homes half of the projectiles onto one target and half onto the other.
            for(i = 0; i < homingKiEntities.length; i++) {
                var ki = homingKiEntities[i];
                if(!ki) return;
                // Home half the shots in on target one
                if(i < homingKiShots/2 || !targetTwo) var activeTar = targetOne;
                // Home half the shots in on target two
                else var activeTar = targetTwo;
                var direction = lib.get3dDirection([ki.x, ki.y, ki.z], [activeTar.x, activeTar.y, activeTar.z]);
                ki.setMotion(direction[0] * homingSpeed, direction[1] * homingSpeed, direction[2] * homingSpeed);
            }
            break;

        case(DESPAWN_HOMING_KI): // Despawns homing ki before next attack
            despawnEntities(homingKiEntities);
            break;

        case(BEAM_TELEGRAPH):
            if(npc.getTempData("Attacking")) {
                ability = BEAM ;
                return;
            }
            DBCAPI.fireKiAttack(npc, beam);
            break;
    }
}

function killed(event)
{ // Reset if killed
    reset(event.npc);
}

function target(event)
{ // Set target and begin reset timer on swing
    var npc = event.npc;
    if(!npc.timers.has(CHOOSE_ABILITY)) {
        npc.timers.forceStart(CHOOSE_ABILITY, abilityInterval, true); // Start ability timer
    }
}

function tick(event)
{
    if(lib.checkReset(event.npc)) reset(event.npc);
}

function meleeAttack(event)
{ // Begin reset timer on swing
    var npc = event.npc;
    if(!npc.timers.has(CHOOSE_ABILITY)) {
        npc.timers.forceStart(CHOOSE_ABILITY, abilityInterval, true); // Start ability timer
    }
}

/** Clear timers and delete extra ki
 * @param {ICustomNpc} npc - Npc to reset
 */
function reset(npc)
{
    despawnEntities(homingKiEntities);
    npc.timers.clear();
}

/** Chooses and executes an ability from the npc's pool of abilities
* @param {ICustomNpc} npc - npc that executes the abilities 
*/
function chooseAbility(npc)
{
    scanPlayers(npc);
    if(npc.getTempData("Attacking")) return; // Don't perform an attack if doing assist ability
    switch(ability) {
        case(HOMING_KI): // Reset ki entities array 
            despawnEntities(homingKiEntities);
            homingKiEntities = new Array();
            count = 0;
            scanPlayers(npc);
            npc.say(homingKiVoiceline);
            npc.timers.forceStart(HOMING_KI_TELEGRAPH, telegraphTimer, false);
            break;

        case(BEAM):
            npc.say(beamVoiceline);
            npc.playSound(beamTelegraphSound, 50, 1);
            npc.timers.forceStart(BEAM_TELEGRAPH, telegraphTimer, false);
            break;
    }
    ability = !ability;
}

/** Fires a projectile 
 * @param {ICustomNpc} npc - npc to fire projectile from
*/
function fireProjectile(npc, target)
{
    if(target != null) {
        
        var item = API.createItem(homingKiProjectile, homingKiProjectileVariation, homingKiSize);
        
    }
}

/** Finds the two closest players to the npc and saves them as variables
 * @param {ICustomNpc} npc - The npc to scan for players around
 */
function scanPlayers(npc)
{
    
    var checkTempTarget = (
        npc.getTempData("npctarget") != kale.getTempData("npctarget") &&
        (lib.isPlayer(npc.getTempData("npctarget")) &&
        lib.isPlayer(kale.getTempData("npctarget")))
    );
    if(checkTempTarget) {
        targetOne = npc.getTempData("npctarget");
        targetTwo = kale.getTempData("npctarget")
    } else{
    var playerScan = npc.getSurroundingEntities(npc.getAggroRange(), 1);
    if(playerScan.length > 0 && lib.isPlayer(playerScan[0])) targetOne = playerScan[0];
    if(playerScan.length > 1 && lib.isPlayer(playerScan[1] != null)) targetTwo = playerScan[1];
    }
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