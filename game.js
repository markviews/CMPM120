// global settings
const minSpeed = .5;            // min value a player's speed can get set to if they have multiple slowness effects
const freezeMelee = true;       // freeze player movement while using melee attacks
const freezeProjectile = false; // freeze player movement while using projectile attacks
const camMinZoom = 1.5;         // smallest the camera will zoom
const camPadding = 80;          // area between player and edge of screen
const itemScale = 2.5;          // scale of items
const itemsGrid = true;         // items snap to grid when placed
let uiContainer;

// list of random levels to choose from
const RandLevels = ["level1"];
const RandItems = [
    0, 1, 2, 3, 4, 5, 6, 7,
    8, 9,10,11,12,13,14,15,
    16,17,18,19,20,21,22,23,
    24,25,26,27,28,29,30,31,
    32,33,34,35,36,37,38,39,
    40,41
];
const RandProps_Wall = [
    20, 21, 22, 23, 26, 27, 28, 29,
    42, 43, 55, 45, 46, 47,
    60, 61, 62, 63, 64, 65, 66, 67,
    70, 71, 72, 73, 74, 75
];
const RandProps_Floor = [
    10, 11, 12, 13, 14, 15, 16,
    24, 25, // NEAR walls
    30, 31, 32, 33, 34, 35, 36, 37, 38,
    40, 41, 48, 49,
    50, 51, 52, 53, 54, 56, 57, 58, 59,
    65, 66, 67,
];
const RandProps_nearWall = [ 24, 25 ];
const RandProps_DontRotate = [ 10, 11, 12, 13, 14, 15, 16, 50, 51 ]; // chests, and mushrooms
const RandProps_Chest = [ 10, 11, 12, 13, 14, 15, 16 ];

// global variables
var levels = {};
var players = [];
var playMusic = true;

const EditMode = { NotEditing: 0, Selecting: 1, PlaceBlock: 2, PlaceItem: 3, DeleteItem: 4 }

class SetupLevel extends Phaser.Scene {

    preload() {
        //load sounds from /assets/sounds
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


        this.load.tilemapTiledJSON('map', 'assets/tile_properties.json');
        this.load.image('tiles', 'assets/Level Design Blocks.png');
        this.load.spritesheet('girl',  'assets/sprites/characters/Girl.png', {frameWidth: 48, frameHeight: 48});
        this.load.spritesheet('guy', 'assets/sprites/characters/Guy.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('drone', 'assets/sprites/characters/Enemy Drone.png', { frameWidth: 32, frameHeight: 32 });
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
        this.load.spritesheet('items', 'assets/Items.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('props', 'assets/Level_Design_-_Props.png', { frameWidth: 32, frameHeight: 32 });
        this.load.plugin('rexcircularprogressplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcircularprogressplugin.min.js', true);
        this.load.plugin("rexvirtualjoystickplugin", 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);
        this.load.spritesheet('FireBall', 'assets/FireBall.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('Ice', 'assets/Ice.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('cyberjelly', 'assets/sprites/characters/Enemy CyberJelly.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('hunger', 'assets/sprites/characters/Enemy Hunger.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('slime', 'assets/sprites/characters/Enemy Slime.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('slimeBlue', 'assets/sprites/characters/Enemy Slime Blue.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('magister', 'assets/sprites/characters/Enemy Magister.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('Health', 'assets/ui/HPBar.png', {frameWidth: 48, frameHeight: 48});
        this.load.spritesheet('XP', 'assets/ui/XPBar.png', {frameWidth: 48, frameHeight: 48});
        //load Dash spritesheet
        this.load.spritesheet('dash', 'assets/ui/Dash.png', { frameWidth: 32, frameHeight: 32 });
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
        this.anims.create({key: 'magister_castMagic', frames: this.anims.generateFrameNumbers('magister', { frames: [ 0,1,2,3,4,5,6,7,8,11,12,13,14,15 ] }), frameRate: 6});
        this.anims.create({key: 'magister_castSword', frames: this.anims.generateFrameNumbers('magister', { frames: [ 17,18,19,20,21,22,23,24,25,26,27,28,29,30,31 ] }), frameRate: 6});
        this.anims.create({key: 'magister_die', frames: this.anims.generateFrameNumbers('magister', { frames: [ 34,35,36,37,38,39,40,41,42,43,44 ] }), frameRate: 8});
        this.anims.create({key: 'magister_idle', frames: this.anims.generateFrameNumbers('magister', { frames: [ 51,52,53 ] }), frameRate: 3, repeat: -1 });
        this.anims.create({key: 'magister_teleport', frames: this.anims.generateFrameNumbers('magister', { frames: [ 68,69,70,71,72,73,74,75,76,77,78,79,80,81 ] }), frameRate: 6});
        this.anims.create({key: 'magister_magic', frames: this.anims.generateFrameNumbers('magister', { frames: [ 85,86,87,88,89 ] }), frameRate: 6});
        this.anims.create({key: 'magister_sword', frames: this.anims.generateFrameNumbers('magister', { frames: [ 102 ] }), frameRate: 1, repeat: -1});
        this.anims.create({key: 'magister_magicTrail', frames: this.anims.generateFrameNumbers('magister', { frames: [ 119,120] }), frameRate: 6});
        this.anims.create({key: 'magister_swordTrail', frames: this.anims.generateFrameNumbers('magister', { frames: [ 136,137,138,139,140 ] }), frameRate: 6});
        
        
        //Last 3 line above im not sure about in terms of after the frames

        // player animations Girl
        // this.anims.create({key: 'fall', frames: this.anims.generateFrameNumbers('girl', { frames: [ 0,1,2,3 ] }), frameRate: 8});
        // this.anims.create({ key: 'idle_right', frames: this.anims.generateFrameNumbers('girl', { frames: [ 96,97,98,99,100,101,102,103,104,105,106,107 ] }), frameRate: 8, repeat: -1 });
        // this.anims.create({ key: 'idle_up', frames: this.anims.generateFrameNumbers('girl', { frames: [ 84,85,86,87,88,89,90,91 ] }), frameRate: 8, repeat: -1 });
        // this.anims.create({ key: 'idle_down', frames: this.anims.generateFrameNumbers('girl', { frames: [ 108,109,110,111,112,113,114,115,116 ] }), frameRate: 8, repeat: -1 });
        // this.anims.create({ key: 'walk_down', frames: this.anims.generateFrameNumbers('girl', { frames: [ 36,37,38,39,40,41 ] }), frameRate: 8, repeat: -1 });
        // this.anims.create({ key: 'walk_right', frames: this.anims.generateFrameNumbers('girl', { frames: [ 12,13,14,15 ] }), frameRate: 8, repeat: -1});
        // this.anims.create({ key: 'walk_up', frames: this.anims.generateFrameNumbers('girl', { frames: [ 24,25,26,27,28,29] }), frameRate: 8, repeat: -1 });
        // this.anims.create({ key: 'attack_down', frames: this.anims.generateFrameNumbers('girl', { frames: [ 60,61,62,63,64,65 ] }), frameRate: 16 });
        // this.anims.create({ key: 'attack_right', frames: this.anims.generateFrameNumbers('girl', { frames: [ 72,73,74,75,76] }), frameRate: 10 });
        // this.anims.create({ key: 'attack_up', frames: this.anims.generateFrameNumbers('girl', { frames: [ 48,49,50,51,52,53,54] }), frameRate: 16 });
        
        //player animations Guy
        this.anims.create({key: 'fall', frames: this.anims.generateFrameNumbers('guy', { frames: [ 107,108,109,110] }), frameRate: 8});
        this.anims.create({ key: 'idle_right', frames: this.anims.generateFrameNumbers('guy', { frames: [ 12,13,14,15,16,17 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'idle_up', frames: this.anims.generateFrameNumbers('guy', { frames: [ 24,25,26,27,28,29 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'idle_down', frames: this.anims.generateFrameNumbers('guy', { frames: [ 0,1,2,3,4,5 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk_down', frames: this.anims.generateFrameNumbers('guy', { frames: [ 36,37,38,39,40 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk_right', frames: this.anims.generateFrameNumbers('guy', { frames: [ 60,61,62,63,64 ] }), frameRate: 8, repeat: -1});
        this.anims.create({ key: 'walk_up', frames: this.anims.generateFrameNumbers('guy', { frames: [ 48,49,50,51,52] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'attack_down', frames: this.anims.generateFrameNumbers('guy', { frames: [ 83,84,85,86,87,88,89,90,91,92,93,94 ] }), frameRate: 16 });
        this.anims.create({ key: 'attack_right', frames: this.anims.generateFrameNumbers('guy', { frames: [ 73,74,75,76,77,78,79,80,81,82] }), frameRate: 10 });
        this.anims.create({ key: 'attack_up', frames: this.anims.generateFrameNumbers('guy', { frames: [97,98,99,100,102,103,104,105,106] }), frameRate: 16 });

        //Fireball Animations
        this.anims.create({key: 'moveFire', frames: this.anims.generateFrameNumbers('FireBall', { frames: [ 0,1,2,3,4,5,6] }), frameRate: 8, repeat: -1 });

        //Iceball Animations
        this.anims.create({key: 'moveIce', frames: this.anims.generateFrameNumbers('Ice',{frames: [0,1,2,3,4,5]}), frameRate: 8, repeat: -1});

        //HP Bar  Animations
       
        this.anims.create({key: 'hpBar', frames: this.anims.generateFrameNumbers('Health',{frames: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39]}), frameRate: 8});
        
        //XP Bar Animations
        this.anims.create({key: 'XPBar', frames: this.anims.generateFrameNumbers('XP',{frames: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27]}), frameRate: 8});
        // create players
        players.push(new Player());
        //Dash animations
        this.anims.create({key: 'dash', frames: this.anims.generateFrameNumbers('dash', { frames: [ 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30 ] }), frameRate: 18, duration: players[0].dashTimer});
        let id = Phaser.Utils.String.UUID().substring(0, 10);
        this.scene.launch('gamelevel', id).launch('ui');
    }

}

class GameLevel extends Phaser.Scene {
    constructor() {
        super('gamelevel')
    }

    init (id) {
        if (levels[id] == undefined) levels[id] = {};
        if (levels[id].level == undefined) levels[id].level = RandLevels[Math.floor(Math.random() * RandLevels.length)];
        if (levels[id].doors == undefined) levels[id].doors = [];
        this.id = id;
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
        console.log(`[${tiles.toString()}]`)

        // print items
        let properties = this.map.layers[this.layer_tiles.layerIndex].properties;
        console.log(JSON.stringify(properties))
    }


    setEditMode(mode) {
        this.editMode = mode;

        this.layer_tilePicker.setAlpha(0);
        this.tilePicketBG.setVisible(false);
        this.propertiesText.setText('');
        this.text_item.setVisible(false);
        this.text_JSON.setVisible(false);
        this.text_delItem.setVisible(false);
        

        switch(mode) {
            case EditMode.NotEditing:
                this.placeItem = undefined;
                this.helpText.setText('EditMode: Not editing');
                this.marker.x = -100;
                this.marker.y = -100;
            
                this.helpText.setVisible(false);
                this.propertiesText.setVisible(false);
                this.cameras.main.zoomTo(camMinZoom);
            break;
            case EditMode.Selecting:
                this.helpText.setText('EditMode: Pick Block');
                this.layer_tilePicker.setAlpha(1);
                this.tilePicketBG.setVisible(true);

                // show stuff
                this.text_item.setVisible(true);
                this.text_JSON.setVisible(true);
                this.text_delItem.setVisible(true);
                this.helpText.setVisible(true);
                this.propertiesText.setVisible(true);
                this.cameras.main.zoomTo(1);
            break;
            case EditMode.PlaceBlock:
                this.helpText.setText('EditMode: Painting Tile');
                this.propertiesText.setText('Picked Tile: ' + this.tile_painting);
            break;
            case EditMode.PlaceItem:
                this.helpText.setText('EditMode: Painting Item');
                this.propertiesText.setText('Picked Item: ' + this.placeItem);
            break;
            case EditMode.DeleteItem:
                this.helpText.setText('EditMode: Deleting Item');
            break;

        }

    }

    spawnEnemy(type, x, y) {
        switch (type) {
            case 'slime':
                this.enemies.add(new Hunger(this, x, y));
            break;
        }
    }

    // returns a random location that is not solid
    getRandSpawnPoint() {

        while (true) {
            var x = Phaser.Math.Between(100, this.layer_tiles.width * 3 - 100);
            var y = Phaser.Math.Between(100, this.layer_tiles.height * 3 - 100);

            // try again if picked solid block  
            var properties = this.getTileProperties(x, y);
            if (properties && properties.solid) {
                continue;
            }

            return {x: x, y: y};
        }

    }

    spawnStuff(slimeCount, itemCount) {
        let floorPropCount = 1000;
        let wallPropCount = 1000;

        // spawn slimes
        for (var i = 0; i < slimeCount; i++) {
            var {x, y} = this.getRandSpawnPoint();
            this.spawnEnemy('slime', x, y);
        }

        // spawn items
        for (var i = 0; i < itemCount; i++) {
            var {x, y} = this.getRandSpawnPoint();
            
            // pick random item from RandItems
            var index = RandItems[Math.floor(Math.random() * RandItems.length)];
            levels[this.id].items.push({x: x, y: y, index: index});
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
                prop.setScale(2);
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

                if (this.nearWalls == undefined || this.nearWalls.length == 0) return;

                // get random location near wall
                var wall = this.nearWalls[Math.floor(Math.random() * this.nearWalls.length)];
                var x = wall.x * 32 * 3;
                var y = wall.y * 32 * 3;

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
        var tile = this.layer_tiles.getTileAt(x, y);
        if (tile && tile.properties && tile.properties.solid) {
            return true;
        }
        return false;
    }

    create() {
        window.inst = this;

        this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        const tileset = this.map.addTilesetImage('tiles', 'tiles', 32,32);
        this.layer_tiles = this.map.createLayer(levels[this.id].level, tileset);
        this.map.setCollision([ 2, 63 ]);
        this.layer_tiles.setScale(3);

   
        //JOYSTICK STUFF------------------------------------------------------------------------------------
        //CIRCLES FOR JOYSTICK-------------------------
        //----------------------------------------------

        let cir1 = this.add.circle(0, 0, 50, 0x7E38B7);
        cir1.setAlpha(0.4);
        let cir2 = this.add.circle(0, 0, 20, 0x541675);
        cir2.setAlpha(0.3);
        
        this.joyStick = this.plugins.get("rexvirtualjoystickplugin").add(this, {
            x: 0,
            y: 0,
            radius: 100,
            base: cir1,
            thumb: cir2,
            dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
            forceMin: 16,
            enable: true,
            fixed: false,
        });
       
        var visible = this.joyStick.visible;
        this.input.on('pointerdown', () => {
            this.joyStick.setVisible(visible);
            this.joyStick.setPosition(this.input.activePointer.worldX, this.input.activePointer.worldY);
            //this.joyStick.fixed = true;
            //this.joyStick.setScrollFactor(0.8);

        });
        this.input.on('pointerup', () => {
            this.joyStick.setVisible(false);
            this.joyStick.fixed = false;
            //this.joyStick.setScrollFactor(0);

        });

        //END OF JOYSTICK --------------------------------------------------------------------------------------

        // store location of door players are coming from
        this.tp_door = {};

        // find walls to put decorations on
        this.decorWalls = [];
        this.nearWalls = [];
        this.layer_tiles.forEachTile(tile => {
            var properties = tile.properties;
            var solid = properties && properties.solid;
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

        // set tile properties
        this.layer_tiles.forEachTile(tile => {
            var properties = tile.properties;

            // check door connections
            if (properties && properties.door) {
                //console.log(tile.x, tile.y);

                // check if near a door
                var nearDoor = false;
                for (var door in levels[this.id].doors) {
                    var door = levels[this.id].doors[door];
                    var distance = Phaser.Math.Distance.Between(door.x, door.y, tile.x, tile.y);
                    if (distance < 6) {
                        nearDoor = true;
                        break;
                    }
                }

                if (!nearDoor) {
                    // found a new door
                    
                    // fine nearby wall
                    var distLeft = tile.x;
                    var distRight = (inst.map.layers[0].widthInPixels / inst.map.layers[0].tileWidth) - tile.x;
                    var distUp = tile.y;
                    var distDown = (inst.map.layers[0].heightInPixels / inst.map.layers[0].tileHeight) - tile.y;
                    var wall = "";

                    var minDist = Math.min(distLeft, distRight, distUp, distDown);
                    if (minDist == distLeft) wall = "left";
                    else if (minDist == distRight) wall = "right";
                    else if (minDist == distUp) wall = "up";
                    else if (minDist == distDown) wall = "down";
                    
                    let door = {x: tile.x, y: tile.y, wall: wall};
                    levels[this.id].doors.push(door);
                    //console.log("Setup door ", door);
                }

            }

        });

        // create door connection / teleport player to proper door
        if (levels[this.id].from_wall) {

            var find_door = "";
            if (levels[this.id].from_wall == "left") find_door = "right";
            else if (levels[this.id].from_wall == "right") find_door = "left";
            else if (levels[this.id].from_wall == "up") find_door = "down";
            else if (levels[this.id].from_wall == "down") find_door = "up";

            // find previous connection
            for (var door in levels[this.id].doors) {
                var door = levels[this.id].doors[door];

                if (door.dest_id == levels[this.id].from_id) {
                    this.tp_door = {x: (door.x * 32) +16, y: door.y * 32-16 }
                    break;
                }
            }

            // make new connection
            if (this.tp_door.x == undefined)
                for (var door in levels[this.id].doors) {
                    var door = levels[this.id].doors[door];
                    if (door.wall == find_door) {

                        // if door already has a diffrent connection, skip it
                        if (door.dest_id != undefined && door.dest_id != levels[this.id].from_id) {
                            continue;
                        }

                        door.dest_id = levels[this.id].from_id;
                        this.tp_door = {x: door.x * 32 +16, y: door.y * 32-16 }
                        break;
                    }
                }

        }

        
        this.enemies = this.add.group({ classType: Enemy, runChildUpdate: true })
        this.projectile_player = this.add.group(); // projectiles launched by players
        this.physics.add.collider(this.projectile_player, this.enemies);

        // make group for items
        this.items = this.add.group();
        this.chests = this.add.group();

        // load items into data
        if (levels[this.id].items == undefined) {
            let items = this.map.layers[this.layer_tiles.layerIndex].properties.items;
            if (!items) items = {};
            levels[this.id].items = items;

            // spawn enemies and load random items
            this.spawnStuff(20, 1000);
        }

        // spawn items
        levels[this.id].items.forEach(item => {
            var item = this.physics.add.image(item.x, item.y, 'items',  item.index);
            item.setOrigin(0.5, 0.5);
            item.setScale(itemScale);
            item.setImmovable(true);
            item.body.onCollide = true;
            this.items.add(item);
            
            // get slightly bigger and smaller forever
            this.tweens.add({
                targets: item,
                scaleX: itemScale * 1.1,
                scaleY: itemScale * 1.1,
                duration: 1000,
                ease: 'Linear',
                yoyo: true,
                repeat: -1
            });

        });

        this.cameras.main.roundPixels = true;
        this.cameras.main.setBounds(0,0,this.layer_tiles.width * 3, this.layer_tiles.height * 3);
        this.cameras.main.zoomTo(camMinZoom, 0);
        this.cameras.main.fadeIn(1000);

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
        this.tilePicketBG = this.add.graphics().fillStyle(0xffffff, 1).setAlpha(0.5).fillRect(0, 0, this.layer_tilePicker.width * this.layer_tilePicker.scaleX, this.layer_tilePicker.height * this.layer_tilePicker.scaleY)
        
        this.children.bringToTop(this.layer_tilePicker);

        this.marker = this.add.graphics();
        this.marker.lineStyle(3, 0xffffff, 1);
        this.marker.strokeRect(0, 0, this.map.tileWidth * 3, this.map.tileHeight * 3);
        this.marker.x = -100;
        this.marker.y = -100;
        this.physics.add.existing(this.marker);
        this.marker.body.setSize(32 * 3, 32 * 3);
        // Select Item helper text
        this.text_item = this.add.text(0, 321, 'Select Item', { font: '10px Arial', fill: '#000000' });
        this.text_item.setStroke('#ffffff', 2);
        this.text_item.setWordWrapWidth(50, true);
        this.text_item.setAlign('center');

        // Select Item helper text
        this.text_JSON = this.add.text(32, 321, 'Print JSON', { font: '10px Arial', fill: '#000000' });
        this.text_JSON.setStroke('#ffffff', 2);
        this.text_JSON.setWordWrapWidth(50, true);
        this.text_JSON.setAlign('center');

        // Delete item helper text
        this.text_delItem = this.add.text(64, 321, 'Delete Item', { font: '10px Arial', fill: '#000000' });
        this.text_delItem.setStroke('#ffffff', 2);
        this.text_delItem.setWordWrapWidth(50, true);
        this.text_delItem.setAlign('center');

        this.helpText = this.add.text(16, 800, 'EditMode: Not editing', { font: '20px Arial', fill: '#ffffff' });
        this.propertiesText = this.add.text(16, 840, 'Picked Tile: 1', { fontSize: '18px', fill: '#ffffff' });

        this.button_edit = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
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
                    } else {

                        // clicked button to choose item to place
                        if (x == 0 && y == 10) {
                            let input = prompt("Enter item ID to place", "1");

                            if (isNaN(input)) {
                                alert(input + ' is not a valid item ID')
                            } else {
                                this.placeItem = parseInt(input);
                                this.setEditMode(EditMode.PlaceItem);
                            }
                            
                            break;
                        }

                        // clicked button to print map
                        if (x == 1 && y == 10) {
                            this.printMap();
                            break;
                        }

                        // clicked button to delete item
                        if (x == 2 && y == 10) {
                            this.setEditMode(EditMode.DeleteItem);
                            break;
                        }

                        //console.log(x, y)

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
                            console.log("Item clicked:", item);
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

        // clear previous door data
        delete levels[this.id].from_id;
        delete levels[this.id].from_wall;
        //UI STUFF------------------------------------------------------------------------------------
       
        //UI END---------------------------------------------------------------------------------------
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
                                        var dist = Phaser.Math.Distance.Between(player.sprite.x/32, player.sprite.y/32, door.x, door.y);
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
        var frameIndex = 39 - Math.round(players[0].health/ players[0].maxHealth * 38);
        this.hpBar.setFrame(frameIndex);
        this.XPBAR.setFrame(players[0].exp);
        if(players[0].dodging == true){
            this.Dash.play('dash', true);  
        }
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
    scene: [SetupLevel, GameLevel, Inventory, Settings, UI],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
};

new Phaser.Game(config);
