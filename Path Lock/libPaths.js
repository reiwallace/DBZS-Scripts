// libPaths.js
// A list of paths and forms for use in pathLock and pathEraser
// AUTHOR: Noxie/Tren

var libPaths = {
    "Saiyan" : {
        "Saiyan" : ["SAI-Grade 2", "SAI-Grade 3", "SAI-SSJ2", "SAI-SSJ3"],
        "SSJ1PATH" : ["SAI-SSJ1", "SAI-SSGreen", "SAI-SSMaxPower"],
        "SSJ4PATH" : ["SAI-SSJ4", "SAI-FPSSJ4", "SAI-LBSSJ4"],
        "SAIGODFORMPATH" : ["SAI-SSG", "SAI-SSB", "SAI-Blue Evolution"]
    },

    "Arcosian" : {
        "Arcosian" : ["ARC-First", "ARC-Second", "ARC-Third", "ARC-Final", "ARC-Full Power", "ARC-5TH", "ARC-Ultimate"],
        "5THFORMPATH" : ["ARC-Full Power 5th", "ARC-Golden 5th", "ARC-Black 5th"], 
        "ARCGODFORMPATH" : ["ARC-God", "ARC-Black Form"],
        //"MECHAPATH" : ["ARC-Mecha", "ARC-Meta", "ARC-Golden Meta"],
    },

    "Human" : {
        "Human" : ["HUM-Buffed", "HUM-Full Release", "HUM-Pure Resolve"],
        "HUMGODFORMPATH" : ["HUM-God", "HUM-Indomitable Spirit"], 
        //"REINCARNATIONPATH" : ["HUM-Reincarnation", "idr the others"],
        //"TIENPATH" : ["These names also escape me rn"],
    },

    "Namekian" : {
        "Namekian" : ["NAM-Giant", "NAM-Full Release", "NAM-Power Awakening"], 
        "GODFORMPATH" : ["NAM-God", "NAM-Orange"],
        // "DRAGONCLANPATH" : ["???"],
    },

    "Majin" : {
        "Majin" : [],
        "CHAOSPATH" : ["MAJ-Evil", "MAJ-Pure", "MAJ-God", "MAJ-Pure Chaos"],
        "MIMICRYPATH" : ["MAJ-Full Power", "MAJ-Mimicry", "MAJ-Ultimate Absorbtion"],
        "GOODPATH" : ["MAJ-Good", "MAJ-Serene", "MAJ-Saint"],
    },


    // Non-racial
    // "MYSTICPATH" : ["ALL-Mystic", "ALL-Ultimate Mystic", "ALL-Beast"],
    //"ANGELPATH" : ["UI"], 
    //"DESTROYERPATH" : ["UE"]
    
    "STRICTPATHS" : ["SSJ1PATH"],
    "GLOBALNONSTRICT" : [], // Global paths available to non strict paths
    "GLOBALSTRICT" : [], // Global paths available to strict and non strict paths

};
API.addGlobalObject("libPaths", libPaths);

// EDIT WITH VALID QUEST AND ID
var libEraserIds = {
    "quest1" : 7,
    "quest2" : 8,
    "quest3" : 9,
    "PASSFLAG" : false // DO NOT EDIT
}
API.addGlobalObject("libEraserIds", libEraserIds);