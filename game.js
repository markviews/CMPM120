var config = {
    type: Phaser.AUTO,
    width: 1215,
    height: 896,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    pixelArt: true,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


const minSpeed = .5;  // min value a player's speed can get set to if they have multiple slowness effects
const numPlayers = 4; // number of players to spawn
const maxDistFromCam = 400; // max distance any 1 player can travel from the camera (center of the screen) before they "hit an invisible wall"

var game = new Phaser.Game(config);
var map;
var mapDisplay;
var marker;
var helpText;
var propertiesText;
var button_edit, button_print, button_up, button_down, button_left, button_right;
var layer_tiles, layer_tilePicker;
var editMode = 0; //0 = not editing, 1 = choose block, 2 = paint
var tile_painting = 1;
var camera;

var players = [];

function preload () {
    this.load.tilemapTiledJSON('map', 'assets/tile_properties.json');
    this.load.tilemapTiledJSON('mapDisplay', 'assets/tile_display.json');
    this.load.image('tiles', 'assets/gridtiles.png');
    this.load.spritesheet('kid', 'assets/sprites/characters/player.png', { frameWidth: 48, frameHeight: 48 });
    this.load.image('fire', 'assets/red.png');
    this.load.image('camera', 'assets/camera.png');
}

function create () {
    map = this.make.tilemap({ key: 'map' });
    var tileset = map.addTilesetImage('tiles');
    layer_tiles = map.createLayer('Tile Layer 1', tileset, 0, 0);

    mapDisplay = this.make.tilemap({ key: 'mapDisplay' });
    layer_tilePicker = mapDisplay.createLayer('Tile Layer 2', tileset, 0, 0);
    layer_tilePicker.setAlpha(0);
    
    marker = this.add.graphics();
    marker.lineStyle(3, 0xffffff, 1);
    marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);
    marker.x = -100;
    marker.y = -100;

    camera = this.add.image(100, 100, 'camera');
    camera.setScale(0.3);

    helpText = this.add.text(16, 800, 'EditMode: Not editing', { font: '20px Arial', fill: '#ffffff' });
    propertiesText = this.add.text(16, 840, 'Picked: 1', { fontSize: '18px', fill: '#ffffff' });

    button_edit = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    button_print = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    
    // #region player setup
    
    // setup annimations
    this.anims.create({key: 'idle_down', frames: this.anims.generateFrameNumbers('kid', { frames: [ 0,1,2,3,4,5 ] }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'idle_right', frames: this.anims.generateFrameNumbers('kid', { frames: [ 6,7,8,9,10,11 ] }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'idle_up', frames: this.anims.generateFrameNumbers('kid', { frames: [ 12,13,14,15,16,17 ] }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'walk_down', frames: this.anims.generateFrameNumbers('kid', { frames: [ 18,19,20,21,22,23 ] }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'walk_right', frames: this.anims.generateFrameNumbers('kid', { frames: [ 24,25,26,27,28,29 ] }), frameRate: 8, repeat: -1});
    this.anims.create({ key: 'walk_up', frames: this.anims.generateFrameNumbers('kid', { frames: [ 30,31,32,33,34,35 ] }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'attack_down', frames: this.anims.generateFrameNumbers('kid', { frames: [ 37,37,38,39 ] }), frameRate: 16 });
    this.anims.create({ key: 'attack_right', frames: this.anims.generateFrameNumbers('kid', { frames: [ 42,43,44,45 ] }), frameRate: 10 });
    this.anims.create({ key: 'attack_up', frames: this.anims.generateFrameNumbers('kid', { frames: [ 48,49,50,51 ] }), frameRate: 16 });
    this.anims.create({ key: 'fall', frames: this.anims.generateFrameNumbers('kid', { frames: [ 54,55,56 ] }), frameRate: 8 });

    for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
        
        players[playerIndex] = { dir: "right", idle: false, onFire: false, attacking: false, speed: 3.5 }
        
        // create player
        players[playerIndex].player = this.add.sprite(600, 370);
        players[playerIndex].player.setScale(2.5);
        players[playerIndex].player.play('walk_right');
        
        // attack end event
        players[playerIndex].player.on('animationcomplete', function (anim, frame) {
            if (anim.key.startsWith("attack_")) {
                players[playerIndex].attacking = false;
            }
        }, players[playerIndex].player);

    }

    //#endregion player setup

    // #region player attack

    this.input.on('pointerdown', function (pointer) {
        var p = players[0];

        p.attacking = true;
        var attackDir = "";

        // if clicked near player, possibly attack up/down
        if (Math.abs(pointer.x - players[0].player.x) < 80) {
            if ((pointer.y - p.player.y) < -12) attackDir = "up";
            if ((pointer.y - p.player.y) > 47) attackDir = "down";
        }

        // if not attacking up or down, set to left or right
        if (attackDir == "") {
            if (pointer.x < players[0].player.x) attackDir = "left";
            else attackDir = "right";
        }

        if (attackDir == "left") players[0].player.flipX = true;
        if (attackDir == "right") players[0].player.flipX = false;
        p.dir = attackDir;

        var anim = `attack_${attackDir == "left" ? "right" : attackDir}`;
        p.player.play(anim);

    }, this);
    //#endregion player attack
    
    // #region player controls
    // controlls
    players[0].controls = { 
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    }

    if (players[1] != undefined)
    players[1].controls = { 
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
    }

    if (players[2] != undefined)
    players[2].controls = { 
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G),
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H)
    }

    if (players[3] != undefined)
    players[3].controls = {
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L)
    }
    //#endregion player controls

}

function update () {

    var minX = players[0].player.x;
    var maxX = players[0].player.x;
    var minY = players[0].player.y;
    var maxY = players[0].player.y;

    // for each player
    for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
        var p = players[playerIndex];

        minX = Math.min(minX, p.player.x);
        maxX = Math.max(maxX, p.player.x);
        minY = Math.min(minY, p.player.y);
        maxY = Math.max(maxY, p.player.y);
        
        // #region movement
        // remove this IF statement to let the player walk while attacking
        if (!p.attacking) {
            p.idle = true;
        
            if (p.controls.up.isDown) {
                p.player.y -= getMoveSpeed(p, 0, -1, 0, 45 - p.speed);
                p.dir = "up";
                p.idle = false;
            }
            //"else" here so if player acidently holds up and down they will just go up
            else if (p.controls.down.isDown) {
                p.player.y += getMoveSpeed(p, 0, 1, 0, 45);
                p.dir = "down";
                p.idle = false;
            }

            if (p.controls.left.isDown) {
                p.player.x -= getMoveSpeed(p, -1, 0, -10, 45);
                p.dir = "left";
                p.idle = false;
            }
            //"else" here so if player acidently holds left and right they will just go left
            else if (p.controls.right.isDown) {
                p.player.x += getMoveSpeed(p, 1, 0, 10, 45);
                p.dir = "right";
                p.idle = false;
            }
        }
        

        //#endregion movement

        // #region animation
        // set player animation
        // replaces "left" dir with "right" animation because it's just mirred right
        if (!p.attacking) {
            var anim = `${p.idle ? "idle" : "walk"}_${p.dir == "left" ? "right" : p.dir}`;
            if (p.player.anims.currentAnim.key != anim) p.player.play(anim);

            if (p.dir == "left") p.player.flipX = true;
            if (p.dir == "right") p.player.flipX = false;
        }
        //#endregion animation

        // #region fire
        var properties = getTileProperties(p.player.x,p.player.y + 30 - p.speed);
        if (properties.fire) {
            p.onFire = true;
            p.fireTick = Date.now();


            if (!p.fireEmitter) {
                p.fireParticles = this.add.particles('fire');
                p.fireEmitter = p.fireParticles.createEmitter({ x: p.player.x, y: p.player.y + 30, speed: 100, lifespan: 300, alpha: { start: 0.6, end: 0 } });
            }

        }

        if (p.onFire && Date.now() - p.fireTick > 2000) {
            p.onFire = false;
            p.fireParticles.destroy()
            p.fireEmitter = undefined
        }

        if (p.onFire) {
            p.fireEmitter.setPosition(p.player.x, p.player.y + 30);
        }
        //#endregion fire

    }

    // camera
    camera.setPosition((minX + maxX) / 2, (minY + maxY) / 2);

    // #region tile editor
    if (Phaser.Input.Keyboard.JustDown(button_print)) {
        printMap();
    }

    if (Phaser.Input.Keyboard.JustDown(button_edit)) {
        editMode += 1
        if (editMode > 2) editMode = 0;
        

        switch(editMode) {
            case 0:
                helpText.setText('EditMode: Not editing');
                marker.x = -100;
                marker.y = -100;
            break;
            case 1:
                helpText.setText('EditMode: Pick Block');
                layer_tilePicker.setAlpha(1);
            break;
            case 2:
                helpText.setText('EditMode: Painting');
                layer_tilePicker.setAlpha(0);
            break;
        }
        
    }

    //block selector
    if (editMode != 0) {
        var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

        // Rounds down to nearest tile
        var pointerTileX = map.worldToTileX(worldPoint.x);
        var pointerTileY = map.worldToTileY(worldPoint.y);

        // Snap to tile coordinates, but in world space
        marker.x = map.tileToWorldX(pointerTileX);
        marker.y = map.tileToWorldY(pointerTileY);
    }

    //mouse click event
    if (this.input.manager.activePointer.isDown) {

        switch(editMode) {
            case 0:
            break;
            case 1:
                var tile = mapDisplay.getTileAt(pointerTileX, pointerTileY);

                if (tile) {
                    tile_painting = tile.index;
                    propertiesText.setText('Picked: ' + tile_painting);
                }
            break;
            case 2:
                var tile = map.getTileAt(pointerTileX, pointerTileY);

                if (tile) {
                    tile.index = tile_painting;
                    //propertiesText.setText('Properties: ' + JSON.stringify(tile.properties));
                    //tile.properties.viewed = true;
                }
            break;
        }

    }
    //#endregion tile editor

}

// #region helper functions
function printMap() {
    var tiles = []
    map.layers[0].data.forEach(row => {
        row.forEach(tile => {
            tiles.push(tile.index)
        });
    });
    console.log(`[${tiles.toString()}]`)
}

function getTileProperties(x,y) {
    var tile = layer_tiles.getTileAtWorldXY(x, y, true);
    if (tile) {
        var properties = layer_tiles.layer.tilemapLayer.tileset[0].tileProperties[tile.index]
        if (properties)
            return properties;
    }
    return {};
}

// get player movement speed
function getMoveSpeed(p, xMove, yMove, xTileOffset, yTileOffset) {

    // check if player is too far from camera
    // camera distance disabled when set to -1
    if (maxDistFromCam != -1) {
        var dist = Phaser.Math.Distance.Between(p.player.x, p.player.y, camera.x, camera.y);
        var distIfMove = Phaser.Math.Distance.Between(p.player.x + xMove, p.player.y + yMove, camera.x, camera.y);

        if (dist > maxDistFromCam && distIfMove > dist) return 0;
    }

    var properties = getTileProperties(p.player.x + xTileOffset,p.player.y + yTileOffset);
    if (properties.solid) return 0;
    if (properties.speed) return Math.max(properties.speed + p.speed, minSpeed)

    return p.speed;
}
//#endregion helper functions