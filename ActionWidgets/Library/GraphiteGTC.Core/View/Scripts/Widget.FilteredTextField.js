// Filtered Text Field Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var FilteredTextFieldWidget = {

        // Private Variables
        defaultElement: '<input>',
        requestIndex: 0,
        pending: 0,

        // Options
        options: {
            appendTo: null,
            autoFocus: false,
            delay: 300,
            minLength: 1,
            position: {
                my: 'left top',
                at: 'left bottom',
                collision: 'none'
            },
            source: null,

            // callbacks
            change: null,
            close: null,
            focus: null,
            open: null,
            response: null,
            search: null,
            select: null
        },

        // Public Methods
        search: function (value, event) {

            var thisWidget = this;
            value = value != null ? value : thisWidget._value();

            // Always save the actual value, not the one passed as an argument
            thisWidget.term = thisWidget._value();

            if (value.length < thisWidget.options.minLength) {
                return thisWidget.close(event);
            }

            if (thisWidget._trigger('search', event) === false) {
                return;
            }

            return thisWidget._search(value);
        },

        close: function (event) {

            var thisWidget = this;
            thisWidget.cancelSearch = true;
            thisWidget._close(event);

        },

        widget: function () {

            var thisWidget = this;
            return thisWidget.menu.element;

        },

        // Private Methods
        _destroy: function () {

            var thisWidget = this;
            clearTimeout(thisWidget.searching);
            Common.RemoveClass(thisWidget.element, 'gtc-ui-autocomplete-input');
            Common.RemoveAttr(thisWidget.element, 'autocomplete');
            Common.Remove(thisWidget.menu.element);
            Common.Remove(thisWidget.liveRegion);

        },

        _setOption: function (key, value) {

            var thisWidget = this;
            thisWidget._super( key, value );
            if (key === 'source') {
                thisWidget._initSource();
            }
            if (key === 'appendTo') {
                thisWidget._appendTo().appendChild(thisWidget.menu.element);
            }
            if (key === 'disabled' && value && thisWidget.xhr) {
                thisWidget.xhr.abort();
            }

        },

        _appendTo: function () {

            var thisWidget = this;
            var element = thisWidget.options.appendTo;

            if (element) {
                element = element.nodeType ? element : Common.QueryAll(element, thisWidget.document)[0];
            }

            if (!element) {
                element = Common.Closest('.gtc-ui-front', thisWidget.element);
            }

            if (!element) {
                element = thisWidget.document.body;
            }

            return element;

        },

        _initSource: function () {

            var array, url, thisWidget = this;
            if (Common.IsArray(thisWidget.options.source)) {
                array = thisWidget.options.source;
                thisWidget.source = function (request, response) {
                    response(WidgetFactory.gtc.filteredtextfield.filter(array, request.term));
                };
            }
            else if (Common.IsString(thisWidget.options.source)) {
                url = thisWidget.options.source;
                thisWidget.source = function (request, response) {
                    if (thisWidget.xhr) {
                        thisWidget.xhr.abort();
                    }
                    thisWidget.xhr = new XMLHttpRequest();
                    thisWidget.xhr.open('POST', url, true);
                    thisWidget.xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
                    thisWidget.xhr.onload = function () {
                        if (this.status >= 200 && this.status < 400) {
                            // Success!
                            var behaviorData = JSON.parse(this.response);
                            response( behaviorData );
                        }
                        else {
                            response([]);
                        }
                    };
                    thisWidget.xhr.onerror = function () {
                        response([]);
                    };
                    thisWidget.xhr.send(JSON.stringify(request));
                };
            }
            else {
                thisWidget.source = thisWidget.options.source;
            }

        },

        _searchTimeout: function (event) {

            var thisWidget = this;
            clearTimeout(thisWidget.searching);
            thisWidget.searching = setTimeout(
                function () {
                    // Search if the value has changed, or if the user retypes the same value (see #7434)
                    var equalValues = thisWidget.term === thisWidget._value(),
                        menuVisible = Common.IsVisible(thisWidget.menu.element),
                        modifierKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

                    if (!equalValues || (equalValues && !menuVisible && !modifierKey)) {
                        thisWidget.selectedItem = null;
                        thisWidget.search(null, event);
                    }
                }, thisWidget.options.delay
            );

        },

        _search: function (value) {

            var thisWidget = this;
            thisWidget.pending++;
            Common.AddClass(thisWidget.element, 'gtc-ui-autocomplete-loading');
            thisWidget.cancelSearch = false;
            thisWidget.source({ term: value }, thisWidget._response());

        },

        _response: function () {

            var thisWidget = this;
            var index = ++thisWidget.requestIndex;

            return Common.Proxy(
                function (content) {
                    if (index === this.requestIndex) {
                        this.__response(content);
                    }

                    this.pending--;
                    if (!this.pending) {
                        Common.RemoveClass(this.element, 'gtc-ui-autocomplete-loading');
                    }
                }, thisWidget
            );

        },

        __response: function (content) {

            var thisWidget = this;
            if (content) {
                content = thisWidget._normalize(content);
            }
            thisWidget._trigger('response', null, { content: content });
            if (!thisWidget.options.disabled && content && content.length && !thisWidget.cancelSearch) {
                thisWidget._suggest(content);
                thisWidget._trigger('open');
            }
            else {
                // Use ._close() instead of .close() so we don't cancel future searches
                thisWidget._close();
            }

        },

        _close: function (event) {

            var thisWidget = this;
            if (Common.IsVisible(thisWidget.menu.element)) {
                thisWidget.menu.element.style.display = 'none';
                thisWidget.menu.blur();
                thisWidget.isNewMenu = true;
                thisWidget._trigger('close', event);
            }

        },

        _change: function (event) {

            var thisWidget = this;
            if (thisWidget.previous !== thisWidget._value()) {
                thisWidget._trigger('change', event, { item: thisWidget.selectedItem });
            }

        },

        _normalize: function (items) {

            // Assume all items have the right format when the first item is complete
            if (items.length && items[0].label && items[0].value) {
                return items;
            }
            var newItems = [];
            var item, index = 0, length = items.length;
            for ( ; index < length; index++) {
                item = items[index];
                if (Common.IsString(item)) {
                    newItems.push({
                        label: item,
                        value: item
                    });
                }
                else {
                    newItems.push(Common.MergeObjects({}, item, {
                        label: item.label || item.value,
                        value: item.value || item.label
                    }));
                }
            }
            return newItems;

        },

        _suggest: function (items) {

            var thisWidget = this;
            var ul = thisWidget.menu.element;
            if (ul.nodeType === 1) {
                // Get all elements inside element to be removed and clean up their data and events as well
                // INFO: getElementsByTagName is MUCH faster in this context than querySelectorAll (NodeList - live vs static)
                Cache.CleanElementData(ul.getElementsByTagName('*'));
            }
            ul.textContent = '';
            thisWidget._renderMenu(ul, items);
            thisWidget.isNewMenu = true;
            thisWidget.menu.refresh();

            // size and position menu
            ul.style.display = 'block';
            thisWidget._resizeMenu();

            // TODO: Make sure positioning is handled correctly without this.
            // Position.Set(ul, Common.MergeObjects({of: thisWidget.element}, thisWidget.options.position));

            if (thisWidget.options.autoFocus) {
                thisWidget.menu.next();
            }

        },

        _resizeMenu: function () {

            var thisWidget = this;
            var ul = thisWidget.menu.element;
            ul.style.width = '';
            var max = Math.max(
                // Firefox wraps long text (possibly a rounding bug)
                // so we add 1px to avoid the wrapping (#7513)
                Common.Width(ul, true) + 1,
                Common.Width(thisWidget.element, true)
            );
            thisWidget._appendTo().style.width =  max + 'px';

        },

        _renderMenu: function (ul, items) {

            var thisWidget = this;
            var index = 0, length = items.length;
            for ( ; index < length; index++) {
                thisWidget._renderItemData(ul, items[index]);
            }

        },

        _renderItemData: function (ul, item) {

            var thisWidget = this;
            var renderedItem = thisWidget._renderItem(ul, item);
            return Cache.Set(renderedItem, 'gtc-ui-autocomplete-item', item);

        },

        _renderItem: function (ul, item) {

            var newLi = Common.Create('li');
            newLi.textContent = item.label;
            ul.appendChild(newLi);
            return newLi;

        },

        _move: function (direction, event) {

            var thisWidget = this;
            if (!Common.IsVisible(thisWidget.menu.element)) {
                thisWidget.search( null, event );
                return;
            }
            if (thisWidget.menu.isFirstItem() && /^previous/.test(direction) || thisWidget.menu.isLastItem() && /^next/.test(direction)) {

                if (!thisWidget.isMultiLine) {
                    thisWidget._value(thisWidget.term);
                }

                thisWidget.menu.blur();
                return;
            }
            thisWidget.menu[direction](event);

        },

        _value: function () {

            var thisWidget = this;
            return thisWidget.element.value;

        },

        _keyEvent: function (keyEvent, event) {

            var thisWidget = this;
            if (!thisWidget.isMultiLine || Common.IsVisible(thisWidget.menu.element)) {
                thisWidget._move(keyEvent, event);

                // Prevents moving cursor to beginning/end of the text field in some browsers
                event.preventDefault();
            }

        },

        _create: function () {

            var thisWidget = this;

            // Some browsers only repeat keydown events, not keypress events,
            // so we use the suppressKeyPress flag to determine if we've already
            // handled the keydown event. #7269
            // Unfortunately the code for & in keypress is the same as the up arrow,
            // so we use the suppressKeyPressRepeat flag to avoid handling keypress
            // events when we know the keydown event was used to modify the
            // search term. #7799
            var suppressKeyPress, suppressKeyPressRepeat, suppressInput,
                nodeName = thisWidget.element.nodeName.toLowerCase(),
                isTextarea = nodeName === 'textarea',
                isInput = nodeName === 'input';

            thisWidget.isMultiLine =
                // Textareas are always multi-line
                isTextarea ? true :
                // Inputs are always single-line, even if inside a contentEditable element
                // IE also treats inputs as contentEditable
                isInput ? false :
                // All other element types are determined by whether or not they're contentEditable
                thisWidget.element.isContentEditable;

            thisWidget.isNewMenu = true;

            Common.AddClass(thisWidget.element, 'gtc-ui-autocomplete-input');
            Common.SetAttr(thisWidget.element, 'autocomplete', 'off');

            thisWidget._on(thisWidget.element, {
                keydown: function (event) {

                    if (this.element.readOnly) {
                        suppressKeyPress = true;
                        suppressInput = true;
                        suppressKeyPressRepeat = true;
                        return;
                    }

                    suppressKeyPress = false;
                    suppressInput = false;
                    suppressKeyPressRepeat = false;
                    var keyCode = GTC.Keyboard;
                    switch ( event.keyCode ) {
                        case keyCode.PageUp:
                            suppressKeyPress = true;
                            this._move('previousPage', event);
                            break;
                        case keyCode.PageDown:
                            suppressKeyPress = true;
                            this._move('nextPage', event);
                            break;
                        case keyCode.Up:
                            suppressKeyPress = true;
                            this._keyEvent('previous', event);
                            break;
                        case keyCode.Down:
                            suppressKeyPress = true;
                            this._keyEvent('next', event);
                            break;
                        case keyCode.Enter:
                            // When menu is open and has focus
                            if (this.menu.active) {
                                // #6055 - Opera still allows the keypress to occur
                                // which causes forms to submit
                                suppressKeyPress = true;
                                event.preventDefault();
                                this.menu.select(event);
                            }
                            else if (this.element == document.activeElement) {
                                suppressKeyPress = true;
                                event.preventDefault();
                            }
                            break;
                        case keyCode.Tab:
                            if (this.menu.active) {
                                this.menu.select(event);
                            }
                            break;
                        case keyCode.Escape:
                            if (Common.IsVisible(this.menu.element)) {
                                if (!this.isMultiLine) {
                                    this._value(this.term);
                                }
                                this.close(event);
                                // Different browsers have different default behavior for escape
                                // Single press can mean undo or clear
                                // Double press in IE means clear the whole form
                                event.preventDefault();
                            }
                            break;
                        default:
                            suppressKeyPressRepeat = true;
                            // search timeout should be triggered before the input value is changed
                            this._searchTimeout(event);
                            break;
                    }

                },
                keypress: function (event) {

                    if (suppressKeyPress) {
                        suppressKeyPress = false;
                        if (!this.isMultiLine || Common.IsVisible(this.menu.element)) {
                            event.preventDefault();
                        }
                        return;
                    }
                    if (suppressKeyPressRepeat) {
                        return;
                    }

                    // Replicate some key handlers to allow them to repeat in Firefox and Opera
                    var keyCode = GTC.Keyboard;
                    switch (event.keyCode) {
                        case keyCode.PageUp:
                            this._move('previousPage', event);
                            break;
                        case keyCode.PageDown:
                            this._move('nextPage', event);
                            break;
                        case keyCode.Up:
                            this._keyEvent('previous', event);
                            break;
                        case keyCode.Down:
                            this._keyEvent('next', event);
                            break;
                    }

                },
                input: function (event) {

                    if (suppressInput) {
                        suppressInput = false;
                        event.preventDefault();
                        return;
                    }
                    this._searchTimeout(event);

                },
                focus: function () {

                    this.selectedItem = null;
                    this.previous = this._value();

                },
                blur: function (event) {

                    if (this.cancelBlur) {
                        delete this.cancelBlur;
                        return;
                    }

                    clearTimeout(this.searching);
                    this.close(event);
                    this._change(event);

                }
            });

            thisWidget._initSource();
            thisWidget.menu = Common.Create('ul');
            Common.AddClasses(thisWidget.menu, 'gtc-ui-autocomplete gtc-ui-front gtc-cfscroll-y');
            thisWidget._appendTo().appendChild(thisWidget.menu);
            Widgets.menu(thisWidget.menu, {
                // disable ARIA support, the live region takes care of that
                role: null
            });
            thisWidget.menu.style.display = 'none';
            thisWidget.menu = Widgets.menu(thisWidget.menu, 'instance');

            thisWidget._on(thisWidget.menu.element, {
                mousedown: function (event) {

                    // prevent moving focus out of the text field
                    event.preventDefault();

                    // IE doesn't prevent moving focus even with event.preventDefault()
                    // so we set a flag to know when we should ignore the blur event
                    var that = this;
                    this.cancelBlur = true;
                    setTimeout(
                        function () {
                            delete that.cancelBlur;
                        }, 0
                    );

                    // clicking on the scrollbar causes focus to shift to the body
                    // but we can't detect a mouseup or a click immediately afterward
                    // so we have to track the next mousedown and close the menu if
                    // the user clicks somewhere outside of the autocomplete
                    var menuElement = this.menu.element;
                    if (!Common.Closest('.gtc-ui-menu-item', event.target)) {
                        setTimeout(
                            function () {
                                Events.One(this.document, 'mousedown',
                                    function (event) {
                                        if (event.target !== that.element && event.target !== menuElement && !menuElement.contains(menuElement, event.target)) {
                                            that.close();
                                        }
                                    }
                                );
                            }, 0
                        );
                    }

                },
                menufocus: function (event, ui) {

                    var label, item;
                    // support: Firefox
                    // Prevent accidental activation of menu items in Firefox (#7024 #9118)
                    if (this.isNewMenu) {
                        this.isNewMenu = false;
                        if (event.originalEvent && /^mouse/.test(event.originalEvent.type)) {
                            this.menu.blur();
                            Events.One(this.document, 'mousemove',
                                function() {
                                    Events.Trigger(event.target, event.originalEvent);
                                }
                            );
                            return;
                        }
                    }

                    item = Cache.Get(ui.item, 'gtc-ui-autocomplete-item');
                    var focusOutput = this._trigger('focus', event, { item: item });
                    if (false !== focusOutput) {
                        // Use value to match what will end up in the input, if it was a key event
                        if (event.originalEvent && /^key/.test(event.originalEvent.type)) {
                            this._value(item.value);
                        }
                    }

                    // Announce the value in the liveRegion
                    label = Common.GetAttr(ui.item, 'aria-label') || item.value;
                    if (label && label.trim().length) {
                        var children = Common.GetChildren(this.liveRegion);
                        var index = 0, length = children.length;
                        for ( ; index < length; index++) {
                            children[index].style.display = 'none';
                        }
                        var newDiv = Common.Create('div');
                        newDiv.textContent = label;
                        this.liveRegion.appendChild(newDiv);
                    }

                },
                menuselect: function (event, ui) {

                    var item = Cache.Get(ui.item, 'gtc-ui-autocomplete-item'), previous = this.previous;

                    // Only trigger when focus was lost (click on menu)
                    if (this.element !== this.document.activeElement) {
                        this.element.focus();
                        this.previous = previous;

                        // #6109 - IE triggers two focus events and the second
                        // is asynchronous, so we need to reset the previous
                        // term synchronously and asynchronously :-(
                        var that = this;
                        setTimeout(
                            function () {
                                that.previous = previous;
                                that.selectedItem = item;
                            }, 0
                        );
                    }

                    var selectOutput = this._trigger('select', event, { item: item });
                    if (false !== selectOutput) {
                        this._value(item.value);
                    }
                    // reset the term after the select event
                    // this allows custom select handling to work properly
                    this.term = this._value();

                    this.close(event);
                    this.selectedItem = item;

                }
            });

            var liveRegion = Common.Create('span');
            Common.SetAttr(liveRegion, 'role', 'status');
            Common.SetAttr(liveRegion, 'aria-live', 'assertive');
            Common.SetAttr(liveRegion, 'aria-relevant', 'additions');
            Common.AddClass(liveRegion, 'gtc-ui-helper-hidden-accessible');
            thisWidget.liveRegion = liveRegion;
            thisWidget.document.body.appendChild(liveRegion);

            // Turning off autocomplete prevents the browser from remembering the
            // value when navigating through history, so we re-enable autocomplete
            // if the page is unloaded before the widget is destroyed. #7790
            thisWidget._on(thisWidget.window, {
                beforeunload: function () {
                    Common.RemoveAttr(this.element, "autocomplete" );
                }
            });

        }

    };

    WidgetFactory.Register('gtc.filteredtextfield', FilteredTextFieldWidget);

    Common.MergeObjects(WidgetFactory.gtc.filteredtextfield, {
        escapeRegex: function (value) {

            return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');

        },

        filter: function (array, term) {

            var matcher = new RegExp(WidgetFactory.gtc.filteredtextfield.escapeRegex(term), 'i');
            return Common.FilterArray(array,
                function (value) {
                    return matcher.test(value.label || value.value || value);
                }
            );

        }
    });

} (window, document, Common, Cache, Events, Velocity));
