/** 
 * @class AccordionForm
 * @classdesc Supports the AccordionForm View Element<br>
 *            Based On: ViewElement > ContainerElement > Form
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (AccordionForm, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function AccordionForm.Render
     * @param {object} accordionForm - The AccordionForm View Element in JSON format
     * @description Generates the HTML markup for the AccordionForm View Element
     * @returns {string} HTML Markup of the AccordionForm View Element
     * @listens click (class = gtc-accordionform-fieldset)
     */
    AccordionForm.Render = function (accordionForm) {

        // Form<, Namespace@, Class@, Id@
        var accordionFormMarkup = '<form data-namespace="AccordionForm" class="gtc-accordionform"' + ViewElement.RenderAttributes(accordionForm) + '>';

        // Lock Down Form Fields
        if (accordionForm.IsLocked == 'Yes') {
            LockDescendants(accordionForm, ['FieldSet', 'CheckboxField', 'CurrencyField', 'DateField', 'Field', 'FilteredTextField', 'MaskField', 'NoteField', 'NumericField', 'PercentField', 'PlaceholderField', 'RadioField', 'SecureField', 'SelectField', 'SignatureField', 'SwitchField', 'SwitchMaskField', 'TextField', 'ValueField']);
        }

        // Render Container ViewElements
        if (accordionForm.IsAccordionFirst == 'No') {
            accordionFormMarkup += ContainerElement.RenderElements(accordionForm);
        }

        // FieldSets
        var idNamespaces = '';
        if (Common.IsDefined(accordionForm.AccordionFieldSets)) {
            var fieldSet, index = 0, length = accordionForm.AccordionFieldSets.length;
            for ( ; index < length; index++) {
                fieldSet = accordionForm.AccordionFieldSets[index];
                var noFieldsClass = '';
                if (Common.IsNotDefined(fieldSet.Fields)) {
                    noFieldsClass = ' gtc-cursor-notallowed';
                }
                idNamespaces += '.' + fieldSet.Name + 'FieldSetContainer';
                accordionFormMarkup += '<div class="gtc-accordionform-fieldset' + noFieldsClass + '" id="' + fieldSet.Name + 'FieldSetContainer">';
                accordionFormMarkup += FieldSet.Render(fieldSet, true);
                accordionFormMarkup += '</div>';
            }
        }

        // Render Container ViewElements
        if (accordionForm.IsAccordionFirst == 'Yes') {
            accordionFormMarkup += ContainerElement.RenderElements(accordionForm);
        }

        // Attach click event
        var mobileEventType = '';
		if (Common.CheckMedia('Mobile') || Common.CheckMedia('Tablet')) {
			mobileEventType += ' touchstart' + idNamespaces;
		}
        Events.On(document.body, 'click' + idNamespaces + mobileEventType, '.gtc-accordionform-fieldset',
            function () {
                // No fields?
                if (Common.HasClass(this, 'gtc-cursor-notallowed')) {
                    return;
                }

                // Get clicked fieldset ol
                var fieldsOl = Common.Query('.gtc-fieldset-ol', this);

                // Only update everything if its not already displayed
                if (Common.IsHidden(fieldsOl)) {
                    // Close all other fieldsets
                    var accordionFieldsets = Common.QueryAll('.gtc-accordionform-fieldset:not(#' + this.id + ')');
                    var ol, accordionFieldset, index = 0, length = accordionFieldsets.length;
                    for ( ; index < length; index++) {
                        accordionFieldset = accordionFieldsets[index];
                        ol = Common.Query('.gtc-fieldset-ol', accordionFieldset);
                        Velocity(ol, 'slideUp');
                        Common.SetAttr(ol, 'aria-expanded', 'false');
                        Common.RemoveClass(accordionFieldset, 'gtc-active');
                    }

                    // Display clicked fieldset
                    Common.AddClass(this, 'gtc-active');
                    Common.SetAttr(fieldsOl, 'aria-expanded', 'true');
                    Velocity(fieldsOl, "slideDown",
                        function () {
                            Common.ResizeView();
                        }
                    );
                }
            }
        );

        // Form</>
        accordionFormMarkup += '</form>';
        return accordionFormMarkup;

    };
    
    /**
     * @function AccordionForm.UpdateValues
     * @param {object} accordionForm - The AccordionForm DOM element
     * @param {UiParameter[]} uiParameters - An array of UiParameters with Field names and values in JSON format
     * @description Updates the values of the Fields in an Accordion Form 
     */
    AccordionForm.UpdateValues = function (accordionForm, uiParameters) {

        Form.UpdateValues(accordionForm, uiParameters);

    };

    /**
     * @function AccordionForm.SerializeArray
     * @param {object} accordionForm - The AccordionForm DOM element
     * @description Serializes all the serializable inputs in an AccordionForm
     * @returns {UiParameter[]} A list of UiParameters with Name, Value and in some cases also UiParameters
     */
    AccordionForm.SerializeArray = function (accordionForm) {

        return Form.SerializeArray(accordionForm);

    };

    /**
     * @function AccordionForm.HasChanged
     * @param {object} accordionForm - The AccordionForm DOM element
     * @description Check if any of the serializable inputs have changed
     * @returns {boolean} <i>true</i> if any input has changed otherwise <i>false</i>
     */
    AccordionForm.HasChanged = function (accordionForm, formParameters) {

        return Form.HasChanged(accordionForm, formParameters);

    };

    /**
     * @function AccordionForm.IsCompleted
     * @param {object} accordionForm - The AccordionForm DOM element
     * @description Check if all required inputs have values 
     * @returns {boolean} <i>true</i> if all required inputs have values otherwise <i>false</i>
     */
    AccordionForm.IsCompleted = function (accordionForm) {

        return Form.IsCompleted(accordionForm);

    };

    /**
     * @function AccordionForm.AddFormParameters
     * @param {UiParameter[]} uiParameters - A list of UiParameters with Name, Value and in some cases also UiParameters
     * @param {object} accordionForm - The AccordionForm DOM element
     * @description Add all serializable inputs of the AccordionForm to uiParameters
     * @returns {UiParameter[]} A list of UiParameters with Name, Value and in some cases also UiParameters
     */
    AccordionForm.AddFormParameters = function (uiParameters, accordionForm) {

        return Form.AddFormParameters(uiParameters, accordionForm);

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

} (window.AccordionForm = window.AccordionForm || {}, window, document, Common, Cache, Events, Velocity));
