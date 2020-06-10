import DefaultMutator from './DefaultMutator';

class TransformMutator extends DefaultMutator {
    constructor(element, options) {
        super(element, options);
        this.cssProperty = 'transform';
    }

    get style() {
        const format = TransformMutator.format[this.key];
        return format.replace('$', this.value + this.unit);
    }
}

TransformMutator.format = {
    y: 'translateY($)',
    x: 'translateX($)',
    z: 'translateZ($)',
    r: 'rotate($)',
    scale: 'scale($)'
}

export default TransformMutator;