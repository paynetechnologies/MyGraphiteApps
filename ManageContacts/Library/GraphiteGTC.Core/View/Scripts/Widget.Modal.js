// Modal Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var ModalWidget = {

        // Options
        options: {
            appendTo: "body",
            autoOpen: true,
            closeOnEscape: true,
            closeText: "Close",
            dialogClass: "",
            hide: null,
            height: "auto",
            maxHeight: null,
            maxWidth: null,
            minHeight: 150,
            minWidth: 150,
            modal: false,
            position: {
                my: "center",
                at: "center",
                of: window,
                collision: "fit",
                // Ensure the titlebar is always visible
                using: function (pos) {
                    var thisStyle = this.style;
                    thisStyle.top = pos.top + 'px';
                    thisStyle.left = pos.left + 'px';
                    var topOffset = Common.Offset(this).top;
                    if (topOffset < 0) {
                        thisStyle.top = (pos.top - topOffset) + 'px';
                    }
                }
            },
            show: null,
            title: null,
            width: 300,

            // Callbacks
            beforeClose: null,
            close: null,
            focus: null,
            open: null,
            afterOpen: null
        },

        sizeRelatedOptions: {
            height: true,
            maxHeight: true,
            maxWidth: true,
            minHeight: true,
            minWidth: true,
            width: true
        },

        // Public Methods
        widget: function () {

            return this.uiDialog;

        },

        disable: function () {},

        enable: function () {},

        close: function (event) {

            var activeElement,
                thisWidget = this;

            if (!thisWidget._isOpen || thisWidget._trigger('beforeClose', event) === false) {
                return;
            }

            thisWidget._isOpen = false;
            thisWidget._focusedElement = null;
            thisWidget._destroyOverlay();
            thisWidget._untrackInstance();

            if (thisWidget.opener && Common.IsFocusable(thisWidget.opener)) {
                thisWidget.opener.focus();

                // support: IE9
                // IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
                try {
                    activeElement = thisWidget.document.activeElement;

                    // Support: IE9, IE10
                    // If the <body> is blurred, IE will switch windows, see #4520
                    if (activeElement && activeElement.nodeName.toLowerCase() !== 'body') {

                        // Hiding a focused element doesn't trigger blur in WebKit
                        // so in case we have nothing to focus on, explicitly blur the active element
                        // https://bugs.webkit.org/show_bug.cgi?id=47182
                        Events.Trigger(activeElement, 'blur');
                    }
                }
                catch (error) {}
            }

            Velocity(thisWidget.uiDialog, 'fadeOut', 600,
                function () {
                    thisWidget._trigger('close', event);
                }
            );

        },

        isOpen: function () {

            return this._isOpen;

        },

        moveToTop: function () {

            this._moveToTop();

        },

        open: function () {

            var thisWidget = this;
            if (thisWidget._isOpen) {
                if (thisWidget._moveToTop()) {
                    thisWidget._focusTabbable();
                }
                return;
            }

            thisWidget._isOpen = true;
            thisWidget.opener = thisWidget.document.activeElement;

            thisWidget._size();
            thisWidget._position();
            thisWidget._createOverlay();
            thisWidget._moveToTop(null, true);

            // Ensure the overlay is moved to the top with the dialog, but only when
            // opening. The overlay shouldn't move after the dialog is open so that
            // modeless dialogs opened after the modal dialog stack properly.
            if (thisWidget.overlay) {
                var overlayZIndex = Common.GetStyle(thisWidget.uiDialog, 'z-index') - 1;
                thisWidget.overlay.style.zIndex = overlayZIndex;
            }

            Velocity(thisWidget.uiDialog, 'fadeIn', 1000,
                function () {
                    thisWidget._focusTabbable();
                    thisWidget._trigger('focus');
                    thisWidget._trigger('afterOpen');
                }
            );

            // Track the dialog immediately upon openening in case a focus event
            // somehow occurs outside of the dialog before an element inside the
            // dialog is focused (#10152)
            thisWidget._makeFocusTarget();

            thisWidget._trigger('open');

        },

        // Private Methods
        _appendTo: function () {

            var thisWidget = this;
            var element = thisWidget.options.appendTo;
            if (element && element.nodeType) {
                return element;
            }
            return Common.Query(element, document);

        },

        _destroy: function () {

            var thisWidget = this, next, originalPosition = thisWidget.originalPosition;

            thisWidget._untrackInstance();
            thisWidget._destroyOverlay();

            if (!thisWidget.element.id) {
                thisWidget.element.id = 'GTC' + Common.GenerateUniqueID();
            }
            Common.RemoveClasses(thisWidget.element, 'gtc-ui-dialog-content gtc-ui-widget-content');

            // Apply original css values
            var elementStyle = thisWidget.element.style;
            elementStyle.display = thisWidget.originalCss.display;
            elementStyle.width = thisWidget.originalCss.width;
            elementStyle.minHeight = thisWidget.originalCss.minHeight;
            elementStyle.maxHeight = thisWidget.originalCss.maxHeight;
            elementStyle.height = thisWidget.originalCss.height;

            // Without detaching first, the following becomes really slow
            Common.Detach(thisWidget.element);

            Velocity(thisWidget.uiDialog, 'stop', true);
            Common.Remove(thisWidget.uiDialog);

            if (thisWidget.originalTitle) {
                Common.SetAttr(thisWidget.element, 'title', thisWidget.originalTitle);
            }

            next = Common.GetChildren(originalPosition.parent)[originalPosition.index];

            // Don't try to place the dialog next to itself (#8613)
            if (next && next !== thisWidget.element) {
                next.parentNode.insertBefore(thisWidget.element, next);
            }
            else {
                originalPosition.parent.appendChild(thisWidget.element);
            }

        },

        _moveToTop: function (event, silent) {

            var thisWidget = this;
            var moved = false;
            var zIndices = Common.GetAllSibling(thisWidget.uiDialog, '.gtc-ui-front');
            var visibleZIndices = [], index = 0, length = zIndices.length;
            for ( ; index < length; index++) {
                if (Common.IsVisible(zIndices[index])) {
                    visibleZIndices.push(zIndices[index]);
                }
            }
            zIndices = [];
            index = 0, length = visibleZIndices.length;
            for ( ; index < length; index++) {
                zIndices.push(+Common.GetStyle(visibleZIndices[index], 'z-index'));
            }
            zIndexMax = Math.max.apply(null, zIndices);

            if (zIndexMax >= +Common.GetStyle(thisWidget.uiDialog, 'z-index')) {
                thisWidget.uiDialog.style.zIndex = zIndexMax + 1;
                moved = true;
            }

            if (moved && !silent) {
                thisWidget._trigger('focus', event);
            }
            return moved;

        },

        _focusTabbable: function () {

            // Set focus to the first match:
            // 1. An element that was focused previously
            // 2. First element inside the dialog matching [autofocus]
            // 3. Tabbable element inside the content element
            // 4. The close button
            // 5. The dialog itself
            var thisWidget = this;
            var allElements, index, length, hasFocus = thisWidget._focusedElement;
            if (!hasFocus) {
                hasFocus = Common.QueryAll('[autofocus]', thisWidget.element);
            }
            if (!hasFocus.length) {
                allElements = Common.GetByTagName('*', thisWidget.element);
                hasFocus = [], index = 0, length = allElements.length;
                for ( ; index < length; index++) {
                    if (Common.IsTabbable(allElements[index])) {
                        hasFocus.push(allElements[index]);
                    }
                }
            }
            if (!hasFocus.length) {
                allElements = Common.QueryAll('.gtc-modal-close', thisWidget.uiDialogTitlebar);
            }
            if (!hasFocus.length) {
                hasFocus = [thisWidget.uiDialog];
            }
            hasFocus[0].focus();

        },

        _keepFocus: function (event) {

            var thisWidget = this;
            function checkFocus () {
                var activeElement = this.document.activeElement,
                    isActive = this.uiDialog === activeElement ||
                        this.uiDialog.contains(activeElement);
                if (!isActive) {
                    this._focusTabbable();
                }
            }
            event.preventDefault();
            checkFocus.call(thisWidget);
            // support: IE
            // IE <= 8 doesn't prevent moving focus even with event.preventDefault()
            // so we check again later
            setTimeout(
                function () {
                    checkFocus.call(thisWidget);
                }, 0
            );

        },

        _createWrapper: function () {

            var thisWidget = this;
            thisWidget.uiDialog = Common.GenerateHTML('<div></div>');
            Common.AddClasses(thisWidget.uiDialog, 'gtc-ui-dialog gtc-ui-widget gtc-ui-widget-content gtc-ui-corner-all gtc-ui-front ' + thisWidget.options.dialogClass);
            thisWidget.uiDialog.style.display = 'none';
            Common.SetAttr(thisWidget.uiDialog, 'tabIndex', '-1');
            Common.SetAttr(thisWidget.uiDialog, 'role', 'dialog');
            thisWidget._appendTo().appendChild(thisWidget.uiDialog);

            thisWidget._on(thisWidget.uiDialog, {
                keydown: function (event) {

                    var thisWidget = this;
                    if ( thisWidget.options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode && event.keyCode === GTC.Keyboard.Escape) {
                        event.preventDefault();
                        thisWidget.close(event);
                        return;
                    }

                    // prevent tabbing out of dialogs
                    if (event.keyCode !== GTC.Keyboard.Tab || event.isDefaultPrevented()) {
                        return;
                    }

                    var allElements = Common.GetByTagName('*', thisWidget.uiDialog);
                    var tabbables = [], tabbable, index = 0, length = allElements.length;
                    for ( ; index < length; index++) {
                        tabbable = allElements[index];
                        if (Common.IsTabbable(tabbable)) {
                            tabbables.push(tabbable);
                        }
                    }
                    var first = tabbables[0];
                    var last = tabbables[tabbables.length - 1];

                    if ((event.target || event.target === thisWidget.uiDialog) === last && !event.shiftKey) {
                        setTimeout(
                            function () {
                                first.focus();
                            }, 0
                        );
                        event.preventDefault();
                    }
                    else if ((event.target === first || event.target === thisWidget.uiDialog) && event.shiftKey) {
                        setTimeout(
                            function () {
                                last.focus();
                            }, 0
                        );
                        event.preventDefault();
                    }

                },
                mousedown: function (event) {

                    var thisWidget = this;
                    if (thisWidget._moveToTop(event)) {
                        thisWidget._focusTabbable();
                    }

                }
            });

            // We assume that any existing aria-describedby attribute means
            // that the dialog content is marked up properly
            // otherwise we brute force the content as the description
            if (!Common.QueryAll('[aria-describedby]', thisWidget.element).length) {
                if (!thisWidget.element.id) {
                    thisWidget.element.id = 'GTC' + Common.GenerateUniqueID();
                }
                Common.SetAttr(thisWidget.uiDialog, 'aria-describedby', thisWidget.element.id);
            }

        },

        _createTitlebar: function () {

            var thisWidget = this;
            var uiDialogTitle;

            thisWidget.uiDialogTitlebar = Common.GenerateHTML('<div></div>');
            Common.AddClasses(thisWidget.uiDialogTitlebar, 'gtc-ui-dialog-titlebar gtc-ui-widget-header gtc-ui-corner-all gtc-ui-helper-clearfix');
            thisWidget.uiDialog.insertBefore(thisWidget.uiDialogTitlebar, thisWidget.uiDialog.firstChild);

            uiDialogTitle = Common.GenerateHTML('<span></span>');
            uiDialogTitle.id = 'GTC' + Common.GenerateUniqueID();
            Common.AddClass(uiDialogTitle, 'gtc-ui-dialog-title');
            thisWidget.uiDialogTitlebar.insertBefore(uiDialogTitle, thisWidget.uiDialogTitlebar.firstChild);
            thisWidget._title(uiDialogTitle);

            Common.SetAttr(thisWidget.uiDialog, 'aria-labelledby', uiDialogTitle.id);

        },

        _title: function (title) {

            var thisWidget = this;
            if (!thisWidget.options.title) {
                title.innerHTML = '&#160;';
            }
            title.textContent = thisWidget.options.title;

        },

        _trackFocus: function () {

            var thisWidget = this;
            thisWidget._on(thisWidget.widget(), {
                focusin: function (event) {
                    this._makeFocusTarget();
                    this._focusedElement = event.target;
                }
            });

        },

        _makeFocusTarget: function () {

            var thisWidget = this;
            thisWidget._untrackInstance();
            thisWidget._trackingInstances().unshift(thisWidget);

        },

        _untrackInstance: function () {

            var thisWidget = this;
            var instances = thisWidget._trackingInstances(),
                exists = Common.IsInArray(thisWidget, instances);
            if (exists !== -1) {
                instances.splice(exists, 1);
            }

        },

        _trackingInstances: function () {

            var thisWidget = this;
            var instances = Cache.Get(thisWidget.document, 'gtc-ui-dialog-instances');
            if (!instances) {
                instances = [];
                Cache.Set(thisWidget.document, 'gtc-ui-dialog-instances', instances);
            }
            return instances;

        },

        _minHeight: function () {

            var thisWidget = this;
            var options = thisWidget.options;

            return options.height === 'auto' ? options.minHeight : Math.min(options.minHeight, options.height);

        },

        _position: function () {

            // Need to show the dialog to get the actual offset in the position plugin
            var thisWidget = this;
            var isVisible = Common.IsVisible(thisWidget.uiDialog);
            if (!isVisible) {
                thisWidget.uiDialog.style.display = 'block';
            }
            Position.Set(thisWidget.uiDialog, thisWidget.options.position);
            if (!isVisible) {
                thisWidget.uiDialog.style.display = 'none';
            }

        },

        _setOptions: function (options) {

            var thisWidget = this, prop, value, resize = false;

            for (prop in options) {
                value = options[prop];
                thisWidget._setOption(prop, value);

                if (prop in thisWidget.sizeRelatedOptions) {
                    resize = true;
                }
            }

            if (resize) {
                thisWidget._size();
                thisWidget._position();
            }

        },

        _setOption: function (key, value) {

            var thisWidget = this;
            var uiDialog = thisWidget.uiDialog;

            if (key === 'dialogClass') {
                Common.RemoveClass(uiDialog, thisWidget.options.dialogClass);
                Common.AddClass(uiDialog, value);
            }
            if (key === 'disabled') {
                return;
            }
            thisWidget._super(key, value);
            if (key === 'appendTo') {
                thisWidget._appendTo().appendChild(thisWidget.uiDialog);
            }
            if (key === 'position') {
                thisWidget._position();
            }
            if (key === 'title') {
                thisWidget._title(Common.Query('.gtc-ui-dialog-title', thisWidget.uiDialogTitlebar));
            }

        },

        _size: function () {

            var thisWidget = this;

            // If the user has resized the dialog, the .gtc-ui-dialog and .gtc-ui-dialog-content
            // divs will both have width and height set, so we need to reset them
            var nonContentHeight, minContentHeight, maxContentHeight,
                options = thisWidget.options;

            // Reset content sizing
            var elementStyle = thisWidget.element.style;
            elementStyle.display = 'block';
            elementStyle.width = 'auto';
            elementStyle.minHeight = '0px';
            elementStyle.maxHeight = 'none';
            elementStyle.height = '0px';

            if (options.minWidth > options.width) {
                options.width = options.minWidth;
            }

            // Reset wrapper sizing
            // determine the height of all the non-content elements
            var uiDialogStyle = thisWidget.uiDialog.style;
            uiDialogStyle.height = 'auto';
            uiDialogStyle.width = options.width + 'px';
            nonContentHeight = Common.Height(thisWidget.uiDialog, true);
            minContentHeight = Math.max(0, options.minHeight - nonContentHeight);
            maxContentHeight = Common.IsNumber(options.maxHeight) ? Math.max(0, options.maxHeight - nonContentHeight) + 'px' : 'none';

            if (options.height === 'auto') {
                elementStyle.minHeight = minContentHeight + 'px';
                elementStyle.maxHeight = maxContentHeight;
                elementStyle.height = 'auto';
            }
            else {
                elementStyle.height = Math.max(0, options.height - nonContentHeight) + 'px';
            }

        },

        _blockFrames: function () {

            var thisWidget = this;
            thisWidget.iframeBlocks = [];
            var iFrames = Common.QueryAll('iframe', thisWidget.document);
            var iframe, newDiv, style, offset, index = 0, length = iFrames.length;
            for ( ; index < length; index++) {
                iframe = iFrames[index];
                newDiv = Common.GenerateHTML('<div></div>');
                style = newDiv.style;
                style.position = 'absolute';
                style.width = Common.Width(iframe, true);
                style.height = Common.Height(iframe, true);
                iframe.parentNode.appendChild(newDiv);
                offset = Common.Offset(iframe);
                style.top = offset.top + 'px';
                style.left = offset.left + 'px';
                thisWidget.iframeBlocks.push(newDiv);
            }

        },

        _unblockFrames: function () {

            var thisWidget = this;
            if ( thisWidget.iframeBlocks ) {
                Common.Remove(this.iframeBlocks);
                delete thisWidget.iframeBlocks;
            }

        },

        _allowInteraction: function (event) {

            if (Common.Closest('.gtc-ui-dialog', event.target)) {
                return true;
            }

            // TODO: Remove hack when datepicker implements
            // the .gtc-ui-front logic (#8989)
            return !!Common.Closest('.gtc-ui-datepicker', event.target);

        },

        _createOverlay: function () {

            var thisWidget = this;
            if (!thisWidget.options.modal) {
                return;
            }

            // We use a delay in case the overlay is created from an
            // event that we're going to be cancelling (#2804)
            var isOpening = true;
            setTimeout(
                function () {
                    isOpening = false;
                }, 0
            );

            if (!Cache.Get(thisWidget.document, 'gtc-ui-dialog-overlays')) {

                // Prevent use of anchors and inputs
                // Using _on() for an event handler shared across many instances is
                // safe because the dialogs stack and must be closed in reverse order
                thisWidget._on(thisWidget.document, {
                    focusin: function (event) {
                        if (isOpening) {
                            return;
                        }

                        if (!this._allowInteraction(event)) {
                            event.preventDefault();
                            this._trackingInstances()[0]._focusTabbable();
                        }
                    }
                });
            }

            thisWidget.overlay = Common.GenerateHTML('<div></div>');
            Common.AddClasses(thisWidget.overlay, 'gtc-ui-widget-overlay gtc-ui-front');
            thisWidget._appendTo().appendChild(thisWidget.overlay);
            thisWidget._on(thisWidget.overlay, {
                mousedown: "_keepFocus"
            });
            Cache.Set(thisWidget.document, 'gtc-ui-dialog-overlays', (Cache.Get(thisWidget.document, 'gtc-ui-dialog-overlays') || 0) + 1);

        },

        _destroyOverlay: function () {

            var thisWidget = this;
            if (!thisWidget.options.modal) {
                return;
            }

            if (thisWidget.overlay) {
                var overlays = Cache.Get(thisWidget.document, 'gtc-ui-dialog-overlays') - 1;

                if (!overlays) {
                    Events.Off(thisWidget.document, 'focusin');
                    Cache.Remove(thisWidget.document, 'gtc-ui-dialog-overlays');
                }
                else {
                    Cache.Set(thisWidget.document, 'gtc-ui-dialog-overlays', overlays);
                }

                Common.Remove(thisWidget.overlay);
                thisWidget.overlay = null;
            }

        },

        _init: function () {

            var thisWidget = this;
            if (thisWidget.options.autoOpen) {
                thisWidget.open();
            }

        },

        _create: function () {

            var thisWidget = this;
            var elementStyle = thisWidget.element.style;
            thisWidget.originalCss = {
                display: elementStyle.display,
                width: elementStyle.width,
                minHeight: elementStyle.minHeight,
                maxHeight: elementStyle.maxHeight,
                height: elementStyle.height
            };
            thisWidget.originalPosition = {
                parent: thisWidget.element.parentNode,
                index: Common.GetIndex(thisWidget.element)
            };
            thisWidget.originalTitle = Common.GetAttr(thisWidget.element, 'title');
            thisWidget.options.title = thisWidget.options.title || thisWidget.originalTitle;

            thisWidget._createWrapper();

            elementStyle.display = 'block';
            Common.RemoveAttr(thisWidget.element, 'title');
            Common.AddClasses(thisWidget.element, 'gtc-ui-dialog-content gtc-ui-widget-content');
            thisWidget.uiDialog.appendChild(thisWidget.element);

            thisWidget._createTitlebar();
            thisWidget._isOpen = false;
            thisWidget._trackFocus();

        }

    };

    WidgetFactory.Register('gtc.modal', ModalWidget);

} (window, document, Common, Cache, Events, Velocity));
