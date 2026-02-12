import Phaser from 'phaser'

export class BubbleManager {


    public scene : Phaser.Scene
    
    // физические свойства каждого 
    readonly velocity : number
    readonly bounce : number
    readonly mass : number 


    constructor(scene:Phaser.Scene) {
        this.velocity = 0.5
        this.bounce = 0.5
        this.mass = 1
        this.scene = scene
    }

    private readonly textStyle : Phaser.Types.GameObjects.Text.TextStyle = {
        fontSize: '25px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }

    private createTextObj(text:string){
        // Создаем текст в 0, 0 (локальные координаты контейнера)
        const x = 0
        const y = 0
        return this.scene.add.text(x, y, text, this.textStyle)
    }

    private getRandomCoordinates(){
        const {width,height} = this.scene.scale
        const x = Math.floor(Phaser.Math.Between(100, width - 100));
        const y = Math.floor(Phaser.Math.Between(100, height - 100));
        return { x, y }
    }

    private createBackground(textObj: Phaser.GameObjects.Text,color:number){

        const padding = 20;
        const bg = this.scene.add.graphics();
        bg.fillStyle(color, 1);
    
        // Рисуем прямоугольник вокруг центра (0,0)
        bg.fillRoundedRect(
        Math.floor(-textObj.width / 2 - padding),
        Math.floor(-textObj.height / 2 - padding / 2),
        Math.floor(textObj.width + padding * 2),
        Math.floor(textObj.height + padding),
        10
        );
        return bg
    }

    addBubble(text:string,color:number){
        const { x, y } = this.getRandomCoordinates()
        const textObj = this.createTextObj(text)
        const geometryObj = this.createBackground(textObj,color)

        const container = this.scene.add.container(x, y, [geometryObj, textObj]);
        return container;

    }


}


