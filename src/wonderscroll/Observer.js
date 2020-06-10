import Mutator from './Mutator';

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
        this.isIntersecting = false;
        this.isListeningScroll = false;
        this.scrollHandler = this._handleScroll.bind(this);
        
        this._initMutators(o.mutators);
        this.intersectionObserver = new IntersectionObserver((e) => this._handleIntersecting(!!e[0].isIntersecting));
        this.intersectionObserver.observe(this.element);
    }

    get progress() {
        return Math.min(Math.max((Math.round(window.scrollY) - this.scrollPos.start) / this.scrollPos.diff, 0), 1);
    }

    addMutator(property, from, to, unit, ease) {
        const options = {
            property: property,
            from: from,
            to: to,
            unit: unit,
            ease: ease
        }
        this.mutators[property] = new Mutator(this.element, options);
    }

    addMutators(mutators) {
        Object.keys(mutators).forEach(key => {
            const options = mutators[key];
            options.property = key;
            this.mutators[key] = new Mutator(this.element, options);
        });
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
        Object.keys(this.mutators).forEach(key => {
            if (this.progress > 0 && this.progress < 1) {
                this.mutators[key].tween(this.progress);
            }
            else if (!this.isIntersecting) {
                this.isListeningScroll = false;
                window.removeEventListener('scroll', this.scrollHandler);
            }
        });
    }

    _initScrollPos() {
        const distanceFromTop = this.element.offsetTop;
        const edgeDistance = this.egde === 'bottom' ? this.element.offsetHeight : 0;
        const totalDistance = distanceFromTop + edgeDistance;
        const viewportHeight = document.body.clientHeight;

        const start = Math.floor(totalDistance - viewportHeight * this.from);
        const end = Math.ceil(totalDistance - viewportHeight * this.to);

        return {
            start: start,
            end: end,
            diff: end - start
        }
    }

    _initMutators(mutators) {
        this.addMutators(mutators);
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