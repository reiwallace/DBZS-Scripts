// angel_staff_replacer.js - replaces strength-enabled angel staffs
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB
// AUTHOR: Ranger/Mighty

function replaceAngelStaff(e){

    //replaces weapon Angel Intiate Staff;
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
    //p.sendMessage("I got your inventory!");

    var itemsChecked = world.getStoredData("angelstaff"); //make this equal to the name of the item requested
   // p.sendMessage("the item was checked");

    for(var i = 0; i < InventoryItem.length; i++){
        //p.sendMessage("checked slot number " + i);
            if(InventoryItem[i] != null && !InventoryItem[i].hasTag("fixedWeapon") && InventoryItem[i].getDisplayName() == itemsChecked 
        && InventoryItem[i].name == "minecraft:diamond_sword" && InventoryItem[i].getAttribute("generic.attackDamage") == 370000){
                p.removeItem(InventoryItem[i], 1, false, false);
                if(!p.timers.has(808))
                    p.timers.start(808, 2, false);
                e.API.executeCommand(world, "mail send Ranger_Halt " + p.getName() + " has had their angel staff replaced!");
e.API.executeCommand(world, "mail send Mighty_S0715 " + p.getName() + " has had their voidwalker replaced!");
        }
        }
        
    }

    function login(e){

        replaceAngelStaff(e);

    }

    function containerOpen(e){
        if(e.getContainer() == null) return;
        if(e.player.timers.has(809)) return;
        replaceAngelStaff(e);
        e.player.timers.start(809, 100, false);
    }

function timer(e){
    var x = 10269;
    var y = 59;
    var z = 1;

    var world = e.API.getIWorld(0);
    var chest = world.getBlock(x,y,z).getContainer();
    if(e.id == 808){
        e.player.giveItem(chest.getSlot(1), 1);
    }
}