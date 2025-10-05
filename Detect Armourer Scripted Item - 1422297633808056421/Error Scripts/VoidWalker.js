// voidwalker_replacer.js - replaces strength-enabled voidwalkers
// PLEASE UPDATE ALL SCRIPTS ON GITHUB IF YOU MAKE ANY CHANGES
// IF YOU REMOVE ANY GLOBAL SCRIPT PLEASE MARK IT AS 'INACTIVE' ON THE GITHUB
// AUTHOR: Ranger/Mighty
function changeVoidwalker(e) {
  //replaces weapon Voidwalker;
  var x = 10269;
  var y = 59;
  var z = 1;

  var world = e.API.getIWorld(0);
  var chest = world.getBlock(x, y, z).getContainer();

  var p = e.player;

  if (!p || !chest) {
    e.player.sendMessage("stop");
    return;
  }

  var InventoryItem = p.getInventory();
  //  p.sendMessage("I got your inventory!");

  var itemsChecked = world.getStoredData("voidwalker"); //make this equal to the name of the item requested
  // p.sendMessage("the item was checked");

  for (var i = 0; i < InventoryItem.length; i++) {
    if (InventoryItem[i] && !InventoryItem[i].hasTag("fixedWeapon")
        && InventoryItem[i].getDisplayName().equals(itemsChecked)
        && InventoryItem[i].getName().equals( "customnpcs:npcDemonicStaff")) {
      try {
        p.removeItem(InventoryItem[i], 1, false, false);
        p.timers.start(807, 2, false);
        API.executeCommand(world, "mail send Ranger_Halt " + p.getName()
            + " has had their voidwalker replaced!");
        API.executeCommand(world, "mail send Mighty_S0715 " + p.getName()
            + " has had their voidwalker replaced!");
      } catch (error) {
        p.sendMessage(
            "the code is dynamic but this shit didn't work (voidwalker)");
      }
    }
  }
}

function login(e) {
  changeVoidwalker(e);
}

function containerOpen(e) {
  if (e.getContainer() == null || e.player.timers.has(810)) return;
  changeVoidwalker(e)
  e.player.timers.start(810, 100, false);
}

function timer(e) {
  var x = 10269;
  var y = 59;
  var z = 1;
  var world = e.API.getIWorld(0);
  var chest = world.getBlock(x, y, z).getContainer();
  if (e.id == 807) e.player.giveItem(chest.getSlot(0), 1);
}