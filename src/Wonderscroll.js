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
        w.isInited = false;

        if (!!w.params.init) {
            const initElement = w.init();
            if (!!initElement && initElement.length > 1) {
                return initElement;
            }
        }
    }

    addObserver(mutators, params) {
        const w = this;
        const target = w.isInited ? w.observers : w.queue.observers;
        
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

    init() {
        const w = this;
        w._initElement();
        if (w.element.length > 1) {
            const elements = [];
            w.element.forEach(el => {
                elements.push(new Wonderscroll(el, w.queue.observers, w.params));
            });
            return elements;
        }
        w._initObservers();
        w.isInited = true;
    }

    _initElement() {
        const w = this;
        const element = _.queryElement(w.queue.element);
        
        w.element = element;
        w.queue.element = undefined;
    }

    _initObservers() {
        const w = this;
        w.addObservers(w.queue.observers);
        w.queue.observers = [];
    }
}

export default Wonderscroll;