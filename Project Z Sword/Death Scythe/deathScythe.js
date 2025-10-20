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
        "quest_id" : -1, // DON'T EDIT QUEST ID OF DEFAULT STATE
        "attribute.main_attack" : 10,
        "level_req" : 1
    },

    funQuest : funQuest = {
        "quest_id" : 11,
        "attribute.main_attack" : 100,
        "attribute.dbc.Constitution.Multi" : 200,
    },

    boringQuest : boringQuest = {
        "quest_id" : 12,
        "attribute.main_attack" : 200,
        "attribute.critical_chance" : 100,
        "attribute.dbc.Strength" : 2000,
        "appearance" : 1,
        "skill.unlock" : 1,
        "skill.damage" : 100
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
        "item_name" : "Level 0 Scythe",
        "item_texture" : "customnpcs:textures/items/npcDemonicScythe.png",
        "lore" : ["not a z sword"]
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

var skillData = {
    "name" : "Cool skill",
    "cooldown" : 600  // In Ticks
}

// TIMERS 
var SKILL_COOLDOWN = 356;
var SPAM_PREVENTER = 357

// DO NOT EDIT
var item;

function init(event)
{
    var item = event.item;
    item.setTag(-1, 1);
    item.setTag("isDeathScythe", 1);
    updateItem(item)
}

function buildingItem(event)
{
    var item = event.item;
    item.setTag(-1, 1);
    item.setTag("isDeathScythe", 1);
    updateItem(item)
}

function tick(event) 
{
    var item = event.item;
    if(item.getTag("update") != 1) return;
    item.setTag("update", 0);
    clearStats(item);
    updateItem(item);
}

function rightClick(event)
{
    var item = event.item;
    var player = event.player;
    useSkill(player, item);
}   

/** Swaps item to a functional state based on player data
 * @param {IItemLinked} item 
 * @param {IPlayer} player - Player to use data from
 */
function updateItem(item)
{
    clearStats(item);

    var appearance = 0;
    var levelReq = 0;
    for(var quest in quests) {
        if(item.getTag(quests[quest]["quest_id"]) != 1) continue;
        if(quests[quest]["appearance"]) appearance += quests[quest]["appearance"];
        if(quests[quest]["level_req"]) levelReq += quests[quest]["level_req"];
        if(quests[quest]["skill.unlock"]) item.setTag("skillUnlocked", 1);
    }
    item.setTag("appearance", appearance)
    item.setTag("level_req", levelReq)

    var attributes = getAttributes(item);
    applyAttributes(item, attributes);

    var activeAppearance = appearanceLevel[appearance];
    setAppearance(item, activeAppearance);
    item.setTag("appearance", appearanceLevel);

    var currentLore = item.getLore();
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
            } else if(attribute == "skill.unlock") {
                item.setTag("skillUnlocked", 0);
            }
        }
    }
}

/** Gets weapon attributes from player data
 * @param {IPlayer} player 
 * @returns all available attributes for player's current progression
 */
function getAttributes(item) 
{
    var availableAttributes = {};
    for(var quest in quests) {
        quest = quests[quest];
        if(item.getTag(quest["quest_id"]) != 1) continue;
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

/** Uses active ability in player's first slot
 * @param {IPlayer} player
 * @param {ILinkedItem} item
 */
function useSkill(player, item)
{
    var playerSlot = lib.getActiveSlotId(player);
    if(!lib.isPlayer(player) || lib.getDbcLevel(player) < item.getTag("level_req") || item.getTag("skillUnlocked") != 1) return;
    var timers = player.timers;
    if(timers.has(playerSlot + SKILL_COOLDOWN) && !timers.has(SPAM_PREVENTER)) {
        var remainingCooldown = timers.ticks(playerSlot + SKILL_COOLDOWN);
        player.sendMessage("Remaining Cooldown on " + skill.name + " : " + (Math.round(remainingCooldown/2)/10) + " seconds.");
        timers.forceStart(SPAM_PREVENTER, 10, false);
        return;
    }
    lib.debugMessage("Noxiiie", "Performing skill: " + skill.name)
    player.timers.forceStart(playerSlot + SKILL_COOLDOWN, skill.cooldown, false);
}