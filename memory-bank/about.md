# О проекте

`@factor-sef/colorful` (v1.1.1, MIT) — библиотека на TypeScript без runtime-зависимостей: объект `Color` для работы с цветом в JavaScript. Ориентир — [CSS Color Module Level 4](https://drafts.csswg.org/css-color/#introduction).

Текущий репозиторий — домашнее задание Otus №3 на основе оригинала https://github.com/FactorSef/colorful.

## Сценарии использования

- **Конвертация между форматами** — принять цвет в HEX / RGB / HSL / HWB и отдать в любом другом (например, HEX из дизайн-макета → `rgba()` для CSS-in-JS).
- **Валидация пользовательского ввода** — проверить, что строка является корректным цветом нужного формата (`Color.isHEX('#ff0000')`, `new Color(input).isValid`).
- **Работа с прозрачностью** — прочитать/изменить alpha и получить строку с альфа-каналом.
- **Создание цвета из чисел** — собрать цвет из массива компонент (например, результат расчётов) с указанием модели.
- **Клонирование** — `new Color(otherColor)` копирует компоненты.

## Установка

```bash
npm install @factor-sef/colorful
```

## Использование

```ts
import Color from '@factor-sef/colorful';

// Из строки
const white = new Color('#ffffff');
white.toRgbString();   // 'rgb(255, 255, 255)'
white.toHslString();   // 'hsl(NaN, 0%, 100%)'  — см. bugs.md, hue для серых = NaN
`${white}`;            // '#ffffff' (toString / Symbol.toPrimitive → HEX)

new Color('rgba(255, 0, 0, 0.5)').toHexString(); // см. bugs.md — alpha в HEX сломан
new Color('hsl(120, 100%, 50%)').toRgbString();  // 'rgb(0, 255, 0)'
new Color('hwb(240 0% 0%)').toRgbString();       // 'rgb(0, 0, 255)'

// Из массива: [c1, c2, c3, alpha?], тип по умолчанию 'rgb' (с предупреждением)
new Color([255, 128, 0], 'rgb');
new Color([200, 50, 50, 0.8], 'hsl');
new Color([0, 20, 20], 'hwb');

// Копия
const copy = new Color(white);

// Проверки формата (геттеры экземпляра и статические методы)
white.isValid;            // true
white.isHEX;              // true (isHEX24 | isHEX32)
Color.isRGB('rgb(0,0,0)'); // true
Color.hasAlpha('#ff000080');

// Прозрачность: в API — проценты 0..100, внутри — 0..1
white.alpha();       // 100
white.alpha(50);     // устанавливает a = 0.5, возвращает this (chainable)
white.toRgbString(); // 'rgba(255, 255, 255, 0.5)'

// forceAlpha — принудительно выводить альфа-канал
white.alpha(100).toRgbString(true); // 'rgba(255, 255, 255, 1)'
```

### Поддерживаемые входные форматы

| Формат | Пример | Замечания |
|---|---|---|
| HEX 6/8 | `#ff0000`, `#ff000080` | Короткая форма `#f00` не поддерживается (bugs.md) |
| RGB/RGBA | `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)` | Только числа через запятую; проценты и пробельный синтаксис L4 не работают |
| HSL/HSLA | `hsl(120, 100%, 50%)`, `hsla(120, 100%, 50%, 0.5)` | Через запятую |
| HWB | `hwb(120 20% 30%)`, `hwb(120 20% 30% / 0.5)` | Через пробел |

Нераспознанная строка не бросает исключение: `isValid === false`, компоненты остаются `0,0,0,1`.

## Сборка

```bash
npm run build      # build:lib + build:es
npm run build:lib  # → lib/  (ES2015 modules, .d.ts) — поля "module" и "types"
npm run build:es   # → es/   (CommonJS)              — поле "main"
```

## Тесты

```bash
npm test               # unit-тесты (jest 29 + ts-jest)
npm run test:coverage  # с отчётом покрытия в coverage/
```

Тесты лежат в `tests/`. Известные баги из `bugs.md` описаны через `test.failing`: такой тест проверяет правильное поведение и пока падает. После исправления бага jest потребует перевести его в обычный `test`.

## Roadmap (из README)

Сделано: HEX, RGB, HSL, HWB, get/set alpha.
Не сделано: hue rotation, saturation, lightness, blackness, scale, greyscale.
