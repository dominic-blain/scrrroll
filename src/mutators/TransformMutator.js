import DefaultMutator from './DefaultMutator';

class TransformMutator extends DefaultMutator {
    constructor(element, key, options) {
        super(element, key, options);
        const w = this;
        w.cssProperty = 'transform';
    }

    get style() {
        const w = this;
        const customFormat = TransformMutator.format[w.key];
        const format = !!customFormat ? customFormat : `${w.key}($)`;
        return format.replace('$', w.value + w.params.unit);
    }
}

TransformMutator.format = {
    y: 'translateY($)',
    x: 'translateX($)',
    z: 'translateZ($)',
    r: 'rotate($)'
}

export default TransformMutator;