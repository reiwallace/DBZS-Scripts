var coords = [[10233.5, 113, -42.5], [10096.5, 65, -60.5], [10247.5, 65, 319.5], [10394.5, 78, 201.5], [10467.5, 79, -126]];
var moveTime;

function init(event) {
    var npc = event.npc;
    var dbc = new lib.dbcDisplayHandler(npc, true);
    dbc.setAura(216, true);
    dbc.npcDisplay.setHairType("");
    npc.timers.forceStart(0, 0, true);
    var serverTime = API.getServerTime();
    if(!API.getIWorld(0).hasTempData("rift1Despawn") || API.getIWorld(0).getTempData("rift1Despawn") < serverTime) {
        var rand = coords[lib.getRandom(0, coords.length - 1, true)];
        npc.setPosition(rand[0], rand[1], rand[2]);
    }
}

function tick(event) {
    var npc = event.npc;
    var serverTime = API.getServerTime();
    if(!API.getIWorld(0).hasTempData("rift1Despawn") || API.getIWorld(0).getTempData("rift1Despawn") < serverTime) {
        API.getIWorld(0).setTempData("rift1Despawn", serverTime + 36000);
        var rand = coords[lib.getRandom(0, coords.length - 1, true)];
        npc.setPosition(rand[0], rand[1], rand[2]);
    }
}

function timer(event) {
    var npc = event.npc;
    switch(event.id) {
        case 0:
            var x = npc.x - 0.5;
            var y = npc.y + 0.5;
            var z = npc.z - 0.5;
            for(var i = 0; i < 5; i++) {
                API.getIWorld(0).spawnParticle("portal", x+Math.random() * 2 - 0.5, y+ Math.random() + 0.5, z+Math.random() * 2 - 0.5, 0, 0.1, 0, 0, 1);
            }   
            API.getIWorld(0).spawnParticle("spell", x+Math.random(), y+ Math.random(), z+Math.random(), 0, 0.1, 0, 0, 1); 
        break;
    }
}

function collide(event) {
    var npc = event.npc;
    var player = event.getEntity();
    var serverTime = API.getServerTime();
    if(!lib.isPlayer(player) || npc.timers.has(12)) return;
    event.npc.timers.forceStart(12, 60, false);
    if(!findHaruna(player)) {
        player.sendMessage("It would be dangerous to enter without Haruna.");
        return;
    }
    if(API.getIWorld(0).hasTempData("riftCooldown") && API.getIWorld(0).getTempData("riftCooldown") > serverTime) {
        player.sendMessage("The rift is still recharging.");
        return;
    }
    player.sendMessage("This strange rift leaves you feeling incredibly sleepy..");
    player.addPotionEffect(9, 10, 100, true);
    if(API.getIWorld(0).hasTempData("rift2Player")) {
        var players = API.getAllServerPlayers();
        for(var p in players) {
            p = players[p];
            if(!(p &&
                (p.x > 8357 && p.x < 8620) &&
                (p.z > -3340 && p.z < -3100) &&
                p.world.getDimensionID() == 0)
            ) continue;
            p.setPosition(10269, 65, 2);
            npc.executeCommand("jrmcse set KO 10 " + p.getName());
            p.sendMessage("The dreamscape rapidly closes around you.")
        }
        var secondPlayer = API.getPlayer(API.getIWorld(0).getTempData("rift2Player"));
        API.executeCommand(API.getIWorld(0), "zs &7" + player.getName() + " and " + secondPlayer.getName() + " &r&7have slipped into a different reality.");
        API.executeCommand(API.getIWorld(0), "/dbcskill take InstantTransmission " + player.getName());
        API.executeCommand(API.getIWorld(0), "/dbcskill take InstantTransmission " + secondPlayer.getName());
        secondPlayer.setPosition(8447, 71, -3226);
        player.setPosition(8447, 71, -3226);
        secondPlayer.showDialog(12886);
        player.showDialog(12886);
        API.getIWorld(0).setTempData("riftCooldown", serverTime + 36000);
        API.getIWorld(0).removeTempData("rift1Despawn");
        API.getIWorld(0).removeTempData("rift2Despawn");
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
