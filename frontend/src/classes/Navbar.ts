import Phaser from 'phaser'

export class Navbar{

    public scene : Phaser.Scene
    private noteButton: Phaser.GameObjects.Image

    constructor(scene:Phaser.Scene) {
        this.scene = scene
        this.noteButton = this.createNoteButton()
    }

    private createNoteButton(): Phaser.GameObjects.Image {
        const note = this.scene.add.image(70, 70, 'note').setScale(0.2).setInteractive({ cursor: 'pointer' })

        this.scene.tweens.add({
            targets: note,
            y: 80,
            duration: 1000,
            ease: 'Sine.inOut',
            yoyo: true,
            loop: -1
        })

        note.on('pointerdown', () => {
            this.sendRandomMessage()
        })

        return note
    }

    private sendRandomMessage(): void {
        const messages = ['Привет!', 'Как дела?', 'Отлично!', 'Круто', 'Интересно', 'Супер!', 'Ого', 'Вау']
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#F4A261']
        
        const randomText = messages[Math.floor(Math.random() * messages.length)]
        const randomColor = colors[Math.floor(Math.random() * colors.length)]
        
        this.scene.game.events.emit('sendMessage', randomText, randomColor)
    }
}