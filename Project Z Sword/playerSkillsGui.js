/** playerSkillGui.js
 *  Handles z sword skill gui
 */

var highlightOuter = 8385016;
var highlightInner = 6281182;

// Don't edit
var RESET_TIMER = 329;
var keyDown = 0;
var keyUp = 1;
var successful = 0;

function keyPressed(event) {
    function findZSwordSlot(player)
    {
        var inv = player.getInventory();
        for (var ite in inv) {
            var item = inv[ite]
            if(item && item.getClass().toString().equals("class noppes.npcs.scripted.item.ScriptLinkedItem")) {
                if(item.getLinkedItem().getId() != 29) return;
                return ite;
            }
        }
    }

    var player = event.player;
    if(!event.keyDown()) keyDown = event.getKey();
    else {
        keyUp = event.getKey();
        zSlot = findZSwordSlot(player);
        if(zSlot && keyUp == keyDown && keyUp == zSlot + 2) {
            if(successful == 0) {
                successful +=1
                player.timers.forceStart(RESET_TIMER, 20, false);
            } else {
                if(player.getHeldItem().getTag("sheathed") == "true" || !player.hasTempData("zSwordFunctions")) return;
                player.getTempData("zSwordFunctions").displaySkillMenu(player);
            }
        }
        keyDown = 0;
    }

}

function timer(event) {
    if(event.id == RESET_TIMER) successful = 0; 
}

// Add keybind support for mouse keys
function mouseClicked(event) {
    var button = event.getButton();
    var player = event.player;
    var playerKeybind = player.getStoredData("zSwordGuiKey");

    if(button + 1000 != playerKeybind || !lib.holdingZSword(player)) return;
    if(player.getHeldItem().getTag("sheathed") == "true" || !player.hasTempData("zSwordFunctions")) return;

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

// Remove selection when closing gui
function customGuiClosed(event)
{
    event.player.removeTempData("selectedButton");
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

function damaged(event) { if(event.player.hasTempData("zAbilityHandler")) event.player.getTempData("zAbilityHandler").handleEvent("damaged"); }
function died(event) { if(event.player.hasTempData("zAbilityHandler")) event.player.getTempData("zAbilityHandler").handleEvent("died"); }
function kills(event) { if(event.player.hasTempData("zAbilityHandler")) event.player.getTempData("zAbilityHandler").handleEvent("kills"); }
function jump(event) { if(event.player.hasTempData("zAbilityHandler")) event.player.getTempData("zAbilityHandler").handleEvent("jump"); }