// casino_item_deleter.js - deletes casino items due to duplication exploits
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB
// AUTHOR: Ranger

function containerOpen(e) {
    var x = 10269;
    var y = 59;
    var z = 3;

    var world = e.API.getIWorld(0);
    var chest = world.getBlock(x,y,z).getContainer();

    var chestSlot = 0;

    var p = e.player;
    if(p == null) return;
    if(p.getName() == "Ranger_Halt" || p.getName() == "AyoteTheGod" || p.getName() == "Kam" || p.getName() == "Mighty_S0715" || p.getName() == "iTzLighty" || p.getName() == "pockington" || p.getName() == "Alright_Vibes" || p.getName() == "kleaRr" || p.getName() == "Max1581" || p.getName() == "_WhiteMidnight_" || p.getName() == "Rikentod") return;

    if(chest == null){
        e.player.sendMessage("stop");
        return;
    }

    var d = e.getContainer();
if(d == null) return;
    var c = d.getItems();

    var bool = false;
    var counter = 0;
    for(var i = 0; i < c.length; i++) {
        bool = false;
      if(c[i] != null && c[i].getAttribute("generic.attackDamage") >= 3000000) {
        bool = true;
      }
      if(c[i] != null && c[i].getDisplayName().equals("LR Token")) {
        bool = true;
      
      }
      if(c[i] != null && c[i].getDisplayName().equals("Legendary Tickets")){
        bool = true;
      }
      if(bool) {
        counter++;
        e.getContainer().setSlot(i, chest.getSlot(1));
        e.getContainer().getSlot(i).setStackSize(1);
    }
   }
   if(counter > 0){
    e.API.executeCommand(world,"sudo " + e.player.getName() +" mail send Ranger_Halt " + e.player.getName() + " has an illegal weapon at " + e.player.x + " " + e.player.y + " " + e.player.z);
    e.API.executeCommand(world,"mail Mighty_S0715 " + e.player.getName() + " has an illegal item at " + e.player.x + " " + e.player.y + " " + e.player.z);
    e.API.executeCommand(world,"mail Kam " + e.player.getName() + " has an illegal item at " + e.player.x + " " + e.player.y + " " + e.player.z);
    e.API.executeCommand(world,"mail Ayote " + e.player.getName() + " has an illegal item at " + e.player.x + " " + e.player.y + " " + e.player.z);
   }
}