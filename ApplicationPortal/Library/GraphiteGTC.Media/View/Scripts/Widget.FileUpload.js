// File Upload Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var UploadFilesWidget = {

        // Options
        options: {
            Url: null,
            Method: 'post',
            WithCredentials: false,
            ParallelUploads: 10,
            UploadMultiple: false,
            MaxFilesize: 256,
            ParameterName: 'file',
            CreateImageThumbnails: true,
            MaxThumbnailFilesize: 10,
            ThumbnailWidth: 100,
            ThumbnailHeight: 100,
            Parameters: {},
            IgnoreHiddenFiles: true,
            AcceptedFiles: null,
            AcceptedMimeTypes: null,
            AutoProcessQueue: false,
            AddRemoveLinks: true,
            Files: [],
            DefaultMessage: '',
            FileTooBig: 'File is too big ({{filesize}}MB). Max filesize: {{maxFilesize}}MB.',
            InvalidFileType: 'You can\'t upload files of this type.',
            CancelUpload: 'CancelUpload',
            ConfirmOnCancelUpload: true,
            RemoveFile: 'RemoveFile',
            ConfirmOnRemoveFile: true,
            PreviewTemplate: '<div class="gtc-classDivPreview gtc-classDivFilePreview" style="display: none;"><div class="gtc-classDivDetails"><div class="gtc-classDivFileName"><span class="gtc-classSpanFileName"></span></div><div class="gtc-classDivFileSize"></div><img class="gtc-classImgThumbnail"/></div><div class="gtc-classDivProgress"><span class="gtc-classDivUploadProgress"></span></div><div class="gtc-classDivSuccess"><span></span></div><div class="gtc-classDivFileUploadError"><span></span></div><div class="gtc-classDivFileUploadErrorMessage"><span class="gtc-classSpanErrorMessage"></span></div></div>',
            UploadButtonHidden: true
        },

        // Semaphores
        semaphores: {
            Added: 'Added',
            Queued: 'Queued',
            Uploading: 'Uploading',
            Canceled: 'Canceled',
            Error: 'Error',
            Success: 'Success'
        },

        // Public Methods
        ProcessQueue: function () {

            var thisWidget = this;
            thisWidget._processQueue();

        },

        SetParameters: function (uiParameters) {

            var thisWidget = this;
            thisWidget._setParameters(uiParameters, thisWidget);

        },

        // Private Methods
        _initializeInputElement: function () {

            var thisWidget = this;

            // Add file upload input field
            var inputFileHtmlMarkup = '<input class="gtc-classInputFileUpload" type="file" id="' + thisWidget.element.id + 'FileInput" name="' + thisWidget.element.id + 'FileInput"';
            if (Common.IsDefined(thisWidget.options.AcceptedFiles)) {
                inputFileHtmlMarkup += ' accept="' + thisWidget.options.AcceptedFiles + '"';
            }

            // Add multi file flag
            if (thisWidget.options.UploadMultiple) {
                inputFileHtmlMarkup += ' multiple';
            }
            inputFileHtmlMarkup += '>';

            // Insert file input
            Common.InsertHTMLString(thisWidget.element, Common.InsertType.After, inputFileHtmlMarkup);

            // Attach file handler
            Events.On(Common.Get(thisWidget.element.id + 'FileInput'), 'change',
                function () {
                    var files = this.files;
                    if (files.length) {
                        thisWidget._selectedFiles(files, thisWidget);
                        thisWidget._handleFiles(files);
                    }
                    this.value = null;
                }
            );

        },

        _initializeEvents: function () {

            var thisWidget = this;
            Events.On(thisWidget.element, 'uploadprogress',
                function () {
                    thisWidget._updateTotalUploadProgress();
                }
            );
            Events.On(thisWidget.element, 'uploadprogress', thisWidget._uploadProgress);
            Events.On(thisWidget.element, 'removedfile',
                function () {
                    thisWidget._updateTotalUploadProgress();
                }
            );
            Events.On(thisWidget.element, 'canceled',
                function (event, file) {
                    Events.Trigger(thisWidget.element, 'complete', file);
                }
            );
            Events.On(thisWidget.element, 'dragenter',
                function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    thisWidget._dragenter(event);
                }
            );
            Events.On(thisWidget.element, 'dragover',
                function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    thisWidget._dragover(event);
                }
            );
            Events.On(thisWidget.element, 'dragleave',
                function (event) {
                    thisWidget._dragleave(event);
                }
            );
            Events.On(thisWidget.element, 'drop',
                function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    thisWidget._actionOnDrop(event, thisWidget);
                }
            );
            Events.On(thisWidget.element, 'drop',
                function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    thisWidget._dropFile(event);
                }
            );
            Events.On(thisWidget.element, 'dragend',
                function (event) {
                    thisWidget._dragend(event);
                }
            );
            Events.On(thisWidget.element, 'thumbnail',
                function (event) {
                    thisWidget._thumbnail(event);
                }
            );
            Events.On(thisWidget.element, 'processing',
                function (event, file) {
                    thisWidget._processing(event, file);
                }
            );
            Events.On(thisWidget.element, 'canceled',
                function (event, file) {
                    thisWidget._canceled(event, file);
                }
            );
            Events.On(thisWidget.element, 'complete',
                function (event, file) {
                    thisWidget._complete(event, file);
                }
            );
            Events.On(thisWidget.element, 'reset',
                function (event) {
                    thisWidget._reset(event);
                }
            );
            Events.On(thisWidget.element, 'click',
                function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    Events.Trigger(Common.Get(thisWidget.element.id + 'FileInput'), 'click');
                }
            );

        },

        _updateTotalUploadProgress: function () {

            var thisWidget = this;
            var totalBytesSent = 0;
            var totalBytes = 0;
            var totalUploadProgress = 0;
            var acceptedFiles = thisWidget._getAcceptedFiles();
            if (acceptedFiles.length) {
                var file, acceptedTypesCount = 0, length = acceptedFiles.length;
                for (; acceptedTypesCount < length; acceptedTypesCount++) {
                    file = acceptedFiles[acceptedTypesCount];
                    totalBytesSent += file.upload.bytesSent;
                    totalBytes += file.upload.total;
                }
                totalUploadProgress = 100 * totalBytesSent / totalBytes;
            }
            else {
                totalUploadProgress = 100;
            }

        },

        _actionOnDrop: function (event, thisWidget) {

            if (!event.originalEvent.dataTransfer) {
                return false;
            }
            var files = event.originalEvent.dataTransfer.files;
            thisWidget._selectedFiles(files, thisWidget);
            if (files.length) {
                var items = event.originalEvent.dataTransfer.items;
                if (Common.IsDefined(items) && items.length && (Common.IsDefined(items[0].webkitGetAsEntry) || Common.IsDefined(items[0].getAsEntry))) {
                    thisWidget._handleFoldersAndFiles(items);
                }
                else {
                    thisWidget._handleFiles(files);
                }
            }

        },

        _handleFiles: function (files) {

            var thisWidget = this;
            var file, fileCount = 0, length = files.length;
            for (; fileCount < length; fileCount++) {
                file = files[fileCount];
                thisWidget._addFile(file);
            }

        },

        _handleFoldersAndFiles: function (items) {

            var thisWidget = this;
            var item, itemCount = 0, length = items.length, entry;
            for (; itemCount < length; itemCount++) {
                item = items[itemCount];
                if (Common.IsDefined(item.webkitGetAsEntry)) {
                    entry = item.webkitGetAsEntry();
                    if (entry.isFile) {
                        thisWidget._addFile(item.getAsFile());
                    }
                    else if (entry.isDirectory) {
                        thisWidget._addDirectory(entry, entry.name);
                    }
                }
                else if (Common.IsDefined(item.getAsEntry)) {
                    entry = item.getAsEntry();
                    if (entry.isFile) {
                        thisWidget._addFile(item.getAsFile());
                    }
                    else if (entry.isDirectory) {
                        thisWidget._addDirectory(entry, entry.name);
                    }
                }
                else {
                    thisWidget._addFile(item.getAsFile());
                }
            }

        },

        _acceptFileForUpload: function (file, callbackFunction) {

            var thisWidget = this;
            if (thisWidget.options.MaxFilesize && file.size > thisWidget.options.MaxFilesize * 1024 * 1024) {
                callbackFunction(thisWidget.options.FileTooBig.replace('{{filesize}}', Math.round(file.size / 1024 / 10.24) / 100).replace('{{maxFilesize}}', thisWidget.options.MaxFilesize), file);
            }
            else if (!thisWidget._isValidFileType(file, thisWidget.options.AcceptedFiles)) {
                callbackFunction(thisWidget.options.InvalidFileType, file);
            }
            else {
                callbackFunction(null, file);
            }

        },

        _addFile: function (file) {

            var thisWidget = this;
            file.upload = {
                progress: 0,
                total: file.size,
                bytesSent: 0
            };
            thisWidget.options.Files.push(file);
            file.status = thisWidget.semaphores.Added;
            thisWidget._createFilePreview(file);

            // If image add thumbnail preview
            if (thisWidget.options.CreateImageThumbnails && file.type.match(/image.*/) && file.size <= thisWidget.options.MaxThumbnailFilesize * 1024 * 1024) {
                thisWidget._createThumbnail(file);
            }

            // Check for valid file and size then queue or throw error
            thisWidget._acceptFileForUpload(file,
                function (error, file) {
                    if (error) {
                        file.accepted = false;
                        thisWidget._processErrors([file], error, null);
                    }
                    else {
                        FileUpload.OnAdd(thisWidget.element, file);
                        thisWidget._queueFileForUpload(file);
                        thisWidget._showUploadButton();
                    }
                }
            );

        },

        _queueFileForUpload: function (file) {

            var thisWidget = this;
            file.accepted = true;
            if (file.status === thisWidget.semaphores.Added) {
                file.status = thisWidget.semaphores.Queued;
                if (thisWidget.options.AutoProcessQueue) {
                    setTimeout(
                        function () {
                            thisWidget._processQueue();
                        }, 1
                    );
                }
            }
            else {
                throw new Error('This file can\'t be queued because it has already been processed or was rejected.');
            }

        },

        _errorHandler: function (event) {
            var errorMessage = '';
            switch (event.code) {
                case FileError.QUOTA_EXCEEDED_ERR:
                    errorMessage = 'QUOTA_EXCEEDED_ERR';
                    break;
                case FileError.NOT_FOUND_ERR:
                    errorMessage = 'NOT_FOUND_ERR';
                    break;
                case FileError.SECURITY_ERR:
                    errorMessage = 'SECURITY_ERR';
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    errorMessage = 'INVALID_MODIFICATION_ERR';
                    break;
                case FileError.INVALID_STATE_ERR:
                    errorMessage = 'INVALID_STATE_ERR';
                    break;
                default:
                    errorMessage = 'Unknown Error';
                    break;
            };
            if (Common.IsDefined(window.console)) {
                console.log('Error: ' + errorMessage);
            }
            else {
                throw new Error('Error: ' + errorMessage);
            }
        },

        _addDirectory: function (entry, path) {

            var thisWidget = this;

            // Define function locally for scope reasons of widget
            var readDirectoryEntriesFunction = function (entries) {
                var entriesCount = 0, length = entries.length;
                for (; entriesCount < length; entriesCount++) {
                    entry = entries[entriesCount];
                    if (entry.isFile) {
                        entry.file(
                            function (file) {
                                if (thisWidget.options.IgnoreHiddenFiles && file.name.substring(0, 1) === '.') {
                                    return;
                                }
                                file.fullPath = '' + path + '/' + file.name;
                                thisWidget._addFile(file);
                            }
                        );
                    }
                    else if (entry.isDirectory) {
                        thisWidget._addDirectory(entry, '' + path + '/' + entry.name);
                    }
                }

            };
            var dirReader = entry.createReader();
            dirReader.readEntries(readDirectoryEntriesFunction, thisWidget._errorHandler);

        },

        _removeFile: function (file) {

            var thisWidget = this;
            if (file.status === thisWidget.semaphores.Uploading) {
                thisWidget._cancelUpload(file);
            }
            thisWidget.options.Files = thisWidget._removeQueuedFiles(thisWidget.options.Files, file);
            thisWidget._removeFilePreview(file);
            FileUpload.OnRemove(thisWidget.element, file);
            if (thisWidget.options.Files.length === 0) {
                Events.Trigger(thisWidget.element, 'reset');
            }

        },

        _attachThumbnail: function (file, dataUrl) {

            var previewElement = file.previewElement;
            Common.RemoveClass(previewElement, 'gtc-classDivFilePreview');
            Common.AddClass(previewElement, 'gtc-classImagePreview');
            var thumbnailElement = Common.Query('.gtc-classImgThumbnail', previewElement);
            Common.SetAttr(thumbnailElement, 'alt', file.name);
            Common.SetAttr(thumbnailElement, 'src', dataUrl);

        },

        _createThumbnail: function (file) {

            var thisWidget = this;
            var fileReader = new FileReader;
            fileReader.onload = function () {
                var img = new Image;
                img.onload = function () {
                    file.width = img.width;
                    file.height = img.height;
                    var resizeData = thisWidget._resizeImageForThumbnail(file);
                    var canvas = Common.GenerateHTML('<canvas></canvas>');
                    var canvasContext = canvas.getContext('2d');
                    canvas.width = resizeData.targetWidth;
                    canvas.height = resizeData.targetHeight;
                    canvasContext.drawImage(img, resizeData.sourceX ? resizeData.sourceX : 0, resizeData.sourceY ? resizeData.sourceY : 0, resizeData.sourceWidth, resizeData.sourceHeight, resizeData.trgX ? resizeData.trgX : 0, resizeData.trgY ? resizeData.trgY : 0, resizeData.targetWidth, resizeData.targetHeight);
                    var thumbnail = canvas.toDataURL('image/png');
                    thisWidget._attachThumbnail(file, thumbnail);
                };
                img.src = fileReader.result;
            };
            fileReader.readAsDataURL(file);

        },

        _resizeImageForThumbnail: function (file) {

            var thisWidget = this;
            var resizeData = {
                sourceX: 0,
                sourceY: 0,
                sourceWidth: file.width,
                sourceHeight: file.height
            };
            var sourceRatio = file.width / file.height;
            var targetRatio = thisWidget.options.ThumbnailWidth / thisWidget.options.ThumbnailHeight;
            if (file.height < thisWidget.options.ThumbnailHeight || file.width < thisWidget.options.ThumbnailWidth) {
                resizeData.targetHeight = resizeData.sourceHeight;
                resizeData.targetWidth = resizeData.sourceWidth;
            }
            else {
                if (sourceRatio > targetRatio) {
                    resizeData.sourceHeight = file.height;
                    resizeData.sourceWidth = resizeData.sourceHeight * targetRatio;
                }
                else {
                    resizeData.sourceWidth = file.width;
                    resizeData.sourceHeight = resizeData.sourceWidth / targetRatio;
                }
            }
            resizeData.sourceX = (file.width - resizeData.sourceWidth) / 2;
            resizeData.sourceY = (file.height - resizeData.sourceHeight) / 2;
            if (!resizeData.targetWidth) {
                resizeData.targetWidth = thisWidget.options.ThumbnailWidth;
            }
            if (!resizeData.targetHeight) {
                resizeData.targetHeight = thisWidget.options.ThumbnailHeight;
            }
            return resizeData;

        },

        _getAcceptedFiles: function () {

            var thisWidget = this;
            var results = [];
            var file, acceptedFilesCount = 0, length = thisWidget.options.Files.length;
            for (; acceptedFilesCount < length; acceptedFilesCount++) {
                file = thisWidget.options.Files[acceptedFilesCount];
                if (file.accepted) {
                    results.push(file);
                }
            }
            return results;

        },

        _getRejectedFiles: function () {

            var thisWidget = this;
            var results = [];
            var file, rejectedFilesCount = 0, length = thisWidget.options.Files.length;
            for (; rejectedFilesCount < length; rejectedFilesCount++) {
                file = thisWidget.options.Files[rejectedFilesCount];
                if (!file.accepted) {
                    results.push(file);
                }
            }
            return results;

        },

        _getQueuedFiles: function () {

            var thisWidget = this;
            var results = [];
            var file, queuedFilesCount = 0, length = thisWidget.options.Files.length;
            for (; queuedFilesCount < length; queuedFilesCount++) {
                file = thisWidget.options.Files[queuedFilesCount];
                if (file.status === thisWidget.semaphores.Queued) {
                    results.push(file);
                }
            }
            return results;

        },

        _getUploadingFiles: function () {

            var thisWidget = this;
            var results = [];
            var file, uploadingFilesCount = 0, length = thisWidget.options.Files.length;
            for (; uploadingFilesCount < length; uploadingFilesCount++) {
                file = thisWidget.options.Files[uploadingFilesCount];
                if (file.status === thisWidget.semaphores.Uploading) {
                    results.push(file);
                }
            }
            return results;

        },

        _processQueue: function () {

            var thisWidget = this;
            var parallelUploads = thisWidget.options.ParallelUploads;
            var processingLength = thisWidget._getUploadingFiles().length;
            var processingCount = processingLength;
            if (processingLength >= parallelUploads) {
                return false;
            }
            var queuedFiles = thisWidget._getQueuedFiles();
            if (!(queuedFiles.length > 0)) {
                var messageType = Modals.ModalTypes.Error;
                var messageTitle = 'Error';
                var messageBody = 'There are no files in your upload queue.';
                Modals.ShowModalMessageDialog(messageType, messageTitle, messageBody, null);
                return false;
            }
            if (thisWidget.options.UploadMultiple) {
                return thisWidget._processFiles(queuedFiles.slice(0, parallelUploads - processingLength), thisWidget);
            }
            else {
                while (processingCount < parallelUploads) {
                    if (!queuedFiles.length) {
                        return false;
                    }
                    thisWidget._processFile(queuedFiles.shift(), thisWidget);
                    processingCount++;
                }
            }

        },

        _setParameters: function (uiParameters, thisWidget) {

            thisWidget.options.Parameters['UiParameters'] = JSON.stringify(uiParameters);

        },

        _processFile: function (file, thisWidget) {

            thisWidget._processFiles([file], thisWidget);

        },

        _processFiles: function (files, thisWidget) {

            var thisWidget = this;
            var file, fileCounter = 0, length = files.length;
            for (; fileCounter < length; fileCounter++) {
                file = files[fileCounter];
                file.processing = true;
                file.status = thisWidget.semaphores.Uploading;
                Events.Trigger(thisWidget.element, 'processing', file);
            }
            thisWidget._uploadFiles(files);

        },

        _getFilesWithXmlHttpRequest: function (xmlHttpRequest) {

            var thisWidget = this;
            var currentFilesReference = thisWidget.options.Files;
            var results = [];
            var file, fileCounter = 0, length = currentFilesReference.length;
            for (; fileCounter < length; fileCounter++) {
                file = currentFilesReference[fileCounter];
                if (file.xmlHttpRequest === xmlHttpRequest) {
                    results.push(file);
                }
            }
            return results;

        },

        _cancelUpload: function (file) {

            var thisWidget = this;
            if (file.status === thisWidget.semaphores.Uploading) {
                var groupedFiles = thisWidget._getFilesWithXmlHttpRequest(file.xmlHttpRequest);
                var groupedFile, fileCounter = 0, length = groupedFiles.length;
                for (; fileCounter < length; fileCounter++) {
                    groupedFile = groupedFiles[fileCounter];
                    groupedFile.status = thisWidget.semaphores.Canceled;
                }
                file.xmlHttpRequest.abort();
                fileCounter = 0, length = groupedFiles.length;
                for (; fileCounter < length; fileCounter++) {
                    groupedFile = groupedFiles[fileCounter];
                    Events.Trigger(thisWidget.element, 'canceled', groupedFile);
                }
            }
            else if (file.status === thisWidget.semaphores.Added || file.status === thisWidget.semaphores.Queued) {
                file.status = thisWidget.semaphores.Canceled;
                Events.Trigger(thisWidget.element, 'canceled', file);
            }
            if (thisWidget.options.AutoProcessQueue) {
                thisWidget._processQueue();
            }

        },

        _uploadFiles: function (files) {

            var thisWidget = this;

            // Create request
            var xmlHttpRequest = new XMLHttpRequest();

            // Add request to each file
            var file, fileCounter = 0, length = files.length;
            for (; fileCounter < length; fileCounter++) {
                file = files[fileCounter];
                file.xmlHttpRequest = xmlHttpRequest;
            }

            //  Set method, url and asynch
            xmlHttpRequest.open(thisWidget.options.Method, thisWidget.options.Url, true);

            // set credentials attribute if needed
            xmlHttpRequest.withCredentials = thisWidget.options.WithCredentials;

            // Variable for server response
            var serverResponse = null;

            // Local function for updating progress
            var updateProgressFunction = function (event) {
                var allFilesFinished;
                var progress, file, fileCounter = 0, length = files.length;
                if (Common.IsDefined(event)) {
                    progress = 100 * event.loaded / event.total;
                    for (; fileCounter < length; fileCounter++) {
                        file = files[fileCounter];
                        file.upload = {
                            progress: progress,
                            total: event.total,
                            bytesSent: event.loaded
                        };
                    }
                }
                else {
                    allFilesFinished = true;
                    progress = 100;
                    for (; fileCounter < length; fileCounter++) {
                        file = files[fileCounter];
                        if (!(file.upload.progress === 100 && file.upload.bytesSent === file.upload.total)) {
                            allFilesFinished = false;
                        }
                        file.upload.progress = progress;
                        file.upload.bytesSent = file.upload.total;
                    }
                    if (allFilesFinished) {
                        return true;
                    }
                }
                var results = [];
                fileCounter = 0, length = files.length;
                for (; fileCounter < length; fileCounter++) {
                    file = files[fileCounter];
                    results.push(Events.Trigger(thisWidget.element, 'uploadprogress', [file, progress, file.upload.bytesSent]));
                }
                return results;
            };

            // Request onload
            xmlHttpRequest.onload = function (event) {
                var statusScopeReference;
                if (files[0].status === thisWidget.semaphores.Canceled) {
                    return false;
                }
                if (xmlHttpRequest.readyState !== 4) {
                    return false;
                }
                serverResponse = xmlHttpRequest.responseText;
                if (xmlHttpRequest.getResponseHeader('content-type') && ~xmlHttpRequest.getResponseHeader('content-type').indexOf('application/json')) {
                    try {
                        serverResponse = JSON.parse(serverResponse);
                    }
                    catch (error) {
                        serverResponse = 'Invalid JSON response from server.';
                    }
                }
                updateProgressFunction(event);
                if (!((200 <= (statusScopeReference = xmlHttpRequest.status) && statusScopeReference < 300)) || serverResponse.success == false) {
                    if (statusScopeReference == 404) {
                        serverResponse = 'URL not found or File Size is more than server limit.';
                    }
                    thisWidget._processErrors(files, serverResponse, xmlHttpRequest);
                }
                else {
                    thisWidget._finishedUploadingCleanup(files, serverResponse, event);
                }
            };

            // Set progress function
            var progressObject = (statusScopeReference = xmlHttpRequest.upload) != null ? statusScopeReference : xmlHttpRequest;
            progressObject.onprogress = updateProgressFunction;

            // Request onerror
            xmlHttpRequest.onerror = function () {
                if (files[0].status === thisWidget.semaphores.Canceled) {
                    return false;
                }
                thisWidget._processErrors(files, serverResponse, xmlHttpRequest);
            };

            // Create headers and add to request
            var headers = {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'X-Requested-With': 'XMLHttpRequest'
            };
            for (var headerName in headers) {
                var headerValue = headers[headerName];
                xmlHttpRequest.setRequestHeader(headerName, headerValue);
            }

            // Create FormData variable and uiParamters
            var formData = new FormData();
            var parameters = Common.MergeObjects(true, {}, thisWidget.options.Parameters);

            // Add CurrentUser to BehaviorParameters
            var sessionToken = Common.GetSessionToken();
            if (Common.IsDefined(sessionToken)) {
                var uiParameters = [];
                if (parameters && parameters.UiParameters) {
                    uiParameters = JSON.parse(parameters.UiParameters);
                }
                uiParameters.push({
                    Name: 'CurrentUser',
                    Value: sessionToken,
                    UiParameters: null
                });
                parameters.UiParameters = JSON.stringify(uiParameters);
            }

            // Form to serialize?
            var formToSerialize = Common.GetAttr(thisWidget.element, 'data-formtoserialize');
            if (Common.IsDefined(formToSerialize)) {
                var uiParameters = [];
                if (parameters && parameters.UiParameters) {
                    uiParameters = JSON.parse(parameters.UiParameters);
                }
                uiParameters = uiParameters.concat(Form.SerializeArray(Common.Get(formToSerialize)));
                parameters.UiParameters = JSON.stringify(uiParameters);
            }

            // Add SaveToDisk to BehaviorParameters
            var saveToDisk = Common.GetAttr(thisWidget.element, 'data-savetodisk');
            if (Common.IsDefined(saveToDisk)) {
                formData.append('SaveToDisk', saveToDisk);
            }

            // Add AppendGuid to BehaviorParameters
            var appendGuid = Common.GetAttr(thisWidget.element, 'data-appendguid');
            if (Common.IsDefined(appendGuid)) {
                formData.append('AppendGuid', appendGuid);
            }

            // Add optional parameters from user if they exist (TODO: Put in UiParameters?)
            if (parameters) {
                for (var key in parameters) {
                    value = parameters[key];
                    formData.append(key, value);
                }
            }

            // Find any extra fields in form and add to request (TODO: Put in UiParameters?)
            if (Common.CheckNodeType(this.element, 'form')) {
                var additionalFields = Common.QueryAll('input, textarea, select, button', thisWidget.element);
                var input, additionFieldCounter = 0, length = additionalFields.length;
                for (; additionFieldCounter < length; additionFieldCounter++) {
                    input = additionalFields[additionFieldCounter];
                    var inputName = input.name;
                    formData.append(inputName, input.value);
                }
            }

            // Add each file for upload to request
            var file, fileCounter = 0, length = files.length;
            for (; fileCounter < length; fileCounter++) {
                file = files[fileCounter];
                var parameterName = thisWidget.options.ParameterName;
                if (thisWidget.options.UploadMultiple) {
                    parameterName += '[]';
                }
                formData.append(parameterName, file, file.name);
            }

            // Send request to server
            xmlHttpRequest.send(formData);

        },

        _finishedUploadingCleanup: function (files, serverResponse, event) {

            var thisWidget = this;
            var file, fileCounter = 0, length = files.length;
            for (; fileCounter < length; fileCounter++) {
                file = files[fileCounter];
                if (Common.IsDefined(serverResponse.UiValidation) && serverResponse.UiValidation.ContainsError == 'Yes') {
                    file.status = thisWidget.semaphores.Error;
                    thisWidget._canceled(event, file);
                }
                else {
                    file.status = thisWidget.semaphores.Success;
                    thisWidget._success(file);
                }
                Events.Trigger(thisWidget.element, 'complete', file);
            }
            if (thisWidget.options.AutoProcessQueue) {
                thisWidget._processQueue();
            }
            Page.RunInstructions(serverResponse, thisWidget.element);

        },

        _processErrors: function (files, message, xmlHttpRequest) {

            var thisWidget = this;
            var file, fileCounter = 0, length = files.length;
            for (; fileCounter < length; fileCounter++) {
                file = files[fileCounter];
                file.status = thisWidget.semaphores.Error;
                thisWidget._showErrorDetails(file, message);
                Events.Trigger(thisWidget.element, 'complete', file);
            }
            var errorObject = {
                ErrorDisplayDetails: [
                    {
                        FullName: '',
                        Message: message,
                        Name: '',
                        Source: '',
                        StackTrace: ''
                    }
                ]
            };
            Modals.ShowModalErrorDialog(JSON.stringify(errorObject));
            if (thisWidget.options.AutoProcessQueue) {
                thisWidget._processQueue();
            }

        },

        _showErrorDetails: function (file, message) {

            var previewElement = file.previewElement;
            Velocity(Common.Query('.gtc-classDivFileUploadError', previewElement), 'fadeIn', 'slow');
            if (message && message.length < 100) {
                Common.Query('.gtc-classSpanErrorMessage', previewElement).textContent = message;
            }
            else {
                Common.Query('.gtc-classSpanErrorMessage', previewElement).textContent = file.status;
            }
            Velocity(Common.Query('.gtc-classDivFileUploadErrorMessage', previewElement), 'fadeIn', 'slow');

        },

        _dropFile: function (event) {

            var thisWidget = this;
            Common.RemoveClass(thisWidget.element, 'gtc-classDragHover');

        },

        _dragend: function (event) {

            var thisWidget = this;
            Common.RemoveClass(thisWidget.element, 'gtc-classDragHover');

        },

        _dragenter: function (event) {

            var thisWidget = this;
            Common.AddClass(thisWidget.element, 'gtc-classDragHover');

        },

        _dragover: function (event) {

            var thisWidget = this;
            Common.AddClass(thisWidget.element, 'gtc-classDragHover');

        },

        _dragleave: function (event) {

            var thisWidget = this;
            Common.RemoveClass(thisWidget.element, 'gtc-classDragHover');

        },

        _selectedFiles: function (files, thisWidget) {

            Common.AddClass(thisWidget.element, 'gtc-classUploadedStarted');

        },

        _reset: function () {

            var thisWidget = this;
            Common.RemoveClass(thisWidget.element, 'gtc-classUploadedStarted');

        },

        _createFilePreview: function (file) {

            var thisWidget = this;

            // Create DOM reference for use later
            var insertHtmlReference = Common.GenerateHTML(thisWidget.options.PreviewTemplate);
            thisWidget.element.appendChild(insertHtmlReference);
            file.previewElement = insertHtmlReference;
            file.previewTemplate = insertHtmlReference;
            var previewElement = file.previewElement;
            Common.Query('.gtc-classSpanFileName', previewElement).textContent = file.name;
            Common.Query('.gtc-classDivFileSize', previewElement).innerHTML = thisWidget._buildFilesizeHtml(file.size);

            // Add remove links to remove a file for queued upload
            if (thisWidget.options.AddRemoveLinks) {
                file.removeLink = Common.GenerateHTML('<a class="gtc-classAnchorRemoveFile" href="javascript:undefined;" data-translate="' + thisWidget.options.RemoveFile + '">' + Common.TranslateKey(thisWidget.options.RemoveFile) + '</a>');

                // Attach click event
                Events.On(file.removeLink, 'click',
                    function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        if (file.status === thisWidget.semaphores.Uploading) {
                            if (thisWidget.options.ConfirmOnCancelUpload) {
                                var messageTitle = 'Are you sure you want to cancel?';
                                var messageBody = 'Canceling this upload will stop the file from being saved.<br><br>Are you sure you want to?';
                                thisWidget._getUserConfirmation(messageTitle, messageBody,
                                    function () {
                                        thisWidget._removeFile(file);
                                        thisWidget._hideUploadButton();
                                    }, null
                                );
                            }
                        }
                        else {
                            if (thisWidget.options.ConfirmOnRemoveFile) {
                                var messageTitle = 'Are you sure you want to remove this file?';
                                var messageBody = 'Removing this file will stop it from being saved.<br><br>Do you want to remove it anyway?';
                                thisWidget._getUserConfirmation(messageTitle, messageBody,
                                    function () {
                                        thisWidget._removeFile(file);
                                        thisWidget._hideUploadButton();
                                    }, null
                                );
                            }
                            else {
                                thisWidget._removeFile(file);
                                thisWidget._hideUploadButton();
                            }
                        }
                    }
                );

                // Add preview to form
                previewElement.appendChild(file.removeLink);
            }

            // Translate page
            Common.RetranslatePage();

            // Show preview
            Velocity(previewElement, 'fadeIn', { duration: 'slow', display: 'inline-block' });

            // Calculate page height
            Page.SetPageHeight();

        },

        _removeFilePreview: function (file) {

            var thisWidget = this;
            if (Common.IsDefined(file.previewElement)) {
                var previewElement = file.previewElement;
                Velocity(previewElement, 'fadeOut', 'slow',
                    function () {
                        Common.Remove(previewElement);
                    }
                );
            }

        },

        _removeQueuedFiles: function (files, rejectedFile) {

            var results = [];
            var file, fileCounter = 0, length = files.length;
            for (; fileCounter < length; fileCounter++) {
                file = files[fileCounter];
                if (file !== rejectedFile) {
                    results.push(file);
                }
            }
            return results;

        },

        _processing: function (event, file) {

            var thisWidget = this;
            Common.AddClass(file.previewElement, 'gtc-classUploadProcessing');
            if (Common.IsDefined(file.removeLink)) {
                var removeLink = file.removeLink;
                removeLink.textContent = Common.TranslateKey(thisWidget.options.CancelUpload);
                Common.SetAttr(removeLink, 'data-translate', thisWidget.options.CancelUpload);
            }

        },

        _uploadProgress: function (event, file, progress, bytesSent) {

            Common.Query('.gtc-classDivUploadProgress', file.previewElement).style.width = progress + '%';

        },

        _success: function (file) {

            Velocity(Common.Query('.gtc-classDivSuccess', file.previewElement), 'fadeIn', 'slow');
            var removeLink = file.removeLink;
            if (Common.IsDefined(removeLink)) {
                Velocity(removeLink, 'slideUp', 'slow',
                    function () {
                        Common.Remove(removeLink);
                    }
                );
            }

        },

        _canceled: function (event, file) {

            var thisWidget = this;
            thisWidget._showErrorDetails(file, 'Upload canceled.');

        },

        _complete: function (event, file) {

            var thisWidget = this;
            var removeLink = file.removeLink;
            if (Common.IsDefined(removeLink)) {
                removeLink.textContent = Common.TranslateKey(thisWidget.options.RemoveFile);
                Common.SetAttr(removeLink, 'data-translate', thisWidget.options.RemoveFile);
            }

        },

        _buildFilesizeHtml: function (size) {

            var fileSizeMarkup;
            if (size >= 100000000000) {
                size = size / 100000000000;
                fileSizeMarkup = 'TB';
            }
            else if (size >= 100000000) {
                size = size / 100000000;
                fileSizeMarkup = 'GB';
            }
            else if (size >= 100000) {
                size = size / 100000;
                fileSizeMarkup = 'MB';
            }
            else if (size >= 100) {
                size = size / 100;
                fileSizeMarkup = 'KB';
            }
            else {
                size = size * 10;
                fileSizeMarkup = 'b';
            }
            return '<strong>' + (Math.round(size) / 10) + '</strong> ' + fileSizeMarkup;

        },

        _isValidFileType: function (file, acceptedFiles) {

            if (!acceptedFiles) {
                return true;
            }
            acceptedFiles = acceptedFiles.split(',');
            var mimeType = file.type;
            var baseMimeType = mimeType.replace(/\/.*$/, '');
            var validType, validTypeCounter = 0, length = acceptedFiles.length;
            for (; validTypeCounter < length; validTypeCounter++) {
                validType = acceptedFiles[validTypeCounter];
                validType = validType.trim();
                if (validType.charAt(0) === '.') {
                    if (file.name.indexOf(validType, file.name.length - validType.length) !== -1) {
                        return true;
                    }
                }
                else if (/\/\*$/.test(validType)) {
                    if (baseMimeType === validType.replace(/\/.*$/, '')) {
                        return true;
                    }
                }
                else {
                    if (mimeType === validType) {
                        return true;
                    }
                }
            }
            return false;

        },

        _getUserConfirmation: function (messageTitle, messageBody, onAccept, onReject) {

            // Show Modal for user input
            var messageType = Modals.ModalTypes.Confirmation;
            Modals.ShowModalMessageDialog(messageType, messageTitle, messageBody,
                function (modalResult) {
                    if (modalResult == Modals.ModalResult.Yes) {
                        if (Common.IsFunction(onAccept)) {
                            onAccept();
                        }
                    }
                    else {
                        if (Common.IsFunction(onReject)) {
                            onReject();
                        }
                    }
                }
            );

        },

        _initializeUploadButton: function () {

            var thisWidget = this;

            // Anchor<, TabIndex@, Class@, Id@, Data-ControllerPath/ActionName@, Wire OnClick!, Anchor>
            var buttonMarkup = '<a data-namespace="Button" class="gtc-btn gtc-btn-button gtc-btn--basic gtc-btn--basic-active gtc-btn--size-default" id="' + thisWidget.element.id + 'UploadButton"';
            buttonMarkup += '><i class="gtc-icon-styles fa fa-cloud-upload"></i><span data-translate="Upload">' + Common.TranslateKey('Upload') + '</span></a>';
            Common.InsertHTMLString(thisWidget.element, Common.InsertType.After, buttonMarkup);

            // Make nice button
            if (Common.IsFunction(thisWidget.element.uibutton)) {
                Widgets.uibutton(Common.Get(thisWidget.element.id + 'UploadButton'));
            }

            // Attach upload event
            Events.On(Common.Get(thisWidget.element.id + 'UploadButton'), 'click',
                function () {
                    thisWidget._processQueue();
                }
            );

        },

        _showUploadButton: function () {

            var thisWidget = this;
            if (!thisWidget.options.AutoProcessQueue) {
                var queuedFiles = thisWidget._getQueuedFiles();
                if (queuedFiles.length > 0) {
					if (thisWidget.options.UploadButtonHidden) {
						thisWidget.options.UploadButtonHidden = false;
						Velocity(Common.Get(thisWidget.element.id + 'UploadButton'), 'fadeIn', { duration: 'slow', display: 'inline-block',
							complete: function () {
								Common.ResizeView();
							}
						});
					}
					else {
						Common.ResizeView();
					}
                }
            }

        },

        _hideUploadButton: function () {

            var thisWidget = this;
            if (!thisWidget.options.AutoProcessQueue) {
                var queuedFiles = thisWidget._getQueuedFiles();
                if (queuedFiles.length == 0) {
					if (!thisWidget.options.UploadButtonHidden) {
						thisWidget.options.UploadButtonHidden = true;
						Velocity(Common.Get(thisWidget.element.id + 'UploadButton'), 'fadeOut', 'slow',
							function () {
								Common.ResizeView();
							}
						);
					}
					else {
						Common.ResizeView();
					}
                }
            }

        },

        _init: function () {
        },

        _create: function () {

            var thisWidget = this;
            if (Common.CheckNodeType(thisWidget.element, 'form')) {
                Common.SetAttr(thisWidget.element, 'enctype', 'multipart/form-data');
            }
            if (Common.IsDefined(Common.GetAttr(thisWidget.element, 'data-upload'))) {
                var onUploadEvent = JSON.parse(Common.GetAttr(thisWidget.element, 'data-upload'));
                thisWidget.options.Url = onUploadEvent.ControllerPath + onUploadEvent.ActionName;
                if (Common.IsDefined(onUploadEvent.UiParameters)) {
                    thisWidget.options.Parameters['UiParameters'] = JSON.stringify(onUploadEvent.UiParameters);
                }
                thisWidget.options.Parameters['UploadDirectory'] = Common.GetAttr(thisWidget.element, 'data-uploaddirectory');
            }
            var uploadTip = Common.GetAttr(thisWidget.element, 'data-uploadtip');
            if (Common.IsDefined(uploadTip)) {
                thisWidget.options.DefaultMessage = uploadTip;
                Common.InsertHTMLString(thisWidget.element, Common.InsertType.Append, '<div class="gtc-classDivPreviewDefault gtc-classDivPreviewMessage"><span data-translate="' + thisWidget.options.DefaultMessage + '">' + Common.TranslateKey(thisWidget.options.DefaultMessage) + '</span></div>');
            }

            // Create input
            thisWidget._initializeInputElement();

            // Attach events
            thisWidget._initializeEvents();

            // Add button
            if (!thisWidget.options.AutoProcessQueue) {
                thisWidget._initializeUploadButton();
            }

        }
    };

    WidgetFactory.Register('gtc.uploadfiles', UploadFilesWidget);

} (window, document, Common, Cache, Events, Velocity));
