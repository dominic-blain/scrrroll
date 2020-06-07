class Wonderscroll {

    constructor(element, options) {
        this.element = element;
        this.options = options;
        this.travel = Wonderscroll.computeTravel(this);
        Wonderscroll.watchScroll(this);
    }

    static computeProperties(properties, progress) {
        const styles = {};

        Object.keys(properties).forEach(key => {
            const property = properties[key];
            let style = '';

            if (key === 'transform') {
                const subStyles = [];

                Object.keys(property).forEach(subKey => {
                    const subProperty = property[subKey];

                    subStyles.push(Wonderscroll.computePropertyStyle(subProperty, subKey, progress));
                });
                style = subStyles.join(' ');
            } else {
                style = Wonderscroll.computePropertyStyle(property, key, progress);
            }
            styles[key] = style;
        });
        console.log(styles);
        return styles;
    }

    static computePropertyStyle(property, name, progress) {
        const format = Wonderscroll.styleDictionnary[name] || '$';
        const value = property.from + (property.to - property.from) * progress;
        const unit = property.unit || '';
        return format.replace('$', value + unit);
    }

    static computeProgress(travel) {
        return Math.min(Math.max((window.scrollY - travel.start) / travel.diff, 0), 1);
    }

    static computeTravelPoint(w, screenPos) {
        const { element, options } = w;
        return element.offsetTop + (options.ref == 'bottom' ? element.offsetHeight : 0) - document.body.clientHeight * screenPos;
    }

    static computeTravel(w) {
        const start = Wonderscroll.computeTravelPoint(w, w.options.from);
        const end = Math.min(Wonderscroll.computeTravelPoint(w, w.options.to), document.body.scrollHeight);
        const diff = end - start;
        return {
            start: start,
            end: end,
            diff: diff
        }
    }

    static applyStyles(el, styles) {
        Object.keys(styles).forEach(key => {
            el.style[key] = styles[key];
        });
    }

    static watchScroll(w) {
        window.addEventListener('scroll', e => {
            const progress = Wonderscroll.computeProgress(w.travel);
            const styles = Wonderscroll.computeProperties(w.options.properties, progress);
            Wonderscroll.applyStyles(w.element, styles);
        });
    }
    
}

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