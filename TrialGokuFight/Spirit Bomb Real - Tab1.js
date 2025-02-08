var chase = false;

function init(event) {
    var n = event.npc;
    n.setSize(8);
    n.timers.forceStart(0, 20, true);
    n.timers.forceStart(1, 400, false);
    n.timers.forceStart(2, 1, true);
    n.timers.forceStart(3, 220, false);
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
    } else if(id == 3) { // Mechanic fail
        chase = true;
        n.setSpeed(50);
        n.setFly(1);
        n.setFlySpeed(50);
        n.setMeleeStrength(100000);
        n.setMeleeSpeed(1);
    }
}

function meleeSwing(event) { // Despawn on hit
    if(chase) {
        event.npc.despawn();
    }
}
