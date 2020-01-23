// Breadcrumb Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var BreadcrumbWidget = {

        // Options
        options: {
            CrumbsContainer: null,
            Crumbs: null,
            MinimumMobileCompression: 2,
            MinimumTabletCompression: 4,
            MinimumDesktopCompression: 5,
            SelectedCompression: null,
            MaxLastCrumbLength: 400,
            MinLastCrumbLength: 200,
            MobileBeginningElementsToLeaveOpen: 0,
            TabletBeginningElementsToLeaveOpen: 1,
            DesktopBeginningElementsToLeaveOpen: 2,
            BeginningElementsToLeaveOpen: null,
            EndElementsToLeaveOpen: 1,
            CompressedWidth: 21,
            DeviceTypeFocusEvent: 'mouseover'
        },

        // Public Methods

        // Private Methods
        _destroy: function () {

            var thisWidget = this;
            var finalElement = Common.Query('.gtc-last-breadcrumb', thisWidget.options.CrumbsContainer);
            Common.RemoveClass(thisWidget.options.Crumbs[thisWidget.options.Crumbs.length - 1], 'gtc-last-breadcrumb');
            Common.RemoveClass(thisWidget.options.Crumbs[0], 'gtc-first-breadcrumb');
            var finalElementWidth = Common.Width(finalElement);
            if (finalElementWidth > thisWidget.options.MaxLastCrumbLength) {
                if (thisWidget.options.BeginningElementsToLeaveOpen > 0) {
                    thisWidget.options.BeginningElementsToLeaveOpen--;
                }
                if (thisWidget.options.EndElementsToLeaveOpen > 0) {
                    thisWidget.options.EndElementsToLeaveOpen--;
                }
            }
            if (finalElementWidth < thisWidget.options.MaxLastCrumbLength && finalElementWidth > thisWidget.options.MinLastCrumbLength) {
                if (thisWidget.options.BeginningElementsToLeaveOpen > 0) {
                    thisWidget.options.BeginningElementsToLeaveOpen--;
                }
            }
            if (thisWidget.options.SelectedCompression == thisWidget.options.MinimumMobileCompression) {
                if (thisWidget.options.BeginningElementsToLeaveOpen > 0) {
                    thisWidget.options.BeginningElementsToLeaveOpen--;
                }
            }
            var itemsToRemove = thisWidget.options.Crumbs.length - 1 - thisWidget.options.EndElementsToLeaveOpen;
            var currentCrumb, currentCrumbLink, index = 0, length = thisWidget.options.Crumbs.length;
            for ( ; index < length; index++) {
                currentCrumb = thisWidget.options.Crumbs[index];
                if (index > thisWidget.options.BeginningElementsToLeaveOpen && index <= itemsToRemove) {
                    currentCrumbLink = Common.Query('a', currentCrumb);
                    currentCrumbLink.style.width = '';

                    // Remove events
                    Events.Off(currentCrumb, 'tap');
                    Events.Off(currentCrumb, 'mouseover');
                    Events.Off(currentCrumb, 'mouseout');
                    clearInterval(currentCrumb.AutoInterval);
                }
            }

        },

        _expandBreadcrumb: function (event) {

            event.stopPropagation();
            var element = event.data.element;
            Velocity(element, 'stop');
            Velocity(element, 'reverse', { queue: false });
            Velocity(element, 'finish');
            return false;

        },

        _compressBreadcrumb: function (event) {

            event.stopPropagation();
            var element = event.data.element;
            Velocity(element, 'stop');
            Velocity(element, { width: event.data.thisWidget.options.CompressedWidth }, { queue: false });
            Velocity(element, 'finish');
            return false;

        },

        _initialBreadcrumbCompression: function () {

            var thisWidget = this;

            // Get last crumb
            var finalElement = Common.Query('.gtc-last-breadcrumb', thisWidget.options.CrumbsContainer);
            var finalElementWidth = Common.Width(finalElement);

            // If last crumb is long compress more crumbs
            if (finalElementWidth > thisWidget.options.MaxLastCrumbLength) {
                if (thisWidget.options.BeginningElementsToLeaveOpen > 0) {
                    thisWidget.options.BeginningElementsToLeaveOpen--;
                }
                if (thisWidget.options.EndElementsToLeaveOpen > 0) {
                    thisWidget.options.EndElementsToLeaveOpen--;
                }
            }

            // If last crumb is in safe range compress default amount
            if (finalElementWidth < thisWidget.options.MaxLastCrumbLength && finalElementWidth > thisWidget.options.MinLastCrumbLength) {
                if (thisWidget.options.BeginningElementsToLeaveOpen > 0) {
                    thisWidget.options.BeginningElementsToLeaveOpen--;
                }
            }

            // Hide more on mobile
            if (thisWidget.options.SelectedCompression == thisWidget.options.MinimumMobileCompression) {
                if (thisWidget.options.BeginningElementsToLeaveOpen > 0) {
                    thisWidget.options.BeginningElementsToLeaveOpen--;
                }
            }

            // Compress Elements
            var itemsToRemove = thisWidget.options.Crumbs.length - 1 - thisWidget.options.EndElementsToLeaveOpen;
            var currentCrumb, currentCrumbLink, index = 0, length = thisWidget.options.Crumbs.length;
            for ( ; index < length; index++) {
                currentCrumb = thisWidget.options.Crumbs[index];
                if (index > thisWidget.options.BeginningElementsToLeaveOpen && index <= itemsToRemove) {
                    currentCrumbLink = Common.Query('a', currentCrumb);

                    // Setup element animation parameters
                    var options = {
                        element: currentCrumbLink,
                        thisWidget: thisWidget
                    };

                    // Bind events
                    Events.On(currentCrumb, thisWidget.options.DeviceTypeFocusEvent, options, thisWidget._expandBreadcrumb);
                    Events.On(currentCrumb, 'mouseout', options, thisWidget._compressBreadcrumb);

                    // For loops have no scope! Give it some. (IIFE)
                    (function (currentCrumb, index, itemsToRemove) {

                        currentCrumb.AutoInterval = setInterval(
                            function() {
                                clearInterval(currentCrumb.AutoInterval);
                                Velocity(Common.Query('a', currentCrumb), { width: thisWidget.options.CompressedWidth },
                                    function () {
                                        if (index == itemsToRemove) {
                                            // TODO: Find initial height and determine if this even needs to be called after animations.
                                            Page.SetPageHeight();
                                        }
                                    }
                                );
                            }, (150 * (index - 2))
                        );

                    }(currentCrumb, index, itemsToRemove));
                }
            }

        },

        _setupResize: function () {

            var thisWidget = this;
            var onResizeEndFunction = function (event) {
                thisWidget._destroy();
                if (Common.CheckMedia('Mobile', true)) {
                    thisWidget.options.SelectedCompression = thisWidget.options.MinimumMobileCompression;
                    thisWidget.options.BeginningElementsToLeaveOpen = thisWidget.options.MobileBeginningElementsToLeaveOpen;
                    thisWidget.options.DeviceTypeFocusEvent = 'tap';
                }
                else if (Common.CheckMedia('Tablet', true)) {
                    thisWidget.options.SelectedCompression = thisWidget.options.MinimumTabletCompression;
                    thisWidget.options.BeginningElementsToLeaveOpen = thisWidget.options.TabletBeginningElementsToLeaveOpen;
                    thisWidget.options.DeviceTypeFocusEvent = 'tap';
                }
                else {
                    thisWidget.options.SelectedCompression = thisWidget.options.MinimumDesktopCompression;
                    thisWidget.options.BeginningElementsToLeaveOpen = thisWidget.options.DesktopBeginningElementsToLeaveOpen;
                }
                thisWidget._setupBreadCrumb();
            };
            Common.AttachWindowResizingEvent(onResizeEndFunction, 'onBreadcrumbResize');

        },

        _setupBreadCrumb: function () {

            var thisWidget = this;

            // If there are no breadcrumbs don't do anything
            if (thisWidget.options.Crumbs.length > 0) {
                Common.AddClass(thisWidget.options.Crumbs[thisWidget.options.Crumbs.length - 1], 'gtc-last-breadcrumb');
                Common.AddClass(thisWidget.options.Crumbs[0], 'gtc-first-breadcrumb');

                // If we have enough breadcrumbs to matter compress them
                if (thisWidget.options.Crumbs.length > thisWidget.options.SelectedCompression) {
                    thisWidget._initialBreadcrumbCompression();
                }
            }

        },

        _init: function () {

        },

        _create: function () {

            // Initialize
            var thisWidget = this;
            thisWidget.options.CrumbsContainer = Common.Query('.gtc-breadcrumbs', thisWidget.element);
            thisWidget.options.Crumbs = Common.QueryAll('.gtc-breadcrumb', thisWidget.options.CrumbsContainer);
            if (Common.CheckMedia('Mobile')) {
                thisWidget.options.SelectedCompression = thisWidget.options.MinimumMobileCompression;
                thisWidget.options.BeginningElementsToLeaveOpen = thisWidget.options.MobileBeginningElementsToLeaveOpen;
                thisWidget.options.DeviceTypeFocusEvent = 'tap';
            }
            else if (Common.CheckMedia('Tablet')) {
                thisWidget.options.SelectedCompression = thisWidget.options.MinimumTabletCompression;
                thisWidget.options.BeginningElementsToLeaveOpen = thisWidget.options.TabletBeginningElementsToLeaveOpen;
                thisWidget.options.DeviceTypeFocusEvent = 'tap';
            }
            else {
                thisWidget.options.SelectedCompression = thisWidget.options.MinimumDesktopCompression;
                thisWidget.options.BeginningElementsToLeaveOpen = thisWidget.options.DesktopBeginningElementsToLeaveOpen;
            }

            // Initialize touch?
            if (thisWidget.options.DeviceTypeFocusEvent == 'tap') {
                Touch.InitializeTouchEvents();
            }

            // Setup crumbs
            thisWidget._setupBreadCrumb();
            thisWidget._setupResize();

        }

    };

    WidgetFactory.Register('gtc.breadcrumb', BreadcrumbWidget);

} (window, document, Common, Cache, Events, Velocity));
