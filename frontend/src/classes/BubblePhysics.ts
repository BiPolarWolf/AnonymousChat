import Phaser from 'phaser'

export type PhysicsMode = 'static' | 'floating' | 'bouncy' | 'calm'

export class BubblePhysics {
    
    static apply(
        scene: Phaser.Scene,
        container: Phaser.GameObjects.Container,
        textObj: Phaser.GameObjects.Text,
        mode: PhysicsMode,
        velocity: number,
        bounce: number,
        bubbles: Phaser.GameObjects.Container[]
    ) {
        if (mode === 'static') {
            return
        }

        scene.physics.add.existing(container, false)
        const body = (container as any).body as Phaser.Physics.Arcade.Body
        const width = textObj.width + 40
        const height = textObj.height + 20
        body.setSize(width, height)
        body.setOffset(-width / 2, -height / 2)
        body.setBounce(bounce)
        body.setCollideWorldBounds(true)

        switch (mode) {
            case 'floating':
                body.setVelocity(
                    Phaser.Math.Between(-velocity * 0.3, velocity * 0.3),
                    Phaser.Math.Between(-velocity * 0.3, velocity * 0.3)
                )
                break
            
            case 'calm':
                body.setVelocity(
                    Phaser.Math.Between(-velocity * 0.5, velocity * 0.5),
                    Phaser.Math.Between(-velocity * 0.5, velocity * 0.5)
                )
                break
            
            case 'bouncy':
                body.setVelocity(
                    Phaser.Math.Between(-velocity, velocity),
                    Phaser.Math.Between(-velocity, velocity)
                )
                
                // Отталкиваем перекрывающиеся баблы
                bubbles.forEach(bubble => {
                    if (bubble.body) {
                        const dx = bubble.x - container.x
                        const dy = bubble.y - container.y
                        const distance = Math.sqrt(dx * dx + dy * dy)
                        if (distance < 150) {
                            const bubbleBody = (bubble as any).body as Phaser.Physics.Arcade.Body
                            const force = velocity * 0.5
                            bubbleBody.setVelocity(
                                (dx / distance) * force,
                                (dy / distance) * force
                            )
                            body.setVelocity(
                                -(dx / distance) * force,
                                -(dy / distance) * force
                            )
                        }
                    }
                })
                break
        }
    }
}
