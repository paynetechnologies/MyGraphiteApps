// Field Set
// Based On: FieldSet -> ViewElement
(function (FieldSet, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    FieldSet.Render = function (fieldSet, fromAccordionForm) {

        // Form<, TabIndex@, Class@, Id@, Form>
        var additionalClass = '';
        if (Common.IsDefined(fieldSet.FieldSetType)) {
            additionalClass += ' gtc-fieldset-' + fieldSet.FieldSetType.toLowerCase();
        }
        var fieldSetMarkup = '<fieldset data-namespace="FieldSet" class="gtc-fieldset' + additionalClass + '"' + ViewElement.RenderAttributes(fieldSet) + '>';

        // Legend<>, Title, Legend</>
        if (Common.IsDefined(fieldSet.Title)) {
            fieldSetMarkup += '<legend id="' + fieldSet.Name + 'Legend" class="gtc-legend gtc-page-theme-color" data-translate="' + fieldSet.Title + '">' + Common.TranslateKey(fieldSet.Title) + '</legend>';
        }

        // Render Fields
        if (Common.IsDefined(fieldSet.Fields)) {

            // Ol<>
            fieldSetMarkup += '<ol class="gtc-fieldset-ol"';

            // Expandable?
            if (fromAccordionForm) {
                fieldSetMarkup += ' aria-expanded="false"';
            }
            fieldSetMarkup += '>';

            // Fields
            var field, index = 0, length = fieldSet.Fields.length;
            for ( ; index < length; index++) {
                field = fieldSet.Fields[index];

                // Li<>
                fieldSetMarkup += '<li class="gtc-field">';

                // Field
                var fieldNamespace = window[field.Type];
                ViewElement.TestExists(field.Type, fieldNamespace);
                fieldSetMarkup += fieldNamespace.Render(field);

                // Li</>
                fieldSetMarkup += '</li>';
            }

            // Ol</>
            fieldSetMarkup += '</ol>';
        }

        // Form</>
        fieldSetMarkup += '</fieldset>';

        // Return markup
        return fieldSetMarkup;

    };

    FieldSet.UpdateTitle = function (fieldSet, updatedTitle, promises, context) {

        // Get deferred object for animation
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);


        // Initialize
        var onParent = context == 'Parent';
        var title = Common.Get(fieldSet.id + 'Legend', onParent);
        var updateTitleFunction = function () {
            title.textContent = Common.TranslateKey(updatedTitle);
            Common.SetAttr(title, 'data-translate', updatedTitle);
        };
        if (Common.IsHidden(fieldSet)) {
            updateTitleFunction();
            animationPromise.resolve();
        }
        else {
            // Animate
            Velocity(title, { 'opacity': 0 }, 'slow',
                function () {
                    updateTitleFunction();
                    Velocity(title, 'reverse',
                        function () {
                            Common.RemoveOpacity(title);
                            animationPromise.resolve();
                        }
                    );
                }
            );
        }

    };

    FieldSet.PostInstructionConfiguration = function (fieldSet) {

        var noteFields = Common.QueryAll('.gtc-input-notefield', fieldSet);
        if (noteFields.length > 0) {
            var index = 0, length = noteFields.length;
            for ( ; index < length; index++) {
                Events.Trigger(document.body, 'reconfiguretextarea-' + noteFields[index].id);
            }
        }

    };

} (window.FieldSet = window.FieldSet || {}, window, document, Common, Cache, Events, Velocity));
