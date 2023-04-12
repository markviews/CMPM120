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

var game = new Phaser.Game(config);
var map;
var mapDisplay;
var marker;
var helpText;
var propertiesText;
var button_edit, button_print;
var layer2;
var editMode = 0; //0 = not editing, 1 = choose block, 2 = paint
var tile_painting = 1;

function preload ()
{
    this.load.tilemapTiledJSON('map', 'assets/tile_properties.json');
    this.load.tilemapTiledJSON('mapDisplay', 'assets/tile_display.json');
    this.load.image('tiles', 'assets/gridtiles.png');
}

function create ()
{
    map = this.make.tilemap({ key: 'map' });
    var tileset = map.addTilesetImage('tiles');
    var layer = map.createLayer('Tile Layer 1', tileset, 0, 0);

    mapDisplay = this.make.tilemap({ key: 'mapDisplay' });
    layer2 = mapDisplay.createLayer('Tile Layer 2', tileset, 0, 0);
    layer2.setAlpha(0);
    
    marker = this.add.graphics();
    marker.lineStyle(3, 0xffffff, 1);
    marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);
    marker.x = -100;
    marker.y = -100;

    helpText = this.add.text(16, 800, 'EditMode: Not editing', { font: '20px Arial', fill: '#ffffff' });
    propertiesText = this.add.text(16, 840, 'Picked: 1', { fontSize: '18px', fill: '#ffffff' });

    button_edit = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    button_print = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
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

function update (time, delta)
{
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
                layer2.setAlpha(1);
            break;
            case 2:
                helpText.setText('EditMode: Painting');
                layer2.setAlpha(0);
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