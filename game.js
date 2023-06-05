// global settings
const minSpeed = .5;            // min value a player's speed can get set to if they have multiple slowness effects
const freezeMelee = true;       // freeze player movement while using melee attacks
const freezeProjectile = false; // freeze player movement while using projectile attacks
const camMinZoom = 1.5;         // smallest the camera will zoom
const camPadding = 80;          // area between player and edge of screen
const itemScale = 2.5;          // scale of items
const itemsGrid = true;         // items snap to grid when placed
var bossIsHere = false;         // is the boss in the level?
let uiContainer;
let numPlayers = 1;

var level = 1;
// list of random levels to choose from
const RandItems = [
    0, 1, 2, 3, 4, 5, 6, 7,
    8, 9,10,11,12,13,14,15,
    16,17,18,19,20,21,22,23,
    24,25,26,27,28,29,30,31,
    32,33,34,35,36,37,38,39,
    40,41
];
const RandProps_Wall = [
    7,
    20, 21, 22, 23, 26, 27, 28, 29,
    42, 43, 55, 45, 46, 47,
    60, 61, 62, 63, 64, 65, 66, 67,
    70, 71, 72, 73, 74, 75
];
const RandProps_Floor = [
    7,
    10, 11, 12, 13, 14, 15, 16,
    24, 25,
    30, 31, 32, 33, 34, 35, 36, 37, 38,
    40, 41, 48, 49,
    50, 51, 52, 53, 54, 56, 57, 59,
    65, 66, 67,
];
const RandProps_nearWall = [ 7, 24, 25 ];
const RandProps_DontRotate = [ 10, 11, 12, 13, 14, 15, 16, 50, 51 ]; // chests, and mushrooms
const RandProps_Chest = [ 10, 11, 12, 13, 14, 15, 16 ];
const RandTile_Floor = [ 81,82,83 ]; //21, 22, 23, 24, 25
const Tile_BorderWall = [ 7, 8, 29, 35, 40, 45, 50, 57, 58 ];

// global variables
var levels = {};
var players = [];
var playMusic = true;

const EditMode = { NotEditing: 0, Selecting: 1, PlaceBlock: 2, PlaceItem: 3, DeleteItem: 4, PlaceBlockBG: 5 }

class SetupLevel extends Phaser.Scene {

    preload() {
        //load sounds from /assets/sounds
        this.load.image('madeWith', 'assets/madeWith.png');
        this.load.image('addSoftware', 'assets/addSoftware.png');
        this.load.image('groupLogo', 'assets/groupLogo.png');
        this.load.image('lore1', 'assets/IntroLore_1.png');
        this.load.image('lore2', 'assets/IntroLore_2.png');
        this.load.image('lore3', 'assets/IntroLore_3.png');

        this.load.audio('dash_sound', 'assets/sounds/dash.mp3');
        this.load.audio('die_sound', 'assets/sounds/die.mp3');
        this.load.audio('drone_die', 'assets/sounds/droneCrash.mp3');
        this.load.audio('drone_move', 'assets/sounds/droneFlying.mp3');
        this.load.audio('girl_ouch', 'assets/sounds/girlDMG.mp3');
        this.load.audio('inventory_sound', 'assets/sounds/inventoryOpen.mp3');
        this.load.audio('guy_ouch', 'assets/sounds/maleDMG.mp3');
        this.load.audio('slime_move', 'assets/sounds/slime.mp3');
        this.load.audio('teleport_sound', 'assets/sounds/teleport.mp3');
        this.load.audio('BOSS_die', 'assets/sounds/yes.mp3');
        //load new sounds from /assets/sounds
        this.load.audio('Mag_cast', 'assets/sounds/Mag_Cast.mp3');
        this.load.audio('Mag_1', 'assets/sounds/Mag1.mp3');
        this.load.audio('Mag_2', 'assets/sounds/Mag2.mp3');
        this.load.audio('Slime_attack', 'assets/sounds/Slime_at.mp3');
        this.load.audio('Slime_move', 'assets/sounds/Slime_mov.mp3');
        this.load.audio('Open_door', 'assets/sounds/OpenDoor.mp3');
        this.load.audio('Boss_tel', 'assets/sounds/Boss_tele.mp3');
        this.load.audio('Boss_Death', 'assets/sounds/Boss_Death.mp3');
        this.load.audio('Boss_Explosion', 'assets/sounds/Boss_Explosion.mp3');
        this.load.audio('Mag2_cast', 'assets/sounds/Boss_MagicSword_Cast.mp3');

        this.load.tilemapTiledJSON('map', 'assets/tile_properties.json');
        this.load.image('tiles', 'assets/Level Design Blocks.png');
        this.load.spritesheet('girl',  'assets/sprites/characters/Girl.png', {frameWidth: 48, frameHeight: 48});
        this.load.spritesheet('guy', 'assets/sprites/characters/Guy.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('drone', 'assets/sprites/characters/Enemy Drone.png', { frameWidth: 48, frameHeight: 48 });
        this.load.image('fire', 'assets/red.png');
        this.load.image('inventory', 'assets/ui/Inventory Book.png');
        this.load.image('inventory_empty', 'assets/ui/Inventory Book Blank.png');
        this.load.image('inventory_esc', 'assets/ui/Escape Button.png');
        this.load.image('inventory_escpull', 'assets/ui/Escape_Button_Hover.png');
        this.load.image('inventory_menu', 'assets/ui/Menu Button.png');
        this.load.image('inventory_menupull', 'assets/ui/Menu_Button_Hover.png');
        this.load.image('inventory_inv', 'assets/ui/Inventory Button.PNG');
        this.load.image('inventory_invpull', 'assets/ui/Inventory Button_Hover.png');
        this.load.image('inv_icon', 'assets/ui/Inventory_Icon.png');
        this.load.image('TitleText', 'assets/splash/TitleText.png');
        this.load.spritesheet('items', 'assets/Items.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('props', 'assets/Level_Design_-_Props.png', { frameWidth: 32, frameHeight: 32 });
        this.load.plugin('rexcircularprogressplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcircularprogressplugin.min.js', true);
        this.load.plugin("rexvirtualjoystickplugin", 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);
        this.load.spritesheet('torch', 'assets/Torch Side_0000-sheet.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('FireBall', 'assets/FireBall.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('Ice', 'assets/Ice.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('title', 'assets/ui/TitleScreen0000-sheet.png', { frameWidth: 128, frameHeight: 64 });
        this.load.spritesheet('cyberjelly', 'assets/sprites/characters/Enemy CyberJelly.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('hunger', 'assets/sprites/characters/Enemy Hunger.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('slime', 'assets/sprites/characters/Enemy Slime.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('slimeBlue', 'assets/sprites/characters/Enemy Slime Blue.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('magister', 'assets/sprites/characters/Enemy Magister.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Health', 'assets/ui/HPBar.png', {frameWidth: 48, frameHeight: 48});
        this.load.spritesheet('XP', 'assets/ui/XPBar.png', {frameWidth: 48, frameHeight: 48});
        this.load.spritesheet('Mag1', 'assets/Mag1.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('Mag2', 'assets/Mag2.png', {frameWidth: 20, frameHeight: 48});
        this.load.spritesheet('Mag_Sword', 'assets/sprites/characters/Boss_Sword.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('Mag_Magic', 'assets/sprites/characters/Boss_Magic.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('Mag1_trail', 'assets/Mag1_trail.png', {frameWidth: 3, frameHeight: 3});
        this.load.spritesheet('Mag2_trail', 'assets/Ma2_trail.png', {frameWidth: 3, frameHeight: 3});
        //load Dash spritesheet
        this.load.spritesheet('dash', 'assets/ui/Dash.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('BossHP', 'assets/ui/BossHP.png', {frameWidth: 64, frameHeight: 64});
    }

    create() {
        //Add all sounds
        //this.dash_sound = this.sound.add('dash_sound');
        this.die_sound = this.sound.add('die_sound');
        this.drone_die = this.sound.add('drone_die');
        this.drone_move = this.sound.add('drone_move');
        this.girl_ouch = this.sound.add('girl_ouch');
       // this.inventory_sound = this.sound.add('inventory_sound');
        this.guy_ouch = this.sound.add('guy_ouch');
        this.slime_move = this.sound.add('slime_move');
        this.teleport_sound = this.sound.add('teleport_sound');
        this.BOSS_die = this.sound.add('BOSS_die');

        // title animation
        this.anims.create({key: 'title', frames: this.anims.generateFrameNumbers('title', { frames: [ 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15 ] }), frameRate: 8, repeat: -1 });

        // torch
        this.anims.create({key: 'torch_side', frames: this.anims.generateFrameNumbers('torch', { frames: [ 0,1,2,3,4,5,6,7,8,9,10,11,12,13 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({key: 'torch_front', frames: this.anims.generateFrameNumbers('torch', { frames: [ 14,15,16,17,28,29,30,21,22,23,24,25,26,27 ] }), frameRate: 8, repeat: -1 });

        //Enemy Drone animations
        this.anims.create({key: 'drone_idle', frames: this.anims.generateFrameNumbers('drone', { frames: [ 0,1,2,3,4,5,6 ] }), frameRate: 6, repeat: -1 });
        this.anims.create({key: 'drone_die', frames: this.anims.generateFrameNumbers('drone', { frames: [ 9,10,11,12,13,14,15,16,17 ] }), frameRate: 8 });
        this.anims.create({key: 'drone_shot', frames: this.anims.generateFrameNumbers('drone', { frames: [ 18,19,20,21,22 ] }), frameRate: 6, repeat: -1 });
        //Enemy Cyberjelly animatons
        this.anims.create({key: 'cyberjelly_idle', frames: this.anims.generateFrameNumbers('cyberjelly', { frames: [ 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17 ] }), frameRate: 6, repeat: -1 });
        this.anims.create({key: 'cyberjelly_die', frames: this.anims.generateFrameNumbers('cyberjelly', { frames: [ 50,51,52,53,54,55,56,57,58,59,60,61,62,63 ] }), frameRate: 8 });
        //Enemy Hunger animatons
        this.anims.create({key: 'hunger_attack', frames: this.anims.generateFrameNumbers('hunger', { frames: [ 0,1,2,3,4,5,6,7 ] }), frameRate: 6, repeat: -1 });
        this.anims.create({key: 'hunger_die', frames: this.anims.generateFrameNumbers('hunger', { frames: [ 9,10,11 ] }), frameRate: 6 });
        this.anims.create({key: 'hunger_idle', frames: this.anims.generateFrameNumbers('hunger', { frames: [ 18,19 ] }), frameRate: 6, repeat: -1 });
        this.anims.create({key: 'hunger_move', frames: this.anims.generateFrameNumbers('hunger', { frames: [ 27,28,29,30 ] }), frameRate: 6 });
        //Enemy Slime (Green) animatons
        this.anims.create({key: 'slime_idle', frames: this.anims.generateFrameNumbers('slime', { frames: [ 0,1,2,3,4,5,6,7,8 ] }), frameRate: 6, repeat: -1 });
        this.anims.create({key: 'slime_jump', frames: this.anims.generateFrameNumbers('slime', { frames: [ 11,12,13,14,15,16,17 ] }), frameRate: 6});
        this.anims.create({key: 'slime_attack', frames: this.anims.generateFrameNumbers('slime', { frames: [ 22,23,24,25,26,27,28,29,30,31,32 ] }), frameRate: 6});
        this.anims.create({key: 'slime_die', frames: this.anims.generateFrameNumbers('slime', { frames: [ 33,34,35,36,37,38,39,40,41 ] }), frameRate: 8 });
       //Enemy Slime Blue animatons
        this.anims.create({key: 'slimeBlue_attack', frames: this.anims.generateFrameNumbers('slimeBlue', { frames: [ 0,1,2,3,4,5,6,7,8,11 ] }), frameRate: 6});
        this.anims.create({key: 'slimeBlue_die', frames: this.anims.generateFrameNumbers('slimeBlue', { frames: [ 14,15,16,17,18,19,20,21,22,23,24 ] }), frameRate: 8});
        this.anims.create({key: 'slimeBlue_idle', frames: this.anims.generateFrameNumbers('slimeBlue', { frames: [ 28,29,30,31,32,33,34,35,36,37,38,39,40,41 ] }), frameRate: 6, repeat: -1 });
        this.anims.create({key: 'slimeBlue_jump', frames: this.anims.generateFrameNumbers('slimeBlue', { frames: [ 42,43,44,45,46,47,48,49,50,51,52,52,53,54,55 ] }), frameRate: 6});
        //Enemy Magister animatons
        this.anims.create({key: 'magister_castMagic', frames: this.anims.generateFrameNumbers('Mag_Magic', { frames: [ 1,2,3,4,5,6,7,8,11,12,13,14,15,16 ] }), frameRate: 16});
        this.anims.create({key: 'magister_MagicLoop', frames: this.anims.generateFrameNumbers('magister', { frames: [ 11,12,13] }), frameRate: 8, repeat: -1});
        this.anims.create({key: 'magister_castSword', frames: this.anims.generateFrameNumbers('Mag_Sword', { frames: [ 1,2,3,4,5,6,7,8,11,12,13,14,15,16 ] }), frameRate: 16});
        this.anims.create({key: 'magister_die', frames: this.anims.generateFrameNumbers('magister', { frames: [ 34,35,36,37,38,39,40,41,42,43,44 ] }), frameRate: 8});
        this.anims.create({key: 'magister_idle', frames: this.anims.generateFrameNumbers('magister', { frames: [ 51,52,53 ] }), frameRate: 3, repeat: -1 });
        this.anims.create({key: 'magister_teleport', frames: this.anims.generateFrameNumbers('magister', { frames: [ 68,69,70,71,72,73,74,75,76,77,78,79,80,81 ] }), frameRate: 16});
        this.anims.create({key: 'magister_TR', frames: this.anims.generateFrameNumbers('magister', { frames: [ 81,80,79,78,77,76,75,74,73,72,71,70,69,68 ] }), frameRate: 16});
        this.anims.create({key: 'magister_magic', frames: this.anims.generateFrameNumbers('Mag1', { frames: [ 0,1,2,3,4 ] }), frameRate: 8, repeat: -1});
        this.anims.create({key: 'magister_sword', frames: this.anims.generateFrameNumbers('Mag2', { frames: [ 0 ] }), frameRate: 1, repeat: -1});
        this.anims.create({key: 'Mag1_trail', frames: this.anims.generateFrameNumbers('Mag1_trail', { frames: [ 0,1] }), frameRate: 8, repeat: -1});
        this.anims.create({key: 'Mag2_trail', frames: this.anims.generateFrameNumbers('Mag2_trail', { frames: [ 0,1,2,3,4 ] }), frameRate: 8, repeat: -1});
        
        
        //Last 3 line above im not sure about in terms of after the frames

        // player animations Girl
        this.anims.create({ key: 'girl_fall', frames: this.anims.generateFrameNumbers('girl', { frames: [ 0,1,2,3 ] }), frameRate: 8});
        this.anims.create({ key: 'girl_idle_right', frames: this.anims.generateFrameNumbers('girl', { frames: [ 96,97,98,99,100,101,102,103,104,105,106,107 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'girl_idle_up', frames: this.anims.generateFrameNumbers('girl', { frames: [ 84,85,86,87,88,89,90,91 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'girl_idle_down', frames: this.anims.generateFrameNumbers('girl', { frames: [ 108,109,110,111,112,113,114,115,116 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'girl_walk_down', frames: this.anims.generateFrameNumbers('girl', { frames: [ 36,37,38,39,40,41 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'girl_walk_right', frames: this.anims.generateFrameNumbers('girl', { frames: [ 12,13,14,15 ] }), frameRate: 8, repeat: -1});
        this.anims.create({ key: 'girl_walk_up', frames: this.anims.generateFrameNumbers('girl', { frames: [ 24,25,26,27,28,29] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'girl_attack_down', frames: this.anims.generateFrameNumbers('girl', { frames: [ 60,61,62,63,64,65 ] }), frameRate: 16 });
        this.anims.create({ key: 'girl_attack_right', frames: this.anims.generateFrameNumbers('girl', { frames: [ 72,73,74,75,76] }), frameRate: 10 });
        this.anims.create({ key: 'girl_attack_up', frames: this.anims.generateFrameNumbers('girl', { frames: [ 48,49,50,51,52,53,54] }), frameRate: 16 });
        
        //player animations Guy
        this.anims.create({ key: 'guy_fall', frames: this.anims.generateFrameNumbers('guy', { frames: [ 107,108,109,110] }), frameRate: 8});
        this.anims.create({ key: 'guy_idle_right', frames: this.anims.generateFrameNumbers('guy', { frames: [ 12,13,14,15,16,17 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'guy_idle_up', frames: this.anims.generateFrameNumbers('guy', { frames: [ 24,25,26,27,28,29 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'guy_idle_down', frames: this.anims.generateFrameNumbers('guy', { frames: [ 0,1,2,3,4,5 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'guy_walk_down', frames: this.anims.generateFrameNumbers('guy', { frames: [ 36,37,38,39,40 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'guy_walk_right', frames: this.anims.generateFrameNumbers('guy', { frames: [ 60,61,62,63,64 ] }), frameRate: 8, repeat: -1});
        this.anims.create({ key: 'guy_walk_up', frames: this.anims.generateFrameNumbers('guy', { frames: [ 48,49,50,51,52] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'guy_attack_down', frames: this.anims.generateFrameNumbers('guy', { frames: [ 83,84,85,86,87,88,89,90,91,92,93,94 ] }), frameRate: 16 });
        this.anims.create({ key: 'guy_attack_right', frames: this.anims.generateFrameNumbers('guy', { frames: [ 73,74,75,76,77,78,79,80,81,82] }), frameRate: 10 });
        this.anims.create({ key: 'guy_attack_up', frames: this.anims.generateFrameNumbers('guy', { frames: [97,98,99,100,102,103,104,105,106] }), frameRate: 16 });

        //Fireball Animations
        this.anims.create({key: 'moveFire', frames: this.anims.generateFrameNumbers('FireBall', { frames: [ 0,1,2,3,4,5,6] }), frameRate: 8, repeat: -1 });

        //Iceball Animations
        this.anims.create({key: 'moveIce', frames: this.anims.generateFrameNumbers('Ice',{frames: [0,1,2,3,4,5]}), frameRate: 8, repeat: -1});

        //HP Bar  Animations
       
        this.anims.create({key: 'hpBar', frames: this.anims.generateFrameNumbers('Health',{frames: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39]}), frameRate: 8});
        
        //XP Bar Animations
        this.anims.create({key: 'XPBar', frames: this.anims.generateFrameNumbers('XP',{frames: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27]}), frameRate: 8});
        //Boss Hp
        this.anims.create({key: 'BossHP', frames: this.anims.generateFrameNumbers('BossHP',{frames: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58]}), frameRate: 8});
        // create players
        players.push(new Player());

        //Dash animations
        this.anims.create({key: 'dash', frames: this.anims.generateFrameNumbers('dash', { frames: [ 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30 ] }), frameRate: 18, duration: players[0].dashTimer});
        
        this.scene.launch('menu');
    }

}

class GameLevel extends Phaser.Scene {
    constructor() {
        super('gamelevel')
    }

    init (id) {
        if (levels[id] == undefined) levels[id] = {};
        if (levels[id].level == undefined) levels[id].level = "level" + level++;
        if (levels[id].doors == undefined) levels[id].doors = [];
        this.id = id;

        // create players if not all spawned in
        for (var i = players.length; i < numPlayers; i++) {
            players.push(new Player());
            players[i].skin = "girl";
        }
    }

    getNearestPlayer(x, y, viewDistance) {

        // get nearest player
        var nearestPlayer = undefined;
        var nearestDistance = viewDistance;
        players.forEach(player => {
            var distance = Phaser.Math.Distance.Between(x, y, player.sprite.x, player.sprite.y);
            if (distance < nearestDistance) {
                nearestPlayer = player;
                nearestDistance = distance;
            }
        });

        return nearestPlayer;
    }

    getTileProperties(x,y) {
        var tile = this.layer_tiles.getTileAtWorldXY(x, y, true);
        if (tile && tile.properties) {
            return tile.properties;
        }
        return {};
    }

    printMap() {
        // print tiles
        var tiles = []
        this.map.layers[this.layer_tiles.layerIndex].data.forEach(row => {
            row.forEach(tile => {
                tiles.push(tile.index)
            });
        });
        console.log(`Foreground: [${tiles.toString()}]`)

        var tiles_bg = []
        this.map.layers[this.layer_background.layerIndex].data.forEach(row => {
            row.forEach(tile => {
                var index = tile.index;
                if (index == -1) index = 0;
                tiles_bg.push(index)
            });
        });
        console.log(`Background: [${tiles_bg.toString()}]`)

        // print items
        //let properties = this.map.layers[this.layer_tiles.layerIndex].properties;
        //console.log(JSON.stringify(properties))
    }

    setEditMode(mode) {
        this.editMode = mode;

        this.layer_tilePicker.setAlpha(0);
        this.tilePicketBG.setVisible(false);
        if (uiContainer) uiContainer.setVisible(false);
        

        switch(mode) {
            case EditMode.NotEditing:
                this.placeItem = undefined;
                this.helpText.setText('EditMode: Not editing');
                this.marker.x = -100;
                this.marker.y = -100;
            
                this.helpText.setVisible(false);
                this.cameras.main.zoomTo(camMinZoom, 0);
                if (uiContainer) uiContainer.setVisible(true);
            break;
            case EditMode.Selecting:
                this.helpText.setText('EditMode: Pick Block');
                this.layer_tilePicker.setAlpha(1);
                this.tilePicketBG.setVisible(true);

                // show stuff
                this.helpText.setVisible(true);
                this.cameras.main.zoomTo(0.5, 0);
            break;
            case EditMode.PlaceBlock:
                this.helpText.setText('EditMode: Painting Tile');
            break;
            case EditMode.PlaceItem:
                this.helpText.setText('EditMode: Painting Item');
            break;
            case EditMode.DeleteItem:
                this.helpText.setText('EditMode: Deleting Item');
            break;

        }

    }

    spawnEnemy(x, y) {
        var types = ['slime', 'cyberjelly', 'hunger', 'drone'];
        var type = types[Math.floor(Math.random() * types.length)];

        switch (type) {
            case 'slime':
                this.enemies.add(new Slime(this, x, y));
            break;
            case 'cyberjelly':
                this.enemies.add(new CyberJelly(this, x, y));
            break;
            case 'hunger':
                this.enemies.add(new Hunger(this, x, y));
            break;
            case 'drone':
                this.enemies.add(new Drone(this, x, y));
            break;
        }
    }

    // returns a random location that is not solid
    getRandSpawnPoint() {
        while (true) {
            var x = Phaser.Math.Between(1, this.layer_tiles.width * 3);
            var y = Phaser.Math.Between(1, this.layer_tiles.height * 3);
            if (this.solidAt(x, y)) continue;
            y -= 32;
            return {x: x, y: y};
        }
    }

    spawnStuff() {
        let enemyCount = 10;
        let floorPropCount = 10;
        let wallPropCount = 10;

        // spawn enemies
        for (var i = 0; i < enemyCount; i++) {
            var {x, y} = this.getRandSpawnPoint();
            this.spawnEnemy(x, y);
        }

        // spawn props
        for (var i = 0; i < floorPropCount; i++) {
            var {x, y} = this.getRandSpawnPoint();
            
            // pick random item from RandItems
            var index = RandProps_Floor[Math.floor(Math.random() * RandProps_Floor.length)];

            // if chest, add physics
            if (RandProps_Chest.includes(index)) {
                var prop = this.physics.add.image(x, y, 'props',  index);
                this.physics.add.existing(prop);
                prop.setScale(4);
                prop.setOrigin(0.5, 0.5);
                prop.body.setSize(12, 12);
                prop.body.setOffset(10,20);
                prop.body.setImmovable(true);
                prop.body.onCollide = true;
                this.chests.add(prop);

                continue;
            }

            // non collision prop
            var prop = this.add.image(x, y, 'props', index);
            prop.setScale(2);
            prop.setOrigin(0.5, 0.5);
            if (!RandProps_DontRotate.includes(index))
                prop.rotation = Math.random() * Math.PI * 2;

            
            // if near wall prop
            if (RandProps_nearWall.includes(index)) {
                prop.setOrigin(0.5, 0);

                if (this.nearWalls == undefined || this.nearWalls.length == 0) continue;

                // get random location near wall
                var wall = this.nearWalls[Math.floor(Math.random() * this.nearWalls.length)];
                var x = wall.x * 32 * 3;
                var y = wall.y * 32 * 3;

                if (index == 7) {
                    prop.destroy();

                    if (wall.wall == "down" || wall.wall == "up") continue;

                    // spawn a torch
                    var torch = this.add.sprite(x, y, 'torch');
                    torch.setScale(3);
                    torch.anims.play('torch_side');

                    if (wall.wall == "left") {
                        torch.flipX = true;
                        torch.x -= 32;
                    } else if (wall.wall == "right") {
                        torch.x += 128;
                    }

                    continue;
                }

                if (wall.wall == "left") {
                    prop.rotation = Math.PI / 2;
                    x += 48;
                } else if (wall.wall == "right") {
                    prop.rotation = 90;
                    x+= 0;
                } else if (wall.wall == "up") {
                    prop.rotation = 45;
                    y -= 32;
                } else if (wall.wall == "down") {
                    prop.rotation = 135;
                    y +=75
                }

                prop.setPosition(x, y);
            }

        }

        // spawn wall decor
        
        for (var i = 0; i < wallPropCount; i++) {
            if (this.decorWalls == undefined || this.decorWalls.length == 0) return;
            var {x, y} = this.decorWalls[Math.floor(Math.random() * this.decorWalls.length)];
            var index = RandProps_Wall[Math.floor(Math.random() * RandProps_Wall.length)];

            if (index == 7) {
                // spawn a torch
                var torch = this.add.sprite(x * 32 * 3, (y * 32 * 3) + 96, 'torch');
                torch.setScale(3);
                torch.anims.play('torch_front');
                continue;
            }

            var prop = this.add.image(x * 32 * 3, y * 32 * 3, 'props', index);
            prop.setScale(5);
            prop.setOrigin(0, 0);

            // remove value so we don't pick it again
            this.decorWalls = this.decorWalls.filter(wall => wall.x != x || wall.y != y);
        }

        

    }

    goToLevel(id) {
        // unload current level
        this.enemies = undefined;

        // go new level
        this.scene.start('gamelevel', id);
    }

    solidAt(x, y) {
        var tile = this.layer_tiles.getTileAtWorldXY(x, y, true);
        if (tile && (tile.collideUp || tile.collideDown || tile.collideLeft || tile.collideRight)) {
            return true;
        }
        if (tile && Tile_BorderWall.includes(tile.index)) {
            return true;
        }
        return false;
    }

    handleCollisionProjectileWall(projectile, tile) {
        projectile.destroy();
    }
    
    create() {
        window.inst = this;

        this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        const tileset = this.map.addTilesetImage('tiles', 'tiles', 32,32);

        // background layer
        this.layer_background = this.map.createLayer(`${levels[this.id].level}_bg`, tileset);
        this.layer_background.setScale(3);

        this.layer_tiles = this.map.createLayer(levels[this.id].level, tileset);
        this.map.setCollision([1,2,3,5,14,15,16,18,20,21,24,25,33,34,37,38,79,80,81,92,93,94,96,98,99,101,109,111,112,114]);
        this.layer_tiles.setScale(3);

        // enable collisions on walls
        this.layer_tiles.forEachTile(tile => {
            var tile_bg = this.layer_background.getTileAt(tile.x, tile.y);
            if (tile_bg.index == 4)
                tile.setCollision(true);

            // fix north doors
            if (tile.index == 14 || tile.index == 92 || tile.index == 93) {
                // set tile below as door
                var tile_below = this.layer_tiles.getTileAt(tile.x, tile.y + 1);
                tile_below.properties.door = true;
                tile.properties.door = false;
            }

        });
        
        //JOYSTICK STUFF------------------------------------------------------------------------------------
        //CIRCLES FOR JOYSTICK-------------------------
        //----------------------------------------------

        // let cir1 = this.add.circle(0, 0, 50, 0x7E38B7);
        // cir1.setAlpha(0.4);
        // let cir2 = this.add.circle(0, 0, 20, 0x541675);
        // cir2.setAlpha(0.3);
        
        // this.joyStick = this.plugins.get("rexvirtualjoystickplugin").add(this, {
        //     x: 0,
        //     y: 0,
        //     radius: 100,
        //     base: cir1,
        //     thumb: cir2,
        //     dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
        //     forceMin: 16,
        //     enable: true,
        //     fixed: false,
        // });
       
        // var visible = this.joyStick.visible;
        // this.input.on('pointerdown', () => {
        //     this.joyStick.setVisible(visible);
        //     this.joyStick.setPosition(this.input.activePointer.worldX, this.input.activePointer.worldY);
        //     //this.joyStick.fixed = true;
        //     //this.joyStick.setScrollFactor(0.8);

        // });
        // this.input.on('pointerup', () => {
        //     this.joyStick.setVisible(false);
        //     this.joyStick.fixed = false;
        //     //this.joyStick.setScrollFactor(0);

        // });

        //END OF JOYSTICK --------------------------------------------------------------------------------------

        // store location of door players are coming from
        this.tp_door = {};

        // find walls to put decorations on
        /*
        this.decorWalls = [];
        this.nearWalls = [];
        this.layer_tiles.forEachTile(tile => {
            var properties = tile.properties;
            var solid = this.solidAt(tile.x, tile.y);
            var x = tile.x;
            var y = tile.y;

            let left = this.solidAt(x - 1, y);
            let right = this.solidAt(x + 1, y);
            let down = this.solidAt(x, y + 1);
            let up = this.solidAt(x, y - 1);
            
            if (solid) {
                if (left && right && down) {
                    this.decorWalls.push({x: x, y: y});
                    //tile.index = 57;
                }
            } else {
                //if (left || right || down || up) tile.index = 57;

                if (left) { this.nearWalls.push({x: x, y: y, wall: "left"}); return; }
                if (right) { this.nearWalls.push({x: x, y: y, wall: "right"}); return; }
                if (down) { this.nearWalls.push({x: x, y: y, wall: "down"}); return; }
                if (up) { this.nearWalls.push({x: x, y: y, wall: "up"}); return; }
            }
        });
        */

        // set tile properties
        this.layer_tiles.forEachTile(tile => {
            var properties = tile.properties;

            // check door connections
            if (properties && properties.door) {
                //console.log(tile.x, tile.y);
                var wall = "";
                if (tile.index == 53 || tile.index == 66) wall = "right";
                else if (tile.index == 54 || tile.index == 67) wall = "left";
                else if (tile.index == 42 || tile.index == 55) wall = "down";
                else wall = "up";
                
                let door = {x: tile.x, y: tile.y, wall: wall};
                levels[this.id].doors.push(door);
                //console.log("Setup door ", door);
            }

        });

        // create door connection / teleport player to proper door
        if (levels[this.id].from_wall) {

            var find_door = "";
            if (levels[this.id].from_wall == "left") find_door = "right";
            else if (levels[this.id].from_wall == "right") find_door = "left";
            else if (levels[this.id].from_wall == "up") find_door = "down";
            else if (levels[this.id].from_wall == "down") find_door = "up";

            //console.log("Teleporting player to door", find_door)

            // find previous connection
            for (var door in levels[this.id].doors) {
                var door = levels[this.id].doors[door];

                if (door.dest_id == levels[this.id].from_id) {
                    this.tp_door = {x: (door.x * 96) + 32, y: door.y * 96 }

                    // adjust north door TP location
                    if (find_door == 'up') this.tp_door.y += 96;
                    break;
                }
            }

            // make new connection
            if (this.tp_door.x == undefined) {
                //console.log("this.tp_door.x == undefined");

                for (var door in levels[this.id].doors) {
                    var door = levels[this.id].doors[door];

                    //console.log("Searching for door to TP to: ",door);

                    if (door.wall == find_door) {

                        // if door already has a diffrent connection, skip it
                        if (door.dest_id != undefined && door.dest_id != levels[this.id].from_id) {
                            continue;
                        }

                        door.dest_id = levels[this.id].from_id;
                        this.tp_door = {x: door.x * 96 + 32, y: door.y * 96 }

                        // adjust north door TP location
                        if (find_door == 'up') this.tp_door.y += 96;

                        //console.log("Made new door connection", this.tp_door);
                        break;
                    }
                }
            }

        }

        // if no door connection, make one
        if (this.tp_door.x == undefined) {
            var door = levels[this.id].doors[0];
            door.dest_id = levels[this.id].from_id;
            this.tp_door = {x: door.x * 96 + 32, y: door.y * 96 }
            if (door.wall == 'up') this.tp_door.y += 120;
        }

        this.boss = this.add.group({ classType: Boss, runChildUpdate: true });
        this.enemies = this.add.group({ classType: Enemy, runChildUpdate: true });
        this.projectile_player = this.add.group(); // projectiles launched by players
        this.physics.add.collider(this.projectile_player, this.boss);
        this.physics.add.collider(this.projectile_player, this.enemies);
        this.physics.add.collider(this.enemies, this.layer_tiles);
        this.physics.add.collider(this.projectile_player, this.layer_tiles, this.handleCollisionProjectileWall, null, this);

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        this.projectile_enemy = this.add.group(); // projectiles launched by players
        //this.physics.add.collider(this.projectile_enemy, this.sprite);

        // make group for items
        this.items = this.add.group();
        this.chests = this.add.group();

        // load items into data
        if (levels[this.id].items == undefined) {
            let items = this.map.layers[this.layer_tiles.layerIndex].properties.items;
            if (!items) items = {};
            levels[this.id].items = items;

            // spawn enemies and props
            this.spawnStuff();
        }

        this.cameras.main.roundPixels = true;
        this.cameras.main.setBounds(0,0,this.layer_tiles.width * 3, this.layer_tiles.height * 3);
        this.cameras.main.zoomTo(camMinZoom, 0);
        this.cameras.main.fadeIn(1000);

        // wall colliders
        const worldBounds = this.cameras.main.getBounds();
        this.wallLeft = this.physics.add.staticSprite(0, worldBounds.height / 2);
        this.wallLeft.setScale(1, worldBounds.height);
        this.wallLeft.refreshBody();

        this.wallRight = this.physics.add.staticSprite(worldBounds.width, worldBounds.height / 2);
        this.wallRight.setScale(1, worldBounds.height);
        this.wallRight.refreshBody();

        this.wallBottom = this.physics.add.staticSprite(worldBounds.width / 2, worldBounds.height);
        this.wallBottom.setScale(worldBounds.width, 1);
        this.wallBottom.refreshBody();

         // task progress bar
        this.circularProgress = this.add.rexCircularProgress({
            x: 0, y: 0,
            radius: 40,
            //trackColor: 0xe8e8e8,
            barColor: 0x23751a,
            //centerColor: 0x4e342e,
            anticlockwise: false,
            value: 0,
        });
        this.circularProgress.setOrigin(0.5, 0.5);
        this.circularProgress.visible = false;

        // create players in new scene
        for (var player of players) {
            player.newScene(this);
        }
        this.cameras.main.startFollow(players[0].sprite);

        // #region map editor
        this.editMode = EditMode.NotEditing;
        this.tile_painting = 1;
        this.mapDisplay = this.make.tilemap({ key: 'map' });
        this.layer_tilePicker = this.mapDisplay.createLayer('display', tileset, 0, 0);
        this.layer_tilePicker.setAlpha(0);
        this.layer_tilePicker.setScale(3);

        // add a white box behind the tile picker
        this.tilePicketBG = this.add.graphics().fillStyle(0xffffff, 1).setAlpha(0.5).fillRect(0, 0, this.layer_tilePicker.width * this.layer_tilePicker.scaleX * 1.1, this.layer_tilePicker.height * this.layer_tilePicker.scaleY * 1.1)
        
        this.children.bringToTop(this.layer_tilePicker);

        this.marker = this.add.graphics();
        this.marker.lineStyle(3, 0xffffff, 1);
        this.marker.strokeRect(0, 0, this.map.tileWidth * 3, this.map.tileHeight * 3);
        this.marker.x = -100;
        this.marker.y = -100;
        this.physics.add.existing(this.marker);
        this.marker.body.setSize(32 * 3, 32 * 3);

        this.helpText = this.add.text(16, 900, 'EditMode: Not editing', { font: '50px Arial', fill: '#ffffff' });
        this.helpText.setAlpha(0.3);

        this.button_edit = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.button_editBG = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.setEditMode(EditMode.NotEditing);
        
        //mouse click event
        this.input.on('pointerdown', () => {
            var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
            var x = this.map.worldToTileX(worldPoint.x);
            var y = this.map.worldToTileY(worldPoint.y);
            
        
            switch(this.editMode) {
                case EditMode.NotEditing:
                break;
                case EditMode.Selecting:
                    var tile = this.mapDisplay.getTileAt(x, y);
                    if (tile) {
                        this.tile_painting = tile.index;
                        this.setEditMode(EditMode.PlaceBlock);
                    }
                break;
                case EditMode.PlaceBlock:
                    var tile = this.map.getTileAt(x, y);
                    if (!tile) break;
                    
                    tile.index = this.tile_painting;
                    
                    // set default properties
                    var properties = this.map.tilesets[0].tileProperties[tile.index];
                    tile.properties = properties;
                break;
                case EditMode.PlaceBlockBG:
                    // set tile on this.layer_background

                    this.layer_background.forEachTile(tile => {
                        
                        if (tile.x == x && tile.y == y) {
                            tile.index = this.tile_painting;
                            return;
                        }
                        
                    });

                break;
                case EditMode.PlaceItem:
                    if (itemsGrid) {
                        x = this.map.tileToWorldX(x) + this.map.tileWidth / 2;
                        y = this.map.tileToWorldY(y) + this.map.tileHeight / 2;
                    } else {
                        x = worldPoint.x;
                        y = worldPoint.y;
                    }

                    var item = this.physics.add.image(x, y, 'items',  this.placeItem);
                    item.setScale(itemScale);
                    item.setOrigin(0.5, 0.5);
                    this.items.add(item);

                    this.map.layers[this.layer_tiles.layerIndex].properties.items.push({x: x, y: y, index: this.placeItem});
                break;
                case EditMode.DeleteItem:

                    this.items.getChildren().forEach(function(item) {
                        if (item.getBounds().contains(this.input.activePointer.worldX, this.input.activePointer.worldY)) {
                            //console.log("Item clicked:", item);
                            item.destroy();

                            // remove item from properties
                            for (var i = 0; i < this.map.layers[this.layer_tiles.layerIndex].properties.items.length; i++) {
                                if (this.map.layers[this.layer_tiles.layerIndex].properties.items[i].x == item.x && this.map.layers[this.layer_tiles.layerIndex].properties.items[i].y == item.y) {
                                    this.map.layers[this.layer_tiles.layerIndex].properties.items.splice(i, 1);
                                    break;
                                }
                            }

                        }
                    }, this);
                    
                break;

            }

        });
        // #endregion map editor

        if (level == 12) {
            //bossIsHere = true;
            //this.boss.add(new Boss(this, centerX, centerY, 500));
        }

        // clear previous door data
        delete levels[this.id].from_id;
        delete levels[this.id].from_wall;
    }

    update(time, delta) {
        // camera variables
        var playersDoor = 0; // number of players at door this frame
       // this.uiGroup.setPosition(players[0].x, players[0].y);
        for (var player of players) {
            player.update(time, delta);
            
            // #region door

            var properties = this.getTileProperties(player.sprite.x, player.sprite.y);
            if (properties.door) {
                playersDoor++;

                // if all players are standing on a door
                if (playersDoor == players.length) {

                    // get max distance between players
                    // to make sure their all on the same area of buttons
                    // can probably change this if we assign doors to room IDs or something
                    var maxDist = 0;
                    for (var p1 of players) {
                        for (var p2 of players) {
                            maxDist = Math.max(maxDist, Phaser.Math.Distance.Between(p1.sprite.x, p1.sprite.y, p2.sprite.x, p2.sprite.y));
                        }
                    }
                    
                    // if all players are on the same door, and progress hasn't started yet
                    if (maxDist < 60 && !(this.progress && this.progress.isPlaying())) {

                        // if all enemies are dead
                        if (this.enemies != null && this.enemies.getChildren().length == 0) {

                            this.children.bringToTop(this.circularProgress);
                            this.circularProgress.setPosition(player.sprite.x, player.sprite.y);
                            this.circularProgress.visible = true;
                            this.circularProgress.barColor = 0x23751a;
                            this.progress = this.tweens.add({
                                targets: this.circularProgress,
                                value: 1,
                                duration: 1000,
                                ease: 'Linear ',
                                callbackScope: this,
                                onComplete: function () {
                                    this.circularProgress.visible = false;
                                    this.circularProgress.value = 0;
                                    var foundDoor = false;

                                    // find nearby door
                                    levels[this.id].doors.forEach(door => {
                                        var dist = Phaser.Math.Distance.Between(player.sprite.x/96, player.sprite.y/96, door.x, door.y);
                                        //console.log("Door dist:", dist)
                                        if (dist < 4) {

                                            // if door doesn't have a destination set, generate one
                                            if (door.dest_id == undefined) door.dest_id = Phaser.Utils.String.UUID().substring(0, 10);

                                            // setup new level
                                            if (levels[door.dest_id] == undefined) levels[door.dest_id] = {};
                                            levels[door.dest_id].from_wall = door.wall;
                                            levels[door.dest_id].from_id = this.id;

                                            this.goToLevel(door.dest_id);
                                            foundDoor = true;
                                        }
                                    });

                                    if (!foundDoor)
                                        console.log("Failed to find door... (not good)");
                                }
                            });

                        } 
                        
                        // all enemies not dead, door locked
                        else {

                            this.children.bringToTop(this.circularProgress);
                            this.circularProgress.setPosition(player.sprite.x, player.sprite.y);
                            this.circularProgress.visible = true;
                            this.circularProgress.barColor = 0xa83240;
                            this.progress = this.tweens.add({
                                targets: this.circularProgress,
                                value: 0.75,
                                duration: 750,
                                ease: 'Linear ',
                                callbackScope: this,
                                onComplete: function () {
                                    this.circularProgress.visible = false;
                                    this.circularProgress.value = 0;
                                }
                            });

                        }


                        

                    }

                }

                

            } else {

                // stop progress bar if player is not on task tile
                if (this.progress && this.progress.isPlaying()) {
                    this.progress.pause();
                    this.circularProgress.value = 0;
                    this.circularProgress.visible = false;
                }
                
            }

            // #endregion door

        }

        // #region tile editor
        if (Phaser.Input.Keyboard.JustDown(this.button_edit)) {

            if (this.editMode == EditMode.NotEditing) {
                this.setEditMode(EditMode.Selecting);
            } else {
                this.setEditMode(EditMode.NotEditing);
            }
            
        }

        if (Phaser.Input.Keyboard.JustDown(this.button_editBG)) {
            
            // if edit mode
            if (this.editMode == EditMode.PlaceBlock) {
                this.editMode = EditMode.PlaceBlockBG;
                this.helpText.setText("EditMode: PlaceBlockBG (Background)");
            }

            else if (this.editMode == EditMode.PlaceBlockBG) {
                this.editMode = EditMode.PlaceBlock;
                this.helpText.setText("EditMode: PlaceBlock");
            }

        }

        //block selector
        if (this.editMode != EditMode.NotEditing) {
            var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
            var pointerTileX = this.map.worldToTileX(worldPoint.x);
            var pointerTileY = this.map.worldToTileY(worldPoint.y);
            this.marker.x = this.map.tileToWorldX(pointerTileX);
            this.marker.y = this.map.tileToWorldY(pointerTileY);
            
            
        }

        //#endregion tile editor
    }
}
class UI extends Phaser.Scene {
    
    constructor(){
        super('ui');
    }
    
    create() {
        // if(players[0].stunned == true){
        //     hpBar.anims.nextFrame();
        //     initalHP = players[0].hp;
        // }
        window.UIscene = this;
        
        if(bossIsHere){
            var cenX = this.cameras.main.centerX;
            var cenY = window.innerHeight * 0.85;
            this.bossHPBar = this.add.sprite(cenX, cenY);
            this.bossHPBar.setScale(10);
            this.bossHPBar.play('BossHP', true);
            this.bossHPBar.stop();
        }
        
        this.inventory_sound = this.sound.add('inventory_sound');
        uiContainer = this.add.container(0, 0);
        uiContainer.setVisible(true);
        this.icon = this.add.image(42, 170, 'inv_icon');
        this.hpBar = this.add.sprite(250, 0);
        this.XPBAR = this.add.sprite(250, 40);
        this.Dash = this.add.sprite(120, 170);
        this.XPBAR.setScale(10);
        this.hpBar.setScale(10);
        this.Dash.setScale(3);
        this.icon.setScale(8);
        this.icon.setInteractive();
        this.XPBAR.play('XPBar', true);
        this.XPBAR.stop();
        this.hpBar.play('hpBar', true);
        this.hpBar.stop();
        this.Dash.play('dash', true);
        this.Dash.stop();
        this.Dash.setFrame(30);
        uiContainer.add(this.hpBar);
        uiContainer.add(this.XPBAR);
        uiContainer.add(this.Dash);
        uiContainer.add(this.icon);
    }
    update() {
        //on pointerdown icon is clicked
        this.icon.on('pointerdown', () => {
                this.game.renderer.snapshot((image) => {
                    this.inventory_sound.play();
                    this.scene.launch('inventory', { screenshot: image, player: players[0] });
                    this.scene.pause();
                });
        });
        if(players[0].exp >27){
            players[0].exp = 0;
            players[0].level += 1;

        }
        
        //Player health bar
        var frameIndex = 39 - Math.round(players[0].health/ (players[0].maxHealth * players[0].buffs.healthBoost) * 38);
        if(frameIndex > 39) frameIndex = 39;
        this.hpBar.setFrame(frameIndex);
        this.XPBAR.setFrame(players[0].exp);
        if(players[0].dodging == true){
            this.Dash.play('dash', true);  
        }


    }    
}

class Open extends Phaser.Scene {
    constructor() {
        super('open');
    }
    create() {
        this.made = this.add.image(innerWidth * .5 , innerHeight * .5, 'madeWith');
        this.made.setAlpha(0);
        this.softW = this.add.image(innerWidth * .5 , innerHeight * .5, 'addSoftware');
        this.softW.setAlpha(0).setScale(.85);
        this.logo = this.add.image(innerWidth * .5 , innerHeight * .5, 'groupLogo');
        this.logo.setAlpha(0).setScale(.75);

        this.tweens.add({
            targets: this.made,
            alpha: 1,
            duration: 500,
            onComplete: () => {
                // Create a tween to fade out the image after fading in
                this.tweens.add({
                    targets: this.made,
                    alpha: 0,
                    delay: 2000,
                    duration: 500,
                    onComplete: () => {
                        // Create a tween to fade out the image after fading in
                        this.tweens.add({
                            targets: this.softW,
                            alpha: 1,
                            duration: 500,
                            onComplete: () => {
                                // Create a tween to fade out the image after fading in
                                this.tweens.add({
                                    targets: this.softW,
                                    alpha: 0,
                                    delay: 2000,
                                    duration: 500,
                                    onComplete: () => {
                                        // Create a tween to fade out the image after fading in
                                        this.tweens.add({
                                            targets: this.logo,
                                            alpha: 1,
                                            duration: 500,
                                            
                                            onComplete: () => {
                                                // Create a tween to fade out the image after fading in
                                                this.tweens.add({
                                                    targets: this.logo,
                                                    alpha: 0,
                                                    duration: 500,
                                                    delay: 2000,
                                                    onComplete: () => {
                                                        this.scene.start('menu');
                                                    },
                                                })
                                            },
                                        })

                                    },
                                })
                            },
                        })
                    }
                })
            }
        })
    }
}

class Lore extends Phaser.Scene {
    constructor() {
        super('lore');
    }
    create() {
        this.lore1 = this.add.image(innerWidth * .5 , innerHeight * .5, 'lore1');
        this.lore1.setAlpha(0).setScale();
        this.lore2 = this.add.image(innerWidth * .5 , innerHeight * .5, 'lore2');
        this.lore2.setAlpha(0).setScale();
        this.lore3 = this.add.image(innerWidth * .5 , innerHeight * .5, 'lore3');
        this.lore3.setAlpha(0).setScale();

        this.tweens.add({
            targets: this.lore1,
            alpha: 1,
            duration: 500,
            onclick: () => {
                // Create a tween to fade out the image after fading in
                this.tweens.add({
                    targets: this.lore1,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        // Create a tween to fade out the image after fading in
                        this.tweens.add({
                            targets: this.lore2,
                            alpha: 1,
                            duration: 500,
                            onclick: () => {
                                // Create a tween to fade out the image after fading in
                                this.tweens.add({
                                    targets: this.lore2,
                                    alpha: 0,
                                    duration: 500,
                                    onComplete: () => {
                                        // Create a tween to fade out the image after fading in
                                        this.tweens.add({
                                            targets: this.lore3,
                                            alpha: 1,
                                            duration: 500,
                                            
                                            onclick: () => {
                                                // Create a tween to fade out the image after fading in
                                                this.tweens.add({
                                                    targets: this.lore3,
                                                    alpha: 0,
                                                    duration: 500,
                                                    onComplete: () => {
                                                        this.scene.launch('gamelevel').launch('ui');
                                                        this.scene.remove('lore');
                                                    },
                                                })
                                            },
                                        })

                                    },
                                })
                            },
                        })
                    }
                })
            }
        })
    }
}

class Menu extends Phaser.Scene {
    constructor() {
        super('menu');
    }

    goToPage(page) {
        this.page_home.setVisible(false);
        this.page_start.setVisible(false);
        this.page_settings.setVisible(false);
        this.page_credits.setVisible(false);

        switch(page) {
            case "home":
                this.page_home.setVisible(true);
            break;
            case "start":
                this.page_start.setVisible(true);
            break;
            case "settings":
                this.page_settings.setVisible(true);
            break;
            case "credits":
                this.page_credits.setVisible(true);
            break;
        }

    }

    placeText(group, x, y, fontSize, msg, clickCallback, loadCallback) {
        let scale = Math.min(window.innerWidth, window.innerHeight) * 0.004;
        x *= scale;
        y *= scale;
        fontSize *= scale;
        let shadowOffset = 4;

        // shadow
        let shadow = this.add.text(window.innerWidth / 2 + shadowOffset + x, window.innerHeight / 2 + shadowOffset + y, msg, { fontFamily: 'minecraft_font', fontSize: fontSize, fill: '#ffffff' });
        shadow.setOrigin(0.5, 0.5);
        shadow.alpha = 0.4;

        // text
        let text = this.add.text(window.innerWidth / 2 + x, window.innerHeight / 2 + y, msg, { fontFamily: 'minecraft_font', fontSize: fontSize, fill: '#000000' });
        text.setOrigin(0.5, 0.5);
        text.setInteractive();

        if (clickCallback != null) {
            text.on('pointerover', () => {
                //text.setColor('#884a33');
                text.setScale(1.1);
                shadow.setScale(1.1);
            });
            text.on('pointerout', () => {
                //text.setColor('#000000');
                text.setScale(1);
                shadow.setScale(1);
            });

            text.on('pointerdown', () => {
                clickCallback(text, shadow);
            });
        }
        
        group.add(text);
        group.add(shadow);
    }

    create() {
        window.menuInst = this;

        let scale = Math.min(window.innerWidth, window.innerHeight) * 0.004;

        // background
        this.title = this.add.sprite(0, 0, 'title');
        this.title.setOrigin(0, 0);
        this.title.anims.play('title');
        this.title.displayWidth = window.innerWidth;
        this.title.displayHeight = window.innerHeight;
        this.title.x = (window.innerWidth - this.title.displayWidth) / 2;
        this.title.y = (window.innerHeight - this.title.displayHeight) / 2;

        //add TitleText
        var TitleT = this.add.image(window.innerWidth / 2, scale * 60, 'TitleText').setScale(scale / 5.5);
        TitleT.setOrigin(0.5, 0.5);

        // settings / credits book
        var book = this.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'inventory_empty');
        book.setOrigin(0.5, 0.5);
        book.setScale(scale);

        // groups
        this.page_home = this.add.group();
        this.page_start = this.add.group();
        this.page_settings = this.add.group();
        this.page_credits = this.add.group();

        // home page
        this.placeText(this.page_home, 0, -40, 35, 'Start', () => this.goToPage("start"));
        this.placeText(this.page_home, 0, 0, 35, 'Settings', () => this.goToPage("settings"));
        this.placeText(this.page_home, 0, 40, 35, 'Credits', () => this.goToPage("credits"));
        this.page_home.add(TitleT);

        // credits page
        this.placeText(this.page_credits, 0, -70, 19, 'Credits', null);
        this.page_credits.add(book);
        this.placeText(this.page_credits, 0, 10, 19, 'Nicolas Bellomo - Lead Artist & Composer\n\nOliver Mason - SFX & Additional Art\n\nMarcus Olivas - Lead Programer\n\nAbner Salazar - Programer', null);
        this.placeText(this.page_credits, 110, 75, 20, 'back', () => this.goToPage("home"));

        // start page
        this.placeText(this.page_start, 0, -40, 35, '1 Player', () => {
            numPlayers = 1;
            let id = Phaser.Utils.String.UUID().substring(0, 10);
            this.scene.start('lore');
            this.scene.remove('menu');
        });
        this.placeText(this.page_start, 0, 0, 35, '2 players', () => {
            numPlayers = 2;
            let id = Phaser.Utils.String.UUID().substring(0, 10);
            this.scene.start('lore');
            this.scene.remove('menu');
        });
        this.placeText(this.page_start, 0, 40, 35, 'back', () => this.goToPage("home"));

        // settings page
        this.page_settings.add(book);
        this.placeText(this.page_settings, 0, -70, 19, 'Settings', null);
        this.placeText(this.page_settings, 0, -20, 19, 'Fullscreen: off', (text, shadow) => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
                text.setText("Fullscreen: off");
                shadow.setText("Fullscreen: off");
            } else {
                this.scale.startFullscreen();
                text.setText("Fullscreen: on");
                shadow.setText("Fullscreen: on");
            }
        });

        this.placeText(this.page_settings, 0, 0, 19, 'Music: on', (text, shadow) => {
            if (playMusic) {
                playMusic = false;
                text.setText("Music: on");
                shadow.setText("Music: on");
            } else {
                playMusic = true;
                text.setText("Music: off");
                shadow.setText("Music: off");
            }
        });

        this.placeText(this.page_settings, 0, 20, 19, 'Other sounds: on', (text, shadow) => {
            if (this.sound.mute) {
                this.sound.mute = false;
                text.setText("Other sounds: on");
                shadow.setText("Other sounds: on");
            } else {
                this.sound.mute = true;
                text.setText("Other sounds: off");
                shadow.setText("Other sounds: off");
            }
        });
        this.placeText(this.page_settings, 110, 75, 20, 'back', () => this.goToPage("home"));

        this.goToPage("home");
    }

}

window.addEventListener('resize', function () {
    gameWidth = window.innerWidth;
    gameHeight = window.innerHeight;
    //inst.game.resize(gameWidth, gameHeight);
});
var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    pixelArt: true,
    scene: [ SetupLevel, Open, Lore, GameLevel, Inventory, Settings, UI, Menu],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
};

new Phaser.Game(config);
