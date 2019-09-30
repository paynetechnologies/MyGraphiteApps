// Print Button
// Based On: PrintButton -> Button -> Link -> ViewElement
(function (PrintButton, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    PrintButton.Render = function (printButton) {

        // 508 Compliance
        if (Common.IsNotDefined(printButton.Title)) {
            printButton.Title = printButton.Name;
            printButton.ScreenReaderOnly = true;
        }

        // Button<, TabIndex@, Class@, Id@, Data-ControllerPath/ActionName@, Wire OnClick!
        var className = Link.RenderClassing(printButton, 'btn');
        var printButtonMarkup = '<button data-namespace="PrintButton" class="' + className + '"' + ViewElement.RenderAttributes(printButton) + EventElement.AttachEvent(printButton.Name, 'click', printButton.OnClick, PrintButton.OnClick);

        // Setup opening print dialog if no OnCLick defined, else onclick handles it
        if (Common.IsNotDefined(printButton.OnClick)) {
            Events.On(document.body, 'click.' + printButton.Name, '#' + printButton.Name,
                function () {
                    window.print();
                }
            );
        }

        // Translations, Tooltip, 508 Compliance, Confirmation
        printButtonMarkup += Button.RenderAttributes(printButton);

        // Button>
        printButtonMarkup += ' type="button">';

        // Icon
        if (Common.IsDefined(printButton.Icon)) {
            printButtonMarkup += Icon.Render(printButton.Icon, false);
        }

        // Attach Key
        if (Common.IsDefined(printButton.AttachedKey)) {
            GTC.AttachKey(printButton.Name, printButton.AttachedKey);
        }

        // Link Text
        printButtonMarkup += Link.RenderTitle(printButton, 'button');

        // Button</>
        printButtonMarkup += '</button>';
        return printButtonMarkup;

    };

    PrintButton.OnClick = function (event) {

        // Initialize
        event.preventDefault();
        event.stopPropagation();
        var onClickParameters = [];
        var extraLogic = function () {

            // Setup opening print dialog
            Events.One(document.body, 'pageinstructionscomplete',
                function () {
                    window.print();
                }
            );

        };

        // Call OnClick
        Button.CompleteConfirmation(this, onClickParameters, extraLogic);

    };

    PrintButton.UpdateTitle = function (printButton, newTitle, promises, context) {

        Link.UpdateTitle(printButton, newTitle, promises, context);

    };

    PrintButton.ShowPinwheel = function (printButton) {

        SpinKit.Show(printButton, 'FadingCircle');

    };

    PrintButton.HidePinwheel = function (printButton) {

        SpinKit.Hide(printButton);

    };

} (window.PrintButton = window.PrintButton || {}, window, document, Common, Cache, Events, Velocity));
