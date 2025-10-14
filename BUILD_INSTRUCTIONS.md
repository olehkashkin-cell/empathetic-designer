# Инструкции по сборке .exe установщика

## Шаг 1: Экспорт проекта
⚠️ **ВАЖНО**: Нельзя просто скачать файлы - нужен полный экспорт!

1. В Lovable нажмите кнопку **GitHub** в правом верхнем углу
2. Выберите **Connect to GitHub** (если еще не подключен)
3. Создайте новый репозиторий или выберите существующий
4. Дождитесь завершения экспорта

## Шаг 2: Клонирование репозитория
Склонируйте репозиторий на компьютер:
```bash
git clone <ваш-репозиторий-url>
cd <название-проекта>
```

⚠️ Если вы видите ошибку "package.json not found", значит вы пропустили Шаг 1!

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
Файл `.env` должен быть автоматически экспортирован из Lovable.
Проверьте что он содержит:
```
VITE_SUPABASE_PROJECT_ID=nfxpupmeddcxqaajaiyq
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
VITE_SUPABASE_URL=https://nfxpupmeddcxqaajaiyq.supabase.co
```

✅ Эти переменные уже настроены автоматически при экспорте из Lovable

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
