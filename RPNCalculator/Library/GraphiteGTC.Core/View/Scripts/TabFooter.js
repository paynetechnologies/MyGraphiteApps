// Tab Footer
// Based On: TabFooter -> ViewElement
(function (TabFooter, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    TabFooter.Render = function (tabFooter) {

        // Ul<, TabIndex@, Class@, Id@, Ul>
        var tabIndex = tabFooter.FocusIndex;
        tabFooter.FocusIndex = null;
        var tabFooterMarkup = '<div data-namespace="TabFooter" class="gtc-uitab gtc-button-panel gtc-button-panel-default"' + ViewElement.RenderAttributes(tabFooter) + '>';

        // Close
        if (tabFooter.CloseIsDisplayed == 'Yes') {
            if (Common.IsNotDefined(tabFooter.CloseTitle)) {
                tabFooter.CloseTitle = 'TabFooterCloseButton';
            }
            tabFooterMarkup += '<a alt="' + Common.TranslateKey(tabFooter.CloseTitle) + '" class="gtc-btn gtc-btn-button gtc-btn--basic gtc-btn--basic-passive gtc-btn--size-default gtc-btn-passive" data-confirmation=\'' + JSON.stringify(tabFooter.CloseConfirmation) + '\'';
            if (Common.IsDefined(tabIndex)) {
                tabFooterMarkup += ' tabindex="' + tabIndex + '"';
            }
            tabFooterMarkup += ' id="TabFooterCloseButton" data-translate="' + tabFooter.CloseTitle + ';[alt]' + tabFooter.CloseTitle + ';">' + Common.TranslateKey(tabFooter.CloseTitle) + '</a>';
        }

        // Save
        if (tabFooter.SaveIsDisplayed == 'Yes') {
            tabFooterMarkup += '<a alt="' + Common.TranslateKey(tabFooter.SaveTitle) + '" class="gtc-btn gtc-btn-button gtc-btn--basic gtc-btn--basic-warning gtc-btn--size-default gtc-btn-passive"';
            if (Common.IsDefined(tabIndex)) {
                tabFooterMarkup += ' tabindex="' + tabIndex + '"';
            }
            tabFooterMarkup += ' id="TabFooterSaveButton" data-translate="' + tabFooter.SaveTitle + ';[alt]' + tabFooter.SaveTitle + ';">' + Common.TranslateKey(tabFooter.SaveTitle) + '</a>';
        }

        // Reset
        if (tabFooter.ResetIsDisplayed == 'Yes') {
            tabFooterMarkup += '<a alt="' + Common.TranslateKey(tabFooter.ResetTitle) + '" class="gtc-btn gtc-btn-button gtc-btn--basic gtc-btn--basic-warning gtc-btn--size-default gtc-btn-passive"';
            if (Common.IsDefined(tabIndex)) {
                tabFooterMarkup += ' tabindex="' + tabIndex + '"';
            }
            tabFooterMarkup += ' id="TabFooterResetButton" data-translate="' + tabFooter.ResetTitle + ';[alt]' + tabFooter.ResetTitle + ';">' + Common.TranslateKey(tabFooter.ResetTitle) + '</a>';
        }

        // Next
        if (Common.IsNotDefined(tabFooter.NextTitle)) {
            tabFooter.NextTitle = 'TabFooterNextButton';
        }
        tabFooterMarkup += '<a alt="' + Common.TranslateKey(tabFooter.NextTitle) + '" class="gtc-btn gtc-btn-button gtc-btn--basic gtc-btn--basic-active gtc-btn--size-default gtc-btn-active"';
        if (Common.IsDefined(tabIndex)) {
            tabFooterMarkup += ' tabindex="' + tabIndex + '"';
        }
        tabFooterMarkup += ' data-buttonstate="Next" data-nexttitle="' + tabFooter.NextTitle + '" id="TabFooterNextButton" data-translate="' + tabFooter.NextTitle;
        tabFooterMarkup += '" data-submittitle="' + tabFooter.SubmitTitle + '"';
        tabFooterMarkup += ';[alt]' + tabFooter.NextTitle + ';">' + Common.TranslateKey(tabFooter.NextTitle) + '</a>';

        // Previous
        if (Common.IsNotDefined(tabFooter.PreviousTitle)) {
            tabFooter.PreviousTitle = 'TabFooterPreviousButton';
        }
        tabFooterMarkup += '<a alt="' + Common.TranslateKey(tabFooter.PreviousTitle) + '" class="gtc-btn gtc-btn-button gtc-btn--basic gtc-btn--basic-active gtc-btn--size-default gtc-btn-active"';
        if (Common.IsDefined(tabIndex)) {
            tabFooterMarkup += ' tabindex="' + tabIndex + '"';
        }
        tabFooterMarkup += ' id="TabFooterPreviousButton" data-translate="' + tabFooter.PreviousTitle + ';[alt]' + tabFooter.PreviousTitle + ';">' + Common.TranslateKey(tabFooter.PreviousTitle) + '</a>';

        // Footer Buttons
        if (Common.IsDefined(tabFooter.Buttons)) {
            var index = 0, length = tabFooter.Buttons.length;
            for ( ; index < length; index++) {
                tabFooterMarkup += Link.Render(tabFooter.Buttons[index]);
            }
        }

        // Attach keys
        if (Common.IsDefined(tabFooter.PreviousAttachedKey)) {
            GTC.AttachKey('TabFooterPreviousButton', tabFooter.PreviousAttachedKey);
        }
        if (Common.IsDefined(tabFooter.NextAttachedKey)) {
            GTC.AttachKey('TabFooterNextButton', tabFooter.NextAttachedKey);
        }

        // Ul</>
        tabFooterMarkup += '</div>';
        return tabFooterMarkup;

    };

} (window.TabFooter = window.TabFooter || {}, window, document, Common, Cache, Events, Velocity));
