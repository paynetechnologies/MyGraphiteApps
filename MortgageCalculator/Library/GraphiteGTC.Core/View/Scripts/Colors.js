// Colors Namespace
(function (Colors, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Variables
    Colors.RGBRegEx = /rgb(a||[])\(( ||[])(\d+)( ||[]),( ||[])(\d+)( ||[]),( ||[])(\d+)( ||[])(,\d||,.\d||, \d||, .\d||[])( ||[])\)/g;
    Colors.HexRegEx = /(#||[])([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
    Colors.WebSafe = {
        'aliceblue': {
            'Hex': 'F0F8FF',
            'RGB': '240,248,255'
        },
        'antiquewhite': {
            'Hex': 'FAEBD7',
            'RGB': '250,235,215'
        },
        'aqua': {
            'Hex': '00FFFF',
            'RGB': '0,255,255'
        },
        'aquamarine': {
            'Hex': '7FFFD4',
            'RGB': '127,255,212'
        },
        'azure': {
            'Hex': 'F0FFFF',
            'RGB': '240,255,255'
        },
        'beige': {
            'Hex': 'F5F5DC',
            'RGB': '245,245,220'
        },
        'bisque': {
            'Hex': 'FFE4C4',
            'RGB': '255,228,196'
        },
        'black': {
            'Hex': '000000',
            'RGB': '0,0,0'
        },
        'blanchedalmond': {
            'Hex': 'FFEBCD',
            'RGB': '255,235,205'
        },
        'blue': {
            'Hex': '0000FF',
            'RGB': '0,0,255'
        },
        'blueviolet': {
            'Hex': '8A2BE2',
            'RGB': '138,43,226'
        },
        'brown': {
            'Hex': 'A52A2A',
            'RGB': '165,42,42'
        },
        'burlywood': {
            'Hex': 'DEB887',
            'RGB': '222,184,135'
        },
        'cadetblue': {
            'Hex': '5F9EA0',
            'RGB': '95,158,160'
        },
        'chartreuse': {
            'Hex': '7FFF00',
            'RGB': '127,255,0'
        },
        'chocolate': {
            'Hex': 'D2691E',
            'RGB': '210,105,30'
        },
        'coral': {
            'Hex': 'FF7F50',
            'RGB': '255,127,80'
        },
        'cornflowerblue': {
            'Hex': '6495ED',
            'RGB': '100,149,237'
        },
        'cornsilk': {
            'Hex': 'FFF8DC',
            'RGB': '255,248,220'
        },
        'crimson': {
            'Hex': 'DC143C',
            'RGB': '220,20,60'
        },
        'cyan': {
            'Hex': '00FFFF',
            'RGB': '0,255,255'
        },
        'darkblue': {
            'Hex': '00008B',
            'RGB': '0,0,139'
        },
        'darkcyan': {
            'Hex': '008B8B',
            'RGB': '0,139,139'
        },
        'darkgoldenrod': {
            'Hex': 'B8860B',
            'RGB': '184,134,11'
        },
        'darkgray': {
            'Hex': 'A9A9A9',
            'RGB': '169,169,169'
        },
        'darkgreen': {
            'Hex': '006400',
            'RGB': '0,100,0'
        },
        'darkkhaki': {
            'Hex': 'BDB76B',
            'RGB': '189,183,107'
        },
        'darkmagenta': {
            'Hex': '8B008B',
            'RGB': '139,0,139'
        },
        'darkolivegreen': {
            'Hex': '556B2F',
            'RGB': '85,107,47'
        },
        'darkorange': {
            'Hex': 'FF8C00',
            'RGB': '255,140,0'
        },
        'darkorchid': {
            'Hex': '9932CC',
            'RGB': '153,50,204'
        },
        'darkred': {
            'Hex': '8B0000',
            'RGB': '139,0,0'
        },
        'darksalmon': {
            'Hex': 'E9967A',
            'RGB': '233,150,122'
        },
        'darkseagreen': {
            'Hex': '8FBC8F',
            'RGB': '143,188,143'
        },
        'darkslateblue': {
            'Hex': '483D8B',
            'RGB': '72,61,139'
        },
        'darkslategray': {
            'Hex': '2F4F4F',
            'RGB': '47,79,79'
        },
        'darkturquoise': {
            'Hex': '00CED1',
            'RGB': '0,206,209'
        },
        'darkviolet': {
            'Hex': '9400D3',
            'RGB': '148,0,211'
        },
        'deeppink': {
            'Hex': 'FF1493',
            'RGB': '255,20,147'
        },
        'deepskyblue': {
            'Hex': '00BFFF',
            'RGB': '0,191,255'
        },
        'dimgray': {
            'Hex': '696969',
            'RGB': '105,105,105'
        },
        'dodgerblue': {
            'Hex': '1E90FF',
            'RGB': '30,144,255'
        },
        'firebrick': {
            'Hex': 'B22222',
            'RGB': '178,34,34'
        },
        'floralwhite': {
            'Hex': 'FFFAF0',
            'RGB': '255,250,240'
        },
        'forestgreen': {
            'Hex': '228B22',
            'RGB': '34,139,34'
        },
        'fuchsia': {
            'Hex': 'FF00FF',
            'RGB': '255,0,255'
        },
        'gainsboro': {
            'Hex': 'DCDCDC',
            'RGB': '220,220,220'
        },
        'ghostwhite': {
            'Hex': 'F8F8FF',
            'RGB': '248,248,255'
        },
        'gold': {
            'Hex': 'FFD700',
            'RGB': '255,215,0'
        },
        'goldenrod': {
            'Hex': 'DAA520',
            'RGB': '218,165,32'
        },
        'gray': {
            'Hex': '808080',
            'RGB': '128,128,128'
        },
        'green': {
            'Hex': '008000',
            'RGB': '0,128,0'
        },
        'greenyellow': {
            'Hex': 'ADFF2F',
            'RGB': '173,255,47'
        },
        'honeydew': {
            'Hex': 'F0FFF0',
            'RGB': '240,255,240'
        },
        'hotpink': {
            'Hex': 'FF69B4',
            'RGB': '255,105,180'
        },
        'indianred': {
            'Hex': 'CD5C5C',
            'RGB': '205,92,92'
        },
        'indigo': {
            'Hex': '4B0082',
            'RGB': '75,0,130'
        },
        'ivory': {
            'Hex': 'FFFFF0',
            'RGB': '255,255,240'
        },
        'khaki': {
            'Hex': 'F0E68C',
            'RGB': '240,230,140'
        },
        'lavender': {
            'Hex': 'E6E6FA',
            'RGB': '230,230,250'
        },
        'lavenderblush': {
            'Hex': 'FFF0F5',
            'RGB': '255,240,245'
        },
        'lawngreen': {
            'Hex': '7CFC00',
            'RGB': '124,252,0'
        },
        'lemonchiffon': {
            'Hex': 'FFFACD',
            'RGB': '255,250,205'
        },
        'lightblue': {
            'Hex': 'ADD8E6',
            'RGB': '173,216,230'
        },
        'lightcoral': {
            'Hex': 'F08080',
            'RGB': '240,128,128'
        },
        'lightcyan': {
            'Hex': 'E0FFFF',
            'RGB': '224,255,255'
        },
        'lightgoldenrodyellow': {
            'Hex': 'FAFAD2',
            'RGB': '250,250,210'
        },
        'lightgray': {
            'Hex': 'D3D3D3',
            'RGB': '211,211,211'
        },
        'lightgreen': {
            'Hex': '90EE90',
            'RGB': '144,238,144'
        },
        'lightpink': {
            'Hex': 'FFB6C1',
            'RGB': '255,182,193'
        },
        'lightsalmon': {
            'Hex': 'FFA07A',
            'RGB': '255,160,122'
        },
        'lightseagreen': {
            'Hex': '20B2AA',
            'RGB': '32,178,170'
        },
        'lightskyblue': {
            'Hex': '87CEFA',
            'RGB': '135,206,250'
        },
        'lightslategray': {
            'Hex': '778899',
            'RGB': '119,136,153'
        },
        'lightsteelblue': {
            'Hex': 'B0C4DE',
            'RGB': '176,196,222'
        },
        'lightyellow': {
            'Hex': 'FFFFE0',
            'RGB': '255,255,224'
        },
        'lime': {
            'Hex': '00FF00',
            'RGB': '0,255,0'
        },
        'limegreen': {
            'Hex': '32CD32',
            'RGB': '50,205,50'
        },
        'linen': {
            'Hex': 'FAF0E6',
            'RGB': '250,240,230'
        },
        'magenta': {
            'Hex': 'FF00FF',
            'RGB': '255,0,255'
        },
        'maroon': {
            'Hex': '800000',
            'RGB': '128,0,0'
        },
        'mediumaquamarine': {
            'Hex': '66CDAA',
            'RGB': '102,205,170'
        },
        'mediumblue': {
            'Hex': '0000CD',
            'RGB': '0,0,205'
        },
        'mediumorchid': {
            'Hex': 'BA55D3',
            'RGB': '186,85,211'
        },
        'mediumpurple': {
            'Hex': '9370DB',
            'RGB': '147,112,219'
        },
        'mediumseagreen': {
            'Hex': '3CB371',
            'RGB': '60,179,113'
        },
        'mediumslateblue': {
            'Hex': '7B68EE',
            'RGB': '123,104,238'
        },
        'mediumspringgreen': {
            'Hex': '00FA9A',
            'RGB': '0,250,154'
        },
        'mediumturquoise': {
            'Hex': '48D1CC',
            'RGB': '72,209,204'
        },
        'mediumvioletred': {
            'Hex': 'C71585',
            'RGB': '199,21,133'
        },
        'midnightblue': {
            'Hex': '191970',
            'RGB': '25,25,112'
        },
        'mintcream': {
            'Hex': 'F5FFFA',
            'RGB': '245,255,250'
        },
        'mistyrose': {
            'Hex': 'FFE4E1',
            'RGB': '255,228,225'
        },
        'moccasin': {
            'Hex': 'FFE4B5',
            'RGB': '255,228,181'
        },
        'navajowhite': {
            'Hex': 'FFDEAD',
            'RGB': '255,222,173'
        },
        'navy': {
            'Hex': '000080',
            'RGB': '0,0,128'
        },
        'oldlace': {
            'Hex': 'FDF5E6',
            'RGB': '253,245,230'
        },
        'olive': {
            'Hex': '808000',
            'RGB': '128,128,0'
        },
        'olivedrab': {
            'Hex': '6B8E23',
            'RGB': '107,142,35'
        },
        'orange': {
            'Hex': 'FFA500',
            'RGB': '255,165,0'
        },
        'orangered': {
            'Hex': 'FF4500',
            'RGB': '255,69,0'
        },
        'orchid': {
            'Hex': 'DA70D6',
            'RGB': '218,112,214'
        },
        'palegoldenrod': {
            'Hex': 'EEE8AA',
            'RGB': '238,232,170'
        },
        'palegreen': {
            'Hex': '98FB98',
            'RGB': '152,251,152'
        },
        'paleturquoise': {
            'Hex': 'AFEEEE',
            'RGB': '175,238,238'
        },
        'palevioletred': {
            'Hex': 'DB7093',
            'RGB': '219,112,147'
        },
        'papayawhip': {
            'Hex': 'FFEFD5',
            'RGB': '255,239,213'
        },
        'peachpuff': {
            'Hex': 'FFDAB9',
            'RGB': '255,218,185'
        },
        'peru': {
            'Hex': 'CD853F',
            'RGB': '205,133,63'
        },
        'pink': {
            'Hex': 'FFC0CB',
            'RGB': '255,192,203'
        },
        'plum': {
            'Hex': 'DDA0DD',
            'RGB': '221,160,221'
        },
        'powderblue': {
            'Hex': 'B0E0E6',
            'RGB': '176,224,230'
        },
        'purple': {
            'Hex': '800080',
            'RGB': '128,0,128'
        },
        'red': {
            'Hex': 'FF0000',
            'RGB': '255,0,0'
        },
        'rosybrown': {
            'Hex': 'BC8F8F',
            'RGB': '188,143,143'
        },
        'royalblue': {
            'Hex': '4169E1',
            'RGB': '65,105,225'
        },
        'saddlebrown': {
            'Hex': '8B4513',
            'RGB': '139,69,19'
        },
        'salmon': {
            'Hex': 'FA8072',
            'RGB': '250,128,114'
        },
        'sandybrown': {
            'Hex': 'F4A460',
            'RGB': '244,164,96'
        },
        'seagreen': {
            'Hex': '2E8B57',
            'RGB': '46,139,87'
        },
        'seashell': {
            'Hex': 'FFF5EE',
            'RGB': '255,245,238'
        },
        'sienna': {
            'Hex': 'A0522D',
            'RGB': '160,82,45'
        },
        'silver': {
            'Hex': 'C0C0C0',
            'RGB': '192,192,192'
        },
        'skyblue': {
            'Hex': '87CEEB',
            'RGB': '135,206,235'
        },
        'slateblue': {
            'Hex': '6A5ACD',
            'RGB': '106,90,205'
        },
        'slategray': {
            'Hex': '708090',
            'RGB': '112,128,144'
        },
        'snow': {
            'Hex': 'FFFAFA',
            'RGB': '255,250,250'
        },
        'springgreen': {
            'Hex': '00FF7F',
            'RGB': '0,255,127'
        },
        'steelblue': {
            'Hex': '4682B4',
            'RGB': '70,130,180'
        },
        'tan': {
            'Hex': 'D2B48C',
            'RGB': '210,180,140'
        },
        'teal': {
            'Hex': '008080',
            'RGB': '0,128,128'
        },
        'thistle': {
            'Hex': 'D8BFD8',
            'RGB': '216,191,216'
        },
        'tomato': {
            'Hex': 'FF6347',
            'RGB': '255,99,71'
        },
        'turquoise': {
            'Hex': '40E0D0',
            'RGB': '64,224,208'
        },
        'violet': {
            'Hex': 'EE82EE',
            'RGB': '238,130,238'
        },
        'wheat': {
            'Hex': 'F5DEB3',
            'RGB': '245,222,179'
        },
        'white': {
            'Hex': 'FFFFFF',
            'RGB': '255,255,255'
        },
        'whitesmoke': {
            'Hex': 'F5F5F5',
            'RGB': '245,245,245'
        },
        'yellow': {
            'Hex': 'FFFF00',
            'RGB': '255,255,0'
        },
        'yellowgreen': {
            'Hex': '9ACD32',
            'RGB': '154,205,50'
        }
    };

    // Public Methods
    Colors.ProcessValue = function (color, hasOpacity, opacity) {

        var processedColor;
        if (Common.IsNotDefined(color)) {
            return '';
        }
        if (Colors.IsGradient(color) === false) {
            processedColor = prepareColor(color, hasOpacity, opacity);
        }
        else {
            var gradientValues = findGradientValues(color);
            processedColor = [];
            processedColor.push(prepareColor(gradientValues[0], hasOpacity, opacity));
            processedColor.push(prepareColor(gradientValues[1], hasOpacity, opacity));
        }
        return processedColor;

    };

    Colors.ChangeLuminosity = function (color, luminosity) {

        // Default luminosity to 0 if it doesnt exist
        luminosity = luminosity || 0;

        // Convert websafe or RGB to hex, strip and validate hex or exit
        if (Common.IsDefined(Colors.WebSafe[color.trim().toLowerCase()])) {
            color = Colors.WebSafe[color.trim().toLowerCase()].Hex;
        }
        else if (new RegExp(Colors.HexRegEx).test(color)) {
            color = stripHexToBase(color);
        }
        else if (new RegExp(Colors.RGBRegEx).test(color)) {
            color = Colors.ConvertRGBToHex(color);
        }
        else {
            return color.toUpperCase();
        }

        // Extract RGB, convert to decimal, apply luminosity change and rebuild hex value
        var newColor = '', extractedPrimary, primaryIndex = 0;
        for ( ; primaryIndex < 3; primaryIndex++) {
            extractedPrimary = parseInt(color.substr(primaryIndex * 2, 2), 16);
            extractedPrimary = Math.round(Math.min(Math.max(0, extractedPrimary + (extractedPrimary * luminosity)), 255)).toString(16);
            newColor += ('00' + extractedPrimary).substr(extractedPrimary.length);
        }
        return '#' + newColor.toUpperCase();

    };

    Colors.Invert = function (color) {

        // Get color in hex if its not
        if (Common.IsDefined(Colors.WebSafe[color.trim().toLowerCase()])) {
            color = Colors.WebSafe[color.trim().toLowerCase()].Hex;
        }
        else if (new RegExp(Colors.RGBRegEx).test(color)) {
            color = Colors.ConvertRGBToHex(color);
        }
        else {
            color = stripHexToBase(color);
        }

        // Convert to int
        color = parseInt(color, 16);

        // Invert bits
        var invertedColor = 0xFFFFFF ^ color;

        // Back to hex
        invertedColor = invertedColor.toString(16);
        invertedColor = ('000000' + invertedColor).slice(-6);
        return '#' + invertedColor.toUpperCase();

    };

    Colors.ConvertHexToRGB = function (hexColor) {

        if (Common.IsNotDefined(hexColor)) {
            return '';
        }
        hexColor = stripHexToBase(hexColor);
        var redColor, greenColor, blueColor;
        if (hexColor.length == 6) {
            redColor = hexColor.substring(0, 2);
            greenColor = hexColor.substring(2, 4);
            blueColor = hexColor.substring(4, 6);
        }
        else {
            redColor = hexColor.substring(0, 1);
            redColor += redColor;
            greenColor = hexColor.substring(1, 2);
            greenColor += greenColor;
            blueColor = hexColor.substring(2, 3);
            blueColor += blueColor;
        }
        var rgbString = parseInt(redColor, 16) + ',' + parseInt(greenColor, 16) + ',' + parseInt(blueColor, 16);
        return rgbString;

    };

    Colors.ConvertRGBToHex = function (rgbColor) {

        if (Common.IsNotDefined(rgbColor)) {
            return '';
        }
        rgbColor = stripRGBToBase(rgbColor);
        var rgbColorSplit = rgbColor.split(',');
        var hexValue = ((1 << 24) + (parseInt(rgbColorSplit[0]) << 16) + (parseInt(rgbColorSplit[1]) << 8) + parseInt(rgbColorSplit[2]));
        return hexValue.toString(16).slice(1).toUpperCase();

    };

    Colors.IsGradient = function (color) {

        var colorFrom, colorTo, colorSplit;
        if (Common.IsNotDefined(color)) {
            return false;
        }
        else if (Common.IsArray(color) && color.length == 2) {
            colorFrom = color[0];
            colorTo = color[1];
        }
        else if (color.indexOf(':') != -1) {
            colorSplit = color.split(':');
            if (colorSplit.length != 2) {
                return false;
            }
            colorFrom = colorSplit[0];
            colorTo = colorSplit[1];
        }
        else {
            var rgbCheck = color.match(Colors.RGBRegEx);
            var hexCheck = color.match(Colors.HexRegEx);
            if (Common.IsDefined(rgbCheck) && rgbCheck.length == 2 && (Common.IsNotDefined(hexCheck) || hexCheck.length == 0)) {
                colorFrom = rgbCheck[0];
                colorTo = rgbCheck[1];
            }
            else if (Common.IsDefined(hexCheck) && hexCheck.length == 2 && (Common.IsNotDefined(rgbCheck) || rgbCheck.length == 0)) {
                colorFrom = hexCheck[0];
                colorTo = hexCheck[1];
            }
            else if (Common.AreAllDefined([rgbCheck, hexCheck]) && rgbCheck.length == 1 && hexCheck.length == 1) {
                colorFrom = rgbCheck[0];
                colorTo = hexCheck[0];
            }
            else if (color.indexOf(',') != -1) {
                colorSplit = color.split(',');
                var colorTempArray = [];
                var colorIndex = 0, colorLength = colorSplit.length;
                for ( ; colorIndex < colorLength; colorIndex++) {
                    if (Common.IsDefined(Colors.WebSafe[colorSplit[colorIndex].trim().toLowerCase()])) {
                        colorTempArray.push(colorSplit[colorIndex]);
                    }
                }
                if (colorTempArray.length == 2) {
                    colorFrom = colorSplit[0];
                    colorTo = colorSplit[1];
                }
                else if (colorTempArray.length == 1 && ((Common.IsDefined(rgbCheck) && rgbCheck.length == 1) || (Common.IsDefined(hexCheck) && hexCheck.length == 1))) {
                    colorFrom = colorTempArray[0];
                    if (Common.IsDefined(rgbCheck) && rgbCheck.length == 1) {
                        colorTo = rgbCheck[0];
                    }
                    else if (Common.IsDefined(hexCheck) && hexCheck.length == 1) {
                        colorTo = hexCheck[0];
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        var rgbGradientFrom = colorFrom.match(Colors.RGBRegEx);
        var rgbGradientTo = colorTo.match(Colors.RGBRegEx);
        var hexGradientFrom = colorFrom.match(Colors.HexRegEx);
        var hexGradientTo = colorTo.match(Colors.HexRegEx);
        var webSafeFrom = Colors.WebSafe[colorFrom.trim().toLowerCase()];
        var webSafeTo = Colors.WebSafe[colorTo.trim().toLowerCase()];
        var colorCount = 0;
        if (Common.IsDefined(rgbGradientFrom) && rgbGradientFrom.length == 1) {
            colorCount++;
        }
        if (Common.IsDefined(rgbGradientTo) && rgbGradientTo.length == 1) {
            colorCount++;
        }
        if (Common.IsDefined(hexGradientFrom) && hexGradientFrom.length == 1) {
            colorCount++;
        }
        if (Common.IsDefined(hexGradientTo) && hexGradientTo.length == 1) {
            colorCount++;
        }
        if (Common.IsDefined(webSafeFrom)) {
            colorCount++;
        }
        if (Common.IsDefined(webSafeTo)) {
            colorCount++;
        }
        if (colorCount == 2) {
            return true;
        }
        else {
            return false;
        }

    };

    Colors.GenerateRandomHexColor = function () {

        return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);

    };

    Colors.IsDarkColor = function (color) {

        color = Colors.ProcessValue(color);
        if (Common.IsArray(color)) {
            // If color is a gradient only test the bottom gradient color, top shouldn't affect overlayed colors
            color = color[1];
        }
        if (new RegExp(Colors.RGBRegEx).test(color)) {
            var commaCount = (color.match(/,/g) || []).length;
            if (commaCount == 3) {
                if (commaCount == 3) {
                    opacity = color.substr(color.lastIndexOf(',') + 1).replace(' ', '').replace(')', '');
                }
                if (Common.IsNotDefined(opacity) || isNaN(opacity)) {
                    opacity = 1;
                }
                color = 'rgba(' + stripRGBToBase(color) + ',' + opacity + ')';
            }
        }
        else {
            color = Colors.ConvertHexToRGB(color);
        }
        color = RGBToArray(color);

        // Calculate luminance using coefficients based on the CIE color matching functions and the relevant chromaticities of red, green, and blue
        var luminance = Math.round(((parseInt(color[0], 10) * 299) + (parseInt(color[1], 10) * 587) + (parseInt(color[2], 10) * 114)) / 1000);

        // Was 125, but dark seems to have a larger scale than light so made it 145 to compensate
        if (luminance < 145) {
            // Check for rgba opacity, if less than .5 opacity color should always be considered light
            if (Common.IsDefined(color[3]) && parseFloat(color[3]) < .5) {
                return false;
            }
            return true;
        }
        return false;

    };

    Colors.IsLightColor = function (color) {

        return !Colors.IsDarkColor(color);

    };

    // CSS Generation Functions
    Colors.ReturnOnly = {
        Gradient: 'GradientOnly',
        Solid: 'SolidOnly'
    };

    Colors.ColorCSS = function (color, gradientValue, returnOnly) {

        var hasReturnOnly = Common.IsDefined(returnOnly);
        var styling = '';
        if (Common.IsArray(color)) {
            if (!hasReturnOnly || returnOnly == Colors.ReturnOnly.Gradient) {
                styling += 'color: ' + (color[gradientValue] || color[0]) + ';';
            }
        }
        else {
            if (!hasReturnOnly || returnOnly == Colors.ReturnOnly.Solid) {
                styling += 'color: ' + color + ';';
            }
        }
        return styling;

    };

    Colors.BackgroundCSS = function (color, returnOnly) {

        var hasReturnOnly = Common.IsDefined(returnOnly);
        var styling = '';
        if (Common.IsArray(color)) {
            if (!hasReturnOnly || returnOnly == Colors.ReturnOnly.Gradient) {
                styling += 'background: -webkit-linear-gradient(top, ' + color[0] + ' 0%, ' + color[1] + ' 100%);';
                styling += 'background: linear-gradient(to bottom, ' + color[0] + ' 0%, ' + color[1] + ' 100%);';
            }
        }
        else {
            if (!hasReturnOnly || returnOnly == Colors.ReturnOnly.Solid) {
                styling += 'background-color: ' + color + ';';
            }
        }
        return styling;

    };

    Colors.ShadowCSS = function (color, customShadow, customGradientShadow, returnOnly) {

        var hasReturnOnly = Common.IsDefined(returnOnly);
        var styling = '';
        if (!customShadow) {
            customShadow = '0 0 10px 1px';
        }
        if (!customGradientShadow) {
            customGradientShadow = '0 0 10px 1px';
        }
        if (Common.IsArray(color)) {
            if (!hasReturnOnly || returnOnly == Colors.ReturnOnly.Gradient) {
                if (Common.IsArray(customGradientShadow)) {
                    styling += 'box-shadow: ' + customGradientShadow[0] + ' ' + color[0] + ',' + customGradientShadow[1] + color[1] + ';';
                }
                else {
                    styling += 'box-shadow: ' + customGradientShadow + ' ' + color[0] + ',' + customGradientShadow + color[1] + ';';
                }
            }
        }
        else {
            if (!hasReturnOnly || returnOnly == Colors.ReturnOnly.Solid) {
                styling += 'box-shadow: ' + customShadow + ' ' + color + ';';
            }
        }
        return styling;

    };

    Colors.BorderColorCSS = function (color, direction, returnOnly) {

        var hasReturnOnly = Common.IsDefined(returnOnly);
        var styling = '';
        direction = Common.IsDefined(direction) ? '-' + direction : '';
        if (Common.IsArray(color)) {
            if (!hasReturnOnly || returnOnly == Colors.ReturnOnly.Gradient) {
                styling += '-moz-border-image: -moz-linear-gradient(top, ' + color[0] + ' 0%, ' + color[1] + ' 100%);';
                styling += '-webkit-border-image: -webkit-linear-gradient(top, ' + color[0] + ' 0%, ' + color[1] + ' 100%);';
                styling += 'border-image: linear-gradient(to bottom, ' + color[0] + ' 0%, ' + color[1] + ' 100%);';
                styling += 'border-image-slice: 1;';
            }
        }
        else {
            if (!hasReturnOnly || returnOnly == Colors.ReturnOnly.Solid) {
                styling += 'border' + direction + '-color: ' + color + ';';
            }
        }
        return styling;

    };

    // Private Methods
    function prepareColor (color, hasOpacity, opacity) {

        var processedColor = '';
        if (Common.IsDefined(Colors.WebSafe[color.trim().toLowerCase()])) {
            if (hasOpacity == true) {
                if (Common.IsNotDefined(opacity) || isNaN(opacity)) {
                    opacity = 1;
                }
                processedColor = 'rgba(' + Colors.WebSafe[color.trim().toLowerCase()].RGB + ',' + opacity + ')';
            }
            else {
                processedColor = '#' + Colors.WebSafe[color.trim().toLowerCase()].Hex;
            }
        }
        else if (new RegExp(Colors.RGBRegEx).test(color)) {
            var commaCount = (color.match(/,/g) || []).length;
            if (hasOpacity == true || commaCount == 3) {
                if (commaCount == 3) {
                    opacity = color.substr(color.lastIndexOf(',') + 1).replace(' ', '').replace(')', '');
                }
                if (Common.IsNotDefined(opacity) || isNaN(opacity)) {
                    opacity = 1;
                }
                processedColor = 'rgba(' + stripRGBToBase(color) + ',' + opacity + ')';
            }
            else {
                processedColor = '#' + Colors.ConvertRGBToHex(color);
            }
        }
        else if (new RegExp(Colors.HexRegEx).test(color)) {
            if (hasOpacity == true) {
                if (Common.IsNotDefined(opacity) || isNaN(opacity)) {
                    opacity = 1;
                }
                processedColor = 'rgba(' + Colors.ConvertHexToRGB(color) + ',' + opacity + ')';
            }
            else {
                processedColor = '#' + stripHexToBase(color);
            }
        }
        return processedColor;

    };

    function findGradientValues (colors) {

        var gradientArray = [];
        var colorSplit, colorOne, colorTwo;
        if (Common.IsArray(colors) && colors.length == 2) {
            gradientArray.push(colors[0]);
            gradientArray.push(colors[1]);
        }
        else if (colors.indexOf(':') != -1) {
            colorSplit = colors.split(':');
            gradientArray.push(colorSplit[0]);
            gradientArray.push(colorSplit[1]);
        }
        else {
            var rgbCheck = colors.match(Colors.RGBRegEx);
            var hexCheck = colors.match(Colors.HexRegEx);
            if (Common.IsDefined(rgbCheck) && rgbCheck.length == 2) {
                gradientArray.push(rgbCheck[0]);
                gradientArray.push(rgbCheck[1]);
            }
            else if (Common.IsDefined(hexCheck) && hexCheck.length == 2) {
                gradientArray.push(hexCheck[0]);
                gradientArray.push(hexCheck[1]);
            }
            else if (Common.AreAllDefined([rgbCheck, hexCheck]) && rgbCheck.length == 1 && hexCheck.length == 1) {
                colorOne = rgbCheck[0];
                colorTwo = hexCheck[0];

                // Order matters!!
                if (colors.indexOf(colorOne) < colors.indexOf(colorTwo)) {
                    gradientArray.push(colorOne);
                    gradientArray.push(colorTwo);
                }
                else {
                    gradientArray.push(colorTwo);
                    gradientArray.push(colorOne);
                }
            }
            else if (colors.indexOf(',') != -1) {
                colorSplit = colors.split(',');
                var colorTempArray = [];
                var colorIndex = 0, colorLength = colorSplit.length;
                for ( ; colorIndex < colorLength; colorIndex++) {
                    if (Common.IsDefined(Colors.WebSafe[colorSplit[colorIndex].trim().toLowerCase()])) {
                        colorTempArray.push(colorSplit[colorIndex]);
                    }
                }
                if (colorTempArray.length == 2) {
                    gradientArray.push(colorSplit[0]);
                    gradientArray.push(colorSplit[1]);
                }
                else if (colorTempArray.length == 1 && (Common.IsDefined(rgbCheck) && rgbCheck.length == 1 || Common.IsDefined(hexCheck) && hexCheck.length == 1)) {
                    colorOne = colorTempArray[0];
                    if (Common.IsDefined(rgbCheck) && rgbCheck.length == 1) {
                        colorTwo = rgbCheck[0];
                    }
                    else if (Common.IsDefined(hexCheck) && hexCheck.length == 1) {
                        colorTwo = hexCheck[0];
                    }

                    // Order matters!!
                    if (colors.indexOf(colorOne) < colors.indexOf(colorTwo)) {
                        gradientArray.push(colorOne);
                        gradientArray.push(colorTwo);
                    }
                    else {
                        gradientArray.push(colorTwo);
                        gradientArray.push(colorOne);
                    }
                }
            }
        }
        return gradientArray;

    };

    function stripHexToBase (hexColor) {

        if (hexColor.charAt(0) == '#') {
            hexColor = hexColor.substring(1);
        }
        if (hexColor.length == 3) {
            hexColor = hexColor[0] + hexColor[0] + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2];
        }
        return hexColor.toUpperCase();

    };

    function stripRGBToBase (rgbColor) {

        rgbColor = stripRGB(rgbColor);
        var commaCount = (rgbColor.match(/,/g) || []).length;
        if (commaCount > 2) {
            var rgbColorSplit = rgbColor.split(',');
            rgbColor = rgbColorSplit[0] + ',' + rgbColorSplit[1] + ',' + rgbColorSplit[2];
        }
        return rgbColor;

    };

    function RGBToArray (rgbColor) {

        rgbColor = stripRGB(rgbColor);
        var commaCount = (rgbColor.match(/,/g) || []).length;

        // RGB or RGBA
        if (commaCount == 2 || commaCount == 3) {
            return rgbColor.split(',');
        }
        return [];

    };

    function stripRGB (rgbColor) {

        rgbColor = rgbColor.toLowerCase();
        if (rgbColor.indexOf(' ') != -1 || rgbColor.indexOf('r') != -1 || rgbColor.indexOf('g') != -1 || rgbColor.indexOf('b') != -1 || rgbColor.indexOf('a') != -1 || rgbColor.indexOf('(') != -1 || rgbColor.indexOf(')') != -1) {
            rgbColor = rgbColor.replace(' ', '').replace('r', '').replace('g', '').replace('b', '').replace('a', '').replace('(', '').replace(')', '');
        }
        return rgbColor;

    };

} (window.Colors = window.Colors || {}, window, document, Common, Cache, Events, Velocity));
