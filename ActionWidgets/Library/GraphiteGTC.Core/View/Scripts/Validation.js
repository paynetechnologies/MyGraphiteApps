// Validation Namespace
(function (Validation, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Validation.DisplayValidations = function (uiValidation, requestingElement, displayOnLoad) {

        // Set LastViewBehaviorReturnedValidations Session Variable
        Common.SetStorage("LastViewBehaviorReturnedValidations", true);

        // Remove any previous validation events
        Events.Off(document.body, 'click.validationResultEvents');

        // Validation Div: Div<>, Div</>
        var validationHtmlMarkup = '<div data-namespace="Validation" id="ValidationResultsSlideDownArea" class="gtc-validation"';
        if (displayOnLoad == true) {
            validationHtmlMarkup += ' style="display: block;"';
        }
        validationHtmlMarkup += '><div class="gtc-validation-header" id="ValidationIcon"><i class="gtc-icon-styles fa fa-warning"></i>';
        if (Common.IsNotDefined(uiValidation.Title) || Common.IsEmptyString(uiValidation.Title)) {
            uiValidation.Title = 'ValidationDetails';
        }
        validationHtmlMarkup += '&nbsp;<span data-translate="' + uiValidation.Title + '">' + Common.TranslateKey(uiValidation.Title) + '</span><i class="gtc-icon-styles fa fa-times"></i>';
        validationHtmlMarkup += '</div>';

        // Close validation click event
        Events.On(document.body, 'click.validationResultEvents.ValidationIcon', '#ValidationIcon',
            function () {
                Velocity(Common.Get('ValidationResultsSlideDownArea'), 'slideUp', 'slow',
                    function () {
                        if (Common.IsModal()) {
                            Common.ResizeView(true);
                        }
                    }
                );
            }
        );

        // Collect errors/warnings
        var errorValidations = [];
        var warningValidations = [];
        var uiValidationResult, index = 0, length = uiValidation.UiValidationResults.length;
        for ( ; index < length; index++) {
            if (uiValidation.UiValidationResults[index].IsError == 'Yes') {
                errorValidations.push(uiValidation.UiValidationResults[index]);
            }
            else {
                warningValidations.push(uiValidation.UiValidationResults[index]);
            }
        }

        // Display each error validation: Ol</>
        if (errorValidations.length > 0) {
            validationHtmlMarkup += '<div class="gtc-validation-error"><h5 data-translate="ErrorDetails">' + Common.TranslateKey('ErrorDetails') + '</h5>';
            validationHtmlMarkup += '<ol class="gtc-list-unstyled">';
            index = 0, length = errorValidations.length;
            var useMultiSelect = false;
            for ( ; index < length; index++) {
                uiValidationResult = errorValidations[index];
                validationHtmlMarkup += '<li id="' + uiValidationResult.Name + '"';
                if (uiValidationResult.IsOverridable == 'Yes') {
                    useMultiSelect = true;
                    validationHtmlMarkup += ' data-selectableid="' + uiValidationResult.ValidationResultId + '"><div data-selectablename="' + uiValidationResult.Name + '" class="gtc-validation-body">';
                    validationHtmlMarkup += '<label class="gtc-input-checkbox" for="' + uiValidationResult.Name + 'MultiSelectCheckbox"><input data-namespace="CheckboxField"';
                    if (uiValidationResult.IsOverridden == 'Yes') {
                        validationHtmlMarkup += ' value="Yes" checked="checked"';
                    }
                    else {
                        validationHtmlMarkup += ' value="No"';
                    }
                    validationHtmlMarkup += ' data-checkboxgroup="' + uiValidationResult.Name + 'Group" name="' + uiValidationResult.Name + 'MultiSelectCheckbox" tabindex="' + uiValidationResult.FocusIndex + '" class="gtc-validation-multiselect-checkbox" id="' + uiValidationResult.Name + 'MultiSelectCheckbox" type="checkbox" /></label>';
                }
                else {
                    validationHtmlMarkup += '><div data-selectablename="' + uiValidationResult.Name + '" class="gtc-validation-body">';
                }
                validationHtmlMarkup += '<span>' + (index + 1) + '.</span><span data-translate="' + uiValidationResult.Message + '">' + Common.TranslateKey(uiValidationResult.Message) + '</span>';
                if (uiValidationResult.IsOverridden == 'Yes') {
                    validationHtmlMarkup += '<span class="gtc-validations-user">&nbsp;(' + uiValidationResult.OverriddenByFirstName + ' ' + uiValidationResult.OverriddenByLastName + '&nbsp;-&nbsp;' + uiValidationResult.OverriddenBySecurityGroup + ')</span>';
                }
                validationHtmlMarkup += '</div></li>';
            }
            validationHtmlMarkup += '</ol></div>';

            // Update existing event buttons
            if (Common.AreAllDefined([requestingElement, uiValidation.EventDetailId])) {
                AddExistingEventDetailForGroup(requestingElement, uiValidation.EventDetailId);
            }
        }

        // Display each warning validation: Ol</>
        if (warningValidations.length > 0) {
            validationHtmlMarkup += '<div class="gtc-validation-warning"><h5 data-translate="WarningDetails">' + Common.TranslateKey('WarningDetails') + '</h5>';
            validationHtmlMarkup += '<ol class="gtc-list-unstyled">';
            index = 0, length = warningValidations.length;
            for ( ; index < length; index++) {
                uiValidationResult = warningValidations[index];
                validationHtmlMarkup += '<li id="' + uiValidationResult.Name + '"';
                validationHtmlMarkup += '><div class="gtc-validation-body">';
                validationHtmlMarkup += '<span>' + (index + 1) + '.</span><span data-translate="' + uiValidationResult.Message + '">' + Common.TranslateKey(uiValidationResult.Message) + '</span>';
                validationHtmlMarkup += '</div></li>';
            }
            validationHtmlMarkup += '</ol></div>';
        }

        // Close Div: Div/>
        validationHtmlMarkup += '</div>';

        // Remove current validations if they exist and show latest
        var validationSlideDown = Common.Get('ValidationResultsSlideDownArea');
        if (Common.IsDefined(validationSlideDown)) {
            HandleExistingValidations(useMultiSelect, validationHtmlMarkup);
        }
        else {
            validationSlideDown = Common.InsertHTMLString(Common.Get('PageMainContent'), Common.InsertType.Prepend, validationHtmlMarkup, 'ValidationResultsSlideDownArea');
            if (useMultiSelect && Common.IsFunction(Widgets.multiselect)) {
                Widgets.multiselect(validationSlideDown, { IsValidations: true });
                Common.SetAttr(validationSlideDown, 'data-usemultiselect', 'true');
            }
            Velocity(validationSlideDown, 'slideDown', 'slow',
                function () {
                    if (Common.IsModal()) {
                        Common.ResizeView(true);
                    }
                }
            );
        }
        SpinKit.CleanupAll();

    };

    Validation.ShowValidationsModal = function (validationData, isComplete, eventDisplayDetail) {

        // Build Modal: Div</>, Div<
        var divOverlay = '<div id="ValidationResultsModalOverlay" class="gtc-modal-overlay"></div>';
        var divModal = '<div id="ValidationResultsModal" class="gtc-modal-validation gtc-modal-small">';
        divModal += '<a class="gtc-modal-close"></a><div id="ValidationResultsModalInnerDiv" class="gtc-modal-validation-results"><h2><i class="gtc-icon-styles fa fa-warning gtc-validation-icon-error"></i><span data-translate="ErrorDetails">&nbsp;' + Common.TranslateKey('ErrorDetails') + '</span></h2>';
        divModal += '<ol class="gtc-list-unstyled">';

        // Display each validation
        var useMultiSelect = false, uiValidationResult, index = 0, length = validationData.UiValidationResults.length;
        for ( ; index < length; index++) {
            uiValidationResult = validationData.UiValidationResults[index];
            divModal += '<li id="' + uiValidationResult.Name + '"';
            if (uiValidationResult.IsOverridable == 'Yes') {
                useMultiSelect = true;
                divModal += ' data-selectableid="' + uiValidationResult.ValidationResultId + '"><div data-selectablename="' + uiValidationResult.Name + '" class="gtc-validation-body">';
                divModal += '<label class="gtc-input-checkbox" for="' + uiValidationResult.Name + 'MultiSelectCheckbox"><input data-namespace="CheckboxField"';
                if (uiValidationResult.IsOverridden == 'Yes') {
                    divModal += ' value="Yes" checked="checked"';
                }
                else {
                    divModal += ' value="No"';
                }
                divModal += ' data-checkboxgroup="' + uiValidationResult.Name + 'Group" name="' + uiValidationResult.Name + 'MultiSelectCheckbox" tabindex="' + uiValidationResult.FocusIndex + '" class="gtc-validation-multiselect-checkbox" id="' + uiValidationResult.Name + 'MultiSelectCheckbox" type="checkbox" /></label>';
            }
            else {
                divModal += '><div data-selectablename="' + uiValidationResult.Name + '" class="gtc-validation-body">';
            }
            divModal += '<span>' + (index + 1) + '.</span><span data-translate="' + uiValidationResult.Message + '">' + Common.TranslateKey(uiValidationResult.Message) + '</span>';
            if (uiValidationResult.IsOverridden == 'Yes') {
                divModal += '<span class="gtc-validations-user">&nbsp;(' + uiValidationResult.OverriddenByFirstName + ' ' + uiValidationResult.OverriddenByLastName + '&nbsp;-&nbsp;' + uiValidationResult.OverriddenBySecurityGroup + ')</span>';
            }
            divModal += '</div></li>';
        }
        divModal += '</ol>';
        divModal += '</div>';

        // Cancel Button
        divModal += '<button type="button" class="gtc-btn gtc-btn-default gtc-btn-passive" id="ValidationResultsCancelButton"><span data-translate="Cancel">' + Common.TranslateKey('Cancel') + '</span></button>';

        // Save Button
        divModal += '<button type="button" class="gtc-btn gtc-btn-default gtc-btn-active" data-namespace="Button" id="ValidationResultsOKButton"><span data-translate="OK">' + Common.TranslateKey('OK') + '</span></button>';
        divModal += '</div>';

        // Add Modal to Body
        Common.InsertHTMLString(window.parent.document.body, Common.InsertType.Append, divOverlay);
        Common.InsertHTMLString(window.parent.document.body, Common.InsertType.Append, divModal);

        // Add MultiSelect
        var validationModalDiv = Common.Get('ValidationResultsModalInnerDiv');
        if (useMultiSelect && isComplete != 'Yes' && Common.IsFunction(Widgets.multiselect)) {
            Widgets.multiselect(validationModalDiv, { IsValidations: true });
            Common.SetAttr(validationModalDiv, 'data-usemultiselect', 'true');
        }
        else if (useMultiSelect && isComplete == 'Yes') {
            var checkboxes = Common.QueryAll('.gtc-validation-multiselect-checkbox', validationModalDiv);
            Widgets.checkbox(checkboxes,
                {
                    ClassLabelCheckboxUnchecked: 'gtc-classLabelCheckboxUnchecked',
                    ClassLabelCheckboxUncheckedHover: 'gtc-classLabelCheckboxUncheckedHover',
                    ClassLabelCheckboxChecked: 'gtc-input-checkbox-selected',
                    ClassLabelCheckboxCheckedHover: 'gtc-classLabelCheckboxCheckedHover'
                }
            );
            Widgets.checkbox(checkboxes, 'DisableControl');
        }

        // Center
        var resultsModal = Common.Get('ValidationResultsModal', true);
        var resultsModalOverlay = Common.Get('ValidationResultsModalOverlay', true);
        Modals.CenterHiddenDiv(resultsModal);

        // Show Modal
        Velocity(resultsModalOverlay, { opacity: .5 }, { duration: 'slow', display: 'block' });
        Velocity(resultsModal, 'fadeIn', 'slow');

        // Handle OK Click
        var okButton = Common.Get('ValidationResultsOKButton', true);
        var onClickFunction = null;
        if (isComplete != 'Yes') {
            onClickFunction = function () {
                // OnSaveValidations Parameters
                var onSaveValidationsParameters = [
                    {
                        Name: 'OverriddenValidations',
                        Value: null,
                        UiParameters: Validation.SerializeArray(true)
                    },
                    {
                        Name: 'ExistingEventDetail',
                        Value: validationData.EventDetailId,
                        UiParameters: null
                    }
                ];
                EventDisplayDetail.OnSaveValidations(onSaveValidationsParameters, okButton, eventDisplayDetail);
            };
        }
        else {
            onClickFunction = Validation.CloseValidationsModal;
        }
        Events.On(okButton, 'click', onClickFunction);

        // Handle Close Click
        Events.On(Common.QueryAll('.gtc-modal-close, #ValidationResultsCancelButton', window.parent.document), 'click',
            function () {
                Validation.CloseValidationsModal();
            }
        );

    };

    Validation.CloseValidationsModal = function () {

        var resultsModal = Common.Get('ValidationResultsModal', true);
        var resultsModalOverlay = Common.Get('ValidationResultsModalOverlay', true);
        Velocity(resultsModal, 'fadeOut', 'slow',
            function () {
                Common.Remove(resultsModal);
            }
        );
        Velocity(resultsModalOverlay, 'fadeOut', 'slow',
            function () {
                Common.Remove(resultsModalOverlay);
            }
        );

    };

    Validation.RemoveValidations = function () {

		// Parent
		var ctx = window.parent;
        var validationSlideDownParent = ctx.Common.Get('ValidationResultsSlideDownArea');
        if (ctx.Common.IsDefined(validationSlideDownParent)) {
            // Remove any previous validation events
            ctx.Events.Off(ctx.document.body, 'click.validationResultEvents');

            // Remove any displayed validations
            ctx.Velocity(validationSlideDownParent, 'slideUp', 'slow',
                function () {
                    ctx.Common.Remove(validationSlideDownParent);
                }
            );
        }

		// Current
        var validationSlideDown = Common.Get('ValidationResultsSlideDownArea');
        if (Common.IsDefined(validationSlideDown)) {
            // Remove any previous validation events
            Events.Off(document.body, 'click.validationResultEvents');

            // Remove any displayed validations
            Velocity(validationSlideDown, 'slideUp', 'slow',
                function () {
                    Common.Remove(validationSlideDown);
                }
            );
        }

    };

    Validation.SerializeArray = function (fromValidationsModal) {

        var uiParameters = null;
        var element = null;
        if (fromValidationsModal == true) {
            element = Common.Get('ValidationResultsModalInnerDiv');
        }
        else {
            element = Common.Get('ValidationResultsSlideDownArea');
        }
        if (Common.IsDefined(element) && Common.GetAttr(element, 'data-usemultiselect') == 'true') {
            var overriddenValidations = Widgets.multiselect(element, 'GetSelected');
            uiParameters = [];
            var overriddenValidation, index = 0, length = overriddenValidations.length;
            for ( ; index < length; index++) {
                overriddenValidation = overriddenValidations[index];
                uiParameters.push(
                    {
                        Name: 'ValidationResult',
                        Value: null,
                        UiParameters: [
                            {
                                Name: 'Id',
                                Value: Common.GetAttr(overriddenValidation.parentNode, 'data-selectableid'),
                                UiParameters: null
                            }
                        ]
                    }
                );
            }
        }
        return uiParameters;

    };

    // Private Methods
    function HandleExistingValidations(useMultiSelect, validationHtmlMarkup) {

        var validationSlideDown = Common.Get('ValidationResultsSlideDownArea');
        Velocity(validationSlideDown, 'slideUp', 'slow',
            function () {
                Common.Remove(validationSlideDown);
                Common.InsertHTMLString(Common.Get('PageMainContent'), Common.InsertType.Prepend, validationHtmlMarkup);
                validationSlideDown = Common.Get('ValidationResultsSlideDownArea');
                if (useMultiSelect && Common.IsFunction(Widgets.multiselect)) {
                    Widgets.multiselect(validationSlideDown, { IsValidations: true });
                    Common.SetAttr(validationSlideDown, 'data-usemultiselect', 'true');
                }
                Velocity(validationSlideDown, 'slideDown', 'slow',
                    function () {
                        if (Common.IsModal()) {
                            Common.ResizeView(true);
                        }
                    }
                );
            }
        );

    };

    function AddExistingEventDetailForGroup (element, existingEventDetail) {

        // Sanity Checks
        var elementNamespace = Common.GetAttr(element, 'data-namespace');
        if (elementNamespace != 'EventButton') {
            return;
        }

        // Setup Ui Parameter
        var existingEventDetailParameter = [
            {
                Name: 'ExistingEventDetail',
                Value: existingEventDetail,
                UiParameters: null
            }
        ];

        // Add to Ui Parameters
        var groupName = Common.GetAttr(element, 'data-groupname');
        if (Common.IsDefined(groupName)) {
            var eventButtons = Common.QueryAll('[data-groupname="' + groupName + '"]');
            var index = 0, length = eventButtons.length;
            for ( ; index < length; index++) {
                SetUiParametersForExistingEvent(eventButtons[index], existingEventDetailParameter);
            }
        }
        else {
            SetUiParametersForExistingEvent(element, existingEventDetailParameter);
        }

    };

    function SetUiParametersForExistingEvent (button, existingEventDetailParameter) {

        var onClickEvent = Common.GetAttr(button, 'data-click');
        if (Common.IsDefined(onClickEvent)) {
            onClickEvent = JSON.parse(onClickEvent);

            // Check for existing uiParameter else add new uiParameter
            if (Common.IsDefined(onClickEvent.UiParameters)) {
                var eventExists = false, index = 0, length = onClickEvent.UiParameters.length;
                for ( ; index < length; index++) {
                    if (onClickEvent.UiParameters[index].Name == 'ExistingEventDetail') {
                        eventExists = true;
                        onClickEvent.UiParameters[index].Value = existingEventDetailParameter[0].Value;
                        break;
                    }
                }

                // Add new parameter if existing parameter was not found
                if (!eventExists) {
                    onClickEvent.UiParameters = onClickEvent.UiParameters.concat(existingEventDetailParameter);
                }
            }
            else {
                onClickEvent.UiParameters = existingEventDetailParameter;
            }

            // Set attribute
            Common.SetAttr(button, 'data-click', JSON.stringify(onClickEvent));
        }

    };

} (window.Validation = window.Validation || {}, window, document, Common, Cache, Events, Velocity));
