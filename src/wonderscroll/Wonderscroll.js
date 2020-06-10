import Observer from './Observer';

class Wonderscroll {

    constructor(element, observers, options) {
        this.options = this._initOptions(options);
        this.element = this._initElement(element);
        this.observers = [];
        
        this._initObservers(observers);
        
        // this.travels = Wonderscroll.computeTravels(this.element, travels);
        // Wonderscroll.watchScroll(this);
    }

    addObserver(options) {
        const hasCustomName = typeof options.name === 'string' && options.name.length > 0;
        const genericName = `${this.options.observerNamePrefix}${this.observers.length}`;
        options.name = hasCustomName ? options.name : genericName;
        const observer = new Observer(this.element, options);
        this.observers.push(observer);
    }

    _initOptions(options) {
        return {
            ...Wonderscroll.defaultOptions,
            ...options
        };
    }

    _initObservers(observers) {
        observers = Array.isArray(observers) ? observers : [observers];
        observers.forEach((observer) => {
            this.addObserver(observer);
        });
    }

    _initElement(element) {
        let el;
        try {
            if (element instanceof Element) {
                el = element;
            }
            else if (typeof element === 'string') {
                el = document.querySelector(element);
                if (el === null) {
                    throw `Element Not Found: Could not find Element with ${element} selector.`;
                }
            }
            else {
                throw 'Invalid Element Property: Should be HTMLElement or valid selector.';
            }
        }
        catch (error) {
            console.error(error)
        }
        return el;
    }
}

Wonderscroll.defaultOptions = {
    observerNamePrefix: 'observer'
};

Wonderscroll.styleDictionnary = {
    translateY: 'translateY($)',
    translateX: 'translateX($)',
    translateZ: 'translateZ($)',
    translate3d: 'translate3d($)',
    translate: 'translate($)',
    rotateY: 'rotateY($)',
    rotateX: 'rotateX($)',
    rotateZ: 'rotateZ($)',
    rotate3d: 'rotate3d($)',
    rotate: 'rotate($)'
}

export default Wonderscroll;