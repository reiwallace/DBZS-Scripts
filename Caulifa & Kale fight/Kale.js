// Changeables
var cauliflaName = "Caulifla"; // Name of accompanying kale npc

var CAULIFLA;
var TARGET;

function init(event) {
    var npc = event.npc;
    var search = npc.getSurroundingEntities(40,2); // Search for kale
    for(i = 0; i < search.length; i++) {
        if(search[i].getName() == cauliflaName) {
            CAULIFLA = search[i];
            break;
        }
    }
}