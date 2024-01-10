class Particle{
    private xStart:number;
    private yStart:number;
    private x:number;
    private y:number;
    private dirX:number;
    private dirY:number;
    private speed:number = 150;
    private color:string;
    private radius:number=8;
    private lifeTime:number = 0.3;
    private lifeTimer:number = 0;
    private done:boolean = false;

    constructor(x:number, y:number, dirX:number, dirY:number){
        this.xStart = x;
        this.yStart = y;
        this.dirX = dirX;
        this.dirY = dirY;
        this.reset();
    }
    isDone(){
        return this.done;
    }
    reset(){
        this.x = this.xStart;
        this.y = this.yStart;
        this.lifeTimer = 0;
    }
    move(dt:number){
        this.x += this.dirX * this.speed * dt;
        this.y += this.dirY * this.speed * dt;
        
    }
    update(dt:number){
        this.lifeTimer += dt;
        if(this.lifeTimer >= this.lifeTime){
            this.done = true;
            this.reset();
        }
        this.move(dt);
    }
    draw(ctx:CanvasRenderingContext2D){
        ctx.lineWidth = this.radius;
        ctx.strokeStyle = "white";
        const t = Date.now()/1000;
        const r = 255*Math.abs(Math.sin(t));
        const g = 255*Math.abs(Math.sin(t+30));
        const b = 255*Math.abs(Math.sin(t+45));
        const a = 1-(this.lifeTimer/this.lifeTime);
        this.color = `rgb(${r} ${g} ${b} / ${a})`;
        ctx.strokeStyle = `rgb(${g} ${b} ${r} / ${a})`;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
}

class ParticlePack{
    private x:number;
    private y:number;
    private done:boolean = false;
    private particles:Array<Particle> = [];

    constructor(x:number,y:number){
        this.x = x;
        this.y = y;

        this.initExplosion(10);
    }
    initExplosion(nParticles:number){
        let angle:number = 0;
        for(let i=0; i<nParticles; ++i){
            angle+=2*Math.PI/nParticles;
            const p = new Particle(this.x, this.y, Math.cos(angle), Math.sin(angle));
            this.particles.push(p);
        }
    }
    isDone(){
        return this.done;
    }
    update(dt:number){
        let particlesDone = 0;
        this.particles.forEach((p) => {
            p.update(dt);
            if(p.isDone()){
                ++particlesDone;
            }
        });
        if(particlesDone === this.particles.length){
            this.done = true;
            document.dispatchEvent(new Event("ParticlePack done"));
        }
    }
    draw(ctx:CanvasRenderingContext2D){
        this.particles.forEach((p) => p.draw(ctx));
    }
}