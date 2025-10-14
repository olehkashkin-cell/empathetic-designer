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

## Шаг 4: Редактирование package.json

Откройте файл `package.json` в корне проекта. Он будет выглядеть примерно так:

```json
{
  "name": "empathetic-designer",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    ...
  }
}
```

**Что нужно изменить:**

1. **Добавьте поле `"main"`** сразу после `"type": "module",` (на том же уровне, не внутри scripts):
```json
"main": "electron/main.js",
```

2. **Добавьте новые скрипты** в секцию `"scripts"`:
```json
"electron": "electron .",
"electron:dev": "npm run dev & electron .",
"electron:build": "npm run build && electron-builder",
"electron:build:win": "npm run build && electron-builder --win"
```

**После изменений package.json должен выглядеть так:**

```json
{
  "name": "empathetic-designer",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "electron": "electron .",
    "electron:dev": "npm run dev & electron .",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win"
  },
  "dependencies": {
    ...
  }
}
```

⚠️ **ВАЖНО**: 
- Не забудьте запятые после каждой строки (кроме последней в каждой секции)
- `"main"` должен быть на одном уровне с `"name"`, `"version"`, `"scripts"` и т.д.
- Новые скрипты добавляются внутрь существующей секции `"scripts"`

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

## Решение проблем:

### Ошибка "Access is denied" при сборке
Если вы видите ошибку:
```
⨯ remove C:\Users\...\release\win-unpacked\AI Помощник.exe: Access is denied.
```

**Решение:**
1. **Закройте приложение** если оно запущено (проверьте трей и диспетчер задач)
2. **Удалите папку release**:
   ```bash
   rmdir /s /q release
   ```
3. **Попробуйте снова**:
   ```bash
   npm run electron:build:win
   ```

Если не помогло:
- Отключите антивирус временно
- Запустите командную строку от имени администратора
- Добавьте папку проекта в исключения антивируса

## Примечания:
- Для Windows сборки нужна Windows система (или CI/CD)
- Для Mac сборки нужна macOS система
- Размер установщика будет ~150-200 MB
