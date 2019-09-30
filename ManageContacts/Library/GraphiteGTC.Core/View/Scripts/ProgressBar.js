// ProgressBar
// Based On: ProgressBar -> ViewElement
(function (ProgressBar, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ProgressBar.Render = function (progressBar) {

        // Div<, TabIndex@, Class@, Id@, Div>
        var className = 'gtc-progressbar';
        if (progressBar.IsRounded == 'Yes') {
            className += ' gtc-progressbar-rounded';
        }
        var progressBarMarkup = '<div role="progressbar" aria-valuenow="0" class="' + className + '" data-namespace="ProgressBar"' + ViewElement.RenderAttributes(progressBar);

        // On Complete Event
        if (Common.IsEventViewElementDefined(progressBar.OnComplete)) {
            // Data-ControllerPath/ActionName
            progressBarMarkup += ' data-complete=\'' + JSON.stringify(progressBar.OnComplete) + '\'';
        }

        // Build Widget Options
        var widgetOptions = BuildWidgetOptions(progressBar);

        // Configure progress bar on ready
        Events.One(document.body, 'configureprogressbar',
            function () {
                Widgets.progressbar(Common.Get(progressBar.Name), widgetOptions);
            }
        );

        // Div</>
        progressBarMarkup += '></div>';
        return progressBarMarkup;

    };

    ProgressBar.OnComplete = function (progressBar) {

        // Initialize
        var onCompleteParameters = [];

        // Get OnCompleteEvent object
        var onCompleteEvent = JSON.parse(Common.GetAttr(progressBar, 'data-complete'));
        if (Common.IsDefined(onCompleteEvent.UiParameters)) {
            onCompleteParameters = onCompleteParameters.concat(onCompleteEvent.UiParameters);
        }

        // Execute View Behavior
        Common.ExecuteViewBehavior(onCompleteEvent.ControllerPath + onCompleteEvent.ActionName, onCompleteParameters, Page.RunInstructions, progressBar);

    };

    ProgressBar.UpdateValue = function (progressBar, fillToPercentageOrInstruction) {

        if (fillToPercentageOrInstruction == "Start") {
            Widgets.progressbar(progressBar, 'StartControl');
        }
        else if (fillToPercentageOrInstruction == "Complete") {
            Widgets.progressbar(progressBar, 'CompleteAnimation');
        }
        else {
            Widgets.progressbar(progressBar, 'UpdateValue', fillToPercentageOrInstruction);
        }

    };

    ProgressBar.ReplaceElement = function (progressBar, viewElements, promises) {

        // Build Markup
        var progressBarMarkup = '';
        if (Common.IsDefined(viewElements) && viewElements.length == 1) {
            var progressBarViewElement = viewElements[0];
            progressBarViewElement.IsDisplayed = 'No';
            progressBarViewElement.WaitsForFillInstructions = true;
            progressBarMarkup += ProgressBar.Render(progressBarViewElement);
            var widgetOptions = BuildWidgetOptions(progressBarViewElement);

            // Get deferred object for animation
            var animationPromise = Common.Promise();
            promises.push(animationPromise.promise);

            // Append
            Common.InsertHTMLString(progressBar, Common.InsertType.Append, progressBarMarkup);
            Widgets.progressbar(Common.Get(progressBarViewElement.Name), widgetOptions);
            Velocity(Common.Get(progressBarViewElement.Name), 'slideDown', 'slow',
                function () {
                    Widgets.progressbar(this, 'StartControl');
                    animationPromise.resolve();
                }
            );
        }

    };

    // Private Methods
    function BuildWidgetOptions (progressBar) {

        // Initialize
        var widgetOptions = {};

        // Color
        if (Common.IsDefined(progressBar.Color)) {
            widgetOptions.Color = progressBar.Color;
        }

        // Add Striping?
        if (progressBar.HasStriping == 'Yes') {
            widgetOptions.HasStriping = true;
        }
        else {
            widgetOptions.HasStriping = false;
        }

        // Dimension
        var dimensionStyle = StyleHelper.BuildDimensionStyle(progressBar.Dimension);
        if (Common.IsDefined(dimensionStyle)) {
            if (Common.IsDefined(dimensionStyle.Height)) {
                widgetOptions.Height = dimensionStyle.Height.replace(';', '');
            }
            if (Common.IsDefined(dimensionStyle.Width)) {
                widgetOptions.Width = dimensionStyle.Width.replace(';', '');
            }
        }

        // On Complete
        if (Common.IsDefined(progressBar.OnComplete)) {
            widgetOptions.OnCompleteEvent = true;
        }

        // Timed Fill?
        if (Common.IsDefined(progressBar.FillTime)) {
            widgetOptions.FillTime = progressBar.FillTime;
        }

        // Hide On Complete?
        if (progressBar.HideOnComplete == 'Yes') {
            widgetOptions.HideOnComplete = true;
        }
        else {
            widgetOptions.HideOnComplete = false;
        }

        // Added option for page inserts (WaitToStart)
        if (progressBar.WaitsForFillInstructions == 'Yes') {
            widgetOptions.WaitForStart = true;
        }
        else {
            widgetOptions.WaitForStart = false;
        }
        return widgetOptions;

    };

} (window.ProgressBar = window.ProgressBar || {}, window, document, Common, Cache, Events, Velocity));
