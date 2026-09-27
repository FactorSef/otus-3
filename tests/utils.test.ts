//#region Добавление Unit-тестов
import type Color from '../src/index';
import { clamp, hexSegmentParser, isNil, rgbToHsl, rgbToHwb, segmentToHex } from '../src/utils';
//#region hue-rotate
import { AngleUnit } from '../src/constants';
import { angleToDegrees, normalizeHue, rgbToHslRaw } from '../src/utils';
//#endregion hue-rotate

// Тесты с `test.failing` описывают корректное поведение для известных багов (memory-bank/bugs.md).
// Когда баг исправлен, такой тест начинает проходить, jest падает — замените `test.failing` на `test`.

describe('isNil', () => {
	test.each([null, undefined])('%p -> true', (value) => {
		expect(isNil(value)).toBe(true);
	});

	test.each([0, '', false, NaN, {}, []])('%p -> false', (value) => {
		expect(isNil(value)).toBe(false);
	});
});

describe('clamp', () => {
	test('по умолчанию ограничивает диапазоном 0..1', () => {
		expect(clamp(-0.5)).toBe(0);
		expect(clamp(0.5)).toBe(0.5);
		expect(clamp(1.5)).toBe(1);
	});

	test('учитывает переданные границы', () => {
		expect(clamp(-10, 0, 255)).toBe(0);
		expect(clamp(128, 0, 255)).toBe(128);
		expect(clamp(300, 0, 255)).toBe(255);
	});

	test('границы включительно', () => {
		expect(clamp(0, 0, 255)).toBe(0);
		expect(clamp(255, 0, 255)).toBe(255);
	});
});

describe('segmentToHex', () => {
	test.each([
		[0, '00'],
		[15, '0f'],
		[16, '10'],
		[128, '80'],
		[255, 'ff'],
	])('%p -> %p', (value, expected) => {
		expect(segmentToHex(value)).toBe(expected);
	});
});

describe('hexSegmentParser', () => {
	function parse(hex: string, keys: Array<string>) {
		const target = { r: 0, g: 0, b: 0, a: 1 };
		keys.forEach(hexSegmentParser.apply(target as unknown as Color, hex.split('')));
		return target;
	}

	test('разбирает пары символов в r, g, b', () => {
		expect(parse('ff8000', ['r', 'g', 'b'])).toEqual({ r: 255, g: 128, b: 0, a: 1 });
	});

	test('регистр не важен', () => {
		expect(parse('FFaB10', ['r', 'g', 'b'])).toEqual({ r: 255, g: 171, b: 16, a: 1 });
	});

	test('альфа переводится в 0..1 с точностью 3 знака', () => {
		expect(parse('00000080', ['r', 'g', 'b', 'a']).a).toBe(0.502);
		expect(parse('000000ff', ['r', 'g', 'b', 'a']).a).toBe(1);
		expect(parse('00000000', ['r', 'g', 'b', 'a']).a).toBe(0);
	});
});

describe('rgbToHsl', () => {
	test.each([
		[
			[1, 0, 0],
			[0, 100, 50],
		],
		[
			[0, 1, 0],
			[120, 100, 50],
		],
		[
			[0, 0, 1],
			[240, 100, 50],
		],
		[
			[1, 1, 0],
			[60, 100, 50],
		],
		[
			[1, 0, 0.5],
			[330, 100, 50],
		],
		[
			[0.8, 0.2, 0.2],
			[0, 60, 50],
		],
	])('%p -> %p', ([r, g, b], expected) => {
		expect(rgbToHsl(r, g, b)).toEqual(expected);
	});

	test('насыщенность и светлота серого', () => {
		const [, s, l] = rgbToHsl(0.5, 0.5, 0.5);
		expect(s).toBe(0);
		expect(l).toBe(50);
	});

	test.failing('B11: hue ахроматического цвета равен 0, а не NaN', () => {
		expect(rgbToHsl(1, 1, 1)).toEqual([0, 0, 100]);
		expect(rgbToHsl(0, 0, 0)).toEqual([0, 0, 0]);
	});
});

describe('rgbToHwb', () => {
	test.each([
		[
			[1, 0, 0],
			[0, 0, 0],
		],
		[
			[0, 1, 0],
			[120, 0, 0],
		],
		[
			[0, 0, 1],
			[240, 0, 0],
		],
	])('%p -> %p', ([r, g, b], expected) => {
		expect(rgbToHwb(r, g, b)).toEqual(expected);
	});

	test.failing('B8: whiteness и blackness не округляются до 0/100', () => {
		expect(rgbToHwb(0.8, 0.2, 0.2)).toEqual([0, 20, 20]);
	});

	test.failing('B11: hue ахроматического цвета равен 0, а не NaN', () => {
		expect(rgbToHwb(1, 1, 1)).toEqual([0, 100, 0]);
	});
});
//#endregion Добавление Unit-тестов

//#region hue-rotate
describe('angleToDegrees', () => {
	test.each([
		[90, AngleUnit.Deg, 90],
		[200, AngleUnit.Grad, 180],
		[Math.PI, AngleUnit.Rad, 180],
		[0.25, AngleUnit.Turn, 90],
		[-1, 'turn', -360],
		[400, 'grad', 360],
	] as const)('%p %p -> %p', (value, unit, expected) => {
		expect(angleToDegrees(value, unit)).toBeCloseTo(expected, 10);
	});
});

describe('normalizeHue', () => {
	test.each([
		[0, 0],
		[90, 90],
		[360, 0],
		[720, 0],
		[-30, 330],
		[-360, 0],
		[450.5, 90.5],
	])('%p -> %p', (value, expected) => {
		expect(normalizeHue(value)).toBe(expected);
	});
});

describe('rgbToHslRaw', () => {
	test('возвращает неокруглённые значения, s и l в 0..1', () => {
		expect(rgbToHslRaw(1, 0, 0)).toEqual([0, 1, 0.5]);

		const [h, s, l] = rgbToHslRaw(18 / 255, 52 / 255, 86 / 255);
		expect(h).toBeCloseTo(210, 10);
		expect(s).toBeCloseTo(0.6538, 4);
		expect(l).toBeCloseTo(0.2039, 4);
	});

	test('hue ахроматического цвета — NaN, s = 0', () => {
		const [h, s] = rgbToHslRaw(0.5, 0.5, 0.5);
		expect(h).toBeNaN();
		expect(s).toBe(0);
	});

	test('rgbToHsl после рефакторинга — округлённый rgbToHslRaw', () => {
		expect(rgbToHsl(18 / 255, 52 / 255, 86 / 255)).toEqual([210, 65, 20]);

		for (let i = 0; i < 1000; i++) {
			const [r, g, b] = [Math.random(), Math.random(), Math.random()];
			const [h, s, l] = rgbToHslRaw(r, g, b);
			expect(rgbToHsl(r, g, b)).toEqual([Math.round(h), Math.round(s * 100), Math.round(l * 100)]);
		}
	});
});
//#endregion hue-rotate
