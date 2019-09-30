// Secure Field
// Based On: SecureField -> PlaceholderField -> ValueField -> Field -> ViewElement
(function (SecureField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    SecureField.Render = function (secureField) {

        // Label Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(secureField.Label)) {
            labelExists = false;
        }

        // Label
        var secureFieldMarkup = Field.RenderLabel(secureField);

        // input<, Placeholder@, Name@, Value@, @Data-Serializable, TabIndex@, Class@, Id@, Data-Disabled@
        secureFieldMarkup += '<input class="gtc-input-securefield';
        if (Common.IsDefined(secureField.Icon)) {
            if (labelExists == false) {
                secureFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                secureFieldMarkup += ' gtc-input__icon-label-left';
            }
        }
        secureFieldMarkup += '"' + PlaceholderField.RenderAttributes(secureField) + Field.RenderAttributes(secureField);

        // Data-HasChanged@ Event
        if (secureField.IsSerializable == 'Yes') {
            Events.On(document.body, 'change.fieldvaluechange.' + secureField.Name, '#' + secureField.Name,
                function () {
                    Common.GetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // 508 Compliance
        if (secureField.IsRequired == 'Yes') {
            secureFieldMarkup += ' aria-required="true"';
        }

        // Data-ControllerPath/ActionName@, Wire OnChange!
        if (Common.IsEventViewElementDefined(secureField.OnChange)) {
            secureFieldMarkup += Field.AttachOnChange(secureField, SecureField.OnChange);
        }

        // Setup Password?
        var strengthRequirementMarkup = '';
        if (secureField.SetupPassword == 'Yes') {
            // Parse ints and define for later scope
            var passwordComplexityInt = parseInt(secureField.PasswordComplexity, 10);
            var passwordLengthInt = parseInt(secureField.PasswordLength, 10);

            // Add extra attributes to field
            secureFieldMarkup += ' data-length="' + secureField.PasswordLength + '"';
            secureFieldMarkup += ' data-complexity="' + secureField.PasswordComplexity + '"';

            // Build Dots Markup and Requirements Drop Down Markup
            strengthRequirementMarkup += '<div id="' + secureField.Name + 'StrengthDots" class="gtc-strength-dots">';
            strengthRequirementMarkup += '<span id="' + secureField.Name + 'StrengthDotsOne" class="gtc-strength-dot"></span>';
            strengthRequirementMarkup += '<span id="' + secureField.Name + 'StrengthDotsTwo" class="gtc-strength-dot"></span>';
            strengthRequirementMarkup += '<span id="' + secureField.Name + 'StrengthDotsThree" class="gtc-strength-dot"></span>';
            strengthRequirementMarkup += '<span id="' + secureField.Name + 'StrengthDotsFour" class="gtc-strength-dot"></span></div>';
            strengthRequirementMarkup += '<div class="gtc-password-requirements" id="' + secureField.Name + 'Requirements"><ul>';
            strengthRequirementMarkup += '<li id="' + secureField.Name + 'PasswordLength">Password must have at least ' + secureField.PasswordLength + ' characters.</li>';
            if (passwordComplexityInt > 0) {
                strengthRequirementMarkup += '<li>Password must have ';
                switch (passwordComplexityInt) {
                    case 1:
                        strengthRequirementMarkup += '<span id="' + secureField.Name + 'ComplexityDisplay">one</span>';
                        break;
                    case 2:
                        strengthRequirementMarkup += '<span id="' + secureField.Name + 'ComplexityDisplay">two</span>';
                        break;
                    case 3:
                        strengthRequirementMarkup += '<span id="' + secureField.Name + 'ComplexityDisplay">three</span>';
                        break;
                    case 4:
                        strengthRequirementMarkup += '<span id="' + secureField.Name + 'ComplexityDisplay">all</span>';
                        break;
                }
                strengthRequirementMarkup += ' of the following:<ul>';
                strengthRequirementMarkup += '<li id="' + secureField.Name + 'LowerCaseDisplay">At least one lowercase letter</li>';
                strengthRequirementMarkup += '<li id="' + secureField.Name + 'UppercaseDisplay">At least one uppercase letter</li>';
                strengthRequirementMarkup += '<li id="' + secureField.Name + 'NumberDisplay">At least one number</li>';
                strengthRequirementMarkup += '<li id="' + secureField.Name + 'SybmolDisplay">At least one symbol</li>';
                strengthRequirementMarkup += '</ul></li>';
            }
            strengthRequirementMarkup += '</ul></div>';

            // Attach focus event to show requirements drop down and more
            Events.On(document.body, 'focusin.testpassword.' + secureField.Name, '#' + secureField.Name,
                function () {
                    // Initialize
                    var secureFieldObject = Common.Get(secureField.Name);
                    var passwordLength = Common.Get(secureField.Name + 'PasswordLength');
                    var lowerCase = Common.Get(secureField.Name + 'LowerCaseDisplay');
                    var upperCase = Common.Get(secureField.Name + 'UppercaseDisplay');
                    var number = Common.Get(secureField.Name + 'NumberDisplay');
                    var symbol = Common.Get(secureField.Name + 'SybmolDisplay');
                    var complexity = Common.Get(secureField.Name + 'ComplexityDisplay');
                    var strengthOne = Common.Get(secureField.Name + 'StrengthDotsOne');
                    var strengthTwo = Common.Get(secureField.Name + 'StrengthDotsTwo');
                    var strengthThree = Common.Get(secureField.Name + 'StrengthDotsThree');
                    var strengthFour = Common.Get(secureField.Name + 'StrengthDotsFour');

                    // Position requirements drop down and show it
                    var secureFieldPosition = Common.Position(secureFieldObject);
                    var posLeft = secureFieldPosition.left;
                    var posTop = secureFieldPosition.top + Common.Height(secureFieldObject, true);
                    var secureFieldWidth = Common.Width(secureFieldObject, true);
                    var requirementsSection = Common.Get(secureField.Name + 'Requirements');
                    var requirementsStyle = requirementsSection.style;
                    requirementsStyle.left = posLeft + 'px';
                    requirementsStyle.width = secureFieldWidth + 'px';
                    requirementsStyle.top = posTop + 'px';
                    Velocity(requirementsSection, 'slideDown', 'slow');

                    // Adjust screen height if needed
                    var calendarDisplayHeight = Common.Height(requirementsSection, true);
                    var coords = Common.Offset(requirementsSection.previousSibling);
                    if (Common.IsModal()) {
                        var modalSecureField = Common.Query('.gtc-modal-iframe', null, true);
                        var modalBottom = Common.Height(modalSecureField.parentNode) + Common.Offset(modalSecureField.parentNode).top;
                        var secureFieldBottom = calendarDisplayHeight + Common.Offset(secureFieldObject.parentNode).top + coords.top + Common.Height(secureFieldObject.parentNode) + Common.Offset(modalSecureField.parentNode).top;
                        if (secureFieldBottom > modalBottom) {
                            Cache.Set(secureFieldObject, 'IsHeightIncreased', true);
                            Cache.Set(secureFieldObject, 'HeightIncrease', secureFieldBottom - modalBottom + (parseInt(calendarDisplayHeight) * 2));
                            var currentHeight = parseInt(modalSecureField.parentNode.style.height, 10);
                            modalSecureField.parentNode.style.height = (currentHeight + Cache.Get(secureFieldObject, 'HeightIncrease')) + 'px';
                        }
                    }

                    // Setup password strength check
                    Events.On(secureFieldObject, 'keyup keydown',
                        function () {
                            // Get currently entered password
                            var currentValue = this.value;

                            // If field empty remove all styling or update requirements and strength test
                            if (currentValue.length > 0) {
                                var requirementsPass = true;

                                // Check length requirement and update drop down
                                if (currentValue.length < passwordLengthInt) {
                                    requirementsPass = false;
                                    StrengthClass('Remove', passwordLength, 'gtc-requirement-pass');
                                    StrengthClass('Add', passwordLength, 'gtc-requirement-fail');

                                }
                                else {
                                    StrengthClass('Remove', passwordLength, 'gtc-requirement-fail');
                                    StrengthClass('Add', passwordLength, 'gtc-requirement-pass');
                                }

                                // Define complexity points value
                                var currentPoints = 0;

                                // Test lower case requirement and update drop down
                                if (/[a-z]/.test(currentValue)) {
                                    currentPoints++;
                                    StrengthClass('Add', lowerCase, 'gtc-requirement-pass');
                                }
                                else {
                                    StrengthClass('Remove', lowerCase, 'gtc-requirement-pass');
                                }

                                // Test upper case requirement and update drop down
                                if (/[A-Z]/.test(currentValue)) {
                                    currentPoints++;
                                    StrengthClass('Add', upperCase, 'gtc-requirement-pass');
                                }
                                else {
                                    StrengthClass('Remove', upperCase, 'gtc-requirement-pass');
                                }

                                // Test number requirement and update drop down
                                if (/[0-9]/.test(currentValue)) {
                                    currentPoints++;
                                    StrengthClass('Add', number, 'gtc-requirement-pass');
                                }
                                else {
                                    StrengthClass('Remove', number, 'gtc-requirement-pass');
                                }

                                // Test symbol requirement and update drop down
                                if (/[!@#$%^&*()\-_=+<>.?]/.test(currentValue)) {
                                    currentPoints++;
                                    StrengthClass('Add', symbol, 'gtc-requirement-pass');
                                }
                                else {
                                    StrengthClass('Remove', symbol, 'gtc-requirement-pass');
                                }

                                // Check complexity requirement and update drop down
                                if (currentPoints < passwordComplexityInt) {
                                    requirementsPass = false;
                                    StrengthClass('Remove', complexity, 'gtc-requirement-pass');
                                    StrengthClass('Add', complexity, 'gtc-requirement-fail');
                                }
                                else {
                                    StrengthClass('Remove', complexity, 'gtc-requirement-fail');
                                    StrengthClass('Add', complexity, 'gtc-requirement-pass');
                                }

                                // If we fail requirements update strength dots to show failure
                                if (!requirementsPass) {
                                    StrengthClass('Remove', strengthOne, 'gtc-strength-dot-weak gtc-strength-dot-medium gtc-strength-dot-good');
                                    StrengthClass('Remove', strengthTwo, 'gtc-strength-dot-weak gtc-strength-dot-medium gtc-strength-dot-good');
                                    StrengthClass('Remove', strengthThree, 'gtc-strength-dot-medium gtc-strength-dot-good');
                                    StrengthClass('Remove', strengthFour, 'gtc-strength-dot-good');
                                    StrengthClass('Add', strengthOne, 'gtc-strength-dot-fail');
                                }
                                else {
                                    // Test password strength
                                    var strength = zxcvbn(currentValue);

                                    // Update dots to display weak, medium or good password strength
                                    if (strength.score == 0 || strength.score == 1) {
                                        StrengthClass('Remove', strengthOne, 'gtc-strength-dot-fail gtc-strength-dot-medium gtc-strength-dot-good');
                                        StrengthClass('Remove', strengthTwo, 'gtc-strength-dot-medium gtc-strength-dot-good');
                                        StrengthClass('Remove', strengthThree, 'gtc-strength-dot-medium gtc-strength-dot-good');
                                        StrengthClass('Remove', strengthFour, 'gtc-strength-dot-good');
                                        StrengthClass('Add', strengthOne, 'gtc-strength-dot-weak');
                                        StrengthClass('Add', strengthTwo, 'gtc-strength-dot-weak');
                                    }
                                    else if (strength.score == 2) {
                                        StrengthClass('Remove', strengthOne, 'gtc-strength-dot-fail gtc-strength-dot-weak gtc-strength-dot-good');
                                        StrengthClass('Remove', strengthTwo, 'gtc-strength-dot-weak gtc-strength-dot-good');
                                        StrengthClass('Remove', strengthThree, 'gtc-strength-dot-good');
                                        StrengthClass('Remove', strengthFour, 'gtc-strength-dot-good');
                                        StrengthClass('Add', strengthOne, 'gtc-strength-dot-medium');
                                        StrengthClass('Add', strengthTwo, 'gtc-strength-dot-medium');
                                        StrengthClass('Add', strengthThree, 'gtc-strength-dot-medium');
                                    }
                                    else if (strength.score == 3 || strength.score == 4) {
                                        StrengthClass('Remove', strengthOne, 'gtc-strength-dot-fail gtc-strength-dot-weak gtc-strength-dot-medium');
                                        StrengthClass('Remove', strengthTwo, 'gtc-strength-dot-weak gtc-strength-dot-medium');
                                        StrengthClass('Remove', strengthThree, 'gtc-strength-dot-medium');
                                        StrengthClass('Add', strengthOne, 'gtc-strength-dot-good');
                                        StrengthClass('Add', strengthTwo, 'gtc-strength-dot-good');
                                        StrengthClass('Add', strengthThree, 'gtc-strength-dot-good');
                                        StrengthClass('Add', strengthFour, 'gtc-strength-dot-good');
                                    }
                                }
                            }
                            else {
                                // Field empty, clear all requirement and strength styling
                                StrengthClass('Remove', passwordLength, 'gtc-requirement-fail gtc-requirement-pass');
                                StrengthClass('Remove', lowerCase, 'gtc-requirement-pass');
                                StrengthClass('Remove', upperCase, 'gtc-requirement-pass');
                                StrengthClass('Remove', number, 'gtc-requirement-pass');
                                StrengthClass('Remove', symbol, 'gtc-requirement-pass');
                                StrengthClass('Remove', complexity, 'gtc-requirement-fail gtc-requirement-pass');
                                StrengthClass('Remove', strengthOne, 'gtc-strength-dot-fail gtc-strength-dot-weak gtc-strength-dot-medium gtc-strength-dot-good');
                                StrengthClass('Remove', strengthTwo, 'gtc-strength-dot-fail gtc-strength-dot-weak gtc-strength-dot-medium gtc-strength-dot-good');
                                StrengthClass('Remove', strengthThree, 'gtc-strength-dot-fail gtc-strength-dot-weak gtc-strength-dot-medium gtc-strength-dot-good');
                                StrengthClass('Remove', strengthFour, 'gtc-strength-dot-fail gtc-strength-dot-weak gtc-strength-dot-medium gtc-strength-dot-good');
                            }
                        }
                    );
                }
            );

            // Attack focus out event to hide requirement drop down and remove key events
            Events.On(document.body, 'focusout.testpassword.' + secureField.Name, '#' + secureField.Name,
                function () {
                    var secureFieldObject = Common.Get(secureField.Name);
                    Velocity(Common.Get(secureField.Name + 'Requirements'), 'slideUp', 100);
                    Events.Off(secureFieldObject, 'keyup keydown');

                    // Adjust Height if it was added
                    if (Cache.Get(secureFieldObject, 'IsHeightIncreased')) {
                        Cache.Set(secureFieldObject, 'IsHeightIncreased', false);
                        if (Common.IsModal()) {
                            var modalSecureField = Common.Query('.gtc-modal-iframe', null, true);
                            var currentHeight = parseInt(modalSecureField.parentNode.style.height, 10);
                            modalSecureField.parentNode.style.height = (currentHeight - Cache.Get(secureFieldObject, 'HeightIncrease')) + 'px';
                        }
                    }
                }
            );
        }

        // @Data-NameSpace, @Data-FieldType, Type@, Input/> + extra password setup markup
        secureFieldMarkup += ' data-namespace="SecureField" type="password" />' + strengthRequirementMarkup;

        // configuresecurefield event: Setup configuring of secure (triggered from Page.Configure)
        Events.One(document.body, 'configuresecurefield',
            function (event) {
                var secureFieldObject = Common.Get(secureField.Name);

                // Handle locked field
                if (secureField.IsLocked == 'Yes') {
                    Common.SetAttr(secureFieldObject, 'data-locked', 'true');
                    Common.SetAttr(secureFieldObject, 'disabled', 'disabled');
                    Common.SetAttr(secureFieldObject, 'data-focusindex', Common.GetAttr(secureFieldObject, 'tabindex'));
                    Common.SetAttr(secureFieldObject, 'tabindex', '-1');
                    Common.AddClass(secureFieldObject, 'gtc-input-locked');
                    secureFieldObject.insertAdjacentHTML('afterend', '<span class="gtc-input-system"><i class="gtc-icon-styles fa fa-lock"></i></span>');
                    if (secureField.SetupPassword == 'Yes') {
                        Common.Get(secureFieldObject.id + 'StrengthDots').style.display = 'none';
                    }
                }
            }
        );

        // Icon
        if (Common.IsDefined(secureField.Icon)) {
            secureFieldMarkup += Icon.Render(secureField.Icon, true, labelExists);
        }
        return secureFieldMarkup;

    };

    SecureField.OnChange = function(event) {

        // Remove Prefix_
        var fieldParameterName = Common.RemovePrefix(this.name);

        // Field Value
        var fieldValueUiParameter = [
            {
                Name: fieldParameterName,
                Value:  this.value,
                UiParameters: null
            }
        ];

        // Call OnChange
        Field.OnChange(this, fieldValueUiParameter);

    };

    SecureField.Lock = function (field) {

        if (Common.IsNotDefined(Common.GetAttr(field, 'data-locked'))) {
            Common.SetAttr(field, 'data-locked', 'true');
            Common.SetAttr(field, 'disabled', 'disabled');
            Common.SetAttr(field, 'data-focusindex', Common.GetAttr(field, 'tabindex'));
            Common.SetAttr(field, 'tabindex', '-1');
            Common.AddClass(field, 'gtc-input-locked');
            field.insertAdjacentHTML('afterend', '<span class="gtc-input-system"><i class="gtc-icon-styles fa fa-lock"></i></span>');
            var strengthDots = Common.GetAllSibling(field, Common.SiblingType.Next, '.gtc-strength-dots')
            if (strengthDots.length == 1) {
                strengthDots[0].style.display = 'none';
            }
        }

    };

    SecureField.Unlock = function (field) {

        if (Common.IsDefined(Common.GetAttr(field, 'data-locked'))) {
            Common.RemoveAttr(field, 'data-locked');
            Common.RemoveAttr(field, 'disabled');
            Common.SetAttr(field, 'tabindex', Common.GetAttr(field, 'data-focusindex'));
            Common.RemoveClass(field, 'gtc-input-locked');
            Common.Remove(Common.Query('.gtc-input-system', field.parentNode));
            var strengthDots = Common.GetAllSibling(field, Common.SiblingType.Next, '.gtc-strength-dots')
            if (strengthDots.length == 1) {
                strengthDots[0].style.display = '';
            }
        }

    };

    SecureField.HasValue = function (secureField) {

        return ValueField.HasValue(secureField);

    };

    SecureField.IsCompleted = function (field) {

        return ValueField.IsCompleted(field);

    };

    SecureField.UpdateValue = function (field, fieldValue) {

        ValueField.UpdateValue(field, fieldValue);

    };

    SecureField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    SecureField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

    // Private Methods
    function StrengthClass (which, object, classString) {

        var classes = classString.split(' ');
        var className, index = 0, length = classes.length;
        for ( ; index < length; index++) {
            className = classes[index];
            var hasClass = Common.HasClass(object, className);
            if (which == 'Add') {
                if (!hasClass) {
                    Common.AddClass(object, className);
                }
            }
            else {
                if (hasClass) {
                    Common.RemoveClass(object, className);
                }
            }
        }

    };

} (window.SecureField = window.SecureField || {}, window, document, Common, Cache, Events, Velocity));
