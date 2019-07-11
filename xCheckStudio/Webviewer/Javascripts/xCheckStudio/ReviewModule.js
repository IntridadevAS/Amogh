function setUserName() {
    $.ajax({
        data: { 'variable': 'Name' },
        type: "POST",
        url: "PHP/GetSessionVariable.php"
    }).done(function (msg) {
        if (msg !== 'fail') {
            var pierrediv = document.getElementById("pierre");
            if (msg != "" && pierrediv != null)
                pierrediv.innerHTML = msg;
        }
    });
}

function setProjectName() {
    $.ajax({
        data: { 'variable': 'ProjectName' },
        type: "POST",
        url: "PHP/GetSessionVariable.php"
    }).done(function (msg) {
        if (msg !== 'fail') {
            var powerplantdiv = document.getElementById("powerplant");
            if (msg != "" && powerplantdiv != null)
                powerplant.innerHTML = msg;
        }
    });
}

function executeContextMenuClicked(key, options, _this) {
    if (key === "menuItem") {
        if(options.items[key].name == "Accept") {
            onAcceptClick(_this); 
        }
        else {
            onUnAcceptClick(_this); 
        }
    }
    if (key === "menuItem2") {
        if(options.items[key].name == "Restore") {
            onRestoreTranspose(_this);
        }
    }
    else if (key === "lefttoright" || key === "righttoleft") {
        onTransposeClick(key, _this);
        
    }
    else if (key === "freeze") {
    }
    else if (key === "reference") {
        onReferenceClick(_this);
    }
}

function onTransposeClick(key, selectedRow) {
    if(selectedRow[0].nodeName == "BUTTON") {
        var typeOfRow = selectedRow[0].offsetParent.id;
        comparisonReviewManager.transposePropertyValueCategoryLevel(key, selectedRow[0], comparisonReviewManager);
    }
    else {
        var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
        if(typeOfRow == "ComparisonMainReviewTbody") {
            comparisonReviewManager.transposePropertyValueComponentLevel(key, selectedRow, comparisonReviewManager);
        }
        else if(typeOfRow == "ComparisonDetailedReviewTbody") {
            comparisonReviewManager.transposePropertyValue(key, selectedRow, comparisonReviewManager);
        }
    }
}

function onRestoreTranspose(selectedRow) {
    if(selectedRow[0].nodeName == "BUTTON") {
        var typeOfRow = selectedRow[0].offsetParent.id;
        comparisonReviewManager.restoreTransposeCategoryLevel(selectedRow[0], comparisonReviewManager);
    }
    else {
        var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
        if(typeOfRow == "ComparisonMainReviewTbody") {
            comparisonReviewManager.restoreTransposeComponentLevel(selectedRow, comparisonReviewManager);
        }
        else if(typeOfRow == "ComparisonDetailedReviewTbody") {
            comparisonReviewManager.restoreTransposePropertyValue(selectedRow, comparisonReviewManager);
        }
    }
}

function chooseAction(selectedRow) {
    if(selectedRow[0].nodeName == "BUTTON") { 
        var typeOfRow = selectedRow[0].offsetParent.id;
        var groupId = selectedRow[0].attributes[0].value;
        if(typeOfRow == "ComparisonMainReviewTbody" || typeOfRow == "ComparisonDetailedReviewTbody") { 
            if(comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED' ||
            comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED(T)') {
                return false;
            } else { return true; }
        }
        else if(typeOfRow == "SourceAComplianceMainReviewTbody" || typeOfRow == "ComplianceADetailedReviewTbody") { 
            if(sourceAComplianceReviewManager.ComplianceCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED') {
                return false;
            }else { return true; }
        }
        else if(typeOfRow == "SourceBComplianceMainReviewTbody" || typeOfRow == "ComplianceBDetailedReviewTbody") {
            if(sourceBComplianceReviewManager.ComplianceCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED') {
                return false;
            }else { return true; }
        }
    }
    else {
        var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
        if(typeOfRow == "ComparisonMainReviewTbody" || typeOfRow == "ComparisonDetailedReviewTbody") {
            if(selectedRow[0].cells[2].innerHTML == "ACCEPTED" || selectedRow[0].cells[4].innerHTML == "ACCEPTED" ||
            selectedRow[0].cells[2].innerHTML == 'ACCEPTED(T)') {
                return false;
            }else { return true; }
        }
        else if(typeOfRow == "SourceAComplianceMainReviewTbody" || typeOfRow == "ComplianceADetailedReviewTbody" || 
        typeOfRow == "SourceBComplianceMainReviewTbody" || typeOfRow == "ComplianceBDetailedReviewTbody") {
            if(selectedRow[0].cells[1].innerHTML == "ACCEPTED" || selectedRow[0].cells[2].innerHTML == "ACCEPTED") {
                return false;
            } else { return true; }
        }   
    }                       
}

function chooseRestoreTranspose(selectedRow) {
    if(selectedRow[0].nodeName == "BUTTON") { 
        var typeOfRow = selectedRow[0].offsetParent.id;
        var groupId = selectedRow[0].attributes[0].value;
        if(typeOfRow == "ComparisonMainReviewTbody" || typeOfRow == "ComparisonDetailedReviewTbody") { 
            if(comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'OK(T)' ||
            comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'OK') {
                return false;
            } else { return true; }
        }
    }
    else {
        var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
        if(typeOfRow == "ComparisonMainReviewTbody") {
            var componentId = selectedRow[0].cells[5].innerHTML;
            var groupId = selectedRow[0].cells[6].innerHTML;
            var component = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId]["CheckComponents"][componentId]
            if(selectedRow[0].cells[2].innerHTML == 'ACCEPTED(T)' && selectedRow[0].cells[2].innerHTML == 'ACCEPTED(T)') {
                return true;
            }
            else if(component.transpose !== null) {
                return false;
            }else { return true; }
        }
        else if(typeOfRow == "ComparisonDetailedReviewTbody") {
            if(selectedRow[0].cells[4].innerHTML.includes('(T)')) {
                return false;
            }
            else {
                return true;
            }
        }
    }
}

function onAcceptClick(rowClicked) {
    var selectedRow = rowClicked;
    var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
    if(rowClicked[0].nodeName == "BUTTON") {
        typeOfRow = selectedRow[0].offsetParent.id;
        if(typeOfRow == "ComparisonMainReviewTbody") {
            comparisonReviewManager.updateStatusOfCategory(rowClicked[0], comparisonReviewManager);
        }
        else if(typeOfRow == "SourceAComplianceMainReviewTbody") {
            sourceAComplianceReviewManager.updateStatusOfCategory(rowClicked[0]);
        }
        else if(typeOfRow == "SourceBComplianceMainReviewTbody") {
            sourceBComplianceReviewManager.updateStatusOfCategory(rowClicked[0]);
        }  
    }
    else {
        if(typeOfRow == "ComparisonMainReviewTbody" || typeOfRow == "ComparisonDetailedReviewTbody") {
            comparisonReviewManager.updateStatus(selectedRow, comparisonReviewManager);
        }
        else if(typeOfRow == "SourceAComplianceMainReviewTbody" || typeOfRow == "ComplianceADetailedReviewTbody") {
            sourceAComplianceReviewManager.updateStatusOfComplianceElement(selectedRow);
        }
        else if(typeOfRow == "SourceBComplianceMainReviewTbody" || typeOfRow == "ComplianceBDetailedReviewTbody") {
            sourceBComplianceReviewManager.updateStatusOfComplianceElement(selectedRow);
        }                             
    }      
}

function onUnAcceptClick(rowClicked) {
    var selectedRow = rowClicked;
    var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
    if(rowClicked[0].nodeName == "BUTTON") {
        typeOfRow = selectedRow[0].offsetParent.id;
        if(typeOfRow == "ComparisonMainReviewTbody") {
           comparisonReviewManager.unAcceptCategory(rowClicked[0], comparisonReviewManager);
        }
        else if(typeOfRow == "SourceAComplianceMainReviewTbody") {
            sourceAComplianceReviewManager.unAcceptCategory(rowClicked[0], sourceAComplianceReviewManager);
        }
        else if(typeOfRow == "SourceBComplianceMainReviewTbody") {
            sourceBComplianceReviewManager.unAcceptCategory(rowClicked[0], sourceBComplianceReviewManager);
        }  
    }
    else {
        if(typeOfRow == "ComparisonMainReviewTbody" || typeOfRow == "ComparisonDetailedReviewTbody") {
            comparisonReviewManager.unAcceptStatus(selectedRow, comparisonReviewManager);
        }
        
        else if(typeOfRow == "SourceAComplianceMainReviewTbody" || typeOfRow == "ComplianceADetailedReviewTbody") {
            sourceAComplianceReviewManager.unAcceptStatus(selectedRow, sourceAComplianceReviewManager);
        }
        else if(typeOfRow == "SourceBComplianceMainReviewTbody" || typeOfRow == "ComplianceBDetailedReviewTbody") {
            sourceBComplianceReviewManager.unAcceptStatus(selectedRow, sourceBComplianceReviewManager);
        }                             
    }      
}

function disableContextMenuAccept(_this) {
    var selectedRow = _this;
                                    
    if(selectedRow[0].nodeName == "BUTTON") { 
        var typeOfRow = selectedRow[0].offsetParent.id;
        var groupId = selectedRow[0].attributes[0].value;
        if(typeOfRow == "ComparisonMainReviewTbody" || typeOfRow == "ComparisonDetailedReviewTbody") { 
            if(comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'OK' ||
            comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass == 'Undefined') {
                return true;
            }
        }
        else if(typeOfRow == "SourceAComplianceMainReviewTbody" || typeOfRow == "ComplianceADetailedReviewTbody") { 
            if(sourceAComplianceReviewManager.ComplianceCheckManager["CheckGroups"][groupId].categoryStatus == 'OK' ||
            sourceAComplianceReviewManager.ComplianceCheckManager["CheckGroups"][groupId].ComponentClass == 'Undefined') {
                return true;
            }
        }
        else if(typeOfRow == "SourceBComplianceMainReviewTbody" || typeOfRow == "ComplianceBDetailedReviewTbody") {
            if(sourceBComplianceReviewManager.ComplianceCheckManager["CheckGroups"][groupId].categoryStatus == 'OK' ||
            sourceBComplianceReviewManager.ComplianceCheckManager["CheckGroups"][groupId].ComponentClass == 'Undefined') {
                return true;
            }
        }
    }
    else {
        var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
        if(typeOfRow == "ComparisonMainReviewTbody" || typeOfRow == "ComparisonDetailedReviewTbody") {
            if(selectedRow[0].cells[2].innerHTML == "OK" || selectedRow[0].cells[4].innerHTML == "OK" ||
            selectedRow[0].cells[2].innerHTML == "undefined" || selectedRow[0].cells[4].innerHTML == "undefined") {
                return true;
            }
        }
        else if(typeOfRow == "SourceAComplianceMainReviewTbody" || typeOfRow == "ComplianceADetailedReviewTbody" || 
        typeOfRow == "SourceBComplianceMainReviewTbody" || typeOfRow == "ComplianceBDetailedReviewTbody") {
            if(selectedRow[0].cells[1].innerHTML == "OK" || selectedRow[0].cells[2].innerHTML == "OK" ||
            selectedRow[0].cells[1].innerHTML == "undefined" || selectedRow[0].cells[2].innerHTML == "undefined") {
                return true;
            }
        }   
    }
}

function disableContextMenuTranspose(_this) {
    var selectedRow = _this;
    var groupId = selectedRow[0].attributes[0].value;
    if(selectedRow[0].nodeName == "BUTTON") {
        if(comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'OK' ||
        comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'No Match' ||
        comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'OK(T)' ||
        comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED' ||
        comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].ComponentClass == 'Undefined') { 
            return true;
        }
    }
    else {
        var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
        if(typeOfRow == "ComparisonMainReviewTbody" || typeOfRow == "SourceAComplianceMainReviewTbody" || typeOfRow == "SourceBComplianceMainReviewTbody") {
            if(selectedRow[0].cells[2].innerHTML == "OK" || selectedRow[0].cells[2].innerHTML == "undefined" || selectedRow[0].cells[2].innerHTML == "ACCEPTED" ||
            selectedRow[0].cells[2].innerHTML == "No Match" || selectedRow[0].cells[2].innerHTML == "ACCEPTED(T)") {
                return true;
            }
        }
        else if(selectedRow[0].cells[4].innerHTML == "OK" || selectedRow[0].cells[4].innerHTML == "No Value" || selectedRow[0].cells[4].innerHTML == "undefined"
        || selectedRow[0].cells[4].innerHTML == "ACCEPTED" || selectedRow[0].cells[4].innerHTML == "OK(T)") {
            return true;
        }
        else if(selectedRow[0].cells[0].innerHTML == "" || selectedRow[0].cells[3].innerHTML == "") {
            return true;
        }
    }
}

function acceptAllCategories() {
    var tab = this.currentlyOpenedTab;
    if (this.currentlyOpenedTab == "ComparisonTabPage") {
        comparisonReviewManager.toggleAcceptAllComparedComponents('acceptAllCategoriesFromComparisonTab');
    }
    else if (this.currentlyOpenedTab == "SourceAComplianceTabPage") {
        sourceAComplianceReviewManager.toggleAcceptAllComparedComponents('acceptAllCategoriesFromComplianceATab');
    }
    else if (this.currentlyOpenedTab == "SourceBComplianceTabPage") {
        sourceBComplianceReviewManager.toggleAcceptAllComparedComponents('acceptAllCategoriesFromComplianceBTab');
    }
}

function resetAllCategories() {
    var tab = this.currentlyOpenedTab;
    if (this.currentlyOpenedTab == "ComparisonTabPage") {
        comparisonReviewManager.toggleAcceptAllComparedComponents('rejectAllCategoriesFromComparisonTab');
    }
    else if (this.currentlyOpenedTab == "SourceAComplianceTabPage") {
        sourceAComplianceReviewManager.toggleAcceptAllComparedComponents('rejectAllCategoriesFromComplianceATab');
    }
    else if (this.currentlyOpenedTab == "SourceBComplianceTabPage") {
        sourceAComplianceReviewManager.toggleAcceptAllComparedComponents('rejectAllCategoriesFromComplianceBTab');
    }
}

function populateCheckResults(comparisonCheckGroups,
    sourceAComplianceCheckGroups,
    sourceBComplianceCheckGroups) {
    if (!comparisonCheckGroups &&
        !sourceAComplianceCheckGroups &&
        !sourceBComplianceCheckGroups) {
        return;
    }

    $.ajax({
        url: 'PHP/SourceViewerOptionsReader.php',
        type: "POST",
        async: true,
        data: {},
        success: function (msg) {
            var viewerOptions = JSON.parse(msg);

            var sourceAViewerOptions = undefined;
            var sourceAClassWiseComponents = undefined;
            if (viewerOptions['SourceAContainerId'] === undefined ||
                viewerOptions['SourceAEndPointUri'] === undefined) {
                // this ajax call is synchronous

                // get class wise properties for excel and other 1D datasources
                $.ajax({
                    url: 'PHP/ClasswiseComponentsReader.php',
                    type: "POST",
                    async: false,
                    data: { 'Source': "SourceA" },
                    success: function (msg) {
                        if (msg != 'fail') {
                            sourceAClassWiseComponents = JSON.parse(msg);
                        }
                    }
                });
            }
            else {
                sourceAViewerOptions = [viewerOptions['SourceAContainerId'], viewerOptions['SourceAEndPointUri']];
            }

            var sourceBViewerOptions = undefined;
            var sourceBClassWiseComponents = undefined;
            if (viewerOptions['SourceBContainerId'] === undefined ||
                viewerOptions['SourceBEndPointUri'] === undefined) {
                // this ajax call is synchronous

                // get class wise properties for excel and other 1D datasources
                $.ajax({
                    url: 'PHP/ClasswiseComponentsReader.php',
                    type: "POST",
                    async: false,
                    data: { 'Source': "SourceB" },
                    success: function (msg) {
                        if (msg != 'fail' && msg != "") {
                            sourceBClassWiseComponents = JSON.parse(msg);
                        }
                    }
                });
            }
            else {
                sourceBViewerOptions = [viewerOptions['SourceBContainerId'], viewerOptions['SourceBEndPointUri']];
            }


            if (comparisonCheckGroups) {
                loadComparisonData(comparisonCheckGroups,
                    sourceAViewerOptions,
                    sourceBViewerOptions,
                    sourceAClassWiseComponents,
                    sourceBClassWiseComponents);
            }

            if (sourceAComplianceCheckGroups) {
                loadSourceAComplianceData(sourceAComplianceCheckGroups,
                    sourceAViewerOptions,
                    sourceAClassWiseComponents);
            }

            if (sourceBComplianceCheckGroups) {
                loadSourceBComplianceData(sourceBComplianceCheckGroups,
                    sourceBViewerOptions,
                    sourceBClassWiseComponents);
            }

            // make buttons collapsible
            setButtonsCollapsible();

            if (comparisonCheckGroups) {
                openCheckResultTab('ComparisonTabPage');
            }
            else if (sourceAComplianceCheckGroups) {
                openCheckResultTab('SourceAComplianceTabPage');
            }
            else if (sourceBComplianceCheckGroups) {
                openCheckResultTab('SourceBComplianceTabPage');
            }
        }
    });
}

function loadSourceAComplianceData(complianceCheckGroups,
    sourceViewerOptions,
    sourceAClassWiseComponents) {

    sourceAComplianceReviewManager = new ComplianceReviewManager(complianceCheckGroups,
        sourceViewerOptions,
        sourceAClassWiseComponents,
        'SourceAComplianceMainReviewCell',
        'SourceAComplianceDetailedReviewCell',
        'SourceAComplianceDetailedReviewComment');

    // populate review table
    sourceAComplianceReviewManager.populateReviewTable();
    if (comparisonReviewManager !== undefined)
        comparisonReviewManager.complianceA = sourceAComplianceReviewManager;

}

function loadSourceBComplianceData(complianceCheckGroups,
    sourceViewerOptions,
    sourceBClassWiseComponents) {

    // var sourceViewerOptions = undefined;
    // if(viewerOptions['SourceBContainerId'] !== undefined &&
    //     viewerOptions['SourceBEndPointUri'] !== undefined)
    // {
    //     sourceViewerOptions = [viewerOptions['SourceBContainerId'], viewerOptions['SourceBEndPointUri']];
    // }

    sourceBComplianceReviewManager = new ComplianceReviewManager(complianceCheckGroups,
        sourceViewerOptions,
        sourceBClassWiseComponents,
        'SourceBComplianceMainReviewCell',
        'SourceBComplianceDetailedReviewCell',
        'SourceBComplianceDetailedReviewComment');


    // populate review table
    sourceBComplianceReviewManager.populateReviewTable();
    if (comparisonReviewManager !== undefined)
        comparisonReviewManager.complianceB = sourceBComplianceReviewManager;

}

function loadComparisonData(comparisonCheckGroups,
    sourceAViewerOptions,
    sourceBViewerOptions,
    sourceAClassWiseComponents,
    sourceBClassWiseComponents) {

    comparisonReviewManager = new ComparisonReviewManager(comparisonCheckGroups,
        sourceAViewerOptions,
        sourceBViewerOptions,
        sourceAClassWiseComponents,
        sourceBClassWiseComponents,
        "ComparisonMainReviewCell",
        "ComparisonDetailedReviewCell"/*,
                                                            undefined,
                                                            undefined,
                                                            undefined,
                                                            undefined*/);

    // populate review table
    comparisonReviewManager.populateReviewTable();
}

function onHomeClick() {
    if (confirm("You will be redirected to the Home page.\nAre you sure?")) {
        window.location = "landingPage.html";
      }
}

function onSaveProject(event) {
    // var busySpinner = document.getElementById("divLoading");
    // busySpinner.className = 'show';

    try {

        $.ajax({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "SaveCheckResultsToCheckSpaceDB"
            },
            success: function (msg) {
                alert("Saved check results.");
            }
        });
    }
    catch (error) {
        console.log(error.message);
    }
    finally {
        // // remove busy spinner        
        // busySpinner.classList.remove('show')
    }
}

function onReferenceClick(selectedRow) {
    var referenceManager = new ReferenceManager(selectedRow);
    referenceManager.ShowReferenceDiv();
}

function sadsajkdhjlsak() {
    var webAddressString = document.getElementById("webAddressInput").value;
    alert(webAddressString);
}

function toggleDropdown() {
    document.getElementById("newReferenceDropdown").classList.toggle("show");
}