import { WonderscrollDefaults as defaults } from './defaults';
import _ from './utils';
import Observer from './Observer';

class Wonderscroll {

    constructor(...args) {
        const w = this;
        let element;
        let observers;
        let params;

        if (args.length < 3 && (_.isPlainObject(args[0]) || _.isPlainArray(args[0]))) {
            [observers, params] = args;
        } else {
            [element, observers, params] = args;
        }

        w.params = _.merge(defaults.params, params);
        w.queue = {
            element: element || w.params.defaultElement,
            observers: _.forceArray(observers).map(observer => {
                return _.merge(defaults.observers, observer)
            })
        }
        w.element = undefined;
        w.observers = [];
        w.raf = 0;
        w.scrollPos = 0;
        w.scrollHandler = w._handleScroll.bind(this);
        w.isInitiating = false;
        w.isInited = false;
        w.isVisible = false;
        w.isListeningScroll = false;
        w.isActive = true;
        

        if (!!w.params.init) {
            const initElement = w.init();
            if (!!initElement && initElement.length > 1) {
                return initElement;
            }
        }
    }

    set listenToScroll(value) {
        const w = this;
        const fx = !!value ? 'addEventListener' : 'removeEventListener';
        w.isListeningScroll = value;
        window[fx]('scroll', w.scrollHandler);
        if (!!w.params.debug) {
            console.group(`Wonderscroll SET listenToScroll: ${w.isListeningScroll}`);
            console.log(`Scroll Position: ${window.scrollY}`);
            console.log(w);
            console.groupEnd();
            w.element.setAttribute('data-listening-scroll', w.isListeningScroll);
        }
    }

    set active(value) {
        const w = this;
        w.isActive = value;
        if (!!w.params.debug) {
            console.groupCollapsed(`Wonderscroll SET active: ${w.isActive}`);
            console.log(w);
            console.groupEnd();
            w.element.setAttribute('data-active', w.isActive);
        }
    }
    
    update(key) {
        const w = this;

        // Get mutations data
        w.getMutations();
        
        // Apply mutations
        if (!!w.isActive) {
            window.cancelAnimationFrame(w.raf);
            w.raf = window.requestAnimationFrame(w.applyMutations.bind(w));
        } else if (!w.isVisible) {
            // w.listenToScroll = false;
        }
    }

    getMutations() {
        const w = this;

        _.each(w.observers, observer => {
            observer.scroll.current = w.scrollPos;
            observer.getMutations();
            if (!observer.isDone && !w.isActive) {
                w.active = true;
            }
        });
    }

    applyMutations() {
        const w = this;
        const styles = {};
        const cssStyles = {};
        let hasActiveObservers = false;
        _.each(w.observers, observer => {
            
            const progress = observer.progress;
            const isDone = progress == 0 || progress == 1;

            const observerStyles = observer.getMutationsStyles();

            _.each(observerStyles, key => {
                const style = observerStyles[key];
                if (!styles[key] || !isDone) {
                    styles[key] = style;
                }
            });
            
            observer.isDone = isDone;
            if (!isDone) {
                hasActiveObservers = true;
            }
        });
        _.each(styles, key => {
            const style = styles[key];
            cssStyles[style.cssProperty] = _.isPlainArray(cssStyles[style.cssProperty]) ? cssStyles[style.cssProperty] : [];
            cssStyles[style.cssProperty].push(style.cssValue);
        });
        _.each(cssStyles, cssProperty => {
            const style = cssStyles[cssProperty].join(' ');
            w.element.style[cssProperty] = style;
        });
        if (w.isActive !== hasActiveObservers) {
            w.active = hasActiveObservers;
        }
    }

    addObserver(mutators, params) {
        const w = this;
        const target = !!w.isInited || !!w.isInitiating ? w.observers : w.queue.observers;
        
        const hasCustomName = !!params && !!params.name && typeof params.name === 'string';
        const genericName = String(w.params.observerNamePrefix) + w.observers.length;
        params.name = hasCustomName ? params.name : genericName;
        const observer = new Observer(w.element, mutators, params);
            
        target.push(observer);    
    }

    addObservers(observers) {
        const w = this;
        _.each(observers, observer => {
            w.addObserver(observer.mutators, observer.params);
        });
    }

    _handleScroll() {
        const w = this;
        w.scrollPos = window.scrollY;
        w.update(); 
    }   

    init() {
        const w = this;
        w.isInitiating = true;
        w._initElement();
        if (w.element.length > 1) {
            const elements = [];
            w.element.forEach(el => {
                elements.push(new Wonderscroll(el, w.queue.observers, w.params));
            });
            return elements;
        }
        w._initObservers();
        if (!!w.params.updateOnInit) {
            w.update();    
        }
        w.listenToScroll = true;
        w.isInited = true;
    }

    _initElement() {
        const w = this;
        const element = _.queryElement(w.queue.element);
        
        w.element = element;
        w.queue.element = null;
    }

    _initObservers() {
        const w = this;
        w.addObservers(w.queue.observers);
        w.queue.observers = [];
    }
}

export default Wonderscroll;