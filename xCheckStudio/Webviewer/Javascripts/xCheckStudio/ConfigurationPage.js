var sourceMappings;
var dataSetAttributes = {};
window.onload = function () {

    // alert("COnfiguration page loaed");
    var generalTab = document.getElementById("generalTab");
    generalTab.onclick = function () {
        onGeneralTabClicked();
    }

    var dataSourceTypeTab = document.getElementById("dataSourceTypeTab");
    dataSourceTypeTab.onclick = function () {
        onDataSourceTypeTabClicked();
    }

    var markupColorsTab = document.getElementById("markupColorsTab");
    markupColorsTab.onclick = function () {
        onMarkupColorsTabClicked();
    }

    var checkRulesTab = document.getElementById("checkRulesTab");
    checkRulesTab.onclick = function () {
        onCheckRulesTabClicked();
    }

    var checkCasesTab = document.getElementById("checkCasesTab");
    checkCasesTab.onclick = function () {
        onCheckCasesTabClicked();
    }
}

function onGeneralTabClicked() {
    openTabContentPage(this, "generalTabContent");
}

function onDataSourceTypeTabClicked() {
    openTabContentPage(this, "dataSourceTypeTabContent");

    populateSourceMappingTable();

    // create link source types select control
    var linkSourceTypesDiv = document.getElementById("linkSourceTypesDiv");
    linkSourceTypesDiv.innerHTML = "";
    var linkSourceTypeSelect = document.createElement("select");
    linkSourceTypeSelect.style.width = "200px";
    linkSourceTypeSelect.onchange = function () {
    }
    linkSourceTypesDiv.appendChild(linkSourceTypeSelect);

    // add new source mapping
    var addMappingButton = document.getElementById("addMappingButton");
    addMappingButton.onclick = function () {
        var tableRowContent = getNewSourceMappingRow();

        $("#sourceMappingDiv").jsGrid("insertItem", tableRowContent).done(function () {
            //console.log("insertion completed");

            // create source mapping object for current row

            //get source mapping table rows         
            var tableRows = getSourceMappingTableRows();

            // in sourceMappings index is row number within table
            const sourceMapping = new SourceMapping();
            sourceMappings[tableRows.length - 1] = sourceMapping;
        });
    }

    // update source library button clicked
    var updateDataSourceLibraryButton = document.getElementById("updateDataSourceLibraryButton");
    updateDataSourceLibraryButton.onclick = function () {
        onUpdateSourceLibrary();
    }

    // add link source type button
    var addLinkSourceTypeButton = document.getElementById("addLinkSourceTypeButton");
    addLinkSourceTypeButton.onclick = function () {
        var linkSourceTypesDiv = document.getElementById("linkSourceTypesDiv");
        var linkSourceTypeSelect = document.createElement("select");
        linkSourceTypeSelect.style.width = "200px";
        linkSourceTypesDiv.appendChild(linkSourceTypeSelect)

        for (var key in sourceMappings) {
            var sourceMapping = sourceMappings[key];
            if (sourceMapping.Name != undefined) {
                var option = document.createElement("option");
                option.innerText = sourceMapping.Name;
                linkSourceTypeSelect.appendChild(option);
            }
        }
    }
}

function onMarkupColorsTabClicked() {
    openTabContentPage(this, "markupColorsTabContent");
}

function onCheckRulesTabClicked() {
    openTabContentPage(this, "checkRulesTabContent");
}

function onCheckCasesTabClicked() {
    openTabContentPage(this, "checkCasesTabContent");
}

function openTabContentPage(inputElement, contentPage) {

    var tabContentPages = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabContentPages.length; i++) {
        tabContentPages[i].style.display = "none";
    }
    var tabButtons = document.getElementsByClassName("tablinks");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }
    document.getElementById(contentPage).style.display = "block";
    inputElement.className += " active";
}
