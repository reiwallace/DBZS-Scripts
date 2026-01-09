// Global Script to close popup
function customGuiButton(event)
{
    if(event.getGui().getID() == 134) event.player.closeGui();
}