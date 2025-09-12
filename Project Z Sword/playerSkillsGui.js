var highlightOuter = 8385016;
var highlightInner = 6281182;

// Keybind checking for keyboard keys
function keyPressed(event) {
    var key = event.getKey();
    var player = event.player;
    var playerKeybind = player.getStoredData("zSwordGuiKey");
    var keybind = playerKeybind ? playerKeybind : 49;  

    if(key != keybind || !lib.holdingZSword(player)) return;
    if(player.getHeldItem().getTag("sheathed") == "true") return;

    player.getTempData("zSwordFunctions").displaySkillMenu(player);
}

// Add keybind support for mouse keys
function mouseClicked(event) {
    var button = event.getButton();
    var player = event.player;
    var playerKeybind = player.getStoredData("zSwordGuiKey");

    if(button + 1000 != playerKeybind || !lib.holdingZSword(player)) return;
    if(player.getHeldItem().getTag("sheathed") == "true") return;

    player.getTempData("zSwordFunctions").displaySkillMenu(player);
}

// Handle GUI interactions
function customGuiButton(event) {
    var gui = event.gui;
    if(gui.getID() != 301) return;

    var buttonId = event.id;
    var player = event.player;
    var button = gui.getComponent(buttonId);

    // Remove selection box if a button is already selected or add selection box
    if(buttonId < 50) {
        try {
            // If another button is clicked
            if(gui.getComponent(101).getPosX() != button.getPosX() || gui.getComponent(101).getPosY() != button.getPosY()){
                removeSelectBox(gui);
                buildSelectBox(gui, button);
                player.setTempData("selectedButton", buttonId);
            } else {
                removeSelectBox(gui);
            }
        } catch(err) {
                buildSelectBox(gui, button);
                player.setTempData("selectedButton", buttonId);
        }
        gui.update(player);
        return;
    } 

    try {
        // Check if player has a skill selected
        gui.getComponent(101);
        if(buttonId > 54 || !player.getTempData("selectedButton")) return;
        player.getTempData("zSwordFunctions").select(player, player.getTempData("selectedButton"), buttonId - 50, gui);

        removeSelectBox(gui);
        player.removeTempData("selectedButton");
        gui.update(player);
    } catch(err) {}
}

/** Builds a selection box out of Ilines
 * @param {ICustomGui} gui 
 * @param {IButton} button Button to use position of
 */
function buildSelectBox(gui, button)
{
    var buttonX = button.getPosX();
    var buttonY = button.getPosY();
    var buttonWidth = button.getWidth() - 1;
    var coordsOuter = {
        initialX : [buttonX + 1, buttonX, buttonX + buttonWidth + 1,  buttonX + buttonWidth],
        initialY : [buttonY + 1, buttonY + 1, buttonY + buttonWidth, buttonY + buttonWidth],
        endX : [buttonX + buttonWidth, buttonX, buttonX + buttonWidth + 1, buttonX + 1],
        endY : [buttonY + 1, buttonY + buttonWidth, buttonY + 1, buttonY + buttonWidth]
    }
    for(var i = 0; i < 4; i++) {
        gui.addLine(101 + i, coordsOuter.initialX[i], coordsOuter.initialY[i], coordsOuter.endX[i], coordsOuter.endY[i], highlightOuter, 1);
    }
    var coordsInner = {
        initialX : [buttonX + 1, buttonX + 1, buttonX + buttonWidth,  buttonX + buttonWidth],
        initialY : [buttonY + 2, buttonY + 2, buttonY + buttonWidth - 1, buttonY + buttonWidth - 1],
        endX : [buttonX + buttonWidth, buttonX + 1, buttonX + buttonWidth, buttonX + 1],
        endY : [buttonY + 2, buttonY + buttonWidth - 1, buttonY + 1, buttonY + buttonWidth - 1]
    }
    for(var i = 0; i < 4; i++) {
        gui.addLine(105 + i, coordsInner.initialX[i], coordsInner.initialY[i], coordsInner.endX[i], coordsInner.endY[i], highlightOuter - 10000, 1);
    }
}

/** Removes lines part of the selection box
 * @param {ICustomGui} gui 
 */
function removeSelectBox(gui)
{
    for(var i = 0; i < 8; i++) {
        gui.removeComponent(101 + i);
    }
}