// deathScythe.js
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
    "skill.unlock" (int) - Unlocks weapon skill
    "skill.damage" (int) - weapon damage
    "apperance" (int) - value to add to appearance level (set this to 1)
    "ability_slots" (int) - number of ability slots to unlock with quest
    "level_req" (int) - Add to level requirement
*/
var quests = {
    defaultState: {
        "quest_id" : -1, // DON'T EDIT QUEST ID OF DEFAULT STATE
        "attribute.main_attack" : 10,
        "level_req" : 1,
        "skill.damage" : 100
    },

    quest2: {
        "quest_id" : 10,
        "attribute.main_attack" : 1069,
        "level_req": 101
    },

    funQuest: {
        "quest_id" : 11,
        "attribute.main_attack" : 100,
        "level_req": 1000,
        "skill.damage" : 100
    },

    boringQuest: {
        "quest_id" : 12,
        "attribute.main_attack" : 200,
        "appearance" : 1,
        "skill.unlock" : 1,
        "skill.damage" : 100
    }
};
var fullPowerQuestId = 12;

API.addGlobalObject("scytheData", quests);

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
        "item_texture" : "https://zsstorage.xyz/GUIs/Haruna%20GUI/HolloweenScythe.png",
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
    API.addGlobalObject("scytheData", quests);
    var item = event.item;
    item.setTag(-1, 1);
    item.setTag("isDeathScythe", 1);
    updateItem(item)
}

function buildingItem(event)
{
    API.addGlobalObject("scytheData", quests);
    var item = event.item;
    item.setTranslate(-0.3, 0.1, -0.4);
    item.setRotation(0, 180, 0);
    item.setTag(-1, 1);
    item.setTag("isDeathScythe", 1);
    updateItem(item)
}

function versionChanged(event) {
    var item = event.item;
    item.setTranslate(-0.3, 0.1, -0.4);
    item.setRotation(0, 180, 0);
    item.setTag(-1, 1);
    item.setTag("isDeathScythe", 1);
    updateItem(item)
}

// Check for item updates
function tick(event) 
{
    var item = event.item;
    if(item.getTag("update") != 1) return;
    item.setTag("update", 0);

    // Check for item reset
    if(item.getTag("reset") == 1) {
        var player = API.getPlayer(item.getTag("player"));
        if(!lib.isPlayer(player)) return;
        lib.debugMessage("Noxiiie", "RESETING")
        reset(item, player);
        item.setTag("reset", 0);
    }
    
    updateItem(item);
}

function rightClick(event)
{
    useSkill(event.player, event.item);
}   

/** Swaps item to a functional state based on player data
 * @param {IItemLinked} item 
 * @param {IPlayer} player - Player to use data from
 */
function updateItem(item)
{
    clearStats(item);

    // Check outlier stats
    var appearance = 0;
    var levelReq = 0;
    var skillDamage = 0;
    for(var quest in quests) {
        if(item.getTag(quests[quest]["quest_id"]) != 1) continue;
        if(quests[quest]["appearance"]) appearance += quests[quest]["appearance"];
        if(quests[quest]["level_req"]) levelReq += quests[quest]["level_req"];
        if(quests[quest]["skill.unlock"]) item.setTag("skillUnlocked", 1);
        if(quests[quest]["skill.damage"]) skillDamage += quests[quest]["skill.damage"];
    }
    item.setTag("appearance", appearance);
    item.setTag("power", levelReq);
    item.setTag("skill_damage", skillDamage);

    var attributes = getAttributes(item);
    applyAttributes(item, attributes);

    var activeAppearance = appearanceLevel[appearance];
    setAppearance(item, activeAppearance);
    item.setTag("appearance", appearanceLevel);
}

/** Sets appearence of item from appearance object
 * @param {IItemLinked} item 
 * @param {Object} appearance 
 */
function setAppearance(item, appearance)
{
    if(appearance.item_name) item.setCustomName(appearance.item_name);
    if(appearance.lore) item.setLore(appearance.lore.concat("\u00A77\u00A7rLevel Req: " + item.getTag("power")));
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
            if(attribute == "attribute.main_attack") {
                item.setAttribute("generic.attackDamage", 1);
            } else if(attribute.startsWith("attribute")) {
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
 * @param {IItemLinked} item 
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
        if(attribute == "attribute.main_attack") {
            item.setAttribute("generic.attackDamage", attributes[attribute]);
        } else if(attribute.startsWith("attribute")) {
            // Trim off attribute tag
            var trimmedAttribute = attribute.substring(10);
            item.setCustomAttribute(trimmedAttribute, attributes[attribute]);
        } else if(attribute.startsWith("magic_attribute")) {
            // Trim off magic attribute tag
            var trimmedAttribute = attribute.substring(16);
            item.setMagicAttribute(trimmedAttribute, attributes[attribute]);
        }
    }
}

/** Resets the scythe back to default level
 * @param {IItemStack} item 
 * @param {IPlayer} player 
 */
function reset(item, player) {
    if(item.getTag(fullPowerQuestId) == 1) return;
    for(var quest in quests) {
        quest = quests[quest];
        var id = quest["quest_id"];
        if(id == -1 || id == fullPowerQuestId) continue;
        item.setTag(id, 0);
        player.setStoredData("s" + lib.getActiveSlotId(player) + "id" + id, 0);
        player.removeQuest(id);
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
    // Check skill cd and send cooldown message
    if(timers.has(playerSlot + SKILL_COOLDOWN) && !timers.has(SPAM_PREVENTER)) {
        var remainingCooldown = timers.ticks(playerSlot + SKILL_COOLDOWN);
        player.sendMessage("Remaining Cooldown on " + skillData.name + " : " + (Math.round(remainingCooldown/2)/10) + " seconds.");
        timers.forceStart(SPAM_PREVENTER, 10, false);
        return;
    } else if(timers.has(playerSlot + SKILL_COOLDOWN) && timers.has(SPAM_PREVENTER)) return;
    player.timers.forceStart(playerSlot + SKILL_COOLDOWN, skillData.cooldown, false);

    performSkill(player, item.getTag("skill_damage"));
}

// PLACEHOLDER
function performSkill(player, skillDamage) {}