var highlightTexture = "https://i.imgur.com/jQh1vdA.png";

function customGuiButton(event) {
    var gui = event.gui;
    if(gui.getID() != 301) return;

    var buttonId = event.id;
    var player = event.player;
    var button = gui.getComponent(buttonId);

    // Remove selection box if a button is already selected or add selection box
    if(buttonId < 50) {
        try {
            // If another button is clicked
            if(gui.getComponent(101).getPosX() != button.getPosX() || gui.getComponent(101).getPosY() != button.getPosY()){
                gui.removeComponent(101);
                gui.addTexturedRect(101, highlightTexture, button.getPosX(), button.getPosY(), button.getWidth(), button.getHeight());
                player.setTempData("selectedButton", buttonId - 1);
            } else {
                gui.removeComponent(101);
            }
        } catch(err) {
                gui.addTexturedRect(101, highlightTexture, button.getPosX(), button.getPosY(), button.getWidth(), button.getHeight());
                player.setTempData("selectedButton", buttonId - 1);
        }
        gui.update(player);
        return;
    } 

    try {
        gui.getComponent(101);
        player.getTempData("select").select(player, player.getTempData("selectedButton"), buttonId - 50);

    } catch(err) {}
}
