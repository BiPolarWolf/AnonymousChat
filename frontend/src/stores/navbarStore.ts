import { defineStore } from 'pinia'

// 1. Создаем интерфейс для кнопки
interface NavButton {
  id: string | number;
  label: string;
  icon?: string;       // Опционально (знак вопроса)
  handler: () => void; // Функция, которая ничего не возвращает
}

export const useNavbarStore = defineStore('navbar', {
  state: () => ({
    // 2. Указываем тип массива через "as" или явную типизацию
    buttons: [] as NavButton[] 
  }),
  actions: {
    // 3. Заменяем any на наш интерфейс для безопасности
    setButtons(newButtons: NavButton[]) {
      this.buttons = newButtons
    },
    clearButtons() {
      this.buttons = []
    }
  }
})