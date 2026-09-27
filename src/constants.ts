export const regex = {
	hex: {
		common: /^\#([a-f\d]{2}){3,4}$/gi,
		x24: /^\#([a-f\d]{2}){3}$/gi,
		x32: /^\#([a-f\d]{2}){4}$/gi,
	},
	rgb: {
		simple: /^rgb(a)?\((.*)\)$/gi,
		parser: /[^\d,.]/gi,
	},
	hsl: {
		simple: /^hsl(a)?\((.*)\)$/gi,
		parser: /[^\d,.\%]/gi,
	},
	hwb: {
		simple: /^hwb?\((.*)(\/)?(.*)\)$/gi,
		parser: /[^\d,.\%]+/gi,
	},
	alpha: {
		simple: /(rgba|hsla|\/)/gi,
	},
};

//#region hue-rotate
/** Angle units as in CSS `<angle>` */
export enum AngleUnit {
	Deg = 'deg',
	Grad = 'grad',
	Rad = 'rad',
	Turn = 'turn',
}

export const degreesPerAngleUnit: Record<AngleUnit, number> = {
	[AngleUnit.Deg]: 1,
	[AngleUnit.Grad]: 360 / 400,
	[AngleUnit.Rad]: 180 / Math.PI,
	[AngleUnit.Turn]: 360,
};
//#endregion hue-rotate
