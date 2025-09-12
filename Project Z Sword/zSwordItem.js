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
        "slot.passive" : 1
    },

    quest2 : quest2 = {
        "quest_id" : 12,
        "attribute.main_attack" : 200,
        "attribute.critical_chance" : 100,
        "attribute.dbc.Strength" : 2000,
        "skill.senzu_eat" : 1,
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

var firstSkillId = 3; 
var skills = {
    blankSkill : {
        skillId : 1,
        icon : "https://i.imgur.com/ZDZFUFN.png"
    },

    lockedSkill : {
        skillId : 2,
        icon : "https://i.imgur.com/ZDZFUFN.png"
    },

    senzuEat : {
        skillId : 3,
        skillName : "Senzu Eat",
        icon : "https://i.imgur.com/JapNYVe.png",
        hoverText : "Eat a senzu!"
    },

    greenSkill : {
        skillId : 4,
        skillName : "Green Skill",
        icon : "https://i.imgur.com/s4mm2hB.png",
        hoverText : "I'm green"
    },

    pinkSkill : {
        skillId : 5,
        skillName : "Pink Skill",
        icon : "https://i.imgur.com/M85psrZ.png",
        hoverText : "I'm pink"
    },

    redSkill : {
        skillId : 6,
        skillName : "Red Skill",
        icon : "https://i.imgur.com/RtJFgtI.png",
        hoverText : "I'm red"
    }
};

var heavyAttacks = {};

var zSwordFunctions = {
    select : selectSkill,
    displaySkillMenu: displaySkillMenu,
    active : active,
    heavyAttack : doHeavyAttack
};

// CONFIG
// GUI CONFIG
var SKILL_WINDOW_ID = 301
var skillWindowBgTexture = "https://i.imgur.com/QXDqrp1.png";
var skillWindowHeight = 167;
var skillWindowWidth = 240;

var skillIconWidth = 24;
var skillIconHeight = 24;
var skillPosInitialX = 17;
var skillPosInitialY = 18.6;
var skillIconSpacingX = 30.4;
var skillIconSpacingY = 30.4;

var selectedPosX = [153, 200, 153, 200];
var selectedPosY = [33, 33, 112, 112];

var tabWidth = 12;
var tabHeight = 44;
var tabPosY = 10;
var tabSpacing = 7;
var tabTexture = "https://i.imgur.com/nZC2LMY.png";

var activeLore = "Active Abilities: ";
var passiveLore = "Passive Abilities: ";

var tossMessage = "The Z Sword fades away as it leaves your hands.";

var slashParticle = API.createParticle("https://i.imgur.com/tytvfBH.png");
slashParticle.setSize(964, 575);
slashParticle.setMaxAge(60);
slashParticle.setAlpha(1, 0, 0.5, 6);
slashParticle.setRotationY(90, 90, 1, 90);

var item;

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
    lib.debugMessage(event.player.getName(), tossMessage);
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
        
        //doHeavyAttack();
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
    item.setTag("appearance", appearance)

    var attributes = getAttributes(player);
    applyAttributes(item, attributes);

    var activeAppearance = appearanceLevel[appearance];
    setAppearance(item, activeAppearance);
    item.setTag("appearance", appearanceLevel);

    var selectedSkills = getSelectedSkills(player);
    var lore = [];
    var currentLore = item.getLore();
    for(var string in currentLore) {
        lore.push(currentLore[string]);
    }
    if((selectedSkills[0] && selectedSkills[0].skillId >= firstSkillId) || (selectedSkills[1] && selectedSkills[1].skillId >= firstSkillId)) {
        lore.push(activeLore + (selectedSkills[0].skillName ? selectedSkills[0].skillName + ", " : "None, ") + (selectedSkills[1].skillName ? selectedSkills[1].skillName : "None"));
    }
    if((selectedSkills[2] && selectedSkills[2].skillId >= firstSkillId) || (selectedSkills[3] && selectedSkills[3].skillId >= firstSkillId)) { 
        lore.push(passiveLore + (selectedSkills[2].skillName ? selectedSkills[2].skillName + ", " : "None, ") + (selectedSkills[3].skillName ? selectedSkills[3].skillName : "None"));
    }
    item.setLore(lore);

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

/** Gets available weapon skills from player data
 * @param {IPlayer} player 
 * @returns all available skills for player's current progression
 */
function getSkills(player)
{
    var availableSkills = {};
    for(var quest in quests) {
        quest = quests[quest];
        if(!player.hasFinishedQuest(quest["quest_id"])) continue;

        for(var attribute in quest) {
            if(!attribute.startsWith("skill")) continue;

            // Add level to skill if skill already attributed else add skill at base level
            if(availableSkills[attribute]) availableSkills[attribute] += quest[attribute];
            else availableSkills[attribute] = quest[attribute];
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

/** Gets weapon skills from player data
 * @param {IPlayer} player 
 * @returns all available skills for player's current progression
 */
function getSelectedSkills(player) 
{
    var selected = [];
    var playerSlot = lib.getActiveSlotId(player);
    selected.push(findSkill(player.getStoredData(playerSlot + "zSwordActive1")));
    selected.push(findSkill(player.getStoredData(playerSlot + "zSwordActive2")));
    selected.push(findSkill(player.getStoredData(playerSlot + "zSwordPassive1")));
    selected.push(findSkill(player.getStoredData(playerSlot + "zSwordPassive2")));
    return selected;
}

/** Displays a skill selection window to the player
 * @param {IPlayer} player 
 */
function displaySkillMenu(player)
{
    if(item.getTag("sheathed" == "true") || item.getTag("broken") == "true") return;
    var skillWindow = API.createCustomGui(SKILL_WINDOW_ID, skillWindowWidth + tabWidth, skillWindowHeight, false);
    var skillWindowBg = skillWindow.addTexturedRect(0, skillWindowBgTexture, 0, 0, skillWindowWidth, skillWindowHeight);

    var skillPosX = skillPosInitialX;
    var skillPosY = skillPosInitialY;
    var unlockedSkills = getSkills(player);
    var skillIcons = [];
    // Button ids 1-skills_length
    for(var skill in skills) {
        if(skills[skill].skillId < firstSkillId) continue;
        if(!skill in unlockedSkills) {
            var button = skillWindow.addTexturedRect(skills.lockedSkill.skillId, skills.lockedSkill.icon, skillPosX, skillPosY, skillIconWidth, skillIconHeight);
        } else {
            var button = skillWindow.addTexturedButton(skills[skill].skillId, "", skillPosX, skillPosY, skillIconWidth, skillIconHeight, skills[skill].icon);
            if(skills[skill].hoverText) button.setHoverText(skills[skill].hoverText);
        }

        skillIcons.push(button);
        
        // Handle Icon spacing
        skillPosX += skillIconSpacingX;
        if(skillPosX >= skillPosInitialX + skillIconSpacingX * 4) {
            skillPosX = skillPosInitialX;
            skillPosY += skillIconSpacingY;
        }
    }

    var idIndex = 50;
    var selectedSkills = getSelectedSkills(player);
    var skillSlots = getSkillSlots(player);
    var selectedIcons = [];
    // Button ids 50-54
    for(var i = 0; i < 4; i++) {
        if(!selectedSkills[i] || selectedSkills[i] == "") selectedSkills[i] = "blankSkill";
        if(!skillSlots[i]) var button = skillWindow.addTexturedRect(idIndex, skills.blankSkill.icon, selectedPosX[i], selectedPosY[i], skillIconWidth, skillIconHeight);
        else var button = skillWindow.addTexturedButton(idIndex, "", selectedPosX[i], selectedPosY[i], skillIconWidth, skillIconHeight, selectedSkills[i].icon);
        selectedIcons.push(button);
        idIndex++;
    }

    // Tabs
    var heavyTab = skillWindow.addTexturedButton(56, "", skillWindowWidth, tabPosY, tabWidth, tabHeight, tabTexture);
    var keybindTab = skillWindow.addTexturedButton(57, "", skillWindowWidth, tabPosY + tabHeight + tabSpacing, tabWidth, tabHeight, tabTexture);

    player.showCustomGui(skillWindow);
}

/** Finds skill name from id
 * @param {Int} skillId 
 * @returns skill
 */
function findSkill(skillId)
{
    for(var skill in skills) {
        if(skills[skill].skillId == skillId) return skills[skill];
    }
}

/** Sets a skill as selected
 * @param {IPlayer} player 
 * @param {Int} skillId 
 * @param {Int} skillSlot 
 */
function selectSkill(player, skillId, skillSlot, gui)
{
    var playerSlot = lib.getActiveSlotId(player);
    var zSword = lib.holdingZSword(player) ? player.getHeldItem() : item;
    var selectedSkills = getSelectedSkills(player);
    var skillIndex = selectedSkills.indexOf(findSkill(skillId));
    if(skillIndex == skillSlot) return;
    // Unselect skill if already selected
    if(skillIndex > -1) {
        switch(skillIndex) {
            case(0):
                player.setStoredData(playerSlot + "zSwordActive1", 1);
                break;
            case(1):
                player.setStoredData(playerSlot + "zSwordActive2", 1);
                break;
            case(2):
                player.setStoredData(playerSlot + "zSwordPassive1", 1);
                break;
            case(3):
                player.setStoredData(playerSlot + "zSwordPassive2", 1);
                break;
        }
        gui.getComponent(selectedSkills.indexOf(findSkill(skillId)) + 50).setTexture(skills.blankSkill.icon);
        gui.update(player);
    } 

    switch(skillSlot) {
        case(0):
            player.setStoredData(playerSlot + "zSwordActive1", skillId);
            break;
        case(1):
            player.setStoredData(playerSlot + "zSwordActive2", skillId);
            break;
        case(2):
            player.setStoredData(playerSlot + "zSwordPassive1", skillId);
            break;
        case(3):
            player.setStoredData(playerSlot + "zSwordPassive2", skillId);
            break;
    }

    gui.getComponent(skillSlot + 50).setTexture(findSkill(skillId).icon);
    gui.update(player);

    var newSelected = getSelectedSkills(player);
    var oldLore = appearanceLevel[zSword.getTag("appearance")].lore;
    var lore = [];
    for(var string in oldLore) {
        lore.push(oldLore[string])
    }
    if((newSelected[0] && newSelected[0].skillId >= firstSkillId) || (newSelected[1] && newSelected[1].skillId >= firstSkillId)) {
        lore.push(activeLore + (newSelected[0].skillName ? newSelected[0].skillName + ", " : "None, ") + (newSelected[1].skillName ? newSelected[1].skillName : "None"));
    }
    if((newSelected[2] && newSelected[2].skillId >= firstSkillId) || (newSelected[3] && newSelected[3].skillId >= firstSkillId)) { 
        lore.push(passiveLore + (newSelected[2].skillName ? newSelected[2].skillName + ", " : "None, ") + (newSelected[3].skillName ? newSelected[3].skillName : "None"));
    }
    zSword.setLore(lore);
}

/** Finds heavy attack from id
 * @param {Int} heavyId 
 * @returns heavyAttack
 */
function findHeavyAttack(heavyId)
{
    for(var heavy in heavyAttacks) {
        if(heavyAttacks[heavy].heavyId == heavyId) return heavyAttacks[heavy];
    }
}

/** Sets a heavy attack as selected
 * @param {IPlayer} player 
 * @param {Int} heavyId 
 */
function selectHeavyAttack(player, heavyId)
{
    var playerSlot = lib.getActiveSlotId(player);
    player.setStoredData(playerSlot + "zSwordHeavy", heavyId);
}

/** Executes a heavy attack from the player's selected heavy attack
 * @param {IPlayer} player
 */
function doHeavyAttack(player)
{
    var playerSlot = lib.getActiveSlotId(player);
    var attack = findHeavyAttack(player.getStoredData(playerSlot + "zSwordHeavy"));
    if(!attack in heavyAttacks || item.getTag("sheathed") == "true") return;
}

/** Uses active ability in player's first slot
 * @param {IPlayer} player
 */
function active(player, activeSlot)
{
    var playerSlot = lib.getActiveSlotId(player);
    var skill = findHeavyAttack(player.getStoredData(playerSlot + "zSwordActive" + activeSlot));
    if(!skill in skills || item.getTag("sheathed") == "true") return;
}