// Simple namespace to access widgets
// Widgets
(function (Widgets, window, document, Common, Cache, Events, Velocity, undefined) {

	// Public Variables
    Widgets = {};

} (window.Widgets = window.Widgets || {}, window, document, Common, Cache, Events, Velocity));

// INFO: This is complete port of jQueryUI 1.11.4 widget factory code to pure vanilla javascript
// Widget Factory
(function (WidgetFactory, window, document, Common, Cache, Events, Velocity, undefined) {

	// Public Variables
	WidgetFactory.WidgetInitializer = function () {};
	WidgetFactory.WidgetInitializer._childConstructors = [];

	// Private Variables
	var WidgetGUID = 0;
	var WidgetSlice = Array.prototype.slice;

    // Public Methods
	WidgetFactory.Register = function (name, base, prototype) {

		var fullName, existingConstructor, constructor, basePrototype;
		var index, length;

		// proxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		var proxiedPrototype = {}, namespace = name.split('.')[0];
		var name = name.split('.')[1];
		var fullName = namespace + '-' + name;

		if (!prototype) {
			prototype = base;
			base = WidgetFactory.WidgetInitializer;
		}

		WidgetFactory[namespace] = WidgetFactory[namespace] || {};
		existingConstructor = WidgetFactory[namespace][name];
		constructor = WidgetFactory[namespace][name] = function (options, element) {
			// allow instantiation without 'new' keyword
			if (!this._createWidget) {
				return new constructor(options, element);
			}

			// allow instantiation without initializing for simple inheritance
			// must use 'new' keyword (the code above always passes args)
			if (arguments.length) {
				this._createWidget(options, element);
			}
		};

		// extend with the existing constructor to carry over any static properties
		MergeWidget(constructor, existingConstructor, {
			version: prototype.version,
			// copy the object used to create the prototype in case we need to
			// redefine the widget later
			_proto: Common.MergeObjects({}, prototype),
			// track widgets that inherit from this widget in case this widget is
			// redefined after a widget inherits from it
			_childConstructors: []
		});

		basePrototype = new base();
		// we need to make the options hash a property directly on the new instance
		// otherwise we'll modify the options hash on the prototype that we're
		// inheriting from
		basePrototype.options = MergeWidget({}, basePrototype.options);
		for (prop in prototype) {
			value = prototype[prop];
			(function (prop, value) {
				if (!Common.IsFunction(value)) {
					proxiedPrototype[prop] = value;
					return;
				}
				proxiedPrototype[prop] = (function () {
					var _super = function () {
						return base.prototype[prop].apply(this, arguments);
					},
					_superApply = function (args) {
						return base.prototype[prop].apply(this, args);
					};
					return function () {
						var __super = this._super;
						var __superApply = this._superApply;
						var returnValue;

						this._super = _super;
						this._superApply = _superApply;

						returnValue = value.apply(this, arguments);

						this._super = __super;
						this._superApply = __superApply;

						return returnValue;
					};
				})();
			}(prop, value));
		}
		constructor.prototype = MergeWidget(basePrototype, {
			// TODO: remove support for widgetEventPrefix
			// always use the name + a colon as the prefix, e.g., draggable:start
			// don't prefix for widgets that aren't DOM-based
			widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
		}, proxiedPrototype, {
			constructor: constructor,
			namespace: namespace,
			widgetName: name,
			widgetFullName: fullName
		});

		// If this widget is being redefined then we need to find all widgets that
		// are inheriting from it and redefine all of them so that they inherit from
		// the new version of this widget. We're essentially trying to replace one
		// level in the prototype chain.
		if (existingConstructor) {
			var child, childPrototype, index = 0, length = existingConstructor._childConstructors.length;
			for ( ; index < length; index++) {
				child = existingConstructor._childConstructors[index];
				childPrototype = child.prototype;

				// redefine the child widget using the same prototype that was
				// originally used, but inherit from the new version of the base
				WidgetFactory.WidgetInitializer(childPrototype.namespace + '.' + childPrototype.widgetName, constructor, child._proto);
			}
			// remove the list of existing child constructors from the old constructor
			// so the old child constructors can be garbage collected
			delete existingConstructor._childConstructors;
		}
		else {
			base._childConstructors.push(constructor);
		}

		WidgetFactory.Bridge(name, constructor);
		return constructor;

	};

	WidgetFactory.Bridge = function (name, object) {

		var fullName = object.prototype.widgetFullName || name;
		Widgets[name] = function (elements, options) {
			var isMethodCall = Common.IsString(options);
			var elementArray;
			if (Common.IsArray(elements)) {
				elementArray = elements;
			}
			else {
				elementArray = [];
				elementArray.push(elements);
			}
			var args = WidgetSlice.call(arguments, 1), returnValue = elementArray;

			var index = 0, length = elementArray.length;
			if (isMethodCall) {
				// Remove method name from args
				args = WidgetSlice.call(args, 1);
				for ( ; index < length; index++) {
					var methodValue, instance = Cache.Get(elementArray[index], fullName);
					if (options === 'instance') {
						returnValue = instance;
						// TODO: handle multiple elements
						continue;
					}

					// Don't blow the world up like jQuery. Lets just log an error and 'attempt' to move on
					if (!instance) {
						console.log('Cannot call method: ' + options + ' on widget: ' + name + ' prior to initialization.');
						return;
					}
					if (!Common.IsFunction(instance[options]) || options.charAt(0) === '_') {
						console.log('No such method: ' + options + ' on widget instance: ' + name);
						return;
					}
					methodValue = instance[options].apply(instance, args);
					if (methodValue !== instance && methodValue !== undefined) {
						returnValue = methodValue;
						// TODO: handle multiple elements
						continue;
					}
				}
			}
			else {
				// Allow multiple hashes to be passed on init
				if (args.length) {
					options = MergeWidget.apply(null, [options].concat(args));
				}
				for ( ; index < length; index++) {
					var instance = Cache.Get(elementArray[index], fullName);
					if (instance) {
						instance.option(options || {});
						if (instance._init) {
							instance._init();
						}
					}
					else {
						Cache.Set(elementArray[index], fullName, new object(options, elementArray[index]));
					}
				}
			}
			return returnValue;
		};

	};

	WidgetFactory.WidgetInitializer.prototype = {
		widgetName: 'widget',
		widgetEventPrefix: '',
		defaultElement: '<div>',
		options: {
			disabled: false,

			// callbacks
			create: null
		},
		_createWidget: function (options, element) {
			element = element || this.defaultElement || this;
			this.element = element;
			this.uuid = 'GTCWidget' + WidgetGUID++;
			this.eventNamespace = '.' + this.widgetName + this.uuid;

			this.bindings = [];
			this.hoverable = [];
			this.focusable = [];

			if (element !== this) {
				Cache.Set(element, this.widgetFullName, this);

				// Add remove event for cleaning up widgets on Common.Remove -> Cache.CleanElementData
				this._on(true, this.element, {
					remove: function (event) {
						if (event.target === element) {
							this.destroy();
						}
					}
				});
				this.document = element.style ? element.ownerDocument : element.document || element;
				this.window = this.document.defaultView || this.document.parentWindow;
			}

			this.options = MergeWidget({}, this.options, this._getCreateOptions(), options);

			this._create();
			this._init();
		},
		_getCreateOptions: function () { return {}; },
		_getCreateEventData: function () {},
		_create: function () {},
		_init: function () {},
		destroy: function () {
			this._destroy();
			Events.Off(this.element, this.eventNamespace);
			Cache.Remove(this.element, this.widgetFullName);
			Events.Off(this.widget(), this.eventNamespace);
			Common.RemoveAttr(this.widget(), 'aria-disabled');
			Common.RemoveClasses(this.widget(), this.widgetFullName + '-disabled gtc-ui-state-disabled');

			// clean up events and states
			var index = 0, length = this.bindings.length;
			for ( ; index < length; index++) {
				Events.Off(this.bindings[index], this.eventNamespace);
			}
			index = 0, length = this.hoverable.length;
			for ( ; index < length; index++) {
				Common.RemoveClass(this.hoverable[index], 'gtc-ui-state-hover');
			}
			index = 0, length = this.focusable.length;
			for ( ; index < length; index++) {
				Common.RemoveClass(this.focusable[index], 'gtc-ui-state-focus');
			}
		},
		_destroy: function () {},
		widget: function () {
			return this.element;
		},
		option: function (key, value) {
			var options = key, parts, curOption, i;

			if (arguments.length === 0) {
				// don't return a reference to the internal hash
				return MergeWidget({}, this.options);
			}

			if (Common.IsString(key)) {
				// handle nested keys, e.g., 'foo.bar' => { foo: { bar: ___ } }
				options = {};
				parts = key.split('.');
				key = parts.shift();
				if (parts.length) {
					curOption = options[key] = MergeWidget({}, this.options[key]);
					for (i = 0; i < parts.length - 1; i++) {
						curOption[parts[i]] = curOption[parts[i]] || {};
						curOption = curOption[parts[i]];
					}
					key = parts.pop();
					if (arguments.length === 1) {
						return curOption[key] === undefined ? null : curOption[key];
					}
					curOption[key] = value;
				}
				else {
					if (arguments.length === 1) {
						return this.options[key] === undefined ? null : this.options[key];
					}
					options[key] = value;
				}
			}

			this._setOptions(options);
			return this;
		},
		_setOptions: function (options) {
			var key;
			for (key in options) {
				this._setOption(key, options[key]);
			}
			return this;
		},
		_setOption: function (key, value) {
			this.options[key] = value;
			if (key === 'disabled') {
				if (!!value) {
					Common.AddClass(this.widget(), this.widgetFullName + '-disabled');
				}
				else {
					Common.RemoveClass(this.widget(), this.widgetFullName + '-disabled');
				}
				if (value) {
					Common.RemoveClassFromElements(this.hoverable, 'gtc-ui-state-hover');
					Common.RemoveClassFromElements(this.focusable, 'gtc-ui-state-focus');
				}
			}
			return this;
		},
		enable: function () {
			return this._setOptions({ disabled: false });
		},
		disable: function () {
			return this._setOptions({ disabled: true });
		},
		_on: function (suppressDisabledCheck, element, handlers) {
			var delegateElement, instance = this;

			// no suppressDisabledCheck flag, shuffle arguments
			if (!Common.IsBoolean(suppressDisabledCheck)) {
				handlers = element;
				element = suppressDisabledCheck;
				suppressDisabledCheck = false;
			}

			// no element argument, shuffle and use this.element
			if (!handlers) {
				handlers = element;
				element = this.element;
				delegateElement = this.widget();
			}
			else {
				element = delegateElement = element;
				this.bindings.push(element);
			}

			for (eventType in handlers) {
				var handler = handlers[eventType];
                // For loops have no scope! Give it some. (IIFE)
                (function (eventType, handler) {
					function handlerProxy() {
						// allow widgets to customize the disabled handling
						// - disabled as an array instead of boolean
						// - disabled class as method for disabling individual parts
						if (!suppressDisabledCheck && (instance.options.disabled === true || (this && this.classList && Common.HasClass(this,  'gtc-ui-state-disabled')))) {
							return;
						}
						return (Common.IsString(handler) ? instance[handler] : handler).apply(instance, arguments);
					}

					// copy the guid so direct unbinding works
					if (!Common.IsString(handler)) {
						handlerProxy.guid = handler.guid = handler.guid || handlerProxy.guid || Events.GetNextEventGUID();
					}

					var match = eventType.match(/^([\w:-]*)\s*(.*)$/),
						eventName = match[1] + instance.eventNamespace,
						selector = match[2];
					if (selector) {
						Events.On(delegateElement, eventName, selector, handlerProxy);
					}
					else {
						Events.On(element, eventName, handlerProxy);
					}
                }(eventType, handler));
			}
		},
		_off: function (element, eventName) {
			eventName = (eventName || '').split(' ').join(this.eventNamespace + ' ') + this.eventNamespace;
			Events.Off(element, eventName);

			// Clear the stack to avoid memory leaks (#10056)
			this.bindings = Common.FilterArray(this.bindings,
	            function (value) {
	                return value != element;
	            }
	        );
			this.focusable = Common.FilterArray(this.focusable,
	            function (value) {
	                return value != element;
	            }
	        );
			this.hoverable = Common.FilterArray(this.hoverable,
	            function (value) {
	                return value != element;
	            }
	        );
		},
		_trigger: function (type, event, data) {
			var prop, orig, callback = this.options[type];

			data = data || {};
			event = Events.Event(event);
			event.type = (type === this.widgetEventPrefix ? type : this.widgetEventPrefix + type).toLowerCase();
			// The original event may come from any element so we need to reset the target on the new event
			event.target = this.element;

			// Copy original event properties over to the new event
			orig = event.originalEvent;
			if (orig) {
				for (prop in orig) {
					if (!(prop in event)) {
						event[prop] = orig[prop];
					}
				}
			}

			Events.Trigger(this.element, event, data);
			return !(Common.IsFunction(callback) && callback.apply(this.element, [event].concat(data)) === false || event.isDefaultPrevented());
		},
		_hoverable: function (elements) {
			if (!elements.length) {
				elements = [elements];
			}
			var element, index = 0, length = elements.length;
			for ( ; index < length; index++) {
				element = elements[index];
				this.hoverable.push(element);
				this._on(element, {
					mouseenter: function (event) {
						Common.AddClass(event.currentTarget, 'gtc-ui-state-hover');
					},
					mouseleave: function (event) {
						Common.RemoveClass(event.currentTarget, 'gtc-ui-state-hover');
					}
				});
			}
		},
		_focusable: function (elements) {
			if (!elements.length) {
				elements = [elements];
			}
			var element, index = 0, length = elements.length;
			for ( ; index < length; index++) {
				element = elements[index];
				this.focusable.push(element);
				this._on(element, {
					focusin: function (event) {
						Common.AddClass(event.currentTarget, 'gtc-ui-state-focus');
					},
					focusout: function (event) {
						Common.RemoveClass(event.currentTarget, 'gtc-ui-state-focus');
					}
				});
			}
		}
	};

	// Private Methods
	function MergeWidget (target) {

		var input = WidgetSlice.call(arguments, 1);
		var inputIndex = 0, inputLength = input.length, key, value;
		for ( ; inputIndex < inputLength; inputIndex++) {
			for (key in input[inputIndex]) {
				value = input[inputIndex][key];
				if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {
					// Clone objects
					if (Common.IsPlainObject(value)) {
						// Don't extend strings, arrays, etc. with objects
						target[key] = Common.IsPlainObject(target[key]) ? MergeWidget({}, target[key], value) : MergeWidget({}, value);
						// Copy everything else by reference
					}
					else {
						target[key] = value;
					}
				}
			}
		}
		return target;

	};

} (window.WidgetFactory = window.WidgetFactory || {}, window, document, Common, Cache, Events, Velocity));
