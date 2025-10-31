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
        "attribute.main_attack" : 1,
        "level_req" : 1,
    },

    quest1: {
        "quest_id" : 3248,
        "attribute.main_attack" : 2399,
        "level_req": 199
    },

    quest2: {
        "quest_id" : 3250,
        "attribute.main_attack" : 2600,
        "level_req": 400,
    },

    quest3: {
        "quest_id" : 3251,
        "attribute.main_attack" : 5000,
        "level_req": 400,
        "skill.unlock" : 1,
        "skill.damage" : 1500000
    },
    quest4: {
        "quest_id" : 3252,
        "attribute.main_attack" : 14000,
        "level_req": 1500,
        "skill.damage" : 1500000
    },
    quest5: {
        "quest_id" : 3253,
        "attribute.main_attack" : 36000,
        "level_req": 3500,
        "appearance": 1,
        "skill.damage" : 4500000
    },
    quest6: {
        "quest_id" : 3254,
        "attribute.main_attack" : 40000,
        "level_req": 6000,
        "skill.damage" : 7500000
    },
    quest7: {
        "quest_id" : 3255,
        "attribute.main_attack" : 90000,
        "level_req": 6000,
        "skill.damage" : 7500000
    },
    quest8: {
        "quest_id" : 3256,
        "attribute.main_attack" : 20000,
        "level_req": 3000,
        "skill.damage" : 7500000

    },
    quest9: {
        "quest_id" : 3257,
        "attribute.main_attack" : 140000,
        "level_req": 9000,
        "skill.damage" : 22500000
    },
    quest10: {
        "quest_id" : 3258,
        "attribute.main_attack" : 130000,
        "level_req": 15000,
        "appearance" : 1,
        "skill.unlock" : 1,
        "skill.damage" : 60000000
    }
};
var fullPowerQuestId = 3258;

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
        "item_name" : "§r\u00A76§lHaruna",
        "item_texture" : "https://zsstorage.xyz/GUIs/Haruna%20GUI/HolloweenScythe.png",
        "lore" : [
            "§r\u00A7e§lA weapon given to you by \u00A74§lLord Death§r\u00A7e§l.",
            "§r\u00A7e§lHer name is \u00A76§lHaruna§r\u00A7e§l.", 
            "§r\u00A7e§lIt's said her soul wavelength was too powerful",
            "§r\u00A7e§lfor any of the meisters at the academy."]
    },

    level1 = {
        "item_name" : "§r\u00A76§lHaruna",
        "item_texture" : "https://zsstorage.xyz/GUIs/Haruna%20GUI/HolloweenScythe.png",
        "lore" : [
            "§r\u00A7e§lYour trusted weapon, \u00A76§lHaruna§r\u00A7e§l.", 
            "§r\u00A7e§lShe grows stronger as you feed her more souls."
        ]
    },
    
    level2 = {
        "item_name" : "§r\u00A76§lDeath Scythe Haruna",
        "item_texture" : "https://zsstorage.xyz/GUIs/Haruna%20GUI/HolloweenDeathScythe.png",
        "lore" : [
            "§r\u00A7e§lA demon weapon that has finally reached its pinnacle", 
            "§r\u00A7e§land achieved the rank of \u00A74§lDeath Scythe§r\u00A7e§l.", 
            "§r\u00A7e§lA weapon worthy of being wielded by the \u00A74§lLord of Death§r\u00A7e§l himself.", 
            "§r\u00A7e§lShe is your partner: \u00A76§lDeath Scythe Haruna§r\u00A7e§l."
        ]
    },

];

var skillData = {
    "Witch Hunter": {
        name: "Witch Hunter",
        cooldown: 600,  // In Ticks
        description: [" ", 
            "\u00A75§lNAME:", 
            "\u00A7dThe traditional skill of the Scythe Meister.", 
            "\u00A7dDeals DAMAGE damage", 
            "\u00A7dCooldown: TIMEs"]
    },
    "Angel Hunter": {
        name: "Angel Hunter",
        cooldown: 600,  // In Ticks
        description: [" ", 
            "\u00A7d§ka\u00A7f§lNAME\u00A7d§ka§r:", 
            "\u00A7dA modified skill of the Scythe Meister. Soul and Ki are imbued together into this attack.", 
            "\u00A7dDeals DAMAGE damage", 
            "\u00A7dCooldown: TIMEs"]
    }
}
var anim1 = API.getAnimations().get("Dragon_Hunter_Charge");
var anim2 = API.getAnimations().get("Dragon_Hunter_Attack");
var combo1Anim = API.getAnimations().get("Scythe_combo_1")
var combo2Anim = API.getAnimations().get("Scythe_combo_2")
var combo3Anim = API.getAnimations().get("Scythe_combo_3")
var combo4Anim = API.getAnimations().get("Scythe_combo_4")
var combo5Anim = API.getAnimations().get("Scythe_combo_5")

var attackTexture1 = "https://zsstorage.xyz/GUIs/Haruna%20GUI/HolloweenWitchHunterScythe.png"
var attackTexture2 = "https://zsstorage.xyz/GUIs/Haruna%20GUI/HolloweenDragonHunterScythe.png"

var messageLines = ["Nice one PLAYER", "Let's go!", "This'll show em!", "Take this!", "Ha!"];
var messageChance = 0.0005

var comboCount = 0

// TIMERS 
var SKILL_COOLDOWN = 356;
var SPAM_PREVENTER = 357;
var SKILL_PERFORMING = 358;
var COMBO_RESET = 359;

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
        reset(item, player);
        item.setTag("reset", 0);
    }
    
    updateItem(item);
}

function rightClick(event)
{
    var target = event.getTarget()
    if(event.getType() == 1 && target && target.getType() == 2 && target.getFaction() == 0) return;
    useSkill(event.player, event.item);
}  

function attack(event) {
    var player = event.getSwingingEntity();

    if(Math.random() < messageChance) 
        player.sendMessage("\u00A76[" + appearanceLevel[event.item.getTag("appearance")].item_name + "§r\u00A76 -> \u00A7cme\u00A76]§r " + messageLines[lib.getRandom(0, messageLines.length - 1, true)].replace("PLAYER", player.getName()))

    if(player.timers.has(SKILL_PERFORMING) || !player.getHeldItem() || player.getHeldItem().getTag("isDeathScythe") != 1) return;
    if(!player.timers.has(COMBO_RESET)){
        comboCount = 0
    }
    var data = player.getAnimationData()
    data.setEnabled(true)
    player.timers.forceStart(COMBO_RESET,30,false)
        
    switch(comboCount){

        case 0:
        data.setAnimation(combo1Anim)
        comboCount += 1
        break;
        case 1:
        data.setAnimation(combo2Anim)
        comboCount += 1
        break;
        case 2:
        data.setAnimation(combo3Anim)
        comboCount += 1
        break;
        case 3:
        data.setAnimation(combo4Anim)
        comboCount += 1
        break;
        case 4:

        data.setAnimation(combo5Anim)
        comboCount = 0
        break;

    }
    data.updateClient()
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
    var skillLevel = 0;
    for(var quest in quests) {
        if(item.getTag(quests[quest]["quest_id"]) != 1) continue;
        if(quests[quest]["appearance"]) appearance += quests[quest]["appearance"];
        if(quests[quest]["level_req"]) levelReq += quests[quest]["level_req"];
        if(quests[quest]["skill.unlock"]) skillLevel += quests[quest]["skill.unlock"];
        if(quests[quest]["skill.damage"]) skillDamage += quests[quest]["skill.damage"];
    }
    item.setTag("appearance", appearance);
    item.setTag("power", levelReq);
    item.setTag("skill_damage", skillDamage);
    item.setTag("skillUnlocked", skillLevel)

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
    if(appearance.lore) {
        var lore = ["§r\u00A7eWeapon Rarity: \u00A73Limited"];
        for(var text in appearance.lore) {
            lore.push(appearance.lore[text]);
        }
        if(item.getTag("power") > 0) lore.push("\u00A77\u00A7rLevel Req: " + item.getTag("power"));
        if(item.getTag("skillUnlocked") >= 1) {
            var skillLore = [];
            var skill = skillData[item.getTag("skillUnlocked") == 1 ? "Witch Hunter" : "Angel Hunter"];
            for(var text in skill.description) {
                skillLore.push(skill.description[text]);
            }
            skillLore[1] = skillLore[1].replace("NAME", skill.name);
            skillLore[3] = skillLore[3].replace("DAMAGE", item.getTag("skill_damage")/1000000 + " Million");
            skillLore[4] = skillLore[4].replace("TIME", skill.cooldown/20);
            lore = lore.concat(skillLore);
        }
        item.setLore(lore);
    }
    if(appearance.item_texture) item.setTexture(appearance.item_texture);
}

/** Clears custom and magic attributes on item
 * @param {IItemLinked} item 
 */
function clearStats(item)
{
    // Removes every attribute listed in the quest list
    for(var quest in quests) {
        quest = quests[quest];
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
    item.setTag("appearance", 0);
    item.setTag("power", 0);
    item.setTag("skill_damage", 0);
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
        if(id == -1) continue;
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
    if(!lib.isPlayer(player) || (item.getTag("skillUnlocked") != 1 && item.getTag("skillUnlocked") != 2)) return;
    if(lib.getDbcLevel(player) < item.getTag("power")) {
        player.sendMessage("You are not strong enough to wield this power.");
        return;
    }
    var timers = player.timers;
    // Check skill cd and send cooldown message
    if(timers.has(playerSlot + "" + SKILL_COOLDOWN) && !timers.has(SPAM_PREVENTER)) {
        var remainingCooldown = timers.ticks(playerSlot + "" + SKILL_COOLDOWN);
        var skill = skillData[item.getTag("skillUnlocked") == 1 ? "Witch Hunter" : "Angel Hunter"];
        player.sendMessage("Remaining Cooldown on " + skill.name + " : " + (Math.round(remainingCooldown/2)/10) + " seconds.");
        timers.forceStart(SPAM_PREVENTER, 10, false);
        return;
    } else if(timers.has(playerSlot + "" +  SKILL_COOLDOWN) && timers.has(SPAM_PREVENTER)) {
        return;
    }
    var skill = skillData[item.getTag("skillUnlocked") == 1 ? "Witch Hunter" : "Angel Hunter"];
    player.timers.forceStart(playerSlot + "" + SKILL_COOLDOWN, skill.cooldown, false);

    performSkill(player, item.getTag("skill_damage"),item);
}

// PLACEHOLDER
function performSkill(player, skillDamage, item) {
    
    player.timers.forceStart(SKILL_PERFORMING,60,false)
    if(item.getTag("appearance") == 2) item.setTexture(attackTexture2);
    else item.setTexture(attackTexture1);
    item.setTranslate(-0.6,0.0,-0.65)
    item.setScale(4.0,4.0,4.0)
    item.setColor(player.getDBCPlayer().getAuraColor())
    var am = player.getActionManager()
    var data = player.getAnimationData()
    player.getDBCPlayer().setTurboState(false)
    player.addPotionEffect(2,3,2,true)
    player.getWorld().playSoundAtEntity(player,"minecraft_1.20.2:block.beacon.deactivate",1.0,0.8)
    data.setEnabled(true)
    data.setAnimation(anim1)
    data.updateClient()
    am.schedule(50,executeAttack).setData("player",player).setData("item",item).setData("damage",skillDamage)
    am.schedule(3,returnToNormalState).setData("item",item)
    am.start()

}


function createHurtBox(entity,corner1,corner2,targetType){
    var foundEnemies = []// empty array to be filled later
    var hitBoxPos = API.getAllInBox(corner1,corner2) // array of possible positions within box

    for(var i = 0; i< hitBoxPos.length;i++){ // iterating through all positions in array
        var foundEntities = entity.getWorld().getEntitiesNear(hitBoxPos[i],1.1) // scanning for nearby entites at position
        
        if(foundEntities == null) continue; // moving onto next position of no entities are found

        for(var x = 0;x<foundEntities.length;x++){// iterating through all found entities

            var target = foundEntities[x] // temp variable for possible target entity
            if(target == entity) continue;// if found entity is the origin entity, continue
            if(target.getType() != targetType) continue;// if target is not of desired type, continue
            if(foundEnemies.indexOf(target) != -1) continue; // if foundEnemies array contains target, continue
            foundEnemies.push(target) // adding target to found entities array
            continue;
        }
    }
    
    if (foundEnemies.length < 0)return null;
    return foundEnemies;

}


function spawnParticles(npc){
    x = 2
    while(x< 7){
        var x2 = 0
        while(x2 < 20){
            var angle = x2*6 - 60
            var dx = -Math.sin(toRadians(npc.getRotation()+angle)) * x
            var dz = Math.cos(toRadians(npc.getRotation()+angle)) * x
            
            npc.getWorld().spawnParticle("mobSpell",npc.getPosition().add(dx,1.7-0.07*x,dz),0.01*x,0.1,0.01*x,1.0,2)
            npc.getWorld().spawnParticle("instantSpell",npc.getPosition().add(dx,1.7-0.07*x,dz),0.01*x,0.1,0.01*x,0.01,2)
            npc.getWorld().spawnParticle("magiCrit",npc.getPosition().add(dx,1.7-0.07*x,dz),0.01*x,0.1,0.01*x,0.01,3)
            x2++
        }
        x = x+2
    }
}

function toRadians(angle){
    return Math.PI*angle / 180.0
}

function executeAttack(act){
    var player = act.getData("player")
    var data = player.getAnimationData()
    var vector = player.getLookVector()
    var attackDmg = act.getData("damage")
    var item = act.getData("item")
    if(player.getDBCPlayer().isTurboOn()){
        player.sendMessage("&cI can't focus on my attack while using ki")
        act.markDone()
        return;
    }
    if(player.getHeldItem() != act.getData("item")){
        player.sendMessage("&cI need to use the scythe")
        act.markDone()
        return;
    }
    var perpVector1 = API.getIPos(vector.getZD()*-1,0.0,vector.getXD())
    var perpVector2 = API.getIPos(vector.getZD(),0.0,vector.getXD()*-1)

    var length = 3.0 * Math.pow(1.5,item.getTag("appearance"))
    var width = 3.0 * Math.pow(1.5,item.getTag("appearance"))


    var corner1= player.getPosition().add(width*perpVector1.getXD(),vector.getYD(),width*perpVector1.getZD())
    var corner2 = player.getPosition().add(length*vector.getXD()+perpVector2.getXD()*width ,vector.getYD()+1.5,vector.getZD()*length + perpVector2.getZD()*width)

    var enemies = createHurtBox(player,corner1,corner2,2)
    if(enemies == null) return;
    for (var i = 0; i< enemies.length;i++){
        enemies[i].hurt(attackDmg,player)
    }
    player.getWorld().playSoundAtEntity(player,"jinryuudragonbc:1610.sss",1.0,0.65)
    data.setEnabled(true)
    data.setAnimation(anim2)
    data.updateClient()
    spawnParticles(player)
    act.markDone()

}

function returnToNormalState(act){
    var item = act.getData("item")
    var activeAppearance = appearanceLevel[item.getTag("appearance")];
    setAppearance(item, activeAppearance);
    item.setTranslate(-0.3, 0.1, -0.4);
    item.setScale(2.0,2.0,2.0)
    item.setColor(0xffffff)
    act.markDone()
}