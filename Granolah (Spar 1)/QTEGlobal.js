function customGuiButton(event)
{
    // Passes quick time event if corret id
    var qteHandler = event.player.getTempData("qteHandler");
    if (event.id == qteHandler.getButtonId()) qteHandler.passQTE();
}