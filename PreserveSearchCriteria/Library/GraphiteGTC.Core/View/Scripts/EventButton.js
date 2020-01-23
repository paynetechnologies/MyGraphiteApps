/** 
 * @class EventButton
 * @classdesc Supports the EventButton View Element<br>
 *            Based On: ViewElement > Link > Button
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (EventButton, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function EventButton.Render
     * @param {object} button - The EventButton View Element in JSON format
     * @description Generates the HTML markup for the EventButton View Element 
     * @returns {string} HTML Markup of the EventButton View Element
     */
    EventButton.Render = function (eventButton) {

        // 508 Compliance
        if (Common.IsNotDefined(eventButton.Title)) {
            eventButton.Title = eventButton.Name;
            eventButton.ScreenReaderOnly = true;
        }

        // Button<, TabIndex@, Class@, Id@, Data-ControllerPath/ActionName@, Wire OnClick!
        var className = Link.RenderClassing(eventButton, 'btn');
        var eventButtonMarkup = '<button class="' + className + '" data-namespace="EventButton"' + ViewElement.RenderAttributes(eventButton) + EventElement.AttachEvent(eventButton.Name, 'click', eventButton.OnClick, EventButton.OnClick);

        // Group Name
        if (Common.IsDefined(eventButton.GroupName)) {
            eventButtonMarkup += ' data-groupname="' + eventButton.GroupName + '"';
        }

        // Translations, Tooltip, 508 Compliance, Confirmation
        eventButtonMarkup += Button.RenderAttributes(eventButton);

        // Button>
        eventButtonMarkup += ' type="button">';

        // Icon
        if (Common.IsDefined(eventButton.Icon)) {
            eventButtonMarkup += Icon.Render(eventButton.Icon, false);
        }

        // Attach Key
        if (Common.IsDefined(eventButton.AttachedKey)) {
            GTC.AttachKey(eventButton.Name, eventButton.AttachedKey);
        }

        // Link Text
        eventButtonMarkup += Link.RenderTitle(eventButton, 'button');

        // Button</>
        eventButtonMarkup += '</button>';
        return eventButtonMarkup;

    };

    /**
     * @function EventButton.OnClick
     * @param {event} event - A DOM click Event
     * @description This method is called when the EventButton is clicked and subsequently calls Button.CompleteConfirmation
     */
    EventButton.OnClick = function (event) {

        // Initialize
        event.preventDefault();
        event.stopPropagation();
        var onClickParameters = [
            {
                Name: 'OverriddenValidations',
                Value: null,
                UiParameters: Validation.SerializeArray(false)
            }
        ];

        // Call OnClick
        Button.CompleteConfirmation(this, onClickParameters);

    };

    /**
     * @function EventButton.UpdateTitle
     * @param {object} eventButton - The EventButton DOM element
     * @param {string} newTitle - The new Title of the Button
     * @param {object[]} promises - An array of promises that is used to know when all Page Instructions are completed
     * @param {string} context - Current or Parent View
     * @description Updates the Title of the EventButton
     */
    EventButton.UpdateTitle = function (eventButton, newTitle, promises, context) {

        Link.UpdateTitle(eventButton, newTitle, promises, context);

    };

    /**
     * @function EventButton.ShowPinwheel
     * @param {object} eventButton - The EventButton DOM element
     * @description Shows Pinwheel on the View Element
     */
    EventButton.ShowPinwheel = function (eventButton) {

        SpinKit.Show(eventButton, 'FadingCircle');

    };

    /**
     * @function EventButton.HidePinwheel
     * @param {object} eventButton - The EventButton DOM element
     * @description Hides Pinwheel on the View Element
     */
    EventButton.HidePinwheel = function (eventButton) {

        SpinKit.Hide(eventButton);

    };

} (window.EventButton = window.EventButton || {}, window, document, Common, Cache, Events, Velocity));
