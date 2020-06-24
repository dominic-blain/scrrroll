var Wonderscroll = (function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  var ColorMutatorDefaults = {
    params: {
      unit: '',
      ease: 'linear'
    }
  };
  var MutatorDefaults = {
    params: {
      unit: 'px',
      ease: 'linear'
    }
  };
  var ObserverDefaults = {
    params: {
      name: undefined,
      root: 'window',
      from: 1,
      to: 0,
      edge: 'top',
      direction: 'vertical'
    }
  };
  var WonderscrollDefaults = {
    observers: ObserverDefaults,
    params: {
      init: true,
      observerNamePrefix: 'observer',
      defaultElement: '.wonderscroll',
      updateOnInit: true,
      updateOnResize: true
    }
  };

  var _ = {
    each: function each(enumerable, callback) {
      var array = this.isPlainObject(enumerable) ? Object.keys(enumerable) : this.forceArray(enumerable);
      array.forEach(function (item) {
        return callback(item);
      });
    },
    forceArray: function forceArray(value) {
      return Array.isArray(value) ? value : [value];
    },
    merge: function merge() {
      var target = {};

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      args.forEach(function (arg) {
        target = _objectSpread2(_objectSpread2({}, target), arg);
      });
      return target;
    },
    queryElement: function queryElement(element) {
      var el;

      try {
        if (element instanceof Element) {
          el = element;
        } else if (typeof element === 'string') {
          el = document.querySelectorAll(element);

          if (el === null || el.length === 0) {
            throw "Element Not Found: Could not find Element with ".concat(element, " selector.");
          }
        } else {
          throw 'Invalid Element Property: Should be HTMLElement or valid selector.';
        }
      } catch (error) {
        console.error(error);
      }

      return el;
    },
    isObject: function isObject(value) {
      return value instanceof Object && value !== null;
    },
    isPlainObject: function isPlainObject(value) {
      return !!value && !!value.constructor && value.constructor === Object;
    },
    isPlainArray: function isPlainArray(value) {
      return !!value && !!value.constructor && value.constructor === Array;
    }
  };

  /*
   * Easing Functions - inspired from http://gizma.com/easing/
   * only considering the t value for the range [0, 1] => [0, 1]
   */
  var easing = {
    // no easing, no acceleration
    linear: function linear(t) {
      return t;
    },
    // accelerating from zero velocity
    InQuad: function InQuad(t) {
      return t * t;
    },
    // decelerating to zero velocity
    OutQuad: function OutQuad(t) {
      return t * (2 - t);
    },
    // acceleration until halfway, then deceleration
    InOutQuad: function InOutQuad(t) {
      return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    // accelerating from zero velocity 
    InCubic: function InCubic(t) {
      return t * t * t;
    },
    // decelerating to zero velocity 
    OutCubic: function OutCubic(t) {
      return --t * t * t + 1;
    },
    // acceleration until halfway, then deceleration 
    InOutCubic: function InOutCubic(t) {
      return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },
    // accelerating from zero velocity 
    InQuart: function InQuart(t) {
      return t * t * t * t;
    },
    // decelerating to zero velocity 
    OutQuart: function OutQuart(t) {
      return 1 - --t * t * t * t;
    },
    // acceleration until halfway, then deceleration
    InOutQuart: function InOutQuart(t) {
      return t < .5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
    },
    // accelerating from zero velocity
    InQuint: function InQuint(t) {
      return t * t * t * t * t;
    },
    // decelerating to zero velocity
    OutQuint: function OutQuint(t) {
      return 1 + --t * t * t * t * t;
    },
    // acceleration until halfway, then deceleration 
    InOutQuint: function InOutQuint(t) {
      return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
    }
  };

  var DefaultMutator = /*#__PURE__*/function () {
    function DefaultMutator(element, key, params) {
      _classCallCheck(this, DefaultMutator);

      var w = this;
      w.params = _.merge(MutatorDefaults.params, params);
      w.element = element;
      w.key = key;
      w.cssProperty = key;
      w.ease = undefined;
      w.value = '';
      w.init();
    }

    _createClass(DefaultMutator, [{
      key: "tween",
      value: function tween(progress) {
        var w = this;
        w.value = w.params.from + (w.params.to - w.params.from) * w.ease(progress);
      }
    }, {
      key: "init",
      value: function init() {
        var w = this;

        w._initEase();
      }
    }, {
      key: "_initEase",
      value: function _initEase() {
        var w = this;
        var easeFx = easing[w.params.ease];
        w.ease = !!easeFx ? easeFx : easing.linear;
      }
    }, {
      key: "style",
      get: function get() {
        var w = this;
        return w.value + w.params.unit;
      }
    }]);

    return DefaultMutator;
  }();

  var TransformMutator = /*#__PURE__*/function (_DefaultMutator) {
    _inherits(TransformMutator, _DefaultMutator);

    var _super = _createSuper(TransformMutator);

    function TransformMutator(element, key, options) {
      var _this;

      _classCallCheck(this, TransformMutator);

      _this = _super.call(this, element, key, options);

      var w = _assertThisInitialized(_this);

      w.cssProperty = 'transform';
      return _this;
    }

    _createClass(TransformMutator, [{
      key: "style",
      get: function get() {
        var w = this;
        var customFormat = TransformMutator.format[w.key];
        var format = !!customFormat ? customFormat : "".concat(w.key, "($)");
        return format.replace('$', w.value + w.params.unit);
      }
    }]);

    return TransformMutator;
  }(DefaultMutator);

  TransformMutator.format = {
    y: 'translateY($)',
    x: 'translateX($)',
    z: 'translateZ($)',
    r: 'rotate($)'
  };

  var ColorMutator = /*#__PURE__*/function (_DefaultMutator) {
    _inherits(ColorMutator, _DefaultMutator);

    var _super = _createSuper(ColorMutator);

    function ColorMutator(element, key, params) {
      var _this;

      _classCallCheck(this, ColorMutator);

      params = _.merge(ColorMutatorDefaults.params, params);
      _this = _super.call(this, element, key, params);

      var w = _assertThisInitialized(_this);

      w.value = [null, null, null, null];
      return _this;
    }

    _createClass(ColorMutator, [{
      key: "tween",
      value: function tween(progress) {
        var w = this;
        w.value = w.value.map(function (value, i) {
          var from = w.colors.from[i];
          var to = w.colors.to[i];
          return from + (to - from) * w.ease(progress);
        });
      }
    }, {
      key: "init",
      value: function init() {
        var w = this;

        w._initEase();

        w._initColors();
      }
    }, {
      key: "_initColors",
      value: function _initColors() {
        var w = this;
        w.colors = {
          from: ColorMutator.toRGB(w.params.from),
          to: ColorMutator.toRGB(w.params.to)
        };
      }
    }, {
      key: "style",
      get: function get() {
        var w = this;
        var mode = w.value.length === 4 ? 'rgba' : 'rgb';
        var alpha = mode === 'rgba' ? ', ' + w.value[3] : '';
        return "".concat(mode, "(").concat(w.value[0], ", ").concat(w.value[1], ", ").concat(w.value[2]).concat(alpha, ")");
      }
    }], [{
      key: "toRGB",
      value: function toRGB(string) {
        var color;
        var mode = ColorMutator.getMode(string);

        switch (mode) {
          case 'hex':
            color = ColorMutator.fromHex(string);
            break;

          case 'hsl':
            color = ColorMutator.fromHSL(string);
            break;

          case 'rgb':
            color = ColorMutator.fromRGB(string);
            break;

          default:
            throw "Mode not found in '".concat(color, ". Try supported color modes: hex, rgb. (hsl coming soon)");
        }

        return color;
      }
    }, {
      key: "fromHex",
      value: function fromHex(string) {
        var rgb;

        try {
          var color = ColorMutator.matchColor(string);
          var mode = ColorMutator.getMode(color);

          if (!!color && mode === 'hex') {
            var startIndex = color.search(/(?:#|0x)/) + 1;
            var hex = color.slice(startIndex);
            var values = hex.match(/.{2}/g);
            rgb = [parseInt(values[0], 16), parseInt(values[1], 16), parseInt(values[2], 16), 1];
          } else {
            throw "Hex string is invalid.";
          }
        } catch (error) {
          console.error(error);
        }

        return rgb;
      }
    }, {
      key: "fromRGB",
      value: function fromRGB(string) {
        var rgb;

        try {
          var color = ColorMutator.matchColor(string);
          var mode = ColorMutator.getMode(color);

          if (!!color && mode === 'rgb') {
            var startIndex = color.indexOf('(') + 1;
            var endIndex = color.indexOf(')');
            rgb = color.slice(startIndex, endIndex).split(',').map(function (v) {
              return Number(v);
            });
          } else {
            throw "RGB string is invalid.";
          }
        } catch (error) {
          console.error(error);
        }

        return rgb;
      }
    }, {
      key: "fromHSL",
      value: function fromHSL(string) {
        var rgb;

        try {
          var color = ColorMutator.matchColor(string);
          var mode = ColorMutator.getMode(color);

          if (!!color && mode === 'hsl') {
            throw "HSL is not supported yet.";
          } else {
            throw "HSL string is invalid.";
          }
        } catch (error) {
          console.error(error);
        }

        return rgb;
      }
    }, {
      key: "getMode",
      value: function getMode(string) {
        var mode = string.search(/(?:#|0x)/) !== -1 ? 'hex' : string.search(/hsl/) !== -1 ? 'hsl' : string.search(/rgb/) !== -1 ? 'rgb' : false;
        return mode;
      }
    }, {
      key: "matchColor",
      value: function matchColor(string) {
        var regex = /(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{6})\b|(?:rgb|hsl)a?\([^\)]*\)/ig;
        var match = !!string.match(regex) ? string.match(regex)[0] : null;
        return match;
      }
    }]);

    return ColorMutator;
  }(DefaultMutator);

  var Mutator = function Mutator(element, key, params) {
    _classCallCheck(this, Mutator);

    var mutatorType = Mutator.mutatorTypes[key];

    switch (mutatorType) {
      case 'transform':
        return new TransformMutator(element, key, params);

      case 'color':
        return new ColorMutator(element, key, params);

      default:
        return new DefaultMutator(element, key, params);
    }
  };

  Mutator.mutatorTypes = {
    y: 'transform',
    translateY: 'transform',
    x: 'transform',
    translateX: 'transform',
    z: 'transform',
    translateZ: 'transform',
    r: 'transform',
    rotate: 'transform',
    scale: 'transform',
    color: 'color',
    backgroundColor: 'color',
    borderColor: 'color'
  };

  var Observer = /*#__PURE__*/function () {
    function Observer(element, mutators, params) {
      _classCallCheck(this, Observer);

      var w = this;
      w.params = _.merge(ObserverDefaults.params, params);
      w.element = element;
      w.queue = {
        mutators: mutators || {}
      };
      w.mutators = {};
      w.scroll = {
        current: 0,
        start: undefined,
        end: undefined,
        diff: undefined,
        progress: 0
      };
      w.isDone = false;
      w.init();
    }

    _createClass(Observer, [{
      key: "applyMutations",
      value: function applyMutations(styles) {
        var w = this;

        _.each(styles, function (cssProperty) {
          var style = styles[cssProperty].join(' ');
          w.element.style[cssProperty] = style;
        });

        w.isDone = w.progress == 0 || w.progress == 1;
      }
    }, {
      key: "getMutationsStyles",
      value: function getMutationsStyles() {
        var w = this;
        var styles = {};

        _.each(w.mutators, function (key) {
          var mutator = w.mutators[key];
          styles[key] = {
            cssProperty: mutator.cssProperty,
            cssValue: mutator.style
          };
        });

        return styles;
      }
    }, {
      key: "getMutation",
      value: function getMutation(key) {
        var w = this;
        var progress = w.progress;

        if (progress > 0 && progress < 1) {
          w.isDone = false;
        }

        w.mutators[key].tween(w.progress);
      }
    }, {
      key: "getMutations",
      value: function getMutations() {
        var w = this;

        _.each(w.mutators, function (key) {
          w.getMutation(key);
        });
      }
    }, {
      key: "addMutator",
      value: function addMutator(key, params) {
        var w = this;

        try {
          if (w.mutators[key] === undefined) {
            w.mutators[key] = new Mutator(w.element, key, params);
          } else {
            throw "Mutator '".concat(key, "' already exist on '").concat(w.name, "' observer. Try update() instead");
          }
        } catch (error) {
          console.error(error);
        }
      }
    }, {
      key: "addMutators",
      value: function addMutators(mutators) {
        var w = this;

        _.each(mutators, function (key) {
          w.addMutator(key, mutators[key]);
        });
      }
    }, {
      key: "init",
      value: function init() {
        var w = this;

        w._initScroll();

        w._initMutators();
      }
    }, {
      key: "_initMutators",
      value: function _initMutators() {
        var w = this;
        w.addMutators(w.queue.mutators);
        w.queue.mutators = {};
      }
    }, {
      key: "_initScroll",
      value: function _initScroll() {
        var w = this;
        var elementHeight = w.element.offsetHeight;
        var viewportHeight = document.body.clientHeight;
        var startEdgeDistance = w.params.edge === 'bottom' ? elementHeight : 0;
        var endEgdeDistance = w.params.edge === 'both' ? elementHeight : 0;
        var startDistance = w.element.offsetTop + startEdgeDistance;
        var start = Math.floor(startDistance - viewportHeight * w.params.from);
        var end = Math.ceil(startDistance + endEgdeDistance - viewportHeight * w.params.to);
        w.scroll = {
          current: window.scrollY || 0,
          start: start,
          end: end,
          diff: end - start
        };
      }
    }, {
      key: "progress",
      get: function get() {
        var w = this;
        var progress = Math.min(Math.max((Math.round(w.scroll.current) - w.scroll.start) / w.scroll.diff, 0), 1);
        w.element.setAttribute("data-progress-".concat(w.params.name), progress);
        return progress;
      }
    }]);

    return Observer;
  }();

  var Wonderscroll = /*#__PURE__*/function () {
    function Wonderscroll() {
      _classCallCheck(this, Wonderscroll);

      var w = this;
      var element;
      var observers;
      var params;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args.length < 3 && (_.isPlainObject(args[0]) || _.isPlainArray(args[0]))) {
        observers = args[0];
        params = args[1];
      } else {
        element = args[0];
        observers = args[1];
        params = args[2];
      }

      w.params = _.merge(WonderscrollDefaults.params, params);
      w.queue = {
        element: element || w.params.defaultElement,
        observers: _.forceArray(observers).map(function (observer) {
          return _.merge(WonderscrollDefaults.observers, observer);
        })
      };
      w.element = undefined;
      w.observers = [];
      w.raf = 0;
      w.scrollPos = 0;
      w.scrollHandler = w._handleScroll.bind(this);
      w.isInitiating = false;
      w.isInited = false;
      w.isOnScreen = false;
      w.isListeningScroll = false;
      w.isActive = true;

      if (!!w.params.init) {
        var initElement = w.init();

        if (!!initElement && initElement.length > 1) {
          return initElement;
        }
      }
    }

    _createClass(Wonderscroll, [{
      key: "update",
      value: function update(key) {
        var w = this; // Get mutations data

        w.getMutations(); // Apply mutations

        if (!!w.isActive) {
          window.cancelAnimationFrame(w.raf);
          w.raf = window.requestAnimationFrame(w.applyMutations.bind(w));
        } else if (!w.isOnScreen) {
          w.isListeningScroll = false;
          window.removeEventListener('scroll', w.scrollHandler);
        }
      }
    }, {
      key: "getMutations",
      value: function getMutations() {
        var w = this;

        _.each(w.observers, function (observer) {
          observer.scroll.current = w.scrollPos;
          observer.getMutations();

          if (!observer.isDone) {
            w.isActive = true;
          }
        });
      }
    }, {
      key: "applyMutations",
      value: function applyMutations() {
        var w = this;
        var styles = {};
        var cssStyles = {};
        var hasActiveObservers = false;

        _.each(w.observers, function (observer) {
          var progress = observer.progress;
          var isDone = progress == 0 || progress == 1;
          var observerStyles = observer.getMutationsStyles();

          _.each(observerStyles, function (key) {
            var style = observerStyles[key];

            if (!styles[key] || !isDone) {
              styles[key] = style;
            }
          });

          observer.isDone = isDone;

          if (!isDone) {
            hasActiveObservers = true;
          }
        });

        _.each(styles, function (key) {
          var style = styles[key];
          cssStyles[style.cssProperty] = _.isPlainArray(cssStyles[style.cssProperty]) ? cssStyles[style.cssProperty] : [];
          cssStyles[style.cssProperty].push(style.cssValue);
        });

        _.each(cssStyles, function (cssProperty) {
          var style = cssStyles[cssProperty].join(' ');
          w.element.style[cssProperty] = style;
        });

        w.isActive = hasActiveObservers;
      }
    }, {
      key: "addObserver",
      value: function addObserver(mutators, params) {
        var w = this;
        var target = !!w.isInited || !!w.isInitiating ? w.observers : w.queue.observers;
        var hasCustomName = !!params && !!params.name && typeof params.name === 'string';
        var genericName = String(w.params.observerNamePrefix) + w.observers.length;
        params.name = hasCustomName ? params.name : genericName;
        var observer = new Observer(w.element, mutators, params);
        target.push(observer);
      }
    }, {
      key: "addObservers",
      value: function addObservers(observers) {
        var w = this;

        _.each(observers, function (observer) {
          w.addObserver(observer.mutators, observer.params);
        });
      }
    }, {
      key: "_handleIntersecting",
      value: function _handleIntersecting(e) {
        var w = this;
        w.isOnScreen = !!e[0].isIntersecting;

        if (!!w.isOnScreen && !w.isListeningScroll) {
          w.isListeningScroll = true;
          window.addEventListener('scroll', w.scrollHandler);
        }
      }
    }, {
      key: "_handleScroll",
      value: function _handleScroll() {
        var w = this;
        w.scrollPos = window.scrollY;
        w.update();
      }
    }, {
      key: "init",
      value: function init() {
        var w = this;
        w.isInitiating = true;

        w._initElement();

        if (w.element.length > 1) {
          var elements = [];
          w.element.forEach(function (el) {
            elements.push(new Wonderscroll(el, w.queue.observers, w.params));
          });
          return elements;
        }

        w._initObservers();

        w.intersectionObserver = new IntersectionObserver(function (e) {
          return w._handleIntersecting(e);
        });
        w.intersectionObserver.observe(w.element);

        if (!!w.params.updateOnInit) {
          w.update();
        }

        w.isInited = true;
      }
    }, {
      key: "_initElement",
      value: function _initElement() {
        var w = this;

        var element = _.queryElement(w.queue.element);

        w.element = element;
        w.queue.element = null;
      }
    }, {
      key: "_initObservers",
      value: function _initObservers() {
        var w = this;
        w.addObservers(w.queue.observers);
        w.queue.observers = [];
      }
    }, {
      key: "activeObservers",
      get: function get() {
        var w = this;
        var observers = [];

        _.each(w.observers, function (observer) {
          if (!observer.isDone) {
            observers.push(observer);
          }
        });

        w.isActive = !!observers.length && observers.length > 0;
        return observers;
      }
    }]);

    return Wonderscroll;
  }();

  return Wonderscroll;

}());
//# sourceMappingURL=wonderscroll.js.map
