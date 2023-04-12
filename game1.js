var config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 700,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload () {
    this.load.setBaseURL('http://127.0.0.1:5500/');
    this.load.image('brick', 'assets/furnace_top.png');
}

function create () {
    //this.add.image(400, 300, 'sky');

    this.add.tileSprite(0, 0, 2400, 1400, 'brick');
}