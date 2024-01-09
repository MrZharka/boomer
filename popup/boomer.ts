let keyUp: boolean = false;
let keyDown: boolean = false;
let keyLeft: boolean = false;
let keyRight: boolean = false;
let keyShoot: boolean = false;

enum GameState{
    Menu, Game, Testing
}

document.addEventListener("keydown", handleInputEvent);
document.addEventListener("keyup", handleInputEvent);
document.addEventListener("bulletOOR", bulletOOREvent);

const c: HTMLCanvasElement = 
    document.getElementById("board") as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = c.getContext("2d") as CanvasRenderingContext2D;
const SCENECHANGETIME:number = 1;
let player: Ball;
let score: number = 0;
let scoreText: UIText;
let gameOverText: UIText;

let balls: Array<Ball> = [];
let enemies: Array<Ball> = [];
let spawnPositions: Array<Ball> = [];
let spawnTimer:number = 3;
let spawnTime:number = 10;
let level:number = 0;
let state: GameState = GameState.Game;
let sceneChangeTimer:number = SCENECHANGETIME;

function initialize(){
    player = new Ball("player", 320, 240, 20);
    balls = [player];
    enemies = [];
    createSpawnPoints();
    spawnTimer = 3;
    score = 0;
    scoreText = new UIText(`SCORE`, 10,30);
    scoreText.setAlignment("start");
    gameOverText = new UIText(`FINAL SCORE`, 320, 220);
    gameOverText.hide = true;
    level = 0;
    state = GameState.Testing;
    sceneChangeTimer = SCENECHANGETIME;
    if(state === GameState.Testing){
        initTesting();
    }
}

function initTesting(){
    const e = new Ball("enemy", 320, 100, 20);
    enemies.push(e);
    balls.push(e);
}

function testing(dt: number){
    sceneChangeTimer -= dt;
    if(keyShoot && enemies.length === 0){
        initTesting();
    }
    playerMovement();
    balls.forEach(ball => {
        ball.update(dt);
        const type = ball.getType();
        if(type==="bullet"){
            enemies.forEach((e) => {
                if(checkBallCollision(ball, e)){
                    ball.kill();
                    e.kill();
                    setScore(score+10);
                }
            });
        }
        else if(type==="player"){
            keepPlayerOnBoard(dt);
            enemies.forEach((e) => {
                if(checkBallCollision(player, e)){
                    player.kill();
                }
            });
        }
    });
}

let lastFrame: number = 0;
function update(timeStamp: number){
    const dt: number = (timeStamp-lastFrame)/1000;
    if(state === GameState.Game){
        gameLoop(dt);
    }else if(state === GameState.Menu){
        gameOver(dt);
    }else if(state === GameState.Testing){
        testing(dt);
    }
    draw();
    lastFrame = timeStamp;
    window.requestAnimationFrame(update);

}

function draw(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, c.width, c.height);
    balls.forEach(ball => {
        if (ball){
            ball.draw(ctx);
        }
    });
    scoreText.draw(ctx);
    gameOverText.draw(ctx);
}

function gameOver(dt: number){
    gameOverText.hide = false;
    scoreText.setText(score.toString());
    const y = gameOverText.getPosY();
    scoreText.setAlignment("center");
    scoreText.setPosition(320,y+30);
    sceneChangeTimer -= dt;
    if(keyShoot && sceneChangeTimer <= 0){
        initialize();
    }
}

function gameLoop(dt: number){
    if(player.isdead()){
        setState(GameState.Menu);
        state = GameState.Menu;
    }

    spawnTimer -= dt;
    if(spawnTimer <= 0){
        nextLevel();
        spawnTimer = spawnTime;
    }

    sceneChangeTimer -= dt;
    playerMovement();
    enemies.forEach((e)=>e.setDirection(player.getX()-e.getX(), player.getY()-e.getY()));

    balls.forEach(ball => {
        ball.update(dt);
        const type = ball.getType();
        if(type==="bullet"){
            enemies.forEach((e) => {
                if(checkBallCollision(ball, e)){
                    ball.kill();
                    e.kill();
                    setScore(score+10);
                }
            });
        }
        else if(type==="player"){
            keepPlayerOnBoard(dt);
            enemies.forEach((e) => {
                if(checkBallCollision(player, e)){
                    player.kill();
                }
            });
        }
    });
}

function playerMovement(){
    let dirX: number = 0; let dirY: number = 0;
    if(keyUp){
        dirY -= 1;
    }
    if(keyDown){
        dirY += 1;
    }
    if(keyLeft){
        dirX -= 1;
    }
    if(keyRight){
        dirX += 1;
    }
    if(keyShoot && sceneChangeTimer <= 0){
        player.shoot(balls);
    }
    player.setDirection(dirX, dirY);

}
function setState(state: GameState){
    this.state = state;
    sceneChangeTimer = SCENECHANGETIME;
}

function setScore(score:number){
    this.score = score;
    scoreText.setText(`${this.score}`);
}

function nextLevel(){
    level += 1;
    const spawnAmount:number = 10 + Math.floor(level/3);
    const spawnSpeed:number = 40 + 10 * Math.floor(level/5);
    spawnEnemies(spawnAmount, spawnSpeed);
}
function spawnEnemies(amount:number, speed:number){
    for(let n = 0; n < amount; ++n){
        const spawnp = spawnPositions[Math.floor(Math.random()*spawnPositions.length)];
        const enemy: Ball = new Ball("enemy", spawnp.getX(), spawnp.getY());
        enemy.setColor("red");
        enemy.setSpeed(speed);
        enemies.push(enemy);
        balls.push(enemy);
    }
}

function createSpawnPoints(){
    for(let x = 0; x < 640; x+=40){
        spawnPositions.push(new Ball("spawner", x, -40, 20));
        spawnPositions.push(new Ball("spawner", x, 520, 20));
    }
    for(let y = 0; y < 480; y+=40){
        spawnPositions.push(new Ball("spawner", -40, y, 20));
        spawnPositions.push(new Ball("spawner", 680, y, 20));
    }
}

function keepPlayerOnBoard(deltaTime:number){
    const x = player.getX();
    const y = player.getY();
    const dirX = player.getDirX();
    const dirY = player.getDirY();
    const rad = player.getRadius();
    if(x-rad < 0 || x+rad > 640){
        player.moveInDirection(-dirX, 0, deltaTime);
    }
    if(y-rad < 0 || y+rad > 480){
        player.moveInDirection(0, -dirY, deltaTime);
    }
}

function checkBallCollision(b1:Ball, b2:Ball){
    const b1X = b1.getX();
    const b1Y = b1.getY();
    const b2X = b2.getX();
    const b2Y = b2.getY();
    const distance = Math.sqrt(Math.pow(b2X-b1X,2) + Math.pow(b2Y-b1Y, 2));
    if(distance < b1.getRadius()+b2.getRadius()){
        return true;
    }
}

function handleInputEvent(ev: KeyboardEvent){
    if(ev.key === "w"){
        keyUp = ev.type === "keydown";
    }
    if(ev.key === "a"){
        keyLeft = ev.type === "keydown";
    }
    if(ev.key === "s"){
        keyDown = ev.type === "keydown";
    }
    if(ev.key === "d"){
        keyRight = ev.type === "keydown";
    }
    if(ev.key === "k"){
        keyShoot = ev.type === "keydown";
    }
}
function bulletOOREvent(ev:Event){
    let blist:Array<Ball> = [];
    let elist:Array<Ball> = [];
    blist = balls.filter((b) => !b.isdead());
    elist = enemies.filter((e) => !e.isdead());
    balls = blist;
    enemies = elist;
}

initialize();
window.requestAnimationFrame(update);