import Phaser from 'phaser'
import { BubblePhysics } from './BubblePhysics'
import type { PhysicsMode } from './BubblePhysics'

export class BubbleManager {


    public scene : Phaser.Scene
    
    /**
     * Максимальная скорость баблов (рекомендуется 50-200)
     */
    readonly velocity : number
    /**
     * Коэффициент отскока при столкновении (0-1, где 1 = полный отскок)
     */
    readonly bounce : number
    /**
     * Масса баблов (не используется, зарезервировано)
     */
    readonly mass : number 
    private bubbles: Phaser.GameObjects.Container[] = []
    private physicsMode: PhysicsMode = 'static'


    constructor(scene:Phaser.Scene) {
        this.velocity = 100
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
        return this.scene.add.text(x, y, text, this.textStyle).setOrigin(0.5)
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
        
        if (this.physicsMode !== 'static') {
            BubblePhysics.apply(
                this.scene,
                container,
                textObj,
                this.physicsMode,
                this.velocity,
                this.bounce,
                this.bubbles
            )
        }
        
        this.bubbles.push(container)
        return container;

    }

    /**
     * Устанавливает режим физики для всех баблов
     * @param mode - 'static' | 'floating' | 'calm' | 'bouncy'
     */
    setPhysicsMode(mode: PhysicsMode) {
        this.physicsMode = mode
        
        this.bubbles.forEach(bubble => {
            const textObj = bubble.list[1] as Phaser.GameObjects.Text
            BubblePhysics.apply(
                this.scene,
                bubble,
                textObj,
                mode,
                this.velocity,
                this.bounce,
                this.bubbles
            )
        })
        
        if (mode !== 'static') {
            this.scene.physics.add.collider(this.bubbles, this.bubbles)
        }
    }

    /**
     * @deprecated Используйте setPhysicsMode('bouncy')
     */
    physics_on() {
        this.setPhysicsMode('bouncy')
    }


}


