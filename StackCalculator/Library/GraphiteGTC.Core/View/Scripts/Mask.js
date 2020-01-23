(function (Mask, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Variables
    Mask.Keyboard = {
        Backspace: 8
    };

    Mask.Number = {
        Zero: 48,
        One: 49,
        Two: 50,
        Three: 51,
        Four: 52,
        Five: 53,
        Six: 54,
        Seven: 55,
        Eight: 56,
        Nine: 57
    };

    // Public methods
    Mask.BuildMaskingOptions = function (maskString) {

        // Initialize
        var maskingOptions = {
        };

        // Type
        maskingOptions.Type = maskString.substr(0, maskString.indexOf('('));

        // Definition
        maskingOptions.Definition = maskString.substring(maskString.indexOf('(') + 1, maskString.length - 1);

        // Masking Options by Type
        switch (maskingOptions.Type) {
            case 'Alphanumeric':
                AlphanumericMask.BuildMaskingOptions(maskingOptions);
                break;
            case 'Date':
                DateMask.BuildMaskingOptions(maskingOptions);
                break;
            case 'Feet':
                FeetMask.BuildMaskingOptions(maskingOptions);
                break;
            case 'Name':
                NameMask.BuildMaskingOptions(maskingOptions);
                break;
            case 'Numeric':
                NumericMask.BuildMaskingOptions(maskingOptions);
                break;
            case 'Signed':
                SignedMask.BuildMaskingOptions(maskingOptions);
                break;
        }
        return maskingOptions;

    };

    Mask.Format = function (rawData, maskingOptions, displayOnly) {

        // Initialize
        var formatResult = {
            Text: '',
            Valid: true
        };

        // Sanity Check
        if (Common.IsNotDefined(rawData) || rawData.length <= 0) {
            return formatResult;
        }

        // Format
        switch (maskingOptions.Type) {
            case 'Alphanumeric':
                AlphanumericMask.Format(rawData, maskingOptions, formatResult);
                break;
            case 'Date':
                DateMask.Format(rawData, maskingOptions, formatResult);
                break;
            case 'Feet':
                FeetMask.Format(rawData, maskingOptions, formatResult);
                break;
            case 'Name':
                NameMask.Format(rawData, maskingOptions, formatResult);
                break;
            case 'Numeric':
                NumericMask.Format(rawData, maskingOptions, formatResult, displayOnly);
                break;
            case 'Signed':
                SignedMask.Format(rawData, maskingOptions, formatResult, displayOnly);
                break;
        }
        return formatResult;

    };

    Mask.OnKeyPress = function (event) {

        // Navigation Keys
        if (IsNavigationKey(event)) {
            return;
        }

        // Prevent Default
        event.preventDefault();

        // Field Detail
        var fieldDetail = Mask.FieldDetail(event);
        var eventTarget = event.target;

        // Key Press
        var maskingOptions = JSON.parse(Common.GetAttr(eventTarget, 'data-mask'));
        switch (maskingOptions.Type) {
            case 'Alphanumeric':
                AlphanumericMask.OnKeyPress(fieldDetail, maskingOptions);
                break;
            case 'Date':
                DateMask.OnKeyPress(fieldDetail, maskingOptions);
                break;
            case 'Feet':
                FeetMask.OnKeyPress(fieldDetail, maskingOptions);
                break;
            case 'Name':
                NameMask.OnKeyPress(fieldDetail, maskingOptions);
                break;
            case 'Numeric':
                NumericMask.OnKeyPress(fieldDetail, maskingOptions);
                break;
            case 'Signed':
                SignedMask.OnKeyPress(fieldDetail, maskingOptions);
                break;
        }

    };

    Mask.OnFocusOut = function (event) {

        // Initialize
        var eventTarget = event.target;
        var onFocusOut = {
            EventTarget: eventTarget,
            HasChanged: true,
            GoodData: false,
            RawData: Common.GetAttr(eventTarget, 'data-raw')
        };

        // Process Focus Out
        var maskingOptions = JSON.parse(Common.GetAttr(eventTarget, 'data-mask'));
        switch (maskingOptions.Type) {
            case 'Alphanumeric':
                AlphanumericMask.OnFocusOut(maskingOptions, onFocusOut);
                break;
            case 'Date':
                DateMask.OnFocusOut(maskingOptions, onFocusOut);
                break;
            case 'Feet':
                FeetMask.OnFocusOut(maskingOptions, onFocusOut);
                break;
            case 'Name':
                NameMask.OnFocusOut(maskingOptions, onFocusOut);
                break;
            case 'Numeric':
                NumericMask.OnFocusOut(maskingOptions, onFocusOut);
                break;
            case 'Signed':
                SignedMask.OnFocusOut(maskingOptions, onFocusOut);
                break;
        }
        if (!onFocusOut.HasChanged) {
            return;
        }
        if (!onFocusOut.GoodData) {
            event.preventDefault();
            event.stopPropagation();
            Form.AddMaskingError(eventTarget);

            var browserType = Common.GetBrowser();
            if (browserType.length > 0 && browserType[0] == 'Firefox') {
                setTimeout(
                    function () {
                        eventTarget.focus();
                    }, 10
                );
            }
        }
        else {
            if (Common.HasClass(eventTarget, 'gtc-failed-masking-validation')) {
                Form.RemoveMaskingError(eventTarget);
            }

            // Trigger special change event to (Slider Field)
            if (Common.HasAttr(eventTarget, 'data-specialchange')) {
                Events.Trigger(eventTarget, 'specialchange');
                return;
            }

            // Trigger change event for fields with Mask (if OnChange exists)
            if (Common.HasAttr(eventTarget, 'data-change')) {
                var namespace = Common.GetAttr(eventTarget, 'data-namespace');
                window[namespace].OnChange.call(eventTarget);
                Common.SetAttr(eventTarget, 'data-haschanged', 'Yes');
            }
            else {
                var changeEvent = document.createEvent('HTMLEvents');
                changeEvent.initEvent('change', true, false);
                eventTarget.dispatchEvent(changeEvent);
            }
        }

    };

    // Internal Public Functions
    Mask.GetCaretPosition = function (inputField) {

        var caretPosition = 0;
        if ('selectionStart' in inputField) {
            caretPosition = inputField.selectionStart;
        }
        else {
            if ('selection' in document) {
                inputField.focus();
                var selectionRange = document.selection.createRange();
                var selectionLength = document.selection.createRange().text.length;
                selectionRange.moveStart('character', -inputField.value.length);
                caretPosition = selectionRange.text.length - selectionLength;
            }
        }
        return caretPosition;

    };

    Mask.SetCaretPosition = function (inputField, caretPosition) {

        if (Common.IsFunction(inputField.setSelectionRange)) {
            inputField.setSelectionRange(caretPosition, caretPosition);
        }
        else {
            if (Common.IsFunction(inputField.createTextRange)) {
                var textRange = inputField.createTextRange();
                textRange.collapse(true);
                textRange.moveEnd('character', caretPosition);
                textRange.moveStart('character', caretPosition);
                textRange.select();
            }
        }

    };

    Mask.GetInputText = function (inputField) {

        // Get values
        var thisText = inputField.value;

        // Check for selection
        if (inputField.selectionStart != inputField.selectionEnd) {
            thisText = thisText.substr(0, inputField.selectionStart) + thisText.substring(inputField.selectionEnd);
        }
        return thisText;

    };

    Mask.SetInputText = function (inputField, leftOfCaret, rightOfCaret) {

        inputField.value = leftOfCaret + rightOfCaret;
        Mask.SetCaretPosition(inputField, leftOfCaret.length);

    };

    Mask.FieldDetail = function (event) {

        // Initialize
        var fieldDetail = {};
        fieldDetail.HtmlInputField = event.target;
        fieldDetail.KeyCode = event.which;
        fieldDetail.KeyPressed = String.fromCharCode(event.which);
        fieldDetail.Text = Mask.GetInputText(event.target);
        fieldDetail.TextLength = fieldDetail.Text.length;

        // Left of caret, Right of caret
        fieldDetail.LeftOfCaret = '';
        fieldDetail.RightOfCaret = '';
        fieldDetail.CaretPosition = Mask.GetCaretPosition(event.target);
        if (fieldDetail.CaretPosition == fieldDetail.TextLength) {
            fieldDetail.LeftOfCaret = fieldDetail.Text;
            fieldDetail.RightOfCaret = '';
        }
        else {
            fieldDetail.LeftOfCaret = fieldDetail.Text.slice(0, fieldDetail.CaretPosition);
            fieldDetail.RightOfCaret = fieldDetail.Text.slice(fieldDetail.CaretPosition, fieldDetail.TextLength);
        }
        fieldDetail.LeftOfCaretLength = fieldDetail.LeftOfCaret.length;
        fieldDetail.RightOfCaretLength = fieldDetail.RightOfCaret.length;
        return fieldDetail;

    };

    Mask.CheckValidation = function (field) {

        // Initialize
        var onFocusOut = {
            EventTarget: field,
            HasChanged: true,
            GoodData: false,
            RawData: Common.GetAttr(field, 'data-raw')
        };

        // Check Validation
        var maskingOptions = JSON.parse(Common.GetAttr(field, 'data-mask'));
        var validationResult = true;
        switch (maskingOptions.Type) {
            case 'Alphanumeric':
                validationResult = AlphanumericMask.CheckValidation(maskingOptions, onFocusOut);
                break;
            case 'Date':
                validationResult = DateMask.CheckValidation(maskingOptions, onFocusOut);
                break;
            case 'Feet':
                validationResult = FeetMask.CheckValidation(maskingOptions, onFocusOut);
                break;
            case 'Name':
                validationResult = NameMask.CheckValidation(maskingOptions, onFocusOut);
                break;
            case 'Numeric':
                validationResult = NumericMask.CheckValidation(maskingOptions, onFocusOut);
                break;
            case 'Signed':
                validationResult = SignedMask.CheckValidation(maskingOptions, onFocusOut);
                break;
        }
        return validationResult;

    };

    // Private Methods
    function IsNavigationKey (event) {

        if (event.which == 0 || event.which == Mask.Keyboard.Backspace) {
            return true;
        }
        if (event.ctrlKey) {
            return true;
        }
        if (event.altKey) {
            return true;
        }
        return false;

    };

} (window.Mask = window.Mask || {}, window, document, Common, Cache, Events, Velocity));

// Alphanumeric Mask
(function (AlphanumericMask, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    AlphanumericMask.BuildMaskingOptions = function (maskingOptions) {

        return maskingOptions;

    };

    AlphanumericMask.Format = function (rawData, maskingOptions, formatResult) {

        formatResult.Text = rawData;
        formatResult.Valid = Validate(formatResult.Text, maskingOptions);

        // Validation failed, attempt to format and retest
        if (!formatResult.Valid) {
            // Raw data length
            var rawDataSize = Common.IsDefined(rawData) ? rawData.length : 0;

            // Initialize array to hold masking definitions that match our raw data length
            var matchingDefinitions = [];

            // Split masking definitions that have mulitple masks within them
            var splitDefinitions = maskingOptions.Definition.split('][');

            // For each masking definition check if it has same character length as raw data
            // If it does remove any extra brackets and add to matching definitions array for later testing
            var index = 0, length = splitDefinitions.length;
            for ( ; index < length; index++) {
                if ((splitDefinitions[index].match(/#|@/g) || []).length == rawDataSize) {
                    splitDefinitions[index] = splitDefinitions[index].replace('[', '').replace(']', '');
                    matchingDefinitions.push(splitDefinitions[index]);
                }
            }

            // For each matching definition attempt to format raw data and test against definition's generated regex
            var currentDefinition;
            index = 0, length = matchingDefinitions.length;
            for ( ; index < length; index++) {
                currentDefinition = matchingDefinitions[index];
                var result = '', customCharacters = 0, definitionIndex = 0, definitionLength = currentDefinition.length;
                for ( ; definitionIndex < definitionLength; definitionIndex++) {
                    var currentCharDefinition = matchingDefinitions[index][definitionIndex];
                    if (currentCharDefinition != '#' && currentCharDefinition != '@') {
                        result += currentCharDefinition;
                        customCharacters++;
                    }
                    else {
                        if (currentCharDefinition == '#') {
                            if (/^[0-9]$/.test(rawData[definitionIndex - customCharacters])) {
                                result += rawData[definitionIndex - customCharacters];
                            }
                        }
                        else if (currentCharDefinition == '@') {
                            if (matchingDefinitions[index][definitionIndex + 1] == '<') {
                                if (/^[a-z]$/.test(rawData[definitionIndex - customCharacters])) {
                                    result += rawData[definitionIndex - customCharacters];
                                }
                            }
                            else if (matchingDefinitions[index][definitionIndex + 1] == '>') {
                                if (/^[A-Z]$/.test(rawData[definitionIndex - customCharacters])) {
                                    result += rawData[definitionIndex - customCharacters];
                                }
                            }
                            else {
                                if (/^[A-Za-z]$/.test(rawData[definitionIndex - customCharacters])) {
                                    result += rawData[definitionIndex - customCharacters];
                                }
                            }
                            if (matchingDefinitions[index][definitionIndex + 1] == '<' || matchingDefinitions[index][definitionIndex + 1] == '>') {
                                definitionIndex++;
                                customCharacters++;
                            }
                        }
                    }
                }

                // Retest output
                formatResult.Text = result;
                formatResult.Valid = Validate(formatResult.Text, maskingOptions);
                if (formatResult.Valid) {
                    break;
                }
            }

            // Reset raw data as value if all validations failed
            if (!formatResult.Valid) {
                formatResult.Text = rawData;
            }
        }

    };

    AlphanumericMask.OnKeyPress = function (fieldDetail, maskingOptions) {

        // Allowed Keys (A-Z, a-z, 0-9)
        if ((fieldDetail.KeyPressed >= 'A' && fieldDetail.KeyPressed <= 'z') || (fieldDetail.KeyCode >= Mask.Number.Zero && fieldDetail.KeyCode <= Mask.Number.Nine)) {
            // RegExp arrays
            var regExpArrays = BuildRegExpArrays(maskingOptions.Definition);

            // Pick matching regExpArray and Compare
            var regExpArrayIndex = 0;
            while (regExpArrayIndex < regExpArrays.length) {
                // Pick RegExpArray
                var regExpArray = PickRegExpArray(regExpArrays, regExpArrayIndex, fieldDetail);
                if (Common.IsNotDefined(regExpArray)) {
                    regExpArrayIndex++;
                    continue;
                }
                var maskLength = regExpArray.length;

                // Mask: Non RegExp characters (before the key pressed)
                while (Common.IsString(regExpArray[fieldDetail.LeftOfCaretLength])) {
                    fieldDetail.LeftOfCaret += regExpArray[fieldDetail.LeftOfCaretLength];
                    fieldDetail.LeftOfCaretLength++;
                    if ((fieldDetail.LeftOfCaretLength + fieldDetail.RightOfCaretLength) >= maskLength) {
                        Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
                        return;
                    }
                }

                // Mask: Test RegExp on Key pressed (return if fail)
                if (!regExpArray[fieldDetail.LeftOfCaretLength].test(fieldDetail.KeyPressed)) {
                    if (regExpArray[fieldDetail.LeftOfCaretLength] == '/[A-Z]/') {
                        fieldDetail.KeyPressed = fieldDetail.KeyPressed.toUpperCase();
                        if (!regExpArray[fieldDetail.LeftOfCaretLength].test(fieldDetail.KeyPressed)) {
                            regExpArrayIndex++;
                            continue;
                        }
                    }
                    else if (regExpArray[fieldDetail.LeftOfCaretLength] == '/[a-z]/') {
                        fieldDetail.KeyPressed = fieldDetail.KeyPressed.toLowerCase();
                        if (!regExpArray[fieldDetail.LeftOfCaretLength].test(fieldDetail.KeyPressed)) {
                            regExpArrayIndex++;
                            continue;
                        }
                    }
                    else {
                        regExpArrayIndex++;
                        continue;
                    }
                }

                // Add the key pressed
                fieldDetail.LeftOfCaret += fieldDetail.KeyPressed;
                fieldDetail.LeftOfCaretLength++;
                if ((fieldDetail.LeftOfCaretLength + fieldDetail.RightOfCaretLength) >= maskLength) {
                    Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
                    return;
                }

                // Mask: Non RegExp characters (after the key pressed)
                while (Common.IsString(regExpArray[fieldDetail.LeftOfCaretLength])) {
                    fieldDetail.LeftOfCaret += regExpArray[fieldDetail.LeftOfCaretLength];
                    fieldDetail.LeftOfCaretLength++;
                    if ((fieldDetail.LeftOfCaretLength + fieldDetail.RightOfCaretLength) >= maskLength) {
                        Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
                        return;
                    }
                }

                // Set Text and Caret
                Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
                return;
            }
        }

    };

    AlphanumericMask.OnFocusOut = function (maskingOptions, onFocusOut) {

        // Initialize
        var eventTarget = onFocusOut.EventTarget;
        onFocusOut.GoodData = true;

        // Trim
        var value = eventTarget.value;
        var formattedValue = Common.IsNotDefined(value) ? '' : (value + '').replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

        // Convert to data-raw
        var currentCharDefinition, rawData = formattedValue, index = 0, length = maskingOptions.Definition.length;
        for ( ; index < length; index++) {
            currentCharDefinition = maskingOptions.Definition[index];
            if (currentCharDefinition != '#' && currentCharDefinition != '@') {
                rawData = rawData.replace(currentCharDefinition, '');
            }
        }

        // Has Changed?
        if (onFocusOut.RawData == rawData) {
            onFocusOut.HasChanged = false;
            return;
        }

        // Is Empty?
        if (formattedValue.length <= 0) {
            eventTarget.value = formattedValue;
            Common.SetAttr(eventTarget, 'data-raw', rawData);
            return;
        }

        // Validate and set Text/data-raw
        if (Validate(formattedValue, maskingOptions)) {
            eventTarget.value = formattedValue;
            Common.SetAttr(eventTarget, 'data-raw', rawData);
        }
        else {
            onFocusOut.GoodData = false;
        }

    };

    AlphanumericMask.CheckValidation = function (maskingOptions, onFocusOut) {

        AlphanumericMask.OnFocusOut(maskingOptions, onFocusOut);
        return onFocusOut.GoodData;

    };

    // Private Methods
    function BuildRegExpArrays (maskDefinition) {

        // Initialize and Sanity Check
        var regExpCollection = { '#': '[0-9]', '@': '[A-Za-z]', '@>': '[A-Z]', '@<': '[a-z]' };
        var regExpArrays = [];
        if (Common.IsNotDefined(maskDefinition) || maskDefinition.length <= 0) {
            return regExpArrays;
        }

        // Defintions Array
        var definitionArray = maskDefinition.match(/\[([^\]]+)\]/g);
        if (Common.IsNotDefined(definitionArray)) {
            definitionArray = [];
            definitionArray.push('[' + maskDefinition + ']');
        }

        // Remove Brackets and Convert to RegExp Array
        var defintionValue, index = 0, length = definitionArray.length;
        for ( ; index < length; index++) {
            defintionValue = definitionArray[index];
            var regExpArray = [];
            var thisMaskDefinition = defintionValue.substr(1, defintionValue.length - 2);
            var thisMaskIndex = 0;
            while (thisMaskIndex < thisMaskDefinition.length) {
                var thisMaskKey = thisMaskDefinition.charAt(thisMaskIndex);
                if ((thisMaskIndex + 1) < thisMaskDefinition.length) {
                    var nextChar = thisMaskDefinition.charAt(thisMaskIndex + 1);
                    if (nextChar == '>' || nextChar == '<') {
                        thisMaskKey += nextChar;
                        thisMaskIndex++;
                    }
                }
                var rexExpOrString = (Common.IsNotDefined(regExpCollection[thisMaskKey])) ? thisMaskKey : new RegExp(regExpCollection[thisMaskKey]);
                regExpArray.push(rexExpOrString);
                thisMaskIndex++;
            }
            regExpArrays.push(regExpArray);
        }
        return regExpArrays;

    };

    function PickRegExpArray (regExpArrays, regExpArrayIndex, fieldDetail) {

        // Sanity Check
        if (fieldDetail.TextLength <= 0) {
            return regExpArrays[regExpArrayIndex];
        }

        // Initialize
        var fieldDetailArray = fieldDetail.Text.split('');

        // Pick RegExpArray
        while (regExpArrayIndex < regExpArrays.length) {
            // Pick Masks that are less than the length of the Field Text
            if (fieldDetail.TextLength >= regExpArrays[regExpArrayIndex].length) {
                regExpArrayIndex++;
                continue;
            }
            var regExpMatched = true;
            var fieldDetailChar, fieldDetailIndex = 0, length = fieldDetailArray.length;
            for ( ; fieldDetailIndex < length; fieldDetailIndex++) {
                fieldDetailChar = fieldDetailArray[fieldDetailIndex];
                if (Common.IsString(regExpArrays[regExpArrayIndex][fieldDetailIndex])) {
                    if (regExpArrays[regExpArrayIndex][fieldDetailIndex] != fieldDetailChar) {
                        regExpMatched = false;
                    }
                }
                else if (new RegExp(regExpArrays[regExpArrayIndex][fieldDetailIndex]).test(fieldDetailChar) != true) {
                    regExpMatched = false;
                }
            }
            if (regExpMatched) {
                return regExpArrays[regExpArrayIndex];
            }
            regExpArrayIndex++;
        }
        return null;

    };

    function BuildRegExp (maskDefinition) {

        // Initialize and Sanity Check
        var regExpString = '';
        if (Common.IsNotDefined(maskDefinition) || maskDefinition.length <= 0) {
            return new RegExp(regExpString);
        }

        // Defintions Array
        var definitionArray = maskDefinition.match(/\[([^\]]+)\]/g);
        if (Common.IsNotDefined(definitionArray)) {
            definitionArray = [];
            definitionArray.push('[' + maskDefinition + ']');
        }

        // Convert Mask to RegExp for Validation
        var definitionIndex = 0;
        while (definitionIndex < definitionArray.length) {
            if (regExpString.length > 0) {
                regExpString += '|';
            }
            var thisMaskDefinition = definitionArray[definitionIndex].substr(1, definitionArray[definitionIndex].length - 2);
            regExpString += '^' + thisMaskDefinition.replace(/#/g, '[0-9]').replace(/@>/g, '[A-Z]').replace(/@</g, '[a-z]').replace(/@/g, '[A-Za-z]').replace('(', '\\(').replace(')', '\\)') + '$';
            definitionIndex++;
        }
        return new RegExp(regExpString);

    };

    function Validate (formattedValue, maskingOptions) {

        var regExp = BuildRegExp(maskingOptions.Definition);
        return regExp.test(formattedValue);

    };

} (window.AlphanumericMask = window.AlphanumericMask || {}, window, document, Common, Cache, Events, Velocity));

// Date Mask
(function (DateMask, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var fullDatesRegEx = /(LongDate|longdate|LONGDATE|ShortDate|shortdate|SHORTDATE)/;
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    DateMask.BuildMaskingOptions = function (maskingOptions) {

        // Is a display only full date?
        maskingOptions.IsDisplayOnlyFullDate = fullDatesRegEx.test(maskingOptions.Definition) ? true : false;
        if (maskingOptions.IsDisplayOnlyFullDate) {
            return maskingOptions;
        }

        // Date Separator
        if (maskingOptions.Definition.indexOf('/') != -1) {
            maskingOptions.DateSeparator = '/';
        }
        else if (maskingOptions.Definition.indexOf('-') != -1) {
            maskingOptions.DateSeparator = '-';
        }
        else if (maskingOptions.Definition.indexOf('.') != -1) {
            maskingOptions.DateSeparator = '.';
        }

        // Check for time
        maskingOptions.IncludeTime = false;
        if (maskingOptions.Definition.indexOf(':') != -1) {
            maskingOptions.IncludeTime = true;
            maskingOptions.TimeSeparator = ':';
            maskingOptions.AllowMeridiem = false;
            maskingOptions.FromUTC = false;
            maskingOptions.TimeType = maskingOptions.Definition.substring(maskingOptions.Definition.indexOf(':') + 1, maskingOptions.Definition.indexOf(':') + 3);
            maskingOptions.DateMaskArray = maskingOptions.Definition.substring(0, maskingOptions.Definition.indexOf(':')).split(maskingOptions.DateSeparator);
            if (maskingOptions.TimeType == '12') {
                maskingOptions.TimeMaskArray = ['Hours', 'Minutes', 'Seconds', 'Meridiem'];
                maskingOptions.AllowMeridiem = true;
            }
            else if (maskingOptions.TimeType == '24') {
                maskingOptions.TimeMaskArray = ['Hours', 'Minutes', 'Seconds'];
            }
            
            // Convert from UTC?
            if (maskingOptions.Definition.indexOf('<') != -1) {
                maskingOptions.FromUTC = (maskingOptions.Definition.substring(maskingOptions.Definition.indexOf('<') + 1) == 'UTC');
            }
        }
        else {
            maskingOptions.DateMaskArray = maskingOptions.Definition.split(maskingOptions.DateSeparator);
        }
        return maskingOptions;

    };

    DateMask.Format = function (rawData, maskingOptions, formatResult) {

        // Sanity Check
        if (rawData.length <= 0) {
            return;
        }

        // Check raw Date string
        if (new RegExp(/\/Date\((-?\d+)\)\//).test(rawData) != true) {
            formatResult.Text = rawData;
            formatResult.Valid = false;
            return;
        }

        // Eval Date
        var evalDateString = rawData.replace(/\/Date\((-?\d+)\)\//, 'new Date($1)');
        var rawDate;
        try {
            rawDate = eval(evalDateString);
            if (maskingOptions.FromUTC) {
                var milliSecondsFrom1970 = Common.RemoveTimezone(rawDate);
                rawDate = new Date(milliSecondsFrom1970);
            }
        }
        catch (evalError) {
            formatResult.Text = rawData;
            formatResult.Valid = false;
            return;
        }

        // Add timezone offset
        rawDate = Common.AddTimezone(rawDate);

        // Is Date?
        if (rawDate.constructor != Date) {
            formatResult.Text = rawData;
            formatResult.Valid = false;
            return;
        }

        // Is display only full date?
        if (maskingOptions.IsDisplayOnlyFullDate) {
            DateMask.FormatFullDate(rawDate, maskingOptions, formatResult);
            return;
        }

        // Build Date Text
        var dateMaskIndex = 0, length = maskingOptions.DateMaskArray.length;
        for ( ; dateMaskIndex < length; dateMaskIndex++) {
            switch (maskingOptions.DateMaskArray[dateMaskIndex]) {
                case 'mm':
                    formatResult.Text += (rawDate.getMonth() + 1).toString();
                    break;
                case 'MM':
                    if ((rawDate.getMonth() + 1) < 10) {
                        formatResult.Text += '0';
                    }
                    formatResult.Text += (rawDate.getMonth() + 1).toString();
                    break;
                case 'dd':
                    formatResult.Text += rawDate.getDate().toString();
                    break;
                case 'DD':
                    if (rawDate.getDate() < 10) {
                        formatResult.Text += '0';
                    }
                    formatResult.Text += rawDate.getDate().toString();
                    break;
                case 'YYYY':
                    formatResult.Text += rawDate.getFullYear().toString();
                    break;
            }
            if (dateMaskIndex < (maskingOptions.DateMaskArray.length - 1)) {
                formatResult.Text += maskingOptions.DateSeparator;
            }
        }

        if (maskingOptions.IncludeTime) {
            var minutes = rawDate.getMinutes();
            var seconds = rawDate.getSeconds();
            var formattedMinutes = (minutes < 10) ? '0' + minutes : minutes;
            var formattedSeconds = (seconds < 10) ? '0' + seconds : seconds;
            if (maskingOptions.TimeType == '12') {
                var hours12 = (rawDate.getHours() + 11) % 12 + 1;
                var formattedHours12 = (hours12 < 10) ? '0' + hours12 : hours12;
                var antePostMeridiem = (rawDate.getHours() >= 12) ? 'PM' : 'AM';
                formatResult.Text += ' ' + formattedHours12 + ':' + formattedMinutes + ':' + formattedSeconds + ' ' + antePostMeridiem;
            }
            else if (maskingOptions.TimeType == '24') {
                var hours24 = rawDate.getHours();
                var formattedHours24 = (hours24 < 10) ? '0' + hours24 : hours24;
                formatResult.Text += ' ' + formattedHours24 + ':' + formattedMinutes + ':' + formattedSeconds;
            }
        }

    };

    DateMask.FormatFullDate = function (rawDate, maskingOptions, formatResult) {

        var dateType = maskingOptions.Definition.replace('Date(', '').replace(')', '');
        switch (dateType) {
            case 'LongDate':
                formatResult.Text = months[rawDate.getMonth()];
                break;
            case 'longdate':
                formatResult.Text = months[rawDate.getMonth()].toLowerCase();
                break;
            case 'LONGDATE':
                formatResult.Text = months[rawDate.getMonth()].toUpperCase();
                break;
            case 'ShortDate':
                formatResult.Text = monthsShort[rawDate.getMonth()];
                break;
            case 'shortdate':
                formatResult.Text = monthsShort[rawDate.getMonth()].toLowerCase();
                break;
            case 'SHORTDATE':
                formatResult.Text = monthsShort[rawDate.getMonth()].toUpperCase();
                break;
        }
        formatResult.Text += ' ' + rawDate.getDate().toString() + ', ' + rawDate.getFullYear().toString();

    };

    DateMask.OnKeyPress = function (fieldDetail, maskingOptions) {

        // Allowed Keys (0-9, Slash/Period/Hyphen/Colon/A/a/P/p/M/m)
        if ((fieldDetail.KeyCode >= Mask.Number.Zero && fieldDetail.KeyCode <= Mask.Number.Nine) || (fieldDetail.KeyPressed == maskingOptions.DateSeparator) || (fieldDetail.KeyPressed == maskingOptions.TimeSeparator) || (maskingOptions.AllowMeridiem && ((fieldDetail.KeyPressed == 'A') || (fieldDetail.KeyPressed == 'a') || (fieldDetail.KeyPressed == 'P') || (fieldDetail.KeyPressed == 'p') || (fieldDetail.KeyPressed == 'M') || (fieldDetail.KeyPressed == 'm')))) {
            // Initialize
            var lastLeftCharacter = fieldDetail.LeftOfCaret.substr(fieldDetail.LeftOfCaret.length - 1, 1);
            var firstRightCharacter = fieldDetail.RightOfCaret.substr(0, 1);
            var dateArray = (fieldDetail.LeftOfCaret + '|' + fieldDetail.RightOfCaret).split(maskingOptions.DateSeparator);

            // Allow Date Separator
            if (fieldDetail.KeyPressed == maskingOptions.DateSeparator) {
                if (fieldDetail.CaretPosition == 0 || lastLeftCharacter == maskingOptions.DateSeparator || firstRightCharacter == maskingOptions.DateSeparator) {
                    return;
                }
                if ((dateArray.length - 1) >= 2) {
                    return;
                }
            }

            // Date Parts
            var datePartEdited = 0, index = 0, length = dateArray.length;
            for ( ; index < length; index++) {
                if ((dateArray[index]).indexOf('|') != -1) {
                    datePartEdited = index;
                }
            }

            // Check if time or date is being masked/formatted
            var dateTimeSplit = fieldDetail.LeftOfCaret.split(' ');
            if (dateArray.length == maskingOptions.DateMaskArray.length && Validate(dateTimeSplit[0], maskingOptions, false) && maskingOptions.IncludeTime) {
                var allowKey = true;
                var addTimeSeparator = false;
                var completeMeridiem = false;
                var timeArray = [];

                // If: hours exist, Else: time just started being typed and need to add index since we split on date separator and not space
                if (dateTimeSplit.length > 1) {
                    // Check if they are editing an existing meridiem and make sure it gets split correctly
                    if (fieldDetail.RightOfCaret == 'M') {
                        timeArray = (dateTimeSplit[1] + maskingOptions.TimeSeparator + '|' + fieldDetail.RightOfCaret).split(maskingOptions.TimeSeparator);
                    }
                    else {
                        timeArray = (dateTimeSplit[1] + '|' + fieldDetail.RightOfCaret).split(maskingOptions.TimeSeparator);
                    }
                }
                else {
                    timeArray.push('|');
                }

                // Time Parts
                var timePartEdited = 0;
                index = 0, length = timeArray.length;
                for ( ; index < length; index++) {
                    if ((timeArray[index]).indexOf('|') != -1) {
                        timePartEdited = index;
                    }
                }

                // Check for complete time and needed meridiem
                if (timeArray.length == 3 && maskingOptions.TimeType == '12' && timeArray[2].length == 3) {
                    timeArray[timePartEdited] = (timeArray[timePartEdited]).replace('|', '');
                    timePartEdited++;
                    timeArray.push('|');
                }

                // Test for valid time section
                switch (maskingOptions.TimeMaskArray[timePartEdited]) {
                    case 'Hours':
                        if (fieldDetail.KeyPressed != maskingOptions.TimeSeparator) {
                            var hour = (timeArray[timePartEdited]).replace('|', fieldDetail.KeyPressed);
                            if (maskingOptions.TimeType == '12') {
                                if (new RegExp(/(^([1-9]|0[1-9]|1[0-2])$)/).test(hour) == false) {
                                    allowKey = false;
                                }
                            }
                            else if (maskingOptions.TimeType == '24') {
                                if (new RegExp(/(^([0-9]|0[0-9]|1[0-9]|2[0-3])$)/).test(hour) == false) {
                                    allowKey = false;
                                }
                            }
                            else {
                                allowKey = false;
                            }
                            if (hour.length == 2 && (timeArray.length - 1) < 2) {
                                addTimeSeparator = true;
                            }
                        }
                        else {
                            if ((timeArray[timePartEdited]).length == 2) {
                                timeArray[timePartEdited] = '0' + timeArray[timePartEdited];
                            }
                        }
                        break;
                    case 'Minutes':
                        if (fieldDetail.KeyPressed != maskingOptions.TimeSeparator) {
                            var minutes = (timeArray[timePartEdited]).replace('|', fieldDetail.KeyPressed);
                            if (new RegExp(/(^([0-9]|0[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])$)/).test(minutes) == false) {
                                allowKey = false;
                            }
                            if (minutes.length == 2 && (timeArray.length - 1) < 2) {
                                addTimeSeparator = true;
                            }
                        }
                        else {
                            if ((timeArray[timePartEdited]).length == 2) {
                                timeArray[timePartEdited] = '0' + timeArray[timePartEdited];
                            }
                        }
                        break;
                    case 'Seconds':
                        if (fieldDetail.KeyPressed != maskingOptions.TimeSeparator) {
                            var seconds = (timeArray[timePartEdited]).replace('|', fieldDetail.KeyPressed);

                            // Remove meridiem part if user went back to edit seconds
                            if (seconds.indexOf(' ') != -1) {
                                seconds = seconds.split(' ')[0];
                            }
                            if (new RegExp(/(^([0-9]|0[0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])$)/).test(seconds) == false) {
                                allowKey = false;
                            }
                        }
                        break;
                    case 'Meridiem':
                        if (maskingOptions.TimeType == '12' && fieldDetail.KeyPressed != maskingOptions.TimeSeparator) {
                            var meridiem = (timeArray[timePartEdited]).replace('|', fieldDetail.KeyPressed);
                            if (new RegExp(/(^(A|a|P|p|M|m|AM|aM|Am|am|PM|pM|Pm|pm)$)/).test(meridiem) == false) {
                                allowKey = false;
                            }
                            else {
                                completeMeridiem = true;
                            }
                        }
                        break;
                }
                if (!allowKey) {
                    return;
                }

                // If adding meridiem remove last index so time separator is not added on array join
                if (completeMeridiem) {
                    timeArray.pop();
                }

                // Split back to LeftCaret and RightCaret
                var dateText = dateTimeSplit[0] + ' ' + timeArray.join(maskingOptions.TimeSeparator);
                fieldDetail.LeftOfCaret = dateText.split('|')[0];
                fieldDetail.LeftOfCaretLength = fieldDetail.LeftOfCaret.length;
                fieldDetail.RightOfCaret = dateText.split('|')[1];
                if (!fieldDetail.RightOfCaret) {
                    fieldDetail.RightOfCaret = '';
                }
                fieldDetail.RightOfCaretLength = fieldDetail.RightOfCaret.length;

                // Add the key pressed and handle meridiem
                if (completeMeridiem) {
                    fieldDetail.LeftOfCaret += ' ';
                    if (fieldDetail.KeyPressed == 'a' || fieldDetail.KeyPressed == 'A') {
                        fieldDetail.LeftOfCaret += 'AM';
                    }
                    else if (fieldDetail.KeyPressed == 'p' || fieldDetail.KeyPressed == 'P') {
                        fieldDetail.LeftOfCaret += 'PM';
                    }
                    else if (fieldDetail.KeyPressed == 'm' || fieldDetail.KeyPressed == 'M') {
                        if (dateTimeSplit.length == 3) {
                            var meridiemCheck = dateTimeSplit[2].toUpperCase();
                            if (meridiemCheck == 'A') {
                                fieldDetail.LeftOfCaret += 'AM';
                            }
                            else if (meridiemCheck == 'P') {
                                fieldDetail.LeftOfCaret += 'PM';
                            }
                        }
                    }
                    fieldDetail.LeftOfCaretLength += 3;
                }
                else {
                    fieldDetail.LeftOfCaret += fieldDetail.KeyPressed;
                    fieldDetail.LeftOfCaretLength++;
                }

                // Add Time Separator?
                if (addTimeSeparator && fieldDetail.RightOfCaret[0] != maskingOptions.TimeSeparator) {
                    fieldDetail.LeftOfCaret += maskingOptions.TimeSeparator;
                    fieldDetail.LeftOfCaretLength++;
                }

                // Set Text and Caret
                Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
            }
            else {
                var allowKey = true;
                var addDateSeparator = false;
                switch (maskingOptions.DateMaskArray[datePartEdited]) {
                    case 'mm':
                        if (fieldDetail.KeyPressed != maskingOptions.DateSeparator) {
                            var mm = (dateArray[datePartEdited]).replace('|', fieldDetail.KeyPressed);
                            if (new RegExp(/(^[1-9]$|^1[012]$)/).test(mm) == false) {
                                allowKey = false;
                            }
                            if (mm.length == 2 && (dateArray.length - 1) < 2) {
                                addDateSeparator = true;
                            }
                        }
                        break;
                    case 'MM':
                        if (fieldDetail.KeyPressed != maskingOptions.DateSeparator) {
                            var MM = (dateArray[datePartEdited]).replace('|', fieldDetail.KeyPressed);
                            if (new RegExp(/(^[0-9]$|^0[1-9]$|^1[012]$)/).test(MM) == false) {
                                allowKey = false;
                            }
                            if (MM.length == 2 && (dateArray.length - 1) < 2) {
                                addDateSeparator = true;
                            }
                        }
                        else {
                            if ((dateArray[datePartEdited]).length == 2) {
                                dateArray[datePartEdited] = '0' + dateArray[datePartEdited];
                            }
                        }
                        break;
                    case 'dd':
                        if (fieldDetail.KeyPressed != maskingOptions.DateSeparator) {
                            var dd = (dateArray[datePartEdited]).replace('|', fieldDetail.KeyPressed);
                            if (new RegExp(/(^[1-9]$|^1[0-9]$|^2[0-9]$|^3[01]$)/).test(dd) == false) {
                                allowKey = false;
                            }
                            if (dd.length == 2 && (dateArray.length - 1) < 2) {
                                addDateSeparator = true;
                            }
                        }
                        break;
                    case 'DD':
                        if (fieldDetail.KeyPressed != maskingOptions.DateSeparator) {
                            var DD = (dateArray[datePartEdited]).replace('|', fieldDetail.KeyPressed);
                            if (new RegExp(/(^[0-9]$|^0[1-9]$|^1[0-9]$|^2[0-9]$|^3[01]$)/).test(DD) == false) {
                                allowKey = false;
                            }
                            if (DD.length == 2 && (dateArray.length - 1) < 2) {
                                addDateSeparator = true;
                            }
                        }
                        else {
                            if ((dateArray[datePartEdited]).length == 2) {
                                dateArray[datePartEdited] = '0' + dateArray[datePartEdited];
                            }
                        }
                        break;
                    case 'YYYY':
                        if (fieldDetail.KeyPressed != maskingOptions.DateSeparator) {
                            var YYYY = (dateArray[datePartEdited]).replace('|', fieldDetail.KeyPressed);

                            // Remove time part
                            if (maskingOptions.IncludeTime && YYYY.indexOf(' ') != -1) {
                                YYYY = YYYY.split(' ')[0];
                            }
                            if (new RegExp(/(^1$|^2$|^19[0-9]{0,1}[0-9]{0,1}$|^20[0-9]{0,1}[0-9]{0,1}$|^21[0-9]{0,1}[0-9]{0,1}$|^22[0-9]{0,1}[0-9]{0,1}$)/).test(YYYY) == false) {
                                allowKey = false;
                            }
                        }
                        break;
                }
                if (!allowKey) {
                    return;
                }

                // Split back to LeftCaret and RightCaret
                var dateText = dateArray.join(maskingOptions.DateSeparator);
                fieldDetail.LeftOfCaret = dateText.split('|')[0];
                fieldDetail.LeftOfCaretLength = fieldDetail.LeftOfCaret.length;
                fieldDetail.RightOfCaret = dateText.split('|')[1];
                fieldDetail.RightOfCaretLength = fieldDetail.RightOfCaret.length;

                // Add the key pressed
                fieldDetail.LeftOfCaret += fieldDetail.KeyPressed;
                fieldDetail.LeftOfCaretLength++;

                // Add Date Separator?
                if (addDateSeparator && fieldDetail.RightOfCaret[0] != maskingOptions.DateSeparator) {
                    fieldDetail.LeftOfCaret += maskingOptions.DateSeparator;
                    fieldDetail.LeftOfCaretLength++;
                }

                // Set Text and Caret
                Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
            }
        }

    };

    DateMask.OnFocusOut = function (maskingOptions, onFocusOut) {

        // Initialize
        var eventTarget = onFocusOut.EventTarget;
        var dateText = eventTarget.value;
        onFocusOut.GoodData = true;

        // Is Empty?
        if (dateText.length <= 0) {
            // Has Changed?
            if (onFocusOut.RawData == '') {
                onFocusOut.HasChanged = false;
                return;
            }

            // Clear data-raw
            eventTarget.value = '';
            Common.SetAttr(eventTarget, 'data-raw', '');
            return;
        }

        // Validate
        onFocusOut.GoodData = Validate(dateText, maskingOptions, true);

        // Convert to data-raw
        if (onFocusOut.GoodData) {
            // Set Day for MM/YYYY to 1
            if (maskingOptions.Definition == 'MM/YYYY') {
                dateText = dateText.replace('/', '/1/');
            }
            else if (maskingOptions.Definition == 'DD/MM/YYYY') {
                // TODO: Solve for all date formats
                dateText = dateText.replace(/([0-9]+)\/([0-9]+)/, '$2/$1');
            }

            // Get Milliseonds from 1970
            var milliSecondsFrom1970 = Date.parse(dateText);

            // Compensate for timezone
            milliSecondsFrom1970 = Common.RemoveTimezone(milliSecondsFrom1970);

            // Build data-raw
            var rawData = '/Date(' + milliSecondsFrom1970.toString() + ')/';

            // Has Changed?
            if (onFocusOut.RawData == rawData) {
                onFocusOut.HasChanged = false;
                return;
            }

            // Set data-raw
            Common.SetAttr(eventTarget, 'data-raw', rawData);
        }

    };

    DateMask.CheckValidation = function (maskingOptions, onFocusOut) {

        DateMask.OnFocusOut(maskingOptions, onFocusOut);
        return onFocusOut.GoodData;

    };

    // Private Methods
    function Validate (formattedDate, maskingOptions, doTimeValidation) {

        // Split date and time
        var dateArray, timeArray;
        if (maskingOptions.IncludeTime && doTimeValidation) {
            if (maskingOptions.TimeType == '12') {
                dateArray = formattedDate.substring(0, formattedDate.indexOf(' ')).split(maskingOptions.DateSeparator);
                timeArray = formattedDate.substring(formattedDate.indexOf(' ') + 1).split(':');
                var antePostMeridiemArray = timeArray.pop().split(' ');
                if (antePostMeridiemArray.length == 2) {
                    timeArray.push(antePostMeridiemArray[0]);
                    timeArray.push(antePostMeridiemArray[1]);
                }
            }
            else if (maskingOptions.TimeType == '24') {
                dateArray = formattedDate.substring(0, formattedDate.indexOf(' ')).split(maskingOptions.DateSeparator);
                timeArray = formattedDate.substring(formattedDate.indexOf(' ') + 1).split(':');
            }
        }
        else {
            dateArray = formattedDate.split(maskingOptions.DateSeparator);
        }

        // Number of Date Parts?
        if (dateArray.length != maskingOptions.DateMaskArray.length) {
            return false;
        }

        // Date Parts
        var yearOfDate, monthOfDate, dayOfDate, index = 0, length = maskingOptions.DateMaskArray.length;
        for ( ; index < length; index++) {
            switch (maskingOptions.DateMaskArray[index]) {
                case 'mm':
                    if (new RegExp(/(^[1-9]$|^1[012]$)/).test(dateArray[index]) == false) {
                        return false;
                    }
                    monthOfDate = parseInt(dateArray[index], 10) - 1;
                    break;
                case 'MM':
                    if (new RegExp(/(^0[1-9]$|^1[012]$)/).test(dateArray[index]) == false) {
                        return false;
                    }
                    monthOfDate = parseInt(dateArray[index], 10) - 1;
                    break;
                case 'dd':
                    if (new RegExp(/(^[1-9]$|^1[0-9]$|^2[0-9]$|^3[01]$)/).test(dateArray[index]) == false) {
                        return false;
                    }
                    dayOfDate = parseInt(dateArray[index], 10);
                    break;
                case 'DD':
                    if (new RegExp(/(^0[1-9]$|^1[0-9]$|^2[0-9]$|^3[01]$)/).test(dateArray[index]) == false) {
                        return false;
                    }
                    dayOfDate = parseInt(dateArray[index], 10);
                    break;
                case 'YYYY':
                    if (new RegExp(/(^19[0-9][0-9]$|^20[0-9][0-9]$|^21[0-9][0-9]$|^22[0-9][0-9]$)/).test(dateArray[index]) == false) {
                        return false;
                    }
                    yearOfDate = parseInt(dateArray[index], 10);
                    break;
                default:
                    return false;
            }
        }

        // Set Day for MM/YYYY to 1
        if (maskingOptions.Definition == 'MM/YYYY') {
            dayOfDate = 1;
        }

        // Days of Month/Leap Year (Date object change Days/Month/Year if passed invalid values)
        var presumedDate = new Date(yearOfDate, monthOfDate, dayOfDate);
        if (presumedDate.getDate() != dayOfDate) {
            return false;
        }
        return true;

    };

} (window.DateMask = window.DateMask || {}, window, document, Common, Cache, Events, Velocity));

// Feet Mask
(function (FeetMask, window, document, Common, Cache, Events, Velocity, undefined) {

    FeetMask.BuildMaskingOptions = function (maskingOptions) {

        // Limits
        var regExpDigit = new RegExp(/[0-9]/);
        var feetInchesArray = maskingOptions.Definition.split(',');
        var feetPortion = feetInchesArray[0];
        if (feetPortion.charAt(0) == '#' && feetPortion.charAt(1) == '{') {
            maskingOptions.FeetLowerLimit = feetPortion.substring(feetPortion.indexOf('{') + 1, feetPortion.indexOf('-'));
            if (!regExpDigit.test(maskingOptions.FeetLowerLimit)) {
                maskingOptions.FeetLowerLimit = '*';
            }
            maskingOptions.FeetUpperLimit = feetPortion.substring(feetPortion.indexOf('-') + 1, feetPortion.indexOf('}'));
            if (!regExpDigit.test(maskingOptions.FeetUpperLimit)) {
                maskingOptions.FeetUpperLimit = '*';
            }
        }
        var inchesPortion = feetInchesArray[1];
        if (inchesPortion.charAt(0) == '#' && inchesPortion.charAt(1) == '{') {
            maskingOptions.InchesLowerLimit = inchesPortion.substring(inchesPortion.indexOf('{') + 1, inchesPortion.indexOf('-'));
            if (!regExpDigit.test(maskingOptions.InchesLowerLimit)) {
                maskingOptions.InchesLowerLimit = '0';
                maskingOptions.InchesLowerLimitDefault = true;
            }
            maskingOptions.InchesUpperLimit = inchesPortion.substring(inchesPortion.indexOf('-') + 1, inchesPortion.indexOf('}'));
            if (!regExpDigit.test(maskingOptions.InchesUpperLimit)) {
                maskingOptions.InchesUpperLimit = '11';
                maskingOptions.InchesUpperLimitDefault = true;
            }
        }
        return maskingOptions;

    };

    FeetMask.Format = function (rawData, maskingOptions, formatResult, displayOnly) {

        // Sanity Check
        if (rawData.length <= 0) {
            return;
        }

        // Validate
        if (!Validate(rawData, maskingOptions, displayOnly)) {
            formatResult.Text = rawData;
            formatResult.Valid = false;
            return;
        }

        // Convert to String
        var feetInchesArray = rawData.split('.');
        var feetPart = feetInchesArray[0];
        var inchesPart = feetInchesArray[1];

        // Replace . with ' and add "
        formatResult.Text = feetPart + '\' ' + inchesPart + '&#34;';

        // Decode &#34;
        var domParser = new DOMParser;
        var domObject = domParser.parseFromString('<!doctype html><body>' + formatResult.Text, 'text/html');
        formatResult.Text = domObject.body.textContent;

    };

    FeetMask.OnKeyPress = function (fieldDetail, maskingOptions) {

        // Allowed Keys (0-9, Single Quote, Double Quote)
        if ((fieldDetail.KeyCode >= Mask.Number.Zero && fieldDetail.KeyCode <= Mask.Number.Nine) || (fieldDetail.KeyPressed == '\'') || (fieldDetail.KeyPressed == '"') || (fieldDetail.KeyCode == GTC.Keyboard.Space)) {
            // Initialize
            var lastLeftCharacter = fieldDetail.LeftOfCaret.substr(fieldDetail.LeftOfCaret.length - 1, 1);
            var firstRightCharacter = fieldDetail.RightOfCaret.substr(0, 1);

            // On space of initial entry add '
            if (fieldDetail.KeyCode == GTC.Keyboard.Space && fieldDetail.RightOfCaret == '' && /^\d$/.test(lastLeftCharacter) && fieldDetail.Text.indexOf('\'') == -1) {
                fieldDetail.LeftOfCaret += '\' ';
                Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
                return;
            }

            // First Character
            if (fieldDetail.KeyPressed == '\'' || fieldDetail.KeyPressed == '"' || fieldDetail.KeyPressed == '0' || fieldDetail.KeyCode == GTC.Keyboard.Space) {
                if (fieldDetail.CaretPosition == 0) {
                    if (fieldDetail.KeyPressed == '0' || fieldDetail.KeyCode == GTC.Keyboard.Space) {
                        if (fieldDetail.TextLength == 0) {
                            if (maskingOptions.FeetLowerLimit == '*' && maskingOptions.FeetUpperLimit == '*') {
                                if (fieldDetail.KeyCode == GTC.Keyboard.Space) {
                                    fieldDetail.KeyPressed = '0';
                                }
                                fieldDetail.LeftOfCaret += fieldDetail.KeyPressed + '\' ';
                                Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
                                return;
                            }
                        }
                        else {
                            if (maskingOptions.FeetLowerLimit == '*' && maskingOptions.FeetUpperLimit == '*' && Common.IsEmptyString(lastLeftCharacter) && firstRightCharacter == '\'') {
                                fieldDetail.LeftOfCaret += fieldDetail.KeyPressed;
                                Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
                                return;
                            }
                        }
                    }
                    return;
                }
            }

            // Handle Single Quote
            if (fieldDetail.KeyPressed == '\'') {
                if (fieldDetail.LeftOfCaret.indexOf('\'') != -1 || fieldDetail.RightOfCaret.indexOf('\'') != -1) {
                    return;
                }
                fieldDetail.LeftOfCaret += fieldDetail.KeyPressed + ' ';
                Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
                return;
            }

            // Handle Double Quote
            if (fieldDetail.KeyPressed == '"') {
                if (fieldDetail.LeftOfCaret.indexOf('"') != -1 || fieldDetail.RightOfCaret.indexOf('"') != -1) {
                    return;
                }
                else {
                    if (lastLeftCharacter == '\'' || lastLeftCharacter == ' ') {
                        return;
                    }
                    else {
                        if (Common.IsNotEmptyString(firstRightCharacter)) {
                            return;
                        }
                        fieldDetail.LeftOfCaret += fieldDetail.KeyPressed;
                        Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
                        return;
                    }
                }
            }

            // Handle Suprious 0s
            if (lastLeftCharacter == '0' && firstRightCharacter == '\'') {
                if (parseFloat(fieldDetail.LeftOfCaret) <= parseFloat(0)) {
                    return;
                }
            }

            // Handle Suprious Inches before Space
            if (lastLeftCharacter == '\'' && firstRightCharacter == ' ') {
                return;
            }

            // Feet and Inches
            var feetAndInches = (fieldDetail.LeftOfCaret + fieldDetail.KeyPressed + fieldDetail.RightOfCaret).replace(' ', '');

            // Inches Lower/Upper Limit Check
            var inchesArray = feetAndInches.replace('"', '').split('\'');
            if (inchesArray.length > 1) {
                if (inchesArray[1].length > 2) {
                    return;
                }
                if (inchesArray[1].length > 1 && inchesArray[1].charAt(0) == '0') {
                    return;
                }
                if (maskingOptions.InchesLowerLimitDefault == true && parseInt(inchesArray[1], 10) < parseFloat(maskingOptions.InchesLowerLimit)) {
                    return;
                }
                else if (maskingOptions.InchesUpperLimitDefault == true && parseInt(inchesArray[1], 10) > parseFloat(maskingOptions.InchesUpperLimit)) {
                    return;
                }
            }

            // Add the key pressed
            fieldDetail.LeftOfCaret += fieldDetail.KeyPressed;
            fieldDetail.LeftOfCaretLength++;

            // Set Text and Caret
            Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
        }

    };

    FeetMask.OnFocusOut = function (maskingOptions, onFocusOut) {

        // Initialize
        var eventTarget = onFocusOut.EventTarget;
        onFocusOut.GoodData = true;

        // Is Empty?
        var rawData = eventTarget.value;
        if (rawData.length <= 0) {
            // Has Changed?
            if (onFocusOut.RawData == '') {
                onFocusOut.HasChanged = false;
                return;
            }

            // Clear data-raw
            eventTarget.value = '';
            Common.SetAttr(eventTarget, 'data-raw', '');
            return;
        }

        // Convert to data-raw
        rawData = rawData.replace('\'', '.');
        if (rawData.indexOf('.') == -1) {
            if (rawData.indexOf('"') != -1) {
                rawData = '0.' + rawData.replace('"', '').replace(' ', '');
            }
            else {
                rawData = rawData.replace(' ', '') + '.0';
            }
        }
        else {
            rawData = rawData.replace('"', '').replace(' ', '');
            if (rawData.charAt(rawData.length - 1) == '.') {
                rawData += '0';
            }
        }

        // Has Changed?
        if (onFocusOut.RawData == rawData) {
            onFocusOut.HasChanged = false;
            return;
        }

        // Validate
        onFocusOut.GoodData = Validate(rawData, maskingOptions);

        // Set Text/data-raw
        if (onFocusOut.GoodData) {
            var formattedValue = rawData.replace('.', '\' ') + '"';
            eventTarget.value = formattedValue;
            Common.SetAttr(eventTarget, 'data-raw', rawData);
        }

    };

    FeetMask.CheckValidation = function (maskingOptions, onFocusOut) {

        FeetMask.OnFocusOut(maskingOptions, onFocusOut);
        return onFocusOut.GoodData;

    };

    // Private Methods
    function Validate (rawData, maskingOptions, displayOnly) {

        // Valid Number?
        if (new RegExp(/^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/).test(rawData) == false) {
            return false;
        }

        // Initialize
        var feetInchesArray = rawData.split('.');
        var feetPart = feetInchesArray[0];
        var inchesPart = feetInchesArray[1];

        // Valid Number?
        if (inchesPart.length > 0) {
            if (new RegExp(/^\d{0,2}$/).test(inchesPart) != true) {
                return false;
            }
        }

        // Inches Lower/Upper Limit Check
        var inchesValue = parseInt(inchesPart, 10);
        if (maskingOptions.InchesLowerLimit != '*' && inchesValue < parseFloat(maskingOptions.InchesLowerLimit)) {
            return false;
        }
        else if (maskingOptions.InchesUpperLimit != '*' && inchesValue > parseFloat(maskingOptions.InchesUpperLimit)) {
            return false;
        }

        // Feet Lower/Upper Limit Check
        var feetValue = parseInt(feetPart, 10);
        if (maskingOptions.FeetLowerLimit != '*' && feetValue < parseFloat(maskingOptions.FeetLowerLimit)) {
            return false;
        }
        else if (maskingOptions.FeetUpperLimit != '*' && feetValue > parseFloat(maskingOptions.FeetUpperLimit)) {
            return false;
        }
        return true;

    };

} (window.FeetMask = window.FeetMask || {}, window, document, Common, Cache, Events, Velocity));


// Name Mask
(function (NameMask, window, document, Common, Cache, Events, Velocity, undefined) {

    NameMask.BuildMaskingOptions = function (maskingOptions) {

        return maskingOptions;

    };

    NameMask.Format = function (rawData, maskingOptions, formatResult) {

        // Raw data length
        var rawDataSize = Common.IsDefined(rawData) ? rawData.length : 0;
        if (rawDataSize <= 0) {
            formatResult.Text = rawData;
            formatResult.Valid = true;
            return;
        }

        // Format
        var lastLeftCharacter = "";
        formatResult.Text = "";
        var index = 0, length = rawDataSize;
        for ( ; index < length; index++) {
            // Capitalize first letter, Capitalize letter after ', Capitalize letter after Space, Capitalize letter after Mc, Capitalize letter after Mac
            if (index == 0 || lastLeftCharacter == '\'' || lastLeftCharacter == ' ' || lastLeftCharacter == '-' || formatResult.Text == 'Mc' || formatResult.Text == 'Mac') {
                formatResult.Text += rawData[index].toUpperCase();
            }
            else {
                formatResult.Text += rawData[index];
            }
            lastLeftCharacter = rawData[index];
        }
        formatResult.Valid = true;

    };

    NameMask.OnKeyPress = function (fieldDetail, maskingOptions) {

        // Allowed Keys (A-Z, a-z, Quote, Space, Hyphen)
        if ((fieldDetail.KeyPressed >= 'A' && fieldDetail.KeyPressed <= 'z') || fieldDetail.KeyPressed == '\'' || fieldDetail.KeyPressed == ' ' || fieldDetail.KeyPressed == '-') {
            // Initialize
            var lastLeftCharacter = fieldDetail.LeftOfCaret.substr(fieldDetail.LeftOfCaret.length - 1, 1);
            var firstRightCharacter = fieldDetail.RightOfCaret.substr(0, 1);

            // Space
            if (fieldDetail.KeyPressed == ' ') {
                // At the begining
                if (fieldDetail.CaretPosition == 0) {
                    return;
                }

                // Consequtive
                if (lastLeftCharacter == ' ' || firstRightCharacter == ' ') {
                    return;
                }
            }

            // Capitalize first letter, Capitalize letter after ', Capitalize letter after Space, Capitalize letter after Mc, Capitalize letter after Mac
            if (fieldDetail.CaretPosition == 0 || lastLeftCharacter == '\'' || lastLeftCharacter == ' ' || lastLeftCharacter == '-' || fieldDetail.LeftOfCaret == 'Mc' || fieldDetail.LeftOfCaret == 'Mac') {
                fieldDetail.KeyPressed = fieldDetail.KeyPressed.toUpperCase();
                fieldDetail.RightOfCaret = fieldDetail.RightOfCaret.slice(0, 1).toLowerCase() + fieldDetail.RightOfCaret.slice(1, fieldDetail.RightOfCaret.length);
            }

            // Quote
            if (fieldDetail.KeyPressed == '\'' || fieldDetail.KeyPressed == ' ' || fieldDetail.KeyPressed == '-') {
                fieldDetail.RightOfCaret = fieldDetail.RightOfCaret.slice(0, 1).toUpperCase() + fieldDetail.RightOfCaret.slice(1, fieldDetail.RightOfCaret.length);
            }

            // Add the key pressed
            fieldDetail.LeftOfCaret += fieldDetail.KeyPressed;

            // Set Text and Caret
            Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
        }

    };

    NameMask.OnFocusOut = function (maskingOptions, onFocusOut) {

        // Initialize
        var eventTarget = onFocusOut.EventTarget;
        onFocusOut.GoodData = true;

        // Convert to data-raw (formatted value)
        var value = eventTarget.value;
        var formattedValue = Common.IsNotDefined(value) ? '' : (value + '').replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

        // Has Changed?
        if (onFocusOut.RawData == formattedValue) {
            onFocusOut.HasChanged = false;
            return;
        }

        // Set Text/data-raw
        eventTarget.value = formattedValue;
        Common.SetAttr(eventTarget, 'data-raw', formattedValue);

    };

    NameMask.CheckValidation = function (maskingOptions, onFocusOut) {

        return true;

    };

} (window.NameMask = window.NameMask || {}, window, document, Common, Cache, Events, Velocity));

// Numeric Mask
(function (NumericMask, window, document, Common, Cache, Events, Velocity, undefined) {

    NumericMask.BuildMaskingOptions = function (maskingOptions) {

        // Initialize
        var maskDefinitionIndex = 0;

        // Currency/Percent Prefix
        maskingOptions.CurrencyPrefix = '';
        maskingOptions.PercentSuffix = '';
        if (maskingOptions.Definition.charAt(maskDefinitionIndex) == '$') {
            maskingOptions.CurrencyPrefix = maskingOptions.Definition.charAt(maskDefinitionIndex);
            maskDefinitionIndex++;
        }
        else if (maskingOptions.Definition.charAt(maskDefinitionIndex) == '%') {
            maskingOptions.PercentSuffix = maskingOptions.Definition.charAt(maskDefinitionIndex);
            maskDefinitionIndex++;
        }

        // Thousands Separator
        maskingOptions.ThousandsSeparator = '';
        if (maskingOptions.Definition.charAt(maskDefinitionIndex) != '-' && maskingOptions.Definition.charAt(maskDefinitionIndex) != '[') {
            maskingOptions.ThousandsSeparator = maskingOptions.Definition.charAt(maskDefinitionIndex);
            maskDefinitionIndex++;
        }

        // Allow Negative
        maskingOptions.AllowNegative = false;
        if (maskingOptions.Definition.charAt(maskDefinitionIndex) == '-') {
            maskingOptions.AllowNegative = true;
            maskDefinitionIndex++;
        }

        // Decimal Separator
        var indexBeforeDecimal = maskingOptions.Definition.indexOf('[', maskingOptions.Definition.indexOf('[') + 1);
        if (indexBeforeDecimal != -1 && maskingOptions.Definition.substr(indexBeforeDecimal - 1, 1) != ']') {
            maskingOptions.DecimalSeparator = maskingOptions.Definition.substr(indexBeforeDecimal - 1, 1);
        }

        // Thousands Lower/Upper Limit
        var regExpDigit = new RegExp(/[0-9]/);
        var thousandsPortion = maskingOptions.Definition.substring(maskingOptions.Definition.indexOf('['), maskingOptions.Definition.indexOf(']') + 1);
        if (thousandsPortion.charAt(1) == '#' && thousandsPortion.charAt(2) == '{') {
            if (thousandsPortion.charAt(3) == '-') {
                maskingOptions.ThousandsLowerLimit = thousandsPortion.substring(thousandsPortion.indexOf('{') + 1, thousandsPortion.lastIndexOf('-'));
                if (!regExpDigit.test(maskingOptions.ThousandsLowerLimit)) {
                    maskingOptions.ThousandsLowerLimit = '*';
                }
                maskingOptions.ThousandsUpperLimit = thousandsPortion.substring(thousandsPortion.lastIndexOf('-') + 1, thousandsPortion.indexOf('}'));
                if (!regExpDigit.test(maskingOptions.ThousandsUpperLimit)) {
                    maskingOptions.ThousandsUpperLimit = '*';
                }
            }
            else {
                maskingOptions.ThousandsLowerLimit = thousandsPortion.substring(thousandsPortion.indexOf('{') + 1, thousandsPortion.indexOf('-'));
                if (!regExpDigit.test(maskingOptions.ThousandsLowerLimit)) {
                    maskingOptions.ThousandsLowerLimit = '*';
                }
                maskingOptions.ThousandsUpperLimit = thousandsPortion.substring(thousandsPortion.indexOf('-') + 1, thousandsPortion.indexOf('}'));
                if (!regExpDigit.test(maskingOptions.ThousandsUpperLimit)) {
                    maskingOptions.ThousandsUpperLimit = '*';
                }
            }
        }

        // Decimal Limit
        var decimalPortion = maskingOptions.Definition.substring(maskingOptions.Definition.indexOf('[', maskingOptions.Definition.indexOf('[') + 1), maskingOptions.Definition.indexOf(']', maskingOptions.Definition.indexOf(']') + 1) + 1);
        if (decimalPortion.charAt(1) == '#') {
            maskingOptions.DecimalLimit = decimalPortion.substring(decimalPortion.indexOf('[') + 1, decimalPortion.indexOf(']')).length;
        }
        else {
            maskingOptions.DecimalLimit = 0;
        }
        return maskingOptions;

    };

    NumericMask.Format = function (rawData, maskingOptions, formatResult, displayOnly) {

        // Sanity Check
        if (rawData.length <= 0) {
            return;
        }

        // Adjust Raw data if % Mask or decimal rounding a display value
        if (maskingOptions.PercentSuffix.length > 0) {
            var percentDecimal = parseFloat('1' + new Array(maskingOptions.DecimalLimit + 1).join('0'));
            rawData = (Math.round((parseFloat(rawData) * parseFloat(100)) * percentDecimal) / percentDecimal).toString();
        }
        else if (displayOnly && maskingOptions.DecimalLimit > 0) {
            rawData = (parseFloat(rawData).toFixed(maskingOptions.DecimalLimit)).toString();
        }

        // Validate
        if (!Validate(rawData, maskingOptions, displayOnly)) {
            formatResult.Text = rawData;
            formatResult.Valid = false;
            return;
        }

        // Format
        formatResult.Text = AdjustDecimalZeros(rawData, maskingOptions);
        if (maskingOptions.DecimalLimit > 0) {
            formatResult.Text = formatResult.Text.replace('.', maskingOptions.DecimalSeparator);
        }
        formatResult.Text = InsertThousandsSeparator(formatResult.Text, maskingOptions);
        formatResult.Text = maskingOptions.CurrencyPrefix + formatResult.Text.replace('-', '') + maskingOptions.PercentSuffix;
        if (parseFloat(rawData) < parseFloat(0)) {
            formatResult.Text = '(' + formatResult.Text + ')';
        }

    };

    NumericMask.OnKeyPress = function (fieldDetail, maskingOptions) {

        // Allowed Keys (0-9, Period/Comma, Hyphen)
        if ((fieldDetail.KeyCode >= Mask.Number.Zero && fieldDetail.KeyCode <= Mask.Number.Nine) ||
            (maskingOptions.DecimalLimit > 0 && fieldDetail.KeyPressed == maskingOptions.DecimalSeparator) ||
            (maskingOptions.AllowNegative == true && fieldDetail.KeyPressed == '-')) {
            // Initialize
            var lastLeftCharacter = fieldDetail.LeftOfCaret.substr(fieldDetail.LeftOfCaret.length - 1, 1);
            var firstRightCharacter = fieldDetail.RightOfCaret.substr(0, 1);
            var rawLeftOfCaret = fieldDetail.LeftOfCaret.replace(maskingOptions.CurrencyPrefix, '').replace('(', '').replace(')', '');

            // Sanity Check
            if (fieldDetail.LeftOfCaretLength > 0 || fieldDetail.RightOfCaretLength > 0) {
                if ((maskingOptions.CurrencyPrefix.length > 0 && firstRightCharacter == maskingOptions.CurrencyPrefix) || lastLeftCharacter == ')' || firstRightCharacter == '(') {
                    return;
                }
            }
            if (fieldDetail.KeyCode >= Mask.Number.Zero && fieldDetail.KeyCode <= Mask.Number.Nine) {
                if (rawLeftOfCaret == '0') {
                    return;
                }
            }

            // Currency prefix
            if (maskingOptions.CurrencyPrefix.length > 0) {
                if (fieldDetail.CaretPosition == 0 || (fieldDetail.CaretPosition == 1 && lastLeftCharacter == '(')) {
                    fieldDetail.LeftOfCaret += maskingOptions.CurrencyPrefix;
                    fieldDetail.LeftOfCaretLength++;
                }
            }

            // Negative Brackets
            if (fieldDetail.KeyPressed == '-') {
                if (fieldDetail.CaretPosition == 0) {
                    if (firstRightCharacter == '(') {
                        return;
                    }
                    fieldDetail.LeftOfCaret = '(' + fieldDetail.LeftOfCaret.replace(/\(/g, '');
                    fieldDetail.LeftOfCaretLength = fieldDetail.LeftOfCaret.length;
                    fieldDetail.RightOfCaret = fieldDetail.RightOfCaret.replace(/\)/g, '') + ')';
                    fieldDetail.RightOfCaretLength = fieldDetail.RightOfCaret.length;
                    Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
                }
                return;
            }

            // Remove Spurious Negative Brackets
            if (maskingOptions.AllowNegative) {
                if (fieldDetail.LeftOfCaret.indexOf('(') == -1) {
                    if (fieldDetail.RightOfCaret.indexOf(')') != -1) {
                        fieldDetail.RightOfCaret = fieldDetail.RightOfCaret.replace(/\)/g, '');
                        fieldDetail.RightOfCaretLength = fieldDetail.RightOfCaret.length;
                    }
                }
                if (fieldDetail.RightOfCaret.indexOf(')') == -1) {
                    if (fieldDetail.LeftOfCaret.indexOf('(') != -1) {
                        fieldDetail.LeftOfCaret = fieldDetail.LeftOfCaret.replace(/\(/g, '');
                        fieldDetail.LeftOfCaretLength = fieldDetail.LeftOfCaret.length;
                    }
                }
            }

            // Preceding Zero
            if (fieldDetail.KeyPressed == '0') {
                if (fieldDetail.LeftOfCaret.indexOf('.') == -1) {
                    if (rawLeftOfCaret == '0' || (Common.IsEmptyString(rawLeftOfCaret) && fieldDetail.RightOfCaretLength > 0 && fieldDetail.RightOfCaret != ')')) {
                        return;
                    }
                }
            }

            // Decimal Separator
            if (fieldDetail.KeyPressed == maskingOptions.DecimalSeparator) {
                if (fieldDetail.LeftOfCaret.indexOf(maskingOptions.DecimalSeparator) != -1 || fieldDetail.RightOfCaret.indexOf(maskingOptions.DecimalSeparator) != -1) {
                    return;
                }
                else {
                    if (fieldDetail.RightOfCaret.length > maskingOptions.DecimalLimit) {
                        return;
                    }
                }
                if (Common.IsEmptyString(lastLeftCharacter) || lastLeftCharacter == maskingOptions.CurrencyPrefix || lastLeftCharacter == '(') {
                    fieldDetail.LeftOfCaret += '0';
                    fieldDetail.LeftOfCaretLength++;
                }
            }

            // Decimal Limit
            if (fieldDetail.LeftOfCaret.indexOf(maskingOptions.DecimalSeparator) != -1) {
                var decimalLength = ((fieldDetail.LeftOfCaret + fieldDetail.RightOfCaret.replace(/\)/g, '').replace('%', '')).split(maskingOptions.DecimalSeparator)[1]).length;
                if (decimalLength >= maskingOptions.DecimalLimit) {
                    return;
                }
            }

            // Add the key pressed
            fieldDetail.LeftOfCaret += fieldDetail.KeyPressed;
            fieldDetail.LeftOfCaretLength++;

            // Thousands Separator
            if (maskingOptions.ThousandsSeparator.length > 0) {
                // Insert Thousands Separator (with caret position indicated by |)
                var thisText = fieldDetail.LeftOfCaret + '|' + fieldDetail.RightOfCaret;
                thisText = InsertThousandsSeparator(thisText, maskingOptions);

                // Split to Left and Right of Caret
                fieldDetail.LeftOfCaret = thisText.split('|')[0];
                fieldDetail.LeftOfCaretLength = fieldDetail.LeftOfCaret.length;
                fieldDetail.RightOfCaret = thisText.split('|')[1];
                fieldDetail.RightOfCaretLength = fieldDetail.RightOfCaret.length;
            }

            // Set Text and Caret
            Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
        }

    };

    NumericMask.OnFocusOut = function (maskingOptions, onFocusOut) {

        // Initialize
        var eventTarget = onFocusOut.EventTarget;
        onFocusOut.GoodData = true;

        // Convert to data-raw (Strip to Digits)
        var rawData = eventTarget.value;
        if (maskingOptions.CurrencyPrefix.length > 0) {
            rawData = rawData.replace(maskingOptions.CurrencyPrefix, '');
        }
        if (maskingOptions.PercentSuffix.length > 0) {
            rawData = rawData.replace(maskingOptions.PercentSuffix, '');
        }
        if (maskingOptions.ThousandsSeparator.length > 0) {
            rawData = rawData.replace(new RegExp(maskingOptions.ThousandsSeparator.replace(/\./g, '\\.'), 'g'), '');
        }
        if (maskingOptions.AllowNegative) {
            var negativeSign = '';
            if (rawData.substr(0, 1) == '(' && rawData.substr(rawData.length - 1, 1) == ')') {
                negativeSign = '-';
            }
            rawData = rawData.replace(/\(/g, '').replace(/\)/g, '');
            if (rawData.length > 0) {
                rawData = negativeSign + rawData;
            }
        }
        if (maskingOptions.DecimalLimit > 0) {
            rawData = rawData.replace(maskingOptions.DecimalSeparator, '.');
        }

        // Is Empty?
        if (rawData.length <= 0) {
            // Has Changed?
            if (onFocusOut.RawData == '') {
                onFocusOut.HasChanged = false;
                return;
            }

            // Clear data-raw
            eventTarget.value = '';
            Common.SetAttr(eventTarget, 'data-raw', '');
            return;
        }

        // Has Changed?
        if (parseFloat(onFocusOut.RawData) == parseFloat(rawData)) {
            onFocusOut.HasChanged = false;
            return;
        }

        // Validate
        onFocusOut.GoodData = Validate(rawData, maskingOptions);

        // Set data-raw
        if (onFocusOut.GoodData) {
            // Reformat
            var formattedValue = AdjustDecimalZeros(rawData, maskingOptions);
            if (maskingOptions.DecimalLimit > 0) {
                formattedValue = formattedValue.replace('.', maskingOptions.DecimalSeparator);
            }
            formattedValue = InsertThousandsSeparator(formattedValue, maskingOptions);
            formattedValue = maskingOptions.CurrencyPrefix + formattedValue.replace('-', '') + maskingOptions.PercentSuffix;
            if (parseFloat(rawData) < parseFloat(0)) {
                formattedValue = '(' + formattedValue + ')';
            }

            // Divide by 100 (to the right decimal length) if % Mask
            if (maskingOptions.PercentSuffix.length > 0) {
                var percentDecimal;
                if (maskingOptions.DecimalLimit == 0) {
                    // Handles proper conversion of no allowed decimals since any percentage needs decimal to 100th position.
                    percentDecimal = 100;
                }
                else if (maskingOptions.DecimalLimit == 1) {
                    // Handles proper conversion of a single allowed decimal
                    percentDecimal = 1000;
                }
                else {
                    percentDecimal = parseFloat('1' + new Array((maskingOptions.DecimalLimit * 2) + 1).join('0'));
                }
                rawData = (Math.round((parseFloat(rawData) / parseFloat(100)) * percentDecimal) / percentDecimal).toString();
            }

            // Has Changed?
            if (parseFloat(onFocusOut.RawData) == parseFloat(rawData)) {
                onFocusOut.HasChanged = false;
                return;
            }

            // Set Text/data-raw
            eventTarget.value = formattedValue;
            Common.SetAttr(eventTarget, 'data-raw', rawData);
        }

    };

    NumericMask.CheckValidation = function (maskingOptions, onFocusOut) {

        NumericMask.OnFocusOut(maskingOptions, onFocusOut);
        return onFocusOut.GoodData;

    };

    // Private Methods
    function AdjustDecimalZeros (rawData, maskingOptions) {

        // Sanity Check
        if (maskingOptions.DecimalLimit <= 0) {
            if (rawData.indexOf('.') != -1) {
                rawData = rawData.substring(0, rawData.indexOf('.'));
            }
            return rawData;
        }

        // Integer/Decimal Part
        var integerPart = '';
        var decimalPart = '';
        if (rawData.indexOf('.') != -1 && maskingOptions.DecimalLimit > 0) {
            integerPart = rawData.substring(0, rawData.indexOf('.'));
            decimalPart = rawData.substr(rawData.indexOf('.'), rawData.length);
        }
        else {
            integerPart = rawData.substr(0, rawData.length);
            decimalPart = '.';
        }

        // Adjust Zeros
        if ((decimalPart.length - 1) > maskingOptions.DecimalLimit) {
            // Truncate Zeros
            decimalPart = decimalPart.substr(0, maskingOptions.DecimalLimit + 1);
        }
        else {
            // Zeros to Add
            var zerosToAdd = '', decimalIndex = (decimalPart.length - 1);
            for ( ; decimalIndex < maskingOptions.DecimalLimit; decimalIndex++) {
                zerosToAdd += '0';
            }
            decimalPart += zerosToAdd;
        }
        return integerPart + decimalPart;

    };

    function InsertThousandsSeparator (fieldText, maskingOptions) {

        // Integer/Decimal Part
        var integerPart = '';
        var decimalPart = '';
        if (fieldText.indexOf(maskingOptions.DecimalSeparator) != -1 && maskingOptions.DecimalLimit > 0) {
            integerPart = fieldText.substring(0, fieldText.indexOf(maskingOptions.DecimalSeparator));
            decimalPart = fieldText.substr(fieldText.indexOf(maskingOptions.DecimalSeparator), fieldText.length);
        }
        else {
            integerPart = fieldText.substr(0, fieldText.length);
        }

        // Add Thousands Separator
        integerPart = integerPart.replace(new RegExp(maskingOptions.ThousandsSeparator.replace(/\./g, '\\.'), 'g'), '');
        var regExpDigit = new RegExp(/[0-9]/);
        var formattedThousands = '';
        var digitCounter = 0;
        var integerIndex = integerPart.length - 1;
        while (integerIndex >= 0) {
            var currentCharacter = integerPart[integerIndex];
            if (regExpDigit.test(currentCharacter)) {
                if (digitCounter == 3) {
                    currentCharacter += maskingOptions.ThousandsSeparator;
                    digitCounter = 0;
                }
                digitCounter++;
            }
            formattedThousands = currentCharacter + formattedThousands;
            integerIndex--;
        }
        integerPart = formattedThousands;
        return integerPart + decimalPart;

    };

    function Validate (rawData, maskingOptions, displayOnly) {

        // Valid Number?
        if (new RegExp(/^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/).test(rawData) == false) {
            return false;
        }

        // Initialize
        var numericValue = parseFloat(rawData);

        // Allow Negative?
        if (!maskingOptions.AllowNegative) {
            if (numericValue < parseFloat(0)) {
                return false;
            }
        }

        // Decimals
        if (rawData.indexOf('.') != -1) {
            var decimalPart = rawData.substr(rawData.indexOf('.') + 1, rawData.length);

            // Allow Decimal?
            if (maskingOptions.DecimalLimit <= 0) {
                if (new RegExp(/^0+$/).test(decimalPart) != true) {
                    return false;
                }
            }

            // Decimal Limit
            if (decimalPart.length > maskingOptions.DecimalLimit) {
                if (new RegExp(/^0+$/).test(decimalPart.substr(maskingOptions.DecimalLimit, decimalPart.length)) != true && !displayOnly) {
                    return false;
                }
            }
        }

        // Thousands Lower/Upper Limit Check
        if (maskingOptions.ThousandsLowerLimit != '*' && numericValue < parseFloat(maskingOptions.ThousandsLowerLimit)) {
            return false;
        }
        else if (maskingOptions.ThousandsUpperLimit != '*' && numericValue > parseFloat(maskingOptions.ThousandsUpperLimit)) {
            return false;
        }
        return true;

    };

} (window.NumericMask = window.NumericMask || {}, window, document, Common, Cache, Events, Velocity));

// Signed Mask (Basically does everything Numeric does only forces +/- signs)
(function (SignedMask, window, document, Common, Cache, Events, Velocity, undefined) {

    SignedMask.BuildMaskingOptions = function (maskingOptions) {

        maskingOptions = NumericMask.BuildMaskingOptions(maskingOptions);
        return maskingOptions;

    };

    SignedMask.Format = function (rawData, maskingOptions, formatResult, displayOnly) {

        // Sanity Check
        if (rawData.length <= 0) {
            return;
        }

        // Adjust Raw data if % Mask or decimal rounding a display value
        if (maskingOptions.PercentSuffix.length > 0) {
            var percentDecimal = parseFloat('1' + new Array(maskingOptions.DecimalLimit + 1).join('0'));
            rawData = (Math.round((parseFloat(rawData) * parseFloat(100)) * percentDecimal) / percentDecimal).toString();
        }
        else if (displayOnly && maskingOptions.DecimalLimit > 0) {
            rawData = (parseFloat(rawData).toFixed(maskingOptions.DecimalLimit)).toString();
        }

        // Validate
        if (!Validate(rawData, maskingOptions, displayOnly)) {
            formatResult.Text = rawData;
            formatResult.Valid = false;
            return;
        }

        // Format
        formatResult.Text = AdjustDecimalZeros(rawData, maskingOptions);
        if (maskingOptions.DecimalLimit > 0) {
            formatResult.Text = formatResult.Text.replace('.', maskingOptions.DecimalSeparator);
        }
        formatResult.Text = InsertThousandsSeparator(formatResult.Text, maskingOptions);
        formatResult.Text = maskingOptions.CurrencyPrefix + formatResult.Text.replace('-', '').replace('+', '') + maskingOptions.PercentSuffix;
        if (parseFloat(rawData) < parseFloat(0)) {
            formatResult.Text = '-' + formatResult.Text;
        }
        else {
            formatResult.Text = '+' + formatResult.Text;
        }

    };

    SignedMask.OnKeyPress = function (fieldDetail, maskingOptions) {

        // Allowed Keys (0-9, Period/Comma, Hyphen)
        if ((fieldDetail.KeyCode >= Mask.Number.Zero && fieldDetail.KeyCode <= Mask.Number.Nine) ||
            (maskingOptions.DecimalLimit > 0 && fieldDetail.KeyPressed == maskingOptions.DecimalSeparator) ||
            (maskingOptions.AllowNegative == true && fieldDetail.KeyPressed == '-') ||
            (fieldDetail.KeyPressed == '+')) {
            // Initialize
            var lastLeftCharacter = fieldDetail.LeftOfCaret.substr(fieldDetail.LeftOfCaret.length - 1, 1);
            var firstRightCharacter = fieldDetail.RightOfCaret.substr(0, 1);
            var rawLeftOfCaret = fieldDetail.LeftOfCaret.replace(maskingOptions.CurrencyPrefix, '').replace('+', '').replace('-', '');

            // Sanity Check
            if (fieldDetail.LeftOfCaretLength > 0 || fieldDetail.RightOfCaretLength > 0) {
                if ((maskingOptions.CurrencyPrefix.length > 0 && firstRightCharacter == maskingOptions.CurrencyPrefix) || firstRightCharacter == '+' || firstRightCharacter == '-') {
                    return;
                }
            }
            if (fieldDetail.KeyCode >= Mask.Number.Zero && fieldDetail.KeyCode <= Mask.Number.Nine) {
                if (rawLeftOfCaret == '0') {
                    return;
                }
            }

            // Currency prefix
            if (maskingOptions.CurrencyPrefix.length > 0) {
                if (fieldDetail.CaretPosition == 0 || (fieldDetail.CaretPosition == 1 && (firstRightCharacter == '+' || firstRightCharacter == '-'))) {
                    fieldDetail.LeftOfCaret += maskingOptions.CurrencyPrefix;
                    fieldDetail.LeftOfCaretLength++;
                }
            }

            // +/- Sign
            if (fieldDetail.KeyPressed == '-' || fieldDetail.KeyPressed == '+') {
                if (fieldDetail.CaretPosition != 0) {
                    return;
                }
            }

            // Remove Spurious +/- Signs
            var plusSigns, minusSigns, totalPlusSigns = 0, totalMinusSigns = 0;
            if (maskingOptions.AllowNegative) {
                minusSigns = (fieldDetail.LeftOfCaret.match(/-/g) || []).length;
                totalMinusSigns += minusSigns;
                if (minusSigns > 1) {
                    fieldDetail.LeftOfCaret = fieldDetail.LeftOfCaret.replace(/\-/g, '');
                    fieldDetail.LeftOfCaretLength = fieldDetail.LeftOfCaret.length;
                }
                minusSigns = (fieldDetail.RightOfCaret.match(/-/g) || []).length;
                totalMinusSigns += minusSigns;
                if (minusSigns > 1) {
                    fieldDetail.RightOfCaret = fieldDetail.RightOfCaret.replace(/\-/g, '');
                    fieldDetail.RightOfCaretLength = fieldDetail.RightOfCaret.length;
                }
            }
            plusSigns = (fieldDetail.LeftOfCaret.match(/\+/g) || []).length;
            totalPlusSigns += plusSigns;
            if (plusSigns > 1) {
                fieldDetail.LeftOfCaret = fieldDetail.LeftOfCaret.replace(/\+/g, '');
                fieldDetail.LeftOfCaretLength = fieldDetail.LeftOfCaret.length;
            }
            plusSigns = (fieldDetail.RightOfCaret.match(/\+/g) || []).length;
            totalPlusSigns += plusSigns;
            if (plusSigns > 1) {
                fieldDetail.RightOfCaret = fieldDetail.RightOfCaret.replace(/\+/g, '');
                fieldDetail.RightOfCaretLength = fieldDetail.RightOfCaret.length;
            }
            if (totalPlusSigns > 0 && totalMinusSigns > 0) {
                fieldDetail.LeftOfCaret = fieldDetail.LeftOfCaret.replace(/\-/g, '').replace(/\+/g, '');
                fieldDetail.LeftOfCaretLength = fieldDetail.LeftOfCaret.length;
                fieldDetail.RightOfCaret = fieldDetail.RightOfCaret.replace(/\-/g, '').replace(/\+/g, '');
                fieldDetail.RightOfCaretLength = fieldDetail.RightOfCaret.length;
            }
            else if (totalPlusSigns == 0 && totalMinusSigns == 0 && fieldDetail.KeyCode >= Mask.Number.Zero && fieldDetail.KeyCode <= Mask.Number.Nine) {
                fieldDetail.LeftOfCaret = '+' + fieldDetail.LeftOfCaret;
                fieldDetail.LeftOfCaretLength = fieldDetail.LeftOfCaret.length;
            }

            // Preceding Zero
            if (fieldDetail.KeyPressed == '0') {
                if (fieldDetail.LeftOfCaret.indexOf('.') == -1) {
                    if (rawLeftOfCaret == '0' || (Common.IsEmptyString(rawLeftOfCaret) && fieldDetail.RightOfCaretLength > 0)) {
                        return;
                    }
                }
            }

            // Decimal Separator
            if (fieldDetail.KeyPressed == maskingOptions.DecimalSeparator) {
                if (fieldDetail.LeftOfCaret.indexOf(maskingOptions.DecimalSeparator) != -1 || fieldDetail.RightOfCaret.indexOf(maskingOptions.DecimalSeparator) != -1) {
                    return;
                }
                else {
                    if (fieldDetail.RightOfCaret.length > maskingOptions.DecimalLimit) {
                        return;
                    }
                }
                if (Common.IsEmptyString(lastLeftCharacter) || lastLeftCharacter == maskingOptions.CurrencyPrefix || lastLeftCharacter == '+' || lastLeftCharacter == '-') {
                    fieldDetail.LeftOfCaret += '0';
                    fieldDetail.LeftOfCaretLength++;
                }
            }

            // Decimal Limit
            if (fieldDetail.LeftOfCaret.indexOf(maskingOptions.DecimalSeparator) != -1) {
                var decimalLength = ((fieldDetail.LeftOfCaret + fieldDetail.RightOfCaret.replace('%', '')).split(maskingOptions.DecimalSeparator)[1]).length;
                if (decimalLength >= maskingOptions.DecimalLimit) {
                    return;
                }
            }

            // Add the key pressed
            fieldDetail.LeftOfCaret += fieldDetail.KeyPressed;
            fieldDetail.LeftOfCaretLength++;

            // Thousands Separator
            if (maskingOptions.ThousandsSeparator.length > 0) {
                // Insert Thousands Separator (with caret position indicated by |)
                var thisText = fieldDetail.LeftOfCaret + '|' + fieldDetail.RightOfCaret;
                thisText = InsertThousandsSeparator(thisText, maskingOptions);

                // Split to Left and Right of Caret
                fieldDetail.LeftOfCaret = thisText.split('|')[0];
                fieldDetail.LeftOfCaretLength = fieldDetail.LeftOfCaret.length;
                fieldDetail.RightOfCaret = thisText.split('|')[1];
                fieldDetail.RightOfCaretLength = fieldDetail.RightOfCaret.length;
            }

            // Set Text and Caret
            Mask.SetInputText(fieldDetail.HtmlInputField, fieldDetail.LeftOfCaret, fieldDetail.RightOfCaret);
        }

    };

    SignedMask.OnFocusOut = function (maskingOptions, onFocusOut) {

        // Initialize
        var eventTarget = onFocusOut.EventTarget;
        onFocusOut.GoodData = true;

        // Convert to raw-data (Strip to Digits)
        var rawData = eventTarget.value;
        if (maskingOptions.CurrencyPrefix.length > 0) {
            rawData = rawData.replace(maskingOptions.CurrencyPrefix, '');
        }
        if (maskingOptions.PercentSuffix.length > 0) {
            rawData = rawData.replace(maskingOptions.PercentSuffix, '');
        }
        if (maskingOptions.ThousandsSeparator.length > 0) {
            rawData = rawData.replace(new RegExp(maskingOptions.ThousandsSeparator.replace(/\./g, '\\.'), 'g'), '');
        }
        if (maskingOptions.DecimalLimit > 0) {
            rawData = rawData.replace(maskingOptions.DecimalSeparator, '.');
        }

        // Is Empty?
        if (rawData.length <= 0) {
            // Has Changed?
            if (onFocusOut.RawData == '') {
                onFocusOut.HasChanged = false;
                return;
            }

            // Clear data-raw
            eventTarget.value = '';
            Common.SetAttr(eventTarget, 'data-raw', '');
            return;
        }

        // Has Changed?
        if (onFocusOut.RawData == rawData) {
            onFocusOut.HasChanged = false;
            return;
        }

        // Validate
        onFocusOut.GoodData = Validate(rawData, maskingOptions);

        // Set data-raw
        if (onFocusOut.GoodData) {
            // Reformat
            var formattedValue = AdjustDecimalZeros(rawData, maskingOptions);
            if (maskingOptions.DecimalLimit > 0) {
                formattedValue = formattedValue.replace('.', maskingOptions.DecimalSeparator);
            }
            formattedValue = InsertThousandsSeparator(formattedValue, maskingOptions);
            formattedValue = maskingOptions.CurrencyPrefix + formattedValue.replace('-', '').replace('+', '') + maskingOptions.PercentSuffix;
            if (parseFloat(rawData) < parseFloat(0)) {
                formattedValue = '-' + formattedValue;
            }
            else {
                formattedValue = '+' + formattedValue;
            }

            // Divide by 100 (to the right decimal length) if % Mask
            if (maskingOptions.PercentSuffix.length > 0) {
                var percentDecimal = parseFloat('1' + new Array((maskingOptions.DecimalLimit * 2) + 1).join('0'));
                rawData = (Math.round((parseFloat(rawData) / parseFloat(100)) * percentDecimal) / percentDecimal).toString();
            }

            // Has Changed?
            if (onFocusOut.RawData == rawData) {
                onFocusOut.HasChanged = false;
                return;
            }

            // Set Text/data-raw
            eventTarget.value = formattedValue;
            Common.SetAttr(eventTarget, 'data-raw', rawData);
        }

    };

    SignedMask.CheckValidation = function (maskingOptions, onFocusOut) {

        SignedMask.OnFocusOut(maskingOptions, onFocusOut);
        return onFocusOut.GoodData;

    };

    // Private Methods
    function AdjustDecimalZeros (rawData, maskingOptions) {

        // Sanity Check
        if (maskingOptions.DecimalLimit <= 0) {
            if (rawData.indexOf('.') != -1) {
                rawData = rawData.substring(0, rawData.indexOf('.'));
            }
            return rawData;
        }

        // Integer/Decimal Part
        var integerPart = '';
        var decimalPart = '';
        if (rawData.indexOf('.') != -1 && maskingOptions.DecimalLimit > 0) {
            integerPart = rawData.substring(0, rawData.indexOf('.'));
            decimalPart = rawData.substr(rawData.indexOf('.'), rawData.length);
        }
        else {
            integerPart = rawData.substr(0, rawData.length);
            decimalPart = '.';
        }

        // Adjust Zeros
        if ((decimalPart.length - 1) > maskingOptions.DecimalLimit) {
            // Truncate Zeros
            decimalPart = decimalPart.substr(0, maskingOptions.DecimalLimit + 1);
        }
        else {
            // Zeros to Add
            var zerosToAdd = '', decimalIndex = (decimalPart.length - 1);
            for ( ; decimalIndex < maskingOptions.DecimalLimit; decimalIndex++) {
                zerosToAdd += '0';
            }
            decimalPart += zerosToAdd;
        }
        return integerPart + decimalPart;

    };

    function InsertThousandsSeparator (fieldText, maskingOptions) {

        // Integer/Decimal Part
        var integerPart = '';
        var decimalPart = '';
        if (fieldText.indexOf(maskingOptions.DecimalSeparator) != -1 && maskingOptions.DecimalLimit > 0) {
            integerPart = fieldText.substring(0, fieldText.indexOf(maskingOptions.DecimalSeparator));
            decimalPart = fieldText.substr(fieldText.indexOf(maskingOptions.DecimalSeparator), fieldText.length);
        }
        else {
            integerPart = fieldText.substr(0, fieldText.length);
        }

        // Add Thousands Separator
        integerPart = integerPart.replace(new RegExp(maskingOptions.ThousandsSeparator.replace(/\./g, '\\.'), 'g'), '');
        var regExpDigit = new RegExp(/[0-9]/);
        var formattedThousands = '';
        var digitCounter = 0;
        var integerIndex = integerPart.length - 1;
        while (integerIndex >= 0) {
            var currentCharacter = integerPart[integerIndex];
            if (regExpDigit.test(currentCharacter)) {
                if (digitCounter == 3) {
                    currentCharacter += maskingOptions.ThousandsSeparator;
                    digitCounter = 0;
                }
                digitCounter++;
            }
            formattedThousands = currentCharacter + formattedThousands;
            integerIndex--;
        }
        integerPart = formattedThousands;
        return integerPart + decimalPart;

    };

    function Validate (rawData, maskingOptions, displayOnly) {

        // Valid Number?
        if (new RegExp(/^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/).test(rawData) == false) {
            return false;
        }

        // Initialize
        var numericValue = parseFloat(rawData);

        // Allow Negative?
        if (!maskingOptions.AllowNegative) {
            if (numericValue < parseFloat(0)) {
                return false;
            }
        }

        // Decimals
        if (rawData.indexOf('.') != -1) {
            var decimalPart = rawData.substr(rawData.indexOf('.') + 1, rawData.length);

            // Allow Decimal?
            if (maskingOptions.DecimalLimit <= 0) {
                if (new RegExp(/^0+$/).test(decimalPart) != true) {
                    return false;
                }
            }

            // Decimal Limit
            if (decimalPart.length > maskingOptions.DecimalLimit) {
                if (new RegExp(/^0+$/).test(decimalPart.substr(maskingOptions.DecimalLimit, decimalPart.length)) != true && !displayOnly) {
                    return false;
                }
            }
        }

        // Thousands Lower/Upper Limit Check
        if (maskingOptions.ThousandsLowerLimit != '*' && numericValue < parseFloat(maskingOptions.ThousandsLowerLimit)) {
            return false;
        }
        else if (maskingOptions.ThousandsUpperLimit != '*' && numericValue > parseFloat(maskingOptions.ThousandsUpperLimit)) {
            return false;
        }
        return true;

    };

} (window.SignedMask = window.SignedMask || {}, window, document, Common, Cache, Events, Velocity));
