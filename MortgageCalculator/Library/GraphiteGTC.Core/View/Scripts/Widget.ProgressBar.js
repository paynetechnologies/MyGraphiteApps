// Progress Bar Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var ProgressBarWidget = {

        // Options
        options: {
            HasStriping: true,
            OnCompleteEvent: false,
            FillTime: null,
            CurrentFill: '0',
            HideOnComplete: true,
            WaitForStart: false
        },

        // Public Methods
        StartControl: function () {

            this._startControl();

        },

        CompleteAnimation: function () {

            this._completeAnimation();

        },

        UpdateValue: function (fillToPercentage) {

            // Initialize
            var thisWidget = this;

            // Update fill
            thisWidget.options.CurrentFill = fillToPercentage;
            thisWidget._fill(fillToPercentage);

        },

        // Private Methods
        _startControl: function () {

            // Initialize
            var thisWidget = this;

            // Start
            if (Common.IsDefined(thisWidget.options.FillTime)) {
                thisWidget._fill(100);
            }

        },

        _completeAnimation: function () {

            // Initialize
            var thisWidget = this;

            // Stop and complete animation
            var span = Common.Query('span:first-child', thisWidget.element);
            Velocity(span, 'stop');
            Velocity(span, { 'width': '100%' }, 1500,
                function () {
                    // Call complete and hide?
                    if (thisWidget.options.OnCompleteEvent) {
                        ProgressBar.OnComplete(thisWidget.element);
                    }
                    if (thisWidget.options.HideOnComplete) {
                        Velocity(thisWidget.element, 'slideUp', 'slow',
                            function () {
                                Common.Remove(thisWidget.element);
                            }
                        );
                    }
                }
            );

        },

        _fill: function (fillToPercentage) {

            // Initialize
            var thisWidget = this;
            var speed = (Common.IsDefined(thisWidget.options.FillTime)) ? thisWidget.options.FillTime : 1;

            // Fill
            var span = Common.Query('span:first-child', thisWidget.element);
            Velocity(span, { 'width': fillToPercentage + '%' }, { duration: parseInt(speed, 10) * 1000,
                complete: function () {
                    // Call complete and hide?
                    if (parseInt(fillToPercentage, 10) == 100) {
                        if (thisWidget.options.OnCompleteEvent) {
                            ProgressBar.OnComplete(thisWidget.element);
                        }
                        if (thisWidget.options.HideOnComplete) {
                            Velocity(thisWidget.element, 'slideUp', 'slow',
                                function () {
                                    Common.Remove(thisWidget.element);
                                }
                            );
                        }
                    }
                },
                progress: function (elements) {
                    Common.SetAttr(thisWidget.element, 'aria-valuenow', elements[0].style.width);
                }}
            );

        },

        _applyElementStyles: function () {

            // Initialize
            var thisWidget = this;

            // Add dimensions
            var elementStyle = thisWidget.element.style;
            elementStyle.width = thisWidget.options.Width;
            elementStyle.height = thisWidget.options.Height;

        },

        _buildInnerFill: function () {

            // Initialize
            var thisWidget = this;

            // Generate Color
            var colorStyle = '';
            if (Colors.IsGradient(thisWidget.options.Color) === true) {
                var gradientValues = Colors.ProcessValue(thisWidget.options.Color, false, null);
                gradientUpperValue = gradientValues[0];
                gradientLowerValue = gradientValues[1];
                colorStyle += 'background: -moz-linear-gradient(' + gradientUpperValue + ', ' + gradientLowerValue + ');';
                colorStyle += 'background: -ms-linear-gradient(' + gradientUpperValue + ', ' + gradientLowerValue + ');';
                colorStyle += 'background: -o-linear-gradient(' + gradientUpperValue + ', ' + gradientLowerValue + ');';
                colorStyle += 'background: -webkit-gradient(linear, left top, left bottom, from(' + gradientUpperValue + '), to(' + gradientLowerValue + '));';
                colorStyle += 'background: -webkit-linear-gradient(' + gradientUpperValue + ', ' + gradientLowerValue + ');';
                colorStyle += 'background: linear-gradient(' + gradientUpperValue + ', ' + gradientLowerValue + ');';
                colorStyle += 'filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=\'' + gradientUpperValue + '\', endColorstr=\'' + gradientLowerValue + '\');';
            }
            else {
                colorStyle += 'background: ' + Colors.ProcessValue(thisWidget.options.Color, false, null);
            }

            // Add inner span with striping and custom colors if set
            var spanMarkup = '<span class="gtc-progressbar-meter';
            if (thisWidget.options.HasStriping) {
              spanMarkup += ' gtc-progressbar-meter-striped';
            }
            spanMarkup += '" style="width: ' + thisWidget.options.CurrentFill + '%;';
            if (thisWidget.options.Color) {
              spanMarkup += ' ' + colorStyle;
            }
            spanMarkup += '"></span>';
            Common.InsertHTMLString(thisWidget.element, Common.InsertType.Append, spanMarkup);

        },

        _init: function () {
        },

        _create: function () {

            // Initialize
            var thisWidget = this;

            // Add configured element styling
            thisWidget._applyElementStyles();

            // Create inner fill
            thisWidget._buildInnerFill();

            // Don't Wait for instructions then use FillTime
            if (!thisWidget.options.WaitForStart && Common.IsDefined(thisWidget.options.FillTime)) {
                thisWidget._fill(100);
            }

        }

    };

    WidgetFactory.Register('gtc.progressbar', ProgressBarWidget);

} (window, document, Common, Cache, Events, Velocity));
