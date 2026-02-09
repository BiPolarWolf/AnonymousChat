<script setup>
import { ref } from 'vue';

const isVisible = ref(false);
</script>


<template>
  <div class="container">
    <button @click="isVisible = !isVisible">
      {{ isVisible ? 'Лопнуть' : 'Надуть' }} пузырь
    </button>

    <Transition name="bubble">
      <div v-if="isVisible" class="bubble">
        <div class="bubble-content">
          <slot>Привет! Я создан на Vue 3 🚀</slot>
        </div>
        <div class="bubble-tail"></div>
      </div>
    </Transition>
  </div>
</template>



<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 50px;
}

.bubble {
  position: relative;
  background: #ffffff;
  padding: 15px 25px;
  border-radius: 40px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 2px solid #e0f2ff;
  color: #2c3e50;
  max-width: 200px;
  text-align: center;
}

.bubble-tail {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 12px solid #ffffff;
}

/* --- Анимация перехода (Vue Transition) --- */

/* Состояние появления (вход) и исчезновения (выход) */
.bubble-enter-active {
  /* cubic-bezier создает эффект "упругого" отскока */
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.4);
}

.bubble-leave-active {
  transition: all 0.2s ease-in;
}

/* Начальные/конечные точки анимации */
.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: scale(0.4) translateY(30px);
}
</style>