import { ObserverDefaults as defaults } from './defaults';
import _ from './utils';
import Mutator from './Mutators/Mutator';

class Observer {
    constructor(element, mutators, params) {
        const w = this;

        w.params = _.merge(defaults.params, params);
        w.element = element;
        w.queue = {
            mutators: mutators || {}
        }
        w.mutators = {};
        w.scroll = {
            current: 0,
            start: undefined,
            end: undefined,
            diff: undefined,
            progress: 0
        };

        w.isDone = false;

        w.init();
    }

    get progress() {
        const w = this;
        const progress = Math.min(Math.max((Math.round(w.scroll.current) - w.scroll.start) / w.scroll.diff, 0), 1);
        w.element.setAttribute(`data-progress-${w.params.name}`, progress);
        return progress;
    }

    applyMutations(styles) {
        const w = this;
        _.each(styles, cssProperty => {
            const style = styles[cssProperty].join(' ');
            w.element.style[cssProperty] = style;
        });
        w.isDone = w.progress == 0 || w.progress == 1;
    }

    getMutationsStyles() {
        const w = this;
        const styles = {};
        _.each(w.mutators, key => {
            const mutator = w.mutators[key];
            styles[key] = {
                cssProperty: mutator.cssProperty,
                cssValue: mutator.style
            }
        });
        return styles;
    }

    getMutation(key) {
        const w = this;
        const progress = w.progress;
        if (progress > 0 && progress < 1) {
            w.isDone = false;
        }
        w.mutators[key].tween(w.progress);
    }

    getMutations() {
        const w = this;
        _.each(w.mutators, key => {
            w.getMutation(key);
        });
    }

    addMutator(key, params) {
        const w = this;
        try {
            if (w.mutators[key] === undefined) {
                w.mutators[key] = new Mutator(w.element, key, params);
            } else {
                throw `Mutator '${key}' already exist on '${w.name}' observer. Try update() instead`;
            }
        } catch (error) {
            console.error(error);
        }
    }

    addMutators(mutators) {
        const w = this;
        _.each(mutators, key => {
            w.addMutator(key, mutators[key]);
        });
    }

    init() {
        const w = this;
        w._initScroll();
        w._initMutators();
    }

    _initMutators() {
        const w = this;
        w.addMutators(w.queue.mutators);
        w.queue.mutators = {};
    }

    _initScroll() {
        const w = this;

        const elementHeight = w.element.offsetHeight;
        const viewportHeight = document.body.clientHeight;

        const startEdgeDistance = w.params.edge === 'bottom' ? elementHeight : 0;
        const endEgdeDistance =  w.params.edge === 'both' ? elementHeight : 0;
        const startDistance = w.element.offsetTop + startEdgeDistance;

        const start = Math.floor(startDistance - viewportHeight * w.params.from);
        const end = Math.ceil(startDistance + endEgdeDistance - viewportHeight * w.params.to);

        w.scroll = {
            current: window.scrollY || 0,
            start: start,
            end: end,
            diff: end - start
        }
    }  
}

export default Observer;