// Progress Poll
// Based On: ProgressPoll -> ViewElement
(function (ProgressPoll, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ProgressPoll.Render = function (progressPoll) {

        // Div<, TabIndex@, Class@, Id@, Div>
        var progressPollMarkup = '<div class="gtc-progresspoll" data-currentstep="1" data-namespace="ProgressPoll"' + ViewElement.RenderAttributes(progressPoll);

        // Wait for Start / Polling Now(No)
        progressPollMarkup += '  data-waitforstart="' + progressPoll.WaitForStartInstruction + '"';
        progressPollMarkup += '  data-pollingnow="No"';

        // Polling Interval
        if (Common.IsDefined(progressPoll.PollingInterval)) {
            progressPollMarkup += '  data-pollinginterval="' + progressPoll.PollingInterval + '"';
        }

        // Steps
        if (Common.IsDefined(progressPoll.NumberOfSteps)) {
            progressPollMarkup += '  data-numberofsteps="' + progressPoll.NumberOfSteps + '"';
        }

        // On Poll Event
        if (Common.IsEventViewElementDefined(progressPoll.OnPoll)) {
            // Data-ControllerPath/ActionName
            progressPollMarkup += ' data-poll=\'' + JSON.stringify(progressPoll.OnPoll) + '\'';
        }

        // On Error Event
        if (Common.IsEventViewElementDefined(progressPoll.OnError)) {
            // Data-ControllerPath/ActionName
            progressPollMarkup += ' data-error=\'' + JSON.stringify(progressPoll.OnError) + '\'';
        }

        // On Complete Event
        if (Common.IsEventViewElementDefined(progressPoll.OnComplete)) {
            // Data-ControllerPath/ActionName
            progressPollMarkup += ' data-complete=\'' + JSON.stringify(progressPoll.OnComplete) + '\'';
        }
        progressPollMarkup += '>';

        // H2<>, Title, H2</>
        if (Common.IsDefined(progressPoll.Title)) {
            progressPollMarkup += '<h2 id="' + progressPoll.Name + 'Title" class="gtc-page-theme-color"';
            progressPollMarkup += ' data-translate="' + progressPoll.Title + '"';
            progressPollMarkup += '>' + Common.TranslateKey(progressPoll.Title) + '</h2>';
        }

        // P<>, Subtitle, P</>
        if (Common.IsDefined(progressPoll.Subtitle)) {
            progressPollMarkup += '<p id="' + progressPoll.Name + 'Badge"';
            progressPollMarkup += ' data-translate="' + progressPoll.Subtitle + '"';
            progressPollMarkup += '>' + Common.TranslateKey(progressPoll.Subtitle) + '</p>';
        }

        // Progress Steps
        progressPollMarkup += '<div class="gtc-progresspoll-steps">';
        if (Common.IsDefined(progressPoll.ProgressSteps)) {
            var index = 0, length = progressPoll.ProgressSteps.length;
            for ( ; index < length; index++) {
                progressPollMarkup += ProgressStep.Render(progressPoll.ProgressSteps[index], index + 1);
            }
        }
        progressPollMarkup += '</div>';

        // Configure polling on ready
        Events.One(document.body, 'configureprogresspoll',
            function () {
                var progressPollElement = Common.Get(progressPoll.Name);
                var waitForStart = Common.GetAttr(progressPollElement, 'data-waitforstart');
                if (waitForStart != 'Yes') {
                    StartPollingStep(progressPollElement);
                }
            }
        );

        // Render ProgressBar
        if (Common.IsDefined(progressPoll.ProgressBar)) {
            if (progressPoll.WaitForStartInstruction == 'Yes') {
                progressPoll.ProgressBar.WaitsForFillInstructions = 'Yes';
            }
            progressPollMarkup += ProgressBar.Render(progressPoll.ProgressBar);
        }

        // Div</>
        progressPollMarkup += '</div>';
        return progressPollMarkup;

    };

    ProgressPoll.OnPoll = function (progressPoll) {

        // Initialize
        var onPollParameters = [];

        // Get OnPoll object
        var onPollData = Common.GetAttr(progressPoll, 'data-poll');
        if (Common.IsDefined(onPollData)) {
            // Set/Update CurrentPollCount
            var currentPollCount = Common.GetAttr(progressPoll, 'data-currentpollcount');
            if (Common.IsDefined(currentPollCount)) {
                currentPollCount = parseInt(currentPollCount, 10) + 1;
            }
            else {
                currentPollCount = 1;
            }
            Common.SetAttr(progressPoll, 'data-currentpollcount', currentPollCount);

            // Get OnPoll Parameters
            var onPollEvent = JSON.parse(onPollData);
            if (Common.IsDefined(onPollEvent.UiParameters)) {
                onPollParameters = onPollParameters.concat(onPollEvent.UiParameters);
            }

            // Add CurrentPollCount Parameter
            var currentPollCountParameter = [
                {
                    Name: 'CurrentPollCount',
                    Value: currentPollCount,
                    UiParameters: null
                }
            ];
            onPollParameters = onPollParameters.concat(currentPollCountParameter);

            // Add CurrentPollStep Parameter
            var currentPollStep = Common.GetAttr(progressPoll, 'data-currentstep');
            var currentPollStepParameter = [
                {
                    Name: 'CurrentPollStep',
                    Value: currentPollStep,
                    UiParameters: null
                }
            ];
            onPollParameters = onPollParameters.concat(currentPollStepParameter);

            // Execute View Behavior
            Common.ExecuteViewBehavior(onPollEvent.ControllerPath + onPollEvent.ActionName, onPollParameters, Page.RunInstructions, progressPoll);
        }

    };

    ProgressPoll.OnError = function (progressPoll) {

        // Get OnError object
        var onErrorData = Common.GetAttr(progressPoll, 'data-error');
        if (Common.IsDefined(onErrorData)) {
            var onErrorEvent = JSON.parse(onErrorData);

            // Get OnError Parameters
            var onErrorParameters = [];
            if (Common.IsDefined(onErrorEvent.UiParameters)) {
                onErrorParameters = onErrorParameters.concat(onErrorEvent.UiParameters);
            }

            // Add CurrentPollStep Parameter
            var currentPollStep = Common.GetAttr(progressPoll, 'data-currentstep');
            var currentPollStepParameter = [
                {
                    Name: 'CurrentPollStep',
                    Value: currentPollStep,
                    UiParameters: null
                }
            ];
            onErrorParameters = onErrorParameters.concat(currentPollStepParameter);

            // Execute View Behavior
            Common.ExecuteViewBehavior(onErrorEvent.ControllerPath + onErrorEvent.ActionName, onErrorParameters, Page.RunInstructions, progressPoll);
        }

    };

    ProgressPoll.OnComplete = function (progressPoll) {

        // Get OnComplete object
        var onCompleteData = Common.GetAttr(progressPoll, 'data-complete');
        if (Common.IsDefined(onCompleteData)) {
            var onCompleteEvent = JSON.parse(onCompleteData);

            // Get OnComplete Parameters
            var onCompleteParameters = [];
            if (Common.IsDefined(onCompleteEvent.UiParameters)) {
                onCompleteParameters = onCompleteParameters.concat(onCompleteEvent.UiParameters);
            }

            // Execute View Behavior
            Common.ExecuteViewBehavior(onCompleteEvent.ControllerPath + onCompleteEvent.ActionName, onCompleteParameters, Page.RunInstructions, progressPoll);
        }

    };

    ProgressPoll.UpdateTitle = function (progressPoll, updatedTitle, promises, context) {

        // Initialize
        var onParent = context == 'Parent';
        var title = Common.Get(progressPoll.id + 'Title', onParent);
        var updateTitleFunction = function () {
            title.textContent = Common.TranslateKey(updatedTitle);
            Common.SetAttr(title, 'data-translate', updatedTitle);
        };
        if (Common.IsHidden(progressPoll)) {
            updateTitleFunction();
        }
        else {
            // Get deferred object for animation
            var animationPromise = Common.Promise();
            promises.push(animationPromise.promise);

            // Animate
            Velocity(title, { 'opacity': 0 }, 'slow',
                function () {
                    updateTitleFunction();
                    Velocity(title, 'reverse',
                        function () {
                            Common.RemoveOpacity(title);
                            animationPromise.resolve();
                        }
                    );
                }
            );
        }

    };

    ProgressPoll.UpdateBadge = function (progressPoll, updatedBadge, promises, context) {

        // Initialize
        var onParent = context == 'Parent';
        var badge = Common.Get(progressPoll.id + 'Badge', onParent);
        var updateBadgeFunction = function () {
            badge.textContent = Common.TranslateKey(updatedBadge);
            Common.SetAttr(badge, 'data-translate', updatedBadge);
        };
        if (Common.IsHidden(progressPoll)) {
            updateBadgeFunction();
        }
        else {
            // Get deferred object for animation
            var animationPromise = Common.Promise();
            promises.push(animationPromise.promise);

            // Animate
            Velocity(badge, { 'opacity': 0 }, 'slow',
                function () {
                    updateBadgeFunction();
                    Velocity(badge, 'reverse',
                        function () {
                            Common.RemoveOpacity(badge);
                            animationPromise.resolve();
                        }
                    );
                }
            );
        }

    };

    ProgressPoll.UpdatePollingStep = function (progressPoll, pollingStepAction) {

        if (pollingStepAction == 'Start') {
            StartPollingStep(progressPoll);
        }
        else if (pollingStepAction == 'Continue') {
            NextPollingStep(progressPoll);
        }
        else if (pollingStepAction == 'Error') {
            ErrorPollingStep(progressPoll);
        }
        else if (pollingStepAction == 'Complete') {
            CompletePollingStep(progressPoll);
        }

    };

    // Private Methods
    function StartPollingStep (progressPoll) {

        // Polling now?
        var pollingNow = Common.GetAttr(progressPoll, 'data-pollingnow');
        if (pollingNow != 'Yes') {
            // Set PollingNow to Yes
            Common.SetAttr(progressPoll, 'data-pollingnow', 'Yes');

            // Set current ProgressStep to Running
            var currentStep = parseInt(Common.GetAttr(progressPoll, 'data-currentstep'), 10);
            var currentProgressStep = Common.Query('.gtc-progressstep[data-step="' + currentStep + '"]', progressPoll);
            ProgressStep.SetStatus(currentProgressStep, 'Running');

            // Start Polling
            var intervalId = setInterval(
                function () {
                    // Call OnPoll Behavior
                    ProgressPoll.OnPoll(progressPoll);
                }, parseInt(Common.GetAttr(progressPoll, 'data-pollinginterval'), 10) * 1000
            );
            Common.SetAttr(progressPoll, 'data-intervalid', intervalId);

            // Start ProgressBar
            var progressbar = Common.Query('.gtc-progressbar', progressPoll);
            if (Common.IsDefined(progressbar)) {
                Widgets.progressbar(progressbar, 'StartControl');
            }
        }

    };

    function NextPollingStep (progressPoll) {

        var currentStep = parseInt(Common.GetAttr(progressPoll, 'data-currentstep'), 10);
        var numberOfSteps = parseInt(Common.GetAttr(progressPoll, 'data-numberofsteps'), 10);
        if (currentStep < numberOfSteps) {
            // Set next CurrentStep
            var nextStep = currentStep + 1;
            Common.SetAttr(progressPoll, 'data-currentstep', nextStep);

            // Remove CurrentPollCount
            Common.RemoveAttr(progressPoll, 'data-currentpollcount');

            // Set current ProgressStep to Complete
            var currentProgressStep = Common.Query('.gtc-progressstep[data-step="' + currentStep + '"]', progressPoll);
            ProgressStep.SetStatus(currentProgressStep, 'Complete');

            // Set next ProgressStep to Running
            var nextProgressStep = Common.Query('.gtc-progressstep[data-step="' + nextStep + '"]', progressPoll);
            ProgressStep.SetStatus(nextProgressStep, 'Running');
        }
        else {
            // Stop Polling
            clearInterval(Common.GetAttr(progressPoll, 'data-intervalid'));

            // Remove CurrentPollCount
            Common.RemoveAttr(progressPoll, 'data-currentpollcount');

            // Set current ProgressStep to Complete
            var currentProgressStep = Common.Query('.gtc-progressstep[data-step="' + currentStep + '"]', progressPoll);
            ProgressStep.SetStatus(currentProgressStep, 'Complete');

            // Call OnComplete Behavior
            ProgressPoll.OnComplete(progressPoll);
        }

    };

    function ErrorPollingStep (progressPoll) {

        // Stop Polling
        clearInterval(Common.GetAttr(progressPoll, 'data-intervalid'));

        // Set current ProgressStep to Error
        var currentStep = parseInt(Common.GetAttr(progressPoll, 'data-currentstep'), 10);
        var currentProgressStep = Common.Query('.gtc-progressstep[data-step="' + currentStep + '"]', progressPoll);
        ProgressStep.SetStatus(currentProgressStep, 'Error');

        // Call OnError Behavior
        ProgressPoll.OnError(progressPoll);

    };

    function CompletePollingStep (progressPoll) {

        // Stop Polling
        clearInterval(Common.GetAttr(progressPoll, 'data-intervalid'));

        // Complete Steps
        var allProgressSteps = Common.QueryAll('.gtc-progressstep', progressPoll);
        var progressStep, index = 0, length = allProgressSteps.length;
        for ( ; index < length; index++) {
            progressStep = allProgressSteps[index];
            (function (progressStep, currentStatus) {
                ProgressStep.SetStatus(progressStep, 'Complete');
            }(progressStep));
        }

        // Call OnComplete Behavior
        ProgressPoll.OnComplete(progressPoll);

        // Complete ProgressBar
        var progressbar = Common.Query('.gtc-progressbar', progressPoll);
        if (Common.IsDefined(progressbar)) {
            Widgets.progressbar(progressbar, 'CompleteAnimation');
        }

    };

} (window.ProgressPoll = window.ProgressPoll || {}, window, document, Common, Cache, Events, Velocity));
