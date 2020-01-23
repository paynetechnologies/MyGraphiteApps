// Note Field
// Based On: NoteField -> PlaceholderField -> ValueField -> Field -> ViewElement
(function (NoteField, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    NoteField.Render = function (noteField) {

        // Label Exists (needed for Icon rendering)
        var labelExists = true;
        if (Common.IsNotDefined(noteField.Label)) {
            labelExists = false;
        }

        // Label
        if (Common.IsDefined(noteField.Label)) {
            noteField.Label.ExtraClassing = 'gtc-label-notefield';
        }
        var noteFieldMarkup = Field.RenderLabel(noteField);

        // Textarea<, Placeholder@, Name@, @Data-Serializable, TabIndex@, Class@, Id@, Data-Disabled@
        noteFieldMarkup += '<textarea class="gtc-input-notefield';
        if (Common.IsDefined(noteField.Icon)) {
            if (labelExists == false) {
                noteFieldMarkup += ' gtc-input__icon-left';
            }
            else {
                noteFieldMarkup += ' gtc-input__icon-label-left';
            }
        }
        noteFieldMarkup += '"' + PlaceholderField.RenderAttributes(noteField) + Field.RenderAttributes(noteField);

        // Data-HasChanged@ Event
        if (noteField.IsSerializable == 'Yes') {
            Events.On(document.body, 'change.fieldvaluechange.' + noteField.Name, '#' + noteField.Name,
                function () {
                    Common.SetAttr(this, 'data-haschanged', 'Yes');
                }
            );
        }

        // 508 Compliance
        if (noteField.IsRequired == 'Yes') {
            noteFieldMarkup += ' aria-required="true"';
        }

        // Data-ControllerPath/ActionName@, Wire OnChange!
        if (Common.IsEventViewElementDefined(noteField.OnChange)) {
            noteFieldMarkup += Field.AttachOnChange(noteField, NoteField.OnChange);
        }

        // Rows@
        if (Common.IsDefined(noteField.Rows)) {
            noteFieldMarkup += ' rows="' + noteField.Rows + '"';
        }

        // Columns@
        if (Common.IsDefined(noteField.Columns)) {
            noteFieldMarkup += ' cols="' + noteField.Columns + '"';
        }

        // MaxLength@
        if (Common.IsDefined(noteField.MaxLength)) {
            noteFieldMarkup += ' maxlength="' + noteField.MaxLength + '"';
        }

        // IsResizable@
        noteFieldMarkup += ' style="resize:';
        if (noteField.IsResizable == 'Yes') {
            noteFieldMarkup += 'vertical';

            // Setup resizing
            var onResizeEndFunction = function () {
                Common.ResizeView();
            };

            // TODO: Rewrite to support IE which does not allow textarea resizing.
            Events.On(document.body, 'configuretextarea', '#' + noteField.Name,
                function () {
                    var textArea = Common.Get(noteField.Name);
                    var initialHeight = null;

                    // Wait for modal to show before calculating height
                    // Firefox is why we cant have nice things!
                    if (Common.IsModal()) {
                        Events.On(top.document, 'modalvisible',
                            function (event) {
                                initialHeight = Common.Height(textArea);
                            }
                        );
                    }
                    else {
                        initialHeight = Common.Height(textArea);
                    }
                    Events.On(document, 'mouseup.textareaheightchange-' + noteField.Name + '.' + noteField.Name,
                        function () {
                            var newHeight = Common.Height(textArea);
                            if (newHeight != initialHeight) {
                                initialHeight = newHeight;
                                onResizeEndFunction();
                            }
                        }
                    );

                    // Handle reinitializing resizing on show
                    Events.On(document.body, 'reconfiguretextarea-' + noteField.Name + '.' + noteField.Name,
                        function () {
                            var textArea = Common.Get(noteField.Name);
                            initialHeight = Common.Height(textArea);
                            onResizeEndFunction();
                        }
                    );
                }
            );
        }
        else {
            noteFieldMarkup += 'none';
        }
        noteFieldMarkup += ';"';

        // @Data-NameSpace
        noteFieldMarkup += ' data-namespace="NoteField" data-configure="Pre">';

        // Value
        if (Common.IsDefined(noteField.Value)) {
            noteFieldMarkup += noteField.Value;
        }

        // Textarea</>
        noteFieldMarkup += '</textarea>';

        // Icon
        if (Common.IsDefined(noteField.Icon)) {
            noteFieldMarkup += Icon.Render(noteField.Icon, true, labelExists);
        }
        return noteFieldMarkup;

    };

    NoteField.Configure = function (field, configureStage) {

        Widgets.textbox(field);
        Events.Trigger(field, 'configuretextarea');

    };

    NoteField.OnChange = function (event) {

        // Remove Prefix_
        var fieldParameterName = Common.RemovePrefix(this.name);

        // Field Value
        var fieldValueUiParameter = [
            {
                Name: fieldParameterName,
                Value:  this.value,
                UiParameters: null
            }
        ];

        // Call OnChange
        Field.OnChange(this, fieldValueUiParameter);

    };

    NoteField.HasValue = function (noteField) {

        return ValueField.HasValue(noteField);

    };

    NoteField.IsCompleted = function (field) {

        return ValueField.IsCompleted(field);

    };

    NoteField.UpdateValue = function (field, fieldValue) {

        ValueField.UpdateValue(field, fieldValue);

    };

    NoteField.UpdateLabel = function (field, fieldLabel, promises, context) {

        Field.UpdateLabel(field, fieldLabel, promises, context);

    };

    NoteField.PostInstructionConfiguration = function (noteField) {

        Events.Trigger(document.body, 'reconfiguretextarea-' + noteField.id);

    };

    NoteField.ShowPinwheel = function (field) {

        Field.ShowPinwheel(field, 'FadingCircle');

    };

    NoteField.HidePinwheel = function (field) {

        Field.HidePinwheel(field);

    };

} (window.NoteField = window.NoteField || {}, window, document, Common, Cache, Events, Velocity));
