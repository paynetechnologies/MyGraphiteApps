// Mouse Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    // INFO: This is complete port of jQueryUI 1.11.4 base mouse widget code to pure vanilla javascript
    var mouseHandled = false;
    Events.On(document, 'mouseup',
        function () {
            mouseHandled = false;
        }
    );

    var MouseWidget = {

        options: {
            cancel: 'input,textarea,button,select,option',
            distance: 1,
            delay: 0
        },

        _mouseInit: function () {
            var that = this;

            Events.On(this.element, 'mousedown.' + this.widgetName,
                function (event) {
                    return that._mouseDown(event);
                }
            );
            Events.On(this.element, 'click.' + this.widgetName,
                function (event) {
                    if (true === Cache.Get(event.target, that.widgetName + '.preventClickEvent')) {
                        Cache.Remove(event.target, that.widgetName + '.preventClickEvent');
                        event.stopImmediatePropagation();
                        return false;
                    }
                }
            );

            this.started = false;
        },

        // TODO: make sure destroying one instance of mouse doesn't mess with
        // other instances of mouse
        _mouseDestroy: function() {
            Events.Off(this.element, '.' + this.widgetName);
            if (this._mouseMoveDelegate) {
                Events.Off(this.document, 'mousemove.' + this.widgetName, this._mouseMoveDelegate);
                Events.Off(this.document, 'mouseup.' + this.widgetName, this._mouseUpDelegate);
            }
        },

        _mouseDown: function(event) {
            // don't let more than one widget handle mouseStart
            if (mouseHandled) {
                return;
            }

            this._mouseMoved = false;

            // we may have missed mouseup (out of window)
            (this._mouseStarted && this._mouseUp(event));

            this._mouseDownEvent = event;

            var that = this,
                btnIsLeft = (event.which === 1),
                // event.target.nodeName works around a bug in IE 8 with
                // disabled inputs (#7620)
                elIsCancel = (Common.IsString(this.options.cancel) && event.target.nodeName ? Common.IsDefined(Common.Closest(this.options.cancel, event.target)) : false);
            if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
                return true;
            }

            this.mouseDelayMet = !this.options.delay;
            if (!this.mouseDelayMet) {
                this._mouseDelayTimer = setTimeout(function() {
                    that.mouseDelayMet = true;
                }, this.options.delay);
            }

            if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                this._mouseStarted = (this._mouseStart(event) !== false);
                if (!this._mouseStarted) {
                    event.preventDefault();
                    return true;
                }
            }

            // Click event may never have fired (Gecko & Opera)
            if (true === Cache.Get(event.target, this.widgetName + '.preventClickEvent')) {
                Cache.Remove(event.target, this.widgetName + '.preventClickEvent');
            }

            // these delegates are required to keep context
            this._mouseMoveDelegate = function(event) {
                return that._mouseMove(event);
            };
            this._mouseUpDelegate = function(event) {
                return that._mouseUp(event);
            };

            Events.On(this.document, 'mousemove.' + this.widgetName, this._mouseMoveDelegate);
            Events.On(this.document, 'mouseup.' + this.widgetName, this._mouseUpDelegate);

            event.preventDefault();

            mouseHandled = true;
            return true;
        },

        _mouseMove: function(event) {
            // Only check for mouseups outside the document if you've moved inside the document
            // at least once. This prevents the firing of mouseup in the case of IE<9, which will
            // fire a mousemove event if content is placed under the cursor. See #7778
            // Support: IE <9
            if (this._mouseMoved) {
                // IE mouseup check - mouseup happened when mouse was out of window
                if (Common.GetBrowser()[0] == 'IE' && (!document.documentMode || document.documentMode < 9) && !event.button) {
                    return this._mouseUp(event);

                // Iframe mouseup check - mouseup occurred in another document
                }
                else if (!event.which) {
                    return this._mouseUp(event);
                }
            }

            if (event.which || event.button) {
                this._mouseMoved = true;
            }

            if (this._mouseStarted) {
                this._mouseDrag(event);
                return event.preventDefault();
            }

            if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                this._mouseStarted =
                    (this._mouseStart(this._mouseDownEvent, event) !== false);
                (this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
            }

            return !this._mouseStarted;
        },

        _mouseUp: function(event) {
            Events.Off(this.document, 'mousemove.' + this.widgetName, this._mouseMoveDelegate);
            Events.Off(this.document, 'mouseup.' + this.widgetName, this._mouseUpDelegate);

            if (this._mouseStarted) {
                this._mouseStarted = false;

                if (event.target === this._mouseDownEvent.target) {
                    Cache.Set(event.target, this.widgetName + '.preventClickEvent', true);
                }

                this._mouseStop(event);
            }

            mouseHandled = false;
            return false;
        },

        _mouseDistanceMet: function(event) {
            return (Math.max(Math.abs(this._mouseDownEvent.pageX - event.pageX), Math.abs(this._mouseDownEvent.pageY - event.pageY)) >= this.options.distance);
        },

        _mouseDelayMet: function(/* event */) {
            return this.mouseDelayMet;
        },

        // These are placeholder methods, to be overriden by extending plugin
        _mouseStart: function(/* event */) {},
        _mouseDrag: function(/* event */) {},
        _mouseStop: function(/* event */) {},
        _mouseCapture: function(/* event */) { return true; }
    };

    WidgetFactory.Register('gtc.mouse', MouseWidget);

} (window, document, Common, Cache, Events, Velocity));
