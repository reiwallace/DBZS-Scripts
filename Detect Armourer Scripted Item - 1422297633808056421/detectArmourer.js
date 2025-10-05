// detectArmourer.js
// AUTHOR: Noxie

var activeContainer = false;

function containerOpen(event)
{
    var player = event.player;
    var playerInv = player.getInventory();
    var container = event.getContainer();
    var containerInv = container.getItems();
    if(activeContainer) {
        player.timers.forceStart(872, 1, false);
        return;
    }
    activeContainer = true;

    var playerBrokenItems = findArmourerScriptedItems(playerInv);
    var containerBrokenItems = findArmourerScriptedItems(containerInv);


}

function timer(event)
{ // Lag prevention, prevents script being run every tick while container is open
    if(event.id == 872) activeContainer = false;
}

/** Finds Scripted Items with Armourers Workshop skins in an invetory
 * @param {IItemStack[]} inv 
 * @returns IItemCustom[]
 */
function findArmourerScriptedItems(inv)
{
    var brokenItems = [];
    for (var item in inv) {
        item = inv[item]
        if(item && item.getClass().toString().equals("class noppes.npcs.scripted.item.ScriptCustomItem") && checkArmourerTag(item)) {
            brokenItems.push(item);
        }
    }
    return brokenItems;
}

/** Returns if an item has the Armourer's NBT tag
 * @param {IItemStack} item 
 * @returns Boolean
 */ 
function checkArmourerTag(item)
{
    if(!item) return;
    return item.getMcNbt().toString().indexOf("armourersWorkshop") > 0;
}

