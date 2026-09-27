# Структура проекта

```
colorful/
├── src/
│   ├── index.ts        # класс Color (default export) + реэкспорт AngleUnit — весь публичный API
│   ├── utils.ts        # чистые функции: isNil, clamp, hexSegmentParser, segmentToHex, rgbToHslRaw, rgbToHsl, rgbToHwb, angleToDegrees, normalizeHue
│   └── constants.ts    # regex форматов hex/rgb/hsl/hwb/alpha; enum AngleUnit и degreesPerAngleUnit
├── tests/
│   ├── utils.test.ts   # тесты функций из src/utils.ts
│   └── color.test.ts   # тесты класса Color
├── jest.config.js      # ts-jest, roots: tests/
├── es/                 # (gitignore) сборка CommonJS — package.json "main"
├── lib/                # (gitignore) сборка ES2015 + .d.ts — "module", "types"
├── coverage/           # (gitignore) отчёт npm run test:coverage
├── tsconfig.json       # база: include=src, rootDir=src, target ES2015, declaration, removeComments; strict выключен
├── tsconfig.lib.json   # outDir lib, module ES2015
├── tsconfig.es.json    # outDir es, module CommonJS
├── package.json        # devDeps: typescript 4.9, prettier 2.8.4, jest 29, ts-jest, @types/jest; скрипты build, test, test:coverage
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

**Мутация** (возвращают `this`)
- `alpha()` / `alpha(value 0..100): this`.
- `hueRotate(value, unit = AngleUnit.Deg): this` — поворот тона в HSL: `rgbToHslRaw` → `h + angleToDegrees(value, unit)` → `normalizeHue` → `parseHSL([h, s*100, l*100])`. Альфа в `parseHSL` не передаётся и остаётся прежней. Серые (s = 0) не меняются. Невалидный угол → `console.warn`, без изменений; неизвестная единица → `console.warn`, считается `deg` (проверка по ключам `degreesPerAngleUnit`, без `Object.values`/`includes` — target ES2015).

## src/utils.ts

| Функция | Назначение |
|---|---|
| `isNil(v)` | null/undefined |
| `clamp(v, min=0, max=1)` | ограничение диапазона |
| `hexSegmentParser(this: Color, ...chars)` | возвращает колбэк для `['r','g','b','a'].forEach`, пишет пары hex-символов в поля `this`; `a` переводит в 0..1 |
| `segmentToHex(n)` | число → 2-символьный hex |
| `rgbToHslRaw(r,g,b)` (0..1) | → `[h°, s 0..1, l 0..1]` без округления; h = NaN для серых |
| `rgbToHsl(r,g,b)` (0..1) | округлённый `rgbToHslRaw` → `[h°, s%, l%]` |
| `angleToDegrees(value, unit)` | угол в `AngleUnit` → градусы (без нормализации) |
| `normalizeHue(deg)` | любой угол → 0..360 (360 не включительно) |
| `rgbToHwb(r,g,b)` (0..1) | → `[h°, w%, b%]` |

## src/constants.ts

`regex.hex.{common,x24,x32}`, `regex.{rgb,hsl,hwb}.{simple,parser}`, `regex.alpha.simple`. `simple` — распознавание формата, `parser` — вырезание всего лишнего перед `split(',')`.

`enum AngleUnit { Deg = 'deg', Grad = 'grad', Rad = 'rad', Turn = 'turn' }` — строковый enum единиц угла (как CSS `<angle>`); `degreesPerAngleUnit` — сколько градусов в единице (1, 0.9, 180/π, 360). Параметры принимают `AngleUnit | \`${AngleUnit}\``, чтобы из JS можно было передать строку.

## Соглашения

- Табы, одинарные кавычки, точки с запятой, ширина 180 (Prettier).
- Сообщения в консоль — `console.warn('[Color]: ...')`.
- JSDoc только у публичных неочевидных членов.
