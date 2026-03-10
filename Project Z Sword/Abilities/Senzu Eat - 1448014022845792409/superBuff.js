function onEffectTick(event) {
    var dbcPlayer = event.getPlayer().getDBCPlayer();
    var amount = event.player.getTempData("senzuSuperData")[parseInt(event.getEffect().getLevel())].ki;
    dbcPlayer.setKi(dbcPlayer.getKi() + amount);
}

function onEffectRemove(event) {
    event.player.removeTempData("senzuSuperData");
}
