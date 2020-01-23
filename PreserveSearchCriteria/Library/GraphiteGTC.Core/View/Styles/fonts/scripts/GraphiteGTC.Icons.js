// GTC Icon Chooser
(function (GTCIconChooser, window, document, undefined) {

    // Private Variables
    var iconNodes;
    var inputField;
    var iconNodesLength;
    var iconsDisplayed;
    var sections;
    var sectionsLength;

    // Public Methods
    GTCIconChooser.Initialize = function () {

        iconNodes = document.querySelectorAll('.gtc-icon-example');
        iconNodesLength = iconNodes.length;
        inputField = document.getElementById('search_query');
        inputField.placeholder = 'Search ' + iconNodesLength + ' icons';
        sections = document.querySelectorAll('section.gtc-container:not(.gtc-skip)');
        iconsDisplayed = document.getElementById('icons-displayed');
        sectionsLength = sections.length;
        AttachSearchEvent();
        CheckCurrentlySelected();

    };

    // Private Methods
    function AttachSearchEvent () {

        inputField.addEventListener('keyup', SearchIcons);

    };

    function SearchIcons (event) {

        var element, search, methodName;
        var value = inputField.value, className = 'gtc-hide', index = 0;

        if (value == '') {
            ShowAll();
            ApplyEmptySectionStyling();
            UpdateIconsDisplayed(true);
            return;
        }

        for ( ; index < iconNodesLength; index++) {
            element = iconNodes[index];
            search = element.getAttribute('data-search');
            if (!search) {
                methodName = 'add';
            }
            else if (search.toLowerCase().indexOf(value) > -1) {
                methodName = 'remove';
            }
            else {
                methodName = 'add';
            }
            ApplyIconStyling(element, methodName, className);
        }
        ApplyEmptySectionStyling();
        UpdateIconsDisplayed(false);

    };

    function ApplyIconStyling (iconElement, methodName, className) {

        iconElement.parentNode.parentNode.classList[methodName](className);

    }

    function ShowAll () {

        var index = 0;
        for ( ; index < iconNodesLength; index++) {
            ApplyIconStyling(iconNodes[index], 'remove', 'gtc-hide');
        }

    };

    function HideAll () {

        var index = 0;
        for ( ; index < iconNodesLength; index++) {
            ApplyIconStyling(iconNodes[index], 'add', 'gtc-hide');
        }

    };

    function ApplyEmptySectionStyling () {

        var section, index = 0;
        for ( ; index < sectionsLength; index++) {
            section = sections[index];
            if (AreAllSectionChildrenHidden(section)) {
                section.classList.add('gtc-hide');
            }
            else {
                section.classList.remove('gtc-hide');
            }
        }

    };

    function AreAllSectionChildrenHidden (section) {

        var allChildren = section.querySelectorAll('.gtc-column');
        var hiddenChildren = section.querySelectorAll('.gtc-column.gtc-hide');
        if (allChildren.length == hiddenChildren.length) {
            return true;
        }
        return false;

    };

    function UpdateIconsDisplayed (reset) {

        if (reset) {
            iconsDisplayed.textContent = 'All icons displaying...';
            return;
        }
        var iconCount = document.querySelectorAll('.gtc-column:not(.gtc-hide):not(.gtc-skip)').length;
        if (iconCount == 0) {
            iconsDisplayed.textContent = 'No icons found...';
        }
        else {
            iconsDisplayed.textContent = iconCount + ' icons found...';
        }

    };

    var interval, count = 0;
    function CheckCurrentlySelected () {

        interval = setInterval(DisplayCurrentlySelected, 1000);

    };

    function DisplayCurrentlySelected () {

        if (count < 5) {
            var selectedIcon = document.querySelector('.gtc-icon-group[data-selected="true"]');
            if (selectedIcon) {
                var currentSpan = document.getElementById('selected-icon');
                var clone = selectedIcon.cloneNode(true);
                clone.removeAttribute('data-selected');
                clone.removeAttribute('id');
                clone.removeAttribute('onclick');
                clone.classList.remove('gtc-icon-group');
                clone.style.display = 'inline-block';
                if (!currentSpan.firstChild) {
                    currentSpan.appendChild(clone);
                    var container = document.getElementById('selected-icon-container');
                    container.classList.remove('gtc-hide');
                }
                else {
                    clearInterval(interval);
                }
            }
        }
        else {
            clearInterval(interval);
        }
        count++;

    };

} (window.GTCIconChooser = window.GTCIconChooser || {}, window, document));
