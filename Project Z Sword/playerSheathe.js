// Re-sheathe Z Sword on login
function login(event) 
{
    var player = event.player;
    if(lib.removeZSword(player)) lib.giveZSword(player);
}

// Re-sheathe Z Sword on slot change
function profileChange(event) 
{
    var player = event.player;
    if(lib.removeZSword(player)) lib.giveZSword(player);
}
