//Boulder Script
//Successful Fight
var TimerID = 1; //TimerID
var Time = 3000; //Timer Time = Ticks
var NextScene = "-1068 95 2802"; //NextScene Cords
var SceneBack = "-1575 105 2142"; //Scene before if the player fails 💀

function tick(event) {
    var npc = event.npc;
    var NPCId = npc.getWorld().getTempData("TrunksSpiritControlID");
    if (npc.getWorld().getEntityByID(NPCId) != null) {//Null Check    
        npc.setAttackTarget(npc.getWorld().getEntityByID(NPCId));
    }
}

function damaged(event) {
    var npc = event.npc;
    if (!npc.getTimers().has(TimerID)) { //Checks if the Timer needs to be started to get to the next Scene
        npc.getTimers().start(TimerID, Time, false);//Starts Timer
    }
}

function timer(event) {
    var npc = event.npc;
    if (npc.getWorld().getClosestPlayerToEntity(npc, 15) != null) {//Null Check
        var NearestPlayer = npc.getWorld().getClosestPlayerToEntity(npc, 15).getName();//Gets the ClosestPlayer(Player that was/is in the Arena) to warp him to the next Scene
        if (event.id == 1) { //Checks if the Timer ran to tp the player to the next scene
            npc.reset();//Reset NPC after a succesful fight
            npc.executeCommand("/tp " + NearestPlayer + " " + NextScene);//Tps the Player to the Next Scene after the Timer ran
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
        if (npc.getWorld().getClosestPlayerToEntity(npc, 25) != null) {//Null Check
            var NearestPlayer = npc.getWorld().getClosestPlayerToEntity(npc, 25).getName(); //Gets the ClosestPlayer(Player that was/is in the Arena) to warp him back a Scene for him to restart the fight
            //npc.say(NearestPlayer);
            npc.getTimers().stop(TimerID) // Stops the Started Timer since the fight is going to restart
            npc.reset();//Reset NPC after failing the fight
            npc.executeCommand("/tp " + NearestPlayer + " " + SceneBack); // Warps the Player Back to the previous Scene to restart the fight
        }
    }
}

//Trunks Script
function init(event) {
    var npc = event.getNpc();
    npc.getWorld().setTempData("TrunksSpiritControlID", npc.getEntityId()); //Create Tempdata in World so the Bouder can check if the killed Trunks
}