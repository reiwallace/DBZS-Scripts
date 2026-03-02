/** playerSkillGui.js
 *  Handles z sword skill gui
 */

// Button config
var highlightOuter = 8385016;
var highlightInner = 6281182;
var firstQuest = 3269;

// Auto sheathe config
var zSwordLinkedId = 29;

// Don't edit
var LOOP_BREAK_TIMER = 912;
var RESET_TIMER = 329;
var oldIds = [];
var keyDown = 0;
var keyUp = 1;
var successful = 0;
var openWithZS = false;

// -----------------------------------------------------------------------
//                      GUI
// -----------------------------------------------------------------------

function keyPressed(event) {
    // Modified lib function to return z sword slot
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

    // Checks double clicking slot for menu opening
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

// Handle GUI interactions
function customGuiButton(event) {
    var gui = event.gui;
    if(gui.getID() < 301 || gui.getID() > 304) return;

    var buttonId = event.id;
    var player = event.player;
    var button = gui.getComponent(buttonId);
    if(!player.hasTempData("zSwordFunctions")) return;

    // Remove upgrade menu labels
    gui.removeComponent(65);
    gui.removeComponent(64);

    // Remove selection box if a button is already selected or add selection box
    if(buttonId < 50) {
        try {
            // If another button is clicked
            if(gui.getComponent(101).getPosX() - 1 != button.getPosX() || gui.getComponent(101).getPosY() - 1 != button.getPosY()){
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
    } else if(buttonId == 61) {
        player.closeGui();
        
        if(gui.getID() == 302) 
            player.getTempData("zSwordFunctions").displaySkillMenu(player);
        else
            player.getTempData("zSwordFunctions").upgradeFuncs.menu(player, 0);
    } else if(buttonId == 62) {
        player.closeGui();
        if(gui.getID() == 301) 
            player.getTempData("zSwordFunctions").displayHeavyMenu(player);
        else
            player.getTempData("zSwordFunctions").upgradeFuncs.menu(player, 1);
    } else if(buttonId == 59) {
        if(!player.hasTempData("selectedUpgrade")) return;
        player.getTempData("zSwordFunctions").upgradeFuncs.handleUpgradeResponse(player, gui);
        return;
    }

    try {
        // Check if player has a skill selected
        gui.getComponent(101);
        if(buttonId > 54) return;
        var selectedId = player.hasTempData("selectedButton") ? player.getTempData("selectedButton") : 1;
        switch(gui.getID()) {
            case 301:
                player.getTempData("zAbilityHandler").selectSkill(selectedId, buttonId - 50, gui);
                break;

            case 302:   
                player.getTempData("zSwordFunctions").selectHeavyAttack(player, selectedId, gui);
                break;

            case 303:
                player.setTempData("selectedUpgrade", player.getTempData("selectedButton"));
                player.getTempData("zSwordFunctions").upgradeFuncs.setUpgradeTexture(gui, 0, selectedId, player);
                break;

            case 304:
                player.setTempData("selectedUpgrade", player.getTempData("selectedButton"));
                player.getTempData("zSwordFunctions").upgradeFuncs.setUpgradeTexture(gui, 1, selectedId, player);
                break;
        }
        removeSelectBox(gui);
        player.removeTempData("selectedButton");
        gui.update(player);
    } catch(err) {}
}

// Remove selection when closing gui
function customGuiClosed(event)
{
    if(event.gui.getID() != 301) return;
    var player = event.player
    if(player.hasTempData("zAbilityHandler")) 
        player.getTempData("zAbilityHandler").addSkillLore();
    player.removeTempData("selectedButton");
    player.removeTempData("selectedUpgrade");
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

// -----------------------------------------------------------------------
//                      EVENT HANDLING
// -----------------------------------------------------------------------

function attack(event) { if(event.player.hasTempData("zAbilityHandler")) event.player.getTempData("zAbilityHandler").handleEvent("attack"); }
function damaged(event) { if(event.player.hasTempData("zAbilityHandler")) event.player.getTempData("zAbilityHandler").handleEvent("damaged"); }
function died(event) { if(event.player.hasTempData("zAbilityHandler")) event.player.getTempData("zAbilityHandler").handleEvent("died"); }
function kills(event) { if(event.player.hasTempData("zAbilityHandler")) event.player.getTempData("zAbilityHandler").handleEvent("kills"); }
function jump(event) { if(event.player.hasTempData("zAbilityHandler")) event.player.getTempData("zAbilityHandler").handleEvent("jump"); }

// -----------------------------------------------------------------------
//                      AUTO SHEATHE & RESET
// -----------------------------------------------------------------------

// Re-sheathe Z Sword on login
function login(event) 
{
    var player = event.player;
    if(lib.removeZSword(player)) lib.giveZSword(player);
}

// Re-sheathe Z Sword on slot change
function profileChange(event) 
{
    var player = event.player;
    if(lib.removeZSword(player)) lib.giveZSword(player);
}

// Delete data for new profile when created
function profileCreate(event)
{
    if(!event.isPost()) 
        for(var id in event.getProfile().getSlots()) oldIds.push(id);                 
    else if(event.isPost()) {
        for(var slot in event.getProfile().getSlots()) if(oldIds.indexOf(slot) == -1) obliterateData(event.player, slot);
        oldIds = [];
    }                                                          
}

// Delete data for old profile when removed
function profileRemove(event)
{
    if(!event.isPost()) 
        for(var id in event.getProfile().getSlots()) oldIds.push(id);                 
    else if(event.isPost()) {
        var newIds = [];
        for(var id in event.getProfile().getSlots()) newIds.push(id);  
        for(var id in oldIds) if(newIds.indexOf(oldIds[id]) == -1) obliterateData(event.player, oldIds[id]);
        oldIds = [];
    }                                                          
}

/** Removes all slot specific data
 * @param {IPlayer} player 
 * @param {Int} slot 
 */
function obliterateData(player, slot)
{
    var storedDataKeys = ["zSwordUpgradePoints", "zSwordSkillUpgrade", "zSwordHeavyUpgrade", "zSwordActive1", "zSwordActive2", "zSwordPassive1", "zSwordPassive2", "zSwordHeavy"];
    for(var key in storedDataKeys) 
        player.removeStoredData(slot + storedDataKeys[key]);
    player.sendMessage("Z Sword data for slot " + slot + " successfully cleaned.")
}


// Check if player has z sword when opening a container
function containerOpen(event) {
    if(event.getContainer() == null) return;
    var player = event.player;
    var timers = player.timers;
    // Timer to prevent looping function
    if(timers.has(LOOP_BREAK_TIMER)) {
        timers.forceStart(LOOP_BREAK_TIMER, 3, false);
        return;
    }
    timers.forceStart(LOOP_BREAK_TIMER, 3, false);
    openWithZS = lib.hasZSword(player);
    container = event.getContainer();
}

function timer(event) {
    if(event.id == RESET_TIMER) successful = 0; 
    if(event.id != 911 || !container) return;
    var player = event.player;
    var closeWithZS = lib.hasZSword(player);
    if(openWithZS == closeWithZS) return;
    // Z Sword has been put into chest
    else if(openWithZS && !closeWithZS) {
        var inv = container.getItems();
        for (var i in inv) {
            var item = inv[i]
            if(item && item.getClass().toString().equals("class noppes.npcs.scripted.item.ScriptLinkedItem")) {
                if(item.getLinkedItem().getId() != zSwordLinkedId) continue;
                container.setSlot(i, null)
            }
        }
    } 
    // Z Sword has been taken from chest
    else if(!openWithZS && closeWithZS) {
        lib.removeZSword(player);
    }
}

// -----------------------------------------------------------------------
//                      CHAT COMMANDS
// -----------------------------------------------------------------------

function chat(event) {
    if(!event.getMessage().startsWith(".zsword")) return;
    function help(player) {
        player.sendMessage("&6--- Z Sword commands ---&r");
        player.sendMessage("&eSummon&r: Summons your Z Sword");
        player.sendMessage("&eKeybind&r: Rebind or Check Z Sword keybinds");
    }

    var chatBinds = ["skill1", "skill2"]
    var bindData = ["zSwordActive1Key", "zSwordActive2Key"]

    event.setCancelled(true);
    var player = event.player;
    var split = event.getMessage().split(" ");
    if(split.length < 2) {
        help(player);
        return;
    }
    if(!player.hasFinishedQuest(firstQuest)) {
        player.sendMessage("You haven't unlocked that yet, dummy!");
        return;
    }
    switch(split[1]) {
        case "summon":
            if(lib.hasZSword(player)) 
                player.sendMessage("You already have a Z Sword!");
            else 
                lib.giveZSword(player);
            break;
        case "help":
            help(player);
            break;

        case "keybind":
            if(split.length < 4 || (split[2] != "check" && split[2] != "rebind") || chatBinds.indexOf(split[3]) == -1) {
                player.sendMessage("&cInvalid Format");
                player.sendMessage(".zsword keybind rebind <bind> <key>");
                player.sendMessage(".zsword keybind check <bind>");
                player.sendMessage("Available Binds: " + chatBinds.join(", "));
            } else if(split[2] == "check") {
                var currentBind = player.getStoredData(bindData[chatBinds.indexOf(split[3])]);
                if(!currentBind && split[3] == "skill1")
                    currentBind = "41";
                else if(!currentBind && split[3] == "skill2")
                    currentBind = "58";
                player.sendMessage(split[3] + " keybind: " + keyNums[currentBind]);
            } else if(split[2] == "rebind" && split.length < 5) {
                player.sendMessage("&cInvalid Format");
                player.sendMessage(".zsword keybind rebind <bind> <key>");
            } else if(split[2] == "rebind") {
                var key = split[4].toUpperCase();
                if(key in keys){
                    player.setStoredData(bindData[chatBinds.indexOf(split[3])], keys[key]);
                    player.sendMessage("&aSuccessfully bound " + split[3] + " to " + key + "!&r");
                } else{
                    player.sendMessage("&cInvalid key");
                }
            }
            break;

        default:
            player.sendMessage("&cNo such command: " + split[1]);
            player.sendMessage("Try '.zsword help' for a list of commands.");
            break;
    }
}

// For keybinding
var keys = {
    "NONE": "0",
    "ESCAPE": "1",
    "1": "2",
    "2": "3",
    "3": "4",
    "4": "5",
    "5": "6",
    "6": "7",
    "7": "8",
    "8": "9",
    "9": "10",
    "0": "11",
    "MINUS": "12",
    "EQUALS": "13",
    "BACK": "14",
    "TAB": "15",
    "Q": "16",
    "W": "17",
    "E": "18",
    "R": "19",
    "T": "20",
    "Y": "21",
    "U": "22",
    "I": "23",
    "O": "24",
    "P": "25",
    "LBRACKET": "26",
    "RBRACKET": "27",
    "RETURN": "28",
    "LCONTROL": "29",
    "A": "30",
    "S": "31",
    "D": "32",
    "F": "33",
    "G": "34",
    "H": "35",
    "J": "36",
    "K": "37",
    "L": "38",
    "SEMICOLON": "39",
    "APOSTROPHE": "40",
    "GRAVE": "41",
    "LSHIFT": "42",
    "BACKSLASH": "43",
    "Z": "44",
    "X": "45",
    "C": "46",
    "V": "47",
    "B": "48",
    "N": "49",
    "M": "50",
    "COMMA": "51",
    "PERIOD": "52",
    "SLASH": "53",
    "RSHIFT": "54",
    "MULTIPLY": "55",
    "LMENU": "56",
    "SPACE": "57",
    "CAPS": "58",
    "F1": "59",
    "F2": "60",
    "F3": "61",
    "F4": "62",
    "F5": "63",
    "F6": "64",
    "F7": "65",
    "F8": "66",
    "F9": "67",
    "F10": "68",
    "NUMLOCK": "69",
    "SCROLL": "70",
    "NUMPAD7": "71",
    "NUMPAD8": "72",
    "NUMPAD9": "73",
    "SUBTRACT": "74",
    "NUMPAD4": "75",
    "NUMPAD5": "76",
    "NUMPAD6": "77",
    "ADD": "78",
    "NUMPAD1": "79",
    "NUMPAD2": "80",
    "NUMPAD3": "81",
    "NUMPAD0": "82",
    "DECIMAL": "83",
    "F11": "87",
    "F12": "88",
    "F13": "100",
    "F14": "101",
    "F15": "102",
    "F16": "103",
    "F17": "104",
    "F18": "105",
    "KANA": "112",
    "F19": "113",
    "CONVERT": "121",
    "NOCONVERT": "123",
    "YEN": "125",
    "NUMPADEQUALS": "141",
    "CIRCUMFLEX": "144",
    "AT": "145",
    "COLON": "146",
    "UNDERLINE": "147",
    "KANJI": "148",
    "STOP": "149",
    "AX": "150",
    "UNLABELED": "151",
    "NUMPADENTER": "156",
    "RCONTROL": "157",
    "SECTION": "167",
    "NUMPADCOMMA": "179",
    "DIVIDE": "181",
    "SYSRQ": "183",
    "RMENU": "184",
    "FUNCTION": "196",
    "PAUSE": "197",
    "HOME": "199",
    "UP": "200",
    "PRIOR": "201",
    "LEFT": "203",
    "RIGHT": "205",
    "END": "207",
    "DOWN": "208",
    "NEXT": "209",
    "INSERT": "210",
    "DELETE": "211",
    "CLEAR": "218",
    "LMETA": "219",
    "RMETA": "220",
    "APPS": "221",
    "POWER": "222",
    "SLEEP": "223"
};

var keyNums = {
    "0" : "NONE",
    "1" : "ESCAPE",
    "2" : "1",
    "3" : "2",
    "4" : "3",
    "5" : "4",
    "6" : "5",
    "7" : "6",
    "8" : "7",
    "9" : "8",
    "10" : "9",
    "11" : "0",
    "12" : "MINUS",
    "13" : "EQUALS",
    "14" : "BACK",
    "15" : "TAB",
    "16" : "Q",
    "17" : "W",
    "18" : "E",
    "19" : "R",
    "20" : "T",
    "21" : "Y",
    "22" : "U",
    "23" : "I",
    "24" : "O",
    "25" : "P",
    "26" : "LBRACKET",
    "27" : "RBRACKET",
    "28" : "RETURN",
    "29" : "LCONTROL",
    "30" : "A",
    "31" : "S",
    "32" : "D",
    "33" : "F",
    "34" : "G",
    "35" : "H",
    "36" : "J",
    "37" : "K",
    "38" : "L",
    "39" : "SEMICOLON",
    "40" : "APOSTROPHE",
    "41" : "GRAVE",
    "42" : "LSHIFT",
    "43" : "BACKSLASH",
    "44" : "Z",
    "45" : "X",
    "46" : "C",
    "47" : "V",
    "48" : "B",
    "49" : "N",
    "50" : "M",
    "51" : "COMMA",
    "52" : "PERIOD",
    "53" : "SLASH",
    "54" : "RSHIFT",
    "55" : "MULTIPLY",
    "56" : "LMENU",
    "57" : "SPACE",
    "58" : "CAPS",
    "59" : "F1",
    "60" : "F2",
    "61" : "F3",
    "62" : "F4",
    "63" : "F5",
    "64" : "F6",
    "65" : "F7",
    "66" : "F8",
    "67" : "F9",
    "68" : "F10",
    "69" : "NUMLOCK",
    "70" : "SCROLL",
    "71" : "NUMPAD7",
    "72" : "NUMPAD8",
    "73" : "NUMPAD9",
    "74" : "SUBTRACT",
    "75" : "NUMPAD4",
    "76" : "NUMPAD5",
    "77" : "NUMPAD6",
    "78" : "ADD",
    "79" : "NUMPAD1",
    "80" : "NUMPAD2",
    "81" : "NUMPAD3",
    "82" : "NUMPAD0",
    "83" : "DECIMAL",
    "87" : "F11",
    "88" : "F12",
    "100" : "F13",
    "101" : "F14",
    "102" : "F15",
    "103" : "F16",
    "104" : "F17",
    "105" : "F18",
    "112" : "KANA",
    "113" : "F19",
    "121" : "CONVERT",
    "123" : "NOCONVERT",
    "125" : "YEN",
    "141" : "NUMPADEQUALS",
    "144" : "CIRCUMFLEX",
    "145" : "AT",
    "146" : "COLON",
    "147" : "UNDERLINE",
    "148" : "KANJI",
    "149" : "STOP",
    "150" : "AX",
    "151" : "UNLABELED",
    "156" : "NUMPADENTER",
    "157" : "RCONTROL",
    "167" : "SECTION",
    "179" : "NUMPADCOMMA",
    "181" : "DIVIDE",
    "183" : "SYSRQ",
    "184" : "RMENU",
    "196" : "FUNCTION",
    "197" : "PAUSE",
    "199" : "HOME",
    "200" : "UP",
    "201" : "PRIOR",
    "203" : "LEFT",
    "205" : "RIGHT",
    "207" : "END",
    "208" : "DOWN",
    "209" : "NEXT",
    "210" : "INSERT",
    "211" : "DELETE",
    "218" : "CLEAR",
    "219" : "LMETA",
    "220" : "RMETA",
    "221" : "APPS",
    "222" : "POWER",
    "223" : "SLEEP"
}