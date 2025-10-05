// ItemReplacer.js - Replaces deprecated items
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB
// AUTHOR: Ranger, Mighty, Noxie

// CONFIG
var replacementsChest = API.getIWorld(0).getBlock(10269, 59, 1).getContainer();
var checkBlacklist = ["Noxiiie"];
var mailList = ["Ranger_Halt", "Mighty_S0715", "pockington"];
var checkItems = {
    halloweenSpirit: {
        name: "&aHalloween Spirit [+500]",
        itemName: "plug:artifacts",
        damage: 500,
        fixedTag: "fixedWeapon",
        replaceSlot: 3
    },
    angelStaff: {
        name: "&0&0&0&0&0&2&1&c&7&l&f&lAngel Trainee Staff [+370,000]",
        itemName: "minecraft:diamond_sword",
        damage: 370000,
        fixedTag: "fixedWeapon",
        replaceSlot: 1
    },
    dragonGodMorningStar: {
        name: "&7&lDragon God Morningstar [+250,666]",
        itemName: "customnpcs:npcMithrilTrident",
        damage: 250666,
        fixedTag: "fixedWeapon",
        replaceSlot: 4
    },
    voidWalker: {
        name: "&0&0&0&0&0&2&1&d&7&l&5&lVoidwalker [+390,000]",
        itemName: "customnpcs:npcDemonicStaff",
        damage: 390000,
        fixedTag: "fixedWeapon",
        replaceSlot: 0
    }, 
    lrToken: {
        name: "LR Token",
        itemName: "",
        damage: "",
        fixedTag: "",
        reportError: 1
    }
};

var LOOP_BREAK_TIMER = 910;

/** Removes and replaces deprecated items in player inventory
 * @param {IPlayer} player 
 */
function checkDeprecatedItems(player){
    if(!lib.isPlayer(player) || !chest || checkBlacklist.indexOf(player.getDisplayName()) > -1) return;

    var playerInv = player.getInventory();
    if(!playerInv) return;
    for(var item in playerInv) {
        var item = playerInv[item];
        // Compare inventory items to deprecated items
        for(var compItem in checkItems) {
            var compItem = checkItems[compItem]
            if(!doReplace(item, compItem.name, compItem.itemName, compItem.damage, compItem.fixedTag)) return;

            // Replace item if it matches a deprecated item.
            player.removeItem(item, 1, false, false);
            player.giveItem(chest.getSlot(compItem.replaceSlot), 1)
            sendMail(compItem, player.getDisplayName(), API.getIWorld(0));
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