const ColorMutatorDefaults = {
	params: {
        unit: '',
        ease: 'linear'
	}
}

const MutatorDefaults = {
	params: {
		unit: 'px',
		ease: 'linear'
	}
}

const ObserverDefaults = {
	params: {
		name: undefined,
		root: 'window',
		from: 1,
		to: 0,
		edge: 'top',
		direction: 'vertical'
	}
}

const WonderscrollDefaults = {
	observers: ObserverDefaults,
	params: {
        init: true,
        observerNamePrefix: 'observer',
		defaultElement: '.wonderscroll',
		updateOnInit: true,
		updateOnResize: true,
	}
}

export {
    WonderscrollDefaults,
    ObserverDefaults,
    MutatorDefaults,
    ColorMutatorDefaults
}