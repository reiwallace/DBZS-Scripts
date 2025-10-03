function init(event) {
    var n = event.npc;
    n.setSize(8);
    n.timers.forceStart(0, 20, true);
    n.timers.forceStart(1, 300, false);
    n.timers.forceStart(2, 1, true);
}

function timer(event) {
    var n = event.npc;
    var id = event.id;
    if(n.getSize() < 40 && id == 0) { // Grow bomb
        n.setSize(n.getSize() + 3);
    } else if(id == 1) { // Despawn failsafe
        n.despawn();
    } else if(id == 2) { // Keep bomb floating
        n.setY(60);
    } 
}
