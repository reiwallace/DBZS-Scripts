// GS Spar2.js
// AUTHOR: Trent/Noxie
var lib = API.getIWorld(0).getTempData("library");

// CONFIG
var npcSSBForm = "[NPC] SSB"; // Name of npc's SSB form
var npcSSGForm = "[NPC] SSG"; // Name of npc's SSG form
var playerSSBId = 10; // ID of player SSB form
var playerSSGId = 9; // ID of player SSG form

var switchFormDelay = 200; // Cooldown to switching forms
var ssbCycleLine = "&bKeep up with this!";

var failVoiceline = "You can't harm me in this form!";
var spamDelay = 40; // Number of ticks between telling the player to switch form

var kaiokenVoiceline1 = "&c&lUsing kakarots scummy power up to &c&ltry and get an edge?";
var kaiokenVoiceline2 = "&c&lGet out of my sight, you worthless &c&llow-class scum!";

var galickInitial = "&dHere it comes!";
var galickFire = "&d&lGalick Gun!";
var galickChargeSound = "jinryuudragonbc:DBC4.cbeam5s";
var galickFireSound = "jinryuudragonbc:DBC3.fgallitgun";
var galickGunCooldown = 240;

// KI ATTACK CONFIG
var kiBlast = DBCAPI.createKiAttack(
    1, // Type
    0, // Speed
    1, // Damage
    false, 18, 0, true, 100 // Effect, colour, density, sound, charge
);

var galickGun = DBCAPI.createKiAttack(
    0, // Type
    1, // Speed
    1, // Damage
    false, 3, 0, true, 100 // Effect, colour, density, sound, charge
);

// TIMERS
var SWITCH_FORM = 1;
var KAIOKEN_MOCK = 3;
var KI_BLAST = 4;
var CHARGE_GALICK_GUN = 5;
var FIRE_GALICK_GUN = 6;
var FIRE_GALICK_GUN_SOUND = 7;
var SPAM_PREVENTION = 50;

// DON'T EDIT
var displayHandler;
var switchTicks;
var galickTicks;

function init(event)
{
    var npc = event.npc;
    displayHandler = new lib.dbcDisplayHandler(npc, true);
    reset(npc);

    // Form switching timer
    npc.timers.forceStart(SWITCH_FORM, switchFormDelay, true);
    npc.timers.forceStart(CHARGE_GALICK_GUN, galickGunCooldown, true);
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
                galickTicks = timers.ticks(CHARGE_GALICK_GUN);
                timers.stop(CHARGE_GALICK_GUN);
            }
            else {
                displayHandler.quickTransform(DBCAPI.getForm(npcSSGForm), true); // Switch to SSG
                timers.forceStart(CHARGE_GALICK_GUN, galickGunCooldown, true);
                timers.setTicks(CHARGE_GALICK_GUN, galickTicks + displayHandler.disableAuraDelay);
            }
            break;

        case(KI_BLAST):
            DBCAPI.fireKiAttack(npc, kiBlast);
            break;

        case(CHARGE_GALICK_GUN):
            // Save transform timer and start quick transformation
            switchTicks = switchFormDelay - timers.ticks(SWITCH_FORM);
            timers.stop(SWITCH_FORM);
            timers.start(FIRE_GALICK_GUN_SOUND, displayHandler.disableAuraDelay - 1, false);
            timers.start(FIRE_GALICK_GUN, displayHandler.disableAuraDelay, false);
            npc.say(galickInitial);
            npc.playSound(galickChargeSound, 0.3, 1);
            displayHandler.quickTransform(npcSSBForm, true);
            break;

        case(FIRE_GALICK_GUN_SOUND):
            npc.playSound(galickFireSound, 0.8, 1);
            break;

        case(FIRE_GALICK_GUN):
            DBCAPI.fireKiAttack(npc, galickGun);
            npc.say(galickFire);
            displayHandler.quickTransform(npcSSGForm, true);
            timers.forceStart(SWITCH_FORM, switchFormDelay, true);
            timers.setTicks(SWITCH_FORM, switchTicks + displayHandler.disableAuraDelay);
            break;

        case(KAIOKEN_MOCK):
            npc.say(kaiokenVoiceline2);
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
        npc.timers.forceStart(SPAM_PREVENTION, 40, false);
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
    if(timers.has(SPAM_PREVENTION)) return;
    npc.say(failVoiceline);
    timers.forceStart(SPAM_PREVENTION, spamDelay, false);
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