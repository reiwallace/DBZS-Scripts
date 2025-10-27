var scytheGuiId = 227;
var upgradeButtonId = 3;
var goonButtonId = 4;

function customGuiSlotClicked(event) {
    if(event.getGui().getID() == scytheGuiId) event.setCancelled(true);
}

function customGuiButton(event) {
    var gui = event.getGui();
    var button = gui.getComponent(event.id);
    var player = event.player;
    if(event.getGui().getID() != scytheGuiId || !lib.isPlayer(player)) return;
    if(button.getID() == upgradeButtonId) {
        if(!player.hasTempData("scytheUpgradeFunctions")) return;
        player.getTempData("scytheUpgradeFunctions").apply(player, player.getHeldItem(), player.getTempData("scytheUpgradeFunctions").upgrades);
    } else if(button.getID() == goonButtonId) {
        if(!scytheNpc) return;
        player.interactWith(scytheNpc);
    }   
}