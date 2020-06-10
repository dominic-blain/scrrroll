import DefaultMutator from './DefaultMutator';
import TransformMutator from './TransformMutator';

class Mutator {
    constructor(element, options) {
        const mutatorType = Mutator.mutatorTypes[options.key];

        if (mutatorType === 'transform') {
            return new TransformMutator(element, options);
        }
        else {
            return new DefaultMutator(element, options);
        }
    }
}

Mutator.mutatorTypes = {
    y: 'transform',
    x: 'transform',
    z: 'transform',
    rotate: 'transform',
    scale: 'transform'
}

export default Mutator;