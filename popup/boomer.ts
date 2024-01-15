enum KeyName{
    MoveUp = 0, MoveDown, MoveLeft, MoveRight,
    ShootUp, ShootDown, ShootLeft, ShootRight
};
const keys: Array<Boolean> = [false, false, false, false, false, false, false];
// let keyUp: boolean = false;
// let keyDown: boolean = false;
// let keyLeft: boolean = false;
// let keyRight: boolean = false;
// let keyShoot: boolean = false;
// let keyBomb: boolean = false;

enum GameState{
    Menu, Game, Testing
}

document.addEventListener("keydown", handleInputEvent);
document.addEventListener("keyup", handleInputEvent);
document.addEventListener("onPlayerDeath", onPlayerDeath);
document.addEventListener("onBulletDeath", onBulletDeath);
document.addEventListener("onEnemyDeath", onEnemyDeath);
document.addEventListener("ParticlePack done", particlePackDoneEvent);

const c: HTMLCanvasElement = 
    document.getElementById("board") as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = c.getContext("2d") as CanvasRenderingContext2D;
const SCENECHANGETIME:number = 1;
let score: number = 0;
let scoreText: UIText;
let gameOverText: UIText;
let megaBombText:UIText;

let objects: Map<BallType, Array<Ball>> = new Map();
let spawnPositions: Array<Ball> = [];
let particlePacks: Array<ParticlePack> = [];
let spawnTimer:number = 3;
let shortSpawnTime:number = 3;
let longSpawnTIme:number = 10;
let level:number = 0;
let state: GameState = GameState.Game;
let sceneChangeTimer:number = SCENECHANGETIME;

function initialize(){
    objects.set(BallType.Player, [new Player(320, 240)]);
    const player = objects.get(BallType.Player)[0];
    objects.set(BallType.Enemy, []);
    objects.set(BallType.Bullet, []);
    createSpawnPoints();
    spawnTimer = shortSpawnTime;
    score = 0;
    scoreText = new UIText(`SCORE`, 10,30);
    scoreText.setAlignment("start");
    gameOverText = new UIText(`FINAL SCORE`, 320, 220);
    gameOverText.hide = true;
    megaBombText = new UIText(`${player.getMegaBombProgress()} / ${player.getMegaBombCd()}`
    ,50, 60);
    level = 0;
    state = GameState.Game;
    sceneChangeTimer = SCENECHANGETIME;
}


let lastFrame: number = 0;
function update(timeStamp: number){
    const dt: number = (timeStamp-lastFrame)/1000;
    if(state === GameState.Game){
        gameLoop(dt);
    }else if(state === GameState.Menu){
        gameOver(dt);
    }
    draw();
    lastFrame = timeStamp;
    window.requestAnimationFrame(update);

}

function draw(){
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, c.width, c.height);
    objects.forEach(arr => {
        arr.forEach((obj: Ball) => obj.draw(ctx));
    });
    particlePacks.forEach(pp => pp.draw(ctx));
    scoreText.draw(ctx);
    megaBombText.draw(ctx);
    gameOverText.draw(ctx);
}

function gameOver(dt: number){
    gameOverText.hide = false;
    scoreText.setText(score.toString());
    const y = gameOverText.getPosY();
    scoreText.setAlignment("center");
    scoreText.setPosition(320,y+30);
    sceneChangeTimer -= dt;
    // if(keyShoot && sceneChangeTimer <= 0){
    //     initialize();
    // }
    particlePacks.forEach(pp=>pp.update(dt));
}

function aiStep(){
    let updatedEs:Array<Ball> = []
    objects.get(BallType.Enemy).forEach((e:Enemy) => {
        const player = objects.get(BallType.Player)[0];
        let wantedDirX = player.x-e.x;
        let wantedDirY = player.y-e.y;
        updatedEs.forEach((ue) => {
            const diffX = ue.x - e.x;
            const diffY = ue.y - e.y;
            if(diffX*diffX + diffY*diffY < 10*10){
                const angle = Math.PI/6;
                const newUeDirX = ue.dirX*Math.cos(angle)-ue.dirY*Math.sin(angle);
                const newUeDirY = ue.dirX*Math.sin(angle)+ue.dirY*Math.cos(angle);
                ue.setDirection(newUeDirX, newUeDirY);
                wantedDirX = wantedDirX*Math.cos(-angle)-wantedDirY*Math.sin(-angle);
                wantedDirY = wantedDirY*Math.sin(-angle)+wantedDirY*Math.cos(-angle);
            }
        });
        e.setDirection(wantedDirX, wantedDirY);
        updatedEs.push(e);
    });
}
function gameLoop(dt: number){
    spawnTimer -= dt;
    if(spawnTimer <= 0){
        nextLevel();
        spawnTimer = longSpawnTIme;
    }

    sceneChangeTimer -= dt;
    playerMovement();
    aiStep();
    objects.get(BallType.Player).forEach(p => {
        p.update(dt);
        keepPlayerOnBoard(dt);
        objects.get(BallType.Enemy).forEach(e => {
            if(checkBallCollision(p, e)){
                p.kill();
            }
        });
    });
    objects.get(BallType.Bullet).forEach(b => {
        b.update(dt);
        objects.get(BallType.Enemy).forEach(e => {
            if(checkBallCollision(b, e)){
                b.kill();
                e.kill();
            }
        });
    })
    objects.get(BallType.Enemy).forEach(e => {
        e.update(dt);
    });

    particlePacks.forEach(pp => pp.update(dt));
}

function playerMovement(){
    const player = objects.get(BallType.Player)[0];
    let dirX: number = 0; let dirY: number = 0;
    if(keys[KeyName.MoveUp]){
        dirY -= 1;
    }
    if(keys[KeyName.MoveDown]){
        dirY += 1;
    }
    if(keys[KeyName.MoveLeft]){
        dirX -= 1;
    }
    if(keys[KeyName.MoveRight]){
        dirX += 1;
    }
    player.shootDirX = 0;
    player.shootDirY = 0;
    let shouldShoot = false;
    if(keys[KeyName.ShootUp]){
        player.shootDirY = -1;
        shouldShoot = true;
    }
    if(keys[KeyName.ShootDown]){
        player.shootDirY = 1;
        shouldShoot = true;
    }
    if(keys[KeyName.ShootLeft]){
        player.shootDirX = -1;
        shouldShoot = true;
    }
    if(keys[KeyName.ShootRight]){
        player.shootDirX = 1;
        shouldShoot = true;
    }
    if(shouldShoot){
        player.shoot(objects.get(BallType.Bullet));
    }
    // if(keyShoot && sceneChangeTimer <= 0){
    //     player.shoot(objects.get(BallType.Bullet));
    // }
    // if(keyBomb && !(player.getMegaBombProgress() < player.getMegaBombCd())){
    //     setScore(score + objects.get(BallType.Enemy).length*10);
    //     player.megabomb(objects.get(BallType.Enemy), particlePacks);
    //     incPowerUpProgress(0);
    // }
    player.setDirection(dirX, dirY);

}
function setState(_state: GameState){
    state = _state;
    sceneChangeTimer = SCENECHANGETIME;
}

function setScore(_score:number){
    score = _score;
    scoreText.setText(`${score}`);
}

function incPowerUpProgress(amount:number){
    const player = objects.get(BallType.Player)[0];
    player.incMegaBombProgress(amount);
    megaBombText.setText(`${player.getMegaBombProgress()} / ${player.getMegaBombCd()}`);
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
        const enemy: Enemy = new Enemy(spawnp.x, spawnp.y);
        enemy.speed = speed;
        objects.get(BallType.Enemy).push(enemy);
    }
}

function createSpawnPoints(){
    for(let x = 0; x < 640; x+=40){
        spawnPositions.push(new Ball(BallType.Spawner, x, -40, 20));
        spawnPositions.push(new Ball(BallType.Spawner, x, 520, 20));
    }
    for(let y = 0; y < 480; y+=40){
        spawnPositions.push(new Ball(BallType.Spawner, -40, y, 20));
        spawnPositions.push(new Ball(BallType.Spawner, 680, y, 20));
    }
}

function keepPlayerOnBoard(deltaTime:number){
    const player = objects.get(BallType.Player)[0];
    const x = player.x;
    const y = player.y;
    const dirX = player.dirX;
    const dirY = player.dirY;
    const rad = player.radius;
    if(x-rad < 0 || x+rad > 640){
        player.moveInDirection(-dirX, 0, deltaTime);
    }
    if(y-rad < 0 || y+rad > 480){
        player.moveInDirection(0, -dirY, deltaTime);
    }
}

function checkBallCollision(b1:Ball, b2:Ball){
    if(b1.dead || b2.dead){
        return false;
    }
    const distance = Math.sqrt(Math.pow(b2.x-b1.x,2) + Math.pow(b2.y-b1.y, 2));
    if(distance < b1.radius+b2.radius){
        return true;
    }
}

function handleInputEvent(ev: KeyboardEvent){
    if(ev.key === "w" && !ev.repeat){
        keys[KeyName.MoveUp] = ev.type === "keydown";
    }
    if(ev.key === "a" && !ev.repeat){
        keys[KeyName.MoveLeft] = ev.type === "keydown";
    }
    if(ev.key === "s" && !ev.repeat){
        keys[KeyName.MoveDown] = ev.type === "keydown";
    }
    if(ev.key === "d" && !ev.repeat){
        keys[KeyName.MoveRight] = ev.type === "keydown";
    }
    if(ev.key === "i" && !ev.repeat){
        keys[KeyName.ShootUp] = ev.type === "keydown";
    }
    if(ev.key === "j" && !ev.repeat){
        keys[KeyName.ShootLeft] = ev.type === "keydown";
    }
    if(ev.key === "k" && !ev.repeat){
        keys[KeyName.ShootDown] = ev.type === "keydown";
    }
    if(ev.key === "l" && !ev.repeat){
        keys[KeyName.ShootRight] = ev.type === "keydown";
    }
}

function onPlayerDeath(ev: Event){
    objects.get(BallType.Player)[0].deathAnimation(particlePacks);
    objects.set(BallType.Player, []);
    setState(GameState.Menu);
}
function onBulletDeath(ev: Event){
    const blist:Array<Ball> = objects.get(BallType.Bullet).filter(b => !b.dead);
    objects.set(BallType.Bullet, blist);

}
function onEnemyDeath(ev: CustomEvent){
    const enemy: Enemy = ev.detail.caller;
    enemy.deathAnimation(particlePacks);
    setScore(score+10);
    incPowerUpProgress(1);
    const elist:Array<Ball> = objects.get(BallType.Enemy).filter(e => !e.dead);
    objects.set(BallType.Enemy, elist);
}
function particlePackDoneEvent(ev:Event){
    let pplist:Array<ParticlePack> = [];
    pplist = particlePacks.filter((pp) => !pp.isDone());
    particlePacks = pplist;
}

initialize();
window.requestAnimationFrame(update);