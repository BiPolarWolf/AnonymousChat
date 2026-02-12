<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import Phaser from 'phaser'
import { BubbleManager } from '../classes/BubbleManager'

type MessageType = {
  text: string,
  color: string,
  timestamp: any
}

const gameContainer = ref<HTMLDivElement | null>(null)
let game: Phaser.Game | null = null
let socket: WebSocket | null = null

class RoomScene extends Phaser.Scene {


  constructor() {
    super({ key: 'RoomScene' })
  }

  preload() {
    this.load.image('note','/src/assets/pen_icon.png')
  }

  create() {
    const bubble_manager = new BubbleManager(this)


    this.cameras.main.setBackgroundColor('#2b2b2b')

    const note = this.add.image(100, 200, 'note' ).setScale(0.3)

    this.tweens.add({
      targets: note,
      y: 210,
      duration: 1000,
      ease: 'Sine.inOut',
      yoyo: true,
      loop: -1
    });

    // Слушаем события новых сообщений
    this.game.events.on('newMessage', (message: MessageType) => {
      const color = parseInt(message.color.replace('#', '0x'))
      bubble_manager.addBubble(message.text, color)
    })
  }
  update() {

  }



}

onMounted(async () => {
  if (!gameContainer.value) return

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: gameContainer.value,
    width: window.innerWidth,
    height: window.innerHeight,
    render:{
      pixelArt: false,
      antialias: true
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 , x:0},
        debug: false
      }
    },
    scene: RoomScene
  })

  // Инициализация WebSocket
  socket = new WebSocket('ws://localhost:8000/ws/default')
  
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    game?.events.emit('newMessage', message)
  }

  // Загрузка истории
  const response = await fetch('http://localhost:8000/history/default')
  const history = await response.json()
  history.forEach((message: MessageType) => {
    game?.events.emit('newMessage', message)
  })
})

onUnmounted(() => {
  socket?.close()
  if (game) {
    game.destroy(true)
    game = null
  }
})

// Функция для отправки сообщений
const sendMessage = (text: string, color: string) => {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ text, color, seconds: 100 }))
  }
}

defineExpose({ sendMessage })
</script>

<template>
  <div ref="gameContainer" class="room-phaser"></div>
</template>

<style scoped>
.room-phaser {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
