// GS Spar1.js
// AUTHOR: Trent

// CONFIG
var NPC_SSB_NAME = "[NPC] SSB"; // Name of npc's SSB form
var NPC_SSG_NAME = "[NPC] SSG"; // Name of npc's SSG form
var PLAYER_SSB_ID = 10; // ID of player SSB form
var PLAYER_SSG_ID = 9; // ID of player SSG form

var SWITCH_FORM_DELAY = 200; // Cooldown to switching forms
var FLAG_SWITCH_DELAY = 82; // Delay after transforming to switch transform flag

var FAIL_VOICELINE = "You can't harm me in this form!";
var SPAM_DELAY = 40; // Number of ticks between telling the player to switch form

var kaiokenVoiceline1 = "&c&lUsing kakarots scummy power up to &c&ltry and get an edge?";
var kaiokenVoiceline2 = "&c&lGet out of my sight, you worthless &c&llow-class scum!";

// TIMERS
var SWITCH_FORM = 1;
var FLAG_SWITCH = 2;
var KAIOKEN_MOCK = 3;
var SPAM_PREVENTION = 50;

// DON'T EDIT
var isSSG = true; // Starts in SSG

function init(event)
{
    var npc = event.npc;
    reset(npc);

    // Form switching timer
    npc.timers.forceStart(SWITCH_FORM, SWITCH_FORM_DELAY, true);
}

function timer(event)
{
    var npc = event.npc;
    var display = DBCAPI.getDBCDisplay(npc);

    switch(event.id) {
        case(SWITCH_FORM):
            if (display == null) return;

            // Set DBCDisplay to visible and change form based on state
            display.setEnabled(true);
            if(isSSG) display.transform(DBCAPI.getForm(NPC_SSB_NAME)) // Switch to SSB
            else display.transform(DBCAPI.getForm(NPC_SSG_NAME)); // Switch to SSG
            npc.updateClient();
            
            // Allow for transformation delay before changing flag
            npc.timers.forceStart(FLAG_SWITCH, FLAG_SWITCH_DELAY, false);
            break;
        
        case(FLAG_SWITCH):
            isSSG = !isSSG;
            break;

        case(KAIOKEN_MOCK):
            npc.say(kaiokenVoiceline2);
            break;

    }
}

function damaged(event)
{
    var npc = event.npc
    var player = event.source;

    // Return if not a player or player is null
    if(!(player && player.getType() == 1)) {
        event.setCanceled(true);
        return;
    }

    // Kaioken detection
    if(player.getDBCPlayer().isKaioken()) {
        event.setCanceled(true);
        npc.timers.forceStart(KAIOKEN_MOCK, 30, false);
        npc.executeCommand("jrmcse set KO 0.2 " + player.getName())
        if(npc.getTimers().has(SPAM_PREVENTION)) return;
        npc.say(kaiokenVoiceline1);
        npc.timers.forceStart(SPAM_PREVENTION, 40, false);
        return;
    }
    
    // Check if player is in correct form
    var currentForm = player.getDBCPlayer().getCurrentForm();
    var formCheck = Boolean(
        currentForm &&
        ((isSSG && currentForm.getName() == NPC_SSG_NAME) || 
        (!isSSG && currentForm.getName() == NPC_SSB_NAME))
    );
    if(formCheck) return;

    // Prevent damage if the player’s form does not match the NPC’s form
    event.setCanceled(true);
    if(npc.getTimers().has(SPAM_PREVENTION)) return;
    npc.say(FAIL_VOICELINE);
    npc.getTimers().forceStart(SPAM_PREVENTION, 40, false);
}

function killed(event)
{
    reset(event);
}

// Reset detection
function tick(event)
{
    var npc = event.npc;
    var temptarget = npc.getTempData("npctarget");
    var target = npc.getAttackTarget();
    if (temptarget != null && target == null && temptarget.getHealth() == 0 && npc.world.getClosestVulnerablePlayer(npc.getPosition(), 50.0) == null) {
        reset(npc);
        npc.reset()
    }
    npc.setTempData("npctarget", npc.getAttackTarget());
}

/** Reverts to god form and clears timers
 * @param {ICustomNpc} npc - This npc 
 */
function reset(npc)
{
    var display = DBCAPI.getDBCDisplay(npc)
    
    // Reset health and timers
    npc.setHealth(npc.getMaxHealth());
    npc.timers.clear();

    // Change form to god
    display.setEnabled(true)
    display.transform(DBCAPI.getForm(NPC_SSG_NAME));
    npc.updateClient()
    isSSG = true
}