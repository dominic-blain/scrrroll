import DefaultMutator from './DefaultMutator';
import TransformMutator from './TransformMutator';
import ColorMutator from './ColorMutator';

class Mutator {
    constructor(element, key, params) {
        const mutatorType = Mutator.mutatorTypes[key];

        switch (mutatorType) {
            case 'transform':
                return new TransformMutator(element, key, params);     
            case 'color':
                return new ColorMutator(element, key, params);
            default:
                return new DefaultMutator(element, key, params);
        }
    }
}

Mutator.mutatorTypes = {
    y: 'transform',
    translateY: 'transform',
    x: 'transform',
    translateX: 'transform',
    z: 'transform',
    translateZ: 'transform',
    r: 'transform',
    rotate: 'transform',
    scale: 'transform',
    color: 'color',
    backgroundColor: 'color',
    borderColor: 'color'
}

export default Mutator;