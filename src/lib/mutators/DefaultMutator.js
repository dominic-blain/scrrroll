import { MutatorDefaults as defaults } from '../defaults';
import _ from '../utils'; 
import easing from '../easing'; 

class DefaultMutator {
    constructor(element, key, params) {
        const w = this;

        w.params = _.merge(defaults.params, params);
        w.element = element;
        w.key = key;
        w.cssProperty = key;
        w.ease = undefined;
        w.value = '';

        w.init();
    }

    get style() {
        const w = this;
        return w.value + w.params.unit;
    }

    tween(progress) {
        const w = this;
        w.value = w.params.from + (w.params.to - w.params.from) * w.ease(progress);
    }

    init() {
        const w = this;
        w._initEase();
    }

    _initEase() {
        const w = this;
        const easeFx = easing[w.params.ease];
        w.ease = !!easeFx ? easeFx : easing.linear;
    }
}

export default DefaultMutator;