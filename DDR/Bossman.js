var silhouettes = new Array();

function init(e) {
    var npc = e.npc;
    silhouettes = npc.getSurroundingEntities(20,2); // Find nearby npcs
    for(i = 0; i < silhouettes.length; i++) { // Remove npcs that aren't silhouettes
        if(silhouettes[i].getName() != "Silhouette" && silhouettes[i] != null) {
            silhouettes.splice(i, 1);
        }
    }

}