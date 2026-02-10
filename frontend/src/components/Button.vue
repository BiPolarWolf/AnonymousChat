<script setup lang="ts">

defineProps<{
  size?: 'normal' | 'small'
}>()

</script>

<template>
    <button class="btn" :class="size === 'small' ? 'btn-small' : 'btn-normal'">
        <slot name="default"></slot>
    </button>
</template>

<style scoped>

.btn {
  background-color: #878787;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-normal {
  padding: 15px;
  font-size: 1.5em;
}

.btn-small {
  padding: 10px;
  font-size: 1.5em;
}

.btn:hover {
  background-color: #6d6d6d;
}

</style>