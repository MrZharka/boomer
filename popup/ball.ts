const XLIMITLOW = -100;
const XLIMITHIGH = 800;
const YLIMITLOW = -100;
const YLIMITHIGH = 600;

class Ball{
    private radius: number;
    private speed: number = 120;
    private color:string = "orange";
    private x: number;
    private y: number;
    private dirX: number = 0;
    private dirY: number = 0;
    private lastDirX:number = 1;
    private lastDirY:number = 0;
    private dead:boolean = false;
    private type:string = "";
    
    // for shooting cooldown.
    private lastShot:number = 0
    private shootCd:number = 0.2 //...in s.

    // nuke power-up.
    private megaBombCd:number = 20;
    private megaBombprogress = 0;

    constructor(type:string, x:number = 0, y:number = 0, radius: number = 20){
        this.type = type;
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    getType():string{
        return this.type;
    }
    getX():number{
        return this.x;
    }
    getY():number{
        return this.y;
    }
    getDirX():number{
        return this.dirX;
    }
    getDirY():number{
        return this.dirY;
    }
    getRadius():number{
        return this.radius;
    }
    setRadius(radius:number){
        if(radius > 0){
            this.radius = radius;
        }else{
            console.log("radius must be positiv none zero");
        }
    }
    setDirection(x:number, y:number){
        if(this.dirX != 0 || this.dirY != 0){
            this.lastDirX = this.dirX;
            this.lastDirY = this.dirY;
        }
        if(x === 0 && y === 0){
            this.dirX = x;
            this.dirY = y;
        }else{
            this.dirX = x/Math.sqrt(x*x + y*y);
            this.dirY = y/Math.sqrt(x*x + y*y);
        }
    }
    setSpeed(speed:number){
        this.speed = speed;
    }
    setColor(color:string){
        this.color = color;
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
        const b = new Ball("bullet", this.x, this.y, 4);
        b.setDirection(this.lastDirX, this.lastDirY);
        b.setSpeed(500);
        b.setColor("gold");
        bulletArr.push(b);
        const audio = new Audio("audio/blast.mp3");
        audio.volume = .2;
        audio.play();
        this.lastShot = this.shootCd;
    }
    kill(){
        this.dead = true;
        document.dispatchEvent(new Event("bulletOOR"));
    }
    deathAnimation(packs:Array<ParticlePack>){
        const pp = new ParticlePack(this.x, this.y);
        packs.push(pp);
        let audio: HTMLAudioElement;
        if(this.type === "player"){
            audio = new Audio("audio/player_explosion.mp3");
        }else if(this.type === "enemy"){
            audio = new Audio("audio/enemy_explosion.mp3");
        }
        audio.volume = .5;
        audio.play();
    }
    isdead(){
        return this.dead;
    }

    update(deltaTime: number){
        if(!this.dead){
            this.moveInDirection(this.dirX, this.dirY, deltaTime);
            this.lastShot -= deltaTime;    
        }

        if(this.x < XLIMITLOW || this.x > XLIMITHIGH || this.y < YLIMITLOW || this.y > YLIMITHIGH){
            this.kill();
        }
    }

    moveInDirection(dirX:number, dirY:number, deltaTime:number){
        this.x += dirX*this.speed * deltaTime;
        this.y += dirY*this.speed*deltaTime;
    }

    draw(ctx: CanvasRenderingContext2D){
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";
        if(this.type === "enemy"){
            const t = Date.now()/1000;
            const r = 255*Math.abs(Math.sin(t));
            const g = 255*Math.abs(Math.sin(t+30));
            const b = 255*Math.abs(Math.sin(t+45));
            this.color = `rgb(${r}, ${g}, ${b})`;
            ctx.strokeStyle = `rgb(${g}, ${b}, ${r})`;
        }
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();    
    }
}