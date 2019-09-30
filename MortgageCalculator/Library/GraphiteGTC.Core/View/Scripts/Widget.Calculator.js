// Calculator Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var CalculatorGlobals = {
        CalculatorCreated: false,
        CalculatorMarkup: '<label id="InputCalcMathLineLabel" for="InputCalcMathLine" class="gtc-sr-only">InputCalcMathLine</label><input class="gtc-classInputCalculatorScreen" type="text" id="InputCalcMathLine" disabled="disabled"><br><table role="presentation" class="gtc-classTableCalculator"><tr><td><table role="presentation" class="gtc-classTableCalculator"><tr><td class="gtc-classTdCalculatorButton"><div id="DivClear" title="Clear (Alt-c)" class="gtc-classDivCalculatorButtonGreenGlow gtc-classDivCalculatorButton">C<span/><a accesskey=c style="display: hidden;" id="AnchorClearCalc"></a></div></td><td class="gtc-classTdCalculatorButton"><div id="DivLeftParen" title="Grouping Parenthesis" class="gtc-classDivCalculatorButtonGrayGlow gtc-classDivCalculatorButton">(<span/></div></td><td class="gtc-classTdCalculatorButton"><div id="DivRightParen" title="Grouping Parenthesis" class="gtc-classDivCalculatorButtonGrayGlow gtc-classDivCalculatorButton">)<span/></div></td><td class="gtc-classTdCalculatorButton"><div id="DivAdd" title="Addition" class="gtc-classDivCalculatorButtonOrangeGlow gtc-classDivCalculatorButton">+<span/></div></td><tr><td class="gtc-classTdCalculatorButton"><div id="DivSeven" title="Seven" class="gtc-classDivCalculatorButtonGrayGlow gtc-classDivCalculatorButton">7<span/></div></td><td class="gtc-classTdCalculatorButton"><div id="DivEight" title="Eight" class="gtc-classDivCalculatorButtonGrayGlow gtc-classDivCalculatorButton">8<span/></div></td><td class="gtc-classTdCalculatorButton"><div id="DivNine" title="Nine" class="gtc-classDivCalculatorButtonGrayGlow gtc-classDivCalculatorButton">9<span/></div></td><td class="gtc-classTdCalculatorButton"><div id="DivSub" title="Subtraction" class="gtc-classDivCalculatorButtonOrangeGlow gtc-classDivCalculatorButton">-<span/></div></td></tr><tr><td class="gtc-classTdCalculatorButton"><div id="DivFour" title="Four" class="gtc-classDivCalculatorButtonGrayGlow gtc-classDivCalculatorButton">4<span/></div></td><td class="gtc-classTdCalculatorButton"><div id="DivFive" title="Five" class="gtc-classDivCalculatorButtonGrayGlow gtc-classDivCalculatorButton">5<span/></div></td><td class="gtc-classTdCalculatorButton"><div id="DivSix" title="Six" class="gtc-classDivCalculatorButtonGrayGlow gtc-classDivCalculatorButton">6<span/></div></td><td class="gtc-classTdCalculatorButton"><div id="DivMulti" title="Multiplication" class="gtc-classDivCalculatorButtonOrangeGlow gtc-classDivCalculatorButton">*<span/></div></td></tr><tr><td class="gtc-classTdCalculatorButton"><div id="DivOne" title="One" class="gtc-classDivCalculatorButtonGrayGlow gtc-classDivCalculatorButton">1<span/></div></td><td class="gtc-classTdCalculatorButton"><div id="DivTwo" title="Two" class="gtc-classDivCalculatorButtonGrayGlow gtc-classDivCalculatorButton">2<span/></div></td><td class="gtc-classTdCalculatorButton"><div id="DivThree" title="Three" class="gtc-classDivCalculatorButtonGrayGlow gtc-classDivCalculatorButton">3<span/></div></td><td class="gtc-classTdCalculatorButton"><div id="DivDivis" title="Division" class="gtc-classDivCalculatorButtonOrangeGlow gtc-classDivCalculatorButton">&#247;<span/></div></td></tr><tr><td class="gtc-classTdCalculatorButton"><div id="DivSne" title="Scientific Notation Exponent" class="gtc-classDivCalculatorButtonGrayGlow gtc-classDivCalculatorButton">E<span/></div></td><td class="gtc-classTdCalculatorButton"><div id="DivZero" title="Zero" class="gtc-classDivCalculatorButtonGrayGlow gtc-classDivCalculatorButton">0<span/></div></td><td class="gtc-classTdCalculatorButton"><div id="DivDeci" title="Decimal Point" class="gtc-classDivCalculatorButtonGrayGlow gtc-classDivCalculatorButton">.<span/></div></td><td class="gtc-classTdCalculatorButton"><div id="DivEqual" title="Enter (Alt-e)" class="gtc-classDivCalculatorButtonOrangeGlow gtc-classDivCalculatorButton">=<span/><a accesskey=e style="display: hidden;" id="AnchorEqualDoCalc"></a></div></td></tr></table></td></table><table role="presentation"><tr><div class="gtc-classDivCalculatorControls"><div class="gtc-classDivCalculatorControlsButton" id="DivSetCalculationButton"><span class="gtc-classSpanCalculatorControlsButtonInner"><span class="gtc-classSpanCalculatorControlsButtonText">Close</span></span></div></div></tr></table>',
        LastResult: '',
        SavedResult: '',
        LastInput: '',
        LastDisplayed: '',
        RegexAllowable: new RegExp(
            '(?:[0](?:[x]|[X])(?:[0-9a-fA-F])+)|(?:[0](?:[0-7])*)|(?:(?:(?:[0-9])+[\.](?:[0-9])*(?:(?:[e]|[E])(?:(?:[\+]|[\-])?(?:[0-9])+))?)|(?:[\.](?:[0-9])+(?:(?:[e]|[E])(?:(?:[\+]|[\-])?(?:[0-9])+))?)|(?:(?:[0-9])+(?:(?:[e]|[E])(?:(?:[\+]|[\-])?(?:[0-9])+)))|(?:(?:[0-9])+))|(?:(?:[0]|(?:[1-9])(?:[0-9])*))|' +
                '(?:(?:[0]+[\.][0]*(?:(?:[e]|[E])(?:(?:[\+]|[\-])?(?:[0-9])+))?)|(?:[\.][0]+(?:(?:[e]|[E])(?:(?:[\+]|[\-])?(?:[0-9])+))?)|(?:[0]+v)|(?:[0]+))|(?:[\n\ \t])|(?:[\(\)\+\-\/\*\|\&\,\~\^]|\<\<|\>\>|\>\>\>|\%)|(?:(?:Math[\.](?:E|LN10|LN2|LOG10E|LOG2E|PI|SQRT1_2|SQRT2|abs|acos|asin|atan2|atan|ceil|cos|exp|floor|log|max|min|pow|random|round|sin|sqrt|tan))|(?:E|LN10|LN2|LOG10E|LOG2E|PI|SQRT1_2|SQRT2|abs|acos|asin|atan2|atan|ceil|cos|exp|floor|log|max|min|pow|random|round|sin|sqrt|tan))|ans', 'g'),
        E: Math.E,
        LN10: Math.LN10,
        LN2: Math.LN2,
        LOG10E: Math.LOG10E,
        LOG2E: Math.LOG2E,
        PI: Math.PI,
        SQRT1_2: Math.SQRT1_2,
        SQRT2: Math.SQRT2,
        IdToValueObject: {
            'DivZero': ['0', 0],
            'DivOne': ['1', 0],
            'DivTwo': ['2', 0],
            'DivThree': ['3', 0],
            'DivFour': ['4', 0],
            'DivFive': ['5', 0],
            'DivSix': ['6', 0],
            'DivSeven': ['7', 0],
            'DivEight': ['8', 0],
            'DivNine': ['9', 0],
            'DivLeftParen': ['(', 0],
            'DivRightParen': [')', 0],
            'DivAdd': [' + ', 1],
            'DivSub': [' - ', 1],
            'DivMulti': [' * ', 1],
            'DivDivis': [' / ', 1],
            'DivSne': ['e', 2],
            'DivDeci': ['.', 2]
        }
    };

    var CalculatorWidget = {

        // Options
        options: {
            ClassCalculatorLocked: 'gtc-input-locked',
            ParentElement: 'PageContent',
            UpdateValueCallback: ''
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
        _replaceBinary: function (binaryString) {

            var binaryRegExp = new RegExp('^((?:[a]|[^a])*)0[bB]([01]{1,32})((?:[a]|[^a])*)$');
            while (binaryRegExp.exec(binaryString)) {
                binaryString = RegExp.$1 + ' ' + this._fromBinary(RegExp.$2) + ' ' + RegExp.$3;
            }
            return binaryString;

        },

        _fromBinary: function (binaryString) {

            var binaryResult = 0;
            var binaryPosition = 0;
            var index = binaryString.length - 1;
            while (index >= 0 && binaryPosition < 32) {
                if (binaryString.charAt(index) == '1') {
                    binaryResult |= 1 << binaryPosition;
                }
                binaryPosition++;
                index -= 1;
            }
            return binaryResult;

        },

        _replaceAnswer: function (answerString) {

            var answerRegExp = new RegExp('^((?:[a]|[^a])*)ans((?:[a]|[^a])*)$');
            while (answerRegExp.exec(answerString)) {
                answerString = RegExp.$1 + ' ' + CalculatorGlobals.SavedResult + ' ' + RegExp.$2;
            }
            return answerString;

        },

        _doCalculation: function () {

            var currentCalcValue = Common.Get('InputCalcMathLine').value;
            var modifiedCalcValue = this._replaceAnswer(currentCalcValue);
            modifiedCalcValue = this._replaceBinary(modifiedCalcValue);
            if (modifiedCalcValue != CalculatorGlobals.LastDisplayed && modifiedCalcValue != CalculatorGlobals.LastInput) {
                var notAllowed = modifiedCalcValue.split(CalculatorGlobals.RegexAllowable);
                var badTokens = 0, index = 0, length = notAllowed.length;
                for ( ; index < length; index++) {
                    if (notAllowed[index].length != 0) {
                        badTokens++;
                    }
                }
                if (badTokens == 0) {
                    try {
                        var calculatedResult = '' + eval(modifiedCalcValue);
                        if (Common.IsDefined(calculatedResult)) {
                            CalculatorGlobals.LastResult = calculatedResult;
                            CalculatorGlobals.SavedResult = calculatedResult;
                            CalculatorGlobals.LastInput = '';
                            this._displayResult();
                        }
                    }
                    catch (exception) {
                        CalculatorGlobals.LastInput = currentCalcValue;
                    }
                }
                else {
                    CalculatorGlobals.LastInput = currentCalcValue;
                }
                Common.Get('InputCalcMathLine').focus();
            }

        },

        _lineChange: function () {

            if (CalculatorGlobals.LastDisplayed != Common.Get('InputCalcMathLine').value) {
                CalculatorGlobals.LastResult = '';
            }

        },

        _displayResult: function () {

            if (Common.IsNotEmptyString(CalculatorGlobals.LastResult)) {
                var floatValue = parseFloat(CalculatorGlobals.LastResult);
                var displayValue = this._roundExtraDecimals(floatValue);
                CalculatorGlobals.LastDisplayed = displayValue;
                Common.Get('InputCalcMathLine').value = displayValue;
            }

        },

        _roundExtraDecimals: function (floatValue) {

            var floatString = floatValue.toPrecision(14);
            floatString = floatString.replace(/^([\+\-0-9\\.]*[1-9\.])0+((?:e[0-9\+\-]+)?)$/g, '$1$2');
            floatString = floatString.replace(/\.((?:e[0-9\+\-]+)?)$/g, '$1');
            return floatString;

        },

        _appendCalcValue: function (stringValue, replaceLast) {

            if (Common.IsNotEmptyString(stringValue)) {
                CalculatorGlobals.LastResult = '';
                var newContents;
                var inputCalcMathLineElement = Common.Get('InputCalcMathLine');
                var currentCalcLineValue = inputCalcMathLineElement.value;
                if (replaceLast == 0 && currentCalcLineValue == CalculatorGlobals.LastDisplayed) {
                    newContents = stringValue;
                }
                else if (replaceLast == 1 && currentCalcLineValue == CalculatorGlobals.LastDisplayed) {
                    newContents = CalculatorGlobals.SavedResult + ' ' + stringValue;
                }
                else {
                    newContents = currentCalcLineValue + stringValue;
                }
                CalculatorGlobals.LastInput = newContents;
                inputCalcMathLineElement.value = newContents;
                CalculatorGlobals.LastInput = '';
                CalculatorGlobals.LastDisplayed = '';
            }

        },

        _clearCalc: function () {

            var divClear = Common.Get('DivClear');
            Common.AddClass(divClear, 'gtc-classDivCalculatorButtonGreenGlowHover');
            Common.Get('InputCalcMathLine').value = '';
            CalculatorGlobals.SavedResult = '';
            setTimeout(
                function () {
                    Common.RemoveClass(divClear, 'gtc-classDivCalculatorButtonGreenGlowHover');
                }, 200
            );

        },

        _bindCalculatorButtonClicks: function () {

            var thisWidget = this;

            var buttons = Common.QueryAll('#DivZero, #DivOne, #DivTwo, #DivThree, #DivFour, #DivFive, #DivSix, ' +
                '#DivSeven, #DivEight, #DivNine, #DivLeftParen, #DivRightParen,' +
                '#DivAdd, #DivSub, #DivMulti, #DivDivis, #DivSne, #DivDeci');
            Events.On(buttons, 'click',
                function (event) {
                    event.preventDefault();
                    var appendCalcValueData = CalculatorGlobals.IdToValueObject[this.id];
                    thisWidget._appendCalcValue(appendCalcValueData[0], appendCalcValueData[1]);
                }
            );

            var clearButtons = Common.QueryAll('#DivClear, #AnchorClearCalc');
            Events.On(clearButtons, 'click',
                function (event) {
                    event.preventDefault();
                    thisWidget._clearCalc();
                }
            );

            var equalButtons = Common.QueryAll('#DivEqual, #AnchorEqualDoCalc');
            Events.On(equalButtons, 'click',
                function (event) {
                    event.preventDefault();
                    thisWidget._doCalculation();
                }
            );

        },

        _bindCalculatorKeyboardClicks: function () {

            var thisWidget = this;

            Events.Off(document, 'keydown.calculatorKeyboardClicks');
            Events.On(document, 'keydown.calculatorKeyboardClicks.DivCalculator',
                function (e) {
                    var properInstance = thisWidget._loadProperInstance();
                    switch (e.keyCode) {
                        case GTC.Numbers.Zero:
                            properInstance._handleCalculatorKeyboardClicks('DivZero', 'gtc-classDivCalculatorButtonGrayGlowHover', '0', 0, properInstance);
                            break;
                        case GTC.Numbers.One:
                            properInstance._handleCalculatorKeyboardClicks('DivOne', 'gtc-classDivCalculatorButtonGrayGlowHover', '1', 0, properInstance);
                            break;
                        case GTC.Numbers.Two:
                            properInstance._handleCalculatorKeyboardClicks('DivTwo', 'gtc-classDivCalculatorButtonGrayGlowHover', '2', 0, properInstance);
                            break;
                        case GTC.Numbers.Three:
                            properInstance._handleCalculatorKeyboardClicks('DivThree', 'gtc-classDivCalculatorButtonGrayGlowHover', '3', 0, properInstance);
                            break;
                        case GTC.Numbers.Four:
                            properInstance._handleCalculatorKeyboardClicks('DivFour', 'gtc-classDivCalculatorButtonGrayGlowHover', '4', 0, properInstance);
                            break;
                        case GTC.Numbers.Five:
                            properInstance._handleCalculatorKeyboardClicks('DivFive', 'gtc-classDivCalculatorButtonGrayGlowHover', '5', 0, properInstance);
                            break;
                        case GTC.Numbers.Six:
                            properInstance._handleCalculatorKeyboardClicks('DivSix', 'gtc-classDivCalculatorButtonGrayGlowHover', '6', 0, properInstance);
                            break;
                        case GTC.Numbers.Seven:
                            properInstance._handleCalculatorKeyboardClicks('DivSeven', 'gtc-classDivCalculatorButtonGrayGlowHover', '7', 0, properInstance);
                            break;
                        case GTC.Numbers.Eight:
                            properInstance._handleCalculatorKeyboardClicks('DivEight', 'gtc-classDivCalculatorButtonGrayGlowHover', '8', 0, properInstance);
                            break;
                        case GTC.Numbers.Nine:
                            properInstance._handleCalculatorKeyboardClicks('DivNine', 'gtc-classDivCalculatorButtonGrayGlowHover', '9', 0, properInstance);
                            break;
                        case GTC.Keypad.Zero:
                            properInstance._handleCalculatorKeyboardClicks('DivZero', 'gtc-classDivCalculatorButtonGrayGlowHover', '0', 0, properInstance);
                            break;
                        case GTC.Keypad.One:
                            properInstance._handleCalculatorKeyboardClicks('DivOne', 'gtc-classDivCalculatorButtonGrayGlowHover', '1', 0, properInstance);
                            break;
                        case GTC.Keypad.Two:
                            properInstance._handleCalculatorKeyboardClicks('DivTwo', 'gtc-classDivCalculatorButtonGrayGlowHover', '2', 0, properInstance);
                            break;
                        case GTC.Keypad.Three:
                            properInstance._handleCalculatorKeyboardClicks('DivThree', 'gtc-classDivCalculatorButtonGrayGlowHover', '3', 0, properInstance);
                            break;
                        case GTC.Keypad.Four:
                            properInstance._handleCalculatorKeyboardClicks('DivFour', 'gtc-classDivCalculatorButtonGrayGlowHover', '4', 0, properInstance);
                            break;
                        case GTC.Keypad.Five:
                            properInstance._handleCalculatorKeyboardClicks('DivFive', 'gtc-classDivCalculatorButtonGrayGlowHover', '5', 0, properInstance);
                            break;
                        case GTC.Keypad.Six:
                            properInstance._handleCalculatorKeyboardClicks('DivSix', 'gtc-classDivCalculatorButtonGrayGlowHover', '6', 0, properInstance);
                            break;
                        case GTC.Keypad.Seven:
                            properInstance._handleCalculatorKeyboardClicks('DivSeven', 'gtc-classDivCalculatorButtonGrayGlowHover', '7', 0, properInstance);
                            break;
                        case GTC.Keypad.Eight:
                            properInstance._handleCalculatorKeyboardClicks('DivEight', 'gtc-classDivCalculatorButtonGrayGlowHover', '8', 0, properInstance);
                            break;
                        case GTC.Keypad.Nine:
                            properInstance._handleCalculatorKeyboardClicks('DivNine', 'gtc-classDivCalculatorButtonGrayGlowHover', '9', 0, properInstance);
                            break;
                        case GTC.Keypad.Plus:
                            properInstance._handleCalculatorKeyboardClicks('DivAdd', 'gtc-classDivCalculatorButtonOrangeGlowHover', ' + ', 1, properInstance);
                            break;
                        case GTC.Keypad.Minus:
                            properInstance._handleCalculatorKeyboardClicks('DivSub', 'gtc-classDivCalculatorButtonOrangeGlowHover', ' - ', 1, properInstance);
                            break;
                        case GTC.Keypad.Multiply:
                            properInstance._handleCalculatorKeyboardClicks('DivMulti', 'gtc-classDivCalculatorButtonOrangeGlowHover', ' * ', 1, properInstance);
                            break;
                        case GTC.Keypad.Divide:
                            properInstance._handleCalculatorKeyboardClicks('DivDivis', 'gtc-classDivCalculatorButtonOrangeGlowHover', ' / ', 1, properInstance);
                            break;
                        case GTC.Keyboard.Period:
                            properInstance._handleCalculatorKeyboardClicks('DivDeci', 'gtc-classDivCalculatorButtonGrayGlowHover', '.', 1, properInstance);
                            break;
                        case GTC.Keypad.Decimal:
                            properInstance._handleCalculatorKeyboardClicks('DivDeci', 'gtc-classDivCalculatorButtonGrayGlowHover', '.', 1, properInstance);
                            break;
                        case GTC.Keyboard.Enter:
                            properInstance._handleCalculatorEqualClicks('DivEqual', 'gtc-classDivCalculatorButtonGreenGlowHover', properInstance);
                            var currentCalculatedValue = Common.Get('InputCalcMathLine').value;
                            if (!isNaN(currentCalculatedValue) && currentCalculatedValue.length > 0) {
                                properInstance._setCalculatedValue(currentCalculatedValue, properInstance);
                            }
                            Events.Off(document, 'keydown.calculatorKeyboardClicks');
                            Events.Off(document.body, 'click.calculatorCloseOnBodyClick');
                            Velocity(Common.Get('DivCalculator'), 'fadeOut', 400,
                                function () {
                                    Events.Trigger(properInstance.element, 'focus');
                                    properInstance._adjustHeightOnClose();
                                }
                            );
                            break;
                        case GTC.Keyboard.Equal:
                            properInstance._handleCalculatorEqualClicks('DivEqual', 'gtc-classDivCalculatorButtonGreenGlowHover', properInstance);
                            break;
                    }
                }
            );

        },

        _handleCalculatorKeyboardClicks: function (elementId, manipulateClass, calcValue, calcValueInt, thisWidget) {

            var element = Common.Get(elementId);
            Common.AddClass(element, manipulateClass);
            if (Common.Get('InputCalcMathLine') != document.activeElement) {
                thisWidget._appendCalcValue(calcValue, calcValueInt);
            }
            setTimeout(
                function () {
                    Common.RemoveClass(element, manipulateClass);
                }, 200
            );

        },

        _handleCalculatorEqualClicks: function (elementId, manipulateClass, thisWidget) {

            var element = Common.Get(elementId);
            Common.AddClass(element, manipulateClass);
            thisWidget._doCalculation();
            setTimeout(
                function () {
                    Common.RemoveClass(element, manipulateClass);
                }, 200
            );

        },

        _bindCalculatorCloseOnBodyClickEvent: function () {

            var thisWidget = this;
            Events.On(document.body, 'click.calculatorCloseOnBodyClick.DivCalculator',
                function (event) {
                    var eventTarget = event.target;
                    if (Common.IsNotDefined(Common.Closest('#DivCalculator', eventTarget)) && Common.GetAttr(eventTarget, 'class') != 'gtc-input-calendar') {
                        Events.Off(document.body, 'click.calculatorCloseOnBodyClick');
                        Events.Off(document, 'keydown.calculatorKeyboardClicks');
                        Velocity(Common.Get('DivCalculator'), 'fadeOut', 400,
                            function () {
                                var properInstance = thisWidget._loadProperInstance();
                                Events.Trigger(properInstance.element, 'focus');
                                thisWidget._adjustHeightOnClose();
                            }
                        );
                    }
                }
            );

        },

        _adjustHeightOnClose: function () {

            // Initialize
            var thisWidget = this;

            // Adjust Height if it was added
            if (thisWidget.IsHeightIncreased) {
                thisWidget.IsHeightIncreased = false;
                if (Common.IsModal()) {
                    var modalCalculator = window.parent.Common.Query('.gtc-modal-iframe', null, true);
                    var newHeight = Common.Height(modalCalculator.parentNode) - thisWidget.HeightIncrease;
                    modalCalculator.parentNode.style.height = newHeight + 'px';
                }
                else {
                    var parentElement = Common.Get(thisWidget.options.ParentElement);
                    var newHeight = Common.Height(parentElement) - thisWidget.HeightIncrease;
                    parentElement.style.height = newHeight + 'px';
                }
            }

        },

        _bindCalculatorOpenEvent: function () {

            var thisWidget = this;

            // Handle Events
            Events.On(Common.Get('AnchorOpenCalculator-' + thisWidget.element.name), 'click.calculatorOpenAnchor',
                function (event) {
                    event.preventDefault();

                    // Remove this event immediately in case a previous field had calculator open before events could be removed
                    Events.Off(document.body, 'click.calculatorCloseOnBodyClick');

                    // Check if in modal and if resizing
                    if (Common.IsModal() && Common.IsDefined(Common.Query('body.gtc-modal-resizing'))) {
                        return;
                    }
                    var divCalculator = Common.Get('DivCalculator');
                    var thisPrev = Common.GetSibling(this, Common.SiblingType.Previous);
                    var thisPrevParent = thisPrev.parentNode;
                    Cache.Set(divCalculator, 'currentElement', thisPrev.name);
                    Common.Get('InputCalcMathLine').value = '';
                    var coords = Common.Offset(thisPrev);
                    var divCalculatorStyle = divCalculator.style;
                    divCalculatorStyle.top = (coords.top + Common.Height(thisPrevParent)) + 'px';
                    divCalculatorStyle.left = coords.left + 'px';
                    Velocity(divCalculator, 'fadeIn', 400,
                        function () {
                            thisWidget._bindCalculatorCloseOnBodyClickEvent();
                        }
                    );

                    // Adjust screen height if needed
                    var calculatorDisplayHeight = Common.Height(divCalculator, true);
                    var parentElement = Common.Get(thisWidget.options.ParentElement);
                    if (Common.IsDefined(parentElement) && !Common.IsModal()) {
                        var parentElementHeight = Common.Height(parentElement);
                        var containerElementHeight = Common.Offset(parentElement).top + parentElementHeight;
                        var calculatorHeight = Common.Offset(divCalculator).top + calculatorDisplayHeight + 10;
                        if (calculatorHeight > containerElementHeight && containerElementHeight > 0) {
                            thisWidget.IsHeightIncreased = true;
                            thisWidget.HeightIncrease = calculatorHeight - containerElementHeight;
                            parentElement.style.height = (parentElementHeight + thisWidget.HeightIncrease) + 'px';
                        }
                    }
                    else if (Common.IsModal()) {
                        var modalCalculatorParent = window.parent.Common.Query('.gtc-modal-iframe', null, true).parentNode;
                        var modalCalculatorParentOffset = Common.Offset(modalCalculatorParent);
                        var modalBottom = Common.Height(modalCalculatorParent, true) + modalCalculatorParentOffset.top;
                        var calculatorBottom = calculatorDisplayHeight + Common.Offset(thisPrevParent).top + coords.top + Common.Height(thisPrevParent) + modalCalculatorParentOffset.top;
                        if (calculatorBottom > modalBottom) {
                            thisWidget.IsHeightIncreased = true;
                            thisWidget.HeightIncrease = calculatorBottom - modalBottom + (calculatorDisplayHeight * 2);
                            var modalCalculatorParentHeight = Common.Height(modalCalculatorParent);
                            modalCalculatorParent.style.height = (modalCalculatorParentHeight + thisWidget.HeightIncrease) + 'px';
                        }
                    }

                    // Bind keyboard clicks
                    thisWidget._bindCalculatorKeyboardClicks();
                }
            );

        },

        _insertOpenCalculatorAnchor: function () {

            var tabIndex = Common.GetAttr(this.element, 'tabindex');
            var tabIndexAttribute = '';
            if (Common.IsDefined(tabIndex) && parseInt(tabIndex, 10) > 0) {
                tabIndexAttribute = ' tabindex="' + tabIndex + '"';
            }
            var anchorName = 'AnchorOpenCalculator-' + this.element.name;
            Common.InsertHTMLString(this.element, Common.InsertType.After, '<a' + tabIndexAttribute + ' class="gtc-input-system" id="' + anchorName + '" aria-haspopup="true"><i class="gtc-icon-styles gtc-icon gtc-icon-calculator"></i><span class="gtc-sr-only" data-translate="OpensSimulatedDialog508">' + Common.TranslateKey('OpensSimulatedDialog508') + '</span></a>');

            // 508 Compliance - Focus In/Focus Out
            var anchor = Common.Get(anchorName);
            Events.On(anchor, 'focusin.' + anchorName,
                function (event) {
                    Events.On(document, 'keyup.' + anchorName,
                        function (event) {
                            var pressedKeyCode = (event.keyCode ? event.keyCode : event.which);
                            if (pressedKeyCode == GTC.Keyboard.Enter) {
                                document.activeElement.blur();
                                var element = Common.Get(anchorName);
                                Events.Trigger(element, 'click');
                            }
                        }
                    );
                }
            );
            Events.On(anchor, 'focusout.' + anchorName,
                function (event) {
                    Events.Off(document, 'keyup.' + anchorName);
                }
            );

        },

        _setCalculatedValue: function (calculatedValue, thisWidget) {

            if (Common.IsFunction(thisWidget.options.UpdateValueCallback)) {
                thisWidget.options.UpdateValueCallback(calculatedValue, thisWidget.element);
            }
            else {
                Common.Get(Cache.Get(Common.Get('DivCalculator'), 'currentElement')).value = calculatedValue;
            }

        },

        _bindSetCalculationButton: function () {

            var thisWidget = this;

            Events.On(Common.Get('DivSetCalculationButton'), 'click.calculatorCalculationButtonClick',
                function (event) {
                    event.preventDefault();
                    var properInstance = thisWidget._loadProperInstance();
                    var currentCalculatedValue = Common.Get('InputCalcMathLine').value;
                    if (!isNaN(currentCalculatedValue) && currentCalculatedValue.length > 0) {
                        properInstance._setCalculatedValue(currentCalculatedValue, properInstance);
                    }
                    Events.Off(document, 'keydown.calculatorKeyboardClicks');
                    Events.Off(document.body, 'click.calculatorCloseOnBodyClick');
                    Velocity(Common.Get('DivCalculator'), 'fadeOut', 400,
                        function () {
                            Events.Trigger(properInstance.element, 'focus');
                            properInstance._adjustHeightOnClose();
                        }
                    );
                }
            );

        },

        _bindCalculatorLineChangeEvent: function () {

            Events.On(Common.Get('InputCalcMathLine'), 'change',
                function (event) {
                    event.preventDefault();
                    this._lineChange();
                }
            );

        },

        _buildCalculator: function () {

            Common.InsertHTMLString(document.body, Common.InsertType.Append, '<div class="gtc-classDivCalculator" id="DivCalculator" style="display: none;"><span class="gtc-sr-only" data-translate="BeginningOfContent508">' + Common.TranslateKey('BeginningOfContent508') + '</span>' + CalculatorGlobals.CalculatorMarkup + '<span class="gtc-sr-only" data-translate="EndOfContent508">' + Common.TranslateKey('EndOfContent508') + '</span></div>');

        },

        _loadProperInstance: function () {

            return Cache.Get(Common.Get(Cache.Get(Common.Get('DivCalculator'), 'currentElement')), 'gtc-calculator');

        },

        _disableControl: function () {

            if (!this.Locked) {
                this.Locked = true;
                Common.SetAttr(this.element, 'disabled', 'disabled');
                Common.SetAttr(this.element, 'tabindex', '-1');
                Common.Get('AnchorOpenCalculator-' + this.element.name).style.display = 'none';
                Common.AddClass(this.element, this.options.ClassCalculatorLocked);
                Common.InsertHTMLString(this.element, Common.InsertType.After, '<span class="gtc-input-system"><i class="gtc-icon-styles fa fa-lock"></i></span>');
            }

        },

        _enableControl: function () {

            if (this.Locked) {
                Common.RemoveAttr(this.element, 'disabled');
                Common.RemoveAttr(this.element, 'data-disabled');
                Common.SetAttr(this.element, 'tabindex', this.FocusIndex);
                Common.Get('AnchorOpenCalculator-' + this.element.name).style.display = 'inline-table';
                Common.RemoveClass(this.element, this.options.ClassCalculatorLocked);
                Common.Remove(Common.GetSibling(this.element, Common.SiblingType.Next));
                this.Locked = false;
            }

        },

        _init: function () {

        },

        _create: function () {

            // Create local properties
            this.Locked = false;

            // Create calendar
            if (!CalculatorGlobals.CalculatorCreated) {
                this._buildCalculator();
                this._bindCalculatorButtonClicks();
                this._bindSetCalculationButton();
                this._bindCalculatorLineChangeEvent();
                CalculatorGlobals.CalculatorCreated = true;
            }

            this.FocusIndex = Common.GetAttr(this.element, 'tabindex');

            // Initialize fields
            this._insertOpenCalculatorAnchor();
            this._bindCalculatorOpenEvent();

            // Disabled?
            var dataDisabled = Common.GetAttr(this.element, 'data-disabled');
            if (dataDisabled == 'true') {
                this._disableControl();
            }

        }

    };

    WidgetFactory.Register('gtc.calculator', CalculatorWidget);

} (window, document, Common, Cache, Events, Velocity));
