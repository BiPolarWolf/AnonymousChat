<script setup>
import { ref, onMounted, nextTick } from 'vue'

const rooms = ref([])
const currentRoom = ref('general')
const messages = ref([])
const newMessage = ref('')
const newRoomName = ref('')
const messagesContainer = ref(null)
const username = ref('')
let socket = null

const fetchRooms = async () => {
  try {
    const response = await fetch('http://localhost:8000/rooms')
    rooms.value = await response.json()
    if (rooms.value.length === 0) {
      await createRoom('general')
    }
  } catch (err) {
    console.error('Ошибка загрузки комнат:', err)
  }
}

const generateUsername = () => {
  const last_names = ['Серый', 'Рыжий', 'Бурый', 'Белый', 'Черный', 'Полосатый', 'Пятнистый', 'Грозный']
  const first_names = ['Кот', 'Пес', 'Хомяк', 'Кролик', 'Лиса', 'Медведь', 'Волк', 'Тигр']
  const last_name = last_names[Math.floor(Math.random() * last_names.length)]
  const first_name = first_names[Math.floor(Math.random() * first_names.length)]
  const num = Math.floor(Math.random() * 900) + 100
  return `${last_name}${first_name}${num}`
}

const getAvatarColor = (name) => {
  const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#eccc68', '#747d8c']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

const fetchHistory = async (room) => {
  try {
    const response = await fetch(`http://localhost:8000/history/${room}`)
    const data = await response.json()
    messages.value = data
    scrollToBottom()
  } catch (err) {
    console.error("Ошибка:", err)
  }
}

const connectToRoom = (room) => {
  if (socket) socket.close()
  socket = new WebSocket(`ws://localhost:8000/ws/${room}`)
  socket.onmessage = (event) => {
    messages.value.push(JSON.parse(event.data))
    scrollToBottom()
  }
}

const switchRoom = (room) => {
  currentRoom.value = room
  fetchHistory(room)
  connectToRoom(room)
}

const sendMessage = () => {
  if (newMessage.value.trim() && socket) {
    socket.send(JSON.stringify({
      text: newMessage.value,
      sender: username.value,
      room: currentRoom.value
    }))
    newMessage.value = ''
  }
}

const createRoom = async () => {
  const name = newRoomName.value.trim().toLowerCase().replace(/\s+/g, '-')
  if (name && !rooms.value.includes(name)) {
    try {
      await fetch(`http://localhost:8000/rooms/${name}`, { method: 'POST' })
      await fetchRooms()
      newRoomName.value = ''
      switchRoom(name)
    } catch (err) {
      console.error('Ошибка создания комнаты:', err)
    }
  }
}

const deleteRoom = async (room) => {
  if (confirm(`Удалить комнату #${room}?`)) {
    try {
      await fetch(`http://localhost:8000/rooms/${room}`, { method: 'DELETE' })
      await fetchRooms()
      if (currentRoom.value === room) {
        switchRoom(rooms.value[0] || 'general')
      }
    } catch (err) {
      console.error('Ошибка удаления комнаты:', err)
    }
  }
}

onMounted(() => {
  username.value = generateUsername()
  fetchRooms().then(() => {
    switchRoom(currentRoom.value)
  })
})
</script>

<template>
  <div class="app-wrapper">
    <nav class="sidebar">
      <div class="logo">
        <div class="logo-icon">AC</div>
        <span>AnonChat</span>
      </div>

      <div class="section-label">КАНАЛЫ</div>
      <div class="rooms-nav">
        <div 
          v-for="room in rooms" 
          :key="room" 
          :class="['room-item', { active: currentRoom === room }]"
        >
          <span class="hash" @click="switchRoom(room)">#</span>
          <span @click="switchRoom(room)">{{ room }}</span>
          <span class="delete-btn" @click.stop="deleteRoom(room)">×</span>
        </div>
      </div>

      <div class="sidebar-footer">
        <input 
          v-model="newRoomName" 
          @keyup.enter="createRoom" 
          placeholder="Создать комнату..."
        />
      </div>
    </nav>

    <main class="chat-main">
      <header class="chat-header">
        <div class="header-info">
          <span class="header-hash">#</span>
          <h2>{{ currentRoom }}</h2>
        </div>
      </header>

      <div class="messages-viewport" ref="messagesContainer">
        <div v-if="messages.length === 0" class="empty-state">
          Здесь пока пусто. Будь первым!
        </div>
        
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          class="msg-row"
        >
          <div class="avatar" :style="{ backgroundColor: getAvatarColor(msg.sender) }">
            {{ msg.sender[0] }}
          </div>
          <div class="msg-content">
            <div class="msg-meta">
              <span class="msg-sender">{{ msg.sender }}</span>
              <span class="msg-time">сегодня</span>
            </div>
            <p class="msg-text">{{ msg.text }}</p>
          </div>
        </div>
      </div>

      <div class="input-wrapper">
        <div class="input-box">
          <input 
            v-model="newMessage" 
            @keyup.enter="sendMessage" 
            :placeholder="`Написать в #${currentRoom}`"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body, html { height: 100%; font-family: 'Segoe UI', Roboto, sans-serif; overflow: hidden; }
#app { height: 100%; }

.app-wrapper {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #313338;
  color: #dbdee1;
  position: fixed;
  top: 0;
  left: 0;
}

.sidebar {
  width: 240px;
  background-color: #2b2d31;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.logo {
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  font-size: 18px;
  border-bottom: 1px solid #232428;
}

.logo-icon {
  background: #5865f2;
  width: 35px;
  height: 35px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-label {
  padding: 20px 15px 10px;
  font-size: 12px;
  font-weight: 800;
  color: #949ba4;
}

.rooms-nav {
  flex: 1;
  padding: 0 8px;
  overflow-y: auto;
}

.room-item {
  padding: 8px 12px;
  margin: 2px 0;
  border-radius: 4px;
  cursor: pointer;
  color: #949ba4;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
}

.room-item:hover { background: #35373c; color: #dbdee1; }
.room-item.active { background: #3f4147; color: #fff; }
.room-item .hash { font-size: 20px; color: #80848e; }
.room-item .delete-btn {
  margin-left: auto;
  font-size: 20px;
  opacity: 0;
  transition: 0.2s;
}
.room-item:hover .delete-btn { opacity: 1; }
.room-item .delete-btn:hover { color: #ed4245; }

.sidebar-footer {
  padding: 15px;
  background: #232428;
}

.sidebar-footer input {
  width: 100%;
  background: #1e1f22;
  border: none;
  padding: 8px;
  border-radius: 4px;
  color: white;
  box-sizing: border-box;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.chat-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #232428;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.header-info { display: flex; align-items: center; gap: 8px; }
.header-hash { font-size: 24px; color: #80848e; }
.header-info h2 { font-size: 16px; margin: 0; }

.messages-viewport {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
}

.msg-row {
  display: flex;
  padding: 6px 16px;
  gap: 16px;
}

.msg-row:hover { background: #2e3035; }

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.msg-content { display: flex; flex-direction: column; }
.msg-meta { display: flex; align-items: baseline; gap: 8px; }
.msg-sender { font-weight: 500; color: #fff; }
.msg-time { font-size: 12px; color: #949ba4; }
.msg-text { margin: 4px 0 0; color: #dbdee1; line-height: 1.5; }

.empty-state {
  text-align: center;
  margin-top: 50px;
  color: #949ba4;
}

.input-wrapper {
  padding: 0 16px 24px;
}

.input-box {
  background: #383a40;
  border-radius: 8px;
  padding: 10px 16px;
}

.input-box input {
  width: 100%;
  background: transparent;
  border: none;
  color: #dbdee1;
  font-size: 16px;
  outline: none;
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #2e3035; }
::-webkit-scrollbar-thumb { background: #1e1f22; border-radius: 4px; }
</style>
