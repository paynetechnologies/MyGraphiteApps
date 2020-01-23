// Mobile Menu Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var MobileMenuWidget = {

        // Options
        options: {
            MenuType: 'DropDown',
            MenuVisibleClass: 'gtc-nav-show',
            TargetName: '',
            ParentName: '',
            CloseButton: null,
            AnimationTime: 400,
            CloseOnBody: true
        },

        // Public Methods
        CloseMenu: function () {

            // Initialize
            var thisWidget = this;

            // Close menu
            thisWidget._closeMenu();

        },

        // Private Methods
        _closeMenu: function () {

            // Initialize
            var thisWidget = this;

            // Close menu
            if (Common.IsDefined(Common.GetAttr(Common.Get(thisWidget.options.ParentName), 'data-mobilemenu'))) {
                if (thisWidget.options.MenuType == 'DropDown') {
                    thisWidget._animateDropDownMenu();
                }
                else if (thisWidget.options.MenuType == 'SideBar') {
                    thisWidget._animateSideBarMenu();
                }
            }

        },

        _animateDropDownMenu: function () {

            // Initialize
            var thisWidget = this;
            var menuElement = Common.Get(thisWidget.options.TargetName);

            // If/Hide Else/Show
            if (Common.HasClass(menuElement, thisWidget.options.MenuVisibleClass)) {
                Common.RemoveAttr(Common.Get(thisWidget.options.ParentName), 'data-mobilemenu');
                Events.Off(document.body, 'click.mobileMenuCloseOnBodyClick' + thisWidget.options.TargetName);
                Velocity(menuElement, 'slideUp', thisWidget.options.AnimationTime,
                    function () {
                        Common.RemoveClass(this[0], thisWidget.options.MenuVisibleClass);
                        Common.RemoveAttr(this[0], 'style');
                    }
                );
            }
            else {
                Common.SetAttr(Common.Get(thisWidget.options.ParentName), 'data-mobilemenu', 'open');
                Velocity(menuElement, 'slideDown', thisWidget.options.AnimationTime,
                    function () {
                        Common.AddClass(this[0], thisWidget.options.MenuVisibleClass);
                        Common.RemoveAttr(this[0], 'style');
                    }
                );
                thisWidget._attachCloseOnBodyClick();
            }

        },

        _animateSideBarMenu: function () {

            // Initialize
            var thisWidget = this;
            var menuElement = Common.Get(thisWidget.options.TargetName);
            var pageElement = Common.Get('DivPage');
            var closeButton = Common.Get(thisWidget.options.CloseButton);

            // If/Hide Else/Show
            if (Common.HasClass(menuElement, thisWidget.options.MenuVisibleClass)) {
                Common.RemoveAttr(Common.Get(thisWidget.options.ParentName), 'data-mobilemenu');
                Events.Off(document.body, 'click.mobileMenuCloseOnBodyClick' + thisWidget.options.TargetName);
                Velocity(menuElement, { 'right': '-75%' }, thisWidget.options.AnimationTime,
                    function () {
                        Common.RemoveClass(menuElement, thisWidget.options.MenuVisibleClass);
                    }
                );
                Velocity(pageElement, { 'left': '0%' }, thisWidget.options.AnimationTime,
                    function () {
                        pageElement.style.position = '';
                    }
                );
                if (Common.IsDefined(closeButton)) {
                    Velocity(closeButton, { 'right': '-75%' }, thisWidget.options.AnimationTime,
                        function () {
                            Common.RemoveClass(closeButton, thisWidget.options.MenuVisibleClass);
                        }
                    );
                }
            }
            else {
                Common.SetAttr(Common.Get(thisWidget.options.ParentName), 'data-mobilemenu', 'open');
                Common.AddClass(menuElement, thisWidget.options.MenuVisibleClass);
                Velocity(menuElement, { 'right': '0%' }, thisWidget.options.AnimationTime);
                pageElement.style.position = 'relative';
                Velocity(pageElement, { 'left': '-75%' }, thisWidget.options.AnimationTime);
                if (Common.IsDefined(closeButton)) {
                    Common.AddClass(closeButton, thisWidget.options.MenuVisibleClass);
                    Velocity(closeButton, { 'right': '0%' }, thisWidget.options.AnimationTime);
                }
                thisWidget._attachCloseOnBodyClick();
            }

        },

        _attachClickOpenEvent: function () {

            // Initialize
            var thisWidget = this;

            // Add click event to mobile visibility only link
            Events.On(thisWidget.element, 'click',
                function (event) {
                    if (thisWidget.options.MenuType == 'DropDown') {
                        thisWidget._animateDropDownMenu();
                    }
                    else if (thisWidget.options.MenuType == 'SideBar') {
                        thisWidget._animateSideBarMenu();
                    }
                    if (Common.CheckMedia('Mobile')) {
                        thisWidget._viewElementHelper();
                    }
                }
            );

        },

        _attachClickCloseEvent: function () {

            // Initialize
            var thisWidget = this;

            // Attach close button event
            if (Common.IsDefined(thisWidget.options.CloseButton)) {
                Events.On(Common.Get(thisWidget.options.CloseButton), 'click',
                    function (event) {
                        if (Common.IsDefined(Common.GetAttr(Common.Get(thisWidget.options.ParentName), 'data-mobilemenu'))) {
                            thisWidget._animateSideBarMenu();
                        }
                    }
                );
            }

        },

        _attachCloseOnBodyClick: function () {

            // Initialize
            var thisWidget = this;

            // Attach body click event
            Events.On(document.body, 'click.mobileMenuCloseOnBodyClick' + thisWidget.options.TargetName + '.' + thisWidget.options.TargetName,
                function (event) {
                    var eventTarget = event.target;
                    if (Common.Closest('#' + thisWidget.element.id, eventTarget) && Common.Closest('#' + thisWidget.options.TargetName, eventTarget) && eventTarget.id != thisWidget.element.id && eventTarget.id != thisWidget.options.TargetName) {
                        Events.Off(document.body, 'click.mobileMenuCloseOnBodyClick' + thisWidget.options.TargetName);
                        thisWidget._closeMenu();
                    }
                }
            );

        },

        _addScrollbar: function () {

            // Initialize
            var thisWidget = this;
            var menuElement = Common.Get(thisWidget.options.TargetName);

            // Add scroll class
            Common.AddClass(menuElement, 'gtc-cfscroll-y');

        },

        _viewElementHelper: function () {

            Events.Trigger(document, 'mobilesliderscrollbar');

        },

        _init: function () {
        },

        _create: function () {

            // Initialize
            var thisWidget = this;

            // Attach open event
            thisWidget._attachClickOpenEvent();

            // Attach close click for side bar menu and check for scrollbar
            if (thisWidget.options.MenuType == 'SideBar') {
                thisWidget._attachClickCloseEvent();
                if (Common.CheckMedia('Mobile')) {
                    thisWidget._addScrollbar();
                }
            }

        }

    };

    WidgetFactory.Register('gtc.mobilemenu', MobileMenuWidget);

} (window, document, Common, Cache, Events, Velocity));
