var successAnimation = "KafizzleSword";
var successMessage = "&aSuccess!";

var GUI_ID = 72;
var BUTTON_ID = 72;
function customGuiButton(e) {
    var id = e.getGui().getID();
    var button = e.getId();
    if (id == GUI_ID && button == BUTTON_ID) {
        var player = e.getPlayer();
        var area = player.getSurroundingEntities(100, 2);
        for (var i = 0; i < area.length; i++) {
            npc = area[i];
            npc.setTempData("countered", 1);
        }
        doAnimation(player, successAnimation);
        player.sendMessage(successMessage);
        player.closeGui();
    }
}
function login(e) {
    var player = e.getPlayer()
    player.getOverlays().clear() // Clears all overlays on login
}

/** 
 * @param {IPlayer} player - Player who plays the animation
 * @param {string} name - Name of the animation
 */
function doAnimation(player, name) { // Executes animations
    var anim = API.getAnimations().get(name);
    var animData = player.getAnimationData();
    animData.setEnabled(true);
    animData.setAnimation(anim);
    animData.updateClient();
}