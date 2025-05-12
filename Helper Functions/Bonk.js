var target;
var DBCTarget;

function bonk(e, motionX, motionY, motionZ) { // Bonk target in direction
    target = e.getPlayer();
    if(target != null) {
        DBCTarget = target.getDBCPlayer();
        if(DBCTarget.isTurboOn()) {
            DBCTarget.setTurboState(false); // Disable turbo to allow for maximum bonkage
            e.npc.timers.forceStart(0, 10, false); // Renable turbo after timer
        }
    }
    target.setMotion(motionX, motionY, motionZ);
}

function timer(e) {
    var id = e.id;
    if(id == 0 && DBCTarget != null) {
        DBCTarget.setTurboState(true); // Renable turbo
    }
}