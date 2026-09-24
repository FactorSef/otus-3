# Структура проекта

```
colorful/
├── src/
│   ├── index.ts        # класс Color (default export) — весь публичный API
│   ├── utils.ts        # чистые функции: isNil, clamp, hexSegmentParser, segmentToHex, rgbToHsl, rgbToHwb
│   └── constants.ts    # regex: распознавание и парсинг форматов hex/rgb/hsl/hwb/alpha
├── es/                 # (gitignore) сборка CommonJS — package.json "main"
├── lib/                # (gitignore) сборка ES2015 + .d.ts — "module", "types"
├── tsconfig.json       # база: rootDir=src, target ES2015, declaration, removeComments; strict выключен
├── tsconfig.lib.json   # outDir lib, module ES2015
├── tsconfig.es.json    # outDir es, module CommonJS
├── package.json        # devDeps: typescript 4.9, prettier 2.8.4, ts-jest, @types/jest (jest не установлен)
├── .prettierrc         # printWidth 180; для ts: табы (4), одинарные кавычки, trailingComma es5, semi
├── .editorconfig       # ts — табы, LF; json — 2 пробела
├── .vscode/settings.json # formatOnSave через Prettier
├── .npmignore          # в пакет не попадают src, конфиги
└── README.md
```

Внимание: названия папок сборки перепутаны по смыслу — `es/` содержит CommonJS, `lib/` — ES-модули. Привязка в `package.json` при этом корректна.

## src/index.ts — класс `Color`

Наследует `Object` (без необходимости).

**Состояние**
- `private initialValue: string` — исходная строка; при создании из массива — имя типа (`'rgb'|'hsl'|'hwb'`); при невалидном вводе — `'unknown'`.
- `r, g, b: number` (0..255), `a: number` (0..1, по умолчанию 1).

**Типы**: `ColorType = string | Color | number[]`, `ColorInitType = 'rgb' | 'hsl' | 'hwb'`, `RGBA = 'r'|'g'|'b'|'a'`.

**Поток создания**
- строка → `parse()` → по первому совпавшему формату `parseHEX` / `parseRGB` / `parseHSL` / `parseHWB`;
- `Color` → копирование полей;
- массив → `initByArray(color, type)` → те же `parse*` с аргументом-массивом.

Модель хранения — всегда RGB. HSL/HWB при парсинге сразу переводятся в RGB (`parseHWB` использует `parseHSL([h,100,50,a])`), обратно — через `rgbToHsl` / `rgbToHwb` при выводе.

**Проверки** — геттеры `isValid`, `isHEX`, `isHEX24`, `isHEX32`, `isRGB`, `isHSL`, `isHWB`, `hasAlpha` и одноимённые `static`-методы (создают `new Color(str)` и читают геттер). Регэкспы из `constants` клонируются через `new RegExp(...)`, т.к. имеют флаг `g` (иначе `lastIndex` ломал бы повторный `test`).

**Вывод** — `toHex(): string[]`, `toHexString`, `toRgbString`, `toHslString`, `toHwbString` (все с `forceAlpha?`), `toString()` → HEX, `[Symbol.toPrimitive]` → строка для `'default'|'string'`.

**Мутация** — `alpha()` / `alpha(value 0..100): this`.

## src/utils.ts

| Функция | Назначение |
|---|---|
| `isNil(v)` | null/undefined |
| `clamp(v, min=0, max=1)` | ограничение диапазона |
| `hexSegmentParser(this: Color, ...chars)` | возвращает колбэк для `['r','g','b','a'].forEach`, пишет пары hex-символов в поля `this`; `a` переводит в 0..1 |
| `segmentToHex(n)` | число → 2-символьный hex |
| `rgbToHsl(r,g,b)` (0..1) | → `[h°, s%, l%]`, округлённые |
| `rgbToHwb(r,g,b)` (0..1) | → `[h°, w%, b%]` |

## src/constants.ts

`regex.hex.{common,x24,x32}`, `regex.{rgb,hsl,hwb}.{simple,parser}`, `regex.alpha.simple`. `simple` — распознавание формата, `parser` — вырезание всего лишнего перед `split(',')`.

## Соглашения

- Табы, одинарные кавычки, точки с запятой, ширина 180 (Prettier).
- Сообщения в консоль — `console.warn('[Color]: ...')`.
- JSDoc только у публичных неочевидных членов.
