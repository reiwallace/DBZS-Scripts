function chat(event) {
    var player = event.player;
    var message = event.getMessage();
    if(!(player &&
        (player.x > 8357 && player.x < 8620) &&
        (player.z > -3340 && player.z < -3100) &&
        player.world.getDimensionID() == 0)
    ) return;
       
    event.setCancelled(true);
    if(message == "981524") {
        var nearbyPlayers = player.getSurroundingEntities(20, 1);
        var secondPlayer;
        for(var nearbyPlayer in nearbyPlayers) {
            if(!lib.isPlayer(nearbyPlayers[nearbyPlayer])) continue;
            secondPlayer = nearbyPlayers[nearbyPlayer];
            break;
        }
        if(!secondPlayer) return;
        var random = lib.getRandom(1, 2, true);
        if(random == 1) {
            player.setPosition(8438, 88, -3130)
            secondPlayer.setPosition(8447, 86, -3230);
        } else {
            secondPlayer.setPosition(8438, 88, -3130)
            player.setPosition(8447, 86, -3230);
        }

    } else {
        player.sendMessage("Only the emptiness can hear your voice.");
    }
}

function tick(event) {
    var player = event.player;
    var x = player.x
    var y = player.y
    var z = player.z
    if(
        x > 8432 && x < 8444 &&
        y > 101 && y < 113 &&
        z > -3132 && z < -3120
    ) {
        var world = player.world;
        var playerPos = player.getPosition();
        var block = world.getBlock(playerPos);
        while(!block) {
            playerPos = playerPos.down();
            block = world.getBlock(playerPos);
            if(playerPos.getY() < 0) return; 
        }
        if(block.getName() != "customnpcs:npcPlaceholder") return;
        for(var checkX = 8442; checkX < 8453; checkX++) {
            for(var checkY = 98; checkY < 108; checkY++) {
                for(var checkZ = -3231; checkZ < -3219; checkZ++) {
                    var checkBlock = world.getBlock(checkX, checkY, checkZ);
                    if(!checkBlock || checkBlock.getName() != "etfuturum:shroomlight") continue;
                    world.setBlock(checkBlock.getPosition(), API.createItem("customnpcs:npcPlaceholder", 0, 1));
                }
            }
        } 
        world.setBlock(block.getX() + 9, block.getY() - 3 , block.getZ() - 100, API.createItem("etfuturum:shroomlight", 0, 1));
    }
}