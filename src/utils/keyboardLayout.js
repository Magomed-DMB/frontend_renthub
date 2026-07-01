// Соответствие клавиш QWERTY → ЙЦУКЕН
const qwertyToCyrillic = {
  'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н',
  'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з', '[': 'х', ']': 'ъ',
  'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р',
  'j': 'о', 'k': 'л', 'l': 'д', ';': 'ж', "'": 'э',
  'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т',
  'm': 'ь', ',': 'б', '.': 'ю', '/': '.',
  'Q': 'Й', 'W': 'Ц', 'E': 'У', 'R': 'К', 'T': 'Е', 'Y': 'Н',
  'U': 'Г', 'I': 'Ш', 'O': 'Щ', 'P': 'З', '{': 'Х', '}': 'Ъ',
  'A': 'Ф', 'S': 'Ы', 'D': 'В', 'F': 'А', 'G': 'П', 'H': 'Р',
  'J': 'О', 'K': 'Л', 'L': 'Д', ':': 'Ж', '"': 'Э',
  'Z': 'Я', 'X': 'Ч', 'C': 'С', 'V': 'М', 'B': 'И', 'N': 'Т',
  'M': 'Ь', '<': 'Б', '>': 'Ю', '?': ','
};

// Соответствие клавиш ЙЦУКЕН → QWERTY
const cyrillicToQwerty = {};
Object.entries(qwertyToCyrillic).forEach(([en, ru]) => {
  cyrillicToQwerty[ru] = en;
});

/**
 * Конвертирует текст из раскладки QWERTY в ЙЦУКЕН
 * @param {string} text - текст для конвертации
 * @returns {string} - конвертированный текст
 */
export function qwertyToRussian(text) {
  if (!text) return '';
  
  return text
    .split('')
    .map(char => qwertyToCyrillic[char] || char)
    .join('');
}

/**
 * Конвертирует текст из раскладки ЙЦУКЕН в QWERTY
 * @param {string} text - текст для конвертации
 * @returns {string} - конвертированный текст
 */
export function russianToQwerty(text) {
  if (!text) return '';
  
  return text
    .split('')
    .map(char => cyrillicToQwerty[char] || char)
    .join('');
}

/**
 * Проверяет, содержит ли текст русские буквы
 * @param {string} text - текст для проверки
 * @returns {boolean}
 */
export function isRussian(text) {
  return /[а-яА-ЯёЁ]/.test(text);
}

/**
 * Создаёт все варианты строки для поиска (оригинал + конвертированный)
 * @param {string} text - исходный текст
 * @returns {string[]} - массив вариантов для поиска
 */
export function getSearchVariants(text) {
  if (!text) return [''];
  
  const variants = new Set([text.toLowerCase()]);
  
  // Если текст на русском, добавим вариант на английском
  if (isRussian(text)) {
    variants.add(russianToQwerty(text).toLowerCase());
  } 
  // Если текст на английском, добавим вариант на русском
  else {
    variants.add(qwertyToRussian(text).toLowerCase());
  }
  
  return Array.from(variants);
}

export default {
  qwertyToRussian,
  russianToQwerty,
  isRussian,
  getSearchVariants
};