var replacementItem = API.getIWorld(0).getBlock(10269, 59, 1).getContainer().getSlot(6);
var hasHaruna = 12881;
var noHaruna = 12882;
var reg = 12883;
var finalQuest = 3265;

function init(event) {
    var npc = event.npc;
    npc.timers.forceStart(0, 0, true);
}

function timer(event) {
    var npc = event.npc;
    var world = npc.world;
    switch(event.id) {
        case 0:
            var x = npc.x - 0.5;
            var y = npc.y + 0.5;
            var z = npc.z - 0.5;
            for(var i = 0; i < 5; i++) {
                world.spawnParticle("spell", x+Math.random() * 3 - 1, y+ Math.random() + 0.5, z+Math.random() * 3 - 1, 0, 0.1, 0, 0, 1);
            }   
        break;
    }
}

function interact(event) {
    var firstPlayer = event.player;
    var secondPlayer = firstPlayer.world.getClosestPlayer(8443, 113, -3223, 4);
    if(lib.isPlayer(firstPlayer) && lib.isPlayer(secondPlayer) && firstPlayer != secondPlayer) {
        event.npc.setDialog(0, findHaruna(secondPlayer) ? hasHaruna : noHaruna);
    }
}

function dialogClose(event) {
    var firstPlayer = event.player;
    var world = firstPlayer.world;
    var secondPlayer = firstPlayer.world.getClosestPlayer(8443, 113, -3223, 4);
    if(lib.isPlayer(firstPlayer) && lib.isPlayer(secondPlayer) && firstPlayer != secondPlayer) {
        if(event.getDialog().getId() == hasHaruna && event.getOptionId() == 1) {
            findHaruna(firstPlayer).setTag(finalQuest, 1);
            findHaruna(firstPlayer).setTag("update", 1);
            firstPlayer.finishQuest(finalQuest);
            secondPlayer.removeItem(findHaruna(secondPlayer), 1, false, false);
            secondPlayer.giveItem(replacementItem, 1);
            secondPlayer.showDialog(12888);
            firstPlayer.showDialog(12889);
            API.executeCommand(world, "zs " + firstPlayer.getName() + " has completed &6&lHalloween 2025 Secret: &4&lA Forbidden Soul");
        } else if(event.getDialog().getId() == noHaruna) {
            API.executeCommand(world, "spawn " + firstPlayer.getName());
            API.executeCommand(world, "spawn " + secondPlayer.getName());
            API.executeCommand(world, "jrmcse set KO 10 " + firstPlayer.getName());
            API.executeCommand(world, "jrmcse set KO 10 " + secondPlayer.getName());
            secondPlayer.showDialog(12890);
            firstPlayer.showDialog(12890);
            return;
        } else if(event.getDialog().getId() == hasHaruna && event.getOptionId() == 2) {
            firstPlayer.showDialog(12890);
            secondPlayer.showDialog(12890);
        }
        API.executeCommand(world, "spawn " + firstPlayer.getName());
        API.executeCommand(world, "spawn " + secondPlayer.getName());
        API.executeCommand(world, "jrmcse set KO 10 " + firstPlayer.getName());
        API.executeCommand(world, "jrmcse set KO 10 " + secondPlayer.getName());
        firstPlayer.setStoredData("halloweenSecret", 1);
        secondPlayer.setStoredData("halloweenSecret", 1);
    }
}

function findHaruna(player) {
    var playerInv = player.getInventory();
    if(!playerInv) return;
    for(var item in playerInv) {
        var item = playerInv[item];
        if(item && item.getTag("isDeathScythe") == 1 && item.getTag("3258") == 1) return item;
    }
}