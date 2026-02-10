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
    <form @submit.prevent="handleSubmit">
      <textarea 
        rows="5" 
        v-model="messageText" 
        name="messageText"
        placeholder="Введите текст сообщения"
        maxlength="150"
      ></textarea>
      <Button style="width: 100%" size="small" type="submit">
        Отправить сообщение
      </Button>
    </form>
    </template>

    <template #button_data>
        <i class="fa fa-pencil"></i> Написать сообщение
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

textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1.5em;
  width: 100%;
  box-sizing: border-box;
  resize: none;
}
</style>
