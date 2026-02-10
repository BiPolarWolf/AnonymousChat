<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import Matter from 'matter-js'
import CreateBubbleDialog from './CreateBubbleDialog.vue'
import { getRandomBasicColor, getHoverColor, getContrastTextColor } from '../utils/color_utils'



const canvas = ref<HTMLCanvasElement | null>(null)
let socket = new WebSocket('ws://localhost:8000/ws/default')

const history_url = 'http://localhost:8000/history/default'


async function get_room_history(){
    const response = await fetch(history_url)
    const data = await response.json()
    console.log(data)
    for (let message of data){
      createBubbleEvent(message)
    }
}


function send_new_message(data: {text: string, seconds: number}){
    let json_data  = JSON.stringify({
      text:data.text,
      color:message_color,
      seconds:data.seconds,
      time_create:Date.now()
    })
    socket.send(json_data)
}


socket.onmessage = function(event) {
  let message = JSON.parse(event.data)
  // alert(`Данные получены с сервера: ${message}`)
  createBubbleEvent(message)
};


type MessageType = {
  text:string,
  color:string,
  seconds:number
  time_create:number
}


// функция которая отвечает за создание нового пузыря
function createBubbleEvent(message: MessageType) {
  
  // Создаем временный canvas для измерения текста
  const tempCanvas = document.createElement('canvas')
  const tempContext = tempCanvas.getContext('2d')
  if (!tempContext) return
  
  // Устанавливаем тот же шрифт, что используется в setBubbleTextEvent
  tempContext.font = text_font
  
  // Максимальная ширина пузыря
  const maxWidth = 400
  const padding = 40
  const lineHeight = 30
  
  // Разбиваем текст на строки (учитываем \n и автоперенос)
  const paragraphs = message.text.split('\n')
  const lines: string[] = []
  
  paragraphs.forEach(paragraph => {
    const words = paragraph.split(' ')
    let currentLine = ''
    
    words.forEach(word => {
      const testLine = currentLine ? currentLine + ' ' + word : word
      const metrics = tempContext.measureText(testLine)
      
      if (metrics.width > maxWidth - padding && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })
    if (currentLine) lines.push(currentLine)
  })
  
  // Вычисляем размеры пузыря
  const bubbleWidth = Math.min(maxWidth, Math.max(...lines.map(line => tempContext.measureText(line).width)) + padding)
  const bubbleHeight = lines.length * lineHeight + padding
  
  const x = Math.random() * (window.innerWidth - bubbleWidth) + bubbleWidth / 2
  const y = Math.random() * (window.innerHeight - bubbleHeight) + bubbleHeight / 2
  

  const rectangle = Matter.Bodies.rectangle(
    x, y, bubbleWidth, bubbleHeight, {
    chamfer: { radius: border_radius_message },
    restitution: 1,
    friction: 0,
    frictionAir: 0.05,
    density: 0.001,
    inertia: Infinity,
    render: {
      fillStyle: message['color'],
    },
    label: message['text'],
    plugin : {
      originColor : message['color'],
      lines: lines,
      opacity: 0,
      scale: 0.5,
      timer: 0
    }
  }
  )


  bodies.push(rectangle)
  composite.add(engine.world,rectangle)


  const current_time = Date.now()
  const second_passed = (current_time - message.time_create) / 1000
  const remaining_seconds = message.seconds - second_passed

  rectangle.plugin.timer = Math.ceil(remaining_seconds)

  let intervalId = setInterval(() => {
    rectangle.plugin.timer -= 1
  }, 1000);

  setTimeout(() => {
    clearInterval(intervalId)
    Matter.Composite.remove(engine.world, rectangle)
    const index = bodies.indexOf(rectangle)
    if (index > -1) {
      bodies.splice(index, 1)
    }
  },remaining_seconds * 1000)

}



let engine: Matter.Engine
let render: Matter.Render
let runner: Matter.Runner
// let intervalId: number


// id Пузыря на который навели сейчас
let hoveredBodyId : number | null = null;


// let createMessageTime_in_second = 10
let border_radius_message = 20
let message_color = getRandomBasicColor()
// let message_color = '#616161'
// let message_color_hover = '#706f6f'
let text_font = '25px sans-serif'
let room_background_color = '#2b2b2b'

const bodies: Matter.Body[] = []
const composite = Matter.Composite



const wallOptions = { isStatic: true, render: { fillStyle: '#383838'} }

let topWall: Matter.Body
let bottomWall: Matter.Body
let leftWall: Matter.Body
let rightWall: Matter.Body

const createWalls = () => {
  topWall = Matter.Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, 240, wallOptions)
  bottomWall = Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 50, wallOptions)
  leftWall = Matter.Bodies.rectangle(0, window.innerHeight / 2, 50, window.innerHeight, wallOptions)
  rightWall = Matter.Bodies.rectangle(window.innerWidth, window.innerHeight / 2, 50, window.innerHeight, wallOptions)
  return [topWall, bottomWall, leftWall, rightWall]
}

const walls = createWalls()


const set_adaptive = () => {
  window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;

    Matter.Body.setPosition(topWall, { x: window.innerWidth / 2, y: 0 });
    Matter.Body.setVertices(topWall, Matter.Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, 230, wallOptions).vertices);
    
    Matter.Body.setPosition(bottomWall, { x: window.innerWidth / 2, y: window.innerHeight });
    Matter.Body.setVertices(bottomWall, Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 50, wallOptions).vertices);
    
    Matter.Body.setPosition(leftWall, { x: 0, y: window.innerHeight / 2 });
    Matter.Body.setVertices(leftWall, Matter.Bodies.rectangle(0, window.innerHeight / 2, 50, window.innerHeight, wallOptions).vertices);
    
    Matter.Body.setPosition(rightWall, { x: window.innerWidth, y: window.innerHeight / 2 });
    Matter.Body.setVertices(rightWall, Matter.Bodies.rectangle(window.innerWidth, window.innerHeight / 2, 50, window.innerHeight, wallOptions).vertices);
  });
}


// функция отрабатывающая когда курсор на каком то пузыре 
const mouseOnBubbleEvent = (event:any) =>{
        // Получаем все тела из мира (кроме стен)
      const bodies = Matter.Composite.allBodies(engine.world).filter(b => !b.isStatic);
      
      // Проверяем, находится ли мышь над каким-то телом
      const found = Matter.Query.point(bodies, event.mouse.position)[0];
      
      // фиксируем айди бабла на который мы смотрим
      hoveredBodyId = found ? found.id : null;


      if (found) {
          // Можно сменить курсор на "палец", чтобы было понятно, что кликабельно
          render.canvas.style.cursor = 'pointer';

      } else {
          render.canvas.style.cursor = 'default';
      }
}




// функция устанавливает текст на пузыре после создания
function setBubbleTextEvent(){
    const context = render.canvas.getContext('2d')
    if (!context) return
    

    bodies.forEach(body => {


      // Проверяем: совпадает ли ID этого тела с тем, что под мышкой?
      const isHovered = (body.id === hoveredBodyId);

      const body_color = body.plugin.originColor
      const hover_color = getHoverColor(body_color)
      const text_color = getContrastTextColor(body_color)


      // Плавно меняем цвет пузыря при наведении
      if (isHovered && body.label) {
        body.render.fillStyle = hover_color; // более светлый оттенок
      } else if (body.label) {
        body.render.fillStyle = body_color
      }
 
      const pos = body.position
      context.fillStyle = text_color 
      context.font = text_font
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      
      // Рисуем текст по строкам
      const lines = body.plugin.lines || [body.label]
      const lineHeight = 30
      const startY = pos.y - ((lines.length - 1) * lineHeight) / 2
      
      lines.forEach((line: string, index: number) => {
        context.fillText(line, pos.x, startY + index * lineHeight)
      })

      // Устанавливаем другой цвет для текста времени
      context.fillStyle = 'white'
      context.fillText(body.plugin.timer.toString(), pos.x , startY - 55)
      // Возвращаем исходный цвет для остального текста
      context.fillStyle = text_color


    })
}



onMounted(async () => {
  if (!canvas.value) return


  // создаем экземпляр движка
  engine = Matter.Engine.create({
    gravity: { x: 0, y: 0 }
  })
  
  // создаем экземпляр художника
  render = Matter.Render.create({
    canvas: canvas.value,
    engine: engine,
    options: {
      width: window.innerWidth,
      height: window.innerHeight,
      wireframes: false,
      background: room_background_color
    }
  })
  // включаем этого художника
  Matter.Render.run(render)


  // добавляем стены в мир
  composite.add(engine.world,walls)


  // создаем экземпляр отрисовочника
  runner = Matter.Runner.create()

  // включаем отрисовочника
  Matter.Runner.run(runner, engine)


  Matter.Events.on(render, 'afterRender',setBubbleTextEvent)


  const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: Matter.Mouse.create(render.canvas),
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false
      }
    }
  });

  composite.add(engine.world, mouseConstraint);

  Matter.Events.on(mouseConstraint, 'mousemove', mouseOnBubbleEvent);

  set_adaptive()

  await get_room_history()

  // intervalId = setInterval(createBubbleEvent, (createMessageTime_in_second * 1000 ))
  // createBubbleEvent()
})

onUnmounted(() => {
  // clearInterval(intervalId)
  Matter.Render.stop(render)
  Matter.Runner.stop(runner)
  Matter.Engine.clear(engine)
})
</script>

<template>
  <div class="room">
    <canvas ref="canvas"></canvas>
    
    <Teleport to="#navbar-buttons">
      <CreateBubbleDialog :handler="(data)=>send_new_message(data)">
      </CreateBubbleDialog>
    </Teleport>
  </div>
</template>

<style scoped>
.room {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>