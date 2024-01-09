class UIText{
    private font:string = "30px Impact";
    private text:string;
    private posX:number;
    private posY:number;
    private alignment:CanvasTextAlign = "center";
    public hide:boolean = false;

    constructor(text:string="", x:number=0, y:number=0){
        this.text = text;
        this.posX = x;
        this.posY = y;
    }

    setAlignment(alignment:CanvasTextAlign){
        this.alignment = alignment;
    }
    setText(text:string){
        this.text = text;
    }
    getText(){
        return this.text;
    }
    getPosX(){
        return this.posX;
    }
    getPosY(){
        return this.posY;
    }
    setPosition(x:number, y:number){
        this.posX = x;
        this.posY = y;
    }
    draw(ctx:CanvasRenderingContext2D){
        if(!this.hide){
            ctx.fillStyle = "white";
            ctx.font = this.font;
            ctx.textAlign = this.alignment;
            ctx.fillText(this.text, this.posX, this.posY);    
        }
    }
}