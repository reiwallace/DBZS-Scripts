function init(event) {
    event.npc.timers.forceStart(1, 20, true);
}

function timers(event) {
    var npc = event.npc;
    var nearby = npc.getSurroundingEntities(6, 1);
    for(var entity in nearby) {
        entity = nearby[entity];
        if(!lib.isValidPlayer(entity)) return;
        var dbcEntity = entity.getDBCPlayer();
        dbcEntity.setBody(dbcEntity.getMaxBody() - dbcEntity.getMaxBody() * 0.1);
    }
}





