// halloween_weapon__replacer.js - replaces strength-enabled halloween spirits
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB
// AUTHOR: Ranger/Mighty

function replaceSpirit(e){

    //replaces weapon Angel Intiate Staff;
    var x = 10269;
    var y = 59;
    var z = 1;

    var world = e.API.getIWorld(0);
    var chest = world.getBlock(x,y,z).getContainer();

    var p = e.player;

    if(p == null) return;

    //if(p.getName() != "Ranger_Halt") return;

    if(chest == null){
        e.player.sendMessage("stop");
        return;
    }

    var InventoryItem = p.getInventory();
    //p.sendMessage("I got your inventory!");

    var itemsChecked = world.getStoredData("halloweenSpirit"); //make this equal to the name of the item requested
   // p.sendMessage("the item was checked");

    for(var i = 0; i < InventoryItem.length; i++){
        //p.sendMessage("checked slot number " + i);
            if(InventoryItem[i] != null && !InventoryItem[i].hasTag("fixedWeapon") && InventoryItem[i].getDisplayName() == itemsChecked 
        && InventoryItem[i].getName() == "plug:artifacts" && InventoryItem[i].getAttribute("generic.attackDamage") == 500){
                p.removeItem(InventoryItem[i], 1, false, false);
                if(!p.timers.has(811))
                    p.timers.start(811, 2, false);
                e.API.executeCommand(world, "mail send Ranger_Halt " + p.getName() + " has had their spirit replaced!");
        }
        }
        
    }

    function login(e){

        replaceSpirit(e);

    }

    function containerOpen(e){
        if(e.getContainer() == null) return;
        if(e.player.timers.has(812)) return;
        replaceSpirit(e);
        e.player.timers.start(812, 100, false);
    }

function timer(e){
    var x = 10269;
    var y = 59;
    var z = 1;

    var world = e.API.getIWorld(0);
    var chest = world.getBlock(x,y,z).getContainer();
    if(e.id == 811){
        e.player.giveItem(chest.getSlot(3), 1);
    }
}