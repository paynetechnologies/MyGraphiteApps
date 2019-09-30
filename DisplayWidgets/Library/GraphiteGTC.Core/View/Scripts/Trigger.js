// Trigger
// Based On: Trigger -> Link -> ViewElement
(function (Trigger, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    Trigger.Render = function (trigger) {

        // Anchor<, TabIndex@, Class@, Id@, Anchor>
        var className = Link.RenderClassing(trigger, 'link');

        var triggerMarkup = '<a class="' + className + '" data-namespace="Trigger"' + ViewElement.RenderAttributes(trigger);

        // Tooltip
        if (Common.IsDefined(trigger.Tooltip)) {
            triggerMarkup += ' data-translate="[data-tooltip]' + trigger.Tooltip + '"';
            triggerMarkup += ' data-tooltip="' + Common.TranslateKey(trigger.Tooltip) + '"';
        }

        // Anchor</>
        triggerMarkup += '>';

        // Icon
        if (Common.IsDefined(trigger.Icon)) {
            triggerMarkup += Icon.Render(trigger.Icon, false);
        }

        // Title
        if (Common.IsDefined(trigger.Title)) {
            triggerMarkup += '<span data-translate="' + trigger.Title + '">' + Common.TranslateKey(trigger.Title) + '</span>';
        }

        // Wire trigger on click
        if (Common.IsNotDefined(trigger.Name) || trigger.Name.length <= 0) {
            if (Common.IsDefined(window.console)) {
                console.log('Warning[Trigger - ' + trigger.Title + ']: Must provide the Name attribute to wire an action');
            }
        }
        else {
            if (Common.IsNotDefined(trigger.ElementName) || trigger.ElementName.length <= 0) {
                if (Common.IsDefined(window.console)) {
                    console.log('Warning[Trigger - ' + trigger.Name + ']: Must provide the ElementName attribute to wire an action');
                }
            }
            else {
                // Wire
                Events.On(document.body, 'click.' + trigger.Name, '#' + trigger.Name,
                    function (event) {
                        Events.Trigger(Common.Get(trigger.ElementName), trigger.TriggerEvent);
                    }
                );
            }
        }

        // Anchor</>
        triggerMarkup += '</a>';
        return triggerMarkup;

    };

} (window.Trigger = window.Trigger || {}, window, document, Common, Cache, Events, Velocity));
