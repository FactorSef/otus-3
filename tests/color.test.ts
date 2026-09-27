//#region Добавление Unit-тестов
import Color from '../src/index';
//#region hue-rotate
import { AngleUnit } from '../src/index';
//#endregion hue-rotate

// Тесты с `test.failing` описывают корректное поведение для известных багов (memory-bank/bugs.md).
// Когда баг исправлен, такой тест начинает проходить, jest падает — замените `test.failing` на `test`.

function rgba(color: Color) {
	return [color.r, color.g, color.b, color.a];
}

let warn: jest.SpyInstance;

beforeEach(() => {
	warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	warn.mockRestore();
});

describe('constructor', () => {
	describe('из строки', () => {
		test.each([
			['#ff8000', [255, 128, 0, 1]],
			['#FF8000', [255, 128, 0, 1]],
			['#ff000080', [255, 0, 0, 0.502]],
			['rgb(255, 128, 0)', [255, 128, 0, 1]],
			['rgba(255, 0, 0, 0.5)', [255, 0, 0, 0.5]],
			['hsl(120, 100%, 50%)', [0, 255, 0, 1]],
			['hsla(240, 100%, 50%, 0.5)', [0, 0, 255, 0.5]],
			['hwb(240 0% 0%)', [0, 0, 255, 1]],
			['hwb(0 20% 30%)', [179, 51, 51, 1]],
			['hwb(0 20% 30% / 0.5)', [179, 51, 51, 0.5]],
		])('%p -> %p', (value, expected) => {
			const color = new Color(value);
			expect(color.isValid).toBe(true);
			expect(rgba(color)).toEqual(expected);
		});

		test('ограничивает каналы RGB диапазоном 0..255', () => {
			expect(rgba(new Color('rgb(300, 128, 0)'))).toEqual([255, 128, 0, 1]);
		});

		test('нормализует hue больше 360', () => {
			expect(rgba(new Color('hsl(480, 100%, 50%)'))).toEqual([0, 255, 0, 1]);
		});

		test('невалидная строка: isValid = false, значения по умолчанию', () => {
			const color = new Color('not a color');
			expect(color.isValid).toBe(false);
			expect(rgba(color)).toEqual([0, 0, 0, 1]);
		});

		test('пустая строка невалидна', () => {
			expect(new Color('').isValid).toBe(false);
		});

		test.failing('B1: поддерживает короткий HEX', () => {
			const color = new Color('#f80');
			expect(color.isHEX).toBe(true);
			expect(rgba(color)).toEqual([255, 136, 0, 1]);
		});

		test.failing('B3: нулевая альфа в rgba', () => {
			expect(new Color('rgba(0, 0, 0, 0)').a).toBe(0);
		});

		test.failing('B3: нулевая альфа в hsla', () => {
			expect(new Color('hsla(0, 0%, 0%, 0)').a).toBe(0);
		});

		test.failing('B3: нулевая альфа в hwb', () => {
			expect(new Color('hwb(0 0% 0% / 0)').a).toBe(0);
		});

		test.failing('B4: пробельный синтаксис CSS Color Level 4', () => {
			expect(rgba(new Color('rgb(255 0 0 / 0.5)'))).toEqual([255, 0, 0, 0.5]);
		});

		test.failing('B4: проценты в rgb', () => {
			expect(rgba(new Color('rgb(100%, 0%, 0%)'))).toEqual([255, 0, 0, 1]);
		});

		test('альфа в hwb при w + b >= 1', () => {
			expect(new Color('hwb(0 60% 40% / 0.5)').a).toBe(0.5);
		});

		test.failing('B5: серый цвет в hwb при w + b >= 1', () => {
			expect(rgba(new Color('hwb(0 60% 40%)'))).toEqual([153, 153, 153, 1]);
		});
	});

	describe('из Color', () => {
		test('копирует каналы и исходное значение', () => {
			const source = new Color('rgba(10, 20, 30, 0.4)');
			const copy = new Color(source);

			expect(copy).not.toBe(source);
			expect(rgba(copy)).toEqual([10, 20, 30, 0.4]);
			expect(copy.isRGB).toBe(true);
			expect(copy.isValid).toBe(true);
		});

		test('копия независима от оригинала', () => {
			const source = new Color('#ffffff');
			const copy = new Color(source);
			copy.alpha(50);
			expect(source.a).toBe(1);
		});
	});

	describe('из массива', () => {
		test.each([
			[[255, 128, 0], 'rgb', [255, 128, 0, 1]],
			[[255, 0, 0, 0.5], 'rgb', [255, 0, 0, 0.5]],
			[[120, 100, 50], 'hsl', [0, 255, 0, 1]],
			[[0, 20, 30], 'hwb', [179, 51, 51, 1]],
		] as const)('%p, %p -> %p', (value, type, expected) => {
			const color = new Color([...value], type);
			expect(rgba(color)).toEqual(expected);
			expect(color.isValid).toBe(true);
			expect(warn).not.toHaveBeenCalled();
		});

		test('без типа разбирается как rgb с предупреждением', () => {
			const color = new Color([255, 128, 0]);
			expect(rgba(color)).toEqual([255, 128, 0, 1]);
			expect(warn).toHaveBeenCalledTimes(1);
		});

		test.failing('B7: цвет из массива без типа валиден', () => {
			expect(new Color([255, 128, 0]).isValid).toBe(true);
		});
	});

	test('неподдерживаемый тип аргумента: предупреждение и isValid = false', () => {
		const color = new Color(42 as unknown as string);
		expect(warn).toHaveBeenCalledTimes(1);
		expect(color.isValid).toBe(false);
		expect(rgba(color)).toEqual([0, 0, 0, 1]);
	});
});

describe('initByArray', () => {
	test('перезаписывает каналы по заданному типу', () => {
		const color = new Color('#000000');
		color.initByArray([0, 100, 50], 'hsl');
		expect(rgba(color)).toEqual([255, 0, 0, 1]);
	});

	test('неизвестный тип — rgb с предупреждением', () => {
		const color = new Color('#000000');
		color.initByArray([1, 2, 3], 'xyz' as 'rgb');
		expect(rgba(color)).toEqual([1, 2, 3, 1]);
		expect(warn).toHaveBeenCalledTimes(1);
	});
});

describe('проверки формата', () => {
	const hex24 = '#ff8000';
	const hex32 = '#ff800080';
	const rgb = 'rgb(255, 128, 0)';
	const rgbA = 'rgba(255, 128, 0, 0.5)';
	const hsl = 'hsl(30, 100%, 50%)';
	const hslA = 'hsla(30, 100%, 50%, 0.5)';
	const hwb = 'hwb(30 0% 0%)';
	const all = [hex24, hex32, rgb, rgbA, hsl, hslA, hwb];

	test.each([
		['isHEX', [hex24, hex32]],
		['isHEX24', [hex24]],
		['isHEX32', [hex32]],
		['isRGB', [rgb, rgbA]],
		['isHSL', [hsl, hslA]],
		['isHWB', [hwb]],
	] as const)('%s (геттер и static)', (method, matching) => {
		all.forEach((value) => {
			const expected = (matching as ReadonlyArray<string>).includes(value);
			expect(new Color(value)[method]).toBe(expected);
			expect(Color[method](value)).toBe(expected);
		});
	});

	test('isValid для всех поддерживаемых форматов', () => {
		all.forEach((value) => expect(new Color(value).isValid).toBe(true));
	});

	test('HEX неверной длины невалиден', () => {
		expect(new Color('#ff80').isValid).toBe(false);
		expect(new Color('#ff80001').isValid).toBe(false);
	});

	test('повторные проверки дают одинаковый результат (регэкспы с флагом g)', () => {
		const color = new Color(hex24);
		expect(color.isHEX).toBe(true);
		expect(color.isHEX).toBe(true);
	});

	test('цвет из массива распознаётся по типу', () => {
		expect(new Color([0, 0, 0], 'rgb').isRGB).toBe(true);
		expect(new Color([0, 0, 0], 'hsl').isHSL).toBe(true);
		expect(new Color([0, 0, 0], 'hwb').isHWB).toBe(true);
	});

	test('hasAlpha (геттер и static)', () => {
		expect(new Color(rgb).hasAlpha).toBe(false);
		expect(new Color(rgbA).hasAlpha).toBe(true);
		expect(Color.hasAlpha(hex24)).toBe(false);
		expect(Color.hasAlpha(hex32)).toBe(true);
	});

	test.failing('B6: префикс hw( не является HWB', () => {
		expect(Color.isHWB('hw(0 0% 0%)')).toBe(false);
	});
});

describe('toHex', () => {
	test('каналы r, g, b в hex', () => {
		const [r, g, b] = new Color('#ff8000').toHex();
		expect([r, g, b]).toEqual(['ff', '80', '00']);
	});

	test.failing('B10: альфа переводится в 00..ff', () => {
		expect(new Color('#ff8000').toHex()).toEqual(['ff', '80', '00', 'ff']);
	});
});

describe('toHexString', () => {
	test('без альфы — 6 символов', () => {
		expect(new Color('rgb(255, 128, 0)').toHexString()).toBe('#ff8000');
	});

	test.failing('B10: с альфой — 8 символов', () => {
		expect(new Color('rgba(255, 0, 0, 0.5)').toHexString()).toBe('#ff000080');
	});

	test.failing('B10: forceAlpha', () => {
		expect(new Color('#ff8000').toHexString(true)).toBe('#ff8000ff');
	});
});

describe('toRgbString', () => {
	test('без альфы', () => {
		expect(new Color('#ff8000').toRgbString()).toBe('rgb(255, 128, 0)');
	});

	test('с альфой', () => {
		expect(new Color('#ff000080').toRgbString()).toBe('rgba(255, 0, 0, 0.502)');
	});

	test('forceAlpha', () => {
		expect(new Color('#ff8000').toRgbString(true)).toBe('rgba(255, 128, 0, 1)');
	});
});

describe('toHslString', () => {
	test('без альфы', () => {
		expect(new Color('#ff0000').toHslString()).toBe('hsl(0, 100%, 50%)');
	});

	test('с альфой', () => {
		expect(new Color('rgba(0, 255, 0, 0.5)').toHslString()).toBe('hsla(120, 100%, 50%, 0.5)');
	});

	test('forceAlpha', () => {
		expect(new Color('#0000ff').toHslString(true)).toBe('hsla(240, 100%, 50%, 1)');
	});

	test.failing('B11: hue серого равен 0', () => {
		expect(new Color('#ffffff').toHslString()).toBe('hsl(0, 0%, 100%)');
	});
});

describe('toHwbString', () => {
	test('с альфой', () => {
		expect(new Color('rgba(255, 0, 0, 0.5)').toHwbString()).toBe('hwb(0 0% 0% / 0.5)');
	});

	test('forceAlpha', () => {
		expect(new Color('#ff0000').toHwbString(true)).toBe('hwb(0 0% 0% / 1)');
	});

	test.failing('B9: без альфы используется префикс hwb(', () => {
		expect(new Color('#ff0000').toHwbString()).toBe('hwb(0 0% 0%)');
	});

	test.failing('B8: whiteness и blackness сохраняются', () => {
		expect(new Color('hwb(0 20% 30% / 0.5)').toHwbString()).toBe('hwb(0 20% 30% / 0.5)');
	});
});

describe('toString / Symbol.toPrimitive', () => {
	test('toString возвращает HEX', () => {
		expect(new Color('rgb(255, 128, 0)').toString()).toBe('#ff8000');
	});

	test('приведение к строке', () => {
		const color = new Color('rgb(255, 128, 0)');
		expect(`${color}`).toBe('#ff8000');
		expect(String(color)).toBe('#ff8000');
		expect(color + '').toBe('#ff8000');
	});
});

describe('alpha', () => {
	test('геттер возвращает проценты', () => {
		expect(new Color('#ff8000').alpha()).toBe(100);
		expect(new Color('rgba(0, 0, 0, 0.5)').alpha()).toBe(50);
	});

	test('сеттер переводит проценты в 0..1 и возвращает this', () => {
		const color = new Color('#ff8000');
		expect(color.alpha(50)).toBe(color);
		expect(color.a).toBe(0.5);
	});

	test('сеттер округляет до 3 знаков', () => {
		expect(new Color('#000000').alpha(33.3333).a).toBe(0.333);
	});

	test('сеттер ограничивает 0..100', () => {
		expect(new Color('#000000').alpha(150).a).toBe(1);
		expect(new Color('#000000').alpha(-10).a).toBe(0);
	});

	test('сеттер влияет на hasAlpha и вывод', () => {
		const color = new Color('#ff8000').alpha(50);
		expect(color.hasAlpha).toBe(true);
		expect(color.toRgbString()).toBe('rgba(255, 128, 0, 0.5)');
	});

	test.failing('B12: геттер без погрешности плавающей точки', () => {
		expect(new Color('rgba(0, 0, 0, 0.07)').alpha()).toBe(7);
		expect(new Color('rgba(0, 0, 0, 0.57)').alpha()).toBe(57);
	});
});
//#endregion Добавление Unit-тестов

//#region hue-rotate
describe('hueRotate', () => {
	test.each([
		[120, undefined, '#00ff00'],
		[240, 'deg', '#0000ff'],
		[-120, undefined, '#0000ff'],
		[0.5, AngleUnit.Turn, '#00ffff'],
		[Math.PI, AngleUnit.Rad, '#00ffff'],
		[200, AngleUnit.Grad, '#00ffff'],
		[-200, AngleUnit.Grad, '#00ffff'],
	] as const)('#ff0000, %p %p -> %p', (value, unit, expected) => {
		expect(new Color('#ff0000').hueRotate(value, unit).toHexString()).toBe(expected);
	});

	test.each([
		[0, AngleUnit.Deg],
		[360, AngleUnit.Deg],
		[720, AngleUnit.Deg],
		[1, AngleUnit.Turn],
		[2 * Math.PI, AngleUnit.Rad],
		[400, AngleUnit.Grad],
	] as const)('поворот на %p %p не меняет цвет', (value, unit) => {
		expect(new Color('#123456').hueRotate(value, unit).toHexString()).toBe('#123456');
	});

	test('сохраняет насыщенность и светлоту', () => {
		const color = new Color('#123456').hueRotate(90);
		expect(color.toHslString()).toBe('hsl(300, 65%, 20%)');
	});

	test('повороты складываются', () => {
		const color = new Color('#ff0000').hueRotate(60).hueRotate(60);
		expect(color.toHexString()).toBe('#00ff00');
	});

	test.each(['#808080', '#ffffff', '#000000'])('серый %p не меняется', (value) => {
		expect(new Color(value).hueRotate(90).toHexString()).toBe(value);
	});

	test('альфа сохраняется', () => {
		const color = new Color([255, 0, 0, 0.5], 'rgb').hueRotate(120);
		expect(rgba(color)).toEqual([0, 255, 0, 0.5]);
	});

	test('изменяет экземпляр и возвращает this', () => {
		const color = new Color('#ff0000');
		expect(color.hueRotate(10)).toBe(color);
		expect(color.toHexString()).not.toBe('#ff0000');
	});

	test('цепочка с alpha()', () => {
		const color = new Color('#ff0000').hueRotate(120).alpha(50);
		expect(rgba(color)).toEqual([0, 255, 0, 0.5]);
	});

	test.each([NaN, Infinity, -Infinity, '90' as unknown as number])('некорректный угол %p: цвет не меняется, предупреждение', (value) => {
		const color = new Color('#ff0000');
		expect(color.hueRotate(value)).toBe(color);
		expect(color.toHexString()).toBe('#ff0000');
		expect(warn).toHaveBeenCalledTimes(1);
	});

	test('неизвестная единица: поворот в deg, предупреждение', () => {
		const color = new Color('#ff0000').hueRotate(120, 'foo' as AngleUnit);
		expect(color.toHexString()).toBe('#00ff00');
		expect(warn).toHaveBeenCalledTimes(1);
	});

	test('AngleUnit — строковый enum', () => {
		expect(Object.values(AngleUnit)).toEqual(['deg', 'grad', 'rad', 'turn']);
	});
});
//#endregion hue-rotate
