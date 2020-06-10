import easing from './easing'; 

class Mutator {
    constructor(element, options) {
        const o = {
            ...Mutator.defaultOptions,
            ...options
        };
        this.element = element;
        this.property = o.property;
        this.from = o.from;
        this.to = o.to;
        this.ease = this._initEase(o.ease);
        this.value = '';
        this.unit = o.unit;
    }

    get style() {
        return this.value + this.unit;
    }

    tween(progress) {
        this.value = this.from + (this.to - this.from) * this.ease(progress);
        this.element.style[this.property] = this.style;
    }

    _initEase(ease) {
        return !!easing[ease] ? easing[ease] : easing.linear;
    }
}

Mutator.defaultOptions = {
    ease: 'linear',
    unit: 'px'
}

export default Mutator;