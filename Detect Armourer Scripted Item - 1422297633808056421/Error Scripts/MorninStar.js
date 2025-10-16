// morningstar_replacer.js - replaces strength-enabled Dragon God Morningstar weapons
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB
// AUTHOR: Ranger/Mighty

function changeMorningstar(e){

    //replaces weapon Morningstar;
    var x = 10269;
    var y = 59;
    var z = 1;

    var world = e.API.getIWorld(0);
    var chest = world.getBlock(x,y,z).getContainer();

    var p = e.player;

    

    if(p == null) return;

    

    if(chest == null){
        e.player.sendMessage("stop");
        return;
    }

    var InventoryItem = p.getInventory();
  //  p.sendMessage("I got your inventory!");

    var itemsChecked = world.getStoredData("DragonGodMorningstar"); //make this equal to the name of the item requested
   // p.sendMessage("the item was checked");

    for(var i = 0; i < InventoryItem.length; i++){
     //   p.sendMessage("checked slot number " + i);
        if(InventoryItem[i] != null && !InventoryItem[i].hasTag("fixedWeapon") && InventoryItem[i].getDisplayName() == itemsChecked){
            try {
                p.removeItem(InventoryItem[i], 1, false, false);
                p.timers.start(907, 2, false);
                //p.sendMessage("I have attempted to replace voidwalker");
                   e.API.executeCommand(world, "mail send pockington " + p.getName() + " has had their morningstar replaced!");
e.API.executeCommand(world, "mail send Mighty_S0715 " + p.getName() + " has had their morningstar replaced!");
            } catch (error) {
                p.sendMessage(error);
            }
            
        }
    }
}

function login(e){
changeMorningstar(e);
}

function containerOpen(e){
if(e.getContainer() == null) return;
if(e.player.timers.has(910)) return;
changeMorningstar(e)
e.player.timers.start(910, 100, false);
}

function timer(e){
 var x = 10269;    
var y = 59;
var z = 1;    
var world = e.API.getIWorld(0);   
 var chest = world.getBlock(x,y,z).getContainer();
    if(e.id == 907){
        e.player.giveItem(chest.getSlot(4), 1);
    }
}