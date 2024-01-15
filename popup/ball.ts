const XLIMITLOW = -100;
const XLIMITHIGH = 800;
const YLIMITLOW = -100;
const YLIMITHIGH = 600;

enum BallType{
    Player,
    Enemy,
    Bullet,
    Spawner
};

class Ball{
    protected m_radius: number;
    protected m_speed: number = 120;
    protected m_color:string;
    protected m_x: number;
    protected m_y: number;
    protected m_dirX: number = 0;
    protected m_dirY: number = 0;
    protected m_shootDirX:number = 1;
    protected m_shootDirY:number = 0;
    protected m_lastDirX:number = 1;
    protected m_lastDirY:number = 0;
    protected m_dead:boolean = false;
    protected m_type:BallType;
    
    // for shooting cooldown.
    private lastShot:number = 0
    private shootCd:number = 0.2 //...in s.

    // nuke power-up.
    private megaBombCd:number = 20;
    private megaBombprogress = 0;

    constructor(type:BallType, x:number = 0, y:number = 0, radius: number = 20){
        this.m_type = type;
        this.m_x = x;
        this.m_y = y;
        this.m_radius = radius;
    }

    get type():BallType{
        return this.m_type;
    }

    get x():number{
        return this.m_x;
    }

    get y():number{
        return this.m_y;
    }

    get dirX():number{
        return this.m_dirX;
    }

    get dirY():number{
        return this.m_dirY;
    }

    get shootDirX():number{
        return this.m_shootDirX;
    }
    set shootDirX(x: number){
        if(x === 0 && this.m_shootDirY === 0){
            this.m_shootDirX = 0;
        }else{
            this.m_shootDirX = x/Math.sqrt(x*x + this.m_shootDirY*this.m_shootDirY);
        }
    }
    get shootDirY():number{
        return this.m_shootDirY;
    }
    set shootDirY(y: number){
        if(y === 0 && this.m_shootDirX === 0){
            this.m_shootDirY = 0;
        }else{
            this.m_shootDirY = y/Math.sqrt(this.m_shootDirX*this.m_shootDirX + y*y);
        }
    }
    get radius():number{
        return this.m_radius;
    }
    set radius(radius:number){
        this.m_radius = radius;
    }
    setDirection(x:number, y:number){
        if(this.m_dirX != 0 || this.m_dirY != 0){
            this.m_lastDirX = this.m_dirX;
            this.m_lastDirY = this.m_dirY;
        }
        if(x === 0 && y === 0){
            this.m_dirX = x;
            this.m_dirY = y;
        }else{
            this.m_dirX = x/Math.sqrt(x*x + y*y);
            this.m_dirY = y/Math.sqrt(x*x + y*y);
        }
    }
    setShootDirection(x:number, y:number){
        this.m_shootDirX = x/Math.sqrt(x*x + y*y);
        this.m_shootDirY = y/Math.sqrt(x*x + y*y);
    }
    get speed(){
        return this.m_speed;
    }
    set speed(speed:number){
        this.m_speed = speed;
    }
    get color(){
        return this.m_color;
    }
    set color(color:string){
        this.m_color = color;
    }

    megabomb(enemyArr:Array<Ball>, pcks:Array<ParticlePack>){ // Nuke all enemies.
        if(this.megaBombprogress < this.megaBombCd){
            return;
        }
        enemyArr.forEach(e => {
            e.kill();
            e.deathAnimation(pcks);
        });
        this.megaBombprogress = 0;
    }
    getMegaBombCd(){
        return this.megaBombCd;
    }
    getMegaBombProgress(){
        return this.megaBombprogress;
    }
    setMegaBombProgress(value:number){
        this.megaBombprogress = value;
        if(this.megaBombprogress > this.megaBombCd){
            this.megaBombprogress = this.megaBombCd;
        }
    }
    incMegaBombProgress(amount:number){
        this.setMegaBombProgress(this.megaBombprogress + amount);
    }

    shoot(bulletArr:Array<Ball>){
        if(this.lastShot > 0){
            return;
        }
        const b = new Bullet(this.m_x, this.m_y);
        b.setDirection(this.m_shootDirX, this.m_shootDirY);
        b.speed = 500;
        b.color = "gold";
        bulletArr.push(b);
        const audio = new Audio("audio/blast.mp3");
        audio.volume = .2;
        audio.play();
        this.lastShot = this.shootCd;
    }
    kill(){
        this.m_dead = true;
    }
    deathAnimation(packs:Array<ParticlePack>){
        const pp = new ParticlePack(this.m_x, this.m_y);
        packs.push(pp);
        let audio: HTMLAudioElement;
        if(this.type === BallType.Player){
            audio = new Audio("audio/player_explosion.mp3");
        }else if(this.type === BallType.Enemy){
            audio = new Audio("audio/enemy_explosion.mp3");
        }
        audio.volume = .5;
        audio.play();
    }
    get dead(){
        return this.m_dead;
    }

    update(deltaTime: number){
        if(!this.m_dead){
            this.moveInDirection(this.m_dirX, this.m_dirY, deltaTime);
            this.lastShot -= deltaTime;    
        }
    }

    moveInDirection(dirX:number, dirY:number, deltaTime:number){
        this.m_x += dirX*this.m_speed * deltaTime;
        this.m_y += dirY*this.m_speed*deltaTime;
    }

    draw(ctx: CanvasRenderingContext2D){
        ctx.fillStyle = this.m_color;
        ctx.beginPath();
        ctx.arc(this.m_x, this.m_y, this.m_radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();    
    }
}

class Bullet extends Ball{
    constructor(x:number, y:number){
        super(BallType.Bullet, x, y, 4);
    }
    update(dt: number){
        super.update(dt);
        if(this.x < XLIMITLOW || this.x > XLIMITHIGH || this.y < YLIMITLOW || this.y > YLIMITHIGH){
            this.kill();
        }
    }
    kill(){
        super.kill();
        document.dispatchEvent(new Event("onBulletDeath"));
    }
}

class Player extends Ball{
    constructor(x:number, y:number){
        super(BallType.Player, x, y, 20);
        this.color = "orange";
        this.speed = 120;
    }
    kill(){
        super.kill();
        document.dispatchEvent(new Event("onPlayerDeath"));
    }
}

class Enemy extends Ball{
    constructor(x:number, y:number){
        super(BallType.Enemy, x, y, 20);
    }
    draw(ctx: CanvasRenderingContext2D){
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";
        const t = Date.now()/1000;
        const r = 255*Math.abs(Math.sin(t));
        const g = 255*Math.abs(Math.sin(t+30));
        const b = 255*Math.abs(Math.sin(t+45));
        this.color = `rgb(${r}, ${g}, ${b})`;
        ctx.strokeStyle = `rgb(${g}, ${b}, ${r})`;
        super.draw(ctx);
    }
    kill(){
        super.kill();
        document.dispatchEvent(new CustomEvent("onEnemyDeath", {detail:{caller: this}}));
    }
}