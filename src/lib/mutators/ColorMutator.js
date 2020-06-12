import easing from '../easing'; 

class DefaultMutator {
    constructor(element, options) {
        super(element, options);
        this.from = this._initColor(o.from);
        this.to = this._initCOlor(o.to);
    }

    get style() {
        return this.value + this.unit;
    }

    tween(progress) {
        this.value = this.from + (this.to - this.from) * this.ease(progress);
    }

    _initColor(color) {
        
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