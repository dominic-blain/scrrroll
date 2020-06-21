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

        this.isDone = true;
        this.isIntersecting = false;
        this.isListeningScroll = false;
        this.scrollHandler = this._handleScroll.bind(this);
        this.raf = 0;
        
        this.intersectionObserver = new IntersectionObserver((e) => this._handleIntersecting(!!e[0].isIntersecting));
        this.intersectionObserver.observe(this.element);

        w.init();
    }

    get progress() {
        const w = this;
        const progress = Math.min(Math.max((Math.round(w.scroll.current) - w.scroll.start) / w.scroll.diff, 0), 1);
        return progress;
    }

    update(key) {
        const w = this;
        if (key !== undefined && key instanceof String) {
            w.getMutation(key);
        } else {
            w.getMutations();
        }
        w.applyMutations();
    }

    applyMutations() {
        const w = this;
        const styles = {};
        _.each(w.mutators, key => {
            const mutator = w.mutators[key];
            styles[mutator.cssProperty] = styles[mutator.cssProperty] || [];
            styles[mutator.cssProperty].push(mutator.style);
        });
        _.each(styles, cssProperty => {
            const style = styles[cssProperty].join(' ');
            w.element.style[cssProperty] = style;
        });
        w.isDone = w.progress == 0 || w.progress == 1;
    }

    getMutation(key) {
        const w = this;
        w.mutators[key].tween(w.progress);
    }

    getMutations() {
        const w = this;
        _.each(w.mutators, key => {
            w.getMutation(key);
        });
        w.applyMutations();
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

        if (!!w.params.updateOnInit) {
            w.update();    
        }
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

    _handleIntersecting(value) {
        const w = this;
        const isIntersecting = !!value;
        if (isIntersecting && !w.isListeningScroll) {
            w.isListeningScroll = true;
            window.addEventListener('scroll', w.scrollHandler);
        }
        w.isIntersecting = isIntersecting;
    }

    _handleScroll() {
        const w = this;
        w.scroll.current = window.scrollY;
        const progress = w.progress
        
        if ((progress > 0 && progress < 1) || !w.isDone) {
            window.cancelAnimationFrame(w.raf);
            w.raf = window.requestAnimationFrame(w.update.bind(w));
        }
        else if (!w.isIntersecting) {
            w.isListeningScroll = false;
            window.removeEventListener('scroll', w.scrollHandler);
        }
    }   
}

export default Observer;