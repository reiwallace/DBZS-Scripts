// CONFIG
var SSBFormName = "[NPC] SSB";
var SSGFormName = "[NPC] SSG";

var SWITCH_FORM_DELAY = 200; // Cooldown to switching forms
var FLAG_SWITCH_DELAY = 82; // Delay after transforming to switch transform flag

var SPAM_DELAY = 40; // Number of ticks between telling the player to switch form

// TIMERS
var SWITCH_FORM = 1;
var FLAG_SWITCH = 2;
var SPAM_PREVENTION = 50;

// DON'T EDIT
var isSSG = true; // Starts in SSG

function init(event) {
    var world = event.npc.world;
    var npc = event.npc;
    // Form switching timer
    if(!world.getClosestVulnerablePlayer(npc.getPosition(),50.0)) npc.timers.forceStart(SWITCH_FORM, SWITCH_FORM_DELAY, true);
}

function timer(event) {
    var npc = event.npc;
    var display = DBCAPI.getDBCDisplay(npc);

    switch(event.id) {
        case(SWITCH_FORM):
            if (display == null) return;

            // Set DBCDisplay to visible and change form based on state
            display.setEnabled(true);
            if(isSSG) display.transform(DBCAPI.getForm(SSBFormName)) // Switch to SSB
            else display.transform(DBCAPI.getForm(SSGFormName)); // Switch to SSG
            npc.updateClient();

            // Allow for transformation delay before changing flag
            npc.timers.forceStart(FLAG_SWITCH, FLAG_SWITCH_DELAY, false);
            break;
        
        case(SWITCH_DELAY):
            isSSG = !isSSG;
            break;
    }
}

function damaged(event) {
    var npc = event.npc
    var player = event.source;
    if(player && player.getType() == 1) player.getDBCPlayer().getCurrentForm()
    var dbcPlayer = player.getDBCPlayer()
    var currentForm = dbcPlayer.getForm()

    if ((isSSG && currentForm == DBCAPI.getForm(SSGFormName).getId()) || (!isSSG && currentForm != 10)) {
        event.setCanceled(true) // Prevent damage if the player’s form does not match the NPC’s form
        if(!npc.getTimers().has(3)) {
          npc.say("You can't harm me in this form!")
          npc.getTimers().forceStart(SPAM_PREVENTION, 40, false)
        }
    }
}

function reset(event) {
    var npc = event.npc
    var display = DBCAPI.getDBCDisplay(npc)
    var setGod = DBCAPI.getForm("[NPC] SSG")
    var ti = npc.getTimers()
    
    npc.setHealth(npc.getMaxHealth())

    display.setEnabled(true)

    display.transform(setGod)

    npc.updateClient()

    isSSG = true
    
    ti.stop(1)
    ti.stop(2)
    ti.stop(3)
    
}

function killed(event) {
    reset(event)
}

function targetLost(event) {
    var world = event.getNpc().getWorld()
    var npc = event.getNpc()
    if(world.getClosestVulnerablePlayer(npc.getPosition(),50.0) == null) {
        reset(event)
    }
}

function kills(event) {
    reset(event)
}