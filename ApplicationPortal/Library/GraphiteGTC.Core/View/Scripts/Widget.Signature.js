// Signature Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var SignatureWidget = {

        // Options
        options: {
            AddSignatureLine: false,
            Background: '#FFFFFF',
            Canvas: null,
            CanvasContext: null,
            Color: '#000000',
            Container: null,
            CurrentLine: null,
            Disabled: false,
            DisabledButtonDisabledText: 'Disable',
            DisabledButtonEnabledText: 'Enable',
            ElementOffset: null,
            Height: '100px',
            InputLineThickness: 2,
            LastPoint: null,
            Lines: null,
            OnChange: null,
            SignatureLineColor: '#CCCCCC',
            SignatureLineOffset: 20,
            SignatureLineIndent: 10,
            Width: '400px',
            ExportType: 'jpeg',
            RemoveDataURI: true,
            InitiallyHidden: false
        },

        // Public Methods
        IsDisabled: function () {

            var thisWidget = this;
            return thisWidget._isDisabled();

        },

        ExportSignature: function () {

            var thisWidget = this;
            return thisWidget._exportSignature();

        },

        ConvertSignatureToJSON: function () {

            var thisWidget = this;
            return thisWidget._convertSignatureToJSON();

        },

        DrawSignatureFromJSON: function (jsonData) {

            var thisWidget = this;
            thisWidget._drawSignatureFromJSON(jsonData);

        },

        ConvertSignatureToImage: function () {

            var thisWidget = this;
            return thisWidget._convertSignatureToImage();

        },

        DrawSignatureFromImage: function (base64String) {

            var thisWidget = this;
            thisWidget._drawSignatureFromImage(base64String);

        },

        IsSignatureEmpty: function () {

            var thisWidget = this;
            return thisWidget._isSignatureEmpty();

        },

        ClearSignatureArea: function (stopOnChange) {

            var thisWidget = this;
            thisWidget._clearSignatureArea(stopOnChange);

        },

        SwitchDisabled: function () {

            var thisWidget = this;
            thisWidget._switchDisabled();

        },

        DisableControl: function () {

            var thisWidget = this;
            thisWidget._disableControl();

        },

        EnableControl: function () {

            var thisWidget = this;
            thisWidget._enableControl();

        },

        // Private Methods
        _removeDataURI: function (base64String) {

            var thisWidget = this;
            if (thisWidget.options.RemoveDataURI) {
                base64String = base64String.split(',')[1];
            }
            return base64String;

        },

        _refreshSignatureArea: function (stopOnChange) {

            // Initialize
            var thisWidget = this;

            // Refresh our most current options and clear drawing area
            thisWidget.options.CanvasContext.fillStyle = thisWidget.options.Background;
            thisWidget.options.CanvasContext.strokeStyle = thisWidget.options.Color;
            thisWidget.options.CanvasContext.lineWidth = thisWidget.options.InputLineThickness;
            thisWidget.options.CanvasContext.lineCap = 'round';
            thisWidget.options.CanvasContext.lineJoin = 'round';
            var containerStyle = thisWidget.options.Container.style;
            containerStyle.height = thisWidget.options.Height;
            containerStyle.width = thisWidget.options.Width;
            thisWidget._clearSignatureArea(stopOnChange);

        },

        _exportSignature: function () {

            // Initialize
            var thisWidget = this;
            if (!thisWidget._isSignatureEmpty()) {
                if (thisWidget.options.ExportType == 'jpeg' || thisWidget.options.ExportType == 'png') {
                    return thisWidget._convertSignatureToImage();
                }
                else if (thisWidget.options.ExportType == 'json') {
                    return thisWidget._convertSignatureToJSON();
                }
            }
            else {
                return null;
            }

        },

        _convertSignatureToJSON: function () {

            // Initialize
            var thisWidget = this;
            var jsonString = '[';
            var notFirstLine = false;

            // Start converting lines and points to cartesian coordinates
            var line, lineLndex = 0, lineLength = thisWidget.options.Lines.length;
            for ( ; lineLndex < lineLength; lineLndex++) {
                line = thisWidget.options.Lines[lineLndex];
                if (notFirstLine) {
                    jsonString += ',';
                }
                else {
                    notFirstLine = true;
                }
                jsonString += '[';
                var notFirstPoint = false;
                var point, pointIndex = 0, pointLength = line.length;
                for ( ; pointIndex < pointLength; pointIndex++) {
                    point = line[pointIndex];
                    if (notFirstPoint) {
                        jsonString += ',';
                    }
                    else {
                        notFirstPoint = true;
                    }
                    jsonString += '[' + point[0] + ',' + point[1] + ']';
                }
                jsonString += ']';
            }

            // Close JSON and return
            jsonString += ']';
            return jsonString;

        },

        _drawSignatureFromJSON: function (jsonData) {

            // Initialize
            var thisWidget = this;

            // Make sure nothing is there before we draw
            thisWidget._clearSignatureArea(true);

            // Add JSON Property Name
            jsonData = '{"Signature":' + jsonData + '}';

            // Check that we have real data or parse will explode
            if (Common.IsDefined(jsonData) && Common.IsString(jsonData) && Common.IsNotEmptyString(jsonData)) {
                jsonData = JSON.parse(jsonData);
            }
            else {
                return;
            }

            // Set our lines
            thisWidget.options.Lines = jsonData.Signature;

            // Grab context API and begin drawing our lines and points from cartesian coordinates
            var canvasContext = thisWidget.options.CanvasContext;
            var line, lineIndex = 0, lineLength = thisWidget.options.Lines.length;
            for ( ; lineIndex < lineLength; lineIndex++) {
                line = thisWidget.options.Lines[lineIndex];
                canvasContext.beginPath();
                var point, pointIndex = 0, pointLength = line.length;
                for ( ; pointIndex < pointLength; pointIndex++) {
                    point = line[pointIndex];
                    if (pointIndex > 0) {
                        canvasContext['lineTo'](point[0], point[1]);
                    }
                    else {
                        canvasContext['moveTo'](point[0], point[1]);
                    }
                }
                canvasContext.stroke();
            }

        },

        _convertSignatureToImage: function () {

            var thisWidget = this;
            var exportedImage = thisWidget.options.Canvas.toDataURL('image/' + thisWidget.options.ExportType);
            exportedImage = thisWidget._removeDataURI(exportedImage);
            return exportedImage;

        },

        _drawSignatureFromImage: function (base64String) {

            var thisWidget = this;
            var image = new Image();
            image.onload = function () {
                thisWidget.options.CanvasContext.drawImage(this, 0, 0);
            };
            if (base64String.indexOf(',') == -1) {
                base64String = 'data:image/' + thisWidget.options.ExportType + ';base64,' + base64String;
            }
            image.src = base64String;

        },

        _isSignatureEmpty: function () {

            var thisWidget = this;
            if (thisWidget.options.Lines.length > 0) {
                return false;
            }
            else {
                return true;
            }

        },

        _clearSignatureArea: function (stopOnChange) {

            // Initialize
            var thisWidget = this;

            // Clear drawing area
            var containerHeight = Common.Height(thisWidget.options.Container);
            var containerWidth = Common.Width(thisWidget.options.Container);
            thisWidget.options.CanvasContext.fillRect(0, 0, containerWidth, containerHeight);

            // Redraw signature line if enabled
            if (thisWidget.options.AddSignatureLine) {
                thisWidget.options.CanvasContext.save();
                thisWidget.options.CanvasContext.strokeStyle = thisWidget.options.SignatureLineColor;
                thisWidget.options.CanvasContext.lineWidth = 1;
                thisWidget.options.CanvasContext.beginPath();
                thisWidget.options.CanvasContext.moveTo(thisWidget.options.SignatureLineIndent, containerHeight - thisWidget.options.SignatureLineOffset);
                thisWidget.options.CanvasContext.lineTo(containerWidth - thisWidget.options.SignatureLineIndent, containerHeight - thisWidget.options.SignatureLineOffset);
                thisWidget.options.CanvasContext.stroke();
                thisWidget.options.CanvasContext.restore();
            }

            // Clear our current lines
            thisWidget.options.Lines = [];

            // if not on create or drawing from JSON, trigger onchange
            if (!stopOnChange) {
                thisWidget._onChange();
            }

        },

        _isDisabled: function () {

            var thisWidget = this;
            return thisWidget.options.Disabled;

        },

        _switchDisabled: function () {

            var thisWidget = this;
            if (thisWidget.options.Disabled) {
                thisWidget._enableControl();
            }
            else {
                thisWidget._disableControl();
            }

        },

        _enableControl: function () {

            var thisWidget = this;
            thisWidget.options.Disabled = false;
            thisWidget.options.Container.style.opacity = '';
            var disableButton = Common.Get(thisWidget.element.id + 'DisableButton');
            if (Common.IsDefined(disableButton)) {
                disableButton.textContent = Common.TranslateKey(thisWidget.options.DisabledButtonDisabledText);
            }

        },

        _disableControl: function () {

            var thisWidget = this;
            thisWidget.options.Disabled = true;
            thisWidget.options.Container.style.opacity = '.35';
            var disableButton = Common.Get(thisWidget.element.id + 'DisableButton');
            if (Common.IsDefined(disableButton)) {
                disableButton.textContent = Common.TranslateKey(thisWidget.options.DisabledButtonEnabledText);
            }

        },

        _onChange: function (event) {

            // Initialize
            var thisWidget = this;

            // Trigger onchange attached to element
            Events.Trigger(thisWidget.element, 'change');

        },

        _mouseCapture: function (event) {

            // Initialize
            var thisWidget = this;

            // Stop any capturing if we are disabled
            return !thisWidget.options.Disabled;

        },

        _mouseStart: function (event) {

            // Initialize
            var thisWidget = this;

            // Lets record where we started
            thisWidget.options.ElementOffset = Common.Offset(thisWidget.options.Container);
            thisWidget.options.ElementOffset.left -= document.documentElement.scrollLeft || document.body.scrollLeft;
            thisWidget.options.ElementOffset.top -= document.documentElement.scrollTop || document.body.scrollTop;
            thisWidget.options.LastPoint = [thisWidget._round(event.clientX - thisWidget.options.ElementOffset.left), thisWidget._round(event.clientY - thisWidget.options.ElementOffset.top)];
            thisWidget.options.CurrentLine = [thisWidget.options.LastPoint];
            thisWidget.options.Lines.push(thisWidget.options.CurrentLine);

        },

        _mouseDrag: function (event) {

            // Initialize
            var thisWidget = this;

            // Lets record where we have been and draw the path
            var nextPoint = [thisWidget._round(event.clientX - thisWidget.options.ElementOffset.left), thisWidget._round(event.clientY - thisWidget.options.ElementOffset.top)];
            thisWidget.options.CurrentLine.push(nextPoint);
            thisWidget.options.CanvasContext.beginPath();
            thisWidget.options.CanvasContext.moveTo(thisWidget.options.LastPoint[0], thisWidget.options.LastPoint[1]);
            thisWidget.options.CanvasContext.lineTo(nextPoint[0], nextPoint[1]);
            thisWidget.options.CanvasContext.stroke();
            thisWidget.options.LastPoint = nextPoint;

        },

        _mouseStop: function (event) {

            // Initialize
            var thisWidget = this;

            // Lets reinitialize our line and point for next start
            thisWidget.options.LastPoint = null;
            thisWidget.options.CurrentLine = null;

            // Trigger OnChange
            thisWidget._onChange(event);

        },

        _round: function (value) {

            return Math.round(value * 100) / 100;

        },

        _destroy: function () {

            var thisWidget = this;
            Common.Remove(thisWidget.options.Canvas, true);
            thisWidget.options.Canvas = null;
            thisWidget.options.Container = null;
            thisWidget.options.CanvasContext = null;
            thisWidget.options.Lines = null;
            thisWidget._mouseDestroy();

        },

        _init: function () {

        },

        _create: function () {

            // Initialize
            var thisWidget = this;
            thisWidget.options.Container = Common.GetChildren(thisWidget.element, 'div:first-child')[0];

            // Build canvas and insert
            var containerStyle = thisWidget.options.Container.style;
            containerStyle.height = thisWidget.options.Height;
            containerStyle.width = thisWidget.options.Width;
            var canvasMarkup = '<canvas id="' + thisWidget.element.id + 'Canvas" width="' + Common.Width(thisWidget.options.Container) + 'px" height="' + Common.Height(thisWidget.options.Container) + 'px"></canvas>';
            thisWidget.options.Canvas = Common.InsertHTMLString(thisWidget.options.Container, Common.InsertType.Append, canvasMarkup, thisWidget.element.id + 'Canvas');

            // Get canvas context API
            thisWidget.options.CanvasContext = thisWidget.options.Canvas.getContext('2d');

            // Refresh signature area and skip onchange
            thisWidget._refreshSignatureArea(true);

            // if signature export isn't jpeg set option
            var exportType = Common.GetAttr(thisWidget.element, 'data-export');
            if (exportType != 'jpeg') {
                thisWidget.options.ExportType = exportType.toLowerCase();
            }

            // if signature data exists redraw signature
            var dataSignature = Common.GetAttr(thisWidget.element, 'data-signature');
            if (Common.IsDefined(dataSignature) && Common.IsNotEmptyString(dataSignature)) {
                if (exportType == 'jpeg' || exportType == 'png') {
                    thisWidget._drawSignatureFromImage(dataSignature);
                }
                else if (exportType == 'json') {
                    thisWidget._drawSignatureFromJSON(dataSignature);
                }
            }

            // if loaded as disabled, disable control
            if (thisWidget.options.Disabled) {
                thisWidget._disableControl();
            }

            // Add some touch support?
            var supportTouch = 'ontouchend' in document;
            if (supportTouch && !Touch.IsTouchToMouseInitialized()) {
                Touch.InitializeTouchToMouseEventHandling();
            }

            // Initialize mouse
            thisWidget._mouseInit();

            // Update signature if hidden during initialization
            if (thisWidget.options.InitiallyHidden) {
                Common.AttachVisibilityEvent(thisWidget.element.id,
                    function (event, eventData) {
                        // Backup current signature
                        var isSigEmpty = thisWidget._isSignatureEmpty();
                        var signatureJSON = null;
                        if (!isSigEmpty) {
                            signatureJSON = thisWidget._convertSignatureToJSON();
                        }

                        // Remove and rebuild canvas
                        Common.Remove(thisWidget.options.Canvas, true);
                        var containerStyle = thisWidget.options.Container.style;
                        containerStyle.height = thisWidget.options.Height;
                        containerStyle.width = thisWidget.options.Width;
                        var canvasMarkup = '<canvas id="' + thisWidget.element.id + 'Canvas" width="' + Common.Width(thisWidget.options.Container) + 'px" height="' + Common.Height(thisWidget.options.Container) + 'px"></canvas>';
                        thisWidget.options.Canvas = Common.InsertHTMLString(thisWidget.options.Container, Common.InsertType.Append, canvasMarkup, thisWidget.element.id + 'Canvas');

                        // Reload canvas context API
                        thisWidget.options.CanvasContext = thisWidget.options.Canvas.getContext('2d');

                        // Refresh signature area and skip onchange
                        thisWidget._refreshSignatureArea(true);

                        // Redraw backed up signature if it existed
                        if (!isSigEmpty) {
                            thisWidget._drawSignatureFromJSON(signatureJSON);
                        }

                        // Cleanup event
                        Common.DetachVisibilityEvent(eventData);
                    }, null, null, 'No'
                );
            }

        }

    };

    WidgetFactory.Register('gtc.signature', WidgetFactory.gtc.mouse, SignatureWidget);

} (window, document, Common, Cache, Events, Velocity));
