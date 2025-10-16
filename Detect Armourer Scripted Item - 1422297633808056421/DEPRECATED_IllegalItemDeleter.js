// IllegalItemDeleter.js - Deletes illegal items
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB
// AUTHOR: Ranger, Mighty, Noxie

// CONFIG
var replacementsChest = API.getIWorld(0).getBlock(10269, 59, 3).getContainer();
var checkBlacklist = ["Ranger_Halt", "AyoteTheGod", "Kam", "Mighty_S0715", "pockington", "kleaRr", "Max1581", "_WhiteMidnight_", "Rikentod", "Noxiiie"];
var mailList = ["Ranger_Halt", "Mighty_S0715", "pockington", "AyoteTheGod", "Kam", "kleaRr", "Max1581", "_WhiteMidnight_", "Rikentod", "Noxiiie"];
var conditions = {
    itemNames: ["LR Token", "Legendary Tickets"]
};

var LOOP_BREAK_TIMER = 910;

/** Removes and replaces deprecated items in player inventory
 * @param {IPlayer} player 
 */
function checkIllegalItems(player, inventory){
    if(!lib.isPlayer(player) || !replacementsChest || !inventory || checkBlacklist.indexOf(player.getDisplayName()) > -1) return;

    for(var item in inventory) {
        var item = inventory[item];
        // Compare inventory items to deprecated items
        if(!doDelete(item, conditions)) continue;

        // Delete item if it matches an illegal item.
        var itemStackSize = item.getStackSize();
        player.removeItem(item, itemStackSize, false, false);
        player.giveItem(replacementsChest.getSlot(1), itemStackSize)
        sendMail(player, API.getIWorld(0), item);
    }
}

/** Checks if an item meets the conditions to be replaced
 * @param {IItemStack} item 
 * @param {Object} conditions 
 * @returns Boolean
 */
function doDelete(item, conditions)
{
    if(!item) return;
    for(var name in conditions.itemNames) {
        var name = conditions.itemNames[name];
        if(item.getDisplayName() == name) return true;
    }
    return;
}

/** Sends mail to all players in mailList
 * @param {IPlayer} player
 * @param {IWorld} world 
 */
function sendMail(player, world, item)
{
    for(var admin in mailList) {
        API.executeCommand(world, 
            "mail send " + mailList[admin] + " " + player.getDisplayName() + " has an illegal item at " + Math.floor(player.x) + ", " + Math.floor(player.y) + ", " + Math.floor(player.z) + " with name " + item.getDisplayName() + " and damage " + item.getAttribute("generic.attackDamage") + "."
        );
    }
}

function login(event){
    checkIllegalItems(event.player, event.player.getInventory());
}

function containerOpen(event){
    var containter = event.getContainer();
    if(containter == null) return;
    var player = event.player;
    var timers = player.timers;
    // Timer to prevent looping function
    if(timers.has(LOOP_BREAK_TIMER)) {
        timers.forceStart(LOOP_BREAK_TIMER, 1, false);
        return;
    }
    timers.forceStart(LOOP_BREAK_TIMER, 1, false);
    checkIllegalItems(player, player.getInventory());
    checkIllegalItems(player, containter.getItems());
}