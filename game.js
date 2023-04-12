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

const speed = 3.5;

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

var player;
var dir = "down";
var idle = true;

function preload ()
{
    this.load.tilemapTiledJSON('map', 'assets/tile_properties.json');
    this.load.tilemapTiledJSON('mapDisplay', 'assets/tile_display.json');
    this.load.image('tiles', 'assets/gridtiles.png');

    this.load.spritesheet('kid', 'assets/sprites/characters/player.png', { frameWidth: 48, frameHeight: 48 });
}

function create ()
{
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

    helpText = this.add.text(16, 800, 'EditMode: Not editing', { font: '20px Arial', fill: '#ffffff' });
    propertiesText = this.add.text(16, 840, 'Picked: 1', { fontSize: '18px', fill: '#ffffff' });

    button_edit = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    button_print = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    button_up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    button_down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    button_left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    button_right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    /*
        Player annimations
    */

    this.anims.create({
        key: 'idle_down',
        frames: this.anims.generateFrameNumbers('kid', { frames: [ 0,1,2,3,4,5 ] }),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'idle_right',
        frames: this.anims.generateFrameNumbers('kid', { frames: [ 6,7,8,9,10,11 ] }),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'idle_up',
        frames: this.anims.generateFrameNumbers('kid', { frames: [ 12,13,14,15,16,17 ] }),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_down',
        frames: this.anims.generateFrameNumbers('kid', { frames: [ 18,19,20,21,22,23 ] }),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_right',
        frames: this.anims.generateFrameNumbers('kid', { frames: [ 24,25,26,27,28,29 ] }),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_up',
        frames: this.anims.generateFrameNumbers('kid', { frames: [ 30,31,32,33,34,35 ] }),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'attack_down',
        frames: this.anims.generateFrameNumbers('kid', { frames: [ 37,37,38,39 ] }),
        frameRate: 8,
    });

    this.anims.create({
        key: 'attack_right',
        frames: this.anims.generateFrameNumbers('kid', { frames: [ 42,43,44,45 ] }),
        frameRate: 8,
    });

    this.anims.create({
        key: 'attack_up',
        frames: this.anims.generateFrameNumbers('kid', { frames: [ 48,49,50,51 ] }),
        frameRate: 8,
    });

    this.anims.create({
        key: 'fall',
        frames: this.anims.generateFrameNumbers('kid', { frames: [ 54,55,56 ] }),
        frameRate: 8,
    });
    
    player = this.add.sprite(600, 370);
    player.setScale(2.5);
    player.play('walk_down');

}

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

function update (time, delta) {

    /*
        Movement
    */
    idle = true;
    
    if (button_up.isDown) {
        var properties = getTileProperties(player.x,player.y + 30 - speed);
        if (!properties.solid)
            player.y -= properties.speed != undefined ? properties.speed : speed
        dir = "up";
        idle = false;
    }
    if (button_down.isDown) {
        var properties = getTileProperties(player.x,player.y + 45);
        if (!properties.solid)
            player.y += properties.speed != undefined ? properties.speed : speed;
        dir = "down";
        idle = false;
    }
    if (button_left.isDown) {
        var properties = getTileProperties(player.x - 10,player.y + 30);
        if (!properties.solid)
            player.x -= properties.speed != undefined ? properties.speed : speed;
        player.flipX = true;
        dir = "left";
        idle = false;
    }
    if (button_right.isDown) {
        var properties = getTileProperties(player.x + 10,player.y + 30);
        if (!properties.solid)
            player.x += properties.speed != undefined ? properties.speed : speed;
        player.flipX = false;
        dir = "right";
        idle = false;
    }

    // set player animtion
    var anim = dir;
    if (dir == "left") anim = "right";
    if (player.anims.currentAnim.key != `${idle ? "idle" : "walk"}_${anim}`) player.play(`${idle ? "idle" : "walk"}_${anim}`);


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
}