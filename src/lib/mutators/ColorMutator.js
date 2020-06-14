import { ColorMutatorDefaults as defaults } from '../defaults';
import _ from '../utils';
import DefaultMutator from './DefaultMutator';


class ColorMutator extends DefaultMutator {
    constructor(element, key, params) {
        params = _.merge(defaults.params, params);
        super(element, key, params);
        const w = this;
        w.value = [null, null, null, null];
        
    }

    get style() {
        const w = this;
        const mode = w.value.length === 4 ? 'rgba' : 'rgb';
        const alpha = mode === 'rgba' ? ', ' + w.value[3] : '';
        return `${mode}(${w.value[0]}, ${w.value[1]}, ${w.value[2]}${alpha})`;
    }

    tween(progress) {
        const w = this;
        w.value = w.value.map((value, i) => {
            const from = w.colors.from[i];
            const to = w.colors.to[i];
            return from + (to - from) * w.ease(progress)
        });
    }

    init() {
        const w = this;
        w._initEase();
        w._initColors();
    }

    _initColors() {
        const w = this;
        w.colors = {
            from: ColorMutator.toRGB(w.params.from),
            to: ColorMutator.toRGB(w.params.to)
        }
        console.log(w.colors)
    }

    static toRGB(string) {
        let color;
        const mode = ColorMutator.getMode(string);
        switch (mode) {
            case 'hex':
                color = ColorMutator.fromHex(string);
                break;
            case 'hsl':
                color = ColorMutator.fromHSL(string);
                break;
            case 'rgb':
                color = ColorMutator.fromRGB(string);
                break;
            default:
                throw `Mode not found in '${color}. Try supported color modes: hex, rgb. (hsl coming soon)`;
        }
        return color;
    }

    static fromHex(string) {
        let rgb;
        try {
            const color = ColorMutator.matchColor(string);
            const mode = ColorMutator.getMode(color);
            if (!!color && mode === 'hex') {
                const startIndex = color.search(/(?:#|0x)/) + 1;
                const hex = color.slice(startIndex);
                const values = hex.match(/.{2}/g);
                rgb = [
                    parseInt(values[0], 16),
                    parseInt(values[1], 16),
                    parseInt(values[2], 16),
                    1
                ];
            } else {
                throw `Hex string is invalid.`
            }
        } catch (error) {
            console.error(error);
        }
        return rgb;
    }

    static fromRGB(string) {
        let rgb;
        try {
            const color = ColorMutator.matchColor(string);
            const mode = ColorMutator.getMode(color);
            if (!!color && mode === 'rgb') {
                const startIndex = color.indexOf('(') + 1;
                const endIndex = color.indexOf(')');
                rgb = color.slice(startIndex, endIndex).split(',').map(v => Number(v));
            } else {
                throw `RGB string is invalid.`
            }
        } catch (error) {
            console.error(error);
        }
        return rgb;
    }

    static fromHSL(string) {
        let rgb;
        try {
            const color = ColorMutator.matchColor(string);
            const mode = ColorMutator.getMode(color);
            if (!!color && mode === 'hsl') {
                throw `HSL is not supported yet.`
            } else {
                throw `HSL string is invalid.`
            }
        } catch (error) {
            console.error(error);
        }
        return rgb;
    }

    static getMode(string) {
        const mode =
            string.search(/(?:#|0x)/) !== -1 ? 'hex' :
                string.search(/hsl/) !== -1 ? 'hsl' :
                    string.search(/rgb/) !== -1 ? 'rgb' : false;
        return mode;
    }

    static matchColor(string) {
        const regex = /(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{6})\b|(?:rgb|hsl)a?\([^\)]*\)/ig;
        const match = !!string.match(regex) ? string.match(regex)[0] : null;
        return match;
    }

    static getHexDigit(digit) {
        try {
            if (typeof digit === 'string') {
                if (digit.length === 1) {
                    return ColorMutator.hexDigits[digit];
                } else {
                    throw `Digit '${digig}' must be a single charater`;
                }
            } else if (typeof digit === 'number') {
                if (digit <= 9 && digit >= 0) {
                    return Math.max(digit, 1);
                } else {
                    throw `Digit '${digit}' must be between 0-9`;
                }
            } else {
                throw `Digit '${digit}' must be a number or a string.`;
            }
        } catch (error) {
            console.error(error);
        }
    }
}

ColorMutator.hexDigits = {
    A: 10,
    B: 11,
    C: 12,
    D: 13,
    E: 14,
    F: 15
}

export default ColorMutator;