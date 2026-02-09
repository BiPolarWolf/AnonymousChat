import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia' // 1. Импортируем





const app = createApp(App)
const pinia = createPinia() // 2. Создаем экземпляр

app.use(pinia) // 3. ПОДКЛЮЧАЕМ К ПРИЛОЖЕНИЮ (Это должно быть ПЕРЕД mount)

app.mount('#app')