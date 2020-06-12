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
		updateOnInit: true,
		updateOnRootResize: true,
		direction: 'vertical'
	}
}

const WonderscrollDefaults = {
	observers: ObserverDefaults,
	params: {
        init: true,
        observerNamePrefix: 'observer',
        defaultElement: '.wonderscroll',
	}
}

export {
    WonderscrollDefaults,
    ObserverDefaults,
    MutatorDefaults
}