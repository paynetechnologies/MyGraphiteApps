// Query String
(function (QueryString, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    QueryString.Parse = function (queryString) {

        // Define return object
        var parameterObject = {};

        // Was query string passed or do we get it ourselves?
        queryString = (Common.IsDefined(queryString)) ? queryString :  window.location.search;

        // If it exists let start processing
        if (Common.IsString(queryString) && queryString.length > 0) {
            // Remove starting question mark if its there
            if (queryString[0] === '?') {
                queryString = queryString.substring(1);
            }

            // Break up parameters
            queryString = queryString.split('&');

            // Loop over each parameter and process it
            var element, index = 0, length = queryString.length;
            for ( ; index < length; index++) {
                var element = queryString[index];
                var equalPosition = element.indexOf('=');
                var keyValue, elementValue;

                // Get key and value
                if (equalPosition >= 0) {
                    keyValue = element.substr(0, equalPosition);
                    elementValue = element.substr(equalPosition + 1);
                }
                else {
                    keyValue = element;
                    elementValue = '';
                }

                // Decode
                elementValue = decodeURIComponent(elementValue);

                // Don't pass null string to server
                if (elementValue === 'null') {
                    elementValue = null;
                }

                // If we dont have it, set it, if its an existing array handle it, else create new array
                if (Common.IsNotDefined(parameterObject[keyValue])) {
                    parameterObject[keyValue] = elementValue;
                }
                else if (Common.IsArray(parameterObject[keyValue])) {
                    parameterObject[keyValue].push(elementValue);
                }
                else {
                    parameterObject[keyValue] = [parameterObject[keyValue], elementValue];
                }
            }
        }

        // Return query string object
        return parameterObject;

    };

    QueryString.GenerateOnLoad = function (pageName) {

        // Define return array and generated string
        var queryString = '', queryStringArray = [];

        // Object exists and is an object
        if (Common.IsDefined(pageName) && Common.IsNotEmptyString(pageName)) {
            var onLoadObject = JSON.parse(Common.GetStorage(pageName));

            // Loop over each parameter
            if (Common.IsArray(onLoadObject)) {
                var uiParameter, index = 0, length = onLoadObject.length;
                for ( ; index < length; index++) {
                    uiParameter = onLoadObject[index];
                    queryStringArray.push([encodeURIComponent(uiParameter.Name), encodeURIComponent(uiParameter.Value)].join('='));
                }
            }

            // Join on question mark and ampersand
            queryString = '?' + queryStringArray.join('&');
        }

        // return query string
        return queryString;

    };

    QueryString.ParametersExist = function () {

        if (Common.IsDefined(window.location.search) && Common.IsNotEmptyString(window.location.search)) {
            return true;
        }
        else {
            return false;
        }

    };

    QueryString.CreateOnLoadParameters = function (pageName) {

        if (Common.IsDefined(pageName) && Common.IsNotEmptyString(pageName)) {
            var property, uiParameters = [];
            var parameterObject = QueryString.Parse();
            for (property in parameterObject) {
                var uiParameter = {
                    Name: property,
                    Value: parameterObject[property],
                    UiParameters: null
                };
                uiParameters.push(uiParameter);
            }
            Common.SetStorage(pageName, JSON.stringify(uiParameters));
        }

    };

} (window.QueryString = window.QueryString || {}, window, document, Common, Cache, Events, Velocity));
