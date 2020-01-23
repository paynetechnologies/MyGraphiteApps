/** 
 * @class EventDisplayDetail
 * @classdesc Supports the EventDisplayDetail View Element<br>
 *            Based On: ViewElement > DisplayDetail
 * @category Core
 * @copyright Graphite GTC, LLC.
 * @author Graphite GTC, LLC. (info@graphitegtc.com)
 * @hideconstructor
 */
(function (EventDisplayDetail, window, document, Common, Cache, Events, Velocity, undefined) {

    /**
     * @function EventDisplayDetail.Render
     * @param {object} eventDisplayDetail - The EventDisplayDetail View Element in JSON format
     * @description Generates the HTML markup for the EventDisplayDetail View Element 
     * @returns {string} HTML Markup of the EventDisplayDetail View Element
     * @listens click (id = 'Anchor<var>EventId</var>Results)
     * @listens click (id = <var>eventDisplayDetailName</var>)
     * @listens focucin (id = <var>eventDisplayDetailName</var>)
     * @listens focusout (id = <var>eventDisplayDetailName</var>)
     */
    EventDisplayDetail.Render = function (eventDisplayDetail, canProperties) {

        // Initialize canProperties if no event panel was used
        if (Common.IsNotDefined(canProperties)) {
            canProperties = {
                CanDelete: 'No',
                CanUndo: 'No',
                CanRecycle: 'No',
                CanEdit: 'No',
                CanProcess: 'No',
                CanViewResults: 'No'
            };
        }

        // Div@, TabIndex@, Class@, Id@, Div>
        var eventDisplayDetailMarkup = '<div data-namespace="EventDisplayDetail" class="gtc-eventdisplaydetail gtc-eventdisplaydetail-expands gtc-columns-' + eventDisplayDetail.DisplayItemsPerLine;
        eventDisplayDetailMarkup += ' gtc-eventdisplaydetail-highlightable"';

        // On Complete?
        if (Common.IsEventViewElementDefined(eventDisplayDetail.OnComplete)) {
            eventDisplayDetailMarkup += ' data-complete=\'' + JSON.stringify(eventDisplayDetail.OnComplete) + '\'';
        }

        // OnDelete?
        if (Common.IsEventViewElementDefined(eventDisplayDetail.OnDelete)) {
            eventDisplayDetailMarkup += ' data-delete=\'' + JSON.stringify(eventDisplayDetail.OnDelete) + '\'';
        }

        // OnProcess?
        if (Common.IsEventViewElementDefined(eventDisplayDetail.OnProcess)) {
            eventDisplayDetailMarkup += ' data-process=\'' + JSON.stringify(eventDisplayDetail.OnProcess) + '\'';
        }

        // OnRecycle?
        if (Common.IsEventViewElementDefined(eventDisplayDetail.OnRecycle)) {
            eventDisplayDetailMarkup += ' data-recycle=\'' + JSON.stringify(eventDisplayDetail.OnRecycle) + '\'';
        }

        // OnSaveValidations?
        if (Common.IsEventViewElementDefined(eventDisplayDetail.OnSaveValidations)) {
            eventDisplayDetailMarkup += ' data-savevalidations=\'' + JSON.stringify(eventDisplayDetail.OnSaveValidations) + '\'';
        }

        // OnShowValidations?
        if (Common.IsEventViewElementDefined(eventDisplayDetail.OnShowValidations)) {
            eventDisplayDetailMarkup += ' data-showvalidations=\'' + JSON.stringify(eventDisplayDetail.OnShowValidations) + '\'';
        }

        // OnUndo?
        if (Common.IsEventViewElementDefined(eventDisplayDetail.OnUndo)) {
            eventDisplayDetailMarkup += ' data-undo=\'' + JSON.stringify(eventDisplayDetail.OnUndo) + '\'';
        }

        // Initialize empty EventDetail (Design Mode)
        if (Common.IsNotDefined(eventDisplayDetail.UiEventDetail)) {
            eventDisplayDetail.UiEventDetail = {
                EffectiveDate: 'MM/DD/YYYY',
                TransactionName: 'Transaction Name',
                IsComplete: 'Status',
                DateProcessed: 'MM/DD/YYYY',
                AddedByUser: 'User',
                ExecutedByUser: 'User',
                SchedulingEventName: 'Transaction Name'
            };
        }

        // Event Complete?
        eventDisplayDetailMarkup += ' data-eventcomplete="' + eventDisplayDetail.UiEventDetail.IsComplete + '"';

        // Display Items Per Line
        eventDisplayDetailMarkup += ' data-displayitemsperline="' + eventDisplayDetail.DisplayItemsPerLine + '"';

        // Event Detail Id
        eventDisplayDetailMarkup += ' data-existingeventdetail="' + eventDisplayDetail.UiEventDetail.Id + '"';

        // Id?
        var viewModelId = null;
        if (Common.IsDefined(eventDisplayDetail.Id)) {
            // View Model
            var viewModel = {
                Name: eventDisplayDetail.Name,
                Value: eventDisplayDetail.Id
            };

            // Update name to be unique
            viewModelId = Common.SanitizeToken(eventDisplayDetail.Id);
            eventDisplayDetail.Name += viewModelId;

            // Data-ViewModel@
            eventDisplayDetailMarkup += ' data-viewmodel=\'' + JSON.stringify(viewModel) + '\'';
        }
        eventDisplayDetailMarkup += ViewElement.RenderAttributes(eventDisplayDetail) + '>';

        // Sanitized EventId
        var eventId = Common.SanitizeToken(eventDisplayDetail.UiEventDetail.Id);

        // Title
        if (Common.IsDefined(eventDisplayDetail.Title)) {
            eventDisplayDetailMarkup += '<h3 id="' + eventDisplayDetail.Name + 'Title" class="gtc-page-theme-color" data-translate="' + eventDisplayDetail.Title + '">' + Common.TranslateKey(eventDisplayDetail.Title) + '</h3>';
        }

        // Div<>
        eventDisplayDetailMarkup += '<div class="gtc-eventdisplaydetail-body">';

        // Ol<>
        eventDisplayDetailMarkup += '<div class="gtc-eventdisplaydetail-content"><ol class="gtc-eventdisplaydetail-row">';

        // Event Effective Date
        eventDisplayDetailMarkup += '<li data-namespace="DisplayItem" class="gtc-eventdisplaydetail-defaults" data-mask="Date(MM/DD/YYYY)">';
        eventDisplayDetailMarkup += '<span class="gtc-displaydetail-item-head">&nbsp;</span><span class="gtc-displaydetail-item">' + Mask.Format(eventDisplayDetail.UiEventDetail.EffectiveDate, Mask.BuildMaskingOptions('Date(MM/DD/YYYY)')).Text + '</span></li>';

        // View Validations
        eventDisplayDetailMarkup += '<li data-namespace="DisplayItem" class="gtc-eventdisplaydetail-defaults">';
        eventDisplayDetailMarkup += '<span class="gtc-displaydetail-item-head">&nbsp;</span><span class="gtc-displaydetail-item">';
        if (eventDisplayDetail.UiEventDetail.ValidationExists == 'Yes') {
            var colorClass = ' gtc-validation-icon';
            if (eventDisplayDetail.UiEventDetail.ContainsErrors == 'Yes') {
                colorClass = ' gtc-validation-icon-error';
            }
            eventDisplayDetailMarkup += '<a class="gtc-eventdisplaydetail-eventlink gtc-event-anchor-validations gtc-tooltip gtc-link-tooltip" data-namespace="Button" id="Anchor' + eventId + 'Validation" ' + EventElement.AttachEvent('Anchor' + eventId + 'Validation', 'click', '', EventDisplayDetail.OnShowValidations, 'eventdisplaydetail-eventlink') + ' title="' + Common.TranslateKey('Validations') + '" data-tooltip="' + Common.TranslateKey('Validations') + '" data-translate="[title]Validations;[data-tooltip]Validations;"><i class="gtc-icon-styles fa fa-warning' + colorClass + '"></i><span class="gtc-sr-only" data-translate="Validations">' + Common.TranslateKey('Validations') + '</span></a>';
        }
        eventDisplayDetailMarkup += '</span></li>';

        // Event Name
        eventDisplayDetailMarkup += '<li data-namespace="DisplayItem" class="gtc-eventdisplaydetail-defaults">';
        eventDisplayDetailMarkup += '<span class="gtc-displaydetail-item-head">&nbsp;</span><span class="gtc-displaydetail-item">' + eventDisplayDetail.UiEventDetail.TransactionName + '</span></li>';

        // Event Status
        eventDisplayDetailMarkup += '<li data-namespace="DisplayItem" class="gtc-eventdisplaydetail-defaults">';
        eventDisplayDetailMarkup += '<span class="gtc-displaydetail-item-head">&nbsp;</span><span class="gtc-displaydetail-item"';
        if (eventDisplayDetail.UiEventDetail.IsReversed == 'Yes') {
            eventDisplayDetailMarkup += ' data-translate="Reversed">' + Common.TranslateKey('Reversed');
        }
        else if (eventDisplayDetail.UiEventDetail.IsComplete == 'Yes') {
            eventDisplayDetailMarkup += ' data-translate="Complete">' + Common.TranslateKey('Complete');
        }
        else if (eventDisplayDetail.UiEventDetail.IsComplete == 'No') {
            eventDisplayDetailMarkup += ' data-translate="Pending">' + Common.TranslateKey('Pending');
        }
        else {
            eventDisplayDetailMarkup += ' data-translate="Status">' + Common.TranslateKey('Status');
        }
        eventDisplayDetailMarkup += '</span></li>';

        // Event Details (and Wire click)
        eventDisplayDetailMarkup += '<li class="gtc-eventdisplaydetail-eventlinks">';
        if (canProperties.CanViewResults == 'Yes' && eventDisplayDetail.UiEventDetail.IsComplete == 'Yes' && Common.IsDefined(eventDisplayDetail.ResultModalNavigation)) {
            eventDisplayDetailMarkup += '<a data-namespace="ModalLink" class="gtc-eventdisplaydetail-eventlink gtc-event-anchor-results" id="Anchor' + eventId + 'Results" ' + Navigation.RenderAttributes(eventDisplayDetail.ResultModalNavigation) + ' data-translate="Details">' + Common.TranslateKey('Details') + '</a>';
            Events.On(document.body, 'click.eventdisplaydetail-eventlink.' + 'Anchor' + eventId + 'Results', '#Anchor' + eventId + 'Results',
                function (event) {
                    event.preventDefault();
                    Common.SetOnLoadEvent(this, true, false);
                    Modals.ShowModalDialog('EventDetailResults', Common.GetAttr(this, 'href'), 'Anchor' + eventId + 'Results');
                }
            );
        }
        eventDisplayDetailMarkup += '</li>';

        // Ol</>, Div</>
        eventDisplayDetailMarkup += '</ol></div>';

        // Add expandable section and wire slide
        eventDisplayDetailMarkup += '<div aria-expanded="false" class="gtc-eventdisplaydetail-expandable"><ol class="gtc-eventdisplaydetail-row">';

        // Extra event info
        if (Common.IsDefined(eventDisplayDetail.UiEventDetail.AddedByUser)) {
            eventDisplayDetailMarkup += '<li data-namespace="DisplayItem" class="gtc-displaydetail-column gtc-columns-1">';
            eventDisplayDetailMarkup += '<span class="gtc-displaydetail-item-head" data-translate="AddedBy">' + Common.TranslateKey('AddedBy') + '</span><span class="gtc-displaydetail-item">' + eventDisplayDetail.UiEventDetail.AddedByUser + '</span></li>';
        }
        if (eventDisplayDetail.UiEventDetail.IsScheduledByUser == 'Yes' && Common.IsDefined(eventDisplayDetail.UiEventDetail.SchedulingEventName)) {
            eventDisplayDetailMarkup += '<li data-namespace="DisplayItem" class="gtc-displaydetail-column gtc-columns-1">';
            eventDisplayDetailMarkup += '<span class="gtc-displaydetail-item-head" data-translate="ScheduledBy">' + Common.TranslateKey('ScheduledBy') + '</span><span class="gtc-displaydetail-item">' + eventDisplayDetail.UiEventDetail.SchedulingEventName + '</span></li>';
        }
        if (Common.IsDefined(eventDisplayDetail.UiEventDetail.ExecutedByUser)) {
            eventDisplayDetailMarkup += '<li data-namespace="DisplayItem" class="gtc-displaydetail-column gtc-columns-1">';
            eventDisplayDetailMarkup += '<span class="gtc-displaydetail-item-head" data-translate="ExecutedBy">' + Common.TranslateKey('ExecutedBy') + '</span><span class="gtc-displaydetail-item">' + eventDisplayDetail.UiEventDetail.ExecutedByUser + '</span></li>';
        }
        if (Common.IsDefined(eventDisplayDetail.UiEventDetail.DateProcessed)) {
            eventDisplayDetailMarkup += '<li data-namespace="DisplayItem" class="gtc-displaydetail-column gtc-columns-1" data-mask="Date(MM/DD/YYYY)">';
            eventDisplayDetailMarkup += '<span class="gtc-displaydetail-item-head" data-translate="DateProcessed">' + Common.TranslateKey('DateProcessed') + '</span><span class="gtc-displaydetail-item">' + Mask.Format(eventDisplayDetail.UiEventDetail.DateProcessed, Mask.BuildMaskingOptions('Date(MM/DD/YYYY)')).Text + '</span></li>';
        }

        // Build Display Panel Links for Delete\Undo\Recycle\Edit\Process
        eventDisplayDetailMarkup += '<li class="gtc-eventdisplaydetail-eventlinks">';
        if (canProperties.CanDelete == 'Yes' && eventDisplayDetail.UiEventDetail.IsScheduledByUser == 'Yes' && eventDisplayDetail.UiEventDetail.IsComplete == 'No') {
            eventDisplayDetailMarkup += '<a data-namespace="Button" class="gtc-eventdisplaydetail-eventlink gtc-event-anchor-delete gtc-tooltip gtc-link-tooltip" id="Anchor' + eventId + 'Delete" ' + EventElement.AttachEvent('Anchor' + eventId + 'Delete', 'click', '', EventDisplayDetail.OnDelete, 'eventdisplaydetail-eventlink') + ' title="' + Common.TranslateKey('Delete') + '" data-tooltip="' + Common.TranslateKey('Delete') + '" data-translate="[title]Delete;[data-tooltip]Delete;"><i class="gtc-icon-styles fa fa-minus"></i><span class="gtc-sr-only" data-translate="Delete">' + Common.TranslateKey('Delete') + '</span></a>';
        }
        if (canProperties.CanUndo == 'Yes' && eventDisplayDetail.UiEventDetail.IsScheduledByUser == 'Yes' && eventDisplayDetail.UiEventDetail.IsComplete == 'Yes') {
            eventDisplayDetailMarkup += '<a data-namespace="Button" class="gtc-eventdisplaydetail-eventlink gtc-event-anchor-undo gtc-tooltip gtc-link-tooltip" id="Anchor' + eventId + 'Undo" ' + EventElement.AttachEvent('Anchor' + eventId + 'Undo', 'click', '', EventDisplayDetail.OnUndo, 'eventdisplaydetail-eventlink') + ' title="' + Common.TranslateKey('Undo') + '" data-tooltip="' + Common.TranslateKey('Undo') + '" data-translate="[title]Undo;[data-tooltip]Undo;"><i class="gtc-icon-styles fa fa-undo"></i><span class="gtc-sr-only" data-translate="Undo">' + Common.TranslateKey('Undo') + '</span></a>';
        }
        if (canProperties.CanRecycle == 'Yes' && eventDisplayDetail.UiEventDetail.IsScheduledByUser == 'Yes' && eventDisplayDetail.UiEventDetail.IsComplete == 'Yes') {
            eventDisplayDetailMarkup += '<a data-namespace="Button" class="gtc-eventdisplaydetail-eventlink gtc-event-anchor-recycle gtc-tooltip gtc-link-tooltip" id="Anchor' + eventId + 'Recycle" ' + EventElement.AttachEvent('Anchor' + eventId + 'Recycle', 'click', '', EventDisplayDetail.OnRecycle, 'eventdisplaydetail-eventlink') + ' title="' + Common.TranslateKey('Recycle') + '" data-tooltip="' + Common.TranslateKey('Recycle') + '" data-translate="[title]Recycle;[data-tooltip]Recycle;"><i class="gtc-icon-styles fa fa-recycle"></i><span class="gtc-sr-only" data-translate="Recycle">' + Common.TranslateKey('Recycle') + '</span></a>';
        }
        if (canProperties.CanEdit == 'Yes' && eventDisplayDetail.UiEventDetail.IsScheduledByUser == 'Yes' && eventDisplayDetail.UiEventDetail.IsComplete == 'No' && Common.IsDefined(eventDisplayDetail.EditModalNavigation)) {
            eventDisplayDetailMarkup += '<a data-namespace="ModalLink" class="gtc-eventdisplaydetail-eventlink gtc-event-anchor-edit gtc-tooltip gtc-link-tooltip" id="Anchor' + eventId + 'Edit" ' + Navigation.RenderAttributes(eventDisplayDetail.EditModalNavigation) + '><i class="gtc-icon-styles fa fa-pencil" title="' + Common.TranslateKey('Edit') + '" data-tooltip="' + Common.TranslateKey('Edit') + '" data-translate="[title]Edit;[data-tooltip]Edit;"></i><span class="gtc-sr-only" data-translate="Edit">' + Common.TranslateKey('Edit') + '</span></a>';

            // Wire Edit Click
            Events.On(document.body, 'click.eventdisplaydetail-eventlink.' + 'Anchor' + eventId + 'Edit', '#Anchor' + eventId + 'Edit',
                function (event) {
                    event.preventDefault();
                    Common.SetOnLoadEvent(this, true, false);
                    Modals.ShowModalDialog('EventEdit', Common.GetAttr(this, 'href'), 'Anchor' + eventId + 'Edit');
                }
            );
        }
        if (canProperties.CanProcess == 'Yes' && eventDisplayDetail.UiEventDetail.IsComplete == 'No') {
            eventDisplayDetailMarkup += '<a data-namespace="Button" class="gtc-eventdisplaydetail-eventlink gtc-event-anchor-process gtc-tooltip gtc-link-tooltip" id="Anchor' + eventId + 'Process" ' + EventElement.AttachEvent('Anchor' + eventId + 'Process', 'click', '', EventDisplayDetail.OnProcess, 'eventdisplaydetail-eventlink') + ' title="' + Common.TranslateKey('Process') + '" data-tooltip="' + Common.TranslateKey('Process') + '" data-translate="[title]Process;[data-tooltip]Process;"><i class="gtc-icon-styles fa fa-play"></i><span class="gtc-sr-only" data-translate="Process">' + Common.TranslateKey('Process') + '</span></a>';
        }
        eventDisplayDetailMarkup += '</li>';

        // User defined display items
        if (Common.IsDefined(eventDisplayDetail.DisplayItems) && eventDisplayDetail.DisplayItems.length > 0) {
            eventDisplayDetailMarkup += '</ol><ol class="gtc-eventdisplaydetail-row">';
            var index = 0, length = eventDisplayDetail.DisplayItems.length;
            for ( ; index < length; index++) {
                var displayItem = eventDisplayDetail.DisplayItems[index];
                var displayItemNamespace = window[displayItem.Type.toString()];

                // Stop item spans greater than items per line or apply row spans
                if (displayItem.SpanRow == 'Yes' || parseInt(displayItem.ItemSpan, 10) > parseInt(eventDisplayDetail.DisplayItemsPerLine, 10)) {
                    displayItem.ItemSpan = eventDisplayDetail.DisplayItemsPerLine;
                }

                // Give Rich Text Display Items unique ids for initialization
                if (displayItem.Type == 'RichTextDisplayItem' && Common.IsDefined(viewModelId)) {
                    // Update name to be unique
                    displayItem.Name += viewModelId;
                }

                // Render
                eventDisplayDetailMarkup += displayItemNamespace.Render(displayItem, eventDisplayDetail);

                // Append Line?
                if (displayItem.AppendLine == 'Yes' && eventDisplayDetail.DisplayItems.length != index + 1) {
                    eventDisplayDetailMarkup += '</ol><ol class="gtc-eventdisplaydetail-row">';
                }
            }
            eventDisplayDetailMarkup += '</ol>';
        }

        Events.On(document.body, 'click.' + eventDisplayDetail.Name, '#' + eventDisplayDetail.Name,
            function (event) {
                var eventTarget = event.target;
                if (!Common.HasClass(eventTarget, 'gtc-eventdisplaydetail-footer') && Common.IsNotDefined(Common.Closest('.gtc-eventdisplaydetail-footer', eventTarget)) && !Common.HasClass(eventTarget, 'gtc-eventdisplaydetail-eventlink') && Common.IsNotDefined(Common.Closest('.gtc-eventdisplaydetail-eventlink', eventTarget))) {
                    event.preventDefault();
                    var expandableEventDetail = Common.Query('.gtc-eventdisplaydetail-expandable', this);
                    if (Common.IsDefined(Common.QueryAll('.gtc-displaydetail-column', expandableEventDetail))) {
                        if (Common.IsHidden(expandableEventDetail)) {
                            Velocity(expandableEventDetail, 'slideDown', 'slow',
                                function () {
                                    Page.SetPageHeight();
                                }
                            );
                            Common.AddClass(Common.Query('.gtc-eventdisplaydetail-expandable-icon', this), 'fa-rotate-270');
                            Common.AddClass(this, 'gtc-eventdisplaydetail-expandable-open');
                            Common.SetAttr(expandableEventDetail, 'aria-expanded', 'true');
                        }
                        else {
                            Velocity(expandableEventDetail, 'slideUp', 'slow',
                                function () {
                                    Page.SetPageHeight();
                                }
                            );
                            Common.RemoveClass(Common.Query('.gtc-eventdisplaydetail-expandable-icon', this), 'fa-rotate-270');
                            Common.RemoveClass(this, 'gtc-eventdisplaydetail-expandable-open');
                            Common.SetAttr(expandableEventDetail, 'aria-expanded', 'false');
                        }
                    }
                }
            }
        );

        // 508 Compliance - Focus In/Focus Out
        Events.On(document.body, 'focusin.' + eventDisplayDetail.Name, '#' + eventDisplayDetail.Name,
            function (event) {
                Events.On(document, 'keyup.' + eventDisplayDetail.Name,
                    function (keyupEvent) {
                        var pressedKeyCode = (keyupEvent.keyCode ? keyupEvent.keyCode : keyupEvent.which);
                        if (pressedKeyCode == GTC.Keyboard.Enter) {
                            var element = Common.Get(eventDisplayDetail.Name);
                            Events.Trigger(element, 'click');
                        }
                    }
                );
            }
        );
        Events.On(document.body, 'focusout.' + eventDisplayDetail.Name, '#' + eventDisplayDetail.Name,
            function (event) {
                Events.Off(document, 'keyup.' + eventDisplayDetail.Name);
            }
        );

        // Div</>
        eventDisplayDetailMarkup += '</div>';
        eventDisplayDetailMarkup += '<i class="gtc-eventdisplaydetail-expandable-icon gtc-icon-styles fa fa-share fa-rotate-90"></i>';
        eventDisplayDetailMarkup += '</div>';

        // Div<>
        eventDisplayDetailMarkup += '<div class="gtc-eventdisplaydetail-footer">';

        // Links
        if (Common.IsDefined(eventDisplayDetail.Links) && eventDisplayDetail.Links.length > 0) {

            // Links
            var link, index = 0, length = eventDisplayDetail.Links.length;
            for ( ; index < length; index++) {
                link = eventDisplayDetail.Links[index];

                // Id?
                if (Common.IsDefined(eventDisplayDetail.Id)) {
                    // Update name to be unique
                    link.Name += Common.SanitizeToken(eventDisplayDetail.Id);
                }

                // Li<>, Anchor, Li</>
                eventDisplayDetailMarkup += Link.Render(link);
            }
        }

        // Div</>, Div</>
        eventDisplayDetailMarkup += '</div></div>';

        // Return markup
        return eventDisplayDetailMarkup;

    };

    /**
     * @function EventDisplayDetail.OnProcess
     * @param {event} event - A DOM click Event
     * @description This method is called when the Process link clicked
     */
    EventDisplayDetail.OnProcess = function (event) {

        // Initialize
        var eventDisplayDetail = Common.Closest('.gtc-eventdisplaydetail', this);
        var onProcessParameters = [{
            Name: 'ExistingEventDetail',
            Value: Common.GetAttr(eventDisplayDetail, 'data-existingeventdetail'),
            UiParameters: null
        }];
        var onProcessEvent = JSON.parse(Common.GetAttr(eventDisplayDetail, 'data-process'));
        if (Common.IsDefined(onProcessEvent)) {
            if (Common.IsDefined(onProcessEvent.UiParameters)) {
                onProcessParameters = onProcessParameters.concat(onProcessEvent.UiParameters);
            }

            // Execute View Behavior
            Common.ExecuteViewBehavior(onProcessEvent.ControllerPath + onProcessEvent.ActionName, onProcessParameters,
                function () {
                    OnComplete(eventDisplayDetail);
                },
                eventDisplayDetail
            );
        }

    };

    /**
     * @function EventDisplayDetail.OnDelete
     * @param {event} event - A DOM click Event
     * @description This method is called when the Delete link clicked
     */
    EventDisplayDetail.OnDelete = function (event) {

        // Initialize
        var eventDisplayDetail = Common.Closest('.gtc-eventdisplaydetail', this);
        var onDeleteParameters = [{
            Name: 'ExistingEventDetail',
            Value: Common.GetAttr(eventDisplayDetail, 'data-existingeventdetail'),
            UiParameters: null
        }];
        var onDeleteEvent = JSON.parse(Common.GetAttr(eventDisplayDetail, 'data-delete'));
        if (Common.IsDefined(onDeleteEvent)) {
            if (Common.IsDefined(onDeleteEvent.UiParameters)) {
                onDeleteParameters = onDeleteParameters.concat(onDeleteEvent.UiParameters);
            }

            // Execute View Behavior
            Common.ExecuteViewBehavior(onDeleteEvent.ControllerPath + onDeleteEvent.ActionName, onDeleteParameters,
                function () {
                    OnComplete(eventDisplayDetail);
                },
                eventDisplayDetail
            );
        }

    };

    /**
     * @function EventDisplayDetail.OnRecycle
     * @param {event} event - A DOM click Event
     * @description This method is called when the Recycle link clicked
     */
    EventDisplayDetail.OnRecycle = function (event) {

        // Initialize
        var eventDisplayDetail = Common.Closest('.gtc-eventdisplaydetail', this);
        var onRecycleParameters = [{
            Name: 'ExistingEventDetail',
            Value: Common.GetAttr(eventDisplayDetail, 'data-existingeventdetail'),
            UiParameters: null
        }];
        var onRecycleEvent = JSON.parse(Common.GetAttr(eventDisplayDetail, 'data-recycle'));
        if (Common.IsDefined(onRecycleEvent)) {
            if (Common.IsDefined(onRecycleEvent.UiParameters)) {
                onRecycleParameters = onRecycleParameters.concat(onRecycleEvent.UiParameters);
            }

            // Execute View Behavior
            Common.ExecuteViewBehavior(onRecycleEvent.ControllerPath + onRecycleEvent.ActionName, onRecycleParameters,
                function () {
                    OnComplete(eventDisplayDetail);
                },
                eventDisplayDetail
            );
        }

    };

    /**
     * @function EventDisplayDetail.OnUndo
     * @param {event} event - A DOM click Event
     * @description This method is called when the Undo link clicked
     */
    EventDisplayDetail.OnUndo = function (event) {

        // Initialize
        var eventDisplayDetail = Common.Closest('.gtc-eventdisplaydetail', this);
        var onUndoParameters = [{
            Name: 'ExistingEventDetail',
            Value: Common.GetAttr(eventDisplayDetail, 'data-existingeventdetail'),
            UiParameters: null
        }];
        var onUndoEvent = JSON.parse(Common.GetAttr(eventDisplayDetail, 'data-undo'));
        if (Common.IsDefined(onUndoEvent)) {
            if (Common.IsDefined(onUndoEvent.UiParameters)) {
                onUndoParameters = onUndoParameters.concat(onUndoEvent.UiParameters);
            }

            // Execute View Behavior
            Common.ExecuteViewBehavior(onUndoEvent.ControllerPath + onUndoEvent.ActionName, onUndoParameters,
                function () {
                    OnComplete(eventDisplayDetail);
                },
                eventDisplayDetail
            );
        }

    };

    /**
     * @function EventDisplayDetail.OnShowValidations
     * @param {event} event - A DOM click Event
     * @description This method is called when the Show Validations link clicked
     */
    EventDisplayDetail.OnShowValidations = function (event) {

        // Initialize
        var eventDisplayDetail = Common.Closest('.gtc-eventdisplaydetail', this);
        var onShowValidationsParameters = [{
            Name: 'ExistingEventDetail',
            Value: Common.GetAttr(eventDisplayDetail, 'data-existingeventdetail'),
            UiParameters: null
        }];
        var onShowValidationsEvent = JSON.parse(Common.GetAttr(eventDisplayDetail, 'data-showvalidations'));
        if (Common.IsDefined(onShowValidationsEvent)) {
            if (Common.IsDefined(onShowValidationsEvent.UiParameters)) {
                onShowValidationsParameters = onShowValidationsParameters.concat(onShowValidationsEvent.UiParameters);
            }

            // Execute View Behavior
            Common.ExecuteViewBehavior(onShowValidationsEvent.ControllerPath + onShowValidationsEvent.ActionName, onShowValidationsParameters,
                function (behaviorData) {
                    Validation.ShowValidationsModal(behaviorData.UiValidation, Common.GetAttr(eventDisplayDetail, 'data-eventcomplete'), eventDisplayDetail);
                },
                eventDisplayDetail
            );
        }

    };

    /**
     * @function EventDisplayDetail.OnShowValidations
     * @param {UiParameter[]} onSaveValidationsParameters - An array of UiParameters with Field names and values in JSON format
     * @param {object} button - The Save Button DOM element in the Validations Modal
     * @param {object} eventDisplayDetail - The EventDisplayDetail DOM element
     * @description This method is called when the Save Button in the Validations Modal is clicked
     */
    EventDisplayDetail.OnSaveValidations = function (onSaveValidationsParameters, button, eventDisplayDetail) {

        // Initialize
        var onSaveValidationsEvent = JSON.parse(Common.GetAttr(eventDisplayDetail, 'data-savevalidations'));
        if (Common.IsDefined(onSaveValidationsEvent)) {
            if (Common.IsDefined(onSaveValidationsEvent.UiParameters)) {
                onSaveValidationsParameters = onSaveValidationsParameters.concat(onSaveValidationsEvent.UiParameters);
            }

            // Execute View Behavior
            Common.ExecuteViewBehavior(onSaveValidationsEvent.ControllerPath + onSaveValidationsEvent.ActionName, onSaveValidationsParameters,
                function () {
                    Validation.CloseValidationsModal();
                },
                button
            );
        }

    };

    /**
     * @function EventDisplayDetail.ShowPinwheel
     * @param {object} eventDisplayDetail - The EventDisplayDetail DOM element
     * @description Shows Pinwheel on the View Element
     */
    EventDisplayDetail.ShowPinwheel = function (eventDisplayDetail) {

        Common.InsertHTMLString(document.body, Common.InsertType.Append, '<div class="gtc-pinwheel-overlay gtc-pinwheel-overlay-transparent" id="EventDisplayDetailPinwheelOverlay"></div>');
        SpinKit.Show(eventDisplayDetail, 'FadingCircle');

    };

    /**
     * @function EventDisplayDetail.HidePinwheel
     * @param {object} eventDisplayDetail - The EventDisplayDetail DOM element
     * @description Hides Pinwheel on the View Element
     */
    EventDisplayDetail.HidePinwheel = function (eventDisplayDetail) {

        setTimeout(
            function () {
                SpinKit.Hide(eventDisplayDetail);
                Common.Remove(Common.Get('EventDisplayDetailPinwheelOverlay'));
            }, 300
        );

    };

    /**
     * @function EventDisplayDetail.ReplaceElement
     * @param {object} displayDetail - The EventDisplayDetail DOM element
     * @param {object[]} viewElements - An array that contains one EventDisplayDetail View Element in JSON format
     * @param {object[]} promises - An array of promises that is used to know when all Page Instructions are completed
     * @description Replaces the EventDisplayDetail
     */
    EventDisplayDetail.ReplaceElement = function (displayDetail, viewElements, promises) {

        // Animation Promise
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Clean delegated events on elements being removed before building HTML which will attach delegated events with same id!
        Cache.CleanDelegatedElementsData(displayDetail);

        // Can Properties
        var canProperties = JSON.parse(Common.GetAttr(Common.Closest('.gtc-eventdisplaydetail', displayDetail), 'data-canproperties'));

        // Initialize canProperties if no event panel was used
        if (Common.IsNotDefined(canProperties)) {
            canProperties = {
                CanDelete: 'No',
                CanUndo: 'No',
                CanRecycle: 'No',
                CanEdit: 'No',
                CanProcess: 'No',
                CanViewResults: 'No'
            };
        }

        // Build Markup
        var displayDetailMarkup = '';
        if (Common.IsDefined(viewElements)) {
            var viewElement;
            index = 0;
            length = viewElements.length;
            for ( ; index < length; index++) {
                viewElement = viewElements[index];
                viewElement.IsDisplayed = 'No';
                displayDetailMarkup += EventDisplayDetail.Render(viewElement, canProperties);
            }
        }

        // Replace
        Velocity(displayDetail, 'slideUp', 'slow',
            function () {
                Common.InsertHTMLString(displayDetail, Common.InsertType.After, displayDetailMarkup);
                var insertedDetail = displayDetail.nextElementSibling;
                Velocity(insertedDetail, 'slideDown', 'slow',
                    function () {
                        animationPromise.resolve();
                    }
                );

                // Remove event display detail and cleanup cache but ignore delegated events since they were already removed and reattached with same id!
                Common.Remove(displayDetail, false, true);
            }
        );

    };

    /**
     * @function EventDisplayDetail.RemoveElement
     * @param {object} displayDetail - The EventDisplayDetail DOM element
     * @param {object[]} promises - An array of promises that is used to know when all Page Instructions are completed
     * @description Removes the EventDisplayDetail
     */
    EventDisplayDetail.RemoveElement = function (displayDetail, promises) {

        // Get deferred object for animation
        var animationPromise = Common.Promise();
        promises.push(animationPromise.promise);

        // Parent Panel?
        var displayPanel = Common.Closest('.gtc-displaypanel', displayDetail);

        // Animate
        Velocity(displayDetail, 'slideUp', 600,
            function () {
                Common.Remove(displayDetail);
                EventDisplayPanel.UpdateDisplayNoItems(displayPanel, promises);
                animationPromise.resolve();
            }
        );

    };

    /**
     * @function EventDisplayDetail.UpdateTitle
     * @param {object} displayDetail - The EventDisplayDetail DOM element
     * @param {string} updatedTitle - The new Title of the EventDisplayDetail
     * @param {object[]} promises - An array of promises that is used to know when all Page Instructions are completed
     * @param {string} context - Current or Parent View
     * @description Updates the Title of the EventDisplayDetail
     */
    EventDisplayDetail.UpdateTitle = function (displayDetail, updatedTitle, promises, context) {

        var onParent = context == 'Parent';
        var title = Common.Get(displayDetail.id + 'Title', onParent);
        var updateTitleFunction = function () {
            title.textContent = Common.TranslateKey(updatedTitle);
            Common.SetAttr(title, 'data-translate', updatedTitle);
        };
        if (Common.IsHidden(displayDetail)) {
            updateTitleFunction();
        }
        else {
            // Get deferred object for animation
            var animationPromise = Common.Promise();
            promises.push(animationPromise.promise);

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

    // Private Methods
    function OnComplete (eventDisplayDetail) {

        // Initialize
        var onCompleteEvent = JSON.parse(Common.GetAttr(eventDisplayDetail, 'data-complete'))
        var onCompleteParameters = [{
            Name: 'ExistingEventDetail',
            Value: Common.GetAttr(eventDisplayDetail, 'data-existingeventdetail'),
            UiParameters: null
        }];
        if (Common.IsDefined(onCompleteEvent)) {
            if (Common.IsDefined(onCompleteEvent.UiParameters)) {
                onCompleteParameters = onCompleteParameters.concat(onCompleteEvent.UiParameters);
            }

            // Execute View Behavior
            Common.ExecuteViewBehavior(onCompleteEvent.ControllerPath + onCompleteEvent.ActionName, onCompleteParameters, Page.RunInstructions, eventDisplayDetail);
        }

    };

} (window.EventDisplayDetail = window.EventDisplayDetail || {}, window, document, Common, Cache, Events, Velocity));
