const _ = {
    each(enumerable, callback) {
        const array = this.isPlainObject(enumerable) ? Object.keys(enumerable) : this.forceArray(enumerable);
        array.forEach(callback);
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
                if (el === null) {
                    throw `Element Not Found: Could not find Element with ${element} selector.`;
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
        return !!value.constructor && value.constructor === Object;
    }
}

export default _;