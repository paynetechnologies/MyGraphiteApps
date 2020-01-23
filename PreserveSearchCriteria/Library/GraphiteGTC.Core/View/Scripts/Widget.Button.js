// Button Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var ButtonWidget = {

        // Options
        options: {
            Type: 'Default'
        },

        // Private Methods
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
                    Common.RemoveClass(oldSelectedButton, 'gtc-btn--is-active');

                    // Set (new)Selected Button to active
                    Common.AddClass(this, 'gtc-btn--is-active');
                }
            );
        },

        _init: function () {
        },

        _create: function () {
            switch (this.options.Type) {
                case 'Selectable':
                    this._attachSelectableClick();
                    if (Common.GetAttr(this.element, 'data-selected') == 'true') {
                        Common.AddClass(this.element, 'gtc-btn--is-active');
                    }
                    break;
            }
        }

    };

    WidgetFactory.Register('gtc.uibutton', ButtonWidget);

} (window, document, Common, Cache, Events, Velocity));
