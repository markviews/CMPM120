var index = 0;
//Touch Control variables-----
var isDrag = false;
var startDragPos;
//----------------------------
class Player {

    constructor() {
        this.dir = "right";
        this.idle = false;
        this.onFire = false;
        this.attacking = false;
        this.speed = 3.5;
        this.items = {};
        this.playerID = index++
    }

    // called when player enters a new scene
    newScene(scene) {
        this.scene = scene;

        this.sprite = scene.add.sprite();
        this.sprite.setScale(2.5);
        this.sprite.play('walk_right');
        this.sprite.id = this.playerID;
        
        // physics
        scene.physics.world.enable(this.sprite);
        this.sprite.body.onCollide = true;
        this.sprite.body.setSize(15, 20);
        this.sprite.body.setOffset(17, 22);
        
        // melee hitbox
        this.MeleeHithox = scene.add.rectangle(-100, -100, 0, 0);
        scene.physics.world.enable(this.MeleeHithox);
        this.MeleeHithox.body.onCollide = true;
        this.MeleeHithox.name = "melee_hitbox";
        this.MeleeHithox.id = this.playerID;
        
        // hixbox colliders
        scene.physics.add.collider(this.sprite, scene.items);
        scene.physics.add.collider(this.sprite, scene.slimes);
        scene.physics.add.collider(this.MeleeHithox, scene.slimes);

        // set position
        if (scene.tp_door?.x && scene.tp_door?.y) {
            this.sprite.x = scene.tp_door.x;
            this.sprite.y = scene.tp_door.y;
        } else {
            this.sprite.x = Phaser.Math.Between(500, 700);
            this.sprite.y = Phaser.Math.Between(300, 500);
        }

        // set direction
        if (levels[this.id]?.from_wall) {
            // face direction of door
            this.dir = levels[this.id].from_wall;
        } else {
            // random direction
            const directions = ["down", "left", "right"];
            this.dir = directions[Math.floor(Math.random() * directions.length)]
        }
        
        this.sprite.play(`idle_${this.dir}`);
        
        // pick up item event
        scene.physics.world.on('collide', (gameObject1, gameObject2, body1, body2) => {
            if (gameObject1 =! this) return;
            if (gameObject2.texture.key != "items") return;

            scene.items.remove(gameObject2);

            // fade item out when picked up
            scene.tweens.add({
                targets: gameObject2,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    gameObject2.destroy();

                    var itemID = gameObject2.frame.name;
                    if (this.items[itemID] == undefined) this.items[itemID] = 0;
                    this.items[itemID]++;

                    // remove item from level data
                    levels[scene.id].items = levels[scene.id].items.filter(item => {
                        return !(item.x == gameObject2.x && item.y == gameObject2.y && item.index == itemID);
                    });

                }
            });
            
        });

        // melee attack end event
        this.sprite.on('animationcomplete', (anim) => {
            if (anim.key.startsWith("attack_")) {
                this.attacking = false;
            }
        });

        // melee attack hitbox
        this.sprite.on('animationupdate', (anim) => {
            if (anim.key.startsWith("attack_right")) {
                this.MeleeHithox.x = this.sprite.x - 2;
                this.MeleeHithox.y = this.sprite.y + 35;
                this.MeleeHithox.body.setSize(90, 35);
            }
            if (anim.key.startsWith("attack_up")) {
                this.MeleeHithox.x = this.sprite.x;
                this.MeleeHithox.y = this.sprite.y + 15;
                this.MeleeHithox.body.setSize(60, 40);
            }
            if (anim.key.startsWith("attack_down")) {
                this.MeleeHithox.x = this.sprite.x - 5;
                this.MeleeHithox.y = this.sprite.y + 40;
                this.MeleeHithox.body.setSize(70, 40);
            }
        });
        

        switch(this.playerID) {
            case 0:
                this.controls = { 
                    up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                    down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                    left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                    right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                    attack_melee: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
                    attack_projectile: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
                }
            break;
            case 1:
                this.controls = { 
                    up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
                    down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
                    left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
                    right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
                    attack_melee: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE),
                    attack_projectile: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PAGE_DOWN)
                }
            break;
        }
        
    }

    update() {
        let scene = this.scene;

        // melee attack
        if (Phaser.Input.Keyboard.JustDown(this.controls.attack_melee)) {
            this.attacking = true;
            var anim = `attack_${this.dir == "left" ? "right" : this.dir}`;
            this.sprite.play(anim);
        }

        // projectile attack
        if (Phaser.Input.Keyboard.JustDown(this.controls.attack_projectile)) {
            let mySprite = scene.add.sprite(this.sprite.x, this.sprite.y + 30, 'bullet');
            mySprite.setScale(0.05);
            scene.projectiles.add(mySprite);
            scene.physics.add.existing(mySprite);

            let projectileSpeed = 500;
            let a = Phaser.Math.DegToRad(this.angle);
            mySprite.body.setVelocity(Math.cos(a) * projectileSpeed, Math.sin(a) * projectileSpeed);

            // destroy projectile after 1 second
            scene.time.delayedCall(1000, function() {
                mySprite.destroy();
            });
        }

        // #region movement
        this.idle = true;
        var directions = [];
    
        if (this.controls.up.isDown) {
            this.sprite.y -= this.getMoveSpeed(0, 40 - this.speed);
            this.dir = "up";
            this.idle = false;
            directions.push("up");
        }
        //"else" here so if player acidently holds up and down they will just go up
        else if (this.controls.down.isDown) {
            this.sprite.y += this.getMoveSpeed(0, 45);
            this.dir = "down";
            this.idle = false;
            directions.push("down");
        }

        if (this.controls.left.isDown) {
            this.sprite.x -= this.getMoveSpeed(-10, 40);
            this.dir = "left";
            this.idle = false;
            directions.push("left");
        }
        //"else" here so if player acidently holds left and right they will just go left
        else if (this.controls.right.isDown) {
            this.sprite.x += this.getMoveSpeed(10, 40);
            this.dir = "right";
            this.idle = false;
            directions.push("right");
        }

        // calculate angle player is walking
        if (directions.includes("up") && directions.includes("left")) this.angle = 225;
        else if (directions.includes("up") && directions.includes("right")) this.angle = 315;
        else if (directions.includes("down") && directions.includes("left")) this.angle = 135;
        else if (directions.includes("down") && directions.includes("right")) this.angle = 45;
        else if (directions.includes("up")) this.angle = 270;
        else if (directions.includes("down")) this.angle = 90;
        else if (directions.includes("left")) this.angle = 180;
        else if (directions.includes("right")) this.angle = 0;
        //#endregion movement

        //# region Joystick Movement
        if (scene.joyStick.angle != 0) {
            let Joyangle = Phaser.Math.DegToRad(scene.joyStick.angle);
            const velocityX = Math.cos(Joyangle) * this.speed;
            const velocityY = Math.sin(Joyangle) * this.speed;
            this.sprite.x += velocityX;
            this.sprite.y += velocityY;
            console.log(scene.joyStick.angle);
            if (scene.joyStick.angle > 45 && scene.joyStick.angle < 135) this.dir = "down";
            else if (scene.joyStick.angle > 135 || scene.joyStick.angle < -135) this.dir = "left";
            else if (scene.joyStick.angle > -135 && scene.joyStick.angle < -45) this.dir = "up";
            else if (scene.joyStick.angle > -45 || scene.joyStick.angle < 45) this.dir = "right";

            this.idle = false;
        }
        //#endregion Joystick Movement
        
        // #region animation
        // set player animation
        // replaces "left" dir with "right" animation because it's just mirred right
        if (!this.attacking) {
            var anim = `${this.idle ? "idle" : "walk"}_${this.dir == "left" ? "right" : this.dir}`;
            if (this.sprite.anims.currentAnim.key != anim) this.sprite.play(anim);

            if (this.dir == "left") this.sprite.flipX = true;
            if (this.dir == "right") this.sprite.flipX = false;

            this.MeleeHithox.x = -100;
            this.MeleeHithox.y = -100;
        }
        //#endregion animation

        // #region fire
        var properties = scene.getTileProperties(this.sprite.x, this.sprite.y + 30 - this.speed);
        if (properties.fire) {
            this.onFire = true;
            this.fireTick = Date.now();
            
            if (!this.fireEmitter) {
                this.fireParticles = scene.add.particles('fire');
                this.fireEmitter = this.fireParticles.createEmitter({ x: this.sprite.x, y: this.sprite.y + 30, speed: 100, lifespan: 300, alpha: { start: 0.6, end: 0 } });
            }

        }

        if (this.onFire && Date.now() - this.fireTick > 2000) {
            this.onFire = false;
            this.fireParticles.destroy()
            this.fireEmitter = undefined
        }

        if (this.onFire) {
            this.fireEmitter.setPosition(this.sprite.x, this.sprite.y + 30);
        }
        //#endregion fire

    }

    getMoveSpeed(xTileOffset, yTileOffset) {
        let scene = this.scene;

        // freeze player if attacking
        if (freezeMelee && this.attacking) return 0;

        var properties = scene.getTileProperties(this.sprite.x + xTileOffset, this.sprite.y + yTileOffset);
        if (properties.solid) return 0;
        if (properties.speed) return Math.max(properties.speed + this.speed, minSpeed)
        
        return this.speed;
    }

    //TOUCH CONTROL FUNCTIONS
    startDrag(pointer){
        isDrag = true;
        startDragPos = {
            x: pointer.x,
            y: pointer.y
        };
    }
    drag(pointer){
        if(isDrag){
            var deltaX = pointer.x - startDragPos.x;
            var deltaY = pointer.y - startDragPos.y;
        }
    }
    stopDrag(){
        isDrag = false;
    }
    

}
