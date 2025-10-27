// scytheQuestFail.js
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB
// AUTHOR: Noxie

var fullPowerQuestId = 12;
var failQuestId = 11;

function kills(event) {
    var entity = event.getEntity();
    var player = event.player;
    if(!lib.isPlayer(player) || !player.hasActiveQuest(failQuestId) || !entity || entity.getType() != 2 || !entity.hasTempData("soulType")) return;
    switch(entity.getTempData("soulType")) {
        case 1:
            lib.debugMessage("Noxiiie", "QUEST FAIL");
            resetAllScythes(player);
        break;

        case 2:
            lib.debugMessage("Noxiiie", "QUEST PASS");
            player.stopQuest(11);
            player.finishQuest(11);
        break;

        case 3:
            // Alternative completion?
        break;
    }
}

function resetAllScythes(player) {
    var inv = player.getInventory();
    for(var item in inv) {
        item = inv[item];
        if(!item || item.getTag("isDeathScythe") != 1 || item.getTag(fullPowerQuestId) == 1) continue;
        // Add item update tags
        item.setTag("player", player.getName());
        item.setTag("reset", 1);
        item.setTag("update", 1)
    }
}