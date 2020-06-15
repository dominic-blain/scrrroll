// Initialization
const wonder = new Wonderscroll();
const wonder = new Wonderscroll('.selector', [observers], { params });
const wonder = new Wonderscroll(element, [observers], { params });
Wonderscroll.init('.selector');

// Apply mutations
wonder.update();
wonder.update('observerName');
wonder.update('observerName', 'mutatorKey');

// Destroy instances
wonder.destroy();
wonder.destroy('observerName');
wonder.destroy('observerName', 'mutatorKey');

// Remove instances (without resetting);
wonder.remove();
wonder.remove('observerName');
wonder.remove('observerName', 'mutatorKey');

// Adding Observers
wonder.addObservers([observers]);
wonder.addObserver({ mutators }, { params });

// Accessing Observers
wonder.getObservers();
wonder.getObserver('observerName');

// Add Mutators
wonder.getObserver('observerName').addMutator('mutatorKey', { mutatorParams });
wonder.getObserver('observerName').addMutators({ mutators });
wonder.addMutator('mutatorKey', { mutatorParams }); // Shortcut for adding to last observer in list

// Accessing Mutators
wonder.getObserver('observerName').getMutators();
wonder.getObserver('observerName').getMutator('mutatorKey');

// Change play state
wonder.pause();
wonder.pause('observerName');
wonder.pause('observerName', 'mutatorKey');
wonder.play();
wonder.play('observerName');
wonder.play('observerName', 'mutatorKey');


const WonderscrollDefaults = {
	element: '.wonderscroll',
	observers: ObserverDefaults,
	params: {
		init: true
	}
}

const ObserverDefaults = {
	element: '.wonderscroll',
	mutators: MutatorDefaults,
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

const MutatorDefaults = {
	key: 'y',
	params: {
		from: 100,
		to: -100,
		unit: 'px',
		ease: 'linear'
	}
}