
var gameSettings = {
    level: 1,
    maxLevel: 2,
    playerShotLaser: 1,

    system: {
        arrowCountDown: 10,
        arrowMaxDamage: 20,
    },
    graphics:{
        archery_bow_distance: 30
    }
};


var config = {
    type: Phaser.AUTO,
    width: 600,
    height: 600,
    view:{
        width:1000,
        height:1000
    },
    parent: 'app',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    offsetScene: 50
};

var game = new Phaser.Game(config);

var player, cursors;

var maxHealt = 100;

var zombies, zombieCount = 1;

var skor = 0, skorText, rekorSkorText;

var lasers;

var fireBombs;

var healthPack, arrowPacket;

const music = {
    background: null
};


function preload ()
{
    
    this.load.image('background','assets/tile.jpg');
    this.load.image('healthBar','assets/healtbar.png');
    this.load.image('healthBarZombi','assets/healthbar_2.png');
    this.load.image('laser','assets/laser.png');
    this.load.image('ixir','assets/ixir.png');
    this.load.image('bomb','assets/bomb.png');

    this.load.image('archery_bow','assets/archery_bow.png');


    /** arayüz */
    this.load.image('play_button','assets/play_button.png');

    /** particlue */

    this.load.image('particleFireTexture','assets/particle_fire.png');
    this.load.image('particleDestroyTexture','assets/particle_destroy.png');


    /** oklar */
    this.load.image('arrow_level1_1','assets/arrow_level1_1.png');
    this.load.image('arrow_level1_2','assets/arrow_level1_2.png');
    this.load.image('arrow_level1_3','assets/arrow_level1_3.png');
    this.load.image('arrow_level2_1','assets/arrow_level2_1.png');
    this.load.image('arrow_level2_2','assets/arrow_level2_2.png');
    this.load.image('arrow_level2_3','assets/arrow_level2_3.png');


    this.load.image('image_circle','assets/image_circle.png');


    this.load.spritesheet('dude', 
    'assets/dude.png',
    { frameWidth: 32, frameHeight: 48 }
    );

    this.load.spritesheet('zombi', 
    'assets/zombi.png',
    { frameWidth: 32, frameHeight: 80 }
    );


   
    this.input.setDefaultCursor('url(assets/cursor2.png), auto');


    /** ses dosyaları */

    this.load.audio('backgroundMusic', 'assets/background.mp3');
    this.load.audio('arrow_sound', 'assets/arrow_sound.mp3');
    this.load.audio('coin_sound', 'assets/coin_sound.mp3');
    this.load.audio('tick_sound', 'assets/tick_sound.mp3');

    this.load.audio('expo', 'assets/expo.mp3');
    
    this.load.audio('expo', 'assets/expo.mp3');
    this.load.audio('expo_fire', 'assets/expo_fire.mp3');


    this.load.audio('zombi_death', 'assets/zombi_death.mp3');
}


function create ()
{

    /** ses dosyası */
    

    music.background = this.sound.add('backgroundMusic');
    music.background.play({ loop: true });
    music.background.setVolume(0.2);

    this.add.image(0, 0, 'background').setOrigin(0);


    player = this.physics.add.sprite(
        0,0, 
    'dude');

    player.x = config.view.width / 2 - player.width / 2;
    player.y = config.view.height  / 2 - player.height / 2; 


    player.archery_bow = this.physics.add.sprite(
        player.x + 40, player.y, 
    'archery_bow');

    player.archery_bow.setScale(.5);
    player.archery_bow.body.allowGravity = false;

    player.isDied = false;

    player.setBounce(0.2);

    player.body.allowGravity = false;
    
  // hareketleri dünya ile sınırla
    player.setCollideWorldBounds(false);
  
    player.health = maxHealt;


    player.healthBar = this.add.sprite(player.x, player.y - 30, 'healthBar').setOrigin(0.5, 0);


    player.damage = playerDamage.bind(this);
   
    
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });


    this.anims.create({
        key: 'zombi_move',
        frames: [{key:'zombi', frame:4}],
        frameRate: 1,
        repeat: -1
    });

 



    // Canavarlar için yeni bir grup oluştur
    zombies = this.physics.add.group();
    
    this.physics.world.enable(zombies);

    monsterItem = monsterItem.bind(this);

    monsterItem();
  
     this.physics.add.collider(zombies);
     this.physics.add.collider(player, zombies, hitZombi);


     lasers = this.physics.add.group();

     this.physics.world.enable(lasers);
     this.physics.add.collider(lasers, zombies, hitZombiWithLaser.bind(this));


     /** sağlık kiti */
     healthPack = this.physics.add.group();
     
     this.physics.world.enable(healthPack);

     this.physics.add.collider(player, healthPack, hitHealthPack);


     /** ok kalibresi */

     arrowPacket = this.physics.add.group();
     this.physics.world.enable(arrowPacket);
     this.physics.add.collider(player, arrowPacket, hitArrowPacket);


     /** bombalar */

     fireBombs = this.physics.add.group();
     this.physics.world.enable(fireBombs);
     this.physics.add.collider(fireBombs, zombies, hitZombiWithBomb.bind(this));


    /** hareketler W A S D */
    cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

   
    this.cameras.main.setBounds(0, 0, config.view.width, config.view.height);
    


    this.cameras.main.startFollow(player, true, 0.08, 0.08);
    //this.cameras.main.setZoom(1.5);
    this.cameras.main.setFollowOffset(-player.width/2, -player.height/2);

    // kamerayı ortalar
    this.cameras.main.setViewport(0, 0, config.width,config.height);

     /** skor tablosu */  

     skorText = this.add.text(10, 10, 'Skor: 0', { fontSize: '32px', fill: '#FFF' }).setScrollFactor(0);

     // rekor tablosunun yenilenmesi
     skorRecorTableReload.bind(this).call();    


    // listen to mouse click
    this.input.on('pointerdown', fireLaser, this);


    monsterGenerate = monsterGenerate.bind(this);


    /** ok paketi gönder */
    this.time.addEvent({
        delay: 10000, // her 10 saniyede bir
        loop: true,
        callback: () => {
          addArrowPacket.call(this);
        }
    });


    setSkor = setSkor.bind(this);



    /** imza */
    let text = this.add.text(0, 0, 'Geliştirici: github/byrktrgrkm', { fontSize: '18px', fill: '#FFF' })
    text.x = config.view.width - text.width;
    text.y = config.view.height - text.height;
}

function skorRecorTableReload(){
    if( database.getScore() != 0 ){
        rekorSkorText = this.add.text(0, 10, 'Rekor: ' + database.getScore(), { fontSize: '18px', fill: '#FFF' }).setScrollFactor(0);
        rekorSkorText.x = config.width - rekorSkorText.width - 20;
    }
}

function grafik_ayarlari(){

    skorText.setVisible(false);

    let strText;
    if(skor > database.getScore()){

        if(database.getScore() == 0){
            strText =  `Puanın : ${skor}`;
        }else{
            strText = `Rekor Puan: ${skor}, Önceki Rekor: ${database.getScore()}`;
        }
        database.setScore(skor);
    }else{
        strText =  `Puanın : ${skor}`;
    }

    this.add.text(
        this.cameras.main.centerX, this.cameras.main.centerY - 50, 
        strText, 
        { fontFamily: 'Arial', fontSize: '32px', fill: '#fff' }
    ).setScrollFactor(0)
    .setOrigin(0.5);


    let message = this.add.text(
        this.cameras.main.centerX, this.cameras.main.centerY, 
        "Öldün. Tekrar oynamak için tıkla", 
        { fontFamily: 'Arial', fontSize: '32px', fill: '#fff' }
    ).setScrollFactor(0);
    message.setOrigin(0.5);
    
 

    let restartButton = this.add
    .sprite(this.cameras.main.centerX, this.cameras.main.centerY + 100, 'play_button')
    .setScrollFactor(0);
    restartButton.setScale(.5);
    restartButton.setOrigin(0.5);
    restartButton.on('pointerdown', restartGame.bind(this), this);
    restartButton.setInteractive();

}
function restartGame() {
    // Müzik dosyalarını durdurun ve bellekten kaldırın
    this.sound.pauseAll();
    this.sound.removeAllListeners();

      
    this.registry.destroy(); // destroy registry
    this.events.off(); // disable all active events
    this.scene.restart();


    /** rekor skor tablosunun yenilenmesi */    
}



window.addEventListener('resize', () => resizeGame(game));

if( isMobileDevice() ){
    setTimeout(() => {
        resizeGame(game);
    }, 200);
}


var lastFired = 0; // son ateşlenme zamanı
var fireRate = 500; // atış hızı (ms)


var lastBomb = 0;
var bombRate = 750;

function update (time)
{
    if(player.isDied) return;

   
    player.healthBar.x = player.x;
    player.healthBar.y = player.y - 40;

     /** karakterimin oku */
    // Calculate angle between archery bow and mouse pointer
    let angle = Phaser.Math.Angle.Between(player.x, player.y, this.input.mousePointer.worldX, this.input.mousePointer.worldY);

    // Calculate the new position of the archery bow based on the player's position, the distance between player and bow, and the angle
    let archery_bow_x = player.x + gameSettings.graphics.archery_bow_distance * Math.cos(angle);
    let archery_bow_y = player.y + gameSettings.graphics.archery_bow_distance * Math.sin(angle);

    // Set the position of the archery bow and rotate it to face the mouse pointer
    player.archery_bow.x = archery_bow_x;
    player.archery_bow.y = archery_bow_y;
    player.archery_bow.rotation = angle; // Add Math.PI / 2 radians (90 degrees) to adjust for sprite's orientation


    zombies.getChildren().forEach(function (zombi) {
        zombi.anims.play('zombi_move', true);
    
        var dx = player.x - zombi.x;
        if (dx < 0) {
            zombi.flipX = true;
        } else {
            zombi.flipX = false;
        }
    
        var distance = Phaser.Math.Distance.Between(zombi.x, zombi.y, player.x, player.y);
        if (distance < gameSettings.graphics.archery_bow_distance) {
            zombi.setVelocity(0);
        } else if (distance < 200) {
            this.physics.moveToObject(zombi, player, 50);
        } else {
            this.physics.moveToObject(zombi, player, 50);
        }
    
        zombi.healthBar.x = zombi.x;
        zombi.healthBar.y = zombi.y - 50;
        zombi.updateHealthBar();
    }.bind(this));



    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
    
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);
    
        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);
    
        player.anims.play('turn');
    }
    
    if (cursors.up.isDown)
    {
        player.setVelocityY(-160);
    
    }
    else if (cursors.down.isDown)
    {
        player.setVelocityY(160);
    
    }else{
        player.setVelocityY(0);
    
    }


    /** space tuşuna basarsa */

    if (player.x < 0 + config.offsetScene) {
        player.x = 0 + config.offsetScene;
        player.setVelocityX(0);
    }
    if (player.y < 0 + config.offsetScene) {
        player.y = 0 + config.offsetScene;
        player.setVelocityY(0);
    }
    if (player.x > config.view.width - config.offsetScene) {
        player.x = config.view.width - config.offsetScene;
        player.setVelocityX(0);
    }
    if (player.y > config.view.height - config.offsetScene) {
        player.y = config.view.height - config.offsetScene;
        player.setVelocityY(0);
    }


    // Zombilerin hareketleri ve animasyonları
    zombies.getChildren().forEach(function (zombi) {
        zombi.anims.play('zombi_move', true);

        var dx = player.x - zombi.x;
        if (dx < 0) {
            zombi.flipX = true;
        } else {
            zombi.flipX = false;
        }
        
        
        var distance = Phaser.Math.Distance.Between(zombi.x, zombi.y, player.x, player.y);
        if (distance < 50) {
            zombi.setVelocity(0);
          } else if (distance < 200) {
            this.physics.moveToObject(zombi, player, 50);
          } else {
            this.physics.moveToObject(zombi, player, 50);
          }

    }.bind(this));


    /** kamera paketi görüyor mu */

    arrowPacket.getChildren().forEach( (packet) =>{
        // Paket nesnesi ile kamera çakışırsa
        if (Phaser.Geom.Rectangle.Overlaps(packet.getBounds(), this.cameras.main.worldView )) {
            packet.kameraGoruyor = true;
        }else{
            packet.kameraGoruyor = false;
        }
     });

    /** bomba at */


    if(cursors.space.isDown){

        const currentTime = this.time.now;
        if (currentTime - lastBomb > bombRate) {
            
            fireBomb.bind(this).call();
          // lastProcessedTime değişkenini güncelliyoruz
          lastBomb = currentTime;
        }

    }


}





function setHealth(){
    player.healthBar.setCrop(0, 0, (player.health / maxHealt) * player.healthBar.width, player.healthBar.height);
}

function addHealth(health){
    player.health += health;
    if(player.health > maxHealt) player.health = maxHealt;
    setHealth();
}

function playerIsDied(){
    player.isDied = true;
    player.archery_bow.destroy();
    player.healthBar.destroy();
    player.destroy();

    grafik_ayarlari.bind(this).call();
}



function hitZombi(player, zombi) {

    if(Math.random() < .3){
        player.damage(2);
        setHealth();
    }

}



function setSkor(value){
    skor += parseInt(value);
    skorText.setText('Skor: ' + skor);

    zombieCount = Math.floor(skor / 30) + 1; 

    this.sound.play('coin_sound');
}


function playerDamage(damage){
    player.health -= damage;

    player.setTint(0xff0000);
    // 500 milisaniye sonra rengi eski haline döndür
    this.time.addEvent({
        delay: 200,
        callback: function() {
        player.clearTint(); // Karakterin rengini eski haline getir
        },
        callbackScope: this,
        loop: false
    });

    if(player.health < maxHealt && healthPack.countActive() == 0){
        addIxir.call(this);
    }
    

    if( player.health <= 0){
        // öldün 
        playerIsDied.bind(this).call();
    }
}


function fireLaser() {
    if(player.isDied) return;

    for(let i = 1; i <= gameSettings.playerShotLaser; i++){
  

        // Oyuncunun konumunda yeni bir lazer görüntüsü oluşturun


        /** pozisyonun hesaplanması */
    
        var laser = lasers.create(player.archery_bow.x, player.archery_bow.y, 'laser');

        laser.setTint(0x0000ff)

        // Lazer sprite'ının hızını fare göstericisinin yönüne doğru ayarlayın
        var angle = Phaser.Math.Angle.Between(player.x, player.y + (i * 20), this.input.mousePointer.worldX, this.input.mousePointer.worldY);
        var speed = 1000;
        laser.setVelocity(speed * Math.cos(angle), speed * Math.sin(angle));

        // Lazer sprite'ını 1 saniye sonra yok edin
        this.time.delayedCall(1000, function() {
            laser.destroy();
        }, [], this);


        this.sound.play('arrow_sound',{volume: .3})


          
    }
}


function hitZombiWithLaser(laser, zombi) {
    // destroy the laser sprite
    laser.destroy();

    // level gücüne göre hsarın yükselmesi
    let attackValue = gameSettings.level * 5 + gameSettings.playerShotLaser;
    // en fazla gameSettings.system.arrowMaxDamage vurabilir
    if(attackValue > gameSettings.system.arrowMaxDamage) 
        attackValue = gameSettings.system.arrowMaxDamage;


    zombi.attack(attackValue);
}


function hitHealthPack(player, healthPack) {
    healthPack.destroy(); // sağlık kiti sprite'ını yok et
    addHealth(25);
}

function hitArrowPacket(player, arrow) {
   /** özelliklerin entegrasyonu */
    
    gameSettings.level = arrow.packet.level;
    gameSettings.playerShotLaser = arrow.packet.playerShotLaser;

    /** paketin temizlenmesi */
    arrow.allDestroy();
}



function addIxir(){
    const pack = healthPack.create(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550), 'ixir');
    pack.setScale(.8);
    pack.body.allowGravity = false;
}

function addArrowPacket(){

    if(arrowPacket.countActive() > 0) return;
    
    const packet = nextPacket();

    const arrow = arrowPacket.create(
        Phaser.Math.Between(50, 750), 
        Phaser.Math.Between(50, 550), 
        packet.name
    );

    arrow.packet = packet;

    arrow.setScale(0.4)

    arrow.body.allowGravity = false;

    // geri sayım

    // Countdown text
    arrow.countdownText = this.add.text(arrow.x, arrow.y - 40, gameSettings.system.arrowCountDown, {
        fontSize: '24px',
        fill: '#ffffff'
    }).setOrigin(0.5);

    arrow.kameraGoruyor = false;

    arrow.countdown = this.time.addEvent({
        delay: 1000, // 1 saniye
        repeat: gameSettings.system.arrowCountDown - 1, // toplamda 10 saniye
        callback: () => {
            arrow.countdownText.setText(arrow.countdown.repeatCount);

            if(arrow.kameraGoruyor){
                this.sound.play("tick_sound");
            }


            if( arrow.countdown.repeatCount == 0){
                arrow.allDestroy();
            }
        }
    });

   

    arrow.allDestroy = () => {

        if(arrow.countdown){
            arrow.countdown.remove();
        }

        arrow.circle.destroy();
        arrow.countdownText.destroy();
        arrow.destroy();
    };

    // Red circle
    arrow.circle = this.add.image(arrow.x, arrow.y, 'image_circle');
    arrow.circle.setScale(0.6);
}

function nextPacket(){
    let level = 1, 
    shotLaser = 1;

    if(gameSettings.playerShotLaser >= 3){
        if(gameSettings.level + 1 < gameSettings.maxLevel){
            level = gameSettings.level + 1;
            shotLaser = 1;
        }else{
            shotLaser = 3;
        }
    }else{
        shotLaser = gameSettings.playerShotLaser + 1;
    }

    return {
        name: `arrow_level${gameSettings.level}_${gameSettings.playerShotLaser}`,
        level:level,
        playerShotLaser: shotLaser
    }
}



function monsterGenerate(){

   if(zombies.countActive() > 10) return; 

   for(let i = 0; i < zombieCount; i++){
       monsterItem();
   }
}

function monsterItem(){
    var x = Phaser.Math.Between(0, this.physics.world.bounds.width);
    var y = Phaser.Math.Between(0, this.physics.world.bounds.height);
    var zombi = zombies.create(x, y, 'zombi');
    //zombi.setScale(.8);
    zombi.body.allowGravity = false;

    zombi.health = 100;

    zombi.healthBar = this.add.sprite(zombi.x, zombi.y - 30, 'healthBarZombi').setOrigin(0.5, 0);
    zombi.healthBar.setCrop(0, 0, zombi.healthBar.width, zombi.healthBar.height);
    zombi.updateHealthBar = function () {
        zombi.healthBar.setCrop(0, 0, (zombi.health / 100) * zombi.healthBar.width, zombi.healthBar.height);
    }

    zombi.attack = (value) =>{
        zombi.health -= value;
        zombi.updateHealthBar();

        zombi.setTint(0xff0000);
        // 500 milisaniye sonra rengi eski haline döndür
        this.time.addEvent({
            delay: 500,
            callback: function() {
                zombi.clearTint(); // Karakterin rengini eski haline getir
            },
            callbackScope: this,
            loop: false
        });
        

        if(zombi.health <= 0){
            
            setSkor(10);
            monsterGenerate();
            zombi.allDestroy();
        }
    }

    zombi.allDestroy = () => {

        zombi.healthBar.destroy();
        zombi.destroy();

        /** zombi ölüm efekti */

        setTimeout(() => {
            
            let particles = this.add.particles('particleDestroyTexture');

            let emitter = particles.createEmitter({
                x: zombi.x,
                y: zombi.y,
                speed: { min: -800, max: 800 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.5, end: 0 },
                blendMode: 'ADD',
                lifespan: 500,
                gravityY: 800
            });
            
            this.time.delayedCall(500, function() {
               
                emitter.stop();
                particles.destroy();
                
            }, [], this);

            this.sound.play('zombi_death');

        }, 100);

     

        
    }
}


/** bomba işlemleri */

function fireBomb() {

    this.sound.play('expo_fire' ,{volume:.5});
  

    let bomb = fireBombs.create(player.x, player.y, 'bomb');
    let target = this.input.activePointer.positionToCamera(this.cameras.main);
    bomb.targetValue = target;

    this.physics.moveToObject(bomb, target, 500);
}


function hitZombiWithBomb(bomb, zombi){

    let particles = this.add.particles('particleFireTexture');

    let emitter = particles.createEmitter({
        x: bomb.x,
        y: bomb.y,
        speed: { min: -800, max: 800 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.5, end: 0 },
        blendMode: 'ADD',
        lifespan: 100,
        gravityY: 800
    });

    bomb.destroy();


    this.time.delayedCall(500, function() {
       
        emitter.stop();
        particles.destroy();
        
    }, [], this);

  
    /** patlama çapının hesaplanması */

        
    // Patlama alanındaki nesneleri belirleme
    let explosionArea = new Phaser.Geom.Circle(bomb.x, bomb.y, 100);
    let objectsInExplosionArea = overlapCircles(explosionArea, zombies.getChildren());

    // Hasar miktarını hesaplama ve uygulama
    objectsInExplosionArea.forEach(function(zombi) {
        let distance = Phaser.Math.Distance.Between(bomb.x, bomb.y, zombi.x, zombi.y);
        let damage = 100 - distance; // Patlamadan uzaklaştıkça hasar azalır
        if(damage > 0) {
            zombi.attack(Phaser.Math.Between(20, damage))
        }
    });

    this.sound.play('expo',{volume:.5});
}

function overlapCircles(expo, elements){
    /** api de sorun var yeniden oluşturdum */
    return elements.filter((item) => Phaser.Math.Distance.Between(expo.x, expo.y, item.x, item.y) <= expo.radius);
}

/** hesaplama işlemi */
function rotatePoint(point, pivot, angle, distance) {
    let radians = Phaser.Math.DegToRad(angle);
    let x = pivot.x + distance * Math.cos(radians);
    let y = pivot.y + distance * Math.sin(radians);
    return new Phaser.Geom.Point(x, y);
}