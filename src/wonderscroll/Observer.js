import Mutator from './Mutators/Mutator';

class Observer {
    constructor(element, options) {
        const o = {
            ...Observer.defaultOptions,
            ...options
        };
        this.element = element;
        this.name = o.name;
        this.root = o.root;
        this.from = o.from;
        this.to = o.to;
        this.egde = o.egde;
        this.mutators = {};
        this.scrollPos = this._initScrollPos();
        this.isDone = true;
        this.isIntersecting = false;
        this.isListeningScroll = false;
        this.scrollHandler = this._handleScroll.bind(this);
        this.raf = 0;
        
        this._initMutators(o.mutators);
        this.intersectionObserver = new IntersectionObserver((e) => this._handleIntersecting(!!e[0].isIntersecting));
        this.intersectionObserver.observe(this.element);
    }
    

    get progress() {
        return Math.min(Math.max((Math.round(this.scrollPos.window) - this.scrollPos.start) / this.scrollPos.diff, 0), 1);
    }

    addMutator(options) {
        this.mutators[options.key] = new Mutator(this.element, options);
        this.applyMutator(options.key);
    }

    addMutators(mutators) {
        Object.keys(mutators).forEach(key => {
            const mutator = mutators[key];
            mutator.key = key;
            this.addMutator(mutator);
        });
    }

    applyStyles() {
        const styles = {};
        Object.keys(this.mutators).forEach(key => {
            const mutator = this.mutators[key];
            styles[mutator.cssProperty] = styles[mutator.cssProperty] || [];
            styles[mutator.cssProperty].push(mutator.style);
        });
        Object.keys(styles).forEach(cssProperty => {
            const style = styles[cssProperty].join(' ');
            this.element.style[cssProperty] = style;
        });
    }

    applyMutator(key) {
        this.mutators[key].tween(this.progress);
        this.isDone = this.progress == 0 || this.progress == 1;
    }

    applyMutators() {
        Object.keys(this.mutators).forEach(key => {
            this.applyMutator(key);
        });
        this.applyStyles();
    }

    _handleIntersecting(value) {
        const isIntersecting = !!value;
        if (isIntersecting && !this.isListeningScroll) {
            this.isListeningScroll = true;
            window.addEventListener('scroll', this.scrollHandler);
        }
        this.isIntersecting = isIntersecting;
    }

    _handleScroll() {
        this.scrollPos.window = window.scrollY;
        if ((this.progress > 0 && this.progress < 1) || !this.isDone) {
            window.cancelAnimationFrame(this.raf);
            this.raf = window.requestAnimationFrame(this.applyMutators.bind(this));
        }
        else if (!this.isIntersecting) {
            this.isListeningScroll = false;
            window.removeEventListener('scroll', this.scrollHandler);
        }
    }

    _initScrollPos() {
        const distanceFromTop = this.element.offsetTop;
        const edgeDistance = this.egde === 'bottom' ? this.element.offsetHeight : 0;
        const totalDistance = distanceFromTop + edgeDistance;
        const viewportHeight = document.body.clientHeight;

        const start = Math.floor(totalDistance - viewportHeight * this.from);
        const end = Math.ceil(totalDistance - viewportHeight * this.to);

        return {
            window: window.scrollY || 0,
            start: start,
            end: end,
            diff: end - start
        }
    }

    _initMutators(mutators) {
        this.addMutators(mutators);
        this.applyStyles();
    }
}

Observer.defaultOptions = {
    name: undefined,
    root: undefined,
    rootMargin: 0,
    from: 1,
    to: 0,
    edge: 'top',
    mutators: {}
}

export default Observer;