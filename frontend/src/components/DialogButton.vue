<script setup lang="ts">
import { ref } from 'vue'

import Button from './Button.vue'

const isOpen = ref(false)


const toggleDialog = () => {
  if (isOpen.value) {
    isOpen.value = false
  } else {
    isOpen.value = true
    
  }
}
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
        <div style="margin: 1em;">
          <slot name="dialog_data"></slot>
        </div>
        <Button size="small" @click="toggleDialog" >Закрыть</Button>
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
  font-size: 2em;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(22, 22, 22, 0.763);
  border-radius: 8px;
  padding: 20px;
  min-width: 300px;
  max-width: 90vw;
  max-height: 90vh;
  z-index: 1000;
}

</style>
