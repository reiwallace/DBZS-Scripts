// upgradeGuiPlayer.js
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB
// AUTHOR: Noxie

var scytheGuiId = 227;
var upgradeButtonId = 3;
var goonButtonId = 4;

var upgradeSound = API.createSound("minecraft:random.anvil_use");
var failSound = API.createSound("minecraft:random.anvil_land");
var goonSound = API.createSound("customnpcs:human.girl.villager.heh");

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
        if(player.getTempData("scytheUpgradeFunctions").upgrades.length > 0) {
            player.closeGui();
            upgradeSound.setPosition(player.getPosition());
            API.playSound(upgradeSound);
        } else {
            failSound.setPosition(player.getPosition());
            API.playSound(failSound);
        }
    } else if(button.getID() == goonButtonId) {
        if(!scytheNpc) return;
        player.interactWith(scytheNpc);
        goonSound.setPosition(player.getPosition());
        API.playSound(goonSound);
    }   
}