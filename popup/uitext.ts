class UIText{
    private m_font:string = "30px Impact";
    private m_text:string;
    private m_x:number;
    private m_y:number;
    private m_alignment:CanvasTextAlign = "center";

    constructor(text:string="", x:number=0, y:number=0){
        this.m_text = text;
        this.m_x = x;
        this.m_y = y;
    }

    addEventListener(eventType: string, callback:(ev:Event)=>void){
        document.addEventListener(eventType, callback);
    }

    set alignment(alignment:CanvasTextAlign){
        this.m_alignment = alignment;
    }
    set text(text:string){
        this.m_text = text;
    }
    get text(){
        return this.m_text;
    }
    get x(){
        return this.m_x;
    }
    get y(){
        return this.m_y;
    }
    setPosition(x:number, y:number){
        this.m_x = x;
        this.m_y = y;
    }
    draw(ctx:CanvasRenderingContext2D){
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.fillStyle = "white";
        ctx.font = this.m_font;
        ctx.textAlign = this.m_alignment;
        ctx.strokeText(this.m_text, this.m_x, this.m_y);
        ctx.fillText(this.m_text, this.m_x, this.m_y);
    }
}

class GUI{
    private m_guiElements: Array<UIText> = [];

    addElement(element: UIText){
        this.m_guiElements.push(element);
    }

    draw(ctx: CanvasRenderingContext2D){
        this.m_guiElements.forEach(e => e.draw(ctx));
    }
}