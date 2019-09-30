// Scrollbar Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var ScrollbarWidget = {

        // Options
        options: {
            AutoExpand: true,
            AutoHide: true,
            RecalculateOnWindowResize: false,
            SetInitialScrollHeight: null,
            OnScroll: null
        },

        // Public Methods
        SetVerticalScrollTop: function (scrollTo) {

            this._setVerticalScrollTop(scrollTo);

        },

        GetVerticalScrollTop: function () {

            return this._getVerticalScrollTop();

        },

        RemoveScrollbar: function () {

            this._removeScrollbar();

        },

        RecalculateSliderHeights: function () {

            if (this.ScrollbarInitialized == true) {
                this._recalculateSliderHeights();
            }

        },

        IsComplete: function () {

            return this._isComplete();

        },

        // Private Methods
        _setVerticalScrollTop: function (scrollTo) {

            // Initialize
            var thisWidget = this;
            if (Common.IsDefined(thisWidget.DomElement) && Common.IsDefined(scrollTo)) {
                thisWidget.DomElement.scrollTop = scrollTo;
                thisWidget._adjustScrollBarToContent();
            }

        },

        _getVerticalScrollTop: function () {

            // Initialize
            var thisWidget = this;
            if (Common.IsDefined(thisWidget.DomElement)) {
                return thisWidget.DomElement.scrollTop;
            }
            else {
                return null;
            }

        },

        _removeScrollbar: function () {

            var thisWidget = this;
            Common.Remove(thisWidget.Scrollbar);
            if (Common.HasClass(thisWidget.element.parentNode, 'gtc-scrollwrapper')) {
                Common.Unwrap(thisWidget.element);
            }
            thisWidget.DomElement.style.overflow = '';
            if (thisWidget.onShowScrollBarFunction) {
                document.removeEventListener('mouseover', thisWidget.onShowScrollBarFunction);
            }
            if (thisWidget.onHideScrollBarFunction) {
                document.removeEventListener('mouseout', thisWidget.onHideScrollBarFunction);
            }
            if (thisWidget.onWheelFunction) {
                document.removeEventListener('wheel', thisWidget.onWheelFunction);
            }
            if (thisWidget.onTouchStartFunction) {
                document.removeEventListener('touchstart', thisWidget.onTouchStartFunction);
            }
            if (thisWidget.onTouchMoveFunction) {
                document.removeEventListener('touchmove', thisWidget.onTouchMoveFunction);
            }
            if (thisWidget.onTouchEndFunction) {
                document.removeEventListener('touchend', thisWidget.onTouchEndFunction);
            }
            if (thisWidget.onStartDragFunction) {
                document.removeEventListener('mousedown', thisWidget.onStartDragFunction);
            }
            thisWidget._initializeLocalProperties();

        },

        _recalculateSliderHeights: function () {

            var thisWidget = this;
            thisWidget._calculateScrollProperties();
            var maxValue = Common.Height(thisWidget.element) - thisWidget.ScrollbarHeight - (thisWidget.ScrollbarMargins * 2);
            Common.SetAttr(thisWidget.Scrollbar, 'aria-valuemax', maxValue);
            var scrollbarStyle = thisWidget.Scrollbar.style;
            scrollbarStyle.right = thisWidget.Scrollbar.offsetWidth - thisWidget.ScrollbarMargins + 'px';
            scrollbarStyle.top = thisWidget.ScrollbarMargins + 'px';
            scrollbarStyle.height = thisWidget.ScrollbarHeight + 'px';
            thisWidget._adjustScrollBarToContent(true);


        },

        _isComplete: function () {

            var thisWidget = this;
            return thisWidget.ScrollbarInitialized;

        },

        _calculateScrollProperties: function () {

            var thisWidget = this;
            thisWidget.ElementHeight = thisWidget.DomElement.offsetHeight;
            thisWidget.ScrollWrapperHeight = thisWidget.ScrollWrapper.offsetHeight;
            thisWidget.MaxScrollTop = thisWidget.DomElement.scrollHeight - thisWidget.ElementHeight;
            thisWidget.ScrollbarHeight = thisWidget._calculateScrollbarHeight();

        },

        _calculateScrollbarHeight: function () {

            var thisWidget = this;
            var percentage = thisWidget.ElementHeight / thisWidget.DomElement.scrollHeight;
            return thisWidget.ElementHeight * percentage - thisWidget.ScrollbarMargins * 2;

        },

        _setupScrollWrapper: function () {

            var thisWidget = this;
            thisWidget.ParentElement = thisWidget.DomElement.parentNode;
            thisWidget.ScrollWrapper = document.createElement('div');
            thisWidget.ParentElement.appendChild(thisWidget.ScrollWrapper);
            thisWidget.ScrollWrapper.className = 'gtc-scrollwrapper';
            thisWidget.ScrollWrapper.style.position = 'relative';
            thisWidget.ParentElement.insertBefore(thisWidget.ScrollWrapper, thisWidget.DomElement);
            thisWidget.DomElement.style.overflow = 'hidden';
            thisWidget.ScrollWrapper.appendChild(thisWidget.DomElement);

        },

        _setupScrollBar: function () {

            var thisWidget = this;
            thisWidget.Scrollbar = document.createElement('div');
            var scrollbarStyle = thisWidget.Scrollbar.style;
            if (thisWidget.options.AutoHide == true) {
                scrollbarStyle.opacity = 0;
            }
            thisWidget.ScrollWrapper.appendChild(thisWidget.Scrollbar);
            thisWidget.Scrollbar.className = 'gtc-scrollbar';
            Common.SetAttr(thisWidget.Scrollbar, 'role', 'scrollbar');
            Common.SetAttr(thisWidget.Scrollbar, 'aria-controls', thisWidget.element.id);
            Common.SetAttr(thisWidget.Scrollbar, 'aria-orientation', 'vertical');
            var maxValue = Common.Height(thisWidget.element) - thisWidget.ScrollbarHeight - (thisWidget.ScrollbarMargins * 2);
            Common.SetAttr(thisWidget.Scrollbar, 'aria-valuemax', maxValue);
            Common.SetAttr(thisWidget.Scrollbar, 'aria-valuemin', thisWidget.ScrollbarMargins);
            Common.SetAttr(thisWidget.Scrollbar, 'aria-valuenow', thisWidget.ScrollbarMargins);
            scrollbarStyle.position = 'absolute';
            scrollbarStyle.right = thisWidget.Scrollbar.offsetWidth - thisWidget.ScrollbarMargins + 'px';
            scrollbarStyle.top = thisWidget.ScrollbarMargins + 'px';
            scrollbarStyle.height = thisWidget.ScrollbarHeight + 'px';

        },

        _attachResizeEvent: function () {

            // Initialize
            var thisWidget = this;

            // Reset
            var onResizeEndFunction = function (event) {
                thisWidget._recalculateSliderHeights();
            };
            Common.AttachWindowResizingEvent(onResizeEndFunction, 'onScrollbarResize');

        },

        _attachAutoExpandEvents: function () {

            var thisWidget = this;

            // Initialize and attach expand for dragging events
            if (thisWidget.options.AutoExpand == true) {
                Events.On(thisWidget.Scrollbar, 'mouseenter',
                    function () {
                        if (!thisWidget.IsScrolling) {
                            Common.AddClass(thisWidget.Scrollbar, 'gtc-scrollbar-expanded');
                        }
                    }
                );
                Events.On(thisWidget.Scrollbar, 'mouseleave',
                    function () {
                        if (!thisWidget.IsScrolling) {
                            Common.RemoveClass(thisWidget.Scrollbar, 'gtc-scrollbar-expanded');
                        }
                    }
                );
            }

        },

        _attachScrollEvents: function () {

            var thisWidget = this;
            if (thisWidget.options.AutoHide == true) {
                thisWidget._onShowScrollBar();
                thisWidget._onHideScrollBar();
            }
            thisWidget._onWheel();
            thisWidget._onTouchStart();
            thisWidget._onTouchMove();
            thisWidget._onTouchEnd();
            thisWidget._onStartDrag();

        },

        _onShowScrollBar: function () {

            var thisWidget = this;
            thisWidget.onShowScrollBarFunction = function (event) {

                thisWidget.Scrollbar.style.opacity = 1;

            };
            thisWidget.ScrollWrapper.addEventListener('mouseover', thisWidget.onShowScrollBarFunction);

        },

        _onHideScrollBar: function () {

            var thisWidget = this;
            thisWidget.onHideScrollBarFunction = function (event) {

                if (!thisWidget.IsScrolling) {
                    thisWidget.Scrollbar.style.opacity = 0;
                }

            };
            thisWidget.ScrollWrapper.addEventListener('mouseout', thisWidget.onHideScrollBarFunction);

        },

        _onWheel: function () {

            var thisWidget = this;
            thisWidget.onWheelFunction = function (event) {

                event.preventDefault();
                var delta = event.deltaY > 0 ? thisWidget.ScrollSpeed : -thisWidget.ScrollSpeed;
                thisWidget.DomElement.scrollTop += delta;
                thisWidget._adjustScrollBarToContent();

            };
            thisWidget.ScrollWrapper.addEventListener('wheel', thisWidget.onWheelFunction);

        },

        _onTouchStart: function () {

            var thisWidget = this;
            thisWidget.onTouchStartFunction = function (event) {

                event.preventDefault();
                var touch = event.changedTouches[0];
                thisWidget.StartY = parseFloat(touch.clientY);
                thisWidget._onShowScrollBar();

            };
            thisWidget.DomElement.addEventListener('touchstart', thisWidget.onTouchStartFunction);

        },

        _onTouchMove: function () {

            var thisWidget = this;
            thisWidget.onTouchMoveFunction = function (event) {

                event.preventDefault();
                var touch = event.changedTouches[0];
                thisWidget.DomElement.scrollTop -= parseFloat(touch.clientY) - thisWidget.StartY;
                thisWidget.StartY = parseFloat(touch.clientY);
                thisWidget._adjustScrollBarToContent();

            };
            thisWidget.DomElement.addEventListener('touchmove', thisWidget.onTouchMoveFunction);

        },

        _onTouchEnd: function () {

            var thisWidget = this;
            thisWidget.onTouchEndFunction = function (event) {

                if (!thisWidget.IsScrolling) {
                    thisWidget.Scrollbar.style.opacity = 0;
                }

            };
            thisWidget.DomElement.addEventListener('touchend', thisWidget.onTouchEndFunction);

        },

        _onStartDrag: function () {

            var thisWidget = this;
            thisWidget.onStartDragFunction = function (event) {

                thisWidget.StartY = event.clientY;
                thisWidget._updateBodySelectability(false);
                thisWidget._onDrag();
                thisWidget._onStopDrag();

            };
            thisWidget.Scrollbar.addEventListener('mousedown', thisWidget.onStartDragFunction);

        },

        _onDrag: function () {

            var thisWidget = this;
            thisWidget.onDragFunction = function (event) {

                thisWidget.IsScrolling = true;
                var top = parseFloat(thisWidget.Scrollbar.style.top) + event.clientY - thisWidget.StartY;
                top = Math.max(top, thisWidget.ScrollbarMargins);
                top = Math.min(top, thisWidget.ScrollWrapperHeight - thisWidget.ScrollbarHeight - thisWidget.ScrollbarMargins * 2);
                thisWidget.Scrollbar.style.top = top + 'px';
                thisWidget.StartY = event.clientY;
                thisWidget._adjustContentToScollBar();

            };
            document.addEventListener('mousemove', thisWidget.onDragFunction);

        },

        _onStopDrag: function () {

            var thisWidget = this;
            thisWidget.onStopDragFunction = function (event) {

                thisWidget.IsScrolling = false;
                thisWidget._updateBodySelectability(true);
                if (thisWidget.options.AutoExpand == true) {
                    Common.RemoveClass(thisWidget.Scrollbar, 'gtc-scrollbar-expanded');
                }
                document.removeEventListener('mousemove', thisWidget.onDragFunction);
                document.removeEventListener('mouseup', thisWidget.onStopDragFunction);

            };
            document.addEventListener('mouseup', thisWidget.onStopDragFunction);

        },

        _adjustScrollBarToContent: function (ignoreOnScroll) {

            var thisWidget = this;
            var height = thisWidget.DomElement.scrollHeight - thisWidget.ElementHeight;
            var percentage = thisWidget.DomElement.scrollTop / height;
            var top = thisWidget.ScrollbarMargins + (thisWidget.ScrollWrapperHeight - thisWidget.ScrollbarMargins * 3 - thisWidget.ScrollbarHeight) * percentage;
            thisWidget.Scrollbar.style.top = top + 'px';
            Common.SetAttr(thisWidget.Scrollbar, 'aria-valuenow', top);
            if (!ignoreOnScroll) {
                thisWidget._onScrollEvent();
            }

        },

        _adjustContentToScollBar: function () {

            var thisWidget = this;
            var scrollbarTop = parseFloat(thisWidget.Scrollbar.style.top);
            if (scrollbarTop == thisWidget.ScrollbarMargins) {
                scrollbarTop = 0;
            }
            var percentage = scrollbarTop / (thisWidget.ScrollWrapperHeight - thisWidget.ScrollbarHeight - thisWidget.ScrollbarMargins * 2);
            var top = percentage * thisWidget.MaxScrollTop;
            thisWidget.DomElement.scrollTop = top;
            thisWidget._onScrollEvent();

        },

        _onScrollEvent: function () {

            var thisWidget = this;
            if (Common.IsFunction(thisWidget.options.OnScroll)) {
                thisWidget.options.OnScroll(thisWidget.element, thisWidget.Scrollbar);
            }

        },

        _updateBodySelectability: function (isSelectable) {

            var bodyElement = document.body;
            if (isSelectable) {
                Common.RemoveClass(bodyElement, 'gtc-unselectable');
            }
            else {
                Common.AddClass(bodyElement, 'gtc-unselectable');
            }

        },

        _initializeLocalProperties: function () {

            var thisWidget = this;
            thisWidget.ElementHeight = 0;
            thisWidget.ParentElement = null;
            thisWidget.ScrollWrapper = null;
            thisWidget.ScrollWrapperHeight = 0;
            thisWidget.Scrollbar = null;
            thisWidget.ScrollbarHeight = 0;
            thisWidget.ScrollbarMargins = 2;
            thisWidget.MaxScrollTop = 0;
            thisWidget.StartY = 0;
            thisWidget.ScrollSpeed = 30;
            thisWidget.IsScrolling = false;
            thisWidget.ScrollbarInitialized = false;

        },

        _init: function () {

            var thisWidget = this;
            if (Common.HasClass(thisWidget.element, 'gtc-cfscroll-y')) {
                return;
            }
            if (thisWidget.ScrollbarInitialized == true) {
                thisWidget._recalculateSliderHeights();
                return;
            }
            var initFunction = function () {
                thisWidget.DomElement = thisWidget.element;
                if (thisWidget.DomElement.scrollHeight - thisWidget.DomElement.offsetHeight == 0) {
                    Common.AddClass(thisWidget.element, 'gtc-cfscroll-y');
                    return;
                }
                thisWidget._initializeLocalProperties();
                thisWidget._setupScrollWrapper();
                thisWidget._calculateScrollProperties();
                thisWidget._setupScrollBar();
                thisWidget._attachScrollEvents();
                thisWidget._attachAutoExpandEvents();

                // Set initial scroll height?
                if (Common.IsDefined(thisWidget.options.SetInitialScrollHeight)) {
                    thisWidget._setVerticalScrollTop(thisWidget.options.SetInitialScrollHeight);
                }

                // Watch for window resize?
                if (!thisWidget.WindowResizeAttached && thisWidget.options.RecalculateOnWindowResize) {
                    thisWidget.WindowResizeAttached = true;
                    thisWidget._attachResizeEvent();
                }
                thisWidget.ScrollbarInitialized = true;
            };

            // Wait for modal to show before calculating scrollbars
            if (Common.IsModal() && !Common.Closest('.gtc-classControlSpanDropDown', thisWidget.element) && !Common.Closest('.gtc-treepanel', thisWidget.element)) {
                Common.AttachVisibilityEvent(thisWidget.element.id,
                    function (event, eventData) {
                        if (eventData.Visible == true) {
                            initFunction();
                            Common.DetachVisibilityEvent(eventData);
                        }
                    }, null, null, 'No'
                );
            }
            else {
                initFunction();
            }

        },

        _create: function () {

        }

    };

    WidgetFactory.Register('gtc.scrollbar', ScrollbarWidget);

} (window, document, Common, Cache, Events, Velocity));
