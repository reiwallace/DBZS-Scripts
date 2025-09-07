function tick(event) {
    var player = event.player;
    if(player.hasTempData("hasZSword")) return;
    var inv = player.getInventory();
    for (var item in inv) {
        if(inv[item] && inv[item].getClass().toString().equals("class noppes.npcs.scripted.item.ScriptLinkedItem")) {
        
        player.setTempData("hasZSword", true);
        break;
        }
    }
}