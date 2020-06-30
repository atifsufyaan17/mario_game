let config={
    type:Phaser.AUTO,
    scale:{
        mode:Phaser.Scale.FIT,
        width:1350,
        height:600,
    },
    backgroundColor:0xfff11,
    physics:{
        default:'arcade',
        arcade:{
            gravity:{
                y:1000,
            },
            debug:false,
        }
    },
    scene:{
        preload:preload,
        create:create,
        update:update,
    },
};

let game = new Phaser.Game(config);

let player_config = {
    player_speed:200,
    jump_speed:700,
}

function preload(){
    this.load.image("ground","Assets/topground.png");
    this.load.image("background","Assets/background.png");
    this.load.spritesheet("player","Assets/dude.png",{frameWidth:32,frameHeight:48});
    this.load.image("apple","Assets/apple.png");
    this.load.image("ray","Assets/ray.png");
    this.load.image("tree","Assets/tree.png");
    this.load.image("grass","Assets/grass.png");
    this.load.image("tube","Assets/tube.png");
}

function create(){
    W=game.config.width;
    H=game.config.height;
   
    let tree = this.add.sprite(1000,245,'tree');

    let ground = this.add.tileSprite(0,H-128,W,128,'ground');
    ground.setOrigin(0,0);    
    // ground.body.allowGravity=false;
    // ground.body.immovable=true;
    this.physics.add.existing(ground,true);
    
    let background = this.add.sprite(0,0,'background');
    background.setOrigin(0,0);
    background.displayWidth=W;
    background.displayHeight=H;
    background.depth=-2;

    this.player = this.physics.add.sprite(100,100,'player',4);
    // this.physics.add.collider(ground,this.player);

    let fruits = this.physics.add.group({
        key:'apple',
        repeat:12,
        setScale:{x:0.2,y:0.2},
        setXY:{x:10,y:0,stepX:100},
    })
    // this.physics.add.collider(ground,fruits);

    let tube = this.physics.add.staticGroup({
        key:'tube',
        repeat:1,
        setScale:{x:0.2,y:0.2},
        setXY:{x:W,y:350},
    })

    let platforms = this.physics.add.staticGroup();
    platforms.create(500,350,'ground').setScale(2,0.5).refreshBody();    
    platforms.create(700,200,'ground').setScale(2,0.5).refreshBody();
    platforms.create(100,200,'ground').setScale(2,0.5).refreshBody();
    platforms.create(1000,350,'grass').setScale(2,0.5).refreshBody();
    platforms.add(ground);
    this.physics.add.collider(platforms,fruits);
    this.physics.add.collider(platforms,this.player);

    //adding bounce property
    this.player.setBounce(0.5);
    fruits.children.iterate(function(f){
        f.setBounce(Phaser.Math.FloatBetween(0.4,0.7));
    })

    //keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();

    //player animations
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player',{start:0,end:3}),
        frameRate: 10,
        repeat: -1,
    });
    this.anims.create({
        key: 'center',
        frames: this.anims.generateFrameNumbers('player',{start:4,end:4}),
        frameRate: 10,
        repeat: -1,
    })
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player',{start:5,end:8}),
        frameRate: 10,
        repeat: -1,
    })

    //disappear on overalapping
    this.physics.add.overlap(this.player,fruits,eatFruit,null,this);
    this.physics.add.overlap(this.player,tube,over,null,this);

    //preventing the player from going out
    this.player.setCollideWorldBounds(true);

    //camera and zoom
    this.cameras.main.setBounds(0,0,W,H);
    this.physics.world.setBounds(0,0,W,H);
    this.cameras.main.startFollow(this.player,true,true);
    this.cameras.main.setZoom(1.5);

    //sunset theme
    let rays=[];
    for(i=-10;i<=10;i++){
        let ray = this.add.sprite(W/2,H-100,'ray');
        ray.displayHeight=1.5*H;
        ray.setOrigin(0.5,1);
        ray.alpha=0.2;
        ray.angle=i*20;
        ray.depth=-1;
        rays.push(ray);
    }
    this.tweens.add({
        targets:rays,
        props:{
            angle:{
                value:"+=20",
            },
        },
        duration:8000,
        repeat:-1,
    })
}

function update(){
    if(this.cursors.left.isDown){
        this.player.setVelocityX(-player_config.player_speed);
        this.player.anims.play('left',true);
    }
    else if(this.cursors.right.isDown){
        this.player.setVelocityX(player_config.player_speed);
        this.player.anims.play('right',true);
    }
    else{
        this.player.setVelocityX(0);
        this.player.anims.play('center',true);
    }

    if(this.cursors.up.isDown && this.player.body.touching.down){
        this.player.setVelocityY(-player_config.jump_speed);
    }

}
function eatFruit(x,y){
    y.disableBody(true,true);
}
function over(x,y){
    x.disableBody(true,true);
}