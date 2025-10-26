var hits = 0;
var zenkai = {
    onDamageZenkaiChance: 0.7,
    activationThreshold: 0.5,

    zenkaiMessage: "A",
    zenkaiSound: API.createSound("jinryuudragonbc:DBC.ascend"),

    healthMulti: 2.5,
    regenMulti: 1.5,
    meleeMulti: 1.8,
    rangedMulti: 0.65,

    maxHealth: 135000000,
    maxMelee: 3300000,
    maxCombatRegen: 440000,
    maxRangedDamage: 3800000,
}

var zenkaiA = {
    baseHealth: 120000000,
    baseMelee: 1800000,
    baseCombatRegen: 370000,
    baseOOCRegen: 10000000,
    baseRangedDamage: 2600000,
    
    rangedType: 1,
    rangedSpeed: 6,
    rangedEffect: 1,
    rangedDensity: 3,
    rangedSound: 4,
    rangedSize: 40,
    rangedColor: 3,

    
    maxHealth: 135000000,
    maxMelee: 3300000,
    maxCombatRegen: 440000,
    maxOOCRegen: 10000000,
    maxRangedDamage: 3800000,
    
    playerStatMulti: 1,
    kiDamageMulti: 0.8,
    weaponDamageMulti: 0.2,
    thrownItemMulti: 0.1,
    
    newHealthMutli: 2.5,
    newOOCRegenMulti: 0.8,
    newRegenMulti: 1.5,
    newDamageMulti: 1.8,
    newRangedMulti: 0.65,
    
    passiveZenkaiTimer: 15, //in seconds
    afkTimer: 2, //in minutes
    
    onDamageZenkaiChance: 0.7,
    
    passiveZenkaiHitMulti: 10, 
    
    onDamageZenkaiSound: "jinryuudragonbc:DBC.ascend",
    onDamageZenkaiVolume: 0.2,
    passiveZenkaiSound: "jinryuudragonbc:DBC.fusefin",
    passiveZenkaiVolume: 1.2,
    
    
    
    
    justDied: npc.getStoredData("justDied"),
    
    
    
    setNPCBase: function setNPCBase(){
        npc.setMaxHealth(this.baseHealth);
        npc.setHealthRegen(this.baseOOCRegen);
        npc.setStoredData("meleeDamage", this.baseMelee);
        npc.setCombatRegen(this.baseCombatRegen);
        //npc.setHealth(npc.getMaxHealth());
        npc.setStoredData("kiDamage", this.baseRangedDamage);
        npc.setStoredData("lastAttackTick", 0);
        npc.setStoredData("hasZenkaiHappened", "true");
        return 0;
    },
    
    loadNPC: function loadNPC(){
            return
        }else{
            npc.clearStoredData();
            this.setNPCBase();
            //npc.reset();
        }
        return 0;
    },
    
    setState: function setState(stat, dmg){
        this.addNPCStats((stat*this.playerStatMulti)+(dmg*this.weaponDamageMulti));
    },
    
    getStr: function getStr(playerNBT){
        return playerNBT.func_74762_e("jrmcStrI");
    },
    
    getWil: function getWil(playerNBT){
        return playerNBT.func_74762_e("jrmcWilI");
    },
    
    playSound: function playSound(radius, sound, volume){
        var plrs = npc.getSurroundingEntities(radius,1);
        for(i = 0; i < plrs.length; i++){
            npc.executeCommand("/playsound "+sound+" "+plrs[i].getName()+" "+npc.x+" "+npc.y+" "+npc.z+" "+volume+" 1 1");
        }
        return 0;
    },
    
    damageEvent: function damageEvent(event){
    var hits = npc.getStoredData("amountOfHits")
        if(hits != null){
            npc.setStoredData("amountOfHits", hits+1);
        }else{
            hits = 0;
            npc.setStoredData("amountOfHits", hits+1);
        }
        if(event.getSource() != null){
            if(event.getSource().getType() == 1){
                npc.setStoredData("hasZenkaiHappened", "false");
                npc.setStoredData("lastAttackTick", world.getTotalTime());
                this.saveNPC();
                if(Math.random() <= this.onDamageZenkaiChance){
                    var nbt = event.getSource().getMCEntity().getEntityData().func_74775_l("PlayerPersisted"); 
                    var dmg = event.getDamage();
                    switch(event.getType()){
                        case "causeEnExplosion":
                        this.setState(0, dmg);
                        break;
                        case "EnergyAttack":
                        this.setState(0, dmg);
                        break;
                        case "player":
                        this.setState(this.getStr(nbt), dmg);
                        break;
                        case "thrown":
                        this.setState(this.getWil(nbt)*this.thrownItemMulti, dmg);
                        break;
                        case "arrow":
                        this.setState(this.getWil(nbt)*this.thrownItemMulti, dmg);
                        break;
                        default:
                        break;
                    }
                    this.playSound(20,this.onDamageZenkaiSound,this.onDamageZenkaiVolume);
                }
            }else{
                this.killSteal(event);
            }
        }else{
            this.killSteal(event);
        }
        return 0;
        },
    
    updateTick: function updateTick(){
        if(npc.getHealth() > 0){
            this.saveNPC();
            var worldTicks = world.getTotalTime();
            var attackTicks = npc.getStoredData("lastAttackTick");
            var hits = npc.getStoredData("amountOfHits");
            if(attackTicks != null){
                if(((worldTicks-attackTicks)/20)/60 <= this.afkTimer){
                    if((worldTicks-attackTicks)/20 >= this.passiveZenkaiTimer){
                        if(npc.getStoredData("hasZenkaiHappened") == "false"){
                            if(hits != null){
                                this.addNPCStats(hits*(this.passiveZenkaiHitMulti));
                                this.playSound(20,this.passiveZenkaiSound,this.passiveZenkaiVolume);
                                npc.setStoredData("amountOfHits", null);
                                npc.setStoredData("hasZenkaiHappened", "true");
                            }
                        }
                    }
                }else{
                    this.resetNPC();
                    npc.setHealth(npc.getMaxHealth());
                }
            }
        }else{
            this.resetNPC();
        }
        return 0;
    },
    
    attackEvent: function attackEvent(event){
        if(event.isRange()){
            var kiRangedDamage = (npc.getStoredData("kiDamage")/(this.rangedSize/100));
            npc.executeCommand("/dbcspawnki "+this.rangedType+" "+this.rangedSpeed+" "+Math.floor(kiRangedDamage)+" "+this.rangedEffect+" "+this.rangedColor+" "+this.rangedDensity+" "+this.rangedSound+" "+this.rangedSize+" "+npc.x+" "+npc.y+" "+npc.z);        
            event.setCancelled(true);
        }else if(npc.getStoredData("meleeDamage") != null){
        event.setDamage(Math.floor(npc.getStoredData("meleeDamage")));
        //npc.executeCommand("/jrmcheal body -"+npc.getStoredData("meleeDamage")+" "+event.getTarget().getName());
        }
        return 0;
    },
    
    resetNPC: function resetNPC(){
        npc.clearStoredData();
        this.setNPCBase();
        if(this.justDied == "true"){
            npc.setHealth(0);
            this.justDied = "false";
            npc.setStoredData("justDied", this.justDied);
        }
        return 0;
    },
    
    deathEvent: function deathEvent(event){
        npc.clearStoredData();
        npc.setHealth(0);
        npc.setStoredData("justDied", "true");
        return 0;
    },
    
    killSteal: function killSteal(event){
        if(event.getDamage() < npc.getHealth()){
            if(event.getType() == "EnergyAttack"){
                npc.setHealth(npc.getHealth()-event.getDamage());
                this.saveNPC();
                event.setCancelled(true);
            }
        }else{
        event.setCancelled(true);
        }
        return 0;
    }
    
};
var worldTicks = world.getTotalTime();
var attackTicks = npc.getStoredData("lastAttackTick");

if(attackTicks != null){
    if(((worldTicks-attackTicks)/20)/60 <= zenkai.afkTimer){
        zenkai.loadNPC();
    }else{
        zenkai.resetNPC();    
    }
    
}else{
    zenkai.resetNPC();
}


npc.setTempData("zenkai", zenkai);

npc.getTempData('scriptContainer').eventHooks.killedHook(event);

function init(event) {
    event.npc.clearStoredData();
}

function damaged(event) {
    var player = event.source;
    var npc = event.npc;
    if(!lib.isPlayer(player) || !npc || Math.random() < zenkai.onDamageZenkaiChance || npc.getMaxHealth() > npc.getMaxHealth() * zenkai.activationThreshold) return;
    applyZenkai(npc);
}

/** Increases npc stats up to config max
 * @param {ICustomNpc} npc 
 */
function applyZenkai(npc) {
    // Apply stats based on config multi
    npc.setMaxHealth(npc.getMaxHealth() * zenkai.healthMulti < zenkai.maxHealth ? npc.getMaxHealth() * zenkai.healthMulti : zenkai.maxHealth);
    npc.setHealth(npc.getMaxHealth() * npc.getHealth() / npc.getMaxHealth());
    npc.setCombatRegen(npc.getCombatRegen() * zenkai.regenMulti < zenkai.maxCombatRegen ? npc.getMaxHealth() * zenkai.healthMulti : zenkai.maxHealth);
    npc.setMeleeStrength(npc.getMeleeStrength() * zenkai.rangedMulti < zenkai.maxRangedDamage ? npc.getMaxHealth() * zenkai.healthMulti : zenkai.maxHealth);
    npc.setRangedStrength(npc.getRangedStrength() * zenkai.meleeMulti < zenkai.maxMelee? npc.getMaxHealth() * zenkai.healthMulti : zenkai.maxHealth);
    
    // Telegraph zenkai
    npc.say(zenkai.zenkaiMessage);
    zenkai.zenkaiSound.setPosition(npc.getPosition());
    API.playSound(zenkai.zenkaiSound);
}