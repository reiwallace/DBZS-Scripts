function collide(event) {
    var firstPlayer = event.getEntity();
    var secondPlayer = firstPlayer.world.getClosestPlayer(8447, 99, -3227, 22);
    if(lib.isPlayer(firstPlayer) && lib.isPlayer(secondPlayer) && firstPlayer != secondPlayer) {
        var random = lib.getRandom(1, 2, true);
        if(random == 1) {
            firstPlayer.setPosition(8449, 113, -3223)
            secondPlayer.setPosition(8443, 113, -3223);
        } else {
            secondPlayer.setPosition(8449, 113, -3223)
            firstPlayer.setPosition(8443, 113, -3223);
        }
    }
}
