var highlightTexture = "https://i.imgur.com/ZETBNSQ.png";

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
                player.setTempData("selectedButton", buttonId);
            } else {
                gui.removeComponent(101);
            }
        } catch(err) {
                gui.addTexturedRect(101, highlightTexture, button.getPosX(), button.getPosY(), button.getWidth(), button.getHeight());
                player.setTempData("selectedButton", buttonId);
        }
        gui.update(player);
        return;
    } 

    try {
        // Check if player has a skill selected
        gui.getComponent(101);
        if(buttonId > 54 || !player.getTempData("selectedButton")) return;
        player.getTempData("select").select(player, player.getTempData("selectedButton"), buttonId - 50);

        button.setTexture(gui.getComponent(player.getTempData("selectedButton")).getTexture())
    } catch(err) {}
}
