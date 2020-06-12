import { WonderscrollDefaults as defaults } from './defaults';
import _ from './utils';
import Observer from './Observer';

class Wonderscroll {

    constructor(...args) {
        const w = this;
        let element;
        let observers;
        let params;

        if (args.length < 3 && args[0].constructor && (args[0].constructor == Object || args[0].constructor === Array)) {
            [observers, params] = args;
        } else {
            [element, observers, params] = args;
        }

        w.params = _.merge(defaults.params, params);
        w.queue = {
            element: element || params.defaultElement,
            observers: _.forceArray(_.merge(defaults.observers, observers))
        }
        w.element = undefined;
        w.observers = [];
        w.isInited = false;

        if (!!w.params.init) {
            w.init();
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
        w._initObservers();
        w.isInited = true;
    }

    _initElement() {
        const w = this;
        w.element = _.queryElement(w.queue.element);
        w.queue.element = undefined;
    }

    _initObservers() {
        const w = this;
        w.addObservers(w.queue.observers);
        w.queue.observers = [];
    }
}

export default Wonderscroll;