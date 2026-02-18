---
description: How to save or restore code versions
---

## Сохранение версии (Checkpoint)

Чтобы сохранить текущее исправное состояние кода, запустите:
```powershell
npm run save
```
Вы также можете добавить описание:
```powershell
npm run save "Исправил таблицу"
```

## Отмена изменений (Undo)

Если что-то сломалось и вы хотите вернуться к последнему сохранению:
```powershell
npm run undo
```
*Внимание: это удалит все незасохраненные изменения в коде!*

## Просмотр истории (History)

Чтобы увидеть список всех сохраненных версий:
```powershell
git log --oneline
```

## Возврат к конкретной версии

1. Найдите ID нужной версии через `git log --oneline`.
2. Запустите:
```powershell
git reset --hard [ID_ВЕРСИИ]
```
*(например: `git reset --hard 3bc6b08`)*
