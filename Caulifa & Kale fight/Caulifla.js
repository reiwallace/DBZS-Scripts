// Changeables
var kaleName = "Kale"; // Name of accompanying kale npc
var abilityInterval = 100; // Time between abilities in ticks

var KALE;
var TARGET;
var TO_RESET;

// Timers
var CHOOSE_ABILITY = 0;

function init(event) {
    var npc = event.npc;
    var search = npc.getSurroundingEntities(40,2); // Search for kale
    for(i = 0; i < search.length; i++) {
        if(search[i].getName() == kaleName) {
            KALE = search[i];
            break;
        }
    }
}

function timer(event) {
    var npc = event.npc;
    switch(event.timer) {
        case(CHOOSE_ABILITY):
            chooseAbility(npc);
            break;
    }
}

function meleeAttack(event)
{ // Set target and begin reset timer on swing
    var npc = event.npc;
    TARGET = npc.getAttackTarget();
    DBC_TARGET = TARGET.getDBCPlayer();
    npc.timers.forceStart(10, npc.getTempData("Reset Time"), false); // Reset if doesn't melee a target for set time
    if(TO_RESET.indexOf(TARGET) < 0) { // Add reset targets if not in array already
        TO_RESET.push(TARGET);
    }
    if(!npc.timers.has(CHOOSE_ABILITY)) {
        npc.timers.forceStart(CHOOSE_ABILITY, abilityInterval, true); // Start ability timer
    }
}