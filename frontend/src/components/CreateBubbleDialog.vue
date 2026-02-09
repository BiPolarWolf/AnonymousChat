<script setup lang="ts">
import { ref } from 'vue'
import DialogButton from './DialogButton.vue'
import Button from './Button.vue'


const messageText = ref('')

const props = defineProps<{
  handler: (messageText: string) => void
}>()

const handleSubmit = () => {
  if (messageText.value.trim()) {
    props.handler(messageText.value)
    messageText.value = ''
  }
}

</script>

<template>
  <DialogButton>
    <template #dialog_data>
    <h3>Создать сообщение</h3>
    <form @submit.prevent="handleSubmit">
      <input 
        v-model="messageText" 
        type="text" 
        placeholder="Введите текст сообщения"
        maxlength="50"
      />
      <Button size="small" type="submit">Создать</Button>
    </form>
    </template>

    <template #button_data>
        <i class="fa fa-pencil"></i>
    </template>
  </DialogButton>
</template>

<style scoped>
h3 {
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1em;
}
</style>
