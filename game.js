// global settings
const minSpeed = .5;            // min value a player's speed can get set to if they have multiple slowness effects
const freezeMelee = true;       // freeze player movement while using melee attacks
const freezeProjectile = false; // freeze player movement while using projectile attacks
const camMinZoom = 2.5;         // smallest the camera will zoom
const camPadding = 80;          // area between player and edge of screen
const itemScale = 1.5;          // scale of items
const itemsGrid = true;         // items snap to grid when placed

// list of random levels to choose from
const RandLevels = ["level1", "level2"];

// global variables
var levels = {};
var players = [];

const EditMode = { NotEditing: 0, Selecting: 1, PlaceBlock: 2, PlaceItem: 3, DeleteItem: 4 }

class SetupLevel extends Phaser.Scene {

    preload() {
        this.load.tilemapTiledJSON('map', 'assets/tile_properties.json');
        this.load.image('tiles', 'assets/gridtiles.png');
        this.load.spritesheet('slime', 'assets/sprites/characters/slime.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('girl',  'assets/sprites/characters/Girl.png', {frameWidth: 48, frameHeight: 48});
        this.load.image('fire', 'assets/red.png');
        this.load.image('bullet', 'assets/emoji.png');
        this.load.spritesheet('items', 'assets/gridItems.png', { frameWidth: 16, frameHeight: 16 });
        this.load.plugin('rexcircularprogressplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcircularprogressplugin.min.js', true);
        this.load.plugin("rexvirtualjoystickplugin", 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);
    }

    create() {
        // slime animations
        this.anims.create({key: 'slime_idle', frames: this.anims.generateFrameNumbers('slime', { frames: [ 0,1,2,3 ] }), frameRate: 6, repeat: -1 });
        this.anims.create({key: 'slime_jump2', frames: this.anims.generateFrameNumbers('slime', { frames: [ 8,9,10,11,12 ] }), frameRate: 6, repeat: -1 });
        this.anims.create({key: 'slime_jump', frames: this.anims.generateFrameNumbers('slime', { frames: [ 14,15,16,17,18,19,20 ] }), frameRate: 8 });
        this.anims.create({key: 'slime_ouch', frames: this.anims.generateFrameNumbers('slime', { frames: [ 21,22,23 ] }), frameRate: 6 });
        this.anims.create({key: 'slime_die', frames: this.anims.generateFrameNumbers('slime', { frames: [ 28,29,30,31,32 ] }), frameRate: 8 });
        
        // player animations
        this.anims.create({key: 'fall', frames: this.anims.generateFrameNumbers('girl', { frames: [ 0,1,2,3 ] }), frameRate: 8});
        this.anims.create({ key: 'idle_right', frames: this.anims.generateFrameNumbers('girl', { frames: [ 96,97,98,99,100,101,102,103,104,105,106,107 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'idle_up', frames: this.anims.generateFrameNumbers('girl', { frames: [ 84,85,86,87,88,89,90,91 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'idle_down', frames: this.anims.generateFrameNumbers('girl', { frames: [ 108,109,110,111,112,113,114,115,116 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk_down', frames: this.anims.generateFrameNumbers('girl', { frames: [ 36,37,38,39,40,41 ] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk_right', frames: this.anims.generateFrameNumbers('girl', { frames: [ 12,13,14,15 ] }), frameRate: 8, repeat: -1});
        this.anims.create({ key: 'walk_up', frames: this.anims.generateFrameNumbers('girl', { frames: [ 24,25,26,27,28,29] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'attack_down', frames: this.anims.generateFrameNumbers('girl', { frames: [ 60,61,62,63,64,65 ] }), frameRate: 16 });
        this.anims.create({ key: 'attack_right', frames: this.anims.generateFrameNumbers('girl', { frames: [ 72,73,74,75,76] }), frameRate: 10 });
        this.anims.create({ key: 'attack_up', frames: this.anims.generateFrameNumbers('girl', { frames: [ 48,49,50,51,52,53,54] }), frameRate: 16 });
        
        // create players
        players.push(new Player());

        let id = Phaser.Utils.String.UUID().substring(0, 10);
        this.scene.start('gamelevel', id);
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
                this.enemies.add(new Slime(this, x, y));
            break;
        }
        
    }

    goToLevel(id) {
        // unload current level
        this.enemies = undefined;

        // go new level
        this.scene.start('gamelevel', id);
    }

    create() {
        window.inst = this;

        this.map = this.make.tilemap({ key: 'map' });
        const tileset = this.map.addTilesetImage('tiles');
        this.layer_tiles = this.map.createLayer(levels[this.id].level, tileset);
        this.map.setCollision([ 41, 26 ]);

        //JOYSTICK STUFF------------------------------------------------------------------------------------
        //CIRCLES FOR JOYSTICK-------------------------
        //----------------------------------------------
        let cir1 = this.add.circle(0, 0, 50, 0x888888);
        cir1.setAlpha(0.4);
        let cir2 = this.add.circle(0, 0, 20, 0xcccccc);
        cir2.setAlpha(0.3);
        
        this.joyStick = this.plugins.get("rexvirtualjoystickplugin").add(this, {
            x: 450,
            y: 550,
            radius: 200,
            base: cir1,
            thumb: cir2,
            dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
            forceMin: 16,
            enable: true
        });
      
        //END OF JOYSTICK --------------------------------------------------------------------------------------

        // toggle fullscreen button
        const fullscreenKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        fullscreenKey.on('down', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        // store location of door players are coming from
        this.tp_door = {};

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

        // load items into data
        if (levels[this.id].items == undefined) {
            let items = this.map.layers[this.layer_tiles.layerIndex].properties.items;
            if (!items) items = {};
            levels[this.id].items = items;
        }

        // load items
        levels[this.id].items.forEach(item => {
            var item = this.physics.add.image(item.x, item.y, 'items',  item.index);
            item.setOrigin(0.5, 0.5);
            item.setScale(itemScale);
            item.setImmovable(true);
            item.body.onCollide = true;
            this.items.add(item);
        });

        this.cameras.main.roundPixels = true;
        this.cameras.main.setBounds(0,0,this.layer_tiles.width, this.layer_tiles.height);
        this.cameras.main.zoomTo(camMinZoom, 0);
        this.cameras.main.fadeIn(1000);
        
        this.projectiles = this.add.group();

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

        // spawn enemies
        this.spawnEnemy('slime', 400, 400);
        this.spawnEnemy('slime', 400, 500);

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

        this.marker = this.add.graphics();
        this.marker.lineStyle(3, 0xffffff, 1);
        this.marker.strokeRect(0, 0, this.map.tileWidth, this.map.tileHeight);
        this.marker.x = -100;
        this.marker.y = -100;
        this.physics.add.existing(this.marker);
        this.marker.body.setSize(32, 32);
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

    }

    update(time, delta) {
        // camera variables
        var playersDoor = 0; // number of players at door this frame

        for (var player of players) {
            player.update(time, delta);
            
            // #region door

            var properties = this.getTileProperties(player.sprite.x, player.sprite.y + 30 - player.speed);
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

                        // move this.circularProgress to front
                        this.children.bringToTop(this.circularProgress);

                        this.circularProgress.setPosition(player.sprite.x, player.sprite.y);
                        this.circularProgress.visible = true;
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

var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    pixelArt: true,
    scene: [SetupLevel, GameLevel],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
};

new Phaser.Game(config);