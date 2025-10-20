// deathScytheQuest.js
// Author: Noxie

// CONFIG
var questId = 0;

function interact(event) {
    var player = event.player;
    var item = player.getHeldItem();
    if(!item || !item.hasTag("isDeathScythe")) player.sendMessage("Please hold the item you wish to upgrade.");
    if(item.getTag(questId) == 1) player.sendMessage("Held item already has this upgrade.");
    player.finishQuest(questId);
    player.stopQuest(questId);
}
