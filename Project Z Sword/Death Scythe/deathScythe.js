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
        "attribute.dbc.Constitution.Multi" : 200,
        "slot.active" : 1,
        "slot.passive" : 1,
        "skill.pinkSkill2" : 1,
        "skill.redSkill" : 1
    },

    quest2 : quest2 = {
        "quest_id" : 12,
        "attribute.main_attack" : 200,
        "attribute.critical_chance" : 100,
        "attribute.dbc.Strength" : 2000,
        "skill.senzuEat" : 1,
        "skill.greenSkill3" : 1,
        "slot.active" : 1,
        "slot.passive" : 1
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

// TIMERS 
var SKILL_COOLDOWN = 341;

var item;

function rightClick(event)
{
    item = event.item;
    var player = event.player;
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
    if(!player.hasFinishedQuest(quests.defaultState.quest_id)) return;
    var appearance = 0;
    for(var quest in quests) {
        if(!player.hasFinishedQuest(quests[quest]["quest_id"])) continue;
        if(quests[quest]["appearance"]) appearance += quests[quest]["appearance"];
    }
    item.setTag("appearance", appearance)

    var attributes = getAttributes(player);
    applyAttributes(item, attributes);

    var activeAppearance = appearanceLevel[appearance];
    setAppearance(item, activeAppearance);
    item.setTag("appearance", appearanceLevel);

    var selectedSkills = getSelectedSkills(player);
    var currentLore = item.getLore();
    addSkillLore(item, currentLore, selectedSkills);

    item.setRequirement("cnpc_soulbind", player.getUniqueID());
    item.setTag("sheathed", "false");
    item.setTag("playerId", player.getEntityId())

    player.setTempData("zSwordFunctions", zSwordFunctions);
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

/** Uses active ability in player's first slot
 * @param {IPlayer} player
 */
function active(player, activeSlot)
{
    if(!skill.skillName || item.getTag("skillUnlocked") != "true") return;
    if(player.timers.has(playerSlot + cooldownTimerId)) {
        var remainingCooldown = player.timers.ticks(playerSlot + cooldownTimerId);
        player.sendMessage("Remaining Cooldown on " + skill.skillName + " : " + (Math.round(remainingCooldown/2)/10) + " seconds.");
        return;
    }
    lib.debugMessage("Noxiiie", "Performing skill: " + skill.skillName)
    player.timers.forceStart(cooldownTimerId, skill.cooldown, false);
}