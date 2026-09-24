# CLAUDE.md

`@factor-sef/colorful` — TypeScript-библиотека без runtime-зависимостей: класс `Color` для парсинга и конвертации цветов HEX / RGB / HSL / HWB (ориентир — CSS Color Level 4). Домашнее задание Otus №3 на основе https://github.com/FactorSef/colorful.

## Memory bank

Прочитай перед работой:

- [memory-bank/about.md](memory-bank/about.md) — описание, сценарии использования, API и примеры, сборка, roadmap
- [memory-bank/structure.md](memory-bank/structure.md) — файлы, устройство класса `Color`, утилиты, соглашения
- [memory-bank/bugs.md](memory-bank/bugs.md) — известные ошибки с номерами (B1…B12, I1…I7) и ссылками на строки

Держи memory-bank актуальным: исправил ошибку — удали или отметь её в `bugs.md`; изменил API или структуру — обнови `about.md` / `structure.md`.

## Команды

```bash
npm install
npm run build   # tsc → lib/ (ESM + .d.ts) и es/ (CommonJS)
```

Тестов пока нет (см. bugs.md, I1).

## Правила

- Стиль — Prettier (`.prettierrc`): табы, одинарные кавычки, `;`, ширина 180.
- Код только в `src/`; `lib/` и `es/` — артефакты сборки, не редактировать.
- Внутреннее хранение цвета — всегда RGB (`r,g,b` 0..255, `a` 0..1); прочие модели конвертируются при парсинге/выводе.
- Публичный API в `alpha()` — проценты 0..100.
