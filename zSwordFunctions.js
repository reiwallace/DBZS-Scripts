// ZSWORD FUNCTIONS CONFIG
var zSwordLinkedId = 29;
var zSwordQuestId = 3268;
var zSwordRewardSlot = 0;

/** Give Z Sword from quest rewards
 * @param {IPlayer} player 
 */
function giveZSword(player) 
{
    if(hasZSword(player)) return;
    player.giveItem(API.getQuests().get(zSwordQuestId).getRewards().getSlot(zSwordRewardSlot), 1);
}

/** Find and attempt to remove Z Sword from player's inventory
 * @param {IPlayer} player 
 * @returns If Z Sword was removed
 */
function removeZSword(player)
{
    var deletedSword = false;
    var inv = player.getInventory();
    for (var item in inv) {
        item = inv[item]
        if(item && item.getClass().toString().equals("class noppes.npcs.scripted.item.ScriptLinkedItem")) {
            if(item.getLinkedItem().getId() != zSwordLinkedId) continue;
            player.removeItem(item, 1, true, true);
            deletedSword = true;
        }
    }
    return deletedSword;
}

/** Returns if Z Sword is present in player's inventory
 * @param {IPlayer} player 
 * @returns Boolean
 */
function hasZSword(player)
{
    return Boolean(findZSword(player));
}

/** Searches player inventory for the Z Sword
 * @param {IPlayer} player 
 * @returns ILinkedItem
 */
function findZSword(player)
{
    var inv = player.getInventory();
    for (var item in inv) {
        item = inv[item]
        if(isZSword(item)) return item;
    }
}

/** Returns if player is holding a Z Sword
 * @param {IPlayer} player 
 * @returns Boolean
 */
function holdingZSword(player)
{
    var heldItem = player.getHeldItem();
    if(heldItem && heldItem.getClass().toString().equals("class noppes.npcs.scripted.item.ScriptLinkedItem")) {
        if(heldItem.getLinkedItem().getId() != zSwordLinkedId) return false;
        return true;
    }
    return false;
}

/** Returns if an item is a Z Sword
 * @param {ILinkedItem} item 
 * @returns 
 */
function isZSword(item) {
    if(item && item.getClass().toString().equals("class noppes.npcs.scripted.item.ScriptLinkedItem")) {
        if(item.getLinkedItem().getId() != zSwordLinkedId) return false;
        return true;
    }
    return false;
}