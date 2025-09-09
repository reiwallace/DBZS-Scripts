var zSwordLinkedId = 1;

var zSwordQuestId = 12;
var zSwordRewardSlot = 0;

function login(event) {
    if(removeZSword(event.player)) giveZSword;
}

/** Give Z Sword from quest rewards
 * @param {IPlayer} player 
 */
function giveZSword(player) 
{
    player.giveItem(API.getQuests().get(zSwordQuestId).getRewards().getSlot(zSwordRewardSlot), 1);
}

/** Find and attempt to remove Z Sword from player's inventory
 * @param {IPlayer} player 
 * @returns If Z Sword was removed
 */
function removeZSword(player)
{
    var inv = player.getInventory();
    for (var item in inv) {
        if(inv[item] && inv[item].getClass().toString().equals("class noppes.npcs.scripted.item.ScriptLinkedItem")) {
            var zSword = inv[item];
            if(zSword.getLinkedItem().getId() != zSwordLinkedId) return;
            player.removeItem(zSword, 1, true, true);
            return true;
        }
    }
    return false;
}
