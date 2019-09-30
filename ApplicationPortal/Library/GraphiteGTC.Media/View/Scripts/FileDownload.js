// File Download
// Based On: FileDownload -> ViewElement
(function (FileDownload, window, document, Common, Cache, Events, Velocity, undefined) {

    // Private Variables
    var fileIds = [];
    var documentTypes = ['doc', 'docx', 'txt'];
    var pdfTypes = ['pdf'];
    var excelTypes = ['xls', 'xlsx'];
    var powerPointTypes = ['ppt', 'pptx'];
    var imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    var videoTypes = ['mp4', 'avi', 'ogg', 'ogv', 'webm', 'mkv', 'mov', 'm4v'];
    var audioTypes = ['mp3', 'wav', 'm4a'];
    var archiveTypes = ['zip', 'rar', 'tar'];

    // Public Methods
    FileDownload.Render = function (fileDownload) {

        // Div<, Class@, Name@, Id@, Div>
        var fileDownloadMarkup = '<div class="gtc-filedownload" data-namespace="FileDownload"' + ViewElement.RenderAttributes(fileDownload);

        // File Directory
        if (Common.IsDefined(fileDownload.FileDirectory)) {
            fileDownloadMarkup += ' data-filedirectory="' + fileDownload.FileDirectory + '"';
        }

        // Div</>
        fileDownloadMarkup += '>';

        // Render Title
        if (Common.IsDefined(fileDownload.Title)) {
            fileDownloadMarkup += '<h3 class="gtc-page-theme-color" data-translate="' + fileDownload.Title + '">' + Common.TranslateKey(fileDownload.Title) + '</h3>';
        }

        // Div<>
        fileDownloadMarkup += '<div id="' + fileDownload.Name + 'ScrollTarget" class="gtc-scrolltarget gtc-cfscroll-y">';

        // Render Files
        if (Common.IsDefined(fileDownload.FileNames) && fileDownload.FileNames.length > 0) {
            var file, index = 0, length = fileDownload.FileNames.length;
            for ( ; index < length; index++) {
                file = fileDownload.FileNames[index];
                var uniqueId = 'GTC' + Common.GenerateUniqueID();
                fileIds[file] = uniqueId;
                fileDownloadMarkup += '<div class="gtc-filedownload-file">';

                // Label<, For@, Display, Input<, @Data-NameSpace, @Data-FieldType
                fileDownloadMarkup += '<label class="gtc-input-checkbox" for="' + uniqueId + 'FileDownloadCheckbox"><input data-namespace="CheckboxField"';

                // Data-CheckboxGroup@, @Name
                fileDownloadMarkup += ' data-checkboxgroup="' + fileDownload.Name + 'Group" name="' + uniqueId + 'FileDownloadCheckbox"';

                // @TabIndex, @Class, @Id, @Type
                fileDownloadMarkup += ' tabindex="' + fileDownload.FocusIndex + '" class="gtc-input-checkbox-choice" id="' + uniqueId + 'FileDownloadCheckbox" type="checkbox" /></label>';

                fileDownloadMarkup += '<a class="gtc-filedownload-link" href="' + fileDownload.FileDirectory + '/' + file + '" id="' + uniqueId + '" data-filename="' + file + '" target="_blank" download>';
                var extensionArray = file.split('.');
                var extension = extensionArray[extensionArray.length - 1].toLowerCase();
                if (Common.IsInArray(extension, documentTypes) != -1) {
                    fileDownloadMarkup += '<i class="gtc-icon-styles fa fa-file-word-o"></i>';
                }
                else if (Common.IsInArray(extension, pdfTypes) != -1) {
                    fileDownloadMarkup += '<i class="gtc-icon-styles fa fa-file-pdf-o"></i>';
                }
                else if (Common.IsInArray(extension, excelTypes) != -1) {
                    fileDownloadMarkup += '<i class="gtc-icon-styles fa fa-file-excel-o"></i>';
                }
                else if (Common.IsInArray(extension, powerPointTypes) != -1) {
                    fileDownloadMarkup += '<i class="gtc-icon-styles fa fa-file-powerpoint-o"></i>';
                }
                else if (Common.IsInArray(extension, imageTypes) != -1) {
                    fileDownloadMarkup += '<i class="gtc-icon-styles fa fa-file-image-o"></i>';
                }
                else if (Common.IsInArray(extension, videoTypes) != -1) {
                    fileDownloadMarkup += '<i class="gtc-icon-styles fa fa-file-video-o"></i>';
                }
                else if (Common.IsInArray(extension, audioTypes) != -1) {
                    fileDownloadMarkup += '<i class="gtc-icon-styles fa fa-file-audio-o"></i>';
                }
                else if (Common.IsInArray(extension, archiveTypes) != -1) {
                    fileDownloadMarkup += '<i class="gtc-icon-styles fa fa-file-archive-o"></i>';
                }
                fileDownloadMarkup += file;
                fileDownloadMarkup += '</a>';
                fileDownloadMarkup += '</div>';
            }
        }

        // Div</>
        fileDownloadMarkup += '</div>';

        // Select All
        fileDownloadMarkup += '<a id="' + fileDownload.Name + 'SelectAllButton" class="gtc-btn gtc-btn-button gtc-btn--basic gtc-btn--basic-active gtc-btn--size-default"><i class="gtc-icon-styles fa fa-check"></i><span class="gtc-filedownload-selectallbutton" data-translate="SelectAll">' + Common.TranslateKey('SelectAll') + '</span></a>';

        // Download Selected Files
        fileDownloadMarkup += '<a id="' + fileDownload.Name + 'DownloadSelectedFilesButton" class="gtc-btn gtc-btn-button gtc-btn--basic gtc-btn--basic-active gtc-btn--size-default"><i class="gtc-icon-styles fa fa-cloud-download"></i><span data-translate="DownloadSelectedFiles">' + Common.TranslateKey('DownloadSelectedFiles') + '</span></a>';

        // Attach Select All Event
        var allSelected = false;
        Events.On(document.body, 'click.' + fileDownload.Name + 'SelectAllButton', '#' + fileDownload.Name + 'SelectAllButton',
            function () {
                var choices = Common.QueryAll('.gtc-input-checkbox-choice', Common.Get(fileDownload.Name));
                var choice, choiceIndex = 0, choiceLength = choices.length;
                if (allSelected == false) {
                    allSelected = true;
                    for ( ; choiceIndex < choiceLength; choiceIndex++) {
                        choice = choices[choiceIndex];
                        if (!choice.checked) {
                            Events.Trigger(choice.parentNode, 'click');
                        }
                    }
                    Common.Query('.gtc-filedownload-selectallbutton', this).textContent = Common.TranslateKey('UnselectAll');
                }
                else {
                    allSelected = false;
                    for ( ; choiceIndex < choiceLength; choiceIndex++) {
                        choice = choices[choiceIndex];
                        if (choice.checked) {
                            Events.Trigger(choice.parentNode, 'click');
                        }
                    }
                    Common.Query('.gtc-filedownload-selectallbutton', this).textContent = Common.TranslateKey('SelectAll');
                }
            }
        );

        // Attach Download Selected Files Event
        Events.On(document.body, 'click.' + fileDownload.Name + 'DownloadSelectedFilesButton', '#' + fileDownload.Name + 'DownloadSelectedFilesButton',
            function () {
                var choices = Common.QueryAll('.gtc-input-checkbox-choice', Common.Get(fileDownload.Name));
                var choice, choiceIndex = 0, choiceLength = choices.length;
                for ( ; choiceIndex < choiceLength; choiceIndex++) {
                    choice = choices[choiceIndex];
                    if (choice.checked) {
                        // jQuery event triggering will not work here. Must simulate a native browser event
                        var downloadLink = choice.parentNode.nextSibling;
                        var createdEvent = document.createEvent('MouseEvents');
                        createdEvent.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, downloadLink);
                        downloadLink.dispatchEvent(createdEvent);
                    }
                }
            }
        );

        // Div</>
        fileDownloadMarkup += '</div>';
        return fileDownloadMarkup;

    };

} (window.FileDownload = window.FileDownload || {}, window, document, Common, Cache, Events, Velocity));
