//POSSIBLE ANIMATIONS:
//'magister_castMagic'
//'magister_castSword'
//'magister_die'
//'magister_idle'
//'magister_teleport'
//'magister_magic'
//'magister_sword'
//'magister_magicTrail'
//'magister_swordTrail'

class Boss extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, health) {
        super(scene, x, y, health);
        this.scene = scene;
        this.health = health;
        this.convert = 0;
        this.seconds = 0;
        this.state = 'normal'; //different states: normal, enhanced, enraged.

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);
        this.body.setImmovable(true);
        this.body.onCollide = true;
        this.play('magister_idle');
        this.stunned = false;
        this.setScale(2.5);
        this.body.setSize(15, 15);
    }

    update(time, delta) {
        //convert miliseconds to seconds
        if(this.convert != 1000){
            this.convert += delta;
        }
        if(this.convert >= 1000){
            this.convert = 0;
            this.seconds+=1;
        }
        //end of conversion

        //set state
        if(this.health <= 75 && this.state == 'normal'){
            this.state = 'enhanced';
        }
        if(this.health <= 30 && this.state == 'enhanced'){
            this.state = 'enraged';
        }


        //#region States

        //#region Normal
        if(this.state == 'normal'){   
        }
        //#endregion Normal

        //#region Enhanced
        if(this.state == 'enhanced'){
            
        }
        //#endregion Enhanced

        //#region Enraged
        if(this.state == 'enraged'){
        }
        //#endregion Enraged
        //#endregion States
    }
}