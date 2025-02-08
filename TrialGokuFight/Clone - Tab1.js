function init(event) { // Start despawn timer
    var n = event.npc;
    n.timers.forceStart(0, 300, false);
}

function killed(event) { // Despawn clone and associated bomb on killed
    var n = event.npc;
    event.npc.despawn();
    var search = n.getSurroundingEntities(2,2);     
    for(i = 0; i < search.length; i++) {
        if(search[i].getName() == "Spirit Bomb") {
            search[i].despawn();
            break;
        }
    }
}

function timer(event) { // Despawn failsafe
    var n = event.npc;
    var id = event.id;
    if(id == 0) {
        n.despawn();
    }
}
