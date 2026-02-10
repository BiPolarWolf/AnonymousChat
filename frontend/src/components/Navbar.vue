<script setup lang="ts">

</script>

<template>
  <div class="navbar-container" id="navbar-buttons">
    <!-- Сюда будут телепортироваться кнопки из Room -->
  </div>
</template>

<style scoped>
.navbar-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 90px;
  background-color: rgba(30, 30, 30, 0.588);
  backdrop-filter: blur(10px);
  padding: 1px 20px;
  color: white;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

h2 {
  margin-bottom: 20px;
}


</style>
