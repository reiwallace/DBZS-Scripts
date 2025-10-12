// weapon_damage_cap.js - deletes weapons stronger than the strongest obtainable weapon to prevent exploits
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB
// AUTHOR: Riken, Mighty, Ranger, Noxie
var damageCap = 1690001; // strongest weapon's damage + 1
var checkBlacklist = ["Ranger_Halt", "AyoteTheGod", "Kam", "Mighty_S0715", "pockington", "kleaRr", "Max1581", "_WhiteMidnight_", "Rikentod", "Noxiiie"];
var mailList = ["Ranger_Halt", "Mighty_S0715", "pockington", "AyoteTheGod", "Kam", "kleaRr", "Max1581", "_WhiteMidnight_", "Rikentod", "Noxiiie"];

function attack(event) {
    if(!checkItemDamage(event.player, event.player.getHeldItem())) return;
    event.setCancelled(true);
}

function toss(event) {
    if(!checkItemDamage(event.player, event.item)) return;
    event.setCancelled(true);
}

/** Sends mail to all players in mailList
 * @param {IPlayer} player
 * @param {IWorld} world 
 */
function sendMail(player, world, item)
{
    for(var admin in mailList) {
        API.executeCommand(world, 
            "mail send " + mailList[admin] + " " + player.getDisplayName() + " has an illegal weapon with name " + item.getDisplayName() + " and damage " + item.getAttribute("generic.attackDamage") + "."
        );
    }
}

/** Checks if an item is over the damage cap
 * @param {IItemStack} item 
 * @returns Boolean
 */
function checkItemDamage(player, item)
{
    if(!item || !lib.isPlayer(player)) return;
    if(item.getAttribute("generic.attackDamage") < damageCap || checkBlacklist.indexOf(player.getDisplayName()) >= 0) return;
    
    var itemStackSize = item.getStackSize();
    player.removeItem(item, itemStackSize, false, false);
    sendMail(player, API.getIWorld(0), item);
    return true;
}