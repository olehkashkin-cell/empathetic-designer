# Инструкции по сборке .exe установщика

## Шаг 1: Экспорт проекта
1. В Lovable нажмите GitHub → Connect to GitHub
2. Создайте репозиторий и экспортируйте проект

## Шаг 2: Локальная настройка
Склонируйте репозиторий на компьютер:
```bash
git clone <ваш-репозиторий-url>
cd <название-проекта>
```

## Шаг 3: Установка зависимостей
```bash
npm install
npm install --save-dev electron electron-builder
```

## Шаг 4: Добавление скриптов в package.json
Откройте `package.json` и добавьте в секцию `"scripts"`:
```json
{
  "scripts": {
    "electron": "electron .",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win"
  },
  "main": "electron/main.js"
}
```

## Шаг 5: Настройка переменных окружения
Создайте файл `.env` с вашими API ключами:
```
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_ELEVENLABS_VOICE_ID=your_voice_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## Шаг 6: Сборка приложения
```bash
npm run electron:build:win
```

Готовый установщик `.exe` будет в папке `release/`

## Для других платформ:
- **Mac**: `npm run electron:build -- --mac`
- **Linux**: `npm run electron:build -- --linux`

## Тестирование перед сборкой:
```bash
npm run dev
# В другом терминале:
npm run electron
```

## Примечания:
- Для Windows сборки нужна Windows система (или CI/CD)
- Для Mac сборки нужна macOS система
- Размер установщика будет ~150-200 MB
