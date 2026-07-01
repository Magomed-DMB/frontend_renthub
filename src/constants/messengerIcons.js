// Иконки для мессенджеров
export const MESSENGER_ICONS = {
  telegram: '/icons/telegram-logo.svg',
  whatsapp: '/icons/whatsapp-logo.svg',
  phone: '/icons/phone.svg',
  max: '/icons/max-logo.svg',
};

// Названия типов
export const TYPE_LABELS = {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  phone: 'Телефон',
  max: 'Max',
};

// Цвета по умолчанию
export const DEFAULT_COLORS = {
  telegram: '#0088cc',
  whatsapp: '#25D366',
  phone: '#10B981',
  max: '#8B5CF6',
};

// ✅ Нормализация типа (приводим к нижнему регистру)
export const normalizeType = (type) => {
  if (!type) return 'telegram';
  const normalized = type.toLowerCase().trim();
  const typeMap = {
    'telegram': 'telegram',
    'whatsapp': 'whatsapp',
    'phone': 'phone',
    'телефон': 'phone',
    'звонок': 'phone',
    'позвонить': 'phone',
    'max': 'max',
  };
  return typeMap[normalized] || normalized;
};

export default {
  MESSENGER_ICONS,
  TYPE_LABELS,
  DEFAULT_COLORS,
  normalizeType
};