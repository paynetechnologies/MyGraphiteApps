// Menu Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var MenuWidget = {

        // Private Variables
        defaultElement: '<ul>',
        delay: 300,

        // Options
        options: {
            items: '> *',
            menus: 'ul',
            position: {
                my: 'left-1 top',
                at: 'right top'
            },
            role: 'menu',

            // callbacks
            blur: null,
            focus: null,
            select: null
        },

        // Public Methods
        refresh: function () {

            var items = [], thisWidget = this;
            var submenus = Common.QueryAll(thisWidget.options.menus, thisWidget.element);

            // Initialize nested menus
            var filteredSubMenus = Common.FilterElementArray(submenus, ':not(.gtc-ui-menu)');
            Common.AddClassesToElements(filteredSubMenus, 'gtc-ui-menu gtc-ui-widget gtc-ui-widget-content gtc-ui-front');
            var element, item, submenuCarat, index = 0, length = filteredSubMenus.length;
            for ( ; index < length; index++) {
                element = filteredSubMenus[index];
                element.style.display = 'none';
                Common.SetAttr(element, 'role', thisWidget.options.role);
                Common.SetAttr(element, 'aria-hidden', 'true');
                Common.SetAttr(element, 'aria-expanded', 'false');
                item = menu.parentNode;
                submenuCarat = Common.Create('span');
                Cache.Set(submenuCarat, 'gtc-ui-menu-submenu-carat', true);
                Common.SetAttr(item, 'aria-haspopup', 'true');
                item.insertBefore(submenuCarat, item.firstChild);
                Common.SetAttr(element, 'aria-labelledby', item.id);
            }

            submenus.push(thisWidget.element);
            var menuItems;
            index = 0, length = submenus.length;
            for ( ; index < length; index++) {
                var itemSelector = thisWidget.options.items;
                if (itemSelector == '> *') {
                    itemSelector = '[id="' + submenus[index].id + '"] ' + itemSelector;
                }
                menuItems = Common.QueryAll(itemSelector, submenus[index]);
                menuItems = Common.GetChildren(submenus[index]);
                if (menuItems.length > 0) {
                    Array.prototype.push.apply(items, menuItems);
                }
            }

            // Initialize menu-items containing spaces and/or dashes only as dividers
            var itemsNotMenuItem = Common.FilterElementArray(items, ':not(.gtc-ui-menu-item)');
            index = 0, length = itemsNotMenuItem.length;
            for ( ; index < length; index++) {
                if (thisWidget._isDivider(itemsNotMenuItem[index])) {
                    Common.AddClasses(itemsNotMenuItem[index], 'gtc-ui-widget-content gtc-ui-menu-divider');
                }
            }

            // Don't refresh list items that are already adapted
            var itemsNotMenuItemOrDivider = Common.FilterElementArray(itemsNotMenuItem, ':not(.gtc-ui-menu-divider)');
            index = 0, length = itemsNotMenuItemOrDivider.length;
            for ( ; index < length; index++) {
                Common.AddClass(itemsNotMenuItemOrDivider[index], 'gtc-ui-menu-item');
                if (!itemsNotMenuItemOrDivider[index].id) {
                    itemsNotMenuItemOrDivider[index].id = 'GTC' + Common.GenerateUniqueID();
                }
                Common.SetAttr(itemsNotMenuItemOrDivider[index], 'tabIndex', '-1');
                Common.SetAttr(itemsNotMenuItemOrDivider[index], 'role', thisWidget._itemRole());
            }

            // Add aria-disabled attribute to any disabled menu item
            var stateDisabled = Common.FilterElementArray(items, '.gtc-ui-state-disabled');
            index = 0, length = stateDisabled.length;
            for ( ; index < length; index++) {
                Common.SetAttr(stateDisabled[index], 'aria-disabled', 'true');
            }

            // If the active item has been removed, blur the menu
            if (thisWidget.active && !thisWidget.element.contains(thisWidget.active)) {
                thisWidget.blur();
            }

        },

        focus: function (event, item) {

            var nested, focused, thisWidget = this;
            thisWidget.blur(event, event && event.type === 'focus');

            thisWidget._scrollIntoView(item);

            thisWidget.active = item;
            Common.AddClass(thisWidget.active, 'gtc-ui-state-focus');
            Common.RemoveClass(thisWidget.active, 'gtc-ui-state-active');
            focused = thisWidget.active;

            // Only update aria-activedescendant if there's a role
            // otherwise we assume focus is managed elsewhere
            if (thisWidget.options.role) {
                Common.SetAttr(thisWidget.element, 'aria-activedescendant', focused.id);
            }

            // Highlight active parent menu item, if any
            var closestMenuItem = Common.Closest('.gtc-ui-menu-item', thisWidget.active.parentNode);
            if (closestMenuItem) {
                Common.AddClass(closestMenuItem, 'gtc-ui-state-active');
            }
            if (event && event.type === 'keydown') {
                thisWidget._close();
            }
            else {
                thisWidget.timer = setTimeout(
                    function () {
                        thisWidget._close();
                    }, thisWidget.delay
                );
            }
            nested = Common.GetChildren(item, '.gtc-ui-menu');
            if (nested.length && event && (/^mouse/.test(event.type))) {
                thisWidget._startOpening(nested);
            }
            thisWidget.activeMenu = item.parentNode;
            thisWidget._trigger('focus', event, { item: item });

        },

        blur: function (event, fromFocus) {

            var thisWidget = this;
            if (!fromFocus) {
                clearTimeout(thisWidget.timer);
            }

            if (!thisWidget.active) {
                return;
            }

            Common.RemoveClass(thisWidget.active, 'gtc-ui-state-focus');
            thisWidget.active = null;

            thisWidget._trigger('blur', event, { item: thisWidget.active });

        },

        collapseAll: function (event, all) {

            var thisWidget = this;
            clearTimeout(thisWidget.timer);
            thisWidget.timer = setTimeout(
                function () {
                    // If we were passed an event, look for the submenu that contains the event
                    var currentMenu = all ? thisWidget.element : Common.Closest('.gtc-ui-menu', event && event.target);

                    // If we found no valid submenu ancestor, use the main menu to close all sub menus anyway
                    if (!currentMenu) {
                        currentMenu = thisWidget.element;
                    }

                    thisWidget._close(currentMenu);

                    thisWidget.blur(event);
                    thisWidget.activeMenu = currentMenu;
                }, thisWidget.delay
            );

        },

        collapse: function (event) {

            var thisWidget = this;
            var newItem = thisWidget.active && Common.Closest('.gtc-ui-menu-item', thisWidget.active.parentNode);
            if (newItem && newItem.length) {
                thisWidget._close();
                thisWidget.focus(event, newItem);
            }

        },

        expand: function (event) {

            var thisWidget = this;
            var children = Common.GetChildren(thisWidget.active, '.gtc-ui-menu');
            var match = [], child, items, index = 0, length = children.length;
            for ( ; index < length; index++) {
                child = children[index];
                var itemSelector = thisWidget.options.items;
                if (itemSelector == '> *') {
                    itemSelector = '[id="' + child.id + '"] ' + itemSelector;
                }
                items = Common.QueryAll(itemSelector, child);
                if (items.length > 0) {
                    Array.prototype.push.apply(match, items);
                }
            }
            var newItem = thisWidget.active && match[0];

            if (newItem) {
                thisWidget._open(newItem.parentNode);

                // Delay so Firefox will not hide activedescendant change in expanding submenu from AT
                setTimeout(
                    function () {
                        thisWidget.focus(event, newItem);
                    }, 0
                );
            }

        },

        next: function (event) {

            var thisWidget = this;
            thisWidget._move('Next', 'first', event);

        },

        previous: function (event) {

            var thisWidget = this;
            thisWidget._move('Previous', 'last', event);

        },

        isFirstItem: function () {

            var thisWidget = this;
            return thisWidget.active && !Common.GetAllSibling(thisWidget.active, Common.SiblingType.Previous, '.gtc-ui-menu-item').length;

        },

        isLastItem: function () {

            var thisWidget = this;
            return thisWidget.active && !Common.GetAllSibling(thisWidget.active, Common.SiblingType.Next, '.gtc-ui-menu-item').length;

        },

        nextPage: function (event) {

            var thisWidget = this;
            var item, base, height;

            if (!thisWidget.active) {
                thisWidget.next(event);
                return;
            }
            if (thisWidget.isLastItem()) {
                return;
            }
            if (thisWidget._hasScroll()) {
                base = Common.Offset(thisWidget.active).top;
                height = Common.Height(thisWidget.element);
                var nextSiblings = Common.GetAllSibling(thisWidget.active, Common.SiblingType.Next, '.gtc-ui-menu-item');
                var index = 0, length = nextSiblings.length;
                for ( ; index < length; index++) {
                    item = nextSiblings[index];
                    if (!Common.Offset(item).top - base - height < 0) {
                        break;
                    }
                }
                thisWidget.focus(event, item);
            }
            else {
                var itemSelector = thisWidget.options.items;
                if (itemSelector == '> *') {
                    itemSelector = '[id="' + thisWidget.activeMenu.id + '"] ' + itemSelector;
                }
                var allItems = Common.QueryAll(itemSelector, thisWidget.activeMenu);
                var filterInt;
                if (!thisWidget.active) {
                    filterInt = 0;
                }
                else {
                    filterInt = allItems.length - 1;
                }
                thisWidget.focus(event, allItems[filterInt]);
            }

        },

        previousPage: function (event) {

            var thisWidget = this;
            var item, base, height;
            if (!thisWidget.active) {
                thisWidget.next(event);
                return;
            }
            if (thisWidget.isFirstItem()) {
                return;
            }
            if (thisWidget._hasScroll()) {
                base = Common.Offset(thisWidget.active).top;
                height = Common.Height(thisWidget.element);
                var prevSiblings = Common.GetAllSibling(thisWidget.active, Common.SiblingType.Previous, '.gtc-ui-menu-item');
                var index = 0, length = prevSiblings.length;
                for ( ; index < length; index++) {
                    item = prevSiblings[index];
                    if (!Common.Offset(item).top - base + height > 0) {
                        break;
                    }
                }

                thisWidget.focus(event, item);
            }
            else {
                var itemSelector = thisWidget.options.items;
                if (itemSelector == '> *') {
                    itemSelector = '[id="' + thisWidget.activeMenu.id + '"] ' + itemSelector;
                }
                var allItems = Common.QueryAll(itemSelector, thisWidget.activeMenu);
                thisWidget.focus(event, allItems[0]);
            }

        },

        select: function (event) {

            var thisWidget = this;

            // TODO: It should never be possible to not have an active item at this
            // point, but the tests don't trigger mouseenter before click.
            thisWidget.active = thisWidget.active || Common.Closest('.gtc-ui-menu-item', event.target);
            var ui = { item: thisWidget.active };
            if (!Common.HasClass(thisWidget.active, '.gtc-ui-menu' )) {
                thisWidget.collapseAll(event, true);
            }
            thisWidget._trigger('select', event, ui);

        },

        // Private Methods
        _destroy: function() {

            var thisWidget = this;

            // Destroy (sub)menus
            Common.RemoveAttr(thisWidget.element, 'aria-activedescendant');
            var allMenuElements = Common.QueryAll('.gtc-ui-menu', thisWidget.element);
            allMenuElements.push(thisWidget.element);
            Common.RemoveClassesFromElements(allMenuElements, 'gtc-ui-menu gtc-ui-widget gtc-ui-widget-content gtc-ui-menu-icons gtc-ui-front');
            var element, index = 0, length = allMenuElements.length;
            for ( ; index < length; index++) {
                element = allMenuElements[index];
                Common.RemoveAttr(element, 'role');
                Common.RemoveAttr(element, 'tabIndex');
                Common.RemoveAttr(element, 'aria-labelledby');
                Common.RemoveAttr(element, 'aria-expanded');
                Common.RemoveAttr(element, 'aria-hidden');
                Common.RemoveAttr(element, 'aria-disabled');
                if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(element.id)) {
                    Common.RemoveAttr(element, 'id');
                }
                element.style.display = '';
            }

            // Destroy menu items
            var allMenuItems = Common.QueryAll('.gtc-ui-menu-item'. thisWidget.element);
            Common.RemoveClassesFromElements(allMenuItems, 'gtc-ui-menu-item gtc-ui-state-hover');
            index = 0, length = allMenuItems.length;
            for ( ; index < length; index++) {
                Common.RemoveAttr(element, 'role');
                Common.RemoveAttr(element, 'aria-disabled');
                Common.RemoveAttr(element, 'tabIndex');
                Common.RemoveAttr(element, 'aria-haspopup');
                if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(element.id)) {
                    Common.RemoveAttr(element, 'id');
                }
                var children = GetChildren(element);
                var child, childIndex = 0, childLength = children.length;
                for ( ; childIndex < childLength; childIndex++) {
                    child = children[index];
                    if (Cache.Get(child, 'gtc-ui-menu-submenu-carat')) {
                        Common.Remove(child);
                    }
                }
            }

            // Destroy menu dividers
            var allDividers = Common.QueryAll('.gtc-ui-menu-divider', thisWidget.element);
            Common.RemoveClassesFromElements(allDividers, 'gtc-ui-menu-divider gtc-ui-widget-content');

        },

        _keydown: function (event) {

            var thisWidget = this;
            var match, prev, character, skip, preventDefault = true;

            switch (event.keyCode) {
                case GTC.Keyboard.PageUp:
                    thisWidget.previousPage(event);
                    break;
                case GTC.Keyboard.PageDown:
                    thisWidget.nextPage(event);
                    break;
                case GTC.Keyboard.Home:
                    thisWidget._move('first', 'first', event);
                    break;
                case GTC.Keyboard.End:
                    thisWidget._move('last', 'last', event);
                    break;
                case GTC.Keyboard.Up:
                    thisWidget.previous(event);
                    break;
                case GTC.Keyboard.Down:
                    thisWidget.next(event);
                    break;
                case GTC.Keyboard.Left:
                    thisWidget.collapse(event);
                    break;
                case GTC.Keyboard.Right:
                    if (thisWidget.active && !Common.HasClass(thisWidget.active, 'gtc-ui-state-disabled')) {
                        thisWidget.expand(event);
                    }
                    break;
                case GTC.Keyboard.Enter:
                case GTC.Keyboard.Space:
                    thisWidget._activate(event);
                    break;
                case GTC.Keyboard.Escape:
                    thisWidget.collapse(event);
                    break;
                default:
                    preventDefault = false;
                    prev = thisWidget.previousFilter || '';
                    character = String.fromCharCode(event.keyCode);
                    skip = false;

                    clearTimeout(thisWidget.filterTimer);

                    if (character === prev) {
                        skip = true;
                    }
                    else {
                        character = prev + character;
                    }

                    match = thisWidget._filterMenuItems(character);
                    var activeIndex = Common.GetIndex(Common.GetSibling(thisWidget.active, Common.SiblingType.Next));
                    match = skip && match.index(activeIndex) !== -1 ? Common.GetAllSibling(thisWidget.active, Common.SiblingType.Next, '.gtc-ui-menu-item') : match;

                    // If no matches on the current filter, reset to the last character pressed
                    // to move down the menu to the first item that starts with that character
                    if (!match.length) {
                        character = String.fromCharCode(event.keyCode);
                        match = thisWidget._filterMenuItems(character);
                    }

                    if (match.length) {
                        thisWidget.focus(event, match);
                        thisWidget.previousFilter = character;
                        thisWidget.filterTimer = setTimeout(
                            function () {
                                delete that.previousFilter;
                            }, 1000
                        );
                    }
                    else {
                        delete thisWidget.previousFilter;
                    }
            }

            if (preventDefault) {
                event.preventDefault();
            }

        },

        _activate: function (event) {

            var thisWidget = this;
            if (!Common.HasClass(thisWidget.active, 'gtc-ui-state-disabled')) {
                if (thisWidget.active.matches('[aria-haspopup="true"]')) {
                    thisWidget.expand(event);
                }
                else {
                    thisWidget.select(event);
                }
            }

        },

        _itemRole: function () {

            var thisWidget = this;
            return {
                menu: 'menuitem',
                listbox: 'option'
            }[thisWidget.options.role];

        },

        _setOption: function (key, value) {

            var thisWidget = this;
            if (key === 'disabled') {
                if (!!value) {
                    Common.AddClass(thisWidget.element, 'gtc-ui-state-disabled');
                }
                else {
                    Common.RemoveClass(thisWidget.element, 'gtc-ui-state-disabled');
                }
                Common.SetAttr(thisWidget.element, 'aria-disabled', value);
            }
            thisWidget._super(key, value);

        },

        _scrollIntoView: function (item) {

            var thisWidget = this;
            var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
            if (thisWidget._hasScroll()) {
                borderTop = parseFloat(Common.GetStyle(thisWidget.activeMenu, 'borderTopWidth')) || 0;
                paddingTop = parseFloat(Common.GetStyle(thisWidget.activeMenu, 'paddingTop')) || 0;
                offset = Common.Offset(item).top - Common.Offset(thisWidget.activeMenu).top - borderTop - paddingTop;
                scroll = thisWidget.activeMenu.scrollTop;
                elementHeight = Common.Height(thisWidget.activeMenu);
                itemHeight = Common.Height(item, true);

                if (offset < 0) {
                    thisWidget.activeMenu.scrollTop = scroll + offset;
                }
                else if (offset + itemHeight > elementHeight) {
                    thisWidget.activeMenu.scrollTop = scroll + offset - elementHeight + itemHeight;
                }
            }

        },

        _startOpening: function (submenu) {

            var thisWidget = this;
            clearTimeout(thisWidget.timer);

            // Don't open if already open fixes a Firefox bug that caused a .5 pixel
            // shift in the submenu position when mousing over the carat icon
            if (Common.GetAttr(submenu, 'aria-hidden') !== 'true') {
                return;
            }

            thisWidget.timer = setTimeout(
                function () {
                    thisWidget._close();
                    thisWidget._open(submenu);
                }, thisWidget.delay
            );

        },

        _open: function (submenu) {

            var thisWidget = this;
            var position = Common.MergeObjects({
                of: thisWidget.active
            }, thisWidget.options.position );

            clearTimeout(thisWidget.timer);
            var menuElements = Common.QueryAll('.gtc-ui-menu', thisWidget.element);
            var parentMenuElements = Common.ParentsUntil(null, submenu, '.gtc-ui-menu');
            var element, index = 0, length = menuElements.length;
            for ( ; index < length; index++) {
                element = menuElements[index];
                if (Common.IsInArray(element, parentMenuElements) == -1) {
                    element.style.display = 'none';
                    Common.SetAttr(element, 'aria-hidden', 'true');
                }
            }

            submenu.style.display = 'block';
            Common.RemoveAttr(submenu, 'aria-hidden');
            Common.SetAttr(submenu, 'aria-expanded', 'true');

            // TODO: Make sure positioning is handled correctly without this.
            // Position.Set(submenu, position);

        },

        // With no arguments, closes the currently active menu - if nothing is active
        // it closes all menus.  If passed an argument, it will search for menus BELOW
        _close: function (startMenu) {

            var thisWidget = this;
            if (!startMenu) {
                startMenu = thisWidget.active ? thisWidget.active.parentNode : thisWidget.element;
            }

            var menuElements = Common.QueryAll('.gtc-ui-menu', startMenu);
            var element, index = 0, length = menuElements.length;
            for ( ; index < length; index++) {
                element = menuElements[index];
                element.style.display = 'none';
                Common.SetAttr(element, 'aria-hidden', 'true');
                Common.SetAttr(element, 'aria-expanded', 'false');
            }

            var activeElements = Common.QueryAll('.gtc-ui-state-active:not(.gtc-ui-state-focus)');
            index = 0, length = activeElements.length;
            for ( ; index < length; index++) {
               Common.RemoveClass(activeElements[index], 'gtc-ui-state-active');
            }

        },

        _closeOnDocumentClick: function (event) {

            return !Common.Closest('.gtc-ui-menu', event.target);

        },

        _isDivider: function (item) {

            // Match hyphen, em dash, en dash
            return !/[^\-\u2014\u2013\s]/.test(item.textContent);

        },

        _move: function (direction, filter, event) {

            var next, thisWidget = this;
            if (thisWidget.active) {
                if (direction === 'first' || direction === 'last') {
                    if (direction == 'first') {
                        var prevSiblings = Common.GetAllSibling(thisWidget.active, Common.SiblingType.Previous, '.gtc-ui-menu-item');
                        next = prevSiblings[prevSiblings.length - 1];
                    }
                    else {
                        var nextSiblings = Common.GetAllSibling(thisWidget.active, Common.SiblingType.Next, '.gtc-ui-menu-item');
                        next = nextSiblings[nextSiblings.length - 1];
                    }
                }
                else {
                    next = Common.GetSibling(thisWidget.active, direction, '.gtc-ui-menu-item');
                }
            }
            if (!next || !thisWidget.active) {
                var itemSelector = thisWidget.options.items;
                if (itemSelector == '> *') {
                    itemSelector = '[id="' + thisWidget.activeMenu.id + '"] ' + itemSelector;
                }
                var allItems = Common.QueryAll(itemSelector, thisWidget.activeMenu);
                var filterInt;
                if (filter == 'first') {
                    filterInt = 0;
                }
                else {
                    filterInt = allItems.length - 1;
                }
                next = allItems[filterInt];
            }
            thisWidget.focus(event, next);

        },

        _hasScroll: function () {

            var thisWidget = this;
            return Common.Height(thisWidget.element, true) < thisWidget.element.scrollHeight;

        },

        _filterMenuItems: function (character) {

            var thisWidget = this;
            var escapedCharacter = character.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'),
                regex = new RegExp('^' + escapedCharacter, 'i');

            var itemSelector = thisWidget.options.items;
            if (itemSelector == '> *') {
                itemSelector = '[id="' + thisWidget.activeMenu.id + '"] ' + itemSelector;
            }
            var allItems = Common.QueryAll(itemSelector, thisWidget.activeMenu);
            var menuItems = Common.FilterElementArray(allItems, '.gtc-ui-menu-item');
            var filteredMenuItems = Common.FilterArray(menuItems,
                function (value) {
                    var text = value.textContent.trim();
                    return regex.test(text);
                }
            );
            return filteredMenuItems;

        },

        _create: function () {

            var thisWidget = this;
            thisWidget.activeMenu = thisWidget.element;

            // Flag used to prevent firing of the click handler
            // as the event bubbles up through nested menus
            thisWidget.mouseHandled = false;
            if (!thisWidget.element.id) {
                thisWidget.element.id = 'GTC' + Common.GenerateUniqueID();
            }
            Common.AddClasses(thisWidget.element, 'gtc-ui-menu gtc-ui-widget gtc-ui-widget-content');
            Common.SetAttr(thisWidget.element, 'role', thisWidget.options.role);
            Common.SetAttr(thisWidget.element, 'tabIndex', '0');

            if (thisWidget.options.disabled) {
                Common.AddClass(thisWidget.element, 'gtc-ui-state-disabled');
                Common.SetAttr(thisWidget.element, 'aria-disabled', 'true');
            }

            thisWidget._on({
                // Prevent focus from sticking to links inside menu after clicking
                // them (focus should always stay on UL during navigation).
                'mousedown .gtc-ui-menu-item': function (event) {

                    event.preventDefault();

                },
                'click .gtc-ui-menu-item': function (event) {

                    var target = event.target;
                    if (!this.mouseHandled && !Common.HasClass(target, 'gtc-ui-state-disabled')) {
                        this.select(event);

                        // Only set the mouseHandled flag if the event will bubble, see #9469.
                        if (!event.isPropagationStopped()) {
                            this.mouseHandled = true;
                        }

                        // Open submenu on click
                        if (Common.HasClass(target, 'gtc-ui-menu')) {
                            this.expand(event);
                        }
                        else if (this.element != this.document.activeElement && Common.Closest('.gtc-ui-menu', this.document.activeElement)) {

                            // Redirect focus to the menu
                            Events.Trigger(this.element, 'focus', [true]);

                            // If the active item is on the top level, let it stay active.
                            // Otherwise, blur the active item since it is no longer visible.
                            if (this.active && Common.ParentsUntil(null, this.active, '.gtc-ui-menu').length === 1) {
                                clearTimeout(this.timer);
                            }
                        }
                    }

                },
                'mouseenter .gtc-ui-menu-item': function (event) {

                    // Ignore mouse events while typeahead is active, see #10458.
                    // Prevents focusing the wrong item when typeahead causes a scroll while the mouse
                    // is over an item in the menu
                    if (this.previousFilter) {
                        return;
                    }
                    var target = event.currentTarget;

                    // Remove gtc-ui-state-active class from siblings of the newly focused menu item
                    // to avoid a jump caused by adjacent elements both having a class with a border
                    var siblings = Common.GetAllSibling(target, Common.SiblingType.All, '.gtc-ui-state-active');
                    Common.RemoveClassFromElements(siblings, 'gtc-ui-state-active');
                    this.focus(event, target);

                },
                mouseleave: 'collapseAll',
                'mouseleave .gtc-ui-menu': 'collapseAll',
                focus: function (event, keepActiveItem) {

                    // If there's already an active item, keep it active
                    // If not, activate the first item
                    var itemSelector = this.options.items;
                    if (itemSelector == '> *') {
                        itemSelector = '[id="' + this.element.id + '"] ' + itemSelector;
                    }
                    var item = this.active || Common.QueryAll(itemSelector, this.element)[0];

                    if (!keepActiveItem) {
                        this.focus(event, item);
                    }

                },
                blur: function (event) {

                    setTimeout(
                        function () {
                            if (!thisWidget.element.contains(thisWidget.document.activeElement)) {
                                thisWidget.collapseAll(event);
                            }
                        }, 0
                    );

                },
                keydown: '_keydown'
            });

            thisWidget.refresh();

            // Clicks outside of a menu collapse any open menus
            thisWidget._on(thisWidget.document, {
                click: function (event) {
                    if (this._closeOnDocumentClick(event)) {
                        this.collapseAll(event);
                    }

                    // Reset the mouseHandled flag
                    this.mouseHandled = false;
                }
            });

        }

    };

    WidgetFactory.Register('gtc.menu', MenuWidget);

} (window, document, Common, Cache, Events, Velocity));
