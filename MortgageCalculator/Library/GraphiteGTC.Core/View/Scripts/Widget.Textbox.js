// Textbox Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var TextboxWidget = {

        // Options
        options: {
            ClassTextboxLocked: 'gtc-input-locked'
        },

        // Public Methods
        IsDisabled: function () {

            return GTC.IsControlDisabled(this.element);

        },

        EnableControl: function () {

            this._enableControl();

        },

        DisableControl: function () {

            this._disableControl();

        },

        // Private Methods
        _disableControl: function() {

            if (!this.Locked) {
                this.Locked = true;
                Common.SetAttr(this.element, 'disabled', 'disabled');
                Common.SetAttr(this.element, 'data-disabled', 'true');
                Common.AddClass(this.element, this.options.ClassTextboxLocked);
                Common.InsertHTMLString(this.element, Common.InsertType.After, '<span class="gtc-input-system"><i class="gtc-icon-styles fa fa-lock"></i></span>');
                Common.SetAttr(this.element, 'tabindex', '-1');
            }

        },

        _enableControl: function () {

            if (this.Locked) {
                Common.RemoveAttr(this.element, 'disabled');
                Common.RemoveAttr(this.element, 'data-disabled');
                Common.RemoveClass(this.element, this.options.ClassTextboxLocked);
                Common.Remove(Common.GetSibling(this.element, Common.SiblingType.Next), true);
                Common.SetAttr(this.element, 'tabindex', this.FocusIndex);
                this.Locked = false;
            }

        },

        _init: function () {

        },

        _create: function () {

            this.Locked = false;
            this.FocusIndex = Common.GetAttr(this.element, 'tabindex');

            // Disabled?
            var dataDisabled = Common.GetAttr(this.element, 'data-disabled');
            if (dataDisabled == 'true') {
                this._disableControl();
            }

        }

    };

    WidgetFactory.Register('gtc.textbox', TextboxWidget);

} (window, document, Common, Cache, Events, Velocity));
