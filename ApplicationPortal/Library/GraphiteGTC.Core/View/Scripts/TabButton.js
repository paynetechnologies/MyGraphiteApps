// Tab Button
// Based On: TabButton -> ViewElement
(function (TabButton, window, document, Common, Cache, Events, Velocity, undefined) {

    // Public Methods
    TabButton.Render = function (tabButtonIndex, tabButton, tabHeaderOptions) {

        // Convert Yes/No to true/false
        var selectedBoolean = (tabButton.Selected == 'Yes');

        // Li<>
        var tabButtonMarkup = '<li role="tab" data-namespace="TabButton"';

        // Class@
        tabButtonMarkup += ' class="gtc-tabbutton';
        if (selectedBoolean) {
            tabButtonMarkup += ' gtc-tabbutton-selected"';
        }
        tabButtonMarkup += '"';

        // Data-Status@
        if (Common.IsDefined(tabButton.Status)) {
            tabButtonMarkup += ' data-status="' + tabButton.Status + '"';
        }

        // Data-Disabled@
        if (tabButton.IsLocked == 'Yes') {
            tabButtonMarkup += ' data-disabled="true"';
        }

        // Style@ - Display;
        if (tabButton.IsDisplayed == 'No') {
            tabButtonMarkup += ' style="display: none;"';
        }

        // Data-Selected@
        tabButtonMarkup += ' aria-selected="' + selectedBoolean.toString() + '" data-selected="' + selectedBoolean.toString() + '">';

        // Anchor<
        tabButtonMarkup += '<a data-overflowtitle="' + tabButton.Title + '" ' + ViewElement.RenderAttributes(tabButton) + ' class="gtc-tabbutton-link"';

        // Href@, Title, Anchor</>
        tabButtonMarkup += ' href="#' + tabButton.TabName + '">';

        // Translations
        if (Common.IsDefined(tabButton.Title)) {
            tabButtonMarkup += '<span class="gtc-tabbutton-title" data-translate="' + tabButton.Title + '">' + Common.TranslateKey(tabButton.Title) + '</span>';
        }

        // Badges
        if (tabHeaderOptions.TabType == 'Badge') {
            tabButtonMarkup += '<span class="gtc-tabbutton-badge"';
            tabButtonMarkup += ' id="' + tabButton.Name + 'Badge">' + (tabButtonIndex + 1).toString() + '</span>';
        }
        tabButtonMarkup += '</a>';

        // Configure TabButton
        Events.On(document.body, 'configuretabbutton.' + tabButton.Name, '#' + tabButton.Name,
            function () {
                var tabButtonElement = this;
                Events.On(tabButtonElement, 'mouseover',
                    function () {
                        Events.Off(tabButtonElement, 'mouseover');
                        var titleSpan = Common.Query('.gtc-tabbutton-title', this);
                        if (Common.IsTextOverflowing(titleSpan)) {
                            var overflowText = Common.TranslateKey(Common.GetAttr(titleSpan, 'data-translate'));
                            Widgets.tooltip(tabButtonElement, {
                                tooltipClass: 'gtc-label-tooltip-style',
                                items: '[data-overflowtitle]',
                                content: function () {
                                    return overflowText;
                                },
                                position: {
                                    my: 'center bottom-20',
                                    at: 'center top',
                                    using: function (position, positionData) {
                                        var thisStyle = this.style;
                                        thisStyle.left = position.left + 'px';
                                        thisStyle.top = position.top + 'px';
                                        var horizontal = 'center';
                                        if (position.left == 0) {
                                            horizontal = 'left';
                                        }
                                        else if (position.left + Common.Width(this) == Common.Width(window)) {
                                            horizontal = 'right';
                                        }
                                        var newDiv = document.createElement('div');
                                        Common.AddClass(newDiv, 'gtc-tooltip-arrow');
                                        Common.AddClass(newDiv, positionData.vertical);
                                        Common.AddClass(newDiv, horizontal);
                                        this.appendChild(newDiv);
                                    }
                                }
                            });
                            Widgets.tooltip(tabButtonElement, 'open');
                        }
                        else {
                            Common.RemoveAttr(tabButtonElement, 'data-overflowtitle');
                        }
                    }
                );
            }
        );

        // Li</>
        tabButtonMarkup += '</li>';
        return tabButtonMarkup;

    };

    TabButton.DisableControl = function (element) {

        var parentLi = element.parentNode;
        Common.SetAttr(parentLi, 'data-disabled', 'true');

    };

    TabButton.EnableControl = function (element) {

        var parentLi = element.parentNode;
        Common.RemoveAttr(parentLi, 'data-disabled');

    };

} (window.TabButton = window.TabButton || {}, window, document, Common, Cache, Events, Velocity));
