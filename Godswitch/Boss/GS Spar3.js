// GS Spar3.js
// AUTHOR: Trent/Noxie

// CHANGE THESE
var arenaCentre = [-255, 56, -841];

/** Sets an npc's stats and hits them with that multi
 * @param {ICustomNpc} npc 
 * @param {Double} multi 
 */ 
function setStats(npc, multi)
{ // EDIT THIS LIKE SO
    npc.setMeleeStrength(1 * multi);
}

// CONFIG
var npcSSBForm = "[NPC] SSB"; // Name of npc's SSB form
var npcSSGForm = "[NPC] SSG"; // Name of npc's SSG form
var playerSSBId = 10; // ID of player SSB form
var playerSSGId = 9; // ID of player SSG form
var ssbStatMultiplier = 2; // Stat multiplier for ssb

var switchFormDelay = 74 // Cooldown to switching forms
var ssbCycleLine = "&bKeep up with this!";

var failSound = ["jinryuudragonbc:DBC4.dodge1", "jinryuudragonbc:DBC4.dodge2", "jinryuudragonbc:DBC4.dodge3"];
var spamDelay = 40; // Number of ticks between telling the player to switch form

// KAIOKEN MURDER VOICELINES
var kaiokenVoiceline1 = "&c&lUsing kakarots scummy power up to &c&ltry and get an edge?";
var kaiokenVoiceline2 = "&c&lGet out of my sight, you worthless &c&llow-class scum!";

// FINAL FLASH CONFIG
var finalFlashInitial = "&eHere it comes!";
var finalFlashFire = "&e&lFinal Flash!";
var finalFlashChargeSound = "jinryuudragonbc:DBC4.cbeam5s";
var finalFlashFireSound = "jinryuudragonbc:DBC3.ffinalflash";

// RUSH CONFIG
var rushInitial = "&3&lI'll crush you before you even know what &3&lhit you!";
var rushFireBlock = "&bNot a bad performance for someone of your &blevel.";
var rushFireKill = "&c&lTHIS is the power of the ultimate Saiyan!";
var rushHitSound = "jinryuudragonbc:DBC2.strongpunch";
var rushBlockDamage = 1; // Damage on blocking the ki attack from rush
var rushFailDamage = 100000000; // Damage on NOT blocking the ki attack from rush
var slapDamage = 1; // Damage done per knock from knocking the player around
function blockWarning(target) { lib.speak(target, "Block Now!", "16763648", 2, 0, 0, 50, 114); }

var abilityCooldown = 150; // All ability cooldown

// KI ATTACK CONFIG
var kiBlast = DBCAPI.createKiAttack(
    1, // Type
    0, // Speed
    1, // Damage
    false, 18, 0, true, 100 // Effect, colour, density, sound, charge
);

var finalFlash = DBCAPI.createKiAttack(
    0, // Type
    1, // Speed
    1, // Damage
    false, 27, 0, true, 100 // Effect, colour, density, sound, charge
);

var rushBlast = DBCAPI.createKiAttack(
    5, // Type
    8, // Speed
    1, // Damage
    false, 18, 0, true, 100 // Effect, colour, density, sound, charge
);

// TIMERS
var SWITCH_FORM = 1;
var KAIOKEN_MOCK = 3;
var KI_BLAST = 4;
var CHOOSE_ATTACK = 5;
var FIRE_FINAL_FLASH = 6;
var FIRE_FINAL_FLASH_SOUND = 7;
var RUSH_MOTION = 8;
var RUSH_TRANSFORM_DELAY = 9;
var FIRE_RUSH_BLAST = 10;
var SPAM_PREVENTION = 50;

// DON'T EDIT
var displayHandler;
var switchTicks;
var abilityTicks;
var target;
var rushPos;
var npcInMotion;
var nextRush;
var ability = false;

function init(event)
{
    var npc = event.npc;
    var timers = npc.timers;
    displayHandler = new lib.dbcDisplayHandler(npc, true);
    reset(npc);

    // Form switching timer
    timers.forceStart(SWITCH_FORM, switchFormDelay, true);
    timers.forceStart(CHOOSE_ATTACK, abilityCooldown, true);
    timers.setTicks(CHOOSE_ATTACK, 76);
}

function timer(event)
{
    var npc = event.npc;
    var timers = npc.timers;
    // Don't do anything if no player is present
    if(!lib.isPlayer(npc.getAttackTarget())) {
        resumeSwitch(timers, 0);
        return;
    } 
    switch(event.id) {
        case(SWITCH_FORM):
            // Change form based on state
            var npcForm = displayHandler.getNpcDisplay().getCurrentForm().getName();
            if(npcForm == npcSSGForm) { // SWITCH TO BLUE - Disable abilities
                displayHandler.quickTransform(DBCAPI.getForm(npcSSBForm), true) // Switch to SSB
                setStats(npc, ssbStatMultiplier);
                npc.say(ssbCycleLine);
                timers.forceStart(KI_BLAST, displayHandler.updateFormDelay, false);
                abilityTicks = timers.ticks(CHOOSE_ATTACK);
                timers.stop(CHOOSE_ATTACK);
            }
            else { // SWITCH TO GOD - Renable abilities
                displayHandler.quickTransform(DBCAPI.getForm(npcSSGForm), true); // Switch to SSG
                setStats(npc, 1);
                timers.forceStart(CHOOSE_ATTACK, abilityCooldown, true);
                timers.setTicks(CHOOSE_ATTACK, abilityTicks + displayHandler.disableAuraDelay);
            }
            break;

        case(KI_BLAST):
            DBCAPI.fireKiAttack(npc, kiBlast);
            break;

        case(CHOOSE_ATTACK):
            // Flip flops his attacks between final flash and rush
            if(displayHandler.getNpcDisplay().getCurrentForm().getName() == npcSSBForm) return;
            if(ability) chargeFinalFlash(timers, npc);
            else rushVariant(npc, -1);
            // Saves transformation timer ticks
            switchTicks = switchFormDelay - timers.ticks(SWITCH_FORM);
            timers.stop(SWITCH_FORM);
            ability = !ability;
            break;

        case(FIRE_FINAL_FLASH_SOUND):
            npc.playSound(finalFlashFireSound, 0.8, 1);
            break;

        case(FIRE_FINAL_FLASH):
            // Fires final flash attack and transforms npc back to god
            DBCAPI.fireKiAttack(npc, finalFlash);
            npc.say(finalFlashFire);
            displayHandler.quickTransform(npcSSGForm, true);
            setStats(npc, 1);
            resumeSwitch(timers, displayHandler.disableAuraDelay);
            break;

        case(KAIOKEN_MOCK):
            // Mocks the player while they're down
            npc.say(kaiokenVoiceline2);
            break;

        case(RUSH_TRANSFORM_DELAY):
            // Start rush after transforming to blue
            rushVariant(npc, 0);
            break;

        case(FIRE_RUSH_BLAST):
            // Fire ki attack at target - check blocking
            var target = npc.getAttackTarget();
            var dbcTarget = target.getDBCPlayer();
            if(dbcTarget.isBlocking()) {
                npc.say(rushFireBlock);
                rushBlast.setDamage(rushBlockDamage);
            } else {
                npc.say(rushFireKill);
                rushBlast.setDamage(rushFailDamage);
            }
            npc.setPitch(getPitchToEntity(npc, target));
            DBCAPI.fireKiAttack(npc, rushBlast);
            displayHandler.quickTransform(npcSSGForm, true);
            setStats(npc, 1);
            resumeSwitch(npc.timers, displayHandler.disableAuraDelay)
            break;

        case(RUSH_MOTION):
            // Npc charges at player
            npcInMotion = true;
            timers.forceStart(RUSH_MOTION, 0, true);
            var target = npc.getAttackTarget();
            var npcMotion = lib.get3dDirection([npc.x, npc.y, npc.z], [target.x, target.y, target.z]);
            npc.setMotion(npcMotion[0] * 3, npcMotion[1] * 3 , npcMotion[2] * 3);
            break;
    }
}

function damaged(event)
{
    var npc = event.npc
    var timers = npc.timers;
    var player = event.source;

    // Return if not a player or player is null
    if(!(player && player.getType() == 1)) {
        event.setCanceled(true);
        return;
    }

    // Kaioken detection
    if(player.getDBCPlayer().isKaioken()) {
        event.setCanceled(true);
        timers.forceStart(KAIOKEN_MOCK, 30, false);
        npc.executeCommand("jrmcse set KO 0.2 " + player.getName())
        // Return if player has seen message already
        if(timers.has(SPAM_PREVENTION)) return;
        npc.say(kaiokenVoiceline1);
        npc.timers.forceStart(SPAM_PREVENTION, spamDelay, false);
        return;
    }
    
    // Check if player is in correct form
    var playerForm = player.getDBCPlayer().getForm();
    var npcForm = displayHandler.getNpcDisplay().getCurrentForm().getName();
    var formCheck = Boolean(
        playerForm && npcForm &&
        ((npcForm == npcSSGForm && playerForm == playerSSGId) ||
        (npcForm == npcSSBForm && playerForm == playerSSBId))
    );
    if(formCheck) return;

    // Prevent damage if the player’s form does not match the NPC’s form
    event.setCanceled(true);
    npc.playSound(failSound[lib.getRandom(0, failSound.length, true)], 0.5, 1);
}

function killed(event)
{
    reset(event.npc);
}

// Reset detection
function tick(event)
{
    lib.checkReset(event.npc);
}

/** Reverts to god form and clears timers
 * @param {ICustomNpc} npc - This npc 
 */
function reset(npc)
{
    // Reset health and timers
    if(npc.getHealth() != 0) npc.setHealth(npc.getMaxHealth());
    ability = false;
    npc.timers.clear();

    // Change form to god
    displayHandler.setForm(npcSSGForm);
    setStats(npc, 1);
    displayHandler.toggleAura(false);
}

function collide(event)
{
    var npc = event.npc;
    // If npc is in rush motion and collides with a player stop rush and perform next part in the sequence
    if(!npcInMotion) return;
    npc.setMotion(0, 0, 0);
    npc.timers.stop(RUSH_MOTION);
    rushVariant(npc, nextRush);
    npcInMotion = false;
}

/** Knocks the player with a set speed and starts npc movement
 * @param {ICustomNpc} npc 
 * @param {Double[]} nextPos 
 * @param {Int} nextPart 
 * @param {Int} speedx 
 * @param {Int} speedy 
 * @param {Int} speedz 
 */
function performRush(npc, nextPos, nextPart, speedx, speedy, speedz) 
{
    var target = npc.getAttackTarget();
    target.getDBCPlayer().setTurboState(false);
    target.getDBCPlayer().setFlight(false);
    // Launch player into the ground
    var playerMotion = lib.get3dDirection([target.x, target.y, target.z], [nextPos[0], nextPos[1], nextPos[2]]);
    target.setMotion(playerMotion[0] * speedx, playerMotion[1] * speedy , playerMotion[2] * speedz);

    // Damage and play sound
    nextRush = nextPart;
    DBCAPI.doDBCDamage(target, DBCAPI.getDBCData(npc), slapDamage);
    npc.playSound(rushHitSound, 1, 1);
    if(nextPart == 4) {
        npc.setMotion(0, 1, 0);
        rushVariant(npc, 4)
        return;
    }
    npc.timers.forceStart(RUSH_MOTION, 5, true);
}

/** Handles rush sequencing
 * @param {ICustomNpc} npc 
 * @param {Int} variant 
 */
function rushVariant(npc, variant) 
{
    var timers = npc.timers;
    var target = npc.getAttackTarget();
    if(!lib.isPlayer(target)) {
        resumeSwitch(npc.timers, 0);
        return;
    }
    switch(variant) {
        case(-1):
            // Transform the npc
            displayHandler.quickTransform(npcSSBForm, true);
            setStats(npc, ssbStatMultiplier);
            timers.forceStart(RUSH_TRANSFORM_DELAY, displayHandler.disableAuraDelay, false);
            break;

        case(0):
            // Rush the player initially if out of range
            if(npc.getPosition().distanceTo(target.getPosition()) > npc.getMeleeRange()) {
                nextRush = 1
                timers.forceStart(RUSH_MOTION, 5, true);
            } 
            // Perform the rush normally
            else {
                rushVariant(npc, 1);
            }
            npc.say(rushInitial);
            blockWarning(target);
            break;

        case(1):
            // Knock target up
            performRush(npc, [target.x, target.y + 6, target.z], 2, 0, 2, 0);
            break;

        case(2):
            // Slap towards to the centre
            performRush(npc, [arenaCentre[0], target.y + 2, arenaCentre[2]], 3, 3, 2, 3);
            break;

        case(3):
            // Slap target into the ground
            performRush(npc, [arenaCentre[0] + 5, target.y - 100, arenaCentre[2] + 5], 4, 5, 4, 5);
            break;

        case(4):
            timers.forceStart(FIRE_RUSH_BLAST, 5, false);

            break;
    }
}

/** Begins charging final flash attack
 * @param {ITimers} timers 
 * @param {ICustomNpc} npc 
 */
function chargeFinalFlash(timers, npc)
{
    // Save transform timer and start quick transformation
    timers.start(FIRE_FINAL_FLASH_SOUND, displayHandler.disableAuraDelay - 1, false);
    timers.start(FIRE_FINAL_FLASH, displayHandler.disableAuraDelay, false);
    npc.say(finalFlashInitial);
    npc.playSound(finalFlashChargeSound, 0.3, 1);
    displayHandler.quickTransform(npcSSBForm, true);
    setStats(npc, ssbStatMultiplier);
}

/** Resumes form swap from saved timers
 * @param {ITimers} timers 
 * @param {Int} delay 
 */
function resumeSwitch(timers, delay)
{
    if(timers.has(SWITCH_FORM)) return;
    timers.forceStart(SWITCH_FORM, switchFormDelay, true);
    timers.setTicks(SWITCH_FORM, switchTicks + delay);
}

// Edited version of lib function
function getPitchToEntity(entity1, entity2) 
{
    if(!entity1 || !entity2) return;
    var dx = entity1.getY() - entity2.getY();
    var dz = entity1.getZ() - entity2.getZ();
    var theta = Math.atan2(dx, -dz);
    theta *= 180 / Math.PI
    if (theta < 0) theta += 360;
    return theta;
}