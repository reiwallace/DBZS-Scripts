// GS Spar2.js
// AUTHOR: Trent/Noxie

// CHANGE THESE
var arenaCentre = [0, 0, 0];

// CONFIG
var npcSSBForm = "[NPC] SSB"; // Name of npc's SSB form
var npcSSGForm = "[NPC] SSG"; // Name of npc's SSG form
var playerSSBId = 10; // ID of player SSB form
var playerSSGId = 9; // ID of player SSG form

var switchFormDelay = 150; // Cooldown to switching forms
var ssbCycleLine = "&bKeep up with this!";

var failSound = ["jinryuudragonbc:DBC4.dodge1", "jinryuudragonbc:DBC4.dodge2", "jinryuudragonbc:DBC4.dodge3"];
var spamDelay = 40; // Number of ticks between telling the player to switch form

var kaiokenVoiceline1 = "&c&lUsing kakarots scummy power up to &c&ltry and get an edge?";
var kaiokenVoiceline2 = "&c&lGet out of my sight, you worthless &c&llow-class scum!";

var finalFlashInitial = "&eHere it comes!";
var finalFlashFire = "&e&lFinal Flash!";
var finalFlashChargeSound = "jinryuudragonbc:DBC4.cbeam5s";
var finalFlashFireSound = "jinryuudragonbc:DBC3.ffinalflash";



var abilityCooldown = 150;

// KI ATTACK CONFIG
var kiBlast = DBCAPI.createKiAttack(
    1, // Type
    0, // Speed
    1, // Damage
    false, 18, 0, true, 100 // Effect, colour, density, sound, charge
);

var finalFlashGun = DBCAPI.createKiAttack(
    0, // Type
    1, // Speed
    1, // Damage
    false, 27, 0, true, 100 // Effect, colour, density, sound, charge
);

// TIMERS
var SWITCH_FORM = 1;
var KAIOKEN_MOCK = 3;
var KI_BLAST = 4;
var CHARGE_FINAL_FLASH_GUN = 5;
var FIRE_FINAL_FLASH_GUN = 6;
var FIRE_FINAL_FLASH_GUN_SOUND = 7;
var SPAM_PREVENTION = 50;

// DON'T EDIT
var displayHandler;
var switchTicks;
var finalFlashTicks;
var target;
var rushPos;
var npcInMotion;
var nextRush;

function init(event)
{
    var npc = event.npc;
    displayHandler = new lib.dbcDisplayHandler(npc, true);
    reset(npc);

    // Form switching timer
    npc.timers.forceStart(SWITCH_FORM, switchFormDelay, true);
    npc.timers.forceStart(CHARGE_FINAL_FLASH_GUN, finalFlashGunCooldown, true);
}

function timer(event)
{
    var npc = event.npc;
    var timers = npc.timers;
    if(!npc.getAttackTarget()) return; // Don't do anything if no player is present
    switch(event.id) {
        case(SWITCH_FORM):
            // Change form based on state
            var npcForm = displayHandler.getNpcDisplay().getCurrentForm().getName();
            if(npcForm == npcSSGForm) {
                displayHandler.quickTransform(DBCAPI.getForm(npcSSBForm), true) // Switch to SSB
                npc.say(ssbCycleLine);
                timers.forceStart(KI_BLAST, displayHandler.updateFormDelay, false);
                finalFlashTicks = timers.ticks(CHARGE_FINAL_FLASH_GUN);
                timers.stop(CHARGE_FINAL_FLASH_GUN);
            }
            else {
                displayHandler.quickTransform(DBCAPI.getForm(npcSSGForm), true); // Switch to SSG
                timers.forceStart(CHARGE_FINAL_FLASH_GUN, finalFlashGunCooldown, true);
                timers.setTicks(CHARGE_FINAL_FLASH_GUN, finalFlashTicks + displayHandler.disableAuraDelay);
            }
            break;

        case(KI_BLAST):
            DBCAPI.fireKiAttack(npc, kiBlast);
            break;

        case(CHARGE_FINAL_FLASH_GUN):
            // Save transform timer and start quick transformation
            switchTicks = switchFormDelay - timers.ticks(SWITCH_FORM);
            timers.stop(SWITCH_FORM);
            timers.start(FIRE_FINAL_FLASH_GUN_SOUND, displayHandler.disableAuraDelay - 1, false);
            timers.start(FIRE_FINAL_FLASH_GUN, displayHandler.disableAuraDelay, false);
            npc.say(finalFlashInitial);
            npc.playSound(finalFlashChargeSound, 0.3, 1);
            displayHandler.quickTransform(npcSSBForm, true);
            break;

        case(FIRE_FINAL_FLASH_GUN_SOUND):
            npc.playSound(finalFlashFireSound, 0.8, 1);
            break;

        case(FIRE_FINAL_FLASH_GUN):
            DBCAPI.fireKiAttack(npc, finalFlashGun);
            npc.say(finalFlashFire);
            displayHandler.quickTransform(npcSSGForm, true);
            timers.forceStart(SWITCH_FORM, switchFormDelay, true);
            timers.setTicks(SWITCH_FORM, switchTicks + displayHandler.disableAuraDelay);
            break;

        case(KAIOKEN_MOCK):
            npc.say(kaiokenVoiceline2);
            break;

        case(RUSH_PART1):
            performRush(npc, [target.x, target.y + 6, target.z], RUSH_PART2, 0, 2, 0);
            break;
        
        case(RUSH_PART2):
            performRush(npc, [arenaCentre[0], target.y + 2, arenaCentre[2]], RUSH_PART3, 3, 2, 3);
            break;

        case(RUSH_PART3):
            performRush(npc, [arenaCentre[0] + 5, target.y - 100, arenaCentre[2] + 5], RUSH_END, 5, 4, 5);
            break;

        case(RUSH_END):
            
            DBCAPI.fireKiAttack(npc, kiBlast);
            break;

        case(RUSH_MOTION):
            // Npc charges at player
            npcInMotion = true;
            timers.forceStart(RUSH_MOTION, 0, true);
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
    npc.timers.clear();

    // Change form to god
    displayHandler.setForm(npcSSGForm);
    displayHandler.toggleAura(false);
}

function collide(event)
{
    var npc = event.npc;
    if(!npcInMotion) return;
    npc.setMotion(0, 0, 0);
    npc.timers.stop(RUSH_MOTION);
    npc.timers.forceStart(nextRush);
}

function performRush(nextPos, nextTimer, speedx, speedy, speedz) 
{
    if(!lib.isPlayer(target)) return;
    // Launch player into the ground
    var playerMotion = lib.get3dDirection([target.x, target.y, target.z], [nextPos[0], nextPos[1], nextPos[2]]);
    target.setMotion(playerMotion[0] * speedx, playerMotion[1] * speedy , playerMotion[2] * speedz);

    nextRush = nextTimer;
    timers.forceStart(RUSH_MOTION, 10, true);
}