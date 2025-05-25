//Timer 10 = Starter Timer / Animation Timer
//Timer 20 = Solar Flare Timer
//Timer 30 = Disable Solar Flare Timer
//Timer 100 = Cooldown Timer

var TimerID = 10; //TimerID
var Time = 10; //Timer Time = Ticks
var Cooldown = 100 //Cooldown ID
var CooldownTime = 600 //Timer Time = Ticks

function killed(event){
	var npc = event.npc;
	npc.getTimers().stop(Cooldown); //Stop the Cooldown Timer on Death
}

function damaged(event) {
	var npc = event.npc;
	var MaxHealth = npc.getMaxHealth();
	if (npc.getHealth() <= MaxHealth * 0.5) { //Checks if NPC is under 50% HP
		//npc.say(npc.getTimers().size());
		if (npc.getTimers().size() == 0) {
			npc.getTimers().start(TimerID, Time, false);//Starts Timer
		}
	}
}

function timer(event) {
	var npc = event.npc;
	if (npc == null) { //Checks if there is even an npc
		return;
	}
	if (npc.getTimers().has(Cooldown)) {    //Condition if Cooldown Timer is active
		return;
	} else {
		switch (event.getId()) { //Checks for which Step (TimerIDs)
			// Begin Solar 
			case 10:
				var animData = npc.getAnimationData(); //Animation
				var anim = API.getAnimations().get("Solarflare"); //Animation
				animData.setEnabled(true); //Animation
				animData.setAnimation(anim); //Animation
				animData.updateClient(); //Animation
				npc.say("&eSolar");
				npc.getTimers().start(20, 32, false);//Starts Timer
				break;

			// Flare with Effects / Overlay
			case 20:
				var overlay = API.createCustomOverlay(1); //Create Overlay via API
				var player = npc.getAttackTarget();
				var Duration = 200; //Time in Ticks
				if (player == null) { //Checks if there is a Target
					return;
				}
				npc.say("&6&lFlare!");
				player.addPotionEffect(2, 10, 3, true); //Gives Player Slowness
				overlay.addTexturedRect(2, "https://imgur.com/2WtWpKI.png", 0, 0, 1920, 1080); //Get the Overlay .png over link
				player.showCustomOverlay(overlay); //show Player Overlay
				npc.setTempData("SolarTarget", player.getName()); //Sets Tempdata to close it later | Needed if Player disconntect | Sends Playername
				npc.getTimers().start(30, Duration, false); //Starts the Duration Timer for Solar Flare
				break;

			// Clear Solar Flare from Player
			case 30:
				if (npc.hasTempData("SolarTarget")) { //Checks if there is Tempdata
					var player = API.getPlayer(npc.getTempData("SolarTarget")); //Get Playername
					if (player == null) { // Check if they are online
						return;
					}
					player.closeOverlay(1); //Close Overlay
					npc.getTimers().start(Cooldown, CooldownTime, false); //Start Cooldown Timer
				}
				break;
		}
	}
}


//Other NPCs

var DodonRayDamage = 210000; //Damage for Ki Attack
var CooldownTime = 200; //Cooldown Time
function attack(event) {
	var npc = event.npc;
	var player = event.getTarget();
	if (player == null) { //Checks if there is a Target
		return;
	}
	//npc.say(player);
	if (npc.getTimers().has(100)) { //Check if CooldownTimer is active
		return;
	}
	if (player.getPotionEffect(2) > -1) { //Gives the getPotionEffect the ID of the Effect to the function and if its over -1 the player has the effect
		var animData = npc.getAnimationData(); //Animation
		var anim = API.getAnimations().get("LeftHandKi"); //Animation
		animData.setEnabled(true); //Animation
		animData.setAnimation(anim); //Animation
		animData.updateClient(); //Animation
		npc.say("&eDodon Ray");
		npc.executeCommand("/dbcspawnki 3 1 " + DodonRayDamage + " 0 7 1 1 100 " + npc.getX() + " " + npc.getY() + " " + npc.getZ()); //Spawns Spiral (DodonRay)
		//npc.say("Ki");
		npc.getTimers().start(100, CooldownTime, false); //Start Cooldown Timer
	}

}