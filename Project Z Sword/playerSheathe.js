var openWithZS = false;
var LOOP_BREAK_TIMER = 912;
var zSwordLinkedId = 29;

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

// Check if player has z sword when opening a container
function containerOpen(event) {
    if(event.getContainer() == null) return;
    var player = event.player;
    var timers = player.timers;
    // Timer to prevent looping function
    if(timers.has(LOOP_BREAK_TIMER)) {
        timers.forceStart(LOOP_BREAK_TIMER, 3, false);
        return;
    }
    timers.forceStart(LOOP_BREAK_TIMER, 3, false);
    openWithZS = lib.hasZSword(player);
    container = event.getContainer();
}

function timer(event) {
    if(event.id != 911 || !container) return;
    var player = event.player;
    var closeWithZS = lib.hasZSword(player);
    if(openWithZS == closeWithZS) return;
    // Z Sword has been put into chest
    else if(openWithZS && !closeWithZS) {
        var inv = container.getItems();
        for (var i in inv) {
            var item = inv[i]
            if(item && item.getClass().toString().equals("class noppes.npcs.scripted.item.ScriptLinkedItem")) {
                if(item.getLinkedItem().getId() != zSwordLinkedId) continue;
                container.setSlot(i, null)
            }
        }
    } 
    // Z Sword has been taken from chest
    else if(!openWithZS && closeWithZS) {
        lib.removeZSword(player);
    }
}