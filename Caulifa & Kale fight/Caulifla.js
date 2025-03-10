// Changeables
var kaleName = "Kale"; // Name of accompanying kale npc

var KALE;
var TARGET;

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

function decideTargets(npc) {

}

function setTarget(npc, target) {
    npc.setAttackTarget(target);
}