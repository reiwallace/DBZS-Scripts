function speak(player, text, color, size, speakID) { // Place speech overlay on player's screen
    var speechOverlay = API.createCustomOverlay(speakID); // Create overlay with id
    var x = player.getScreenSize().getWidth()/4 - Math.floor((text.length) * 2.5) * size; // Calculate centre position
    var y = player.getScreenSize().getHeight()/4 - Math.floor(size * 6.5);
    speechOverlay.addLabel(1, text, x, y, 0, 0, color); // Add label in the middle of the screen with the given color
    speechOverlay.getComponent(1).setScale(size); // Resize the label
    player.showCustomOverlay(speechOverlay); // Place the overlay on the player's screen
    speechOverlay.update(player); // Update the label to be visible
}

function cancelSpeak(player, speakID) { // Remove text from player screen
    player.closeOverlay(speakID); 
}