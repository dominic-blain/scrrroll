const _ = {
    each(enumerable, callback) {
        const array = this.isPlainObject(enumerable) ? Object.keys(enumerable) : this.forceArray(enumerable);
        array.forEach(item => callback(item));
    },
    forceArray(value) {
        return Array.isArray(value) ? value : [value]
    },
    merge(...args) {
        let target = {};
        args.forEach(arg => {
            target = {
                ...target,
                ...arg
            }
        });
        return target;
    },
    queryElement(element) {
        let el;
        try {
            if (element instanceof Element) {
                el = element;
            }
            else if (typeof element === 'string') {
                el = document.querySelectorAll(element);
                if (el === null || el.length === 0) {
                    throw `Element Not Found: Could not find Element with ${element} selector.`;
                } else if (el.length === 1) {
                    el = el[0];
                }
            }
            else {
                throw 'Invalid Element Property: Should be HTMLElement or valid selector.';
            }
        } catch (error) {
            console.error(error)
        }
        return el;
    },
    isObject(value) {
        return value instanceof Object && value !== null;
    },
    isPlainObject(value) {
        return !!value && !!value.constructor && value.constructor === Object;
    },
    isPlainArray(value) {
        return !!value && !!value.constructor && value.constructor === Array;
    }
}

export default _;