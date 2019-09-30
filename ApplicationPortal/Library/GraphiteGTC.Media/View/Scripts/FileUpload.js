// File Upload
// Based On: FileUpload -> ViewElement
(function (FileUpload, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods (Note: Some deprecated items are still processed, removal will require Parser changes)
    FileUpload.Render = function (fileUpload) {

        // Div<>
        var fileUploadMarkup = '<div data-namespace="FileUpload" class="gtc-fileupload"' + ViewElement.RenderAttributes(fileUpload) + '>';

        // Title
        if (Common.IsDefined(fileUpload.Title)) {
            fileUploadMarkup += '<h3 class="gtc-page-theme-color" data-translate="' + fileUpload.Title + '">' + Common.TranslateKey(fileUpload.Title) + '</h3>';
        }

        // Div<>, Form<>, Class@, Id@
        fileUploadMarkup += '<div><form class="gtc-classDivFileUpload" id="' + fileUpload.Name + 'Form"' + EventElement.AttachEvent(fileUpload.Name + 'Form', 'upload', fileUpload.OnUpload, FileUpload.OnUpload) + ' data-uploaddirectory="' + fileUpload.SaveDirectory + '"';

        // Upload Tip
        if (Common.IsDefined(fileUpload.UploadTip)) {
            fileUploadMarkup += ' data-uploadtip="' + fileUpload.UploadTip + '"';
        }

        // Save to Disk?
        if (Common.IsDefined(fileUpload.SaveToDisk)) {
            fileUploadMarkup += ' data-savetodisk="' + fileUpload.SaveToDisk + '"';
        }

        // Append Guid to file name on upload?
        if (Common.IsDefined(fileUpload.AppendGuid)) {
            fileUploadMarkup += ' data-appendguid="' + fileUpload.AppendGuid + '"';
        }

        // Serialize Form?
        if (Common.IsDefined(fileUpload.FormToSerialize)) {
            fileUploadMarkup += ' data-formtoserialize="' + fileUpload.FormToSerialize + '"';
        }

        // On Add Event
        if (Common.IsEventViewElementDefined(fileUpload.OnAdd)) {
            // Data-ControllerPath/ActionName
            fileUploadMarkup += ' data-onadd=\'' + JSON.stringify(fileUpload.OnAdd) + '\'';
        }

        // On Remove Event
        if (Common.IsEventViewElementDefined(fileUpload.OnRemove)) {
            // Data-ControllerPath/ActionName
            fileUploadMarkup += ' data-onremove=\'' + JSON.stringify(fileUpload.OnRemove) + '\'';
        }

        // Build options and Attach event for configuring upload
        var options = {};
        if (fileUpload.SelectMultipleFiles == 'Yes') {
            options.UploadMultiple = true;
        }
        if (Common.IsDefined(fileUpload.MaximumParallelUploads) && !isNaN(fileUpload.MaximumParallelUploads) && parseInt(fileUpload.MaximumParallelUploads, 10) > 0) {
            options.ParallelUploads = fileUpload.MaximumParallelUploads;
        }
        Events.One(document.body, 'configurefileupload',
            function (event) {
                Widgets.uploadfiles(Common.Get(fileUpload.Name + 'Form'), options);
            }
        );

        // Form</>, Div</>, Div</>
        fileUploadMarkup += '></form></div></div>';
        return fileUploadMarkup;

    };

    FileUpload.OnUpload = function (event) {
    };

    FileUpload.OnAdd = function (element, file) {

        var onAddEvent = JSON.parse(Common.GetAttr(element, 'data-onadd'));
        if (Common.IsDefined(onAddEvent)) {
            // File Values
            var fileValuesUiParameters = [
                {
                    Name: 'FileName',
                    Value: file.name,
                    UiParameters: null
                },
                {
                    Name: 'FileSize',
                    Value: file.size,
                    UiParameters: null
                },
                {
                    Name: 'FileType',
                    Value: file.type,
                    UiParameters: null
                }
            ];

            // Initialize
            var onAddParameters = [];

            // Get Add Event
            if (Common.IsDefined(onAddEvent.UiParameters)) {
                onAddParameters = onAddParameters.concat(onAddEvent.UiParameters);
            }

            // Add Parameters
            onAddEvent.FormToSerialize = Common.GetAttr(element, 'data-formtoserialize');
            if (Common.IsDefined(onAddEvent.FormToSerialize)) {
                onAddParameters = onAddParameters.concat(Form.SerializeArray(Common.Get(onAddEvent.FormToSerialize)));
                if (Common.Closest('.gtc-form', element).id != onAddEvent.FormToSerialize) {
                    onAddParameters = onAddParameters.concat(fileValuesUiParameters);
                }
            }
            else {
                onAddParameters = onAddParameters.concat(fileValuesUiParameters);
            }

            // Execute View Behavior
            Common.ExecuteViewBehavior(onAddEvent.ControllerPath + onAddEvent.ActionName, onAddParameters, Page.RunInstructions, element);
        }

    };

    FileUpload.OnRemove = function (element, file) {

        var onRemoveEvent = JSON.parse(Common.GetAttr(element, 'data-onremove'));
        if (Common.IsDefined(onRemoveEvent)) {
            // File Values
            var fileValuesUiParameters = [
                {
                    Name: 'FileName',
                    Value: file.name,
                    UiParameters: null
                },
                {
                    Name: 'FileSize',
                    Value: file.size,
                    UiParameters: null
                },
                {
                    Name: 'FileType',
                    Value: file.type,
                    UiParameters: null
                }
            ];

            // Initialize
            var onRemoveParameters = [];

            // Get Remove Event
            if (Common.IsDefined(onRemoveEvent.UiParameters)) {
                onRemoveParameters = onRemoveParameters.concat(onRemoveEvent.UiParameters);
            }

            // Add Parameters
            onRemoveEvent.FormToSerialize = Common.GetAttr(element, 'data-formtoserialize');
            if (Common.IsDefined(onRemoveEvent.FormToSerialize)) {
                onRemoveParameters = onRemoveParameters.concat(Form.SerializeArray(Common.Get(onRemoveEvent.FormToSerialize)));
                if (Common.Closest('.gtc-form', element).id != onRemoveEvent.FormToSerialize) {
                    onRemoveParameters = onRemoveParameters.concat(fileValuesUiParameters);
                }
            }
            else {
                onRemoveParameters = onRemoveParameters.concat(fileValuesUiParameters);
            }

            // Execute View Behavior
            Common.ExecuteViewBehavior(onRemoveEvent.ControllerPath + onRemoveEvent.ActionName, onRemoveParameters, Page.RunInstructions, element);
        }

    };

} (window.FileUpload = window.FileUpload || {}, window, document, Common, Cache, Events, Velocity));
