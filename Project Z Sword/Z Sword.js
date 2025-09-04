// Z Sword.js
// AUTHOR: Noxie

/*
    QUESTS DATA FORMAT

    Add a new quest with:
    questName : questName = {}

    Add properties with:
    "property" : value,

    Leave remove comman from last quest and property

    SUPPORTED PROPERTIES
    "quest_id" (int)
    "attribute.ATTRIBUTE_NAME" (int) - Any custom attribute from CNPC+
    "magic_attribute.MAGIC_ATTRIBUTE_NAME" (int) - Any magic attribute from CNPC+
    "skill.SKILL_NAME" (int) - Any custom skill added by us
    "apperance" (int) - value to add to appearance level (set this to 1)
    "ability_slots" (int) - number of ability slots to unlock with quest
*/
var quests = {
    defaultState : defaultState = {
        "quest_id" : 10,
        "attribute.main_attack" : 1,
        "appearance" : 1
    },

    quest1 : quest1 = {
        "quest_id" : 11,
        "attribute.main_attack" : 100,
        "attribute.dbc.Constitution.Multi" : 200
    },

    quest2 : quest2 = {
        "quest_id" : 12,
        "attribute.main_attack" : 200,
        "attribute.critical_chance" : 100,
        "attribute.dbc.Strength" : 2000,
        "skill.senzu_eat" : 1,
        "ability_slots" : 1
    }
};

/*
    APPEARANCES DATA FORMAT

    Add a new appearance with:
    levelAPPEARANCE_LEVEL = {}

    Add properties with:
    "property" : value,

    Leave remove comman from last appearance and property

    SUPPORTED PROPERTIES
    "item_name" (string)
    "item_texture" (string)
    "lore" (string[])
*/
var appearanceLevel = [
    level0 = {
        "item_name" : "Sheathed Z Sword",
        "item_texture" : "https://i.imgur.com/ov14aCX.png",
        "lore" : ["type shi"]
    },

    level1 = {
        "item_name" : "Z Sword",
        "item_texture" : "jinryuudragonbc:textures/items/item.ItemZSword.png",
        "lore" : ["Cool sword init"]
    },

    level2 = {
        "item_name" : "Z Sword but stronger",
        "item_texture" : "jinryuudragonbc:textures/items/item.ItemZSword.png",
        "lore" : ["Cooler sword init"]
    }
];

var skills = [
    senzuEat = {
        "Icon" : "https://i.imgur.com/tytvfBH.png"
    },

    skill2 = {
        "Icon" : "https://i.imgur.com/tytvfBH.png"
    }
]

// CONFIG

// GUI CONFIG
var SKILL_WINDOW_ID = 301
var skillWindowHeight = 1;
var skillWindowWidth = 1;
var skillIconWidth = 1;
var skillIconHeight = 1;
var skillPosInitialX = 1;
var skillPosInitialY = 1;
var skillIconSpacingX = 1;
var skillIconSpacingY = 1;
var activeLabelPosX = 1;
var activeLabelPosY = 1;
var activeLabelColour = 1111111;
var passiveLabelPosX = 1;
var passiveLabelPosY = 1;
var passiveLabelColour = 11111111;

var slashParticle = API.createParticle("https://i.imgur.com/tytvfBH.png");
slashParticle.setSize(964, 575);
slashParticle.setMaxAge(60);
slashParticle.setAlpha(1, 0, 0.5, 6);
slashParticle.setRotationY(90, 90, 1, 90);



function buildingItem(event)
{
    var item = event.item;
    sheatheWeapon(item);
}

function init(event)
{
    var item = event.item;
    sheatheWeapon(item);
}

function versionChanged(event)
{
    var item = event.item;
    sheatheWeapon(item);
}

function pickedUp(event) {
    var item = event.item;
    sheatheWeapon(item);
}

function tossed(event) {
    var item = event.item;
    sheatheWeapon(item);
}

function rightClick(event)
{
    var item = event.item;
    var player = event.player;
    if(item.getTag("sheathed") == "true") {
        removeSheathe(item, event.player);
        return;
    }

    if(item.getTag("sheathed") == "false") {
        doHeavyAttack();
    }
}   

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
}

/** Swaps item to a functional state based on player data
 * @param {IItemLinked} item 
 * @param {IPlayer} player - Player to use data from
 */
function removeSheathe(item, player)
{
    var appearance = 0;
    for(var quest in quests) {
        if(!player.hasFinishedQuest(quests[quest]["quest_id"])) continue;
        if(quests[quest]["appearance"]) appearance += quests[quest]["appearance"];
    }

    var attributes = getAttributes(player);
    applyAttributes(item, attributes);

    var skills = getSkills(player);

    var activeAppearance = appearanceLevel[appearance];
    setAppearance(item, activeAppearance);

    item.setTag("sheathed", "false");
    item.setTag("playerId", player.getEntityId())
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

/** Gets weapon skills from player data
 * @param {IPlayer} player 
 * @returns all available skills for player's current progression
 */
function getSkills(player)
{
    var availableSkills = {};
    for(var quest in quests) {
        quest = quests[quest];
        if(!player.hasFinishedQuest(quest["quest_id"])) continue;

        for(var attribute in quests[quest]) {
            if(!attribute.startsWith("skill")) continue;

            // Add level to skill if skill already attributed else add skill at base level
            if(availableSkills[attribute]) availableSkills[attribute] += quests[quest][attribute];
            else availableSkills[attribute] = quests[quest][attribute];
        }
    }
    return availableSkills;
}

/** WIP
 * @param {IPlayer} player 
 */
function displaySkillMenu(player)
{
    var skillWindow = API.createCustomGui(SKILL_WINDOW_ID, skillWindowWidth, skillWindowHeight, false);
    var skillWindowBg = API.addTexturedRect(0, skillWindowBgTexture, 0, 0, skillWindowWidth, skillWindowWidth);

    var skillPosX = skillPosInitialX;
    var skillPosY = skillPosInitialY;
    var idIndex = 1;
    var skillIcons = [];
    for(var skill in skills) {
        var button = skillWindow.addTexturedButton(idIndex, "", skillPosX, skillPosY, skillIconWidth, skillIconHeight, skill.icon);
        button.setHoverText(skill.hoverText);
        skillIcons.push(button);
        
        // Handle Icon spacing
        skillPosX += skillIconSpacingX;
        if(skillPosX >= skillPosInitialX + skillIconSpacingX * 4) {
            skillPosX = skillPosInitialX;
            skillPosY += skillIconSpacingY;
        }
        idIndex++;
    }

    var selectedSkills = []; // NYI 
    var selectedIcons = [];
    for(var i = 0; i < 4; i++) {
        var button = skillWindow.addTexturedButton(idIndex, "", selectedPosX[i], selectedPosY[i], skillIconWidth, skillIconHeight, skills[selectedSkills[i]]);
        selectedIcons.push(button);
        idIndex++;
    }

    // Add selection labels
    var activeLabel = skillWindow.addLabel(idIndex, "Active", activeLabelPosX, activeLabelPosY, 0, 0, activeLabelColour);
    idIndex++;
    var passiveLabel = skillWindow.addLabel(idIndex, "Passive", passiveLabelPosX, passiveLabelPosY, 0, 0, passiveLabelColour);
    idIndex++;

    player.showCustomGui(skillWindow);
}

/**
 * 
 */
function doHeavyAttack()
{
    // NYI
}

var places = [200, 200, 280, 280, 360, 360];
var places2 = [60, 230, 60, 230, 60, 230];

function interact(event) {
        var skillGui = API.createCustomGui(1, 400, 450, false);
        var BG = skillGui.addTexturedRect(1, "https://i.imgur.com/9lgI5TR.png", 0, 0, 400, 450);
    for(var i = 0; i < 6; i++) {
        var button = skillGui.addTexturedButton(i+3, "", places2[i], places[i], 425, 188, "https://i.imgur.com/rVd1gbq.png");
        button.setScale(0.3);
        button.setHoverText(["Ability:", "Does infinite damage.", "Damage: Infinite", "Cooldown: 10 seconds"]);
    }
    var label = skillGui.addTexturedRect(10, "https://i.imgur.com/vKr1xli.png", 80, 40, 512, 200);

    label.setScale(0.5);
    
    var button5 = skillGui.addTexturedButton(12, "", 108, 295, 512, 512, "https://i.imgur.com/W53CI9h.png");
    button5.setScale(0.02);
    skillGui.addScroll(11, 20, 300, 100, 40, ["Slot 1", "Slot 2", "Slot 3"]);
    var slot = skillGui.addItemSlot(13, 20, 100, API.createItem("plug:energyBlock", 4, 1));
    slot.setRotation(90);
    
    event.player.showCustomGui(skillGui);
}
