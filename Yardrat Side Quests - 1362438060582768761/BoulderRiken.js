//Boulder Script
//Successful Fight
var NEXT_SCENE_TIMER = 1; //NEXT_SCENE_TIMER
var Time = 3000; //Timer Time = Ticks

var NEXT_SCENE = "-1068 95 2802"; //Cords of the next scene
var PREVIOUS_SCENE = "-1575 105 2142"; //Scene before if the player fails 💀

function tick(event) {
    var npc = event.npc;
    var NPCId = npc.getWorld().getTempData("TrunksSpiritControlID");
    if (npc.getWorld().getEntityByID(NPCId) != null) {//Null Check    
        npc.setAttackTarget(npc.getWorld().getEntityByID(NPCId));
    }
}

function damaged(event) {
    var npc = event.npc;
    // TODO 1: Assign npc.getTimers() to a variable to make the lines shorter
    if (!npc.getTimers().has(NEXT_SCENE_TIMER)) { //Checks if the Timer needs to be started to get to the next Scene
        npc.getTimers().start(NEXT_SCENE_TIMER, Time, false);//Starts Timer
    }
}

function timer(event) {
    var npc = event.npc;
    // TODO 2: use global Timer constant
    if (event.id == 1) { //Checks if the Timer ran to tp the player to the next scene
        var nearestPlayer = npc.getWorld().getClosestPlayerToEntity(npc, 15);//Gets the ClosestPlayer(Player that was/is in the Arena) to warp him to the next Scene
        if (nearestPlayer != null) {//Null Check
            var playerName = nearestPlayer.getName()
            npc.reset();//Reset NPC after a succesful fight
            npc.executeCommand("/tp " + playerName + " " + NEXT_SCENE);//Tps the Player to the Next Scene after the Timer ran
        }
    }
}

//Not Successful Fight -> Boulder kills Trunks
function kills(event) {
    var npc = event.npc;
    var NPCId = npc.getWorld().getTempData("TrunksSpiritControlID"); //Gets Trempdata from World from Trunks for the NPCID
    //npc.say(NPCId);
    var NPCName = npc.getWorld().getEntityByID(NPCId).getName(); // Gets the Name from Trunks NPCID
    //npc.say(NPCName);
    if (NPCName == "Trunks (SpiritControl)") { //Checks if the NPCID Name matches with Trunks NPCName
        // TODO 3: Put getClosestPlayerToEntity in a variable instead of calling twice
        if (npc.getWorld().getClosestPlayerToEntity(npc, 25) != null) {//Null Check
            var NearestPlayer = npc.getWorld().getClosestPlayerToEntity(npc, 25).getName(); //Gets the ClosestPlayer(Player that was/is in the Arena) to warp him back a Scene for him to restart the fight
            //npc.say(NearestPlayer);
            npc.getTimers().stop(NEXT_SCENE_TIMER) // Stops the Started Timer since the fight is going to restart
            npc.reset();//Reset NPC after failing the fight
            npc.executeCommand("/tp " + NearestPlayer + " " + PREVIOUS_SCENE); // Warps the Player Back to the previous Scene to restart the fight
        }
    }
}

//Trunks Script
function init(event) {
    var npc = event.getNpc();
    npc.getWorld().setTempData("TrunksSpiritControlID", npc.getEntityId()); //Create Tempdata in World so the Bouder can check if the killed Trunks
}