//Boulder Script

//Successful Fight
// CHANGE THESE
var NEXT_SCENE = "-1068 95 2802"; //Cords of the next scene
var PREVIOUS_SCENE = "-1575 105 2142"; //Scene before if the player fails 💀

// CONFIG
var TIME = 3000; //Timer Time = Ticks

// TIMERS
var NEXT_SCENE_TIMER = 1;

function tick(event)
{
    var world = event.npc.world;
    var npcId = world.getTempData("TrunksSpiritControlID");

    // Checks if npc is null, sets target to trunks otherwise
    if (world.getEntityByID(npcId) == null) return;
    event.npc.setAttackTarget(world.getEntityByID(npcId));
}

function damaged(event)
{
    var timers = event.npc.getTimers();

    //Checks if the Timer needs to be started to get to the next Scene
    if(timers.has(NEXT_SCENE_TIMER)) return;
    timers.start(NEXT_SCENE_TIMER, TIME, false);
}

function timer(event)
{
    var npc = event.npc;
    switch(event.id) {
        case(NEXT_SCENE_TIMER): // Tp the player to the next scene
            // Get the ClosestPlayer(Player that was/is in the Arena) to warp him to the next Scene
            var nearestPlayer = npc.world.getClosestPlayerToEntity(npc, 15);
            if(nearestPlayer == null) return;
            
            // Tp player to next scene and reset npc
            var playerName = nearestPlayer.getName()
            npc.reset();
            npc.executeCommand("/tp " + playerName + " " + NEXT_SCENE);
            break;
    }
}

//Not Successful Fight -> Boulder kills Trunks
function kills(event)
{
    var npc = event.npc;
    var world = npc.world;
    var npcId = world.getTempData("TrunksSpiritControlID"); //Gets Trempdata from World from Trunks for the NPCID
    var npcName = world.getEntityByID(npcId).getName(); // Gets the Name from Trunks NPCID
    var nearestPlayer = world.getClosestPlayerToEntity(npc, 25); 

    // Return if npcId name is not Trunk's name or return on no player found
    if (npcName != "Trunks (SpiritControl)" || nearestPlayer == null) return; 

    // Stops next scene timer, resets npc and move player to previous scene
    npc.timers.stop(NEXT_SCENE_TIMER);
    npc.reset();
    npc.executeCommand("/tp " + nearestPlayer.getName() + " " + PREVIOUS_SCENE);
}

// Trunks Script
function init(event)
{
    var npc = event.npc;
    //Create Tempdata in World so the Bouder can check if the killed Trunks
    npc.getWorld().setTempData("TrunksSpiritControlID", npc.getEntityId()); 
}