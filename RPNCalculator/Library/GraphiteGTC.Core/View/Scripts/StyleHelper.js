// StyleHelper
// Based On: StyleHelper
(function (StyleHelper, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    StyleHelper.BuildDimensionStyle = function (elementDimension) {

        var dimensionStyle = null;
        if (Common.IsDefined(elementDimension)) {
            dimensionStyle = {
                Height: null,
                Width: null
            };
            if (Common.IsDefined(elementDimension.Height)) {
                dimensionStyle.Height = elementDimension.Height.toLowerCase();
                if (Common.IsNumeric(elementDimension.Height)) {
                    dimensionStyle.Height += elementDimension.Scale;
                }
                dimensionStyle.Height += ';';
            }
            if (Common.IsDefined(elementDimension.Width)) {
                dimensionStyle.Width = elementDimension.Width.toLowerCase();
                if (Common.IsNumeric(elementDimension.Width)) {
                    dimensionStyle.Width += elementDimension.Scale;
                }
                dimensionStyle.Width += ';';
            }
        }
        return dimensionStyle;

    };

    StyleHelper.BuildPositionStyle = function (elementPosition) {

        var positionStyle = null;
        if (Common.IsDefined(elementPosition)) {
            positionStyle = {
                Setting: null,
                Top: null,
                Right: null,
                Bottom: null,
                Left: null
            };
            if (Common.IsDefined(elementPosition.Setting)) {
                positionStyle.Setting = elementPosition.Setting.toLowerCase() + ';';
            }
            if (Common.IsDefined(elementPosition.Top)) {
                positionStyle.Top = elementPosition.Top.toLowerCase();
                if (Common.IsNumeric(elementPosition.Top)) {
                    positionStyle.Top += elementPosition.Scale;
                }
                positionStyle.Top += ';';
            }
            if (Common.IsDefined(elementPosition.Right)) {
                positionStyle.Right = elementPosition.Right.toLowerCase();
                if (Common.IsNumeric(elementPosition.Right)) {
                    positionStyle.Right += elementPosition.Scale;
                }
                positionStyle.Right += ';';
            }
            if (Common.IsDefined(elementPosition.Bottom)) {
                positionStyle.Bottom = elementPosition.Bottom.toLowerCase();
                if (Common.IsNumeric(elementPosition.Bottom)) {
                    positionStyle.Bottom += elementPosition.Scale;
                }
                positionStyle.Bottom += ';';
            }
            if (Common.IsDefined(elementPosition.Left)) {
                positionStyle.Left = elementPosition.Left;
                if (Common.IsNumeric(elementPosition.Left)) {
                    positionStyle.Left += elementPosition.Scale;
                }
                positionStyle.Left += ';';
            }
        }
        return positionStyle;

    };

} (window.StyleHelper = window.StyleHelper || {}, window, document, Common, Cache, Events, Velocity));
