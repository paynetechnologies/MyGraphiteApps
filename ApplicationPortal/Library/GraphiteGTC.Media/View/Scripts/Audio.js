// Audio
// Based On: Audio -> ViewElement
(function (AudioElement, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Variables
    AudioElement.MIMESupport = [
        {
            Type: 'mp3',
            MIME: 'audio/mpeg3'
        },
        {
            Type: 'wav',
            MIME: 'audio/wav'
        },
        {
            Type: 'oga',
            MIME: 'audio/ogg'
        }
    ];

    // Public Methods
    AudioElement.Render = function (audio) {

        // Div<, Class@, Id@>
        var audioMarkup = '<div data-namespace="AudioElement" class="gtc-audio"' + ViewElement.RenderAttributes(audio) + '>';

        // Audio<>, Source<>
        audioMarkup += '<audio controls';
        if (audio.AutoPlay == 'Yes') {
            audioMarkup += ' autoplay';
        }
        audioMarkup += '>';
        if (Common.IsDefined(audio.Source)) {
            // Bug in chrome stops data uri from working after its cached first time. Convert to blob and create URL workaround.
            var blob = Common.Base64ToBlob(audio.Source, 'audio/' + audio.AudioType);
            var fileUrl = URL.createObjectURL(blob);
            audioMarkup += '<source src="' + fileUrl + '">';
        }
        audioMarkup += '</audio>';

        // Div</>
        audioMarkup += '</div>';

        // Return
        return audioMarkup;

    };

    AudioElement.ReplaceElement = function (audio, viewElements, promises, context) {

        var audioTag = Common.Query('audio', audio);
        var sourceTag = Common.Query('source', audioTag);
        if (Common.IsNotDefined(viewElements[0].Source) || Common.IsEmptyString(viewElements[0].Source)) {
            audioTag.pause();
            if (Common.IsDefined(sourceTag)) {
                sourceTag.src = '';
            }
        }
        else {
            // Bug in chrome stops data uri from working after its cached first time. Convert to blob and create URL workaround.
            var blob = Common.Base64ToBlob(viewElements[0].Source, 'audio/' + viewElements[0].AudioType);
            var fileUrl = URL.createObjectURL(blob);
            if (Common.IsNotDefined(sourceTag)) {
                var audioMarkup = '<source src="' + fileUrl + '">';
                Common.InsertHTMLString(audioTag, Common.InsertType.Append, audioMarkup);
            }
            else {
                sourceTag.src = fileUrl;
                audioTag.load();
            }
        }

    };

} (window.AudioElement = window.AudioElement || {}, window, document, Common, Cache, Events, Velocity));
