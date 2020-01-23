// Selectbox Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var SelectboxWidget = {

        // Options
        options: {
            ClassSelectbox: 'gtc-classSpanSelectbox',
            ClassSelectboxActiveOption: 'gtc-classSelectboxActiveOption',
            ClassSelectboxPageThemeActiveOption: 'gtc-page-theme-active-select-option',
            ParentElement: 'PageContent',
            ClassSelectboxLocked: 'gtc-input-locked'
        },

        // Public Methods
        IsDisabled: function () {

            return GTC.IsControlDisabled(this.element);

        },

        DisableControl: function () {

            this._disableControl();

        },

        EnableControl: function () {

            this._enableControl();

        },

        // Private Methods
        _createSelectbox: function () {

            // Initialize
            var thisWidget = this;
            var elementStyle = thisWidget.element.style;
            elementStyle.left = '-9999px';
            elementStyle.position = 'absolute';

            // DropDown Markup
            var dropDownMarkup = '<span aria-expanded="false" class="gtc-classControlSpanDropDown" id="' + thisWidget.ElementId + 'DropDownSpan" style="position: absolute; display: none;"><ul id="' + thisWidget.ElementId + 'OptionsUl" aria-labelledby="' + thisWidget.ElementId + '-Label" class="gtc-cfscroll-y" role="menu">';
            var selectedText = '';
            var options = Common.GetChildren(thisWidget.element);
            var option, index = 0, length = options.length;
            for ( ; index < length; index++) {
                option = options[index];
                var convertedToken = Common.SanitizeToken(option.value);
                dropDownMarkup += '<li role="presentation" data-selectvalue="' + option.value + '" id="' + thisWidget.ElementId + convertedToken + 'OptionLi"';
                if (option.selected) {
                    dropDownMarkup += ' class="' + thisWidget.options.ClassSelectboxPageThemeActiveOption + ' ' + thisWidget.options.ClassSelectboxActiveOption + '"';
                    selectedText = option.text;
                }
                dropDownMarkup += '><a role="option" id="' + thisWidget.ElementId + convertedToken + 'OptionAnchor"';
                if (thisWidget.TranslateContent) {
                    dropDownMarkup += ' data-translate="' + option.text + '">' + Common.TranslateKey(option.text);
                }
                else {
                    dropDownMarkup += '>' + option.text;
                }
                dropDownMarkup += '</a></li>';
            }
            dropDownMarkup += '</ul></span>';

            // SelectSpan Span<>, A</>, Span</>
            var selectboxMarkup = '<span role="listbox" class="' + thisWidget.options.ClassSelectbox + '" id="' + thisWidget.ElementId + 'SelectedSpan">';
            selectboxMarkup += '<a';
            if (thisWidget.IconExists) {
                if (thisWidget.LabelExists == false) {
                    selectboxMarkup += ' class="gtc-input-selectbox-selectedanchor gtc-input__icon-left"';
                }
                else {
                    selectboxMarkup += ' class="gtc-input-selectbox-selectedanchor gtc-input__icon-label-left"';
                }
            }
            selectboxMarkup += ' id="' + thisWidget.ElementId + 'SelectedAnchor" tabindex="' + thisWidget.FocusIndex + '" role="button"';
            if (thisWidget.TranslateContent) {
                selectboxMarkup += ' data-translate="' + selectedText + '">' + Common.TranslateKey(selectedText);
            }
            else {
                selectboxMarkup += '>' + selectedText;
            }
            selectboxMarkup += '</a></span>';

            // Append to DOM
            Common.InsertHTMLString(thisWidget.element, Common.InsertType.After, selectboxMarkup + dropDownMarkup);

            // Cache frequently used elements
            thisWidget.SelectedSpan = Common.Get(thisWidget.ElementId + 'SelectedSpan');
            thisWidget.SelectedAnchor = Common.Get(thisWidget.ElementId + 'SelectedAnchor');
            thisWidget.DropDownSpan = Common.Get(thisWidget.ElementId + 'DropDownSpan');
            thisWidget.DropDownUl = Common.Get(thisWidget.ElementId + 'OptionsUl');

        },

        _bindAnchorFocus: function () {

            // Initialize
            var thisWidget = this;

            // Focus In
            Events.On(thisWidget.SelectedAnchor, 'focusin',
                function (event) {
                    if (thisWidget.Locked == false) {
                        if (thisWidget.Focused == false) {
                            Common.AddClass(thisWidget.SelectedSpan, thisWidget.options.ClassSelectbox + 'Hover');
                            Events.Trigger(thisWidget.element, 'focusin');
                            Events.Off(document, 'keydown.selectboxOpenAnchor');
                            Events.On(document, 'keydown.selectboxOpenAnchor', { FocusedAnchor: this, ThisWidget: thisWidget }, thisWidget._bindOpenKeyboardPress);
                            Events.Off(document, 'keydown.keypressAlphanumericSearch');
                            Events.On(document, 'keydown.keypressAlphanumericSearch', { FocusedAnchor: this, ThisWidget: thisWidget }, thisWidget._bindKeypressAlphanumericSearch);
                            thisWidget.Focused = true;
                        }
                    }
                }
            );

            // Focus Out
            Events.On(thisWidget.SelectedAnchor, 'focusout',
                function (event) {
                    if (!thisWidget.IsOpen) {
                        Common.RemoveClass(thisWidget.SelectedSpan, thisWidget.options.ClassSelectbox + 'Hover');
                        Events.Trigger(thisWidget.element, 'focusout');
                        Events.Off(document, 'keydown.selectboxOpenAnchor');
                        Events.Off(document, 'keydown.keypressAlphanumericSearch');
                        thisWidget.OpenedFromAlphanumeric = false;
                        thisWidget.Focused = false;
                    }
                    else {
                        thisWidget.SelectedAnchor.focus();
                    }
                }
            );

        },

        _bindKeypressAlphanumericSearch: function (event) {

            var thisWidget = event.data.ThisWidget;
            var character = String.fromCharCode(event.keyCode);
            if (/[a-zA-Z0-9]/.test(character)) {
                if (!thisWidget.OpenedFromAlphanumeric && !thisWidget.IsOpen) {
                    thisWidget.OpenedFromAlphanumeric = true;
                    Events.Trigger(event.data.FocusedAnchor, 'click');
                }
                var currentSelectedLi = Common.Query('.' + thisWidget.options.ClassSelectboxActiveOption, thisWidget.DropDownSpan);
                thisWidget.TypedKeystrokes += character;
                clearTimeout(thisWidget.KeystrokeTimeout);
                thisWidget.KeystrokeTimeout = setTimeout(function () { thisWidget.TypedKeystrokes = ''; }, 1000);
                var selectboxLiArray = Common.QueryAll('li', thisWidget.DropDownUl), index = 0, length = selectboxLiArray.length;
                for ( ; index < length; index++) {
                    var currentLi = selectboxLiArray[index];
                    if (currentLi.firstChild.textContent.toLowerCase().replace(' ', '').substring(0, thisWidget.TypedKeystrokes.length) == thisWidget.TypedKeystrokes.toLowerCase()) {
                        Common.RemoveClass(currentSelectedLi, thisWidget.options.ClassSelectboxPageThemeActiveOption);
                        Common.RemoveClass(currentSelectedLi, thisWidget.options.ClassSelectboxActiveOption);
                        Common.AddClass(currentLi, thisWidget.options.ClassSelectboxPageThemeActiveOption);
                        Common.AddClass(currentLi, thisWidget.options.ClassSelectboxActiveOption);
                        thisWidget.DropDownUl.scrollTop = Common.Height(currentLi) * index;
                        break;
                    }
                }
            }

        },

        _bindOpenKeyboardPress: function (event) {

            switch (event.keyCode) {
                case GTC.Keyboard.Enter:
                case GTC.Keyboard.Up:
                case GTC.Keyboard.Down:
                case GTC.Keyboard.Space:
                    var thisWidget = event.data.ThisWidget;
                    if (!thisWidget.IsOpen || event.keyCode == GTC.Keyboard.Enter || event.keyCode == GTC.Keyboard.Space) {
                        Events.Trigger(event.data.FocusedAnchor, 'click');
                        Events.Off(document, 'keydown.selectboxOpenAnchor');
                        Common.RemoveClass(thisWidget.SelectedSpan, thisWidget.options.ClassSelectbox + 'Hover');
                        Common.AddClass(thisWidget.SelectedSpan, thisWidget.options.ClassSelectbox + 'Open');
                    }
                    break;
            }

        },

        _openSelectbox: function (anchorSelectbox) {

            // Check if in modal and if resizing
            if (Common.IsModal() && Common.HasClass(document.body, 'gtc-modal-resizing')) {
                return;
            }

            // Initialize
            var thisWidget = this;
            var spanAnchorDropDown = thisWidget.DropDownSpan;

            // Open
            if (thisWidget.Locked == false) {
                // Close other open Selectboxes
                var spanDropDown = Common.QueryAll('.gtc-classControlSpanDropDown');
                var prevArray = [], prevElement, prevIndex = 0, prevLength = spanDropDown.length;
                for ( ; prevIndex < prevLength; prevIndex++) {
                    prevElement = spanDropDown[prevIndex];
                    if (prevElement != anchorSelectbox) {
                        prevArray.push(Common.GetSibling(prevElement, Common.SiblingType.Previous));
                    }
                }
                Common.RemoveClassFromElements(prevArray, thisWidget.options.ClassSelectbox + 'Open');
                Events.Off(document, 'keydown.selectboxKeyboardClicks');
                thisWidget._slideUpSpan(thisWidget.DropDownSpan, thisWidget, null);

                // 508 Compliance
                Common.SetAttr(thisWidget.DropDownSpan, 'aria-expanded', 'true');

                // Selectbox Span/Ul Position and Height
                var spanSelectbox = thisWidget.SelectedSpan;
                var spanSelectboxPos = Common.Position(spanSelectbox);
                var posLeft = spanSelectboxPos.left;
                var posTop = spanSelectboxPos.top + Common.Height(spanSelectbox);
                var selectWidth = Common.Width(spanSelectbox);
                var spanAnchorDropDownStyle = spanAnchorDropDown.style;
                spanAnchorDropDownStyle.display = 'block';
                spanAnchorDropDownStyle.zIndex = '-1';
                var selectboxDisplayHeight = Common.Height(spanAnchorDropDown, true);
                var spanAnchorDropDownUl = thisWidget.DropDownUl;
                var totalLis = Common.QueryAll('li', spanAnchorDropDownUl);
                var overflowExists = false;
                if (totalLis.length * Common.Height(totalLis[0], true) > selectboxDisplayHeight) {
                    overflowExists = true;
                    var currentSelectedLi = Common.Query('.' + thisWidget.options.ClassSelectboxActiveOption, spanAnchorDropDown);
                    var currentSelectedLiIndex = Common.GetIndex(currentSelectedLi);
                    spanAnchorDropDownUl.scrollTop = Common.Height(currentSelectedLi, true) * currentSelectedLiIndex;
                }
                spanAnchorDropDownStyle.display = 'none';
                spanAnchorDropDownStyle.zIndex = '';

                // Slide Down
                spanAnchorDropDownStyle.left = posLeft + 'px';
                spanAnchorDropDownStyle.width = selectWidth + 'px';
                spanAnchorDropDownStyle.top = posTop + 'px';
                Velocity(spanAnchorDropDown, 'slideDown', { duration: 400, queue: false,
                    complete: function () {
                        thisWidget.IsOpen = true;
                        spanAnchorDropDownStyle.display = 'block';

                        // Close Selectbox on Body click
                        Events.On(document.body, 'click.selectboxCloseOnBodyClick.' + thisWidget.ElementId,
                            function (event) {
                                var eventTarget = event.target;
                                if (!Common.Closest('#' + thisWidget.ElementId + 'DropDownSpan', eventTarget) && eventTarget.id != thisWidget.ElementId + 'SelectedAnchor') {
                                    Events.Off(document.body, 'click.selectboxCloseOnBodyClick');
                                    Events.Off(document, 'keydown.selectboxKeyboardClicks');
                                    thisWidget._slideUpSpan(thisWidget.DropDownSpan, thisWidget,
                                        function () {
                                            if (thisWidget.IsHeightIncreased) {
                                                thisWidget.IsHeightIncreased = false;
                                                if (Common.IsModal()) {
                                                    var modalSelect = window.parent.Common.Query('.gtc-modal-iframe', null, true);
                                                    var newHeight = Common.Height(modalSelect.parentNode) - thisWidget.HeightIncrease;
                                                    modalSelect.parentNode.style.height = newHeight + 'px';
                                                }
                                                else {
                                                    var parentElement = Common.Get(thisWidget.options.ParentElement);
                                                    var newHeight = Common.Height(parentElement) - thisWidget.HeightIncrease;
                                                    parentElement.style.height = newHeight + 'px';
                                                }
                                            }
                                        }
                                    );
                                    Common.RemoveClass(Common.GetSibling(spanAnchorDropDown, Common.SiblingType.Previous), thisWidget.options.ClassSelectbox + 'Open');

                                    // 508 Compliance
                                    Common.SetAttr(thisWidget.DropDownSpan, 'aria-expanded', 'false');
                                }
                            }
                        );

                        // Keyboard access to Selectbox
                        Events.Off(document, 'keydown.selectboxKeyboardClicks');
                        Events.On(document, 'keydown.selectboxKeyboardClicks.' + thisWidget.ElementId,
                            function (event) {
                                event.preventDefault();
                                // Initialize
                                var currentSelectedLi = Common.Query('.' + thisWidget.options.ClassSelectboxActiveOption, spanAnchorDropDown);

                                // Check if nothing is selected and select first option
                                if (Common.IsNotDefined(currentSelectedLi)) {
                                    currentSelectedLi = Common.Query('li:first-child', spanAnchorDropDown);
                                    Common.AddClass(currentSelectedLi, thisWidget.options.ClassSelectboxPageThemeActiveOption);
                                    Common.AddClass(currentSelectedLi, thisWidget.options.ClassSelectboxActiveOption);
                                    return;
                                }

                                // Check overflow
                                var currentSelectedLiIndex;
                                if (overflowExists) {
                                    currentSelectedLiIndex = Common.GetIndex(currentSelectedLi);
                                }

                                // Process Key
                                var switchCaseExecuted = false, newlySelectedLi;
                                switch (event.keyCode) {
                                    case GTC.Keyboard.Down:
                                        newlySelectedLi = Common.GetSibling(currentSelectedLi, Common.SiblingType.Next);
                                        if (Common.IsDefined(newlySelectedLi)) {
                                            Common.RemoveClass(currentSelectedLi, thisWidget.options.ClassSelectboxPageThemeActiveOption);
                                            Common.RemoveClass(currentSelectedLi, thisWidget.options.ClassSelectboxActiveOption);
                                            Common.AddClass(newlySelectedLi, thisWidget.options.ClassSelectboxPageThemeActiveOption);
                                            Common.AddClass(newlySelectedLi, thisWidget.options.ClassSelectboxActiveOption);
                                            if (overflowExists) {
                                                var scrollPosition = thisWidget.DropDownUl.scrollTop;
                                                scrollPosition += Common.Height(currentSelectedLi, true);
                                                thisWidget.DropDownUl.scrollTop = scrollPosition;
                                            }
                                        }
                                        switchCaseExecuted = true;
                                        break;
                                    case GTC.Keyboard.Up:
                                        newlySelectedLi = Common.GetSibling(currentSelectedLi, Common.SiblingType.Previous);
                                        if (Common.IsDefined(newlySelectedLi)) {
                                            Common.RemoveClass(currentSelectedLi, thisWidget.options.ClassSelectboxPageThemeActiveOption);
                                            Common.RemoveClass(currentSelectedLi, thisWidget.options.ClassSelectboxActiveOption);
                                            Common.AddClass(newlySelectedLi, thisWidget.options.ClassSelectboxPageThemeActiveOption);
                                            Common.AddClass(newlySelectedLi, thisWidget.options.ClassSelectboxActiveOption);
                                            if (overflowExists) {
                                                var scrollPosition = thisWidget.DropDownUl.scrollTop;
                                                scrollPosition -= Common.Height(currentSelectedLi, true);
                                                thisWidget.DropDownUl.scrollTop = scrollPosition;
                                            }
                                        }
                                        switchCaseExecuted = true;
                                        break;
                                    case GTC.Keyboard.Enter:
                                    case GTC.Keyboard.Space:
                                    case GTC.Keyboard.Tab:
                                        Events.Trigger(Common.Query(':first-child', currentSelectedLi), 'click');
                                        var prevSpan = thisWidget.SelectedSpan;
                                        Common.RemoveClass(prevSpan, thisWidget.options.ClassSelectbox + 'Open');
                                        Common.AddClass(prevSpan, thisWidget.options.ClassSelectbox + 'Hover');
                                        switchCaseExecuted = true;
                                        break;
                                }
                            }
                        );
                    }
                });

                // Adjust Screen Height
                var anchorSelectboxParent = thisWidget.SelectedSpan;
                Common.RemoveClass(anchorSelectboxParent, thisWidget.options.ClassSelectbox + 'Hover');
                Common.AddClass(anchorSelectboxParent, thisWidget.options.ClassSelectbox + 'Open');
                var parentElement = Common.Get(thisWidget.options.ParentElement);
                if (parentElement && !Common.IsModal()) {
                    var parentElementHeight = Common.Height(parentElement);
                    var containerElementHeight = Common.Offset(parentElement).top + parentElementHeight;
                    var selectboxHeight = Common.Offset(spanAnchorDropDown).top + selectboxDisplayHeight + 10;
                    if (selectboxHeight > containerElementHeight && containerElementHeight > 0) {
                        thisWidget.IsHeightIncreased = true;
                        thisWidget.HeightIncrease = selectboxHeight - containerElementHeight;
                        parentElement.style.height = (parentElementHeight + thisWidget.HeightIncrease) + 'px';
                    }
                }
                else if (Common.IsModal()) {
                    var modalParent = window.parent.Common.Query('.gtc-modal-iframe', null, true).parentNode;
                    var modalParentOffset = Common.Offset(modalParent);
                    var modalBottom = Common.Height(modalParent, true) + modalParentOffset.top;
                    var selectBottom = selectboxDisplayHeight + Common.Offset(anchorSelectboxParent).top + posTop + modalParentOffset.top;
                    if (selectBottom > modalBottom) {
                        thisWidget.IsHeightIncreased = true;
                        thisWidget.HeightIncrease = selectBottom - modalBottom + (selectboxDisplayHeight * 2);
                        var modalParentHeight = Common.Height(modalParent);
                        modalParent.style.height = (modalParentHeight + thisWidget.HeightIncrease) + 'px';
                    }
                }
            }

        },

        _closeSelectbox: function (anchorSelectbox) {

            // Initialize
            var thisWidget = this;

            // Close Select Span
            Common.RemoveClass(thisWidget.SelectedSpan, thisWidget.options.ClassSelectbox + 'Open');
            Events.Off(document.body, 'click.selectboxCloseOnBodyClick');
            Events.Off(document, 'keydown.selectboxKeyboardClicks');
            thisWidget.IsOpen = false;
            thisWidget.OpenedFromAlphanumeric = false;

            // 508 Compliance
            Common.SetAttr(thisWidget.DropDownSpan, 'aria-expanded', 'false');

            // Slide Up and Adjust Height
            thisWidget._slideUpSpan(thisWidget.DropDownSpan, thisWidget,
                function () {
                    if (thisWidget.IsHeightIncreased) {
                        thisWidget.IsHeightIncreased = false;
                        if (Common.IsModal()) {
                            var modalSelect = window.parent.Common.Query('.gtc-modal-iframe', null, true);
                            var newHeight = Common.Height(modalSelect.parentNode) - thisWidget.HeightIncrease;
                            modalSelect.parentNode.style.height = newHeight + 'px';
                        }
                        else {
                            var parentElement = Common.Get(thisWidget.options.ParentElement);
                            var newHeight = Common.Height(parentElement) - thisWidget.HeightIncrease;
                            parentElement.style.height = newHeight + 'px';
                        }
                    }
                }
            );

            // Update Keypress events
            Events.Off(document, 'keydown.selectboxOpenAnchor');
            Events.On(document, 'keydown.selectboxOpenAnchor.' + thisWidget.ElementId, { FocusedAnchor: thisWidget.SelectedAnchor, ThisWidget: thisWidget }, thisWidget._bindOpenKeyboardPress);

        },

        _slideUpSpan: function (spanDropDown, thisWidget, callback) {

            Velocity(spanDropDown, 'slideUp', 400, callback);
            thisWidget.IsOpen = false;

        },

        _bindAnchorClick: function () {

            // Initialize
            var thisWidget = this;

            // Click
            Events.On(thisWidget.SelectedAnchor, 'click',
                function (event) {
                    event.preventDefault();
                    if (Common.IsHidden(thisWidget.DropDownSpan)) {
                        thisWidget._openSelectbox(this);
                    }
                    else {
                        thisWidget._closeSelectbox(this);
                    }
                }
            );

        },

        _bindLiClick: function () {

            // Initialize
            var thisWidget = this;
            var selectLis = Common.QueryAll('li', thisWidget.DropDownUl);

            // Click
            Events.On(selectLis, 'click',
                function (event) {
                    // Activate and Show Selected Option(Li)
                    event.preventDefault();
                    Common.RemoveClassFromElements(selectLis, thisWidget.options.ClassSelectboxPageThemeActiveOption);
                    Common.RemoveClassFromElements(selectLis, thisWidget.options.ClassSelectboxActiveOption);
                    Common.AddClass(this, thisWidget.options.ClassSelectboxPageThemeActiveOption);
                    Common.AddClass(this, thisWidget.options.ClassSelectboxActiveOption);
                    thisWidget.SelectedAnchor.textContent = this.textContent;
                    if (thisWidget.TranslateContent) {
                        Common.SetAttr(thisWidget.SelectedAnchor, 'data-translate', Common.GetAttr(this.firstChild, 'data-translate'));
                    }
                    var spanAnchorDropDown = thisWidget.DropDownSpan;
                    var offsetHeight = Common.Offset(spanAnchorDropDown).top + Common.Height(spanAnchorDropDown);
                    Common.RemoveClass(thisWidget.SelectedSpan, thisWidget.options.ClassSelectbox + 'Open');
                    Events.Off(document.body, 'click.selectboxCloseOnBodyClick');
                    Events.Off(document, 'keydown.selectboxKeyboardClicks');
                    thisWidget._slideUpSpan(thisWidget.DropDownSpan, thisWidget,
                        function () {
                            if (thisWidget.IsHeightIncreased) {
                                thisWidget.IsHeightIncreased = false;
                                if (Common.IsModal()) {
                                    var modalSelect = window.parent.Common.Query('.gtc-modal-iframe', null, true);
                                    var newHeight = Common.Height(modalSelect.parentNode) - thisWidget.HeightIncrease;
                                    modalSelect.parentNode.style.height = newHeight + 'px';
                                }
                                else {
                                    var parentElement = Common.Get(thisWidget.options.ParentElement);
                                    var newHeight = Common.Height(parentElement) - thisWidget.HeightIncrease;
                                    parentElement.style.height = newHeight + 'px';
                                }
                            }
                        }
                    );

                    // Update select control
                    // TODO: figure why this is happening! Can't set value of select with a base64?
                    // thisWidget.element.value = Common.GetAttr(this, 'data-selectvalue');
                    var selected = Common.QueryAll('option[selected]', thisWidget.element);
                    var index = 0, length = selected.length;
                    for ( ; index < length; index++) {
                        Common.RemoveAttr(selected[index], 'selected');
                    }
                    var clickedIndex = Common.GetIndex(this);
                    var options = Common.QueryAll('option', thisWidget.element);
                    Common.SetAttr(options[clickedIndex], 'selected', 'selected');
                    Events.Trigger(thisWidget.element, 'change');

                    // Update Keypress events
                    Events.Off(document, 'keydown.selectboxOpenAnchor');
                    Events.On(document, 'keydown.selectboxOpenAnchor.' + thisWidget.ElementId, { FocusedAnchor: thisWidget.SelectedAnchor, ThisWidget: thisWidget }, thisWidget._bindOpenKeyboardPress);
                }
            );

        },

        _bindChange: function () {

            // Initialize
            var thisWidget = this;
            var spanAnchorDropDown = thisWidget.DropDownSpan;

            // Click
            Events.On(thisWidget.element, 'widgetUpdateValue',
                function () {
                    Common.RemoveClass(Common.Query('.' + thisWidget.options.ClassSelectboxPageThemeActiveOption, spanAnchorDropDown), thisWidget.options.ClassSelectboxPageThemeActiveOption);
                    Common.RemoveClass(Common.Query('.' + thisWidget.options.ClassSelectboxActiveOption, spanAnchorDropDown), thisWidget.options.ClassSelectboxActiveOption);
                    var convertedToken = Common.SanitizeToken(this.value);
                    var selectedLiOption = Common.Get(thisWidget.ElementId + convertedToken + 'OptionLi');
                    Common.AddClass(selectedLiOption, thisWidget.options.ClassSelectboxPageThemeActiveOption);
                    Common.AddClass(selectedLiOption, thisWidget.options.ClassSelectboxActiveOption);
                    var selectedLiAnchor = Common.GetChildren(selectedLiOption, 'a')[0];
                    thisWidget.SelectedAnchor.textContent = selectedLiAnchor.textContent;
                    if (thisWidget.TranslateContent) {
                        Common.SetAttr(thisWidget.SelectedAnchor, 'data-translate', Common.GetAttr(selectedLiAnchor, 'data-translate'));
                    }
                }
            );

        },

        _bindUpdateOptions: function () {

            // Initialize
            var thisWidget = this;
            var selectboxUl = thisWidget.DropDownUl;

            // Click
            Events.On(thisWidget.element, 'widgetUpdateOptions',
                function () {
                    Common.Remove(Common.QueryAll('li', selectboxUl));
                    var customDropDownMarkup = '';
                    var options = Common.GetChildren(thisWidget.element);
                    var option, index = 0, length = options.length;
                    for ( ; index < length; index++) {
                        option = options[index];
                        var convertedToken = Common.SanitizeToken(option.value);
                        customDropDownMarkup += '<li role="presentation" data-selectvalue="' + option.value + '" id="' + thisWidget.ElementId + convertedToken + 'OptionLi"';
                        customDropDownMarkup += '><a role="option" id="' + thisWidget.ElementId + convertedToken + 'OptionAnchor"';
                        if (thisWidget.TranslateContent) {
                            customDropDownMarkup += ' data-translate="' + option.text + '">' + Common.TranslateKey(option.text);
                        }
                        else {
                            customDropDownMarkup += '>' + option.text;
                        }
                        customDropDownMarkup += '</a></li>';
                    }
                    selectboxUl.innerHTML = customDropDownMarkup;
                    thisWidget._bindLiClick();
                    thisWidget._bindChange();
                }
            );

        },

        _disableControl: function () {

            // Initialize
            var thisWidget = this;

            // Lock
            if (!thisWidget.Locked) {
                thisWidget.Locked = true;
                Common.SetAttr(thisWidget.element, 'disabled', 'disabled');
                Common.SetAttr(thisWidget.element, 'data-disabled', 'true');
                Common.SetAttr(thisWidget.SelectedAnchor, 'tabindex', '-1');
                Common.AddClass(thisWidget.SelectedSpan, thisWidget.options.ClassSelectboxLocked);
                Common.InsertHTMLString(thisWidget.SelectedSpan, Common.InsertType.After, '<span class="gtc-input-system"><i class="gtc-icon-styles fa fa-lock"></i></span>');
            }

        },

        _enableControl: function () {

            // Initialize
            var thisWidget = this;

            // Unlock
            if (thisWidget.Locked) {
                Common.RemoveClass(thisWidget.SelectedSpan, thisWidget.options.ClassSelectboxLocked);
                Common.Remove(Common.GetSibling(thisWidget.SelectedSpan, Common.SiblingType.Next, '.gtc-input-system'), true);
                Common.SetAttr(thisWidget.SelectedAnchor, 'tabindex', thisWidget.FocusIndex);
                Common.RemoveAttr(thisWidget.element, 'data-disabled');
                Common.RemoveAttr(thisWidget.element, 'disabled');
                thisWidget.Locked = false;
            }

        },

        _init: function () {

        },

        _create: function () {

            // Create local properties
            this.ElementId = this.element.id;
            this.Locked = false;
            this.Focused = false;
            this.IsHeightIncreased = false;
            this.HeightIncrease = 0;
            this.IsOpen = false;
            this.FocusIndex = Common.GetAttr(this.element, 'tabindex');
            Common.SetAttr(this.element, 'tabindex', '-1');
            this.TypedKeystrokes = '';
            this.LabelExists = (Common.GetAttr(this.element, 'data-labelexists') === 'true');
            this.IconExists = (Common.GetAttr(this.element, 'data-iconexists') === 'true');
            this.TranslateContent = false;
            if (Common.GetAttr(this.element, 'data-translatecontent') == 'Yes') {
                this.TranslateContent = true;
            }

            // Create selectbox
            this._createSelectbox();
            this._bindAnchorFocus();
            this._bindAnchorClick();
            this._bindLiClick();
            this._bindChange();
            this._bindUpdateOptions();

            // Check if field is disabled
            var dataDisabled = Common.GetAttr(this.element, 'data-disabled');
            if (dataDisabled == 'true') {
                this._disableControl();
            }

        }

    };

    WidgetFactory.Register('gtc.selectbox', SelectboxWidget);

} (window, document, Common, Cache, Events, Velocity));
