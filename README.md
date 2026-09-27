# Otus homework #3

Оригинальный проект находится тут -- https://github.com/FactorSef/colorful


```bash
npm install @factor-sef/colorful
```

## Usage

```TypeScript
import Color from '@factor-sef/colorful';

const color = new Color('#ffffff');

console.log(color.toRgbString()) // => 'rgb(255, 255, 255)'
```

### Hue rotation

```TypeScript
import Color, { AngleUnit } from '@factor-sef/colorful';

new Color('#ff0000').hueRotate(120).toHexString(); // => '#00ff00'
new Color('#ff0000').hueRotate(0.5, AngleUnit.Turn).toHexString(); // => '#00ffff'
new Color('#ff0000').hueRotate(Math.PI, 'rad').toHexString(); // => '#00ffff'
```

Units: `deg` (default), `grad`, `rad`, `turn`. The method mutates the color and returns `this`.

## Roadmap

- [x] Work with HEX
- [x] Work with RGB
- [x] Work with HSL
- [x] Work with HWB
- [x] Get/set hue rotation (set only; current hue via `toHslString()`)
- [x] Get/set alpha
- [ ] Get/set satudation
- [ ] Get/set lightness
- [ ] Get/set blackness
- [ ] set scale
- [ ] set greyscale
