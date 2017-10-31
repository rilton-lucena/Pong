var logo;
var ball;
var platform;
var botPlatform;
var livesText;
var tapText;
var infoText;

var battleStarted = false;
var preparingBattle = false;
var ballOnplatform = true;
var hitOnPlayer = true;
var platformHalfWidth;
var level = 1;
var round = 0;
var lives = 3;
var botReactionTime = 0.2;
var botSpeed = 0.2;
var botImprecision = 0;
var botPlatformDiffX = 0;
var ballSpeed = 300;
var maxLevel = 5;

var bossPerLevel = [
    {name:"White Boss", color:"0xffffff"},
    {name:"Red Boss", color:"0xFF445B"},
    {name:"Green Boss", color:"0x7ED321"},
    {name:"Blue Boss", color:"0x55A4FF"},
    {name:"Black Boss", color:"0x000000"}
];


function preload() {

    game.load.image('logo', 'assets/images/logo.png');
    game.load.image('white_platform', 'assets/images/white_platform.png');
    game.load.image('ball', 'assets/images/ball.png');
}

function create() {

    game.stage.backgroundColor = '0xD8D8D8';

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.checkCollision.down = false;
    game.physics.arcade.checkCollision.up = false;

    // TEXTS
    infoText = game.add.text(game.world.centerX, game.world.centerY, 'White Boss', { font: "64px 'Londrina Solid'", fill: "#BCBCBC", align: "center" });
    infoText.anchor.setTo(0.5, 0.5);
    infoText.alpha = 0;

    tapText = game.add.text(game.world.centerX, game.world.height - 150, 'tap to play', { font: "50px 'Londrina Solid'", fill: "#BCBCBC", align: "left" });
    tapText.anchor.setTo(0.5, 0.5);
    tapText.alpha = 0;
    var tween = game.add.tween(tapText).to( { alpha: 1 }, 700, "Linear", true, 0, -1);
    tween.yoyo(true, 700);

    livesText = game.add.text(-250, game.world.centerY - 20, 'Lives: ' + lives, { font: "72px 'Londrina Solid'", fill: "#BCBCBC", align: "left" });
    livesText.visible = false;


    // LOGO
    logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
    logo.anchor.setTo(0.5, 0.5);

    // PLATFORM
    platform = game.add.sprite(game.world.centerX, game.world.height - 50, 'white_platform');
    platform.anchor.setTo(0.5, 0.5);
    platformHalfWidth = platform.width * 0.5;

    game.physics.enable(platform, Phaser.Physics.ARCADE);

    platform.body.collideWorldBounds = true;
    platform.body.bounce.set(1);
    platform.body.immovable = true;
    platform.alpha = 0;

    // BOT PLATFORM
    botPlatform = game.add.sprite(game.world.centerX, 50, 'white_platform');
    botPlatform.anchor.setTo(0.5, 0.5);

    game.physics.enable(botPlatform, Phaser.Physics.ARCADE);

    botPlatform.body.collideWorldBounds = true;
    botPlatform.body.bounce.set(1);
    botPlatform.body.immovable = true;
    botPlatform.alpha = 0;

    // BALL
    ball = game.add.sprite(game.world.centerX - 29, platform.y - 45, 'ball');
    ball.anchor.set(0.5);
    ball.checkWorldBounds = true;
    ball.alpha = 0;

    game.physics.enable(ball, Phaser.Physics.ARCADE);

    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);
    ball.events.onOutOfBounds.add(ballLost, this);

    game.input.onDown.add(prepareBattle, this);

    // TIMER
    game.time.events.add(Phaser.Timer.SECOND * 0.5, updateBot, this);
}

function update () {

    if(!battleStarted) return;


    platform.x = game.input.x;

    if (platform.x < platformHalfWidth)
    {
        platform.x = platformHalfWidth;
    }
    else if (platform.x > game.width - platformHalfWidth)
    {
        platform.x = game.width - platformHalfWidth;
    }

    if (ballOnplatform)
    {
        ball.body.x = platform.x;
    }
    else
    {
        game.physics.arcade.collide(ball, platform, ballHitPlatform, null, this);
        game.physics.arcade.collide(ball, botPlatform, ballHitPlatform, null, this);
    }

    
}

function updateBot () {
    
    if(hitOnPlayer){

        var px = ball.body.x + botPlatformDiffX;
        if (px < platformHalfWidth)
        {
            px = platformHalfWidth;
        }
        else if (px > game.width - platformHalfWidth)
        {
            px = game.width - platformHalfWidth;
        }

    }

    game.add.tween(botPlatform).to( { x: px }, (botSpeed - level * 0.03) * 1000, Phaser.Easing.Exponential.Out, true);
    game.time.events.add(Phaser.Timer.SECOND * (botReactionTime - level * 0.03), updateBot, this);
}

function showSplash() {

    game.input.onDown.removeAll();
    game.input.onDown.add(prepareBattle, this);

    infoText.visible = false;

    tapText.alpha = 0;
    tapText.visible = true;

    // LOGO
    logo.visible = true;
    game.add.tween(logo).to( { alpha: 1 }, 500, "Linear", true);

}

function prepareBattle () {

    if(preparingBattle) return;

    preparingBattle = true;

    game.add.tween(logo).to( { alpha: 0 }, 500, "Linear", true);
    tapText.visible = false;

    changeBoss();

    game.add.tween(platform).to( { alpha: 1 }, 500, "Linear", true, 3500);
    game.add.tween(botPlatform).to( { alpha: 1 }, 500, "Linear", true, 3500);
    game.add.tween(ball).to( { alpha: 1 }, 500, "Linear", true, 4000);

    game.time.events.add(Phaser.Timer.SECOND * 4, startBattle, this);

}

function changeBoss() {

    game.add.tween(livesText).to( { x: -250 }, 500, Phaser.Easing.Back.Out, true);


    infoText.text = bossPerLevel[level-1].name;
    botPlatform.tint = bossPerLevel[level-1].color;
    
    infoText.y = game.world.centerY;
    infoText.alpha = 0;

    infoText.visible = true;
    game.add.tween(infoText).to( { alpha: 1 }, 1000, Phaser.Easing.Back.Out, true, 700);
    game.add.tween(infoText).to( { y: -100 }, 1000, Phaser.Easing.Back.Out, true, 2500);

    livesText.visible = true;
    game.add.tween(livesText).to( { x: 20 }, 500, Phaser.Easing.Back.Out, true, 3500);
}

function startBattle () {

    battleStarted = true;
    hitOnPlayer = true;
    preparingBattle = false;
    game.input.onDown.removeAll();

    if (ballOnplatform)
    {
        ballOnplatform = false;
        ball.body.velocity.y = -ballSpeed;
        ball.body.velocity.x = -75;
    }

}

function ballLost () {

    
    ballSpeed = 300;
    battleStarted = false;
    ballOnplatform = true;

    if(ball.body.y < 0){
        if(round+1 >= 1){
            level++;
            round = 0;
            if(level <= maxLevel){
                changeBoss();
                game.time.events.add(Phaser.Timer.SECOND * 4, function(){
                    game.input.onDown.add(startBattle, this);
                }, this);
            }
            else{
                gameOver(true);
            }
        }
        else{
            round++;
            game.input.onDown.add(startBattle, this);
        }
    }
    else{
        lives--;
        if(lives <= 0){
            gameOver();
        }
        else{
            game.input.onDown.add(startBattle, this);
        }
    }
    
    livesText.text = 'Lives: ' + lives;

    ball.reset(platform.x - 29, platform.y - 45);

}

function gameOver (_victory) {

    lives = 3;
    ballSpeed = 300;
    round = 0;
    level = 1;
    ball.body.velocity.setTo(0, 0);
    infoText.text = _victory ? "Congratulations!\nYou're Pong Master." : "Game Over";
    infoText.visible = true;
    infoText.y = game.world.centerY;

    livesText.visible = false;
    livesText.x = -250;

    platform.alpha = 0;
    botPlatform.alpha = 0;
    ball.alpha = 0;

    game.input.onDown.add(showSplash, this);
}   

function ballHitPlatform (_ball, _platform) {

    var diff = 0;

    if (_ball.x < _platform.x)
    {
        diff = _platform.x - _ball.x;
        _ball.body.velocity.x = (-10 * diff);
    }
    else if (_ball.x > _platform.x)
    {
        diff = _ball.x -_platform.x;
        _ball.body.velocity.x = (10 * diff);
    }
    else
    {
        _ball.body.velocity.x = 2 + Math.random() * 8;
    }

    ballSpeed += 10;
    hitOnPlayer = _platform == platform;
    ball.body.velocity.y = hitOnPlayer ? -ballSpeed : ballSpeed;
    botPlatformDiffX = Math.random() * botImprecision - Math.random() * botImprecision;

}
