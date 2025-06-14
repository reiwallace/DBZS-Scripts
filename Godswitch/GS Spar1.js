// GS Spar1.js
// AUTHOR: Trent

// CONFIG
var npcSSBForm = "[NPC] SSB"; // Name of npc's SSB form
var npcSSGForm = "[NPC] SSG"; // Name of npc's SSG form
var playerSSBId = 10; // ID of player SSB form
var playerSSGId = 9; // ID of player SSG form

var switchFormDelay = 200; // Cooldown to switching forms

var failVoiceline = "You can't harm me in this form!";
var spamDelay = 40; // Number of ticks between telling the player to switch form

var kaiokenVoiceline1 = "&c&lUsing kakarots scummy power up to &c&ltry and get an edge?";
var kaiokenVoiceline2 = "&c&lGet out of my sight, you worthless &c&llow-class scum!";

// TIMERS
var SWITCH_FORM = 1;
var KAIOKEN_MOCK = 3;
var SPAM_PREVENTION = 50;

// DON'T EDIT
var lib = API.getIWorld(0).getTempData("library");
var displayHandler;

function init(event)
{
    var npc = event.npc;
    displayHandler = new lib.dbcDisplayHandler(npc, true);
    reset(npc);

    // Form switching timer
    npc.timers.forceStart(SWITCH_FORM, switchFormDelay, true);
}

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(SWITCH_FORM):
            // Change form based on state
            var npcForm = displayHandler.getNpcDisplay().getCurrentForm().getName();
            if(npcForm == npcSSGForm) displayHandler.slowTransform(DBCAPI.getForm(npcSSBForm)) // Switch to SSB
            else displayHandler.slowTransform(DBCAPI.getForm(npcSSGForm)); // Switch to SSG
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