// Z Sword.js
// AUTHOR: Noxie

/*
    QUESTS DATA FORMAT

    Add a new quest with:
    questName : questName = {}

    Add properties with:
    "property" : value,

    Remove comma from last quest and property

    SUPPORTED PROPERTIES
    [REQUIRED] "quest_id" (int)
    "attribute.ATTRIBUTE_NAME" (int) - Any custom attribute from CNPC+
    "magic_attribute.MAGIC_ATTRIBUTE_NAME" (int) - Any magic attribute from CNPC+
    "skill.SKILL_NAME" (int) - Any custom skill added by us (set this to 1)
    "apperance" (int) - value to add to appearance level (set this to 1)
    "unlock.heavy" (int) - Unlocks weapon arts slot
    "slot.active" (int) - Number of active slots to unlock (max 2)
    "slot.passive" (int) - Number of passive slots to unlock
*/
var quests = {
    defaultState : defaultState = {
        "quest_id" : 3269,
        "attribute.main_attack" : 1,
        "appearance" : 1
    },

    quest1 : quest1 = {
        "quest_id" : 3270,
        "attribute.main_attack" : 100,
        "attribute.dbc.Constitution.Multi" : 200,
        "slot.active" : 1,
        "slot.passive" : 1,
        "skill.pinkSkill2" : 1,
        "skill.redSkill" : 1,
        "unlock.heavy" : 1,
        "heavy.slap" : 1
        
    },

    quest2 : quest2 = {
        "quest_id" : 3271,
        "attribute.main_attack" : 200,
        "attribute.critical_chance" : 100,
        "attribute.dbc.Strength" : 2000,
        "skill.senzuEat" : 1,
        "skill.greenSkill3" : 1,
        "slot.active" : 1,
        "slot.passive" : 1,
        "heavy.nothin" : 1
    }
};

/*
    APPEARANCES DATA FORMAT

    Add a new appearance with:
    levelAPPEARANCE_LEVEL = {}

    Add properties with:
    "property" : value,

    Remove comma from last quest and property

    SUPPORTED PROPERTIES
    [REQUIRED] "item_name" (string)
    [REQUIRED] "item_texture" (string)
    [REQUIRED] "lore" (string[])
*/
var appearanceLevel = [
    level0 = {
        "item_name" : "&rSheathed Z Sword",
        "item_texture" : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/LandOfTheKais_Z-Sword%20Saga_Sheathed_Z_Sword.png",
        "lore" : ["type shi"]
    },

    level1 = {
        "item_name" : "&rZ Sword",
        "item_texture" : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/LandOfTheKais_Z-Sword%20Saga_Z_Sword.png",
        "lore" : ["&rLore dump"]
    },

    level2 = {
        "item_name" : "&rZ Sword but stronger",
        "item_texture" : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/LandOfTheKais_Z-Sword%20Saga_True_Z_Sword.png",
        "lore" : ["&rLore dump"]
    }
];

/*
    SKILLS DATA FORMAT

    Add a new skill with:
    NAME = {}

    Add properties with:
    "property" : value,

    Remove comma from last quest and property

    SUPPORTED PROPERTIES
    [REQUIRED] "name" (string) - Skill name used for lore and menu display
    [REQUIRED] "id" (int) - Skill ID (musn't be below 'firstPowerId' or over 50)
    [REQUIRED] "icon" (string) - Regular icon to be displayed in menus
    [REQUIRED] "superIcon" (string) - Icon to display in menus after being upgraded
    "upgradeCost" (int) - Upgrade cost in upgrade points
    "hoverText" (string[]) - Text shown when hovering over skill in menus
    "cooldown" (int) - Cooldown in ticks
    "scaler" (string) - Weapon attribute to scale off (e.g. 'main_attack')
    "active" (function) - Active portion of skill
    "passive" (function) - Passive portion of skill

*/
var firstPowerId = 3; 
var skills = {
    blankSkill : {
        name : "None",
        id : 1,
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/zSwordButtons.png",
        superIcon : ""
    },

    lockedSkill : {
        name : "None",
        id : 2,
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Locked%20Icon.png",
        superIcon : ""
    },

    senzuEat : {
        id : 3,
        name : "&2Senzu Eat&r&f",
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Blue%20Icon.png",
        superIcon : "",
        upgradeCost: 3,
        hoverText : ["&aSenzu Eat", "Active: Eat a senzu bean to restore health and ki", "Passive: I forgor"],
        cooldown : 200,
        scaler : "main_attack",
        active : function(event) {
            event.player.sendMessage("Wow I just sent this from the active ability!!");
            event.player.sendMessage("Is this skill super? " + event.super);
        },
        passive : function(event) {
            
        }
    },

    greenSkill : {
        id : 4,
        name : "&aGreen Skill1&r&f",
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Green%20Icon.png",
        superIcon : "",
        upgradeCost: 4,
        hoverText : "I'm green",
        cooldown : 200,
        scaler : "main_attack",
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    pinkSkill : {
        id : 5,
        name : "&dPink Skill&r&f",
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Pink%20Icon.png",
        superIcon : "",
        upgradeCost: 1,
        hoverText : "I'm pink",
        cooldown : 200,
        scaler : "main_attack",
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    redSkill : {
        id : 6,
        name : "&4&lRed &4&mSkill&r&f",
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Red%20Icon.png",
        superIcon : "",
        upgradeCost: 1,
        hoverText : "I'm red",
        cooldown : 200,
        scaler : "main_attack",
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    senzuEat2 : {
        id : 7,
        name : "&2Senzu Eat&r&f",
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Blue%20Icon.png",
        superIcon : "",
        upgradeCost: 1,
        hoverText : "Eat a senzu!",
        cooldown : 200,
        scaler : "main_attack",
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    greenSkill2 : {
        id : 8,
        name : "&aGreen Skill2&r&f",
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Green%20Icon.png",
        superIcon : "",
        upgradeCost: 1,
        hoverText : "I'm green",
        cooldown : 200,
        scaler : "main_attack",
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    pinkSkill2 : {
        id : 9,
        name : "&dPink Skill&r&f",
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Pink%20Icon.png",
        superIcon : "",
        upgradeCost: 1,
        hoverText : "I'm pink",
        cooldown : 200,
        scaler : "main_attack",
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    redSkill2 : {
        id : 10,
        name : "&4&lRed &4&mSkill&r&f",
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Red%20Icon.png",
        superIcon : "",
        upgradeCost: 1,
        hoverText : "I'm red",
        cooldown : 200,
        scaler : "main_attack",
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    senzuEat3 : {
        id : 11,
        name : "&2Senzu Eat&r&f",
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Blue%20Icon.png",
        superIcon : "",
        upgradeCost: 1,
        hoverText : "Eat a senzu!",
        cooldown : 200,
        scaler : "main_attack",
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    greenSkill3 : {
        id : 12,
        name : "&aGreen Skill3&r&f",
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Green%20Icon.png",
        superIcon : "",
        upgradeCost: 1,
        hoverText : "I'm green",
        cooldown : 200,
        scaler : "main_attack",
        active : function(event) {

        },
        passive : function(event) {
            event.player.sendMessage("Passive Trigger from: " + event.type);
        }
    },

    pinkSkill3 : {
        id : 13,
        name : "&dPink Skill&r&f",
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Pink%20Icon.png",
        superIcon : "",
        upgradeCost: 1,
        hoverText : "I'm pink",
        cooldown : 200,
        scaler : "main_attack",
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    redSkill3 : {
        id : 14,
        name : "&4&lRed &4&mSkill&r&f",
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Red%20Icon.png",
        superIcon : "",
        upgradeCost: 1,
        hoverText : "I'm red",
        cooldown : 200,
        scaler : "main_attack",
        active : function(event) {

        },
        passive : function(event) {
            
        }
    }
};


/*
    Weapon Arts DATA FORMAT

    Add a new Weapon Art with:
    NAME = {}

    Add properties with:
    "property" : value,

    Remove comma from last quest and property

    SUPPORTED PROPERTIES
    [REQUIRED] "name" (string) - Weapon Art name used for lore and menu display
    [REQUIRED] "id" (int) - Weapon Art ID (musn't be below 'firstPowerId' or over 50)
    [REQUIRED] "icon" (string) - Regular icon to be displayed in menus
    [REQUIRED] "superIcon" (string) - Icon to display in menus after being upgraded
    "upgradeCost" (int) - Upgrade cost in upgrade points
    "hoverText" (string[]) - Text shown when hovering over Weapon Art in menus
    "cooldown" (int) - Cooldown in ticks
    "scaler" (string) - Weapon attribute to scale off (e.g. 'main_attack')
    "active" (function) - Function run by weapon art

*/
var heavyAttacks = {
    blankHeavy : {
        name : "None",
        id : 1,
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/zSwordButtons.png",
        superIcon : ""
    },

    lockedHeavy : {
        name : "None",
        id : 2,
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Pink%20Icon.png",
        superIcon : ""
    },

    slap : {
        name : "Slap",
        id : 3,
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Blue%20Icon.png",
        superIcon : "",
        upgradeCost: 1,
        hoverText : "I do a big charge",
        cooldown : 200,
        scaler : "main_attack",
        active : function(event) {
            var abilHandler = event.player.getData().getAbilityData();
            if(event.super) {
                abilHandler.activateAbility("BigCharge");
            } else {
                abilHandler.activateAbility("DirectionalDash");
            }
            event.player.sendMessage(event.super ? "SUPER!" : "not super");
        },
    },

    nothin : {
        name : "Nothing burger",
        id : 4,
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/Red%20Icon.png",
        superIcon : "",
        upgradeCost: 1,
        hoverText : "I do notin",
        cooldown : 200,
        scaler : "main_attack",
        active : function(event) {
            var abilHandler = event.player.getData().getAbilityData();

            event.player.sendMessage(event.super ? "SUPER!" : "not super");
        },
    }
};

// -----------------------------------------------------------------------
//                      Z SWORD API
// -----------------------------------------------------------------------

var upFuncs = {
    getUpgradePoints: getUpgradePoints,
    setUpgradePoints: setUpgradePoints,
    addUpgradePoints: addUpgradePoints,
    takeUpgradePoints: takeUpgradePoints,
    upgrade: upgrade,
    setUpgradeTexture: setUpgradeTexture,
    handleUpgradeResponse: handleUpgradeResponse,
    menu: buildUpgradeMenu
};

var zSwordFunctions = {
    displaySkillMenu: displaySkillMenu,
    displayHeavyMenu: displayHeavyMenu,
    selectHeavyAttack: selectHeavyAttack,
    heavyAttack : doHeavyAttack,
    sheathe : sheatheWeapon,
    upgradeFuncs: upFuncs
};


// -----------------------------------------------------------------------
//                      CONFIG
// -----------------------------------------------------------------------

// GUI CONFIG
var SKILL_WINDOW_ID = 301
var skillWindowBgTexture = "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/LandOfTheKais_Z-Sword%20Saga_Skill_Menu.png";
var heavyWindowBgTexture = "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/LandOfTheKais_Z-Sword%20Saga_Heavy_Menu.png";
var upgradeWindowBgTexture = "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/TEMP/LandOfTheKais_Z-Sword%20Saga_Upgrade_Menu_TEMP.png";
var menuHeight = 171;
var menuWidth = 243;

var iconWidth = 24;
var iconHeight = 24;
var iconPosInitialX = 17;
var iconPosInitialY = 18.6;
var iconSpacingX = 30.4;
var iconSpacingY = 30.4;

var selectedLockTexture = "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/zSwordLockedIcon.png";
var selectedLockSize = 46;
var selectedPosX = [154, 201, 154, 201];
var selectedPosY = [35, 35, 114, 114];
var heavySelectedX = 177
var heavySelectedY = 36

var tabWidth = 12;
var tabHeight = 44;
var tabPosY = 10;
var tabSpacing = 7;
var tabTexture = "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/zSwordSideTab.png";
var heavyTabId = 62;
var skillTabId = 61;

var uPointX = 144;
var uPointY = 76;
var costX = 144;
var costY = 90;
var uButtonX = 144;
var uButtonY = 130;

// UPGRADE RESPONSE
var invalidPlayer = "Player invalid";
var upgradedAlready = "TYPE already upgraded";
var skillNotUnlocked = "Skill not unlocked";
var heavyNotUnlocked = "Weapon art not unlocked";
var insufficientPoints = "Insufficient Points";
var upgradeSuccess = "Upgrade successful";
var successColour = 4783944;
var failColour = 16724530;

var upMessageX = 144;
var upMessageY = 105;

// LORE CONFIG
var activeLore = "&6&lActive Abilities: ";
var passiveLore = "&6&lPassive Abilities: ";

// TIMERS DON'T EDIT
var ACTIVE_1_COOLDOWN = 321;
var ACTIVE_2_COOLDOWN = 322;
var HEAVY_COOLDOWN = 323;
var SPAM_PREVENTER = 357;

var item;
var abilHandler;

// -----------------------------------------------------------------------
//                      BASE EVENT HANDLING
// -----------------------------------------------------------------------

function buildingItem(event)
{
    item = event.item;
    sheatheWeapon(item);
}

function init(event)
{
    item = event.item;
    sheatheWeapon(item);
}

function versionChanged(event)
{
    item = event.item;
    sheatheWeapon(item);
}

function pickedUp(event) {
    item = event.item;
    sheatheWeapon(item);
}

function tossed(event) {
    event.setCancelled(true);
    lib.giveZSword(event.player);
    item = event.item;
    sheatheWeapon(item);
}

function rightClick(event)
{
    item = event.item;
    var player = event.player;
    if(item.getTag("sheathed") == "true") {
        removeSheathe(item, event.player);
        return;
    }

    if(item.getTag("sheathed") == "false") {
        doHeavyAttack(player);
    }
}   

function attack(event) {
    var player = event.getSwingingEntity();
    var item = event.getItem();
    // Sheathe if attacking with an incompatible weapon
    if(!lib.isPlayer(player)) return;
    if(player.getEntityId() != item.getTag("playerId") || !player.hasTempData("zSwordFunctions")) {
        sheatheWeapon(item);
    } else {
        player.getTempData("zAbilityHandler").handleEvent("itemAttack");
    }
}

// -----------------------------------------------------------------------
//                      SHEATHE HANDLING
// -----------------------------------------------------------------------

/** Sets item to sheathed state
 * @param {IItemLinked} item 
 */
function sheatheWeapon(item)
{
    clearStats(item);
    setAppearance(item, appearanceLevel[0]);

    item.setTag("sheathed", "true");
}

/** Clears custom and magic attributes on item
 * @param {IItemLinked} item 
 */
function clearStats(item)
{
    // Removes every attribute listed in the quest list
    for(var quest in quests) {
        var quest = quests[quest];
        for(var attribute in quest) {
            if(attribute.startsWith("attribute")) {
                // Trim off attribute tag
                var trimmedAttribute = attribute.substring(10);
                item.removeCustomAttribute(trimmedAttribute);
            } else if(attribute.startsWith("magic_attribute")) {
                // Trim off magic attribute tag
                var trimmedAttribute = attribute.substring(16);
                item.removeMagicAttribute(trimmedAttribute);
            }
        }
    }
    item.removeRequirement("cnpc_soulbind");
}

/** Swaps item to a functional state based on player data
 * @param {IItemLinked} item 
 * @param {IPlayer} player - Player to use data from
 */
function removeSheathe(item, player)
{
    if(!lib.isPlayer(player) || !player.hasFinishedQuest(quests.defaultState.quest_id) || !item || item.getTag("sheated") == "false") return;
    item.setTag("sheathed", "false");
    clearStats(item); // Sanity check

    var appearance = 0;
    for(var quest in quests) {
        if(!player.hasFinishedQuest(quests[quest]["quest_id"])) continue;
        if(quests[quest]["appearance"]) appearance += quests[quest]["appearance"];
    }
    setAppearance(item, appearanceLevel[appearance]);
    item.setTag("appearance", appearance)
    applyAttributes(item, getAttributes(player));
    
    abilHandler = new abilityHandler(player, item);
    abilHandler.addSkillLore();
    abilHandler.handleEvent("removeSheathe");

    item.setRequirement("cnpc_soulbind", player.getUniqueID());

    item.setTag("playerId", player.getEntityId())
    player.setTempData("zSwordFunctions", zSwordFunctions);
    player.setTempData("zAbilityHandler", abilHandler);  
    var attribute = getAttributes(player);
}

/** Sets appearence of item from appearance object
 * @param {IItemLinked} item 
 * @param {Object} appearance 
 */
function setAppearance(item, appearance)
{
    if(appearance.item_name) item.setCustomName(appearance.item_name);
    if(appearance.lore) item.setLore(appearance.lore);
    if(appearance.item_texture) item.setTexture(appearance.item_texture);
}

// -----------------------------------------------------------------------
//                      ATTRIBUTES
// -----------------------------------------------------------------------

/** Gets weapon attributes from player data
 * @param {IPlayer} player 
 * @returns all available attributes for player's current progression
 */
function getAttributes(player) 
{
    var availableAttributes = {};
    for(var quest in quests) {
        quest = quests[quest];
        if(!player.hasFinishedQuest(quest["quest_id"])) continue;
        for(var attribute in quest) {
            if(!(attribute.startsWith("attribute") || attribute.startsWith("magic_attribute"))) continue;
            if(availableAttributes[attribute]) availableAttributes[attribute] += quest[attribute];
            else availableAttributes[attribute] = quest[attribute];
        }
    }
    return availableAttributes;
}

/** Applys attributes from an object to current item
 * @param {IItemLinked} item 
 * @param {Object} attributes 
 */
function applyAttributes(item, attributes) 
{
    for(var attribute in attributes) {
        if(attribute.startsWith("attribute")) {
            // Trim off attribute tag
            var trimmedAttribute = attribute.substring(10);
            item.setCustomAttribute(trimmedAttribute, attributes[attribute] + item.getCustomAttribute(trimmedAttribute));
        } else if(attribute.startsWith("magic_attribute")) {
            // Trim off magic attribute tag
            var trimmedAttribute = attribute.substring(16);
            item.setMagicAttribute(trimmedAttribute, attributes[attribute] + item.getMagicAttribute(trimmedAttribute));
        }
    }
}

// -----------------------------------------------------------------------
//                      MENUS
// -----------------------------------------------------------------------

/** Builds base menu for all z sword menus
 * @param {IPlayer} player 
 * @param {Int} type - 0: Skill, 1: Heavy
 * @param {Int} guiId 
 * @returns 
 */
function buildBase(player, type, guiId) {
    if(!lib.isPlayer(player)) return;
    var item = player.getHeldItem();
    if(!lib.isZSword(item) || item.getTag("sheathed" == "true") || item.getTag("broken") == "true") return;
    // Clear button temp data
    player.removeTempData("selectedButton");
    player.removeTempData("selectedUpgrade");

    var menu = API.createCustomGui(guiId, menuWidth + tabWidth, menuHeight, false);
    menu.addTexturedRect(0, type == 0 ? skillWindowBgTexture : heavyWindowBgTexture, 0, 0, menuWidth, menuHeight);

    var iconPosX = iconPosInitialX;
    var iconPosY = iconPosInitialY;
    if(type == 0) {
        var unlockedPowers = getSkills(player);
    } else {
        var unlockedPowers = getHeavies(player);
    }
    var powers = type == 0 ? skills : heavyAttacks;

    for(var power in powers) {
        var power = powers[power];
        if(power.id < firstPowerId) continue;

        if(unlockedPowers.indexOf(power) < 0) {
            menu.addTexturedRect(power.id, skills.lockedSkill.icon, iconPosX, iconPosY, iconWidth, iconHeight);
        } else {
            var button = menu.addTexturedButton(power.id, "", iconPosX, iconPosY, iconWidth, iconHeight, isUpgraded(player, type, power.id) ? power.superIcon : power.icon);
            if(power.hoverText) button.setHoverText(power.hoverText);
        }
        
        // Handle Icon spacing
        iconPosX += iconSpacingX;
        if(iconPosX >= iconPosInitialX + iconSpacingX * 4) {
            iconPosX = iconPosInitialX;
            iconPosY += iconSpacingY;
        }
    }

    // Tabs
    var tab = menu.addTexturedButton(type == 0 ? heavyTabId : skillTabId, "", menuWidth - 2, tabPosY, tabWidth, tabHeight, tabTexture);
    //var keybindTab = skillWindow.addTexturedButton(63, "", menuWidth - 2, tabPosY + tabHeight + tabSpacing, tabWidth, tabHeight, tabTexture);

    return menu;
}

/** Builds an upgrade menu and displays it to the player
 * @param {IPlayer} player 
 * @param {Int} type - 0: Skill, 1: Heavy
 */
function buildUpgradeMenu(player, type) {
    var menu = buildBase(player, type, SKILL_WINDOW_ID + 2 + type);
    // Menu fails to build or player is invalid
    if(!menu) return;

    menu.getComponent(0).setTexture(upgradeWindowBgTexture);

    var idIndex = 50;
    var skillSlots = getSkillSlots(player)
    if((type == 0 && !skillSlots[0] && !skillSlots[1] && !skillSlots[2] && !skillSlots[3]) || (type == 1 && !hasUnlockedHeavies(player))) { // Skills not unlocked
        menu.addTexturedRect(idIndex, heavyAttacks.blankHeavy.icon, heavySelectedX, heavySelectedY, iconWidth, iconHeight);
        menu.addTexturedRect(idIndex + 30, selectedLockTexture, heavySelectedX - (selectedLockSize - iconWidth)/2, heavySelectedY - (selectedLockSize - iconHeight)/2, selectedLockSize, selectedLockSize);
    }
    else menu.addTexturedButton(idIndex, "", heavySelectedX, heavySelectedY, iconWidth, iconHeight, heavyAttacks.blankHeavy.icon);

    // Upgrade labels and button
    var uPointsLabel = menu.addLabel(56, "Upgrade Points: " + getUpgradePoints(player), uPointX, uPointY, 100, 0);
    uPointsLabel.setScale(0.89);
    var uPointsShadow = menu.addLabel(55, "Upgrade Points: " + getUpgradePoints(player), uPointX + 1, uPointY + 1, 100, 0, 0);
    uPointsShadow.setScale(0.89);

    var costLabel = menu.addLabel(58, "Cost: ", costX, costY, 100, 0);
    costLabel.setScale(0.89);
    var costShadow = menu.addLabel(57, "Cost: ", costX + 1, costY + 1, 100, 0, 0);
    costShadow.setScale(0.89);

    var upButton = menu.addButton(59, "Upgrade", uButtonX, uButtonY, 90, 20);

    player.showCustomGui(menu);
}

/** Displays a skill selection window to the player
 * @param {IPlayer} player 
 */
function displaySkillMenu(player)
{
    var menu = buildBase(player, 0, SKILL_WINDOW_ID);
    // Menu fails to build or player is invalid
    if(!menu) return;

    var idIndex = 50;
    var selectedSkills = player.getTempData("zAbilityHandler").getSelectedSkills();
    var skillSlots = getSkillSlots(player);
    // Button ids 50-54
    for(var i = 0; i < 4; i++) {
        if(!selectedSkills[i] || selectedSkills[i] == "") selectedSkills[i] = skills.blankSkill;
        if(!skillSlots[i]) {
            menu.addTexturedRect(idIndex, skills.blankSkill.icon, selectedPosX[i], selectedPosY[i], iconWidth, iconHeight);
            menu.addTexturedRect(idIndex + 4, selectedLockTexture, selectedPosX[i] - (selectedLockSize - iconWidth)/2, selectedPosY[i] - (selectedLockSize - iconHeight)/2, selectedLockSize, selectedLockSize);
        }
        else menu.addTexturedButton(idIndex, "", selectedPosX[i], selectedPosY[i], iconWidth, iconHeight, selectedSkills[i].icon);
        idIndex++;
    }

    player.showCustomGui(menu);
}

/** Displays a skill selection window to the player
 * @param {IPlayer} player 
 */
function displayHeavyMenu(player)
{
    var menu = buildBase(player, 1, SKILL_WINDOW_ID + 1);
    // Menu fails to build or player is invalid
    if(!menu) return;

    var idIndex = 50;
    var selectedHeavy = getSelectedHeavy(player);
    // Button ids 50-54
    if(!selectedHeavy || selectedHeavy == "") selectedHeavy = heavyAttacks.blankHeavy;
    if(!hasUnlockedHeavies(player)) {
        menu.addTexturedRect(idIndex, heavyAttacks.blankHeavy.icon, heavySelectedX, heavySelectedY, iconWidth, iconHeight);
        menu.addTexturedRect(idIndex + 4, selectedLockTexture, heavySelectedX - (selectedLockSize - iconWidth)/2, heavySelectedY - (selectedLockSize - iconHeight)/2, selectedLockSize, selectedLockSize);
    }
    else menu.addTexturedButton(idIndex, "", heavySelectedX, heavySelectedY, iconWidth, iconHeight, selectedHeavy.icon);

    player.showCustomGui(menu);
}

// -----------------------------------------------------------------------
//                      UPGRADES
// -----------------------------------------------------------------------


/** Finds previously upgraded Heavies
 * @param {IPlayer} player 
 * @param {Int} type - 0: ability, 1: heavy
 */
function findUpgrades(player, type) {
    if(!lib.isPlayer(player)) return false;
    var playerSlot = lib.getActiveSlotId(player);
    var upgradeString = type == 0 ? player.getStoredData(playerSlot + "zSwordSkillUpgrade") : player.getStoredData(playerSlot + "zSwordHeavyUpgrade");
    if(!upgradeString) return {};
    var upgradeArr = upgradeString.split(",");
    var upgradeObject = {};
    for(var s in upgradeArr) {
        s = upgradeArr[s];
        var split = s.split("=");
        if(split[1] > 0)
            upgradeObject[split[0]] = split[1];
    }
    return upgradeObject;
}

/** Checks if skill is super from id
 * @param {IPlayer} player 
 * @param {Int} type - 0: ability, 1: heavy
 * @param {Int} id
 */
function isUpgraded(player, type, id) {
    var upgrades = findUpgrades(player, type);
    if(upgrades && id in upgrades)
        return upgrades[id] > 0;
    return false;
}

/** Upgrades a skill or heavy attack
 * 0 - Invalid player, 1 - Upgrade already present, 2 - skill not unlocked, 3 - Heavy not unlocked, 4 - Insufficient points, 5 - Success, 9 - Prevents invalid icon displaying
 * @param {IPlayer} player 
 * @param {Int} type - 0: Skill, 1: Heavy
 * @param {Int} id 
 * @returns 
 */
function upgrade(player, type, id) {
    if(!lib.isPlayer(player)) return 0;
    if(id < firstPowerId) return 9;
    if(id in findUpgrades(player, type)) return 1;
    if(type == 0 && !(getSkills(player).indexOf(findSkill(id)) > -1)) return 2;
    if(type == 1 && !(getHeavies(player).indexOf(findHeavyAttack(id)) > -1)) return 3;

    var availablePoints = getUpgradePoints(player);
    if((type == 0 && findSkill(id).upgradeCost > availablePoints) || (type == 1 && findHeavyAttack(id).upgradeCost > availablePoints)) return 4;

    var playerSlot = lib.getActiveSlotId(player);
    var upgradeString = type == 0 ? player.getStoredData(playerSlot + "zSwordSkillUpgrade") : player.getStoredData(playerSlot + "zSwordHeavyUpgrade");
    if(!upgradeString) upgradeString = "";
    takeUpgradePoints(player, type == 0 ? findSkill(id).upgradeCost : findHeavyAttack(id).upgradeCost);
    player.setStoredData(playerSlot + (type == 0 ? "zSwordSkillUpgrade" : "zSwordHeavyUpgrade"), upgradeString + "" + id + "=1,");
    return 5;
}

/** Handles gui response from pressing upgrade
 * @param {IPlayer} player 
 * @param {ICustomGui} gui 
 */
function handleUpgradeResponse(player, gui) {
    if(!lib.isPlayer(player) || !player.hasTempData("selectedUpgrade")) return;
    var result = upgrade(player, gui.getID() == 303 ? 0 : 1, player.getTempData("selectedUpgrade"));
    var text = "";
    switch(result) {
        case 0:
            text = invalidPlayer;
            break;

        case 1:
            text = upgradedAlready.replace("TYPE", (gui.getID() == 303 ? "Skill" : "Weapon art"));
            break;
            
        case 2:
            text = skillNotUnlocked;
            break;

        case 3:
            text = heavyNotUnlocked;
            break;

        case 4:
            text = insufficientPoints;
            break;

        case 5:
            text = upgradeSuccess;
            break;

        default:
            text = "";
            break;
    }
    var message = gui.addLabel(65, text, upMessageX, upMessageY, 50, 55, result == 5 ? successColour : failColour);
    var messageShadow = gui.addLabel(64, text, upMessageX + 1, upMessageY + 1, 50, 55, 0);
    message.setScale(0.89);
    messageShadow.setScale(0.89);
    if(result == 5) {
        // Update ability icons
        gui.getComponent(player.getTempData("selectedUpgrade")).setTexture(gui.getID() == 303 ? findSkill(player.getTempData("selectedUpgrade")).superIcon : findHeavyAttack(player.getTempData("selectedUpgrade")).superIcon);
        gui.getComponent(50).setTexture(skills.blankSkill.icon);

        // Update cost text
        gui.getComponent(58).setText("Cost: ");
        gui.getComponent(57).setText("Cost: ");

        // Update points text
        gui.getComponent(56).setText("Upgrade Points: " + getUpgradePoints(player));
        gui.getComponent(55).setText("Upgrade Points: " + getUpgradePoints(player));

        player.removeTempData("selectedButton");
        player.removeTempData("selectedUpgrade");
    }
    gui.update(player);
    return;
}

/** Gets current no. upgrade points
 * @param {IPlayer} player 
 * @returns Int
 */
function getUpgradePoints(player) {
    if(!lib.isPlayer(player)) return;
    var points = player.getStoredData(lib.getActiveSlotId(player) + "zSwordUpgradePoints");
    if(!points) return 0;
    return parseInt(points);
}

/** Sets upgrade points to amount
 * @param {IPlayer} player 
 * @param {Int} amount 
 */
function setUpgradePoints(player, amount) {
    if(!lib.isPlayer(player)) return;
    player.setStoredData(lib.getActiveSlotId(player) + "zSwordUpgradePoints", amount);
}

/** Adds upgrade points to total
 * @param {IPlayer} player 
 * @param {Int} amount 
 */
function addUpgradePoints(player, amount) {
    if(!lib.isPlayer(player)) return;
    setUpgradePoints(player, getUpgradePoints(player) + amount);
}

/** Takes upgrade points from total
 * @param {IPlayer} player 
 * @param {Int} amount 
 */
function takeUpgradePoints(player, amount) {
    if(!lib.isPlayer(player)) return;
    setUpgradePoints(player, getUpgradePoints(player) - amount);
}

/** Updates gui texture and cost for upgrade selection
 * @param {ICustomGui} gui 
 * @param {Int} type - 0: Skill, 1: Heavy
 * @param {Int} id 
 * @param {IPlayer} player 
 */
function setUpgradeTexture(gui, type, id, player) {
    player.sendMessage(id)
    if(id >= firstPowerId && !isUpgraded(player, type, id)) {
        var power = type == 0 ? findSkill(id) : findHeavyAttack(id);
        var cost = power.upgradeCost;
    }
    else if(isUpgraded(player, type, id)) {
        var power = type == 0 ? findSkill(id) : findHeavyAttack(id);
        var cost = "";
    }
    else {
        power = skills.blankSkill;
        var cost = "";
        player.removeTempData("selectedUpgrade")
    }
    gui.getComponent(50).setTexture(isUpgraded(player, type, id) ? power.superIcon : power.icon);
    gui.getComponent(58).setText("Cost: " + cost);
    gui.getComponent(57).setText("Cost: " + cost);
    gui.update(player);
}

// -----------------------------------------------------------------------
//                      SKILLS
// -----------------------------------------------------------------------

/** Gets available weapon skills from player data
 * @param {IPlayer} player 
 * @returns all available skills for player's current progression
 */
function getSkills(player)
{
    var availableSkills = [];
    for(var quest in quests) {
        quest = quests[quest];
        if(!player.hasFinishedQuest(quest["quest_id"])) continue;
        for(var attribute in quest) {
            if(!attribute.startsWith("skill")) continue;
            var trimmedAttribute = attribute.substring(6);
            // Add level to skill if skill already attributed else add skill at base level
            if(availableSkills.indexOf(trimmedAttribute) < 0) availableSkills.push(skills[trimmedAttribute]);
        }
    }
    return availableSkills;
}

function getSkillSlots(player)
{
    var availableSlots = [false, false, false, false];
    for(var quest in quests) {
        quest = quests[quest];
        if(!player.hasFinishedQuest(quest["quest_id"])) continue;
        for(var key in quest) {
            if(key == "slot.active") availableSlots[availableSlots[0] ? 1 : 0] = true;
            else if(key == "slot.passive") availableSlots[availableSlots[2] ? 3 : 2] = true
        }
    }
    return availableSlots;
}

/** Finds skill name from id
 * @param {Int} id 
 * @returns skill
 */
function findSkill(id)
{
    for(var skill in skills) {
        if(skills[skill].id == id) return skills[skill];
    }
}

function abilityHandler(player, item) {
    // Ability setup
    this.player = player;
    this.zSword = item;
    this.slot = lib.getActiveSlotId(this.player);
    this.active1 = findSkill(this.player.getStoredData(this.slot + "zSwordActive" + 1));
    this.active2 = findSkill(this.player.getStoredData(this.slot + "zSwordActive" + 2));
    this.passive1 = findSkill(this.player.getStoredData(this.slot + "zSwordPassive" + 1));
    this.passive2 = findSkill(this.player.getStoredData(this.slot + "zSwordPassive" + 2));

    // Timer config
    this.ACTIVE_1_COOLDOWN = 321;
    this.ACTIVE_1_COOLDOWN = 322;
    this.SPAM_PREVENTER = 324;
    this.spamCd = 10;
}

/** Uses active ability in chosen slot
 * @param {Int} activeSlot
 */
abilityHandler.prototype.abilityActivate = function(activeSlot) {
    if(!this.player) return;
    var timers = this.player.timers;
    // Get timer based on slot and active
    var cooldownTimerId = activeSlot == 1 ? this.ACTIVE_1_COOLDOWN : this.ACTIVE_2_COOLDOWN;
    var compoundTimerId = this.slot + "" + cooldownTimerId + "";
    var skill = activeSlot == 1 ? this.active1 : this.active2;
    if(!skill || item.getTag("sheathed") == "true" || !lib.holdingZSword(this.player) || skill.id < firstPowerId) return;

    if(timers.has(compoundTimerId) && !timers.has(this.SPAM_PREVENTER)) {
        var remainingCooldown = timers.ticks(compoundTimerId);
        this.player.sendMessage("Remaining Cooldown on Skill: " + skill.name + " : " + (Math.round(remainingCooldown/2)/10) + " seconds.");
        timers.forceStart(this.SPAM_PREVENTER, this.spamCd, false);
        return;
    } else if(timers.has(compoundTimerId) && timers.has(this.SPAM_PREVENTER)) return;
    
    this.player.sendMessage("Performing skill: " + skill.name);
    timers.forceStart(compoundTimerId, skill.cooldown, false);

    this.handleEvent("abilityActivate" + activeSlot);
}

// Event types: abilityActivate1, abilityActive2, heavyActivate, removeSheathe, tick, attack, itemAttack, damaged
abilityHandler.prototype.handleEvent = function(eventType) {
    if(!lib.isPlayer(this.player) || this.zSword.getTag("sheated") == "true" || !lib.hasZSword(this.player)) return;
    this.zSword = lib.findZSword(this.player);
    if(!this.zSword) return;
    var event = {
        player : this.player,
        type : eventType,
        zsword : this.zSword,
        super: false,
        scaler: "",
        slot: null
    }

    // Trigger passives and actives
    if(eventType == "heavyActivate" && getSelectedHeavy(this.player) && "active" in getSelectedHeavy(this.player)) {
        var heavy = getSelectedHeavy(this.player)
        if(isUpgraded(this.player, 1, heavy.id)) event.super = true;
        heavy.active(event);
    }
    if(eventType == "abilityActivate1" && this.active1 && "active" in this.active1) {
        event.slot = "active1"
        event.scaler = this.active1.scaler;
        if(isUpgraded(this.player, 0, this.active1.id)) event.super = true;
        this.active1.active(event);
    }
    if(eventType == "abilityActivate2" && this.active2 && "active" in this.active2) {
        event.slot = "active2"
        event.scaler = this.active2.scaler;
        if(isUpgraded(this.player, 0, this.active2.id)) event.super = true;
        this.active2.active(event);
    }
    if(this.active1 && "passive" in this.active1) {
        event.slot = "active1"
        event.scaler = this.active1.scaler;
        if(isUpgraded(this.player, 0, this.active1.id)) event.super = true;
        this.active1.passive(event);
    }
    if(this.active2 && "passive" in this.active2) {
        event.slot = "active2"
        event.scaler = this.active2.scaler;
        if(isUpgraded(this.player, 0, this.active2.id)) event.super = true;
        this.active2.passive(event);
    }
    if(this.passive1 && "passive" in this.passive1) {
        event.slot = "passive1"
        event.scaler = this.passive1.scaler;
        if(isUpgraded(this.player, 0, this.passive1.id)) event.super = true;
        this.passive1.passive(event);
    }
    if(this.passive2 && "passive" in this.passive2) {
        event.slot = "passive2"
        event.scaler = this.passive2.scaler;
        if(isUpgraded(this.player, 0, this.passive2.id)) event.super = true;
        this.passive2.passive(event);
    }
}

/** Gets weapon skills from player data
 * @param {IPlayer} player 
 * @returns all available skills for player's current progression
 */
abilityHandler.prototype.getSelectedSkills = function() {
    return [this.active1, this.active2, this.passive1, this.passive2];
}

/** Adds currently selected skills to item lore
 */
abilityHandler.prototype.addSkillLore = function() {
    var oldLore = appearanceLevel[this.zSword.getTag("appearance")].lore;
    var lore = [];
    var selectedSkills = this.getSelectedSkills();
    for(var string in oldLore) {
        lore.push(oldLore[string])
    }
    if((selectedSkills[0] && selectedSkills[0].id >= firstPowerId) || (selectedSkills[1] && selectedSkills[1].id >= firstPowerId)) {
        lore.push(
            activeLore + 
            (selectedSkills[0] && selectedSkills[0].name != "None" ? selectedSkills[0].name + " &7&l[KEY]".replace("KEY", this.player.hasStoredData("zSwordActive1Key") ? keys[this.player.getStoredData("zSwordActive1Key")] : keys["41"]) : "&r&fNone") + 
            "&r, " +
            (selectedSkills[1] && selectedSkills[1].name != "None" ? selectedSkills[1].name + " &7&l[KEY]".replace("KEY", this.player.hasStoredData("zSwordActive2Key") ? keys[this.player.getStoredData("zSwordActive2Key")] : keys["58"]) : "&r&fNone")
        );
        
    }
    if((selectedSkills[2] && selectedSkills[2].id >= firstPowerId) || (selectedSkills[3] && selectedSkills[3].id >= firstPowerId)) { 
        lore.push(
            passiveLore + 
            (selectedSkills[2] ? selectedSkills[2].name : "&r&fNone") + 
            "&r, " +
            (selectedSkills[3] ? selectedSkills[3].name : "&r&fNone")
        );
    }
    lib.findZSword(this.player).setLore(lore);
}

/** Sets a skill as selected
 * @param {IPlayer} player 
 * @param {Int} id 
 * @param {Int} skillSlot 
 */
abilityHandler.prototype.selectSkill = function(id, skillSlot, gui) {
    var selectedSkills = this.getSelectedSkills();
    var skill = findSkill(id);
    var skillIndex = selectedSkills.indexOf(skill);
    if(skillIndex == skillSlot) return;
    // Unselect skill if already selected
    if(skillIndex > -1 || skill.id == 1) {
        switch(skillIndex) {
            case(0):
                this.player.setStoredData(this.slot + "zSwordActive1", 1);
                this.active1 = null;
                break;
            case(1):
                this.player.setStoredData(this.slot + "zSwordActive2", 1);
                this.active2 = null;
                break;
            case(2):
                this.player.setStoredData(this.slot + "zSwordPassive1", 1);
                this.passive1 = null;
                break;
            case(3):
                this.player.setStoredData(this.slot + "zSwordPassive2", 1);
                this.passive2 = null;
                break;
        }
        gui.getComponent(skillSlot + 50).setTexture(skills.blankSkill.icon);
        gui.update(this.player);
    } 

    switch(skillSlot) {
        case(0):
            this.player.setStoredData(this.slot + "zSwordActive1", id);
            this.active1 = skill;
            break;
        case(1):
            this.player.setStoredData(this.slot + "zSwordActive2", id);
            this.active2 = skill;
            break;
        case(2):
            this.player.setStoredData(this.slot + "zSwordPassive1", id);
            this.passive1 = skill;
            break;
        case(3):
            this.player.setStoredData(this.slot + "zSwordPassive2", id);
            this.passive2 = skill;
            break;
    }
    
    gui.getComponent(skillSlot + 50).setTexture(skill.icon);
    gui.update(this.player);

    this.addSkillLore();
}

// -----------------------------------------------------------------------
//                      HEAVIES
// -----------------------------------------------------------------------

/** Returns if player has unlocked heavies
 * @param {IPlayer} player 
 * @returns bool
 */
function hasUnlockedHeavies(player) {
    for(var quest in quests) {
        quest = quests[quest];
        if(!player.hasFinishedQuest(quest["quest_id"])) continue;
        for(var attribute in quest) {
            if(attribute == "unlock.heavy") return true
        }
    }
    return false;
}

/** Finds heavy attack from id
 * @param {Int} id 
 * @returns heavyAttack
 */
function findHeavyAttack(id)
{
    for(var heavy in heavyAttacks) {
        if(heavyAttacks[heavy].id == id) return heavyAttacks[heavy];
    }
}

/** Returns a list of all unlocked heavies
 * @param {IPlayer} player 
 * @returns Object[]
 */
function getHeavies(player)
{
    var availableHeavies = [];
    for(var quest in quests) {
        quest = quests[quest];
        if(!player.hasFinishedQuest(quest["quest_id"])) continue;
        for(var attribute in quest) {
            if(!attribute.startsWith("heavy")) continue;
            var trimmedAttribute = attribute.substring(6);
            // Add level to skill if skill already attributed else add skill at base level
            if(availableHeavies.indexOf(trimmedAttribute) < 0) availableHeavies.push(heavyAttacks[trimmedAttribute]);
        }
    }
    return availableHeavies;
}

/** Sets a heavy attack as selected
 * @param {IPlayer} player 
 * @param {Int} id 
 */
function selectHeavyAttack(player, id, gui)
{
    var playerSlot = lib.getActiveSlotId(player);
    player.setStoredData(playerSlot + "zSwordHeavy", id);

    gui.getComponent(50).setTexture(findHeavyAttack(id).icon);
    gui.update(player);
}

/** Returns currently selected heavy attack
 * @param {IPlayer} player 
 * @returns Object
 */
function getSelectedHeavy(player) {
    return findHeavyAttack(player.getStoredData(lib.getActiveSlotId(player) + "zSwordHeavy"));
}

/** Executes a heavy attack from the player's selected heavy attack
 * @param {IPlayer} player
 */
function doHeavyAttack(player)
{
    var timers = player.timers;
    var playerSlot = lib.getActiveSlotId(player);
    var attack = getSelectedHeavy(player);
    if(!lib.holdingZSword(player)) return;
    var item = player.getHeldItem();
    if(!attack || !attack in heavyAttacks || attack.id < firstPowerId || item.getTag("sheathed") == "true") return;
    if(timers.has(playerSlot + "" + HEAVY_COOLDOWN) && !timers.has(SPAM_PREVENTER)) {
        var remainingCooldown = timers.ticks(playerSlot + "" + HEAVY_COOLDOWN);
        player.sendMessage("Remaining Cooldown on Heavy Attack: " + attack.name + " : " + (Math.round(remainingCooldown/2)/10) + " seconds.");
        timers.forceStart(SPAM_PREVENTER, 10, false);
        return;
    } else if(timers.has(playerSlot + "" +  HEAVY_COOLDOWN) && timers.has(SPAM_PREVENTER)) return;

    player.sendMessage("Performing heavy attack: " + attack.name);
    player.getTempData("zAbilityHandler").handleEvent("heavyActivate");
    timers.forceStart(playerSlot + "" + HEAVY_COOLDOWN, attack.cooldown, false);
}

// For lore display
var keys = {
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