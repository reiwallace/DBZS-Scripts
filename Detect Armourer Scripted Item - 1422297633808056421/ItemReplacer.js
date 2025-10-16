// ItemReplacer.js - Replaces deprecated items
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB
// AUTHOR: Ranger, Mighty, Noxie

// CONFIG
var replacementsChest = API.getIWorld(0).getBlock(10269, 59, 1).getContainer();
var checkBlacklist = ["Ranger_Halt", "Mighty_S0715", "pockington", "Noxiiie"];
var mailList = ["Ranger_Halt", "Mighty_S0715", "pockington", "Noxiiie"];
var checkItems = {
    halloweenSpirit: {
        name: API.getIWorld(0).getStoredData("halloweenSpirit"),
        itemName: "plug:artifacts",
        damage: 500,
        fixedTag: "fixedWeapon",
        replaceSlot: 3
    },
    angelStaff: {
        name: API.getIWorld(0).getStoredData("angelstaff"),
        itemName: "minecraft:diamond_sword",
        damage: 370000,
        fixedTag: "fixedWeapon",
        replaceSlot: 1
    },
    dragonGodMorningStar: {
        name: API.getIWorld(0).getStoredData("DragonGodMorningstar"),
        itemName: "customnpcs:npcMithrilTrident",
        damage: 250666,
        fixedTag: "fixedWeapon",
        replaceSlot: 4
    },
    voidWalker: {
        name: API.getIWorld(0).getStoredData("voidwalker"),
        itemName: "customnpcs:npcDemonicStaff",
        damage: 390000,
        fixedTag: "fixedWeapon",
        replaceSlot: 0
    }
};

var LOOP_BREAK_TIMER = 911;

/** Removes and replaces deprecated items in player inventory
 * @param {IPlayer} player 
 */
function checkDeprecatedItems(player){
    if(!lib.isPlayer(player) || !replacementsChest || checkBlacklist.indexOf(player.getDisplayName()) > -1) return;

    var playerInv = player.getInventory();
    if(!playerInv) return;
    for(var item in playerInv) {
        var item = playerInv[item];
        // Compare inventory items to deprecated items
        for(var compItem in checkItems) {
            var compItem = checkItems[compItem]
            if(!doReplace(item, compItem.name, compItem.itemName, compItem.damage, compItem.fixedTag)) continue;
            
            // Replace item if it matches a deprecated item.
            var itemStackSize = item.getStackSize();
            player.removeItem(item, itemStackSize, false, false);
            player.giveItem(replacementsChest.getSlot(compItem.replaceSlot), itemStackSize);
            sendMail(compItem, player.getDisplayName(), API.getIWorld(0));
        }

        if(isRpgWeapon(item)) {
            player.removeItem(item, 1, false, false);
            player.giveItem(replacementsChest.getSlot(5), 1);
            sendMail({name: "RPG Weapon"}, player.getDisplayName(), API.getIWorld(0));
        }
    }
}

/** Checks if an item meets the conditions to be replaced
 * @param {IItemStack} item 
 * @param {String} nameCheck 
 * @param {String} itemCheck 
 * @param {Int} attackCheck 
 * @param {String} fixedTag 
 * @returns Boolean
 */
function doReplace(item, nameCheck, itemCheck, attackCheck, fixedTag)
{
    if(!item) return;
    return (
        !item.hasTag(fixedTag) &&
        item.getDisplayName() == nameCheck &&
        item.getName() == itemCheck &&
        item.getAttribute("generic.attackDamage") == attackCheck
    );
}

/** Checks item lore to detect rpgweapons
 * @param {IItemStack} item 
 */
function isRpgWeapon(item)
{
    if(!item) return;
    var itemLore = item.getLore();
    var levelFlag = false;
    var xpFlag = false;
    var replicaFlag = true;
    for(var line in itemLore) {
        line = itemLore[line];
        if(line.indexOf("RPG Level") >= 0) levelFlag = true;  
        if(line.indexOf("Xp:") >= 0) xpFlag = true;  
        if(line.indexOf("Xp: NaN") >= 0) replicaFlag = false;
    }
    return (levelFlag && xpFlag && replicaFlag);
}

/** Sends mail to all players in mailList
 * @param {Object} deprecatedItem 
 * @param {String} playerName 
 * @param {IWorld} world 
 */
function sendMail(deprecatedItem, playerName, world)
{
    for(var admin in mailList) {
        API.executeCommand(world, "mail send " + mailList[admin] + " " + playerName + " has had their " + deprecatedItem.name + " replaced!")
    }
}

function login(event){
    checkDeprecatedItems(event.player);
}

function containerOpen(event){
    if(event.getContainer() == null) return;
    var player = event.player;
    var timers = player.timers;
    // Timer to prevent looping function
    if(timers.has(LOOP_BREAK_TIMER)) {
        timers.forceStart(LOOP_BREAK_TIMER, 1, false);
        return;
    }
    timers.forceStart(LOOP_BREAK_TIMER, 1, false);
    checkDeprecatedItems(player);
}