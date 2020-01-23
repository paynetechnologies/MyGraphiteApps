// Selectable Button
// Based On: SelectableButton -> Button -> Link -> ViewElement
(function (SelectableButton, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    SelectableButton.Render = function (selectableButton) {

        // var className = '';
        var className = Link.RenderClassing(selectableButton, 'btn');

        // Anchor<, TabIndex@, Class@, Id@, Data-ControllerPath/ActionName@
        var selectableButtonMarkup = '<a role="button" class="' + className + '" data-namespace="SelectableButton" data-configure="Pre"' + ViewElement.RenderAttributes(selectableButton) + EventElement.AttachEvent(selectableButton.Name, 'click', selectableButton.OnClick, SelectableButton.OnClick);

        // Attach Key press event
        if (Common.IsDefined(selectableButton.AttachedKey)) {
            GTC.AttachKey(selectableButton.Name, selectableButton.AttachedKey);
        }

        // Data-ButtonGroup@
        if (Common.IsDefined(selectableButton.GroupName)) {
            selectableButtonMarkup += ' data-buttongroup="' + selectableButton.GroupName + '"';
        }

        // Data-ButtonIndex@
        if (Common.IsDefined(selectableButton.Index)) {
            selectableButtonMarkup += ' data-buttonindex="' + selectableButton.Index + '"';
        }

        // Data-Selected@
        if (selectableButton.IsSelected == 'Yes') {
            selectableButtonMarkup += ' aria-selected="true" data-selected="true"';
        }
        else {
            selectableButtonMarkup += ' aria-selected="false" data-selected="false"';
        }

        // Tooltip
        if (Common.IsDefined(selectableButton.Tooltip)) {
            selectableButtonMarkup += ' data-translate="[data-tooltip]' + selectableButton.Tooltip + '"';
            selectableButtonMarkup += ' data-tooltip="' + Common.TranslateKey(selectableButton.Tooltip) + '"';
        }

        // Anchor>
        selectableButtonMarkup += '>';

        // Icon
        if (Common.IsDefined(selectableButton.Icon)) {
            selectableButtonMarkup += Icon.Render(selectableButton.Icon, false);
        }

        // Link text
        selectableButtonMarkup += '<span';

        // Translations
        if (Common.IsDefined(selectableButton.Title)) {
            selectableButtonMarkup += ' data-translate="' + selectableButton.Title + '"';
        }

        // Link text
        selectableButtonMarkup += '>' + Common.TranslateKey(selectableButton.Title) + '</span>';

        // 508 Compliance - Focus In/Focus Out
        Events.On(document.body, 'focusin.' + selectableButton.Name, '#' + selectableButton.Name,
            function (event) {
                Events.On(document, 'keyup.' + selectableButton.Name,
                    function (keyupEvent) {
                        var pressedKeyCode = (keyupEvent.keyCode ? keyupEvent.keyCode : keyupEvent.which);
                        if (pressedKeyCode == GTC.Keyboard.Enter) {
                            var element = Common.Get(selectableButton.Name);
                            Events.Trigger(element, 'mouseup');
                            Events.Trigger(element, 'click');
                        }
                    }
                );
            }
        );
        Events.On(document.body, 'focusout.' + selectableButton.Name, '#' + selectableButton.Name,
            function (event) {
                Events.Off(document, 'keyup.' + selectableButton.Name);
            }
        );

        // Anchor</>
        selectableButtonMarkup += '</a>';
        return selectableButtonMarkup;

    };

    SelectableButton.Configure = function (button, configureStage) {

        Widgets.uibutton(button, { Type: 'Selectable' });

    };

    SelectableButton.OnClick = function (event) {

        // Current SelectedButton
        var oldSelectedButton = Common.Query('.gtc-btn-selectablebutton[data-selected=true]');
        SetSelectedAttributes(oldSelectedButton, this);

        // OnClick Parameters
        var onClickParameters = [
            {
                Name: 'SelectedButton',
                Value: this.id,
                UiParameters: null
            },
            {
                Name: 'FromIndex',
                Value: Common.GetAttr(oldSelectedButton, 'data-buttonindex'),
                UiParameters: null
            },
            {
                Name: 'ToIndex',
                Value: Common.GetAttr(this, 'data-buttonindex'),
                UiParameters: null
            }
        ];

        // Get Click Event
        var onClickEvent = JSON.parse(Common.GetAttr(this, 'data-click'));
        if (Common.IsDefined(onClickEvent.UiParameters)) {
            onClickParameters = onClickParameters.concat(onClickEvent.UiParameters);
        }

        // Execute View Behavior
        Common.ExecuteViewBehavior(onClickEvent.ControllerPath + onClickEvent.ActionName, onClickParameters, Page.RunInstructions, this);

    };

    SelectableButton.UpdateSelected = function (button) {

        Events.Trigger(button, 'mouseup');
        if (Common.HasAttr(button, 'data-click')) {
            Events.Trigger(button, 'click');
        }
        else {
            var oldSelectedButton = Common.Query('.gtc-btn-selectablebutton[data-selected=true]');
            SetSelectedAttributes(oldSelectedButton, button);
        }

    };

    SelectableButton.ShowPinwheel = function (button) {

        SpinKit.Show(button, 'FadingCircle');

    };

    SelectableButton.HidePinwheel = function (button) {

        SpinKit.Hide(button);

    };

    // Private Methods
    function SetSelectedAttributes (oldSelectedButton, newSelectedButton) {

        Common.SetAttr(oldSelectedButton, 'data-selected', 'false');
        Common.SetAttr(oldSelectedButton, 'aria-selected', 'false');
        Common.SetAttr(newSelectedButton, 'data-selected', 'true');
        Common.SetAttr(newSelectedButton, 'aria-selected', 'true');

    };

} (window.SelectableButton = window.SelectableButton || {}, window, document, Common, Cache, Events, Velocity));
