/**  
 * @file scytheUpgradeGui.js
 * @purpose Display and handle input or death scythe upgrade menu
 * @author Noxie, Max
 **/ 
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB

var gui = {
    mainWindow: {
        id: 227,
        width: 240,
        height: 167,
        background: "https://i.ibb.co/6RRH4nrC/Death-Scythe-GUI-Base-Filled1.png"
    },
    ability: {
        width: 18,
        height: 18,
        x: 177,
        y: 113,
        texture: "https://i.ibb.co/wZb8FY0K/zs-GUI-selected.png",
        lock: {
            x: 162,
            y: 100,
            width: 46,
            height: 46,
            texture: "https://i.ibb.co/ZpSmMVTW/zs-GUI-locked.png"
        },
        text: [
            "Skill Name",
            "CD: 1000000",
            "pree cool"
        ]
    },
    itemSlot: {
        x: 177,
        y: 55
    },
    goonButton: {
        width: 94,
        height: 102,
        x: 17,
        y: 62,
        dialogId: 12827
    },
    upgradeButton: {
        width: 18,
        height: 18,
        x: 128,
        y: 83,
        texture: "https://i.ibb.co/b5KWtx1w/upgradebutton.png"
    },
    ids: {
        itemSlot: 1,
        upgradeLabel: 2,
        upgradeButton: 3,
        goonButton: 4,
        ability: 5,
        lock: 6
    }, 
}

var upgradeSound = API.createSound("minecraft:random.anvil_use");
var failSound = API.createSound("minecraft:random.anvil_land");
var goonSound = API.createSound("customnpcs:human.girl.villager.heh");


function keyPressed(event) {
    var player = event.player;
    var item = player.getHeldItem();
    if(lib.isPlayer(player) && item && item.getTag("isDeathScythe") == 1 && event.getKey() == 23) {
        displayUpgradeMenu(player);
    }
}

function customGuiSlotClicked(event) {
    // Stop player from duplicating item
    if(event.getGui().getID() == event.player.getEntityId()) event.setCancelled(true);
}

function customGuiButton(event) {
    var eventGui = event.getGui();
    var button = eventGui.getComponent(event.id);
    var player = event.player;
    if(eventGui.getID() != player.getEntityId() || !lib.isPlayer(player)) return;
    if(button.getID() == gui.ids.upgradeButton) {
        // Upgrade sounds
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
    } else if(button.getID() == gui.ids.goonButton) {
        // Goon Buton
        if(!scytheNpc) return;
        API.executeCommand(player.world, "kam dialog show " + player.getName() + " " + gui.goonButton.dialogId + " Haruna");
        goonSound.setPosition(player.getPosition());
        API.playSound(goonSound);
    }   
}

/** Displays the upgrade window to the player
 * @param {IPlayer} player 
 */
function displayUpgradeMenu(player)
{
    if(!lib.isPlayer(player)) return;
    var weapon = player.getHeldItem()
    if(!weapon) return;
    var availableUpgrades = getUpgrades(player, weapon);
    var upgradeAttributes = getUpgradeAttributes(availableUpgrades);

    var menu = API.createCustomGui(
        player.getEntityId(),
        gui.mainWindow.width, 
        gui.mainWindow.height, 
        false
    );
    menu.addTexturedRect(
        0, 
        gui.mainWindow.background, 
        0, 
        0,
        gui.mainWindow.width, 
        gui.mainWindow.height
    );

    var itemDisplay = menu.addItemSlot(
        gui.ids.itemSlot, 
        gui.itemSlot.x, 
        gui.itemSlot.y, 
        weapon
    );

    var goonButton = menu.addButton(
        gui.ids.goonButton, 
        "", 
        gui.goonButton.x, 
        gui.goonButton.y,
        gui.goonButton.width,
        gui.goonButton.height
    );
    goonButton.setAlpha(0);

    var ability = menu.addTexturedRect(
        gui.ids.ability, 
        gui.ability.texture, 
        gui.ability.x, 
        gui.ability.y, 
        gui.ability.width, 
        gui.ability.height
    );
    if(upgradeAttributes.indexOf("\u00A72Skill Unlock: +1") != -1 || weapon.getTag("skillUnlocked") >= 1) ability.setHoverText(gui.ability.text);
    else menu.addTexturedRect(
        gui.ids.lock, 
        gui.ability.lock.texture, 
        gui.ability.lock.x, 
        gui.ability.lock.y, 
        gui.ability.lock.width, 
        gui.ability.lock.height
    );

    var upgradeButton = menu.addTexturedButton(
        gui.ids.upgradeButton, 
        "", 
        gui.upgradeButton.x, 
        gui.upgradeButton.y, 
        gui.upgradeButton.width, 
        gui.upgradeButton.height, 
        gui.upgradeButton.texture
    );
    if(upgradeAttributes.length > 0) upgradeButton.setHoverText(["\u00A76§lClick to Upgrade!", "\u00A76§lAvailable Upgrades: "].concat(upgradeAttributes).concat("\u00A74§l§uALL UPGRADES ARE ONE TIME!"));
    else upgradeButton.setHoverText(["\u00A76§lNo Available Upgrades"]);

    player.setTempData("scytheUpgradeFunctions", {apply: applyUpgrades, upgrades: availableUpgrades});
    player.showCustomGui(menu);
}

/** Applies all valid upgrades to item
 * @param {IPlayer} player 
 * @param {IItemLinked} item 
 * @param {Object} upgrades 
 */
function applyUpgrades(player, item, upgrades) {
    if(!item || !lib.isPlayer(player) || upgrades.length < 1) return;
    for(var upgrade in upgrades) {
        upgrade = upgrades[upgrade];
        player.setStoredData("s" + lib.getActiveSlotId(player) + "id" + upgrade, 1);
        item.setTag(upgrade, 1);
        item.setTag("update", 1);
    }
}

/** Gets available upgrades from quest and player data
 * @param {IPlayer} player 
 * @param {IItemLinked} item 
 * @returns 
 */
function getUpgrades(player, item) {
    if(!lib.isPlayer(player) || !item) return;
    var availableUpgrades = [];
    for(var quest in scytheData) {
        var questId = scytheData[quest].quest_id;
        if(player.hasFinishedQuest(questId) && player.getStoredData("s" + lib.getActiveSlotId(player) + "id" + questId) != 1 && item.getTag(questId) != 1) 
            availableUpgrades.push(questId);
    }
    return availableUpgrades;
}

/** Gets attributes from upgrades used for display
 * @param {Int[]} questIds 
 * @returns Object
 */
function getUpgradeAttributes(questIds) {
    var upgrades = {};
    for(var quest in scytheData) {
        quest = scytheData[quest];
        if(questIds.indexOf(quest.quest_id) < 0) continue;
        for(var attribute in quest) {
            if(attribute == "quest_id") continue;
            if(upgrades[attribute]) upgrades[attribute] += quest[attribute];
            else upgrades[attribute] = quest[attribute];
        }
    }
    upgradeArray = [];
    var levelReq = "";
    for(var upgrade in upgrades) {
        var attributeName = "";
        switch(upgrade) {
            case "attribute.main_attack":
                attributeName = "\u00A7cAttack Damage: +";
                break;
            case "appearance":
                attributeName = "\u00A7eAppearance Level: +";
                break;
            case "skill.unlock":
                attributeName = "\u00A72Skill Level: +";
                break;
            case "skill.damage":
                attributeName = "\u00A7aSkill Damage: +";
                break;
            case "level_req":
                levelReq = "\u00A74\u00A7oLevel Requirement: +" + upgrades[upgrade];
                break;
        }
        if(upgrade == "level_req") continue;
        else if(attributeName === "") upgradeArray.push([upgrade, upgrades[upgrade]])
        else upgradeArray.push(attributeName + upgrades[upgrade]);
    }
    if(levelReq != "") upgradeArray.push(levelReq);
    return upgradeArray;
}