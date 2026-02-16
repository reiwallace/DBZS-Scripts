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
        "item_name" : "&rSheathed Z Sword",
        "item_texture" : "https://i.ibb.co/qZBpxx4/ov14a-CX.png",
        "lore" : ["type shi"]
    },

    level1 = {
        "item_name" : "&rZ Sword",
        "item_texture" : "jinryuudragonbc:textures/items/item.ItemZSword.png",
        "lore" : ["&rLore dump"]
    },

    level2 = {
        "item_name" : "&rZ Sword but stronger",
        "item_texture" : "jinryuudragonbc:textures/items/item.ItemZSword.png",
        "lore" : ["&rLore dump"]
    }
];

var firstSkillId = 3; 
var skills = {
    blankSkill : {
        skillName : "None",
        skillId : 1,
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/zSwordButtons.png"
    },

    lockedSkill : {
        skillName : "None",
        skillId : 2,
        icon : "https://i.ibb.co/vCJJd35f/Ki-Uzxn-Z.png"
    },

    senzuEat : {
        skillId : 3,
        skillName : "&2Senzu Eat&r&f",
        icon : "https://i.ibb.co/Q31g6swd/Jap-NYVe.png",
        upgradeCost: 1,
        hoverText : "Eat a senzu!",
        cooldown : 200,
        active : function(event) {
            event.player.sendMessage("Wow I just sent this from the active ability!!");
            event.player.sendMessage("Is this skill super? " + event.super);
        },
        passive : function(event) {
            
        }
    },

    greenSkill : {
        skillId : 4,
        skillName : "&aGreen Skill1&r&f",
        icon : "https://i.ibb.co/bM92BbhQ/s4mm2h-B.png",
        upgradeCost: 1,
        hoverText : "I'm green",
        cooldown : 200,
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    pinkSkill : {
        skillId : 5,
        skillName : "&dPink Skill&r&f",
        icon : "https://i.ibb.co/wZsxYccj/M85psr-Z.png",
        upgradeCost: 1,
        hoverText : "I'm pink",
        cooldown : 200,
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    redSkill : {
        skillId : 6,
        skillName : "&4&lRed &4&mSkill&r&f",
        icon : "https://i.ibb.co/d4jwqMj7/Rt-JFgt-I.png",
        upgradeCost: 1,
        hoverText : "I'm red",
        cooldown : 200,
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    senzuEat2 : {
        skillId : 7,
        skillName : "&2Senzu Eat&r&f",
        icon : "https://i.ibb.co/Q31g6swd/Jap-NYVe.png",
        upgradeCost: 1,
        hoverText : "Eat a senzu!",
        cooldown : 200,
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    greenSkill2 : {
        skillId : 8,
        skillName : "&aGreen Skill2&r&f",
        icon : "https://i.ibb.co/bM92BbhQ/s4mm2h-B.png",
        upgradeCost: 1,
        hoverText : "I'm green",
        cooldown : 200,
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    pinkSkill2 : {
        skillId : 9,
        skillName : "&dPink Skill&r&f",
        icon : "https://i.ibb.co/wZsxYccj/M85psr-Z.png",
        upgradeCost: 1,
        hoverText : "I'm pink",
        cooldown : 200,
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    redSkill2 : {
        skillId : 10,
        skillName : "&4&lRed &4&mSkill&r&f",
        icon : "https://i.ibb.co/d4jwqMj7/Rt-JFgt-I.png",
        upgradeCost: 1,
        hoverText : "I'm red",
        cooldown : 200,
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    senzuEat3 : {
        skillId : 11,
        skillName : "&2Senzu Eat&r&f",
        icon : "https://i.ibb.co/Q31g6swd/Jap-NYVe.png",
        upgradeCost: 1,
        hoverText : "Eat a senzu!",
        cooldown : 200,
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    greenSkill3 : {
        skillId : 12,
        skillName : "&aGreen Skill3&r&f",
        icon : "https://i.ibb.co/bM92BbhQ/s4mm2h-B.png",
        upgradeCost: 1,
        hoverText : "I'm green",
        cooldown : 200,
        active : function(event) {

        },
        passive : function(event) {
            event.player.sendMessage("Passive Trigger from: " + event.type);
        }
    },

    pinkSkill3 : {
        skillId : 13,
        skillName : "&dPink Skill&r&f",
        icon : "https://i.ibb.co/wZsxYccj/M85psr-Z.png",
        upgradeCost: 1,
        hoverText : "I'm pink",
        cooldown : 200,
        active : function(event) {

        },
        passive : function(event) {
            
        }
    },

    redSkill3 : {
        skillId : 14,
        skillName : "&4&lRed &4&mSkill&r&f",
        icon : "https://i.ibb.co/d4jwqMj7/Rt-JFgt-I.png",
        upgradeCost: 1,
        hoverText : "I'm red",
        cooldown : 200,
        active : function(event) {

        },
        passive : function(event) {
            
        }
    }
};

var heavyAttacks = {
    blankHeavy : {
        heavyName : "None",
        heavyId : 1,
        icon : "https://zsstorage.xyz/LandOfTheKais/ZSwordGUI/zSwordButtons.png"
    },

    lockedHeavy : {
        heavyName : "None",
        heavyId : 2,
        icon : "https://i.ibb.co/vCJJd35f/Ki-Uzxn-Z.png"
    },

    slap : {
        heavyName : "Slap",
        heavyId : 3,
        icon : "https://i.ibb.co/d4jwqMj7/Rt-JFgt-I.png",
        upgradeCost: 1,
        hoverText : "I'm pink",
        cooldown : 200,
        active : function(event) {
            event.player.world.explode(event.player.getPosition(), 5, false, false);
            event.player.sendMessage("Is this heavy super? " + event.super);
        },
    }
};

var zSwordFunctions = {
    displaySkillMenu: displaySkillMenu,
    displayHeavyMenu: displayHeavyMenu,
    selectHeavyAttack: selectHeavyAttack,
    heavyAttack : doHeavyAttack
    //upgrade: upgrade
};

// CONFIG
// GUI CONFIG
var SKILL_WINDOW_ID = 301
var skillWindowBgTexture = "https://i.ibb.co/rKtdZR6h/zs-GUI2-box4.png";
var heavyWindowBgTexture = "https://i.ibb.co/vvPCSrdv/zs-GUI2-box5.png";
var skillWindowHeight = 171;
var skillWindowWidth = 243;

var skillIconWidth = 24;
var skillIconHeight = 24;
var skillPosInitialX = 17;
var skillPosInitialY = 18.6;
var skillIconSpacingX = 30.4;
var skillIconSpacingY = 30.4;

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

// LORE CONFIG
var activeLore = "&6&lActive Abilities: ";
var passiveLore = "&6&lPassive Abilities: ";

var tossMessage = "The Z Sword fades away as it leaves your hands.";

// HEAVY CONFIG
var slashParticle = API.createParticle("https://i.imgur.com/tytvfBH.png");
slashParticle.setSize(964, 575);
slashParticle.setMaxAge(60);
slashParticle.setAlpha(1, 0, 0.5, 6);
slashParticle.setRotationY(90, 90, 1, 90);

// TIMERS DON'T EDIT
var ACTIVE_1_COOLDOWN = 321;
var ACTIVE_2_COOLDOWN = 322;
var HEAVY_COOLDOWN = 323;
var SPAM_PREVENTER = 357;

var item;
var abilHandler;

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
        abilHandler.handleEvent("itemAttack");
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

/** Finds previously upgraded Heavies
 * @param {IPlayer} player 
 * @param {Int} type - 0: ability, 1: heavy
 */
function findUpgrades(player, type) {
    if(!lib.isPlayer(player) || (type == 0 ? player.hasStoredData(lib.getActiveSlotId(player) + "zSwordSkillUpgrade") : player.hasStoredData(lib.getActiveSlotId(player) + "zSwordHeavyUpgrade"))) return false;
    var playerSlot = lib.getActiveSlotId(player);
    var upgradeString = type == 0 ? player.getStoredData(playerSlot + "zSwordSkillUpgrade") : player.getStoredData(playerSlot + "zSwordHeavyUpgrade");
    var upgradeArr = upgradeString.split(",");
    var upgradeObject = {};
    for(var s in upgradeArr) {
        s = upgradeArr[s];
        var split = s.split("=");
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

/** Upgrades skill
 * @param {*} player 
 * @param {*} type 
 * @param {*} id 
 * @returns 
 */
/**function upgrade(player, type, id) {
    if(isUpgraded(player, type, id)) return 2;
    var playerSlot = lib.getActiveSlotId(player);
    if(!player.hasStoredData(playerSlot + "zSwordUpgradePoints")) return 5;
    if(type == 0) {
        var skill = findSkill(id);
        var points = player.getStoredData();
        // Handle unable to upgrade
        if(!skill || !("upgradeCost" in skill) || getSkills(player).indexOf(skill) < 0) return 3;
        if(points - skill.upgradeCost < 0) return 4;

        // Upgrade
        player.setStoredData(playerSlot + "zSwordUpgradePoints", points - skill.upgradeCost);
        player.setStoredData(playerSlot + "zSwordSkillUpgrade", player.getStoredData(playerSlot + "zSwordSkillUpgrade") + "," + id + "=1");
        return 1;
    } else if(type == 1) {
        var heavy = findHeavyAttack(id);
        var points = player.getStoredData(playerSlot + "zSwordUpgradePoints");
        // Handle unable to upgrade
        if(!heavy || !("upgradeCost" in heavy) || getHeavies(player).indexOf(heavy) < 0) return 3;
        if(points - heavy.upgradeCost < 0) return 4;

        // Upgrade
        player.setStoredData(playerSlot + "zSwordUpgradePoints", points - heavy.upgradeCost);
        player.setStoredData(playerSlot + "zSwordHeavyUpgrade", player.getStoredData(playerSlot + "zSwordHeavyUpgrade") + "," + id + "=1"); 
        return 1;
    }
}*/

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

        if(unlockedSkills.indexOf(skills[skill]) < 0) {
            var button = skillWindow.addTexturedRect(skills[skill].skillId, skills.lockedSkill.icon, skillPosX, skillPosY, skillIconWidth, skillIconHeight);
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
    var selectedSkills = abilHandler.getSelectedSkills();
    var skillSlots = getSkillSlots(player);
    // Button ids 50-54
    for(var i = 0; i < 4; i++) {
        if(!selectedSkills[i] || selectedSkills[i] == "") selectedSkills[i] = skills.blankSkill;
        if(!skillSlots[i]) {
            var button = skillWindow.addTexturedRect(idIndex, skills.blankSkill.icon, selectedPosX[i], selectedPosY[i], skillIconWidth, skillIconHeight);
            skillWindow.addTexturedRect(idIndex + 4, selectedLockTexture, selectedPosX[i] - (selectedLockSize - skillIconWidth)/2, selectedPosY[i] - (selectedLockSize - skillIconHeight)/2, selectedLockSize, selectedLockSize);
        }
        else var button = skillWindow.addTexturedButton(idIndex, "", selectedPosX[i], selectedPosY[i], skillIconWidth, skillIconHeight, selectedSkills[i].icon);
        idIndex++;
    }

    // Tabs
    var heavyTab = skillWindow.addTexturedButton(62, "", skillWindowWidth - 2, tabPosY, tabWidth, tabHeight, tabTexture);
    //var keybindTab = skillWindow.addTexturedButton(63, "", skillWindowWidth - 2, tabPosY + tabHeight + tabSpacing, tabWidth, tabHeight, tabTexture);

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
    if(!skill || item.getTag("sheathed") == "true" || !lib.holdingZSword(this.player)) return;

    if(timers.has(compoundTimerId) && !timers.has(this.SPAM_PREVENTER)) {
        var remainingCooldown = timers.ticks(compoundTimerId);
        this.player.sendMessage("Remaining Cooldown on Skill: " + skill.skillName + " : " + (Math.round(remainingCooldown/2)/10) + " seconds.");
        timers.forceStart(this.SPAM_PREVENTER, this.spamCd, false);
        return;
    } else if(timers.has(compoundTimerId) && timers.has(this.SPAM_PREVENTER)) return;
    
    this.player.sendMessage("Performing skill: " + skill.skillName);
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
        potency: 1.5,
        slot: null
    }

    // Trigger passives and actives
    if(eventType == "heavyActivate" && getSelectedHeavy(this.player)) {
        var heavy = getSelectedHeavy(this.player)
        if(isUpgraded(this.player, 1, heavy.heavyId)) event.super = true;
        heavy.active(event);
    }
    if(eventType == "abilityActivate1" && this.active1 && "active" in this.active1) {
        event.slot = "active1"
        if(isUpgraded(this.player, 0, this.active1.skillId)) event.super = true;
        this.active1.active(event);
    }
    if(eventType == "abilityActivate2" && this.active2 && "active" in this.active2) {
        event.slot = "active2"
        if(isUpgraded(this.player, 0, this.active2.skillId)) event.super = true;
        this.active2.active(event);
    }
    if(this.active1 && "passive" in this.active1) {
        event.slot = "active1"
        if(isUpgraded(this.player, 0, this.active1.skillId)) event.super = true;
        this.active1.passive(event);
    }
    if(this.active2 && "passive" in this.active2) {
        event.slot = "active2"
        if(isUpgraded(this.player, 0, this.active2.skillId)) event.super = true;
        this.active2.passive(event);
    }
    if(this.passive1 && "passive" in this.passive1) {
        event.slot = "passive1"
        if(isUpgraded(this.player, 0, this.passive1.skillId)) event.super = true;
        this.passive1.passive(event);
    }
    if(this.passive2 && "passive" in this.passive2) {
        event.slot = "passive2"
        if(isUpgraded(this.player, 0, this.passive2.skillId)) event.super = true;
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
    if((selectedSkills[0] && selectedSkills[0].skillId >= firstSkillId) || (selectedSkills[1] && selectedSkills[1].skillId >= firstSkillId)) {
        lore.push(
            activeLore + 
            (selectedSkills[0] && selectedSkills[0].skillName != "None" ? selectedSkills[0].skillName + " &7&l[KEY]".replace("KEY", this.player.hasStoredData("zSwordActive1Key") ? keys[this.player.getStoredData("zSwordActive1Key")] : keys["41"]) : "&r&fNone") + 
            "&r, " +
            (selectedSkills[1] && selectedSkills[1].skillName != "None" ? selectedSkills[1].skillName + " &7&l[KEY]".replace("KEY", this.player.hasStoredData("zSwordActive2Key") ? keys[this.player.getStoredData("zSwordActive2Key")] : keys["58"]) : "&r&fNone")
        );
        
    }
    if((selectedSkills[2] && selectedSkills[2].skillId >= firstSkillId) || (selectedSkills[3] && selectedSkills[3].skillId >= firstSkillId)) { 
        lore.push(
            passiveLore + 
            (selectedSkills[2] ? selectedSkills[2].skillName : "&r&fNone") + 
            "&r, " +
            (selectedSkills[3] ? selectedSkills[3].skillName : "&r&fNone")
        );
    }
    lib.findZSword(this.player).setLore(lore);
}

/** Sets a skill as selected
 * @param {IPlayer} player 
 * @param {Int} skillId 
 * @param {Int} skillSlot 
 */
abilityHandler.prototype.selectSkill = function(skillId, skillSlot, gui) {
    var selectedSkills = this.getSelectedSkills();
    var skillIndex = selectedSkills.indexOf(findSkill(skillId));
    if(skillIndex == skillSlot) return;
    // Unselect skill if already selected
    if(skillIndex > -1) {
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
        gui.getComponent(selectedSkills.indexOf(findSkill(skillId)) + 50).setTexture(skills.blankSkill.icon);
        gui.update(this.player);
    } 

    switch(skillSlot) {
        case(0):
            this.player.setStoredData(this.slot + "zSwordActive1", skillId);
            this.active1 = findSkill(skillId);
            break;
        case(1):
            this.player.setStoredData(this.slot + "zSwordActive2", skillId);
            this.active2 = findSkill(skillId);
            break;
        case(2):
            this.player.setStoredData(this.slot + "zSwordPassive1", skillId);
            this.passive1 = findSkill(skillId);
            break;
        case(3):
            this.player.setStoredData(this.slot + "zSwordPassive2", skillId);
            this.passive2 = findSkill(skillId);
            break;
    }
    
    gui.getComponent(skillSlot + 50).setTexture(findSkill(skillId).icon);
    gui.update(this.player);

    this.addSkillLore();
}

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
 * @param {Int} heavyId 
 * @returns heavyAttack
 */
function findHeavyAttack(heavyId)
{
    for(var heavy in heavyAttacks) {
        if(heavyAttacks[heavy].heavyId == heavyId) return heavyAttacks[heavy];
    }
}


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
 * @param {Int} heavyId 
 */
function selectHeavyAttack(player, heavyId, gui)
{
    var playerSlot = lib.getActiveSlotId(player);
    player.setStoredData(playerSlot + "zSwordHeavy", heavyId);

    gui.getComponent(50).setTexture(findHeavyAttack(heavyId).icon);
    gui.update(player);
}

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
    if(!attack in heavyAttacks || item.getTag("sheathed") == "true") return;
    if(timers.has(playerSlot + "" + HEAVY_COOLDOWN) && !timers.has(SPAM_PREVENTER)) {
        var remainingCooldown = timers.ticks(playerSlot + "" + HEAVY_COOLDOWN);
        player.sendMessage("Remaining Cooldown on Heavy Attack: " + attack.heavyName + " : " + (Math.round(remainingCooldown/2)/10) + " seconds.");
        timers.forceStart(SPAM_PREVENTER, 10, false);
        return;
    } else if(timers.has(playerSlot + "" +  HEAVY_COOLDOWN) && timers.has(SPAM_PREVENTER)) return;

    player.sendMessage("Performing heavy attack: " + attack.heavyName);
    abilHandler.handleEvent("heavyActivate");
    timers.forceStart(playerSlot + "" + HEAVY_COOLDOWN, attack.cooldown, false);
}

/** Displays a skill selection window to the player
 * @param {IPlayer} player 
 */
function displayHeavyMenu(player)
{
    if(item.getTag("sheathed" == "true") || item.getTag("broken") == "true") return;
    var heavyWindow = API.createCustomGui(SKILL_WINDOW_ID + 1, skillWindowWidth + tabWidth, skillWindowHeight, false);
    var heavyWindowBg = heavyWindow.addTexturedRect(0, heavyWindowBgTexture, 0, 0, skillWindowWidth, skillWindowHeight);
    var skillPosX = skillPosInitialX;
    var skillPosY = skillPosInitialY;
    var unlockedHeavies = getHeavies(player);
    var skillIcons = [];
    // Button ids 1-skills_length
    for(var heavy in heavyAttacks) {
        if(heavyAttacks[heavy].heavyId < firstSkillId) continue;

        if(unlockedHeavies.indexOf(heavyAttacks[heavy]) < 0) {
            var button = heavyWindow.addTexturedRect(heavyAttacks[heavy].heavyId, heavyAttacks.lockedHeavy.icon, skillPosX, skillPosY, skillIconWidth, skillIconHeight);
        } else {
            var button = heavyWindow.addTexturedButton(heavyAttacks[heavy].heavyId, "", skillPosX, skillPosY, skillIconWidth, skillIconHeight, heavyAttacks[heavy].icon);
            if(heavyAttacks[heavy].hoverText) button.setHoverText(heavyAttacks[heavy].hoverText);
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
    var selectedHeavy = getSelectedHeavy(player);
    // Button ids 50-54
    if(!selectedHeavy || selectedHeavy == "") selectedHeavy = heavyAttacks.blankHeavy;
    if(!hasUnlockedHeavies(player)) {
        var button = heavyWindow.addTexturedRect(idIndex, heavyAttacks.blankHeavy.icon, heavySelectedX, heavySelectedY, skillIconWidth, skillIconHeight);
        skillWindow.addTexturedRect(idIndex + 4, selectedLockTexture, heavySelectedX - (selectedLockSize - skillIconWidth)/2, heavySelectedY - (selectedLockSize - skillIconHeight)/2, selectedLockSize, selectedLockSize);
    }
    else var button = heavyWindow.addTexturedButton(idIndex, "", heavySelectedX, heavySelectedY, skillIconWidth, skillIconHeight, selectedHeavy.icon);

    // Tabs
    var skillsTab = heavyWindow.addTexturedButton(61, "", skillWindowWidth - 2, tabPosY, tabWidth, tabHeight, tabTexture);
    //var keybindTab = heavyWindow.addTexturedButton(63, "", skillWindowWidth - 2, tabPosY + tabHeight + tabSpacing, tabWidth, tabHeight, tabTexture);

    player.showCustomGui(heavyWindow);
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