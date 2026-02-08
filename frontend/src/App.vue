<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

interface RoomFormData {
    name: string
    tags: string[]
    is_private: boolean
    max_users: number
}


// функция по получению моего профиля из базы или получения анонимного профиля если я не авторизован
const getMyProfile = async () => {
    ... // логика получения профиля
}

// получение списка доступных комнат и отображение их в интерфейсе
const fetchRooms = async () => {
    ... // логика получения комнат и отображения их в интерфейсе
}

// функция по получению истории сообщений для выбранной комнаты и отображению их в интерфейсе
const fetchHistory = async (room: string) => {
    ... // логика получения истории сообщений и отображения их в интерфейсе
}


// функция по созданию комнаты и подключению к ней сокета
const createRoom = async (room_data:RoomFormData) => {
    ... // логика создания комнаты и подключения к ней сокета
}


</script>

<template>
    <div>Привет, мир!</div>
</template>

<style>

</style>
