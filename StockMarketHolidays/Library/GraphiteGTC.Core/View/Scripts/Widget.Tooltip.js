// Tooltip Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var TooltipWidget = {

        // Options
        options: {
            delayedShow: 0,
            content: function () {
                var title = Common.GetAttr(this, 'title') || '';
                return Common.Decode(title);
            },
            items: '[title]:not([disabled])',
            position: {
                my: "left top+15",
                at: "left bottom",
                collision: "flipfit flip"
            },
            tooltipClass: null,

            // Callbacks
            close: null,
            open: null
        },

        // Public Methods
        open: function (event) {

            var thisWidget = this;
            var target = Common.Closest(thisWidget.options.items, event && event.target ? event.target : thisWidget.element);

            // No element to show a tooltip for or the tooltip is already open
            if (!target || Cache.Get(target, 'gtc-ui-tooltip-id')) {
                return;
            }

            if (Common.GetAttr(target, 'title')) {
                Cache.Set(target, 'gtc-ui-tooltip-title', Common.GetAttr(target, 'title'));
            }

            Cache.Set(target, 'gtc-ui-tooltip-open', true);

            // kill parent tooltips, custom or native, for hover
            if (event && event.type === 'mouseover') {
                var targetParents = Common.ParentsUntil(null, target);
                var index = 0, length = targetParents.length;
                for ( ; index < length; index++) {
                    // For loops have no scope! Give it some. (IIFE)
                    (function (parent) {
                        var blurEvent;
                        if (Cache.Get(parent, 'gtc-ui-tooltip-open')) {
                            blurEvent = Events.Event('blur');
                            blurEvent.target = blurEvent.currentTarget = parent;
                            thisWidget.close(blurEvent, true);
                        }
                        if (Common.GetAttr(parent, 'title')) {
                            if (!parent.id) {
                                parent.id = 'GTC' + Common.GenerateUniqueID();
                            }
                            thisWidget.parents[parent.id] = {
                                element: parent,
                                title: Common.GetAttr(parent, 'title')
                            };
                            Common.SetAttr(parent, 'title', '');
                        }
                    }(targetParents[index]));
                }
            }

            thisWidget._registerCloseHandlers(event, target);
            thisWidget._updateContent(target, event);

        },

        close: function( event ) {
            var tooltip,
                thisWidget = this,
                target = event ? event.currentTarget : thisWidget.element,
                tooltipData = thisWidget._find(target);

            // The tooltip may already be closed
            if (!tooltipData) {
                // We set gtc-ui-tooltip-open immediately upon open (in open()), but only set the
                // additional data once there's actually content to show (in _open()). So even if the
                // tooltip doesn't have full data, we always remove gtc-ui-tooltip-open in case we're in
                // the period between open() and _open().
                Cache.Remove(target, 'gtc-ui-tooltip-open');
                return;
            }

            tooltip = tooltipData.tooltip;

            // disabling closes the tooltip, so we need to track when we're closing
            // to avoid an infinite loop in case the tooltip becomes disabled on close
            if (tooltipData.closing) {
                return;
            }

            // only set title if we had one before (see comment in _open())
            // If the title attribute has changed since open(), don't restore
            if (Cache.Get(target, 'gtc-ui-tooltip-title') && !Common.GetAttr(target, 'title')) {
                Common.SetAttr(target, 'title', Cache.Get(target, 'gtc-ui-tooltip-title'));
            }

            thisWidget._removeDescribedBy(target);

            tooltipData.hiding = true;
            Velocity(tooltip, 'stop', true);
            tooltip.style.display = 'none';
            thisWidget._removeTooltip(tooltip);

            Cache.Remove(target, 'gtc-ui-tooltip-open');
            thisWidget._off(target, 'mouseleave focusout keyup');

            // Remove 'remove' binding only on delegated targets
            if (target !== thisWidget.element) {
                thisWidget._off(target, 'remove');
            }
            thisWidget._off(thisWidget.document, 'mousemove');

            if (event && event.type === 'mouseleave') {
                for (property in thisWidget.parents) {
                    var value = thisWidget.parents[property];
                    Common.SetAttr(property.element, 'title', property.title);
                    delete thisWidget.parents[value];
                }
            }

            tooltipData.closing = true;
            this._trigger('close', event, { tooltip: tooltip });
            if (!tooltipData.hiding) {
                tooltipData.closing = false;
            }
        },

        // Private Methods
        _addDescribedBy: function (elem, id) {

            var describedby = (Common.GetAttr(elem, 'aria-describedby') || '').split(/\s+/);
            describedby.push(id);
            Cache.Set(elem, 'gtc-ui-tooltip-id', id);
            Common.SetAttr(elem, 'aria-describedby', describedby.join(' ').trim());

        },

        _removeDescribedBy: function (elem) {

            var id = Cache.Get(elem, 'gtc-ui-tooltip-id');
            var describedby = (Common.GetAttr(elem, 'aria-describedby') || '').split(/\s+/);
            var index = Common.IsInArray(id, describedby);

            if (index !== -1) {
                describedby.splice(index, 1);
            }

            Cache.Remove(elem, 'gtc-ui-tooltip-id');
            describedby = describedby.join(' ').trim();
            if (describedby) {
                Common.SetAttr(elem, 'aria-describedby', describedby);
            }
            else {
                Common.RemoveAttr(elem, 'aria-describedby');
            }

        },

        _updateContent: function (target, event) {

            var content,
                contentOption = this.options.content,
                thisWidget = this,
                eventType = event ? event.type : null;

            if (Common.IsString(contentOption)) {
                return this._open(event, target, contentOption);
            }

            content = contentOption.call(target,
                function (response) {
                    setTimeout(
                        function() {
                            if (!Cache.Get(target, 'gtc-ui-tooltip-open')) {
                                return;
                            }
                            if (event) {
                                event.type = eventType;
                            }
                            thisWidget._open(event, target, response);
                        }, 0
                    );
                }
            );
            if (content) {
                thisWidget._open(event, target, content);
            }

        },

        _open: function (event, target, content) {

            var tooltipData, tooltip, a11yContent,
                positionOption = Common.MergeObjects({}, this.options.position);

            if (!content) {
                return;
            }

            // Content can be updated multiple times. If the tooltip already
            // exists, then just update the content and bail.
            tooltipData = this._find(target);
            if (tooltipData) {
                Common.Query('.gtc-ui-tooltip-content', tooltipData.tooltip).innerHTML = content;
                return;
            }

            // if we have a title, clear it to prevent the native tooltip
            // we have to check first to avoid defining a title if none exists
            // (we don't want to cause an element to start matching [title])
            //
            // We use removeAttr only for key events, to allow IE to export the correct
            // accessible attributes. For mouse events, set to empty string to avoid
            // native tooltip showing up (happens only when removing inside mouseover).
            if (Common.HasAttr(target, '[title]')) {
                if (event && event.type === 'mouseover') {
                    Common.SetAttr(target, 'title', '');
                }
                else {
                    Common.RemoveAttr(target, 'title');
                }
            }

            tooltipData = this._tooltip(target);
            tooltip = tooltipData.tooltip;
            this._addDescribedBy(target, tooltip.id);
            Common.Query('.gtc-ui-tooltip-content', tooltip).innerHTML = content;

            // Support: Voiceover on OS X, JAWS on IE <= 9
            // JAWS announces deletions even when aria-relevant="additions"
            // Voiceover will sometimes re-read the entire log region's contents from the beginning
            var liveChildren = Common.GetChildren(this.liveRegion), index = 0, length = liveChildren.length;
            for ( ; index < length; index++) {
                liveChildren[index].style.display = 'none';
            }
            var newDiv = Common.Create('div');
            newDiv.innerHTML = content;
            this.liveRegion.appendChild(newDiv);

            Position.Set(tooltip, Common.MergeObjects({
                of: target
            }, this.options.position));

            tooltip.style.display = 'none';
            Velocity(tooltip, 'transition.slideLeftBigIn', { delay: this.options.delayedShow });
            this._trigger('open', event, { tooltip: tooltip });

        },

        _registerCloseHandlers: function (event, target) {

            var events = {
                keyup: function (event) {
                    if (event.keyCode === GTC.Keyboard.Escape) {
                        var fakeEvent = Events.Event(event);
                        fakeEvent.currentTarget = target;
                        this.close(fakeEvent, true);
                    }
                }
            };

            // Only bind remove handler for delegated targets. Non-delegated
            // tooltips will handle this in destroy.
            if (target !== this.element) {
                events.remove = function () {
                    this._removeTooltip(this._find(target).tooltip);
                };
            }

            if (!event || event.type === 'mouseover') {
                events.mouseleave = 'close';
            }
            if (!event || event.type === 'focusin') {
                events.focusout = 'close';
            }
            this._on(true, target, events);

        },

        _tooltip: function (element) {

            var tooltip = Common.Create('div');
            Common.SetAttr(tooltip, 'role', 'tooltip');
            Common.AddClasses(tooltip, 'gtc-ui-tooltip gtc-ui-widget gtc-ui-corner-all gtc-ui-widget-content ' + (this.options.tooltipClass || ''));
            if (!tooltip.id) {
                tooltip.id = 'GTC' + Common.GenerateUniqueID();
            }
            var id = tooltip.id;

            var newDiv = Common.Create('div');
            Common.AddClass(newDiv, 'gtc-ui-tooltip-content');
            tooltip.appendChild(newDiv);

            this.document.body.appendChild(tooltip);

            return this.tooltips[id] = {
                element: element,
                tooltip: tooltip
            };

        },

        _find: function (target) {

            var id = Cache.Get(target, 'gtc-ui-tooltip-id');
            return id ? this.tooltips[id] : null;

        },

        _removeTooltip: function (tooltip) {

            Common.Remove(tooltip);
            delete this.tooltips[tooltip.id];

        },

        _destroy: function () {

            var that = this;

            // close open tooltips
            for (id in this.tooltips) {
                var tooltipData = this.tooltips[id];

                // Delegate to close method to handle common cleanup
                var event = Events.Event('blur'),
                    element = tooltipData.element;
                event.target = event.currentTarget = element;
                that.close(event, true);

                // Remove immediately
                Common.Remove(Common.Get(id));

                // Restore the title
                if (Cache.Get(element, 'gtc-ui-tooltip-title')) {
                    // If the title attribute has changed since open(), don't restore
                    if (!Common.GetAttr(element, 'title')) {
                        Common.SetAttr(element, 'title', Cache.Get(element, 'gtc-ui-tooltip-title'));
                    }
                    Cache.Remove(element, 'gtc-ui-tooltip-title');
                }
            }
            Common.Remove(this.liveRegion);

        },

        _create: function() {

            this._on({
                mouseover: 'open',
                focusin: 'open'
            });

            // IDs of generated tooltips, needed for destroy
            this.tooltips = {};

            // IDs of parent tooltips where we removed the title attribute
            this.parents = {};

            // Append the aria-live region so tooltips announce correctly
            this.liveRegion = Common.Create('div');
            Common.SetAttr(this.liveRegion, 'role', 'log');
            Common.SetAttr(this.liveRegion, 'aria-live', 'assertive');
            Common.SetAttr(this.liveRegion, 'aria-relevant', 'additions');
            Common.AddClass(this.liveRegion, 'gtc-ui-helper-hidden-accessible');
            this.document.body.appendChild(this.liveRegion);

        }
    };

    WidgetFactory.Register('gtc.tooltip', TooltipWidget);

} (window, document, Common, Cache, Events, Velocity));
