/** 
 * @class Form
 * @classdesc Namespace: ViewElement > ContainerElement
 * @category Core
 * @copyright Graphite GTC, LLC.
 */
(function (Form, window, document, Common, Cache, Events, Velocity, undefined) {

    var formMaskingValidations = [];

    /**
     * @function Form.Render
     * @param {object} form - The Form View Element in JSON format
     * @description Generates the HTML markup for the Form View Element 
     */
    Form.Render = function (form) {

        // Form<, TabIndex@, Class@, Id@, Form>
        var formMarkup = '<form data-namespace="Form" class="gtc-form gtc-form-gallerygrid-' + form.FieldSetsPerLine.toLowerCase() + '"' + ViewElement.RenderAttributes(form) + '>';

        // Lock Down Form Fields
        if (form.IsLocked == 'Yes') {
            LockDescendants(form, ['FieldSet', 'CheckboxField', 'CurrencyField', 'DateField', 'Field', 'FilteredTextField', 'MaskField', 'NoteField', 'NumericField', 'PercentField', 'PlaceholderField', 'RadioField', 'SecureField', 'SelectField', 'SignatureField', 'SwitchField', 'SwitchMaskField', 'TextField', 'ValueField']);
        }

        // Render Container ViewElements
        formMarkup += ContainerElement.RenderElements(form);

        // Form</>
        formMarkup += '</form>';

        // Stop form from submitting by default, we handle that
        Events.On(document.body, 'submit', '#' + form.Name,
            function (event) {
                event.preventDefault();
                event.stopPropagation();
            }
        );

        // Return markup
        return formMarkup;

    };

    /**
     * @function Form.UpdateValues
     * @param {object} form - The Form DOM element
     * @param {UiParameter[]} uiParameters - A list of UiParameters with Field Names and Values
     * @description Updates the values of the fields in a Form 
     */
    Form.UpdateValues = function (form, uiParameters) {

        if (Common.IsDefined(uiParameters)) {
            var uiParameter, index = 0, length = uiParameters.length, field, isRadioArray;
            for ( ; index < length; index++) {
                // Field Parameter
                uiParameter = uiParameters[index];

                // Field
                isRadioArray = false;
                field = Common.Get(uiParameter.Name);
                if (Common.IsNotDefined(field)) {
                    field = Common.QueryAll('input[name="' + uiParameter.Name + '"]', form);
                    if (field.length == 0) {
                        field = undefined;
                    }
                    else {
                        isRadioArray = true;
                    }
                }
                
                // Update Value
                if (Common.IsDefined(field)) {
                    Field.UpdateValue(field, uiParameter.Value, isRadioArray);
                }
            }
        }

    };

    Form.UpdateStatus = function (form, uiParameters) {

        if (Common.IsDefined(uiParameters)) {
            var uiParameter, index = 0, length = uiParameters.length;
            for ( ; index < length; index++) {
                uiParameter = uiParameters[index];
                var field = Common.Get(uiParameter.Name);
                var requiredSpan, fieldLabel;
                if (Common.IsNotDefined(field)) {
                    // Radio Field
                    field = Common.QueryAll('input[name="' + uiParameter.Name + '"]', form);
                    if (field.length > 0) {
                        var fieldSet = Common.Closest('fieldset', field[0]);
                        var fieldLabel = Common.GetChildren(fieldSet, '.gtc-label');
                        requiredSpan = Common.GetChildren(fieldLabel[0], '.gtc-classSpanRequired')[0];
                    }
                }
                else {
                    // Other Fields
                    fieldLabel = Common.Get(uiParameter.Name + '-Label');
                    requiredSpan = fieldLabel.nextElementSibling;
                }
                if (uiParameter.Value == 'IsRequired') {
                    if (Common.IsDefined(fieldLabel) && Common.IsDefined(field)) {
                        Common.RemoveClasses(requiredSpan, 'gtc-classSpanRequiredCompleted gtc-classSpanRequiredYes gtc-classSpanRequiredNo');
                        Common.AddClass(requiredSpan, 'gtc-classSpanRequiredYes');

                        // Focus Out - Add Required Update
                        Events.Off(document.body, 'focusout.requiredField', '#' + uiParameter.Name);
                        Events.On(document.body, 'focusout.requiredField.' + uiParameter.Name, '#' + uiParameter.Name,
                            function (event) {
                                Field.UpdateRequiredStatus(event.target);
                            }
                        );
                    }
                }
                else if (uiParameter.Value == 'NotRequired') {
                    if (Common.IsDefined(fieldLabel) && Common.IsDefined(field)) {
                        Common.RemoveClasses(requiredSpan, 'gtc-classSpanRequiredCompleted gtc-classSpanRequiredYes gtc-classSpanRequiredNo');
                        Common.AddClass(requiredSpan, 'gtc-classSpanRequiredNo');

                        // Focus Out - Remove Required Update
                        Events.Off(document.body, 'focusout.requiredField', '#' + uiParameter.Name);
                    }
                }
            }
        }

    };

    Form.SerializeArray = function (form) {

        // Initialize
        var regExpCRLF = /\r?\n/g;
        formMaskingValidations = [];
        var maskExists = (Common.IsDefined(window['Mask']) ? true : false);

        // Serialize Array
        var radioNames = [], serializedForm = [];
        var serializableArray = Common.QueryAll('[data-serializable]', form);
        var serializableIndex = 0, serializableLength = serializableArray.length;
        for ( ; serializableIndex < serializableLength; serializableIndex++) {
            var serializable = serializableArray[serializableIndex];
            var parameterName = Common.RemovePrefix(serializable.name);
            var rawData = null;
            var uiParameters = null;
            var isCustomFunction = false;
            fieldType = Common.GetAttr(serializable, 'data-namespace');
            var namespace = window[fieldType];
            if (!Common.IsObject(namespace)) {
                continue;
            }

            // Check if masking passes
            if ((maskExists && Common.IsDefined(Common.GetAttr(serializable, 'data-mask'))) || fieldType == 'FilteredTextField' || fieldType == 'SwitchMaskField') {
                var maskField = serializable;
                if (fieldType == 'SliderField') {
                    maskField = Common.Query('.gtc-input-textbox', maskField);
                }
                else if (fieldType == 'SwitchMaskField') {
                    maskField = Common.Query('.gtc-switchmask-text', Common.Closest('.gtc-switchmask', maskField));
                }
                var maskCheck = true;
                if (fieldType == 'FilteredTextField') {
                    if (Common.GetAttr(serializable, 'data-isfreeform') == 'No' && Common.IsNotEmptyString(maskField.value)) {
                        var labelValueArray = Cache.Get(maskField, 'labelValueArray');
                        var selectedOption = FilteredTextField.Validate(maskField, labelValueArray);
                        if (!selectedOption) {
                            maskCheck = false;
                        }
                    }
                }
                else {
                    maskCheck = Mask.CheckValidation(maskField);
                }

                // Add or remove displaying masking validations
                if (!maskCheck) {
                    formMaskingValidations.push(maskField);
                    continue;
                }
                else if (maskCheck && Common.HasClass(maskField, 'gtc-failed-masking-validation')) {
                    Form.RemoveMaskingError(maskField, true);
                }
            }

            // Serialize value
            switch (fieldType) {
                case 'CheckboxField':
                    isCustomFunction = true;
                    serializedForm.push(namespace.SerializeArray(serializable));
                    break;
                case 'SwitchField':
                    rawData = 'Yes';
                    if (serializable.checked == false) {
                        rawData = 'No';
                    }
                    break;
                case 'CurrencyField':
                    rawData = Common.GetAttr(serializable, 'data-raw');
                    if (rawData.length <= 0) {
                        rawData = null;
                    }
                    var currencyCode = Common.GetAttr(serializable, 'data-currencycode');
                    if (Common.IsDefined(currencyCode)) {
                        uiParameters = [
                            {
                                Name: 'Code',
                                Value: currencyCode,
                                UiParameters: null
                            }
                        ];
                    }
                    break;
                case 'RadioField':
                    var radioName = serializable.name;
                    if (Common.IsInArray(radioName, radioNames) == -1) {
                        // First of the Radio in the group (Process the whole Radio group)
                        radioNames.push(radioName);
                        var index = 0, radios = Common.GetByName(radioName), radioLength = radios.length;
                        for ( ; index < radioLength; index++) {
                            if (radios[index].checked == true) {
                                rawData = radios[index].value;
                                break;
                            }
                        }
                        if (Common.IsNotDefined(rawData)) {
                            rawData = null;
                        }
                    }
                    else {
                        // TODO Fix: Radio group already processed
                        continue;
                    }
                    break;
                case 'SelectField':
                    rawData = serializable.value;
                    break;
                case 'SignatureField':
                    parameterName = Common.RemovePrefix(serializable.id);
                    rawData = Widgets.signature(serializable, 'ExportSignature');
                    break;
                case 'SliderField':
                    parameterName = Common.RemovePrefix(serializable.id);
                    rawData = Widgets.sliderfield(Common.Query('#' + serializable.id + '-Slider', serializable), 'value');
                    break;
                case 'SwitchMaskField':
                    // Add in checkbox value
                    var switchMaskCheckbox = Common.Get(serializable.id + '-Checkbox');
                    var switchCheckValue = 'Right';
                    if (switchMaskCheckbox.checked == false) {
                        switchCheckValue = 'Left';
                    }
                    serializedForm.push({ Name: serializable.id, Value: switchCheckValue, UiParameters: null });

                    // Then do textbox value
                    var switchMaskTextField = Common.Get(serializable.id + 'Text');
                    parameterName = Common.RemovePrefix(Common.GetAttr(switchMaskTextField, 'data-parametername'));
                    rawData = Common.GetAttr(switchMaskTextField, 'data-raw');
                    if (Common.IsNotDefined(rawData)) {
                        rawData = switchMaskTextField.value;
                    }
                    if (rawData.length <= 0) {
                        rawData = null;
                    }
                    else {
                        rawData = rawData.replace(regExpCRLF, '\r\n');
                    }
                    var currencyCode = Common.GetAttr(switchMaskTextField, 'data-currencycode');
                    if (Common.IsDefined(currencyCode)) {
                        uiParameters = [
                            {
                                Name: 'Code',
                                Value: currencyCode,
                                UiParameters: null
                            }
                        ];
                    }
                    break;
                case 'RichTextEditor':
                    parameterName = Common.RemovePrefix(serializable.id);
                    rawData = CKEDITOR.instances[serializable.id + 'EditableArea'].getData();
                    break;
                default:
                    if (Common.IsFunction(namespace.SerializeArray)) {
                        serializedForm.push(namespace.SerializeArray(serializable));
                        isCustomFunction = true;
                    }
                    else {
                        rawData = Common.GetAttr(serializable, 'data-raw');
                        if (Common.IsNotDefined(rawData)) {
                            rawData = serializable.value;
                        }
                        if (rawData.length <= 0) {
                            rawData = null;
                        }
                        else {
                            rawData = rawData.replace(regExpCRLF, '\r\n');
                        }
                    }
                    break;
            }
            if (!isCustomFunction) {
                serializedForm.push({ Name: parameterName, Value: rawData, UiParameters: uiParameters });
            }
        }
        return serializedForm;

    };

    Form.HasChanged = function (form) {

        // Find all serializable inputs that have changed
        var formInputs = Common.QueryAll('[data-serializable][data-haschanged=Yes]', form);
        var choiceInputs = Common.QueryAll('[data-namespace=Choice][data-haschanged=Yes]', form);
        formInputs = formInputs.concat(choiceInputs);

        // Return
        if (formInputs.length > 0) {
            return true;
        }
        return false;

    };

    Form.ClearHasChanged = function (form) {

        // Find all serializable inputs that have changed
        var formInputs = Common.QueryAll('[data-serializable][data-haschanged=Yes]', form);
        var choiceInputs = Common.QueryAll('[data-namespace=Choice][data-haschanged=Yes]', form);
        formInputs = formInputs.concat(choiceInputs);

        // Clear Flag
        if (formInputs.length > 0) {
            var index = 0, length = formInputs.length;
            for ( ; index < length; index++) {
                Common.RemoveAttr(formInputs[index], 'data-haschanged');
            }
        }

    };

    Form.IsCompleted = function (form) {

        if (Common.QueryAll('.gtc-classSpanRequiredYes', form).length > 0) {
            return false;
        }
        return true;

    };

    Form.AddFormParameters = function (uiParameters, form, ignoreFormParameters) {

        // Form Parameters (and has changed)
        var formParameters = Form.SerializeArray(form);
        var formChanged = 'No';
        if (Form.HasChanged(form, formParameters)) {
            formChanged = 'Yes';
        }

        // Add Form Changed, Form Parameters
        if (ignoreFormParameters) {
            uiParameters = uiParameters.concat([
                {
                    Name: 'FormChanged',
                    Value: formChanged,
                    UiParameters: null
                }],
                formParameters
            );
        }
        else {
            uiParameters = uiParameters.concat([
                {
                    Name: 'FormChanged',
                    Value: formChanged,
                    UiParameters: null
                },
                {
                    Name: 'FormParameters',
                    Value: null,
                    UiParameters: formParameters
                }
            ]);
        }

        // Return
        return uiParameters;

    };

    Form.ForceGalleryGridding = function (form) {

        if (parseInt(form.FieldSetsPerLine, 10) > 0) {
            var perLineObject = {
                Type: 'FieldSet',
                PerLine: form.FieldSetsPerLine
            };
            return perLineObject;
        }
        else {
            return false;
        }

    };

    Form.HasMaskingErrors = function () {

        if (formMaskingValidations.length > 0) {
            return true;
        }
        else {
            return false;
        }

    };

    Form.DisplayMaskingErrors = function () {

        var formValidationsCopy = Common.MergeArray([], formMaskingValidations);
        var field, index = 0, length = formValidationsCopy.length;
        for ( ; index < length; index++) {
            field = formValidationsCopy[index];
            InsertMaskingErrorHTML(field);
        }

    };

    Form.AddMaskingError = function (field) {

        if (Common.IsInArray(field, formMaskingValidations) == -1) {
            formMaskingValidations.push(field);
        }
        InsertMaskingErrorHTML(field);

    };

    Form.RemoveMaskingError = function (field, ignoreRemoval) {

        if (!ignoreRemoval && Common.IsInArray(field, formMaskingValidations) > -1) {
            formMaskingValidations = Common.FilterArray(formMaskingValidations,
                function (element) {
                    return element != field;
                }
            );
        }
        Common.RemoveClass(field, 'gtc-failed-masking-validation');
        Velocity(Common.Get(field.id + 'FailedMaskIcon'), 'fadeOut', 'slow',
            function () {
                Common.Remove(this);
            }
        );

    };

    // Private Methods
    function LockDescendants (jsonObject, lockTypes) {

        // Loop over each object property
        var key;
        for (key in jsonObject) {
            if (jsonObject.hasOwnProperty(key)) {
                var object = jsonObject[key];

                // Set IsLocked if criteria met
                var isDefined = Common.IsDefined(object);
                var isObject = Common.IsObject(object);
                var isArray = Common.IsArray(object);
                if (isDefined && isObject && !isArray && Common.IsInArray(object.Type, lockTypes) != -1 && Common.IsDefined(object.IsLocked)) {
                    object.IsLocked = 'Yes';
                }

                // Recursively call LockDescendants if its array or object
                if (isDefined && (isArray || isObject)) {
                    LockDescendants(object, lockTypes);
                }
            }
        }

    };

    function InsertMaskingErrorHTML (field) {

        if (!Common.HasClass(field, 'gtc-failed-masking-validation')) {
            var iconMarkup = '<span id="' + field.id + 'FailedMaskIcon" style="display:none;" class="gtc-input-system gtc-failed-masking-validation-icon"><i class="gtc-icon-styles fa fa-warning"></i></span>';
            Common.InsertHTMLString(field, Common.InsertType.After, iconMarkup);
            Velocity(field.nextElementSibling, 'fadeIn', 'slow');
            Common.AddClass(field, 'gtc-failed-masking-validation');
        }

    };

} (window.Form = window.Form || {}, window, document, Common, Cache, Events, Velocity));
