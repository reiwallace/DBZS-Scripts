//CONFIG
var UPDATE_FORM_DELAY = 10; // Number of ticks from starting aura to updating form
var DISABLE_AURA_DELAY = 20; // Number of ticks from starting aura to disabling aura (generally around 10 after updating form looks good)
var ASCEND_SOUND = "npcdbc:transformationSounds.GodAscend";

// TIMERS
var QUICK_SWAP = 51;
var UPDATE_FORM = 52;
var DISABLE_AURA = 53;

// DON'T EDIT
var form;

function timer(event) {
    var npc = event.npc;
    var display = DBCAPI.getDBCDisplay(npc);
    switch(event.id) {
        case(UPDATE_FORM):
            changeForm(npc, form)
            break;
            
        case(DISABLE_AURA):
            display.toggleAura(false);
            npc.updateClient();
            break;
    }
}

/** Starts a quick swap to another custom form
 * @param {ICustomNpc} npc - Npc transforming
 * @param {String or IForm} form - Form to transform into
 */
function beginQuickswap(npc, form)
{
    if(!form || !npc) return;
    var display = DBCAPI.getDBCDisplay(npc);
    // Enable aura
    display.setAura(aura);
    display.toggleAura(true);
    npc.updateClient();
    form = form;
    
    // Start timers
    npc.timers.forceStart(UPDATE_FORM, UPDATE_FORM_DELAY, false);
    npc.timers.forceStart(DISABLE_AURA, DISABLE_AURA_DELAY, false);
}

/** Changes npc's form and plays ascend sound
 * @param {ICustomNpc} npc - Npc transforming
 * @param {String or IForm} form - Form to transform into
 */
function changeForm(npc, form) 
{
    if(!form || !npc) return;
    var display = DBCAPI.getDBCDisplay(npc);

    // Set form and play ascend sound
    display.setForm(form);
    npc.playSound("npcdbc:transformationSounds.GodAscend", 0.3, 1);
    npc.updateClient();
}
