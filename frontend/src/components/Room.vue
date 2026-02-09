<script setup lang="ts">
import { onMounted, onUnmounted, ref, provide } from 'vue'
import Matter from 'matter-js'
import Button from './Button.vue'


const canvas = ref<HTMLCanvasElement | null>(null)

let engine: Matter.Engine
let render: Matter.Render
let runner: Matter.Runner
let intervalId: number


// id Пузыря на который навели сейчас
let hoveredBodyId : number | null = null;


let createMessageTime_in_second = 10
let border_radius_message = 20
let message_box_color = '#616161'
let message_box_hover = '#706f6f'

let room_background_color = '#2b2b2b'

const bodies: Matter.Body[] = []
const composite = Matter.Composite


const messages = [
  'Привет!',
  'Как дела?',
  'Отлично!',
  'Круто',
  'Интересно',
  'Супер!',
  'Ого',
  'Вау'
]

const wallOptions = { isStatic: true, render: { fillStyle: room_background_color} }

let topWall: Matter.Body
let bottomWall: Matter.Body
let leftWall: Matter.Body
let rightWall: Matter.Body

const createWalls = () => {
  topWall = Matter.Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, 230, wallOptions)
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


// функция лопающая пузырь 
const popBubbleEvent = (event:any) =>{
    const body = event.source.body; // Тело, на которое нажали
    if (body) {
      Matter.Composite.remove(engine.world, body)
        const index = bodies.indexOf(body)
        if (index > -1) bodies.splice(index, 1)
        console.log("Пузырь лопнул!")
    }
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


// функция которая отвечает за создание нового пузыря
function createBubbleEvent(text?: string) {
  const bubbleText = text || messages[Math.floor(Math.random() * messages.length)]
  const x = Math.random() * (window.innerWidth - 150) + 75
  const y = Math.random() * (window.innerHeight - 150) + 75
  
  // const circle = Matter.Bodies.circle(x, y, 60, {
  //   restitution: 1,
  //   friction: 0,
  //   frictionAir: 0.1,
  //   density: 0.001,
  //   render: {
  //     fillStyle: '#3b82f6',
  //   },
  //   label: text
  // })

  const rectangle = Matter.Bodies.rectangle(
    x,y,150,60, {
    chamfer: { radius: border_radius_message },
    restitution: 1,
    friction: 0,
    frictionAir: 0.05,
    density: 0.001,
    render: {
      fillStyle: message_box_color,
    },
    label: bubbleText
  }
  )
  

  bodies.push(rectangle)
  composite.add(engine.world,rectangle)
}

// функция устанавливает текст на пузыре после создания
function setBubbleTextEvent(){
    const context = render.canvas.getContext('2d')
    if (!context) return
    
    bodies.forEach(body => {

      // Проверяем: совпадает ли ID этого тела с тем, что под мышкой?
      const isHovered = (body.id === hoveredBodyId);
      
      // Плавно меняем цвет пузыря при наведении
      if (isHovered && body.label) {
        body.render.fillStyle = message_box_hover; // более светлый оттенок
      } else if (body.label) {
        body.render.fillStyle = message_box_color; // исходный цвет
      }
 
      const pos = body.position
      context.fillStyle = '#ffffff'
      context.font = '1.5em sans-serif'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(body.label, pos.x, pos.y)
    })
}

// функция которая отвечает за перемещение пузыря в пространстве
function applyFloatingForces() {

  bodies.forEach((body, index) => {
    const time = Date.now() * 0.00001
    const floatX = Math.sin(time + index) * 0.00007
    const floatY = Math.cos(time + index) * 0.00007

    Matter.Body.applyForce(body, body.position, {
      x: floatX,
      y: floatY
    })
  })
}

onMounted(() => {
  if (!canvas.value) return

  provide('createBubble', createBubbleEvent)


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

  Matter.Events.on(engine, 'beforeUpdate', applyFloatingForces)
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

  // Предположим, mouseConstraint уже создан и добавлен в Composite
  Matter.Events.on(mouseConstraint, 'mousedown', popBubbleEvent);
  Matter.Events.on(mouseConstraint, 'mousemove', mouseOnBubbleEvent);

  set_adaptive()

  intervalId = setInterval(createBubbleEvent, (createMessageTime_in_second * 1000 ))
  createBubbleEvent()
})

onUnmounted(() => {
  clearInterval(intervalId)
  Matter.Render.stop(render)
  Matter.Runner.stop(runner)
  Matter.Engine.clear(engine)
})
</script>

<template>
  <div class="room">
    <canvas ref="canvas"></canvas>
    
    <Teleport to="#navbar-buttons">
      <Button @click="() => console.log('Первая кнопка')">🚀 Взаимодействовать</Button>
      <Button @click="() => console.log('Вторая кнопка')">🔄 Сброс баблов</Button>
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