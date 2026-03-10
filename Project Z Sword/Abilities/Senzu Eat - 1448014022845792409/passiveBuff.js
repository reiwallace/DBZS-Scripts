function onEffectTick(event) {
    var dbcPlayer = event.getPlayer().getDBCPlayer();
    var amount = event.player.getTempData("senzuPassiveData")[parseInt(event.getEffect().getLevel())].stam;
    dbcPlayer.setStamina(dbcPlayer.getStamina() + amount);
}

function onEffectRemove(event) {
    event.player.removeTempData("senzuPassiveData");
}
