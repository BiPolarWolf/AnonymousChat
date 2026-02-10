<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

import Button from './Button.vue'

const isOpen = ref(false)


const toggleDialog = () => {
  isOpen.value = !isOpen.value
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    toggleDialog()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div>
    <Button @click="toggleDialog">
      <slot name="button_data">
        Кнопка
      </slot>
    </Button>
    
    <Teleport to="body">
      <div class="overlay" v-if="isOpen" ></div>

      <div v-if="isOpen" ref="dialog" class="dialog">

        <div class="close-btn-container">
        <button class="close-btn" @click="toggleDialog">
          <i class="fa fa-times"></i>
        </button>
        </div>
        <div style="margin: 1em;">
          <slot name="dialog_data"></slot>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6); /* Черный цвет с прозрачностью 60% */
  backdrop-filter: blur(5px);    /* Эффект размытия (очень красиво!) */
  z-index: 1000;                /* Слой должен быть выше канваса */
}


.dialog {
  color: aliceblue;
  text-align: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(22, 22, 22, 0.763);
  border-radius: 8px;
  padding: 20px;
  width: 600px;
  z-index: 1000;
}

.close-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px 10px;
}

.close-btn:hover {
  color: #ff4444;
}

.close-btn-container {
  display: flex;
  justify-content: flex-end;
}

</style>
