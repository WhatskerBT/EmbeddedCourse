/**
 * Конфігурація сайту
 * Редагуйте ці значення для оновлення інформації на сайті
 */
const CONFIG = {
  // Назва курсу
  courseName: "Embedded Defence Lab",

  // Ціна курсу
  price: "15 000 ₴",
  priceNote: "* Можлива оплата частинами",

  // Локація
  location: "Київ, район метро Либідська",
  locationNote: "Повна адреса надсилається після реєстрації",

  // Telegram Bot API для сповіщень
  telegram: {
    botToken: "YOUR_BOT_TOKEN_HERE",
    chatId: "YOUR_CHAT_ID_HERE"
  },

  // Google Sheets API
  googleSheets: {
    scriptUrl: "YOUR_GOOGLE_SCRIPT_URL_HERE"
  },

  // Google Tag Manager ID
  gtmId: "GTM-XXXXXXX",

  // Контактна інформація
  contact: {
    telegram: "@embedded_course_ua"
  }
};

// Експорт для використання в інших файлах
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
