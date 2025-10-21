let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  parent: 'game-container',
  backgroundColor: '#ffffff',
};

let game = new Phaser.Game(config);

function preload() {
  this.load.image("background", "assets/background.png");
  this.load.image("road", "assets/road.png");
  this.load.image("column", "assets/column.png");
  this.load.spritesheet("bird", "assets/bird.png", {
    frameWidth: 64,
    frameHeight: 96,
  });
}

var bird;
let hasLanded = false;
let hasBumped = false;
let isGameStarted = false;
let isGameOver = false;
let messageToPlayer;
let restartMessage;

function create() {
  const background = this.add.image(0, 0, "background").setOrigin(0, 0);
  const roads = this.physics.add.staticGroup();

  const topColumns = this.physics.add.staticGroup({
    key: "column",
    repeat: 1,
    setXY: { x: 200, y: 0, stepX: 300 },
  });

  const bottomColumns = this.physics.add.staticGroup({
    key: "column",
    repeat: 1,
    setXY: { x: 350, y: 400, stepX: 300 },
  });

  const road = roads.create(400, 568, "road").setScale(2).refreshBody();

  bird = this.physics.add.sprite(0, 50, "bird").setScale(2);
  bird.setBounce(0.2);
  bird.setCollideWorldBounds(true);

  this.physics.add.collider(bird, road, () => (hasLanded = true), null, this);
  this.physics.add.collider(bird, topColumns, () => (hasBumped = true), null, this);
  this.physics.add.collider(bird, bottomColumns, () => (hasBumped = true), null, this);

  cursors = this.input.keyboard.createCursorKeys();

   messageToPlayer = this.add.text(config.width / 2, config.height - 50, `Instructions: Press space bar to start`, {
    fontFamily: '"Comic Sans MS", Times, serif',
    fontSize: "20px",
    color: "white",
    backgroundColor: "black",
    align: "center"
  }).setOrigin(0.5, 0.5);

  restartMessage = this.add.text(config.width / 2, 20, ``, {
    fontFamily: '"Comic Sans MS", Times, serif',
    fontSize: "18px",
    color: "white",
    backgroundColor: "black",
  }).setOrigin(0.5, 0);
}

function update() {
  if (isGameOver) {
    if (cursors.space.isDown) {
      this.scene.restart();
      hasLanded = false;
      hasBumped = false;
      isGameStarted = false;
      isGameOver = false;
    }
    return;
  }

  if (cursors.space.isDown && !isGameStarted) {
    isGameStarted = true;
    messageToPlayer.text =
      'Instructions: Press the "^" button to stay upright\nAnd don\'t hit the barriers or ground';
  }

  if (!isGameStarted) {
    bird.setVelocityY(-160);
  }

  if (cursors.up.isDown && !hasLanded && !hasBumped) {
    bird.setVelocityY(-160);
  }

  if (isGameStarted && (!hasLanded || !hasBumped)) {
    bird.body.velocity.x = 50;
  } else {
    bird.body.velocity.x = 0;
  }

  // Crash condition
  if (hasLanded || hasBumped) {
    messageToPlayer.text = 'Oh no! You crashed!';
    restartMessage.text = 'Press space bar to restart';
    isGameOver = true;
  }

  // Win condition
  if (bird.x > 750) {
    bird.setVelocityY(40);
    messageToPlayer.text = 'Congrats! You won!';
    restartMessage.text = 'Press space bar to restart';
    isGameOver = true;
  }
}
