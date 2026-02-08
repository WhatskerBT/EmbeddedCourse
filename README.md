# Embedded Systems Pro - Лендінг

Освітній лендінг для офлайн-курсу Embedded розробки у Києві.

## 📁 Структура проєкту

```
embedded-course/
├── index.html          # Головна сторінка
├── css/
│   └── style.css       # Стилі (Dark Tech / Industrial)
├── js/
│   ├── config.js       # Конфігурація (ціна, API ключі)
│   └── main.js         # Інтерактивність та форми
├── assets/
│   └── logo.svg        # Логотип
└── README.md           # Документація
```

## 🚀 Швидкий старт

1. Відкрийте `js/config.js` та налаштуйте:
   - Ціну курсу
   - Назву локації
   - API ключі (Telegram, Google Sheets)

2. Відкрийте `index.html` у браузері або розгорніть на хостингу.

## ⚙️ Налаштування інтеграцій

### Telegram Bot (сповіщення про заявки)

1. Створіть бота через [@BotFather](https://t.me/BotFather):
   - Напишіть `/newbot`
   - Дайте йому ім'я та username
   - Скопіюйте **API Token**

2. Отримайте Chat ID:
   - Додайте бота в групу або напишіть йому
   - Перейдіть: `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Знайдіть `"chat":{"id":XXXXXXXXX}` — це ваш Chat ID

3. Додайте в `js/config.js`:
   ```javascript
   telegram: {
     botToken: "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
     chatId: "-100123456789"  // Для групи починається з -100
   }
   ```

### Google Sheets (збереження заявок)

1. Створіть Google Таблицю з колонками:
   - A: Ім'я
   - B: Телефон
   - C: Telegram
   - D: Дата

2. Перейдіть: **Розширення → Apps Script**

3. Вставте код:
   ```javascript
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     const data = JSON.parse(e.postData.contents);
     
     sheet.appendRow([
       data.name,
       data.phone,
       data.telegram || '',
       new Date(data.timestamp).toLocaleString('uk-UA')
     ]);
     
     return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

4. Опублікуйте:
   - **Розгортання → Нове розгортання**
   - Тип: **Веб-додаток**
   - Доступ: **Будь-хто**
   - Скопіюйте URL

5. Додайте в `js/config.js`:
   ```javascript
   googleSheets: {
     scriptUrl: "https://script.google.com/macros/s/AKfycbw.../exec"
   }
   ```

### Google Tag Manager

1. Створіть контейнер GTM
2. Скопіюйте GTM ID (формат: `GTM-XXXXXXX`)
3. Додайте в `js/config.js`:
   ```javascript
   gtmId: "GTM-XXXXXXX"
   ```

4. Додайте GTM код в `<head>` файлу `index.html`:
   ```html
   <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
   new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
   j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
   'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
   })(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
   ```

## 📊 Аналітика подій

Сайт автоматично відправляє події в dataLayer:

| Подія | Опис |
|-------|------|
| `form_submission` | Успішна відправка форми |
| `custom_event` | Клік на якорі, інтерактивні елементи |

## 🎨 Кастомізація дизайну

Всі кольори та змінні дизайну знаходяться в `css/style.css`:

```css
:root {
  --bg-primary: #0D0D0D;       /* Основний фон */
  --accent-green: #00FF41;      /* Matrix Green */
  --accent-orange: #FF4500;     /* Safety Orange */
  --font-mono: 'JetBrains Mono'; /* Моноширинний шрифт */
}
```

## 📱 Адаптивність

- **Desktop**: 1200px+
- **Tablet**: 768px - 1024px
- **Mobile**: до 768px

## 🔒 Безпека

- API ключі не повинні публікуватися у відкритих репозиторіях
- Форма має базову валідацію на клієнті
- Дані зберігаються локально як бекап при помилках API

## 📝 Ліцензія

© 2026 Embedded Systems Pro. Всі права захищені.
