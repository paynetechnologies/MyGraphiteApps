// Button Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var ButtonWidget = {

        // Options
        options: {
            Type: 'Default'
        },

        // Public Methods
        RemoveSelected: function () {

            Common.RemoveClass(this.element, 'gtc-btn--is-active');

        },

        // Private Methods
        _attachClick: function () {

            // Initialize
            var thisWidget = this;

            // Mouse Down
            Events.On(thisWidget.element, 'mousedown',
                function (event) {
                    Common.AddClass(this, 'activate');
                }
            );

            // Mouse Up
            Events.On(thisWidget.element, 'mouseup',
                function (event) {
                    Common.RemoveClass(this, 'activate');
                }
            );

        },

        _attachSelectableClick: function () {

            // Initialize
            var thisWidget = this;

            // Mouse Down
            Events.On(thisWidget.element, 'mousedown',
                function (event) {
                    Common.AddClass(this, 'gtc-btn-selectableClick');
                }
            );

            // Mouse Up
            Events.On(thisWidget.element, 'mouseup',
                function (event) {
                    Common.RemoveClasses(this, 'gtc-btn-selectableClick');

                    // Get (old)Selected Button in the same ButtonGroup and Unselect it
                    var oldSelectedButton = Common.GetAllSibling(this, Common.SiblingType.All, '.gtc-btn--is-active')[0];
                    Widgets.uibutton(oldSelectedButton, 'RemoveSelected');

                    // Set (new)Selected Button to active
                    Common.AddClass(this, 'gtc-btn--is-active');
                }
            );
        },

        _attachActionHover: function () {

            // Initialize
            var thisWidget = this;

            // Mouse Enter
            Events.On(thisWidget.element, 'mouseenter',
                function (event) {
                    Common.AddClass(this.parentNode, 'focus');
                }
            );

            // Mouse Leave
            Events.On(thisWidget.element, 'mouseleave',
                function (event) {
                    Common.RemoveClass(this.parentNode, 'focus');
                }
            );

        },

        _attachDefaultFocusEvent: function () {

            // Initialize
            var thisWidget = this;

            // attach focus
            Events.On(thisWidget.element, 'focusin',
                function () {
                    Common.AddClass(this, 'focus');
                }
            );
            Events.On(thisWidget.element, 'focusout',
                function () {
                    Common.RemoveClass(this, 'focus');
                }
            );

        },

        _attachDefaultKeyboardEvents: function () {

            // Initialize
            var thisWidget = this;

            // attach key event
            Events.On(thisWidget.element, 'keydown',
                function (event) {
                    if (event.keyCode != GTC.Keyboard.Tab) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    switch (event.keyCode) {
                        case GTC.Keyboard.Enter:
                        case GTC.Keyboard.Space:
                            Events.Trigger(this, 'click');
                            break;
                    }
                }
            );

        },

        _init: function () {
        },

        _create: function () {
            switch (this.options.Type) {
                case 'Action':
                    this._attachClick();
                    this._attachActionHover();
                    break;
                case 'Selectable':
                    this._attachSelectableClick();
                    if (Common.GetAttr(this.element, 'data-selected') == 'true') {
                        Common.AddClass(this.element, 'gtc-btn--is-active');
                    }
                    break;
                case 'HighlightableDetail':
                    this._attachClick();
                    break;
                case 'Large':
                case 'Default':
                    this._attachClick();
                    this._attachDefaultFocusEvent();
                    this._attachDefaultKeyboardEvents();
                    break;
                case 'Toolbar':
                    this._attachClick();
                    break;
            }
        }

    };

    WidgetFactory.Register('gtc.uibutton', ButtonWidget);

} (window, document, Common, Cache, Events, Velocity));
