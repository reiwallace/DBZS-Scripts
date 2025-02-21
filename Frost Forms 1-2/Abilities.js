// Abilities.js
// AUTHOR: Noxie

// Tuning Knobs
var gcLocations = [[-258, 55, -843], [-258, 55, -830], [-258, 55, -856], [-248, 55, -843], [-270, 55, -843]]; // Locations of gravity chambers
var arenaSize = 50; // Size of arena - used for damaging poisoned players
var abilityInterval = 200; // Time in ticks between ability usage

var nonLethalStaminaMax = 0.25; // Non-lethal max stamina
var nonLethalDuration = 100; // Duration of Non-lethal poison ticks
var nonLethalGravity = 1000; // Gravity to be put on the player

var overlayID = 0; // ID for poison stacks overlay
var overlayText = "Lethal Poison: "; // Text displayed on screen to show poison stacks - has the number of stacks added right after
var lethalDam = 0.02; // Percentage of health done per stack of poison per tick
var poisonTickSpeed = 40; // Speed poison ticks in well ticks
var meditationStackRed = 5; // Number ticks between reducing stacks

var meleeSpecialTelegraphTimer = 30; // Telegraph timer for melee special attack
var meleeSpecialRange = 5; // Range for p2 melee special attack
var meleeSpecialStacks = 15; // Number of stacks applied by p2 melee special attack

var kiLazerTelegraphTimer = 20; // Telegraph for single lazer
var kiBarrageTelegraphTimer = 30; // Telegraph for ki barrage
var lazerDamage = 10; // Damage of ki attack
var lazerSpeed = 1; // Travel speed of lazer
var maxLazers = 15; // Amount of shots per ki vomit

// Attack lines
var nonLethalLine = "&2&lNon-lethal Poison"; // Attack line for non-lethal poison
var kiLazerLine = "&9&lKi lazer"; // Attack line for ki lazer
var meleeSpecialLine = "&6&lMelee Special"; // Attack line for special melee attack
var kiBarrageLine = "&1&lKi lazer barrage"; // Attack line for ki lazer barrage

// Voice lines
var nonLethalSound = "jinryuudragonbc:DBC4.block2"; // Sound for non-lethal poison
var meleeSpecialSound = "jinryuudragonbc:DBC4.disckill"; // Sound for special melee attack

// Timers
var POISON_TICK = 0;
var MEDITATION_DETECTION = 1;
var CHOOSE_ABILITY = 2;
var NON_LETHAL_POISON = 3;
var KI_ATTACK = 4;
var MELEE_SPECIAL_TELEGRAPH = 5;
var MELEE_SPECIAL_ATTACK = 6;
var KI_BARRAGE_TELEGRAPH = 7;

// Ability choice
var NON_LETHAL_ABILITY = 0;
var KI_LAZER_ABILITY = 1;
var MELEE_SPECIAL_ABILITY = 2;
var KI_BARRAGE_ABILITY = 3;

// Global variables
var ANGLE = 0;
var TARGET;
var DBC_TARGET;
var COUNT = 0;
var TO_RESET = new Array();

/** Timers
* @param {TimerEvent} event - blame riken for this 
*/
function timer(event) 
{
    var npc = event.npc;
    switch(event.id) {
        case(POISON_TICK): // Do poison tick on timer
            poisonTick(npc); 
            break;
        case(MEDITATION_DETECTION):
            if(TARGET != null && npc.getTempData("Form") == 2 && DBC_TARGET.getJRMCSE().contains("A") && TARGET.getTempData("Lethal Poison") > 0) {
            // Lower poison stacks if player is meditating and has at least 1 stack
            incrementLethalPoison(TARGET, -1)
            }
            break;
        case(CHOOSE_ABILITY): // Decide ability
            chooseAbility(npc);
            break;
        case(NON_LETHAL_POISON): // Non-lethal poison timer
            if(DBC_TARGET != null) {
                nonLethalEffects(npc, DBC_TARGET, NON_LETHAL_POISON);
            }
            break;
        case(KI_ATTACK): // Ki attack with the option to be a barrage
            fireLazer(npc);
            COUNT++;
            if(COUNT > maxLazers) { // Stop after 15 shots
                npc.timers.stop(KI_ATTACK);
            }
            break;
        case(KI_BARRAGE_TELEGRAPH): // Ki barrage telegraph
            npc.timers.forceStart(KI_ATTACK, 0, true);
            break;
        case(MELEE_SPECIAL_TELEGRAPH): // Spawn particles used to telegraph the special melee
            telegraphMelee(npc, "plug:textures/blocks/concrete_periwinkle.png", meleeSpecialTelegraphTimer, MELEE_SPECIAL_TELEGRAPH, MELEE_SPECIAL_ATTACK, meleeSpecialRange);
            break;
        case(MELEE_SPECIAL_ATTACK): // Special telegraphed melee that gives extra poison stacks
            specialMeleeAttack(npc);
            break;
    }
}

/** On melee swing save attack target, save attacked players to later reset poison stacks, start timers and add poison stacks in p2
* @param {MeleeAttackEvent} event - blame riken for this 
*/
function meleeAttack(event)
{ // Apply poison on melee swing
    var npc = event.npc;
    TARGET = npc.getAttackTarget();
    DBC_TARGET = TARGET.getDBCPlayer();
    npc.timers.forceStart(10, npc.getTempData("Reset Time"), false); // Reset if doesn't melee a target for set time
    if(TO_RESET.indexOf(TARGET) < 0) { // Add reset targets if not in array already
        TO_RESET.push(TARGET);
    }
    if(!npc.timers.has(POISON_TICK) || !npc.timers.has(MEDITATION_DETECTION) || !npc.timers.has(CHOOSE_ABILITY)) {
        // Starts boss timers if not already started
        npc.timers.forceStart(POISON_TICK, poisonTickSpeed, true); // Start poison tick timer
        npc.timers.forceStart(MEDITATION_DETECTION, meditationStackRed, true); // Start poison tick timer
        npc.timers.forceStart(CHOOSE_ABILITY, abilityInterval, true); // Start ability timer
    }
    if(npc.getTempData("Form") == 2) { // Apply lethal poison on melees in p2
        incrementLethalPoison(TARGET, 1);
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

/** Chooses and executes an ability based on the npc's form
* @param {ICustomNpc} npc - npc that executes the abilities 
*/
function chooseAbility(npc) 
{   
    var abilityChoice = 4;
    // Decide ability based on boss form
    if(npc.getTempData("Form") == 1 && !npc.getTempData("Transforming")) {
        var abilityChoice = getRandomInt(0, 1);
    } else if(npc.getTempData("Form") == 2 && !npc.getTempData("Transforming")) {
        var abilityChoice = getRandomInt(2, 3);
    }
    switch(abilityChoice) {
        case(NON_LETHAL_ABILITY):
            var nearestGcArray = findNearestGC(npc.getPosition());
            var tile = npc.world.getBlock(nearestGcArray[0], nearestGcArray[1], nearestGcArray[2]).getTileEntity(); // Find nearest gravity chamber block
            var nbt = tile.getNBT(); // Get gravity chamber block nbt
            npc.say(nonLethalLine);
            npc.playSound(nonLethalSound, 100, 1);
            nbt.setFloat('gravity', nonLethalGravity); // Set chamber gravity
            nbt.setFloat('BurnTime', nonLethalDuration); // Set chamber duration to nonLethal duration
            tile.readFromNBT(nbt);
            COUNT = 0;
            npc.timers.forceStart(NON_LETHAL_POISON, 1, true); // Disable turbo and apply stamina reduction
            break;
        case(KI_LAZER_ABILITY):
            npc.say(kiLazerLine);
            COUNT = 0; 
            npc.timers.forceStart(KI_ATTACK, kiLazerTelegraphTimer, false);
            break;
        case(MELEE_SPECIAL_ABILITY):
            npc.say(meleeSpecialLine); 
            npc.setSpeed(0); // Stop npc from running away mid attack
            ANGLE = 0; // Reset angle for telegraph animation
            npc.timers.forceStart(MELEE_SPECIAL_TELEGRAPH, 0.5, true); // Start animation timer
            npc.timers.forceStart(MELEE_SPECIAL_ATTACK, meleeSpecialTelegraphTimer, false);
            break;
        case(KI_BARRAGE_ABILITY): // Ki lazer barrage
            npc.say(kiBarrageLine);
            COUNT = 0;
            npc.timers.forceStart(KI_BARRAGE_TELEGRAPH, kiBarrageTelegraphTimer, false);
            break;
    }
}

/** Increments Lethal Poison stacks on a target by a given amount
 @param {IPlayer} target - Target to increment stacks on
 @param {int} increment - Number of stacks to add/subtract from the target
*/
function incrementLethalPoison(target, increment)
{
    if(target != null) {
        target.setTempData("Lethal Poison", target.getTempData("Lethal Poison") + increment); // Increment temp data
        poisonStackDisplay(target, overlayText + target.getTempData("Lethal Poison"), 3655475, 1, overlayID); // Set poison overlay
    }
}

/** Execute poison damage on nearby players with stacks as well as removing stacks when not in p2 anymore
* @param {ICustomNpc} npc - The npc that dealing the damage 
*/
function poisonTick(npc)
{
    var nearbyPlayers = npc.getSurroundingEntities(arenaSize, 1);
    var nearbyPlayers2 = new Array(); // Non entity array because getSurroundingEntities is dumb
    for(i = 0; i < nearbyPlayers.length; i++) {
        var poisonStacks = nearbyPlayers[i].getTempData("Lethal Poison");
        if(nearbyPlayers[i] != null && poisonStacks > 0 && nearbyPlayers[i].getMode() != 1 && !nearbyPlayers[i].getDBCPlayer().isDBCFusionSpectator() && npc.getTempData("Form") == 2) {
        // Only damage players that have at least one lethal poison stack, are not in creative and are not a fusion spectator.    
            var dbcPlayer = nearbyPlayers[i].getDBCPlayer();
            dbcPlayer.setHP(dbcPlayer.getHP() - (dbcPlayer.getMaxHP() * lethalDam * poisonStacks));
        }
        nearbyPlayers2.push(nearbyPlayers[i]); // Add player to non entity array
    } 
    for(i = 0; i < TO_RESET.length; i++) { // Reset stacks of players no longer in range or if the boss dies
        if(TO_RESET[i] != null && (npc.getTempData("Form") != 2 || nearbyPlayers2.indexOf(TO_RESET[i]) < 0)) {
            TO_RESET[i].removeTempData("Lethal Poison"); 
            TO_RESET[i].closeOverlay(overlayID);
            TO_RESET.splice(i); // Remove player from array
        } 
    }
}

/** Displays number of Lethal poison stacks a player has on their screen
 * @param {IPlayer} player - The player object on whose screen the overlay will be displayed.
 * @param {string} text - The text to display on the player's screen.
 * @param {string} color - The color of the text in hexadecimal format.
 * @param {number} size - The font size of the text.
 * @param {string} speakID - The ID of the text overlay.
 */
function poisonStackDisplay(player, text, color, size, speakID)
{ // Slightly modified version of my 'speak' function
    player.closeOverlay(speakID);
    var speechOverlay = API.createCustomOverlay(speakID); // Create overlay with id
    var x = 480 - Math.floor((text.length) * 2.5) * size; // Calculate centre position
    var y = 246 - Math.floor(size * 6.5);
    speechOverlay.addLabel(1, text, x, y, 0, 0, color); // Add label in the middle of the screen with the given color
    speechOverlay.getComponent(1).setScale(size); // Resize the label
    player.showCustomOverlay(speechOverlay); // Place the overlay on the player's screen
    speechOverlay.update(player); // Update the label to be visible
}

/** Peforms a special melee attack adding poison stacks to players in range
 * @param {ICustomNpc} npc - The npc performing the attack.
 */
function specialMeleeAttack(npc)
{ // Apply poison stacks to player if they are in range
    var playersToHit = npc.getSurroundingEntities(meleeSpecialRange, 1); // Get players in range
    for(i = 0; i < playersToHit.length; i++) {
        if(playersToHit[i] != null) {
            incrementLethalPoison(playersToHit[i], meleeSpecialStacks); // Increment by x number of stacks
        }
    }
    npc.playSound(meleeSpecialSound, 100, 1);
    npc.setSpeed(npc.getTempData("Movement Speed"));
}

/** Create a particle in an incremented position each time the method is executed
 * @param {ICustomNpc} npc - Npc to spawn the particles from
 * @param {String} particlePath - Image file path for the particle
 * @param {int} duration - Duration of the telegraph in ticks
 * @param {int} timerNo - Timer telegraph is on
 * @param {int} finishTimer - Timer to detect end of telegraph
 */
function telegraphMelee(npc, particlePath, duration, timerNo, finishTimer, range)
{
    function createParticle(npc, x, y, z) { // Particle creation
        var particle = API.createParticle(particlePath);
        particle.setSize(16, 16);
        particle.setMaxAge(30);
        particle.setAlpha(1, 0, 0.2, 15);
        particle.setPosition(x, y, z);
        particle.setScale(5, 5, 0, 5);
        particle.spawn(npc.getWorld());
    }
    var dx = -Math.sin(ANGLE*Math.PI/180) * range; // Rotational positioning math
    var dz = Math.cos(ANGLE*Math.PI/180) * range;
    createParticle(npc, npc.x+dx, npc.y + 0.5, npc.z+dz);
    createParticle(npc, npc.x+-dx, npc.y + 0.5, npc.z+-dz);
    ANGLE += 360/(duration*2);
    if(!npc.timers.has(finishTimer)) { // Stop rotation if telegraph done
        npc.timers.stop(timerNo);
    }
}

/** Lowers the player's stamina and disables their turbo for the duration of the non-lethal poison
 * @param {ICustomNpc} npc - Npc performing the attack
 * @param {IDBCPlayer} DBCTarget - IDBCPlayer object of the player performing the attack on
 * @param {int} timer - Timer number the attack is being performed on
 */
function nonLethalEffects(npc, DBCTarget, timer)
{
    COUNT += 2;
    if(DBCTarget != null) { // Disable turbo and lower stamina
        var loweredStamina = DBCTarget.getMaxStamina() * nonLethalStaminaMax;
        DBCTarget.setTurboState(false);
        if(DBCTarget.getStamina() > loweredStamina) {
            DBCTarget.setStamina(loweredStamina);
        }
    }
    if(COUNT > nonLethalDuration) { // End loop after set amount of time
            npc.timers.stop(timer);
    }
}

/** Find the nearest gravity chamber for a 2d array of coordinates
 * @param {IPos} npcPos - The position of the npc to find the nearest gravity chamber from
 * @returns {int[]} nearestGC - An array containing the coordinates of the nearest gravity chamber
 */
function findNearestGC(npcPos)
{
    var proximity = 1000; // Distance to nearest gc
    var nearestGC = new Array(); // Array of gc
    for(i = 0; i < gcLocations.length; i++) {
        var distanceToi = npcPos.distanceTo(gcLocations[i][0], gcLocations[i][1], gcLocations[i][2]); // Calculate how far away npc is to gravity chamber
        if(proximity > distanceToi) { // If selected gravity chamber is closer than all others set variables
            proximity = distanceToi;
            nearestGC = gcLocations[i];
        }
    }
    return nearestGC;
}

/** Fire a lazer attack that's actually a blast
 * @param {ICustomNpc} npc - The npc firing the attack
 */
function fireLazer(npc)
{
    npc.executeCommand("/dbcspawnki 1 " + lazerSpeed + " " + lazerDamage + " 0 4 10 1 100 " + npc.x + " " + npc.y + " " + npc.z + "");
}

