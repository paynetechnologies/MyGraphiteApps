// Progress Step
// Based On: ProgressStep -> ViewElement
(function (ProgressStep, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ProgressStep.Render = function (progressStep, stepIndex) {

        // Get Status
        var status = 'gtc-progressstep-status-';
        if (Common.IsDefined(progressStep.Status)) {
            status += progressStep.Status.toLowerCase();
        }
        else {
            progressStep.Status = 'None';
            status += 'none';
        }

        // Expandable Item Count
        var displayItemCount = 0;
        if (Common.IsDefined(progressStep.DisplayItems)) {
            displayItemCount = progressStep.DisplayItems.length;
        }

        // Div<, TabIndex@, Class@, Id@, Div>
        var progressStepMarkup = '<div data-currentstatus="' + progressStep.Status + '" class="gtc-progressstep ' + status + '"'; 
        if (displayItemCount > 0) {
            progressStepMarkup += ' style="cursor:pointer;"';
        }
        progressStepMarkup += ' data-namespace="ProgressStep"' + ViewElement.RenderAttributes(progressStep) + ' data-step="' + stepIndex + '">';

        // Title
        progressStepMarkup += '<div class="gtc-progressstep-title">';
        if (Common.IsDefined(progressStep.Title)) {
            progressStepMarkup += '<span data-translate="' + progressStep.Title + '">' + Common.TranslateKey(progressStep.Title) + '</span>';
            if (displayItemCount > 0) {
                progressStepMarkup += '<span><i style="margin-left: 5px; vertical-align: text-top;" class="gtc-icon-styles fa fa-sort-down"></i></span>';
            }
            progressStepMarkup += '<span><i class="gtc-icon-styles fa fa-check"></i></span>';
        }
        progressStepMarkup += '</div>';

        // Expandable Details
        progressStepMarkup += '<div aria-expanded="false" id="' + progressStep.Name + 'Expandable" class="gtc-progressstep-expandable">';
        if (displayItemCount > 0) {
            // Ul<>
            progressStepMarkup += '<ul class="gtc-progressstep-row">';

            // Display Fields
            var displayItem, index = 0;
            for ( ; index < displayItemCount; index++) {
                displayItem = progressStep.DisplayItems[index];

                // Build Display Item
                var displayItemNamespace = window[displayItem.Type.toString()];
                progressStepMarkup += displayItemNamespace.Render(displayItem);

                // Append Line?
                if (displayItem.AppendLine == 'Yes' && displayItemCount != index + 1) {
                    progressStepMarkup += '</ul><ul class="gtc-progressstep-row">';
                }
            }

            // Ul</>
            progressStepMarkup += '</ul>';

            // Wire click
            Events.On(document.body, 'click.' + progressStep.Name, '#' + progressStep.Name,
                function (event) {
                    event.preventDefault();
                    var currentStep = Common.Query('.gtc-progressstep-expandable', this);
                    var allExpandables = Common.QueryAll('.gtc-progressstep-expandable:not(#' + currentStep.id + ')'), index = 0, length = allExpandables.length;
                    for ( ; index < length; index++) {
                        Common.RemoveClass(allExpandables[index], 'gtc-progressstep-expandable-open');
                        Common.SetAttr(allExpandables[index], 'aria-expanded', 'false');
                    }
                    Velocity(allExpandables, 'slideUp');
                    if (Common.IsHidden(currentStep)) {
                        Velocity(currentStep, 'slideDown', 'slow',
                            function () {
                                Common.ResizeView();
                            }
                        );
                        Common.AddClass(this, 'gtc-progressstep-expandable-open');
                        Common.SetAttr(currentStep, 'aria-expanded', 'true');
                    }
                    else {
                        Velocity(currentStep, 'slideUp', 'slow',
                            function () {
                                Common.ResizeView();
                            }
                        );
                        Common.RemoveClass(this, 'gtc-progressstep-expandable-open');
                        Common.SetAttr(currentStep, 'aria-expanded', 'false');
                    }
                }
            );
        }
        progressStepMarkup += '</div>';

        // Div</>
        progressStepMarkup += '</div>';
        return progressStepMarkup;

    };

    ProgressStep.SetStatus = function (progressStep, progressStatus) {

        var currentStatus = Common.GetAttr(progressStep, 'data-currentstatus');
        Common.RemoveClass(progressStep, 'gtc-progressstep-status-' + currentStatus.toLowerCase());
        Common.SetAttr(progressStep, 'data-currentstatus', progressStatus);
        Common.AddClass(progressStep, 'gtc-progressstep-status-' + progressStatus.toLowerCase());
        var stepIcon = Common.Query('.gtc-progressstep-title > span:last-child > i', progressStep);
        var lastSpan = Common.Query('.gtc-progressstep-title > span:last-child', progressStep);
        if (progressStatus == 'Running') {
            Common.RemoveClass(stepIcon, 'fa-check');
            Common.RemoveClass(stepIcon, 'fa-close');
            Common.AddClass(stepIcon, 'fa-spinner');
            Velocity(lastSpan, 'fadeIn', 'slow');
        }
        else if (progressStatus == 'Complete') {
            Common.RemoveClass(stepIcon, 'fa-spinner');
            Common.RemoveClass(stepIcon, 'fa-close');
            Common.AddClass(stepIcon, 'fa-check');
            Velocity(lastSpan, 'fadeIn', 'slow');
        }
        else if (progressStatus == 'Error') {
            Common.RemoveClass(stepIcon, 'fa-spinner');
            Common.RemoveClass(stepIcon, 'fa-check');
            Common.AddClass(stepIcon, 'fa-close');
            Velocity(lastSpan, 'fadeIn', 'slow');
        }

    };

} (window.ProgressStep = window.ProgressStep || {}, window, document, Common, Cache, Events, Velocity));
