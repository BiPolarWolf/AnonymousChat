
export function getRandomBasicColor(): string {
  const basicColors: string[] = [
    '#FF6B6B', // Soft Red
    '#4ECDC4', // Soft Teal
    '#45B7D1', // Soft Blue
    '#96CEB4', // Soft Green
    '#FFEAA7', // Soft Yellow
    '#DDA0DD', // Soft Purple
    '#F4A261', // Soft Orange
    '#E17055', // Soft Coral
    '#74B9FF', // Soft Sky Blue
    '#A29BFE', // Soft Lavender
    '#FD79A8', // Soft Pink
    '#FDCB6E', // Soft Peach
    '#6C5CE7', // Soft Violet
    '#55A3FF', // Soft Light Blue
    '#FF7675', // Soft Rose
    '#81ECEC', // Soft Cyan
    '#FAB1A0', // Soft Salmon
    '#00B894', // Soft Mint
    '#E84393', // Soft Magenta
    '#A8E6CF'  // Soft Mint Green
  ];
  
  const randomIndex = Math.floor(Math.random() * basicColors.length);
  return basicColors[randomIndex] as string;
}


// функция подбирает контрастный цвет текста для заданного фонового цвета
export function getContrastTextColor(backgroundColor: string): string {
  // Убираем символ # если он есть
  const hex = backgroundColor.replace('#', '');
  
  // Извлекаем RGB компоненты
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  // Вычисляем яркость по формуле относительной яркости
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Для светлых фонов создаем темную версию оригинального цвета, для темных - белый
  if (brightness > 128) {
    // Делаем цвет намного темнее для хорошего контраста
    const darkR = Math.floor(r * 0.2);
    const darkG = Math.floor(g * 0.2);
    const darkB = Math.floor(b * 0.2);
    
    return '#' + 
      darkR.toString(16).padStart(2, '0') +
      darkG.toString(16).padStart(2, '0') +
      darkB.toString(16).padStart(2, '0');
  } else {
    return '#ffffff';
  }
}


// функция создает более тусклую версию цвета для hover эффекта
export function getHoverColor(color: string): string {
  // Убираем символ # если он есть
  const hex = color.replace('#', '');
  
  // Извлекаем RGB компоненты
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  // Делаем цвет тусклее, уменьшая яркость на 20%
  const darkerR = Math.floor(r * 0.8);
  const darkerG = Math.floor(g * 0.8);
  const darkerB = Math.floor(b * 0.8);
  
  // Формируем hex цвет
  const hoverColor = '#' + 
    darkerR.toString(16).padStart(2, '0') +
    darkerG.toString(16).padStart(2, '0') +
    darkerB.toString(16).padStart(2, '0');
  
  return hoverColor;
}