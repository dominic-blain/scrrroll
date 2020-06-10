import easing from '../easing'; 

class DefaultMutator {
    constructor(element, options) {
        const o = {
            ...DefaultMutator.defaultOptions,
            ...options
        };
        this.element = element;
        this.key = o.key;
        this.cssProperty = o.key;
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
    }

    _initEase(ease) {
        return !!easing[ease] ? easing[ease] : easing.linear;
    }
}

DefaultMutator.defaultOptions = {
    ease: 'linear',
    unit: 'px'
}

export default DefaultMutator;