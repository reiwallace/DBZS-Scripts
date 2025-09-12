// Check key inputs for ability keybinds
function keyPressed(event) {
    if(!event.keyDown()) return;
    var key = event.getKey();
    var player = event.player;
    // Save player chosen keybind or default of caps lock
    var playerActive1 = player.getStoredData("zSwordActive1Key");
    var active1Keybind = playerActive1 ? playerActive1 : 41;  
    var playerActive2 = player.getStoredData("zSwordActive2Key");
    var active2Keybind = playerActive2 ? playerActive2 : 58;  
    var activeSlot = active1Keybind == key ? 1 : active2Keybind == key ? 2 : null;

    if((key == active1Keybind || key == active2Keybind) && lib.holdingZSword(player)) {
        if(player.getHeldItem().getTag("sheathed") == "true") return;
        player.getTempData("zSwordFunctions").active(player, activeSlot);
    }
}

// Add keybind support for mouse keys
function mouseClicked(event) {
    // HEAVY ATTACK NYI
}