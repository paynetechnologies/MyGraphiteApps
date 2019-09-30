// Video
// Based On: Video -> ViewElement
(function (Video, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Variables
    Video.Status = {
        NotSet: 0,
        Missing: 1,
        Exists: 2
    };

    Video.Type = {
        Mobile: 'Mobile.',
        Tablet: 'Tablet.',
        HD: 'HD.'
    };

    Video.MIMESupport = [
        {
            Type: 'mp4',
            MIME: 'video/mp4'
        },
        {
            Type: 'webm',
            MIME: 'video/webm'
        },
        {
            Type: 'ogv',
            MIME: 'video/ogg'
        }
    ];

    // Public Methods
    Video.Render = function (video) {

        // Save video id
        var videoId = video.Name + 'Container';

        // Div<, Class@, Id@>
        var videoMarkup = '<div data-namespace="Video" class="gtc-video"' + ViewElement.RenderAttributes(video) + '>';

        // H1<, Class@, />
        if (Common.IsDefined(video.Title)) {
            videoMarkup += '<h1 class="gtc-video-title" data-translate="' + video.Title + '">' + Common.TranslateKey(video.Title) + '</h1>';
        }

        // P<, Class@, />
        if (Common.IsDefined(video.Subtitle)) {
            videoMarkup += '<p class="gtc-video-subtitle" data-translate="' + video.Subtitle + '">' + Common.TranslateKey(video.Subtitle) + '</p>';
        }

        // Video<>
        videoMarkup += '<video id="' + videoId + '"';

        // Height@, Width@
        var hasDimensions = Common.IsDefined(video.Dimension);
        if (hasDimensions || window.parent.Common.CheckMedia('Tablet')) {
            // iOS video height bug
            var iSkip = false;
            var iPad = navigator.userAgent.match(/iPad/i);
            if (Common.CheckMedia('Tablet') && iPad) {
                videoMarkup += ' height="580px"';
                iSkip = true;
            }

            // Set Height/Width
            if (hasDimensions) {
                var dimensionStyle = StyleHelper.BuildDimensionStyle(video.Dimension);
                if (Common.IsDefined(dimensionStyle.Height) && !iSkip) {
                    videoMarkup += ' height="' + dimensionStyle.Height.replace(';', '') + '"';
                }
                if (Common.IsDefined(dimensionStyle.Width)) {
                    videoMarkup += ' width="' + dimensionStyle.Width.replace(';', '') + '"';
                }
            }
        }
        videoMarkup += ' controls';
        if (video.AutoPlay == 'Yes') {
            videoMarkup += ' autoplay';
        }
        videoMarkup += '>';

        // Src@
        if (Common.IsDefined(video.Source)) {
            if (Common.IsDefined(video.Base64Type)) {
                // Bug in chrome stops data uri from working after its cached first time. Convert to blob and create URL workaround.
                var blob = Common.Base64ToBlob(video.Source, 'video/' + video.Base64Type);
                var fileUrl = URL.createObjectURL(blob);
                videoMarkup += '<source src="' + fileUrl + '">';
            }
            else {
                var videoSource = Common.BuildResourcePath(video.Source);
                var videoSourceCache = videoSource;
                var videoSourceArray = videoSource.split('/');
                var videoFullName = videoSourceArray[videoSourceArray.length - 1];
                var videoFullNameArray = videoFullName.split('.');
                var videoName = videoFullNameArray[0];
                var videoExtension = videoFullNameArray[1];

                // Add supported video and existing files
                var index = 0, length = Video.MIMESupport.length;
                for ( ; index < length; index++) {
                    var currentType = Video.MIMESupport[index];
                    if (isVideoTypeSupported(currentType)) {
                        if (video.IsMobileAware == 'Yes') {
                            // Sanity Check
                            if (Common.CheckMedia('Mobile')) {
                                videoSourceArray[videoSourceArray.length - 1] = Video.Type.Mobile + videoName + '.' + currentType.Type;
                            }
                            else if (Common.CheckMedia('Tablet')) {
                                videoSourceArray[videoSourceArray.length - 1] = Video.Type.Tablet + videoName + '.' + currentType.Type;
                            }
                            else if (Common.CheckMedia('Desktop') || Common.CheckMedia('HighResolution')) {
                                videoSourceArray[videoSourceArray.length - 1] = Video.Type.HD + videoName + '.' + currentType.Type;
                            }
                            else {
                                videoSourceArray[videoSourceArray.length - 1] = videoName + '.' + currentType.Type;
                            }
                            videoSource = videoSourceArray.join('/');
                        }
                        if (doesVideoFileExist(videoSource) == Video.Status.Exists) {
                            videoMarkup += '<source src="' + videoSource + '" type="video/' + currentType.Type + '">';
                        }
                        else {
                            // Check base file fallback
                            videoSourceArray[videoSourceArray.length - 1] = videoName + '.' + currentType.Type;
                            videoSource = videoSourceArray.join('/');
                            if (doesVideoFileExist(videoSource) == Video.Status.Exists) {
                                videoMarkup += '<source src="' + videoSource + '" type="video/' + currentType.Type + '">';
                            }
                            else {
                                // Just default back to original in worst case
                                videoMarkup += '<source src="' + videoSource + '" type="video/' + currentType.Type + '">';
                            }
                        }
                    }
                }
            }
        }

        // Video</>
        videoMarkup += '</video>';

        // P<, Class@, />
        if (Common.IsDefined(video.AdditionalInformation)) {
            videoMarkup += '<p class="gtc-video-additionalinformation" data-translate="' + video.AdditionalInformation + '">' + Common.TranslateKey(video.AdditionalInformation) + '</p>';
        }

        // Div</>
        videoMarkup += '</div>';

        // Allow clicking of video to play and pause and not just controls
        Events.On(document.body, 'click.' + videoId, '#' + videoId,
            function () {
                if (Common.HasClass(this, 'playing')) {
                    this.pause();
                    Common.RemoveClass(this, 'playing');
                }
                else {
                    this.play();
                    Common.AddClass(this, 'playing');
                }
            }
        );

        // Attach play\pause\ended events
        // Attach using addEventListener since Events namespace can't delegate odd events like this, need useCapture to be true.
        document.addEventListener('play',
            function () {
                var videoElement = Common.Get(videoId);
                Common.AddClass(videoElement, 'playing');
                if (!window.parent.Common.CheckMedia('Mobile')) {
                    var videContainer = Common.Closest('.gtc-video', videoElement);
                    var videoInfoElements = Common.QueryAll('.gtc-video-title, .gtc-video-subtitle, .gtc-video-additionalinformation', videContainer);
                    Velocity(videoInfoElements, 'fadeOut', 'slow');
                    Velocity(videoElement, { 'opacity': '1' }, 500);
                }
            }, true
        );
        var onPauseEnded = function () {
            var videoElement = Common.Get(videoId);
            Common.RemoveClass(videoElement, 'playing');
            if (!window.parent.Common.CheckMedia('Mobile')) {
                var videContainer = Common.Closest('.gtc-video', videoElement);
                var videoInfoElements = Common.QueryAll('.gtc-video-title, .gtc-video-subtitle, .gtc-video-additionalinformation', videContainer);
                Velocity(videoInfoElements, 'fadeIn', 'slow');
                Velocity(videoElement, { 'opacity': '.5' }, 500);
            }
        };
        document.addEventListener('pause', onPauseEnded, true);
        document.addEventListener('ended', onPauseEnded, true);

        // Return
        return videoMarkup;

    };

    Video.ReplaceElement = function (video, viewElements, promises, context) {

        var videoTag = Common.Query('video', video);
        var sourceTag = Common.Query('source', videoTag);
        if (Common.IsNotDefined(viewElements[0].Source) || Common.IsEmptyString(viewElements[0].Source)) {
            videoTag.pause();
            if (Common.IsDefined(sourceTag)) {
                sourceTag.src = '';
            }
        }
        else {
            // Bug in chrome stops data uri from working after its cached first time. Convert to blob and create URL workaround.
            var blob = Common.Base64ToBlob(viewElements[0].Source, 'video/' + viewElements[0].Base64Type);
            var fileUrl = URL.createObjectURL(blob);
            if (Common.IsNotDefined(sourceTag)) {
                var videoMarkup = '<source src="' + fileUrl + '">';
                Common.InsertHTMLString(videoTag, Common.InsertType.Append, videoMarkup);
            }
            else {
                sourceTag.src = fileUrl;
                videoTag.load();
            }
        }

    };

    // Private Methods
    function isVideoTypeSupported (currentType) {

        var video = document.createElement('video');
        if (!Common.IsFunction(video.canPlayType)) {
            return false;
        }
        if (Common.IsNotEmptyString(video.canPlayType(currentType.MIME))) {
            return true;
        }

    };

    function doesVideoFileExist (videoSource) {

        var videoStatus = Video.Status.NotSet;
        var requestObject = new XMLHttpRequest();
        requestObject.open('HEAD', videoSource, false);
        requestObject.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                videoStatus = Video.Status.Exists;
            }
            else {
                videoStatus = Video.Status.Missing;
            }
        };
        requestObject.onerror = function () {
            videoStatus = Video.Status.Missing;
        };
        requestObject.send();
        return videoStatus;

    };

} (window.Video = window.Video || {}, window, document, Common, Cache, Events, Velocity));
