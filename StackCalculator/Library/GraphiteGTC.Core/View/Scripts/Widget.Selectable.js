// Selectable Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var SelectableWidget = {

        // Options
        options: {
            appendTo: 'body',
            autoRefresh: true,
            distance: 0,
            filter: '*',
            tolerance: 'touch',

            // Callbacks
            selected: null,
            selecting: null,
            start: null,
            stop: null,
            unselected: null,
            unselecting: null
        },

        // Private Methods
        _destroy: function () {

            var thisWidget = this;
            if (thisWidget.selectees) {
                var index = 0, length = thisWidget.selectees.length;
                for ( ; index < length; index++) {
                    Common.RemoveClass(thisWidget.selectees[index], 'gtc-ui-selectee');
                    Cache.Remove(thisWidget.selectees[index], 'selectable-item');
                }
            }
            Common.RemoveClasses(thisWidget.element, 'gtc-ui-selectable gtc-ui-selectable-disabled');
            thisWidget._mouseDestroy();

        },

        _mouseStart: function (event) {

            var thisWidget = this;
            var options = this.options;

            thisWidget.opos = [ event.pageX, event.pageY ];

            if (thisWidget.options.disabled) {
                return;
            }

            thisWidget.selectees = Common.QueryAll(options.filter, thisWidget.element);

            thisWidget._trigger('start', event);

            Common.Query(options.appendTo).appendChild(thisWidget.helper);

            // Position helper (lasso)
            var helperStyle = thisWidget.helper.style;
            helperStyle.left = event.pageX + 'px';
            helperStyle.top = event.pageY + 'px';
            helperStyle.width = '0px';
            helperStyle.height = '0px';

            if (options.autoRefresh) {
                thisWidget.refresh();
            }

            var selectedElements = Common.FilterElementArray(thisWidget.selectees, '.gtc-ui-selected');
            var selectee, selectedElement, index = 0, length = selectedElements.length;
            for ( ; index < length; index++) {
                selectedElement = selectedElements[index];
                selectee = Cache.Get(selectedElement, 'selectable-item');
                selectee.startselected = true;
                if (!event.metaKey && !event.ctrlKey) {
                    Common.RemoveClass(selectee.element, 'gtc-ui-selected');
                    selectee.selected = false;
                    Common.AddClass(selectee.element, 'gtc-ui-unselecting');
                    selectee.unselecting = true;
                    // Selectable UNSELECTING callback
                    thisWidget._trigger('unselecting', event, {
                        unselecting: selectee.element
                    });
                }
            }

            var parents = Common.ParentsUntil(null, event.target);
            parents.push(event.target);
            selectee, selectedElement, index = 0, length = parents.length;
            for ( ; index < length; index++) {
                selectedElement = parents[index];
                var doSelect,
                    selectee = Cache.Get(selectedElement, 'selectable-item');
                if (selectee) {
                    doSelect = (!event.metaKey && !event.ctrlKey) || !Common.HasClass(selectee.element, 'gtc-ui-selected');
                    if (doSelect) {
                        Common.RemoveClass(selectee.element, 'gtc-ui-unselecting');
                        Common.AddClass(selectee.element, 'gtc-ui-selecting');
                    }
                    else {
                        Common.RemoveClass(selectee.element, 'gtc-ui-selected');
                        Common.AddClass(selectee.element, 'gtc-ui-unselecting');
                    }
                    selectee.unselecting = !doSelect;
                    selectee.selecting = doSelect;
                    selectee.selected = doSelect;
                    // Selectable (UN)SELECTING callback
                    if (doSelect) {
                        thisWidget._trigger('selecting', event, {
                            selecting: selectee.element
                        });
                    }
                    else {
                        thisWidget._trigger('unselecting', event, {
                            unselecting: selectee.element
                        });
                    }
                    break;
                }
            }

        },

        _mouseDrag: function (event) {

            var thisWidget = this;
            thisWidget.dragged = true;

            if (thisWidget.options.disabled) {
                return;
            }

            var tmp,
                options = thisWidget.options,
                x1 = thisWidget.opos[0],
                y1 = thisWidget.opos[1],
                x2 = event.pageX,
                y2 = event.pageY;

            if (x1 > x2) { tmp = x2; x2 = x1; x1 = tmp; }
            if (y1 > y2) { tmp = y2; y2 = y1; y1 = tmp; }
            var helperStyle = thisWidget.helper.style;
            helperStyle.left = x1 + 'px';
            helperStyle.top = y1 + 'px';
            helperStyle.width = (x2 - x1) + 'px';
            helperStyle.height = (y2 - y1) + 'px';

            var selectee, hit, index = 0, length = thisWidget.selectees.length;
            for ( ; index < length; index++) {
                selectee = Cache.Get(thisWidget.selectees[index], 'selectable-item');
                hit = false;

                // Prevent helper from being selected if appendTo: selectable
                if (!selectee || selectee.element === thisWidget.element) {
                    continue;
                }

                if (options.tolerance === 'touch') {
                    hit = (!(selectee.left > x2 || selectee.right < x1 || selectee.top > y2 || selectee.bottom < y1));
                }
                else if (options.tolerance === 'fit') {
                    hit = (selectee.left > x1 && selectee.right < x2 && selectee.top > y1 && selectee.bottom < y2);
                }

                if (hit) {
                    // SELECT
                    if (selectee.selected) {
                        Common.RemoveClass(selectee.element, 'gtc-ui-selected');
                        selectee.selected = false;
                    }
                    if (selectee.unselecting) {
                        Common.RemoveClass(selectee.element, 'gtc-ui-unselecting');
                        selectee.unselecting = false;
                    }
                    if (!selectee.selecting) {
                        Common.AddClass(selectee.element, 'gtc-ui-selecting');
                        selectee.selecting = true;
                        // selectable SELECTING callback
                        thisWidget._trigger('selecting', event, {
                            selecting: selectee.element
                        });
                    }
                }
                else {
                    // UNSELECT
                    if (selectee.selecting) {
                        if ((event.metaKey || event.ctrlKey) && selectee.startselected) {
                            Common.RemoveClass(selectee.element, 'gtc-ui-selecting');
                            selectee.selecting = false;
                            Common.AddClass(selectee.element, 'gtc-ui-selected');
                            selectee.selected = true;
                        }
                        else {
                            Common.RemoveClass(selectee.element, 'gtc-ui-selecting');
                            selectee.selecting = false;
                            if (selectee.startselected) {
                                Common.AddClass(selectee.element, 'gtc-ui-unselecting');
                                selectee.unselecting = true;
                            }
                            // selectable UNSELECTING callback
                            thisWidget._trigger('unselecting', event, {
                                unselecting: selectee.element
                            });
                        }
                    }
                    if (selectee.selected) {
                        if (!event.metaKey && !event.ctrlKey && !selectee.startselected) {
                            Common.RemoveClass(selectee.element, 'gtc-ui-selected');
                            selectee.selected = false;

                            Common.AddClass(selectee.element, 'gtc-ui-unselecting');
                            selectee.unselecting = true;
                            // selectable UNSELECTING callback
                            thisWidget._trigger('unselecting', event, {
                                unselecting: selectee.element
                            });
                        }
                    }
                }
            }

            return false;

        },

        _mouseStop: function (event, selectAllStopProp) {

            var thisWidget = this;
            var index = 0, length;

            thisWidget.dragged = false;

            var selectee, unselecting = Common.QueryAll('.gtc-ui-unselecting', thisWidget.element);
            length = unselecting.length;
            for ( ; index < length; index++) {
                selectee = Cache.Get(unselecting[index], "selectable-item");
                Common.RemoveClass(selectee.element, 'gtc-ui-unselecting');
                selectee.unselecting = false;
                selectee.startselected = false;
                thisWidget._trigger('unselected', event, {
                    unselected: selectee.element,
                    stopProp: selectAllStopProp
                });
            }
            var selecting = Common.QueryAll('.gtc-ui-selecting', thisWidget.element);
            length = selecting.length;
            for ( ; index < length; index++) {
                selectee = Cache.Get(selecting[index], 'selectable-item');
                Common.RemoveClass(selectee.element, 'gtc-ui-selecting');
                Common.AddClass(selectee.element, 'gtc-ui-selected');
                selectee.selecting = false;
                selectee.selected = true;
                selectee.startselected = true;
                thisWidget._trigger('selected', event, {
                    selected: selectee.element,
                    stopProp: selectAllStopProp
                });
            }
            thisWidget._trigger('stop', event);

            Common.Remove(thisWidget.helper);
            return false;

        },

        _create: function () {

            var selectees, thisWidget = this;

            Common.AddClass(thisWidget.element, 'gtc-ui-selectable');

            thisWidget.dragged = false;

            // Cache selectee children based on filter
            thisWidget.refresh = function () {
                selectees = Common.QueryAll(thisWidget.options.filter, thisWidget.element);
                var selectee, index = 0, length = selectees.length;
                for ( ; index < length; index++) {
                    selectee = selectees[index];
                    Common.AddClass(selectee, 'gtc-ui-selectee');
                    var pos = Common.Offset(selectee);
                    Cache.Set(selectee, 'selectable-item', {
                        element: selectee,
                        left: pos.left,
                        top: pos.top,
                        right: pos.left + Common.Width(selectee, true),
                        bottom: pos.top + Common.Height(selectee, true),
                        startselected: false,
                        selected: Common.HasClass(selectee, 'gtc-ui-selected'),
                        selecting: Common.HasClass(selectee, 'gtc-ui-selecting'),
                        unselecting: Common.HasClass(selectee, 'gtc-ui-unselecting')
                    });
                }
            };
            thisWidget.refresh();

            thisWidget._mouseInit();

            thisWidget.helper = Common.GenerateHTML('<div class="gtc-ui-selectable-helper"></div>');

        }

    };

    WidgetFactory.Register('gtc.selectable', WidgetFactory.gtc.mouse, SelectableWidget);

} (window, document, Common, Cache, Events, Velocity));
