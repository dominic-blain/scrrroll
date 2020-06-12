import DefaultMutator from './DefaultMutator';
import TransformMutator from './TransformMutator';

class Mutator {
    constructor(element, key, params) {
        const mutatorType = Mutator.mutatorTypes[key];

        if (mutatorType === 'transform') {
            return new TransformMutator(element, key, params);
        }
        else {
            return new DefaultMutator(element, key, params);
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