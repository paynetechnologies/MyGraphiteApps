// Progress Display Item
// Based On: ProgressDisplayItem -> DisplayItem -> ViewElement
(function (ProgressDisplayItem, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    ProgressDisplayItem.Render = function (progressDisplayItem, displayDetail) {

        // Add DisplayDetail ID to ProgressDisplayItem
        if (Common.IsDefined(displayDetail.Id)) {
            progressDisplayItem.Name += Common.SanitizeToken(displayDetail.Id);
        }

        var className = '';
        if (Common.IsDefined(progressDisplayItem.ItemSpan)) {
            className = ' gtc-columns-' + progressDisplayItem.ItemSpan;
        }

        // Li<, TabIndex@, Class@, Id@
        var progressDisplayItemMarkup = '<li data-namespace="ProgressDisplayItem" class="gtc-progressdisplayitem gtc-displaydetail-column' + className + '"' + ViewElement.RenderAttributes(progressDisplayItem) + '>';

        // Data-Mask@
        if (Common.IsDefined(progressDisplayItem.Mask)) {
            progressDisplayItemMarkup += ' data-mask="' + progressDisplayItem.Mask + '"';
        }

        // Label
        if (Common.IsDefined(progressDisplayItem.Label) && progressDisplayItem.Label.length > 0) {
            // Span<>, Label, Span</>
            progressDisplayItemMarkup += '<span class="gtc-displaydetail-item-head"';

            // Translations and Label masking
            var dateRegex = new RegExp(/\/Date\((-?\d+)\)\//gi);
            var isDate = dateRegex.test(progressDisplayItem.Label);
            if (!isDate) {
                progressDisplayItemMarkup += ' data-translate="' + progressDisplayItem.Label + '"';
            }

            if (isDate && Common.IsDefined(progressDisplayItem.Mask)) {
                var formatResult = Mask.Format(progressDisplayItem.Label, Mask.BuildMaskingOptions(progressDisplayItem.Mask));
                progressDisplayItemMarkup += '>' + progressDisplayItem.Text + '</span>';
            }
            else {
                progressDisplayItemMarkup += '>' + Common.TranslateKey(progressDisplayItem.Label) + '</span>';
            }
        }

        // Span<>, Value, Span</>
        progressDisplayItemMarkup += '<span class="gtc-displaydetail-item"><div role="progressbar" aria-valuenow="0%" id="' + progressDisplayItem.Name + '-ProgressBar" class="gtc-progressbar gtc-progressdisplayitem-progressbar"></div></span>';

        // Build Widget Options
        var widgetOptions = {};
        if (Common.IsDefined(progressDisplayItem.TextColor)) {
            widgetOptions.Color = progressDisplayItem.TextColor;
        }
        widgetOptions.HasStriping = false;
        if (Common.IsDefined(progressDisplayItem.Value)) {
            widgetOptions.CurrentFill = progressDisplayItem.Value;
        }
        widgetOptions.HideOnComplete = false;

        // Configure progress bar on ready
        Events.One(document.body, 'configureprogressdisplayitem',
            function () {
                Widgets.progressbar(Common.Get(progressDisplayItem.Name + '-ProgressBar'), widgetOptions);
            }
        );

        // Li</>
        progressDisplayItemMarkup += '</li>';
        return progressDisplayItemMarkup;

    };

    ProgressDisplayItem.UpdateValue = function (progressDisplayItem, value, promises, context) {

        var onParent = context == 'Parent';
        Widgets.progressbar(Common.Get(progressDisplayItem.id + '-ProgressBar', onParent), 'UpdateValue', value);

    };

    ProgressDisplayItem.UpdateColor = function (progressDisplayItem, value, promises, context) {

        var onParent = context == 'Parent';
        Widgets.progressbar(Common.Get(progressDisplayItem.id + '-ProgressBar', onParent), 'UpdateColor', value);

    };

} (window.ProgressDisplayItem = window.ProgressDisplayItem || {}, window, document, Common, Cache, Events, Velocity));
