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

    // static computeProperties(properties, progress) {
    //     const styles = {};

    //     Object.keys(properties).forEach(key => {
    //         const property = properties[key];
    //         let style = '';

    //         if (key === 'transform') {
    //             const subStyles = [];

    //             Object.keys(property).forEach(subKey => {
    //                 const subProperty = property[subKey];

    //                 subStyles.push(Wonderscroll.computePropertyStyle(subProperty, subKey, progress));
    //             });
    //             style = subStyles.join(' ');
    //         } else {
    //             style = Wonderscroll.computePropertyStyle(property, key, progress);
    //         }
    //         styles[key] = style;
    //     });
    //     return styles;
    // }

    // static computePropertyStyle(property, name, progress) {
    //     const ease = !!property.ease && !!easing[property.ease] ? easing[property.ease] : easing.linear;
    //     const format = Wonderscroll.styleDictionnary[name] || '$';
    //     const value = property.from + (property.to - property.from) * ease(progress);
    //     const unit = property.unit || '';
    //     if (name = 'opacity') console.log(`${ease(progress)} : ${progress}`);
    //     return format.replace('$', value + unit);
    // }

    // static computeProgress(travel) {
    //     return Math.min(Math.max((window.scrollY - travel.start) / travel.diff, 0), 1);
    // }

    // static computeTravelPoint(element, ref, screenPos) {
    //     return element.offsetTop + (ref == 'bottom' ? element.offsetHeight : 0) - document.body.clientHeight * screenPos;
    // }

    // static computeTravels(element, travels) {
    //     const travelsArray = Array.isArray(travels) ? travels : [travels];
    //     return travelsArray.map(travel => {
    //         const start = Wonderscroll.computeTravelPoint(element, travel.ref, travel.from);
    //         const end = Math.min(Wonderscroll.computeTravelPoint(element, travel.ref, travel.to), document.body.scrollHeight);
    //         const diff = end - start;
    //         return {
    //             start: start,
    //             end: end,
    //             diff: diff,
    //             ...travel
    //         }
    //     });
    // }

    // static applyStyles(el, styles) {
    //     Object.keys(styles).forEach(key => {
    //         el.style[key] = styles[key];
    //     });
    // }

    // static watchScroll(w) {
    //     window.addEventListener('scroll', e => {
    //         w.travels.forEach(travel => {
    //             const progress = Wonderscroll.computeProgress(travel);
    //             if (progress > 0 && progress < 1) {
    //                 const styles = Wonderscroll.computeProperties(travel.properties, progress);
    //                 Wonderscroll.applyStyles(w.element, styles);
    //             }
    //         });
    //     });
    // }
    
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