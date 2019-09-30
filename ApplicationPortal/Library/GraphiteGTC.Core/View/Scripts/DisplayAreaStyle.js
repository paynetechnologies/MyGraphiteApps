// DisplayAreaStyle
// Based On: DisplayAreaStyle
(function (DisplayAreaStyle, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    DisplayAreaStyle.RenderStyle = function (displayAreaStyle, styleCategory, displayAreaName) {

        var displayAreaStyleMarkup = '';
        if (Common.IsDefined(displayAreaStyle)) {
            // Style@<>
            displayAreaStyleMarkup += '<style>' + GenerateMediaQueryAndName(styleCategory, displayAreaName);

            // DisplayType
            if (Common.IsDefined(displayAreaStyle.DisplayType)) {
                displayAreaStyleMarkup += 'display: ' + displayAreaStyle.DisplayType + ';';
            }

            // VerticalAlignment
            if (Common.IsDefined(displayAreaStyle.VerticalAlignment)) {
                displayAreaStyleMarkup += 'vertical-align: ' + displayAreaStyle.VerticalAlignment + ';';
            }

            // Opacity
            if (Common.IsDefined(displayAreaStyle.Opacity)) {
                displayAreaStyleMarkup += 'opacity: ' + displayAreaStyle.Opacity + ';';
            }

            // Background
            displayAreaStyleMarkup += GenerateBackgroundStyle(displayAreaStyle.Background);

            // Border
            if (Common.IsDefined(displayAreaStyle.Border)) {
                (Common.IsDefined(displayAreaStyle.Border.Thickness) ? displayAreaStyleMarkup += 'border-width:' + displayAreaStyle.Border.Thickness + displayAreaStyle.Border.Scale + ';' : displayAreaStyleMarkup += '');
                (Common.IsDefined(displayAreaStyle.Border.BorderType) ? displayAreaStyleMarkup += 'border-style:' + displayAreaStyle.Border.BorderType + ';' : displayAreaStyleMarkup += '');
                (Common.IsDefined(displayAreaStyle.Border.Color) ? displayAreaStyleMarkup += 'border-color:' + Colors.ProcessValue(displayAreaStyle.Border.Color, false, null) + ';' : displayAreaStyleMarkup += '');
            }

            // Dimension
            var dimensionStyle = StyleHelper.BuildDimensionStyle(displayAreaStyle.Dimension);
            if (Common.IsDefined(dimensionStyle)) {
                if (Common.IsDefined(dimensionStyle.Height)) {
                    displayAreaStyleMarkup += 'height: ' + dimensionStyle.Height;
                }
                if (Common.IsDefined(dimensionStyle.Width)) {
                    displayAreaStyleMarkup += 'width: ' + dimensionStyle.Width;
                }
            }

            // Maximum
            var maximumStyle = StyleHelper.BuildDimensionStyle(displayAreaStyle.Maximum);
            if (Common.IsDefined(maximumStyle)) {
                if (Common.IsDefined(maximumStyle.Height)) {
                    displayAreaStyleMarkup += 'max-height: ' + maximumStyle.Height;
                }
                if (Common.IsDefined(maximumStyle.Width)) {
                    displayAreaStyleMarkup += 'max-width: ' + maximumStyle.Width;
                }
            }

            // Minimum
            var minimumStyle = StyleHelper.BuildDimensionStyle(displayAreaStyle.Minimum);
            if (Common.IsDefined(minimumStyle)) {
                if (Common.IsDefined(minimumStyle.Height)) {
                    displayAreaStyleMarkup += 'min-height: ' + minimumStyle.Height + ';';
                }
                if (Common.IsDefined(minimumStyle.Width)) {
                    displayAreaStyleMarkup += 'min-width: ' + minimumStyle.Width + ';';
                }
            }

            // Overflow
            if (Common.IsDefined(displayAreaStyle.Overflow)) {
                displayAreaStyleMarkup += 'overflow: ' + displayAreaStyle.Overflow + ';';
            }

            // IsContentCentered
            if (Common.IsDefined(displayAreaStyle.IsContentCentered)) {
                if (displayAreaStyle.IsContentCentered == 'Yes') {
                    displayAreaStyleMarkup += 'text-align: center;';
                    displayAreaStyleMarkup += '-webkit-justify-content: center;';
                    displayAreaStyleMarkup += '-ms-flex-pack: center;';
                    displayAreaStyleMarkup += 'justify-content: center;';
                }
            }

            // Margin
            var marginStyle = StyleHelper.BuildPositionStyle(displayAreaStyle.Margin);
            if (Common.IsDefined(marginStyle)) {
                if (Common.IsDefined(marginStyle.Top)) {
                    displayAreaStyleMarkup += 'margin-top:' + marginStyle.Top;
                }
                if (Common.IsDefined(marginStyle.Right)) {
                    displayAreaStyleMarkup += 'margin-right:' + marginStyle.Right;
                }
                if (Common.IsDefined(marginStyle.Bottom)) {
                    displayAreaStyleMarkup += 'margin-bottom:' + marginStyle.Bottom;
                }
                if (Common.IsDefined(marginStyle.Left)) {
                    displayAreaStyleMarkup += 'margin-left:' + marginStyle.Left;
                }
            }

            // Padding
            var paddingStyle = StyleHelper.BuildPositionStyle(displayAreaStyle.Padding);
            if (Common.IsDefined(paddingStyle)) {
                if (Common.IsDefined(paddingStyle.Top)) {
                    displayAreaStyleMarkup += 'padding-top:' + paddingStyle.Top;
                }
                if (Common.IsDefined(paddingStyle.Right)) {
                    displayAreaStyleMarkup += 'padding-right:' + paddingStyle.Right;
                }
                if (Common.IsDefined(paddingStyle.Bottom)) {
                    displayAreaStyleMarkup += 'padding-bottom:' + paddingStyle.Bottom;
                }
                if (Common.IsDefined(paddingStyle.Left)) {
                    displayAreaStyleMarkup += 'padding-left:' + paddingStyle.Left;
                }
            }

            // RoundedCorner
            if (Common.IsDefined(displayAreaStyle.RoundedCorner)) {
                (Common.IsDefined(displayAreaStyle.RoundedCorner.TopLeft) ? displayAreaStyleMarkup += 'border-top-left-radius:' + displayAreaStyle.RoundedCorner.TopLeft + 'px;' : displayAreaStyleMarkup += '');
                (Common.IsDefined(displayAreaStyle.RoundedCorner.TopRight) ? displayAreaStyleMarkup += 'border-top-right-radius:' + displayAreaStyle.RoundedCorner.TopRight + 'px;' : displayAreaStyleMarkup += '');
                (Common.IsDefined(displayAreaStyle.RoundedCorner.BottomRight) ? displayAreaStyleMarkup += 'border-bottom-right-radius:' + displayAreaStyle.RoundedCorner.BottomRight + 'px;' : displayAreaStyleMarkup += '');
                (Common.IsDefined(displayAreaStyle.RoundedCorner.BottomLeft) ? displayAreaStyleMarkup += 'border-bottom-left-radius:' + displayAreaStyle.RoundedCorner.BottomLeft + 'px;' : displayAreaStyleMarkup += '');
            }

            // Shadow
            if (Common.IsDefined(displayAreaStyle.Shadow)) {
                displayAreaStyleMarkup += 'box-shadow: ';
                (Common.IsDefined(displayAreaStyle.Shadow.Horizontal) ? displayAreaStyleMarkup += displayAreaStyle.Shadow.Horizontal + 'px ' : displayAreaStyleMarkup += '0 ');
                (Common.IsDefined(displayAreaStyle.Shadow.ShadowType) && displayAreaStyle.Shadow.ShadowType != 'outset' ? displayAreaStyleMarkup += displayAreaStyle.Shadow.ShadowType + ' ' : displayAreaStyleMarkup += '');
                (Common.IsDefined(displayAreaStyle.Shadow.Vertical) ? displayAreaStyleMarkup += displayAreaStyle.Shadow.Vertical + 'px ' : displayAreaStyleMarkup += '0 ');
                (Common.IsDefined(displayAreaStyle.Shadow.Blur) ? displayAreaStyleMarkup += displayAreaStyle.Shadow.Blur + 'px ' : displayAreaStyleMarkup += '0 ');
                (Common.IsDefined(displayAreaStyle.Shadow.Spread) ? displayAreaStyleMarkup += displayAreaStyle.Shadow.Spread + 'px ' : displayAreaStyleMarkup += '0 ');
                (Common.IsDefined(displayAreaStyle.Shadow.Color) ? displayAreaStyleMarkup += Colors.ProcessValue(displayAreaStyle.Shadow.Color, true, displayAreaStyle.Shadow.Opacity) : displayAreaStyleMarkup += 'rgba(0,0,0,.6)');
                displayAreaStyleMarkup += ';';
            }

            // Position
            var positionStyle = StyleHelper.BuildPositionStyle(displayAreaStyle.Position);
            if (Common.IsDefined(positionStyle)) {
                (Common.IsDefined(positionStyle.Setting) ? displayAreaStyleMarkup += 'position: ' + positionStyle.Setting + ';' : displayAreaStyleMarkup += '');
                (Common.IsDefined(positionStyle.Top) ? displayAreaStyleMarkup += 'top: ' + positionStyle.Top + ';' : displayAreaStyleMarkup += '');
                (Common.IsDefined(positionStyle.Right) ? displayAreaStyleMarkup += 'right: ' + positionStyle.Right + ';' : displayAreaStyleMarkup += '');
                (Common.IsDefined(positionStyle.Bottom) ? displayAreaStyleMarkup += 'bottom: ' + positionStyle.Bottom + ';' : displayAreaStyleMarkup += '');
                (Common.IsDefined(positionStyle.Left) ? displayAreaStyleMarkup += 'left: ' + positionStyle.Left + ';' : displayAreaStyleMarkup += '');
            }

            // Font
            if (Common.IsDefined(displayAreaStyle.Font)) {
                if (Common.IsDefined(displayAreaStyle.Font.Color)) {
                    displayAreaStyleMarkup += 'color: ' + Colors.ProcessValue(displayAreaStyle.Font.Color, false, null) + ';';
                }
                if (Common.IsDefined(displayAreaStyle.Font.Size)) {
                    displayAreaStyleMarkup += 'font-size: ' + displayAreaStyle.Font.Size + displayAreaStyle.Font.Scale + ';';
                }
                if (Common.IsDefined(displayAreaStyle.Font.Weight)) {
                    displayAreaStyleMarkup += 'font-weight: ' + displayAreaStyle.Font.Weight.toLowerCase() + ';';
                }
                if (Common.IsDefined(displayAreaStyle.Font.LineSpacing)) {
                    displayAreaStyleMarkup += 'line-height: ' + displayAreaStyle.Font.LineSpacing + 'px;';
                }
                if (Common.IsDefined(displayAreaStyle.Font.LetterSpacing)) {
                    displayAreaStyleMarkup += 'letter-spacing: ' + displayAreaStyle.Font.LetterSpacing + 'px;';
                }
            }

            // Layer
            if (Common.IsDefined(displayAreaStyle.Layer)) {
                displayAreaStyleMarkup += 'z-index: ' + displayAreaStyle.Layer + ';';
            }

            // Style@</>
            displayAreaStyleMarkup += '}}</style>';
        }
        return displayAreaStyleMarkup;

    };

    // Private Methods
    function GenerateMediaQueryAndName (styleCategory, displayAreaName) {

        var mediaQuery = '';
        switch (styleCategory) {
            case 'desktop':
                // Graphite Studio Preview: Width = 1440, Height = 1080
                mediaQuery = '@media screen and (min-device-width: 1440px) and (max-device-width: 1600px)';
                break;
            case 'laptop':
                // Graphite Studio Preview: Width = 1024, Height = 768
                mediaQuery = '@media screen and (min-device-width: 1024px) and (max-device-width: 1439px)';
                break;
            case 'mobile':
                // Graphite Studio Preview: Width = 420, Height = 630
                mediaQuery = '@media only screen and (min-device-width: 320px) and (max-device-width: 767px)';
                break;
            case 'tablet':
                // Graphite Studio Preview: Width = 768, Height = 576
                mediaQuery = '@media only screen and (min-device-width: 768px) and (max-device-width: 1023px)';
                break;
            default:
                mediaQuery = '@media all';
                break;
        }
        mediaQuery += ' {'
        var styleName = '.gtc-displayarea-' + styleCategory + '-' + displayAreaName.toLowerCase() + ' {';
        return mediaQuery + styleName;

    };

    function GenerateBackgroundStyle (areaBackground) {

        var backgroundStyleMarkup = '';
        if (Common.IsDefined(areaBackground) && (Common.IsOneDefined([areaBackground.Color, areaBackground.ImageSource]))) {
            if (Common.IsDefined(areaBackground.Color) && Colors.IsGradient(areaBackground.Color) === true) {
                var gradientValues = Colors.ProcessValue(areaBackground.Color, false, null);
                backgroundStyleMarkup += 'background-image: -moz-linear-gradient(' + gradientValues[0] + ', ' + gradientValues[1] + ');';
                backgroundStyleMarkup += 'background-image: -ms-linear-gradient(' + gradientValues[0] + ', ' + gradientValues[1] + ');';
                backgroundStyleMarkup += 'background-image: -o-linear-gradient(' + gradientValues[0] + ', ' + gradientValues[1] + ');';
                backgroundStyleMarkup += 'background-image: -webkit-gradient(linear, left top, left bottom, from(' + gradientValues[0] + '), to(' + gradientValues[1] + '));';
                backgroundStyleMarkup += 'background-image: -webkit-linear-gradient(' + gradientValues[0] + ', ' + gradientValues[1] + ');';
                backgroundStyleMarkup += 'background-image: linear-gradient(' + gradientValues[0] + ', ' + gradientValues[1] + ');';
                backgroundStyleMarkup += 'filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=\'' + gradientValues[0] + '\', endColorstr=\'' + gradientValues[1] + '\')';
                backgroundStyleMarkup += ';';
            }
            else {
                (Common.IsDefined(areaBackground.Color) ? backgroundStyleMarkup += 'background-color:' + Colors.ProcessValue(areaBackground.Color, false, null) + ';' : backgroundStyleMarkup += '');
                (Common.IsDefined(areaBackground.ImageSource) ? backgroundStyleMarkup += 'background:url(\'' + Common.BuildResourcePath(areaBackground.ImageSource) + '\');' : backgroundStyleMarkup += '');
                (Common.IsDefined(areaBackground.Repeat) ? backgroundStyleMarkup += 'background-repeat:' + areaBackground.Repeat + ';' : backgroundStyleMarkup += '');
                (Common.IsDefined(areaBackground.ImageSize) ? backgroundStyleMarkup += 'background-size:' + areaBackground.ImageSize + ';' : backgroundStyleMarkup += '');
                var positionStyle = StyleHelper.BuildPositionStyle(areaBackground.Position);
                if (Common.IsDefined(positionStyle) && Common.IsOneDefined([positionStyle.Top, positionStyle.Left])) {
                    backgroundStyleMarkup += 'background-position:';
                    if (Common.IsDefined(positionStyle.Left)) {
                        backgroundStyleMarkup += positionStyle.Left;
                    }
                    else {
                        backgroundStyleMarkup += ' initial';
                    }
                    backgroundStyleMarkup += ' ';
                    if (Common.IsDefined(positionStyle.Top)) {
                        backgroundStyleMarkup += positionStyle.Top;
                    }
                    else {
                        backgroundStyleMarkup += 'initial';
                    }
                    backgroundStyleMarkup += ';';
                }
            }
        }
        return backgroundStyleMarkup;

    };

} (window.DisplayAreaStyle = window.DisplayAreaStyle || {}, window, document, Common, Cache, Events, Velocity));
