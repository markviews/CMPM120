// global settings
const minSpeed = .5;            // min value a player's speed can get set to if they have multiple slowness effects
const freezeMelee = true;       // freeze player movement while using melee attacks
const freezeProjectile = false; // freeze player movement while using projectile attacks
const camMinZoom = 2.5;         // smallest the camera will zoom
const camPadding = 80;          // area between player and edge of screen
const itemScale = 1.5;          // scale of items
const itemsGrid = true;         // items snap to grid when placed

// global variables
var players = [
    { dir: "right", idle: false, onFire: false, attacking: false, speed: 3.5 },
    { dir: "right", idle: false, onFire: false, attacking: false, speed: 3.5 }
];

class GameLevel extends Phaser.Scene {
    constructor() {
        super('gamelevel')
    }

    init (data) {
        //console.log(data);
        this.level = data.level;
    }

    // get player movement speed
    getMoveSpeed(p, xTileOffset, yTileOffset) {

        // freeze player if attacking
        if (freezeMelee && p.attacking) return 0;

        var properties = this.getTileProperties(p.player.x + xTileOffset,p.player.y + yTileOffset);
        if (properties.solid) return 0;
        if (properties.speed) return Math.max(properties.speed + p.speed, minSpeed)

        return p.speed;
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

    preload() {
        this.load.tilemapTiledJSON('map', 'assets/tile_properties.json');
        this.load.image('tiles', 'assets/gridtiles.png');
        this.load.spritesheet('kid', 'assets/sprites/characters/player.png', { frameWidth: 48, frameHeight: 48 });
        this.load.image('fire', 'assets/red.png');
        this.load.image('bullet', 'assets/emoji.png');
        this.load.spritesheet('items', 'assets/gridItems.png', { frameWidth: 16, frameHeight: 16 });
        this.load.plugin('rexcircularprogressplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcircularprogressplugin.min.js', true);  
    }

    create() {
        window.inst = this;

        this.map = this.make.tilemap({ key: 'map' });
        var tileset = this.map.addTilesetImage('tiles');
        this.layer_tiles = this.map.createLayer(this.level, tileset, 0, 0);

        // set tile properties
        this.layer_tiles.forEachTile(function (tile) {
            var properties = this.map.tilesets[0].tileProperties[tile.index];
            tile.properties = properties;
        }, this);

        // make physics group for items
        this.items = this.physics.add.group();

        // load items
        let loadItems = this.map.layers[this.layer_tiles.layerIndex].properties.items;
        loadItems.forEach(item => {
            var item = this.physics.add.image(item.x, item.y, 'items',  item.index);
            item.setOrigin(0.5, 0.5);
            item.setScale(itemScale);

            // add item to group
            this.items.add(item);
        });

        // a camera object used to keep track of center camera position
        this.camera = this.add.image(100, 100);
        this.camera.visible = false;
    
        this.cameras.main.roundPixels = true;
        this.cameras.main.zoomTo(2, 0);
        this.cameras.main.startFollow(this.camera);
        this.cameras.main.setBounds(0,0,this.layer_tiles.width, this.layer_tiles.height);
        
        this.projectiles = this.add.group();

         // task progress bar
         this.circularProgress = this.add.rexCircularProgress({
            x: 0, y: 0,
            radius: 20,
            trackColor: 0x260e04,
            barColor: 0x7b5e57,
            //centerColor: 0x4e342e,
            anticlockwise: false,
            value: 0,
        })
        this.circularProgress.setOrigin(0.5, 0.5);
        this.circularProgress.visible = false;

        // collide event
        this.physics.world.on('collide', (gameObject1, gameObject2, body1, body2) => {
            var playerID = gameObject1.id;
            var itemID = gameObject2.frame.name;
            console.log(`player ${playerID} collided with item ID: ${itemID}`)

            this.items.remove(gameObject2);

            // tween item twards player, make smaller, fade out, then destroy
            // a cool effect would be the item dragging twards the player as it fades. I couldn't figure that out yet
            this.tweens.add({
                targets: gameObject2,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    gameObject2.destroy();
                }
            });

        });
    
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

        let index = 1;
        // setup players
        for (var i in players) {
            let p = players[i];
            
            p.player = this.add.sprite(Phaser.Math.Between(500, 700), Phaser.Math.Between(300, 500));
            p.player.setScale(2.5);
            p.player.play('walk_right');
            p.player.id = index++;

            // enable physics
            this.physics.world.enable(p.player);
            p.player.body.onCollide = true;
            p.player.body.setSize(15, 20);
            p.player.body.setOffset(17, 22);
            this.physics.add.collider(p.player, this.items);
            
            // random direction
            const directions = ["down", "left", "right"];
            p.dir = directions[Math.floor(Math.random() * directions.length)]
            p.player.play(`idle_${p.dir}`);
            
            // attack end event
            p.player.on('animationcomplete', function (anim, frame) {
                if (anim.key.startsWith("attack_")) {
                    p.attacking = false;
                    console.log(`player ${p.player.id} attack ended`);
                }
            });

        }
    
        //#endregion player setup
        
        // #region player controls
        // controlls
        players[0].controls = { 
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            attack_melee: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            attack_projectile: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
        }
    
        if (players[1] != undefined)
        players[1].controls = { 
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            attack_melee: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE),
            attack_projectile: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PAGE_DOWN)
        }
        //#endregion player controls

        // #region map editor
        this.editMode = 0;
        this.tile_painting = 1;
        this.mapDisplay = this.make.tilemap({ key: 'map' });
        this.layer_tilePicker = this.mapDisplay.createLayer('display', tileset, 0, 0);
        this.layer_tilePicker.setAlpha(0);

        this.marker = this.add.graphics();
        this.marker.lineStyle(3, 0xffffff, 1);
        this.marker.strokeRect(0, 0, this.map.tileWidth, this.map.tileHeight);
        this.marker.x = -100;
        this.marker.y = -100;

        this.helpText = this.add.text(16, 800, 'EditMode: Not editing', { font: '20px Arial', fill: '#ffffff' });
        this.propertiesText = this.add.text(16, 840, 'Picked Tile: 1', { fontSize: '18px', fill: '#ffffff' });

        this.button_edit = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        
        //mouse click event
        this.input.on('pointerdown', () => {
            var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
            var x = this.map.worldToTileX(worldPoint.x);
            var y = this.map.worldToTileY(worldPoint.y);

            switch(this.editMode) {
                case 0:
                break;
                case 1:
                    var tile = this.mapDisplay.getTileAt(x, y);
                    if (tile) {
                        this.tile_painting = tile.index;
                        this.propertiesText.setText('Picked Tile: ' + this.tile_painting);
                    } else {

                        // clicked button to choose item to place
                        if (x == 0 && y == 10) {
                            let input = prompt("Enter item ID to place", "1");

                            if (isNaN(input)) {
                                alert(input + ' is not a valid item ID')
                            } else {
                                this.placeItem = parseInt(input);
                                this.propertiesText.setText('Picked Item: ' + this.placeItem);
                            }
                            
                            break;
                        }

                        // clicked button to print map
                        if (x == 1 && y == 10) {
                            this.printMap();
                            break;
                        }

                        //console.log(x, y)

                    }
                break;
                case 2:
                    if (this.placeItem != undefined) {
                        // place item
                        if (itemsGrid) {
                            x = this.map.tileToWorldX(x) + this.map.tileWidth / 2;
                            y = this.map.tileToWorldY(y) + 5;
                        } else {
                            x = worldPoint.x;
                            y = worldPoint.y;
                        }

                        var item = this.add.image(x, y, 'items',  this.placeItem);
                        item.setScale(itemScale);
                        item.setOrigin(0.5, 0.5);

                        this.map.layers[this.layer_tiles.layerIndex].properties.items.push({x: x, y: y, index: this.placeItem});
                    } else {
                        // place tile
                        var tile = this.map.getTileAt(x, y);
                        if (!tile) break;
                        
                        tile.index = this.tile_painting;
                        
                        // set default properties
                        var properties = this.map.tilesets[0].tileProperties[tile.index];
                        tile.properties = properties;
                    }
                break;
            }

        });
        // #endregion map editor

    }

    update() {
        // camera variables
        var outOfBounds = 0; // number of players out of bounds this frame
        var minX = players[0].player.x;
        var maxX = players[0].player.x;
        var minY = players[0].player.y;
        var maxY = players[0].player.y;

        var playersDoor = 0; // number of players at door this frame

        for (var p of players) {

            // camera variables
            minX = Math.min(minX, p.player.x);
            maxX = Math.max(maxX, p.player.x);
            minY = Math.min(minY, p.player.y);
            maxY = Math.max(maxY, p.player.y);
            
            // melee attack
            if (Phaser.Input.Keyboard.JustDown(p.controls.attack_melee)) {
                p.attacking = true;
                var anim = `attack_${p.dir == "left" ? "right" : p.dir}`;
                p.player.play(anim);
            }

            // projectile attack
            if (Phaser.Input.Keyboard.JustDown(p.controls.attack_projectile)) {
                let mySprite = this.add.sprite(p.player.x, p.player.y + 30, 'bullet');
                mySprite.setScale(0.05);
                this.projectiles.add(mySprite);
                this.physics.add.existing(mySprite);
                mySprite.body.setVelocity(1000, 0);
            }
            
            // #region movement
            p.idle = true;
        
            if (p.controls.up.isDown) {
                p.player.y -= this.getMoveSpeed(p, 0, 40 - p.speed);
                p.dir = "up";
                p.idle = false;
            }
            //"else" here so if player acidently holds up and down they will just go up
            else if (p.controls.down.isDown) {
                p.player.y += this.getMoveSpeed(p, 0, 45);
                p.dir = "down";
                p.idle = false;
            }

            if (p.controls.left.isDown) {
                p.player.x -= this.getMoveSpeed(p, -10, 40);
                p.dir = "left";
                p.idle = false;
            }
            //"else" here so if player acidently holds left and right they will just go left
            else if (p.controls.right.isDown) {
                p.player.x += this.getMoveSpeed(p, 10, 40);
                p.dir = "right";
                p.idle = false;
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
            var properties = this.getTileProperties(p.player.x,p.player.y + 30 - p.speed);
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

            // #region door

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
                            maxDist = Math.max(maxDist, Phaser.Math.Distance.Between(p1.player.x, p1.player.y, p2.player.x, p2.player.y));
                        }
                    }

                    // if all players are on the same door, and progress hasn't started yet
                    if (maxDist < 60 && !(this.progress && this.progress.isPlaying())) {

                        // move this.circularProgress to front
                        this.children.bringToTop(this.circularProgress);

                        this.circularProgress.setPosition(p.player.x, p.player.y);
                        this.circularProgress.visible = true;
                        this.progress = this.tweens.add({
                            targets: this.circularProgress,
                            value: 1,
                            duration: Phaser.Math.Between(2000, 4000),
                            ease: 'Linear ',
                            callbackScope: this,
                            onComplete: function () {
                                this.circularProgress.visible = false;
                                this.circularProgress.value = 0;
                                this.scene.start('gamelevel', { level: 'level2' });
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

            // #region check if camera needs to zoom
            var angle = Math.atan2(p.player.x - this.camera.x, p.player.y - this.camera.y);
            var x = p.player.x + Math.sin(angle) * camPadding;
            var y = p.player.y + Math.cos(angle) * camPadding;

            // player is out of bounds, zoom camera out
            if (!this.cameras.main.worldView.contains(x, y)) {
                if (this.cameras.main._bounds.contains(x,y)) {
                    this.cameras.main.zoomTo(this.cameras.main.zoom - 0.01, 1);
                    //console.log("zooming out");
                }
            }
            
            // zoom back in if everyone is away from the edges
            var x2 = p.player.x + Math.sin(angle) * (camPadding + 30);
            var y2 = p.player.y + Math.cos(angle) * (camPadding + 30);
            if (!this.cameras.main.worldView.contains(x2, y2)) {
                outOfBounds++;
            }
            //#endregion check if camera needs to zoom

        }

        if (this.editMode == 0) {
            // normal camera movement
            this.camera.setPosition((minX + maxX) / 2, (minY + maxY) / 2);
            
            // zoom camera in if all players are away from edges
            if (outOfBounds <= 1 && this.cameras.main.zoom < camMinZoom) {
                this.cameras.main.zoomTo(this.cameras.main.zoom + 0.01, 1);
            }
        } else {
            // zoom out in edit mode
            this.cameras.main.zoomTo(1);
        }

        // #region tile editor

        if (Phaser.Input.Keyboard.JustDown(this.button_edit)) {
            this.editMode += 1
            if (this.editMode > 2) this.editMode = 0;
            
            //0 = not editing, 1 = choose block, 2 = paint
            switch(this.editMode) {
                case 0:
                    this.placeItem = undefined;
                    this.helpText.setText('EditMode: Not editing');
                    this.marker.x = -100;
                    this.marker.y = -100;
                break;
                case 1:
                    this.helpText.setText('EditMode: Pick Block');
                    this.layer_tilePicker.setAlpha(1);
                break;
                case 2:
                    if (this.placeItem != undefined) {
                        this.helpText.setText('EditMode: Painting Item');
                    } else {
                        this.helpText.setText('EditMode: Painting Tile');
                    }

                    this.layer_tilePicker.setAlpha(0);
                break;
            }
            
        }

        //block selector
        if (this.editMode != 0) {
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
    width: 1215,
    height: 896,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    pixelArt: true,
    scene: [GameLevel],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

new Phaser.Game(config);
