function setUserName() {
    var pierrediv = document.getElementById("pierre");
    pierrediv.innerHTML = localStorage.getItem("username");
}

function setProjectName() {
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var projectInfoObject = JSON.parse(projectinfo);
    var powerplantdiv = document.getElementById("powerplant");
    powerplant.innerHTML = projectInfoObject.projectname;
}

function highlightSelectedRowOnRightClick(selectedRow) {
    var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
    if(typeOfRow == "ComparisonMainReviewTbody") { 
        comparisonReviewManager.SelectedComponentRow = selectedRow[0];
        comparisonReviewManager.ChangeBackgroundColor(selectedRow[0]);
    }
    else if(typeOfRow == "SourceAComplianceMainReviewTbody") {
        sourceAComplianceReviewManager.SelectedComponentRow = selectedRow[0];
        sourceAComplianceReviewManager.ChangeBackgroundColor(selectedRow[0]);
    }
    else if(typeOfRow == "SourceBComplianceMainReviewTbody") {
        sourceBComplianceReviewManager.SelectedComponentRow = selectedRow[0];
        sourceBComplianceReviewManager.ChangeBackgroundColor(selectedRow[0]);
    }
}

// function chooseAction(selectedRow) {
//     if(selectedRow[0].nodeName == "BUTTON") { 
//         var typeOfRow = selectedRow[0].offsetParent.id;
//         var groupId = selectedRow[0].attributes[0].value;
//         if(typeOfRow == "ComparisonMainReviewTbody" || 
//            typeOfRow == "ComparisonDetailedReviewTbody") { 
//             if(comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED' ||
//               comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED(T)') {
//                 return false;
//             } else { return true; }
//         }
//         else if(typeOfRow == "SourceAComplianceMainReviewTbody" || typeOfRow == "ComplianceADetailedReviewTbody") { 
//             if(sourceAComplianceReviewManager.ComplianceCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED') {
//                 return false;
//             }else { return true; }
//         }
//         else if(typeOfRow == "SourceBComplianceMainReviewTbody" || typeOfRow == "ComplianceBDetailedReviewTbody") {
//             if(sourceBComplianceReviewManager.ComplianceCheckManager["CheckGroups"][groupId].categoryStatus == 'ACCEPTED') {
//                 return false;
//             }else { return true; }
//         }
//     }
//     else {
//         var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
//         if(typeOfRow == "ComparisonMainReviewTbody" || typeOfRow == "ComparisonDetailedReviewTbody") {
//             if(selectedRow[0].cells[ComparisonColumns.Status].innerHTML == "OK(A)" || selectedRow[0].cells[4].innerHTML == "ACCEPTED" ||
//             selectedRow[0].cells[ComparisonColumns.Status].innerHTML == 'OK(A)(T)') {
//                 return false;
//             }else { return true; }
//         }
//         else if(typeOfRow == "SourceAComplianceMainReviewTbody" || typeOfRow == "ComplianceADetailedReviewTbody" || 
//         typeOfRow == "SourceBComplianceMainReviewTbody" || typeOfRow == "ComplianceBDetailedReviewTbody") {
//             if(selectedRow[0].cells[1].innerHTML == "OK(A)" || selectedRow[0].cells[2].innerHTML == "ACCEPTED") {
//                 return false;
//             } else { return true; }
//         }   
//     }                       
// }

// function chooseRestoreTranspose(selectedRow) {
//     if(selectedRow[0].nodeName == "BUTTON") { 
//         var typeOfRow = selectedRow[0].offsetParent.id;
//         var groupId = selectedRow[0].attributes[0].value;
//         if(typeOfRow == "ComparisonMainReviewTbody" || typeOfRow == "ComparisonDetailedReviewTbody") { 
//             if(comparisonReviewManager.ComparisonCheckManager["CheckGroups"][groupId].categoryStatus == 'OK(T)') {
//                 return false;
//             } else { return true; }
//         }
//     }
//     else {
//         var typeOfRow = selectedRow[0].offsetParent.offsetParent.offsetParent.id;
//         if(typeOfRow == "ComparisonMainReviewTbody") {
//             var componentId = selectedRow[0].cells[5].innerHTML;
//             var groupId = selectedRow[0].cells[6].innerHTML;
//             var component = comparisonReviewManager.ComparisonCheckManager.CheckGroups[groupId]["CheckComponents"][componentId]
//             if(selectedRow[0].cells[2].innerHTML == 'ACCEPTED(T)' && selectedRow[0].cells[2].innerHTML == 'ACCEPTED(T)') {
//                 return true;
//             }
//             else if(component.transpose !== null || selectedRow[0].cells[2].innerHTML == 'OK(A)(T)' ) {
//                 return false;
//             }else { return true; }
//         }
//         else if(typeOfRow == "ComparisonDetailedReviewTbody") {
//             if(selectedRow[0].cells[4].innerHTML.includes('(T)')) {
//                 return false;
//             }
//             else {
//                 return true;
//             }
//         }
//     }
// }

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
        if (typeOfRow == "ComparisonMainReviewTbody") {
            comparisonReviewManager.UnAcceptComponent(selectedRow);
        }
        else if (typeOfRow == "ComparisonDetailedReviewTbody") {
            comparisonReviewManager.UnAcceptProperty(selectedRow);
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
        if(typeOfRow == "ComparisonMainReviewTbody" || 
           typeOfRow == "ComparisonDetailedReviewTbody") {
            if(selectedRow[0].cells[2].innerHTML == "OK" || selectedRow[0].cells[4].innerHTML == "OK" || 
            selectedRow[0].cells[2].innerHTML == "OK(T)" || selectedRow[0].cells[4].innerHTML == "OK(T)" ||
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
    sourceBComplianceCheckGroups,
    sourceAComponentsHierarchy,
    sourceBComponentsHierarchy,
    sourceAComplianceHierarchy,
    sourceBComplianceHierarchy) {
    if (!comparisonCheckGroups &&
        !sourceAComplianceCheckGroups &&
        !sourceBComplianceCheckGroups) {
        return;
    }
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var object = JSON.parse(projectinfo);
    $.ajax({
        url: 'PHP/SourceViewerOptionsReader.php',
        type: "POST",
        async: true,
        data: {
            'ProjectName': object.projectname
        },
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
                    data: {
                         'Source': "SourceA",
                         'ProjectName': object.projectname 
                        },
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
                    data: {
                        'Source': "SourceB",
                        'ProjectName': object.projectname
                    },
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
                    sourceBClassWiseComponents,
                    sourceAComponentsHierarchy,
                    sourceBComponentsHierarchy);
            }

            if (sourceAComplianceCheckGroups) {
                loadSourceAComplianceData(sourceAComplianceCheckGroups,
                    sourceAViewerOptions,
                    sourceAClassWiseComponents,
                    sourceAComplianceHierarchy,);
            }

            if (sourceBComplianceCheckGroups) {
                loadSourceBComplianceData(sourceBComplianceCheckGroups,
                    sourceBViewerOptions,
                    sourceBClassWiseComponents,
                    sourceBComplianceHierarchy);
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
    sourceAClassWiseComponents,
    sourceAComplianceHierarchy) {

    sourceAComplianceReviewManager = new ComplianceReviewManager(complianceCheckGroups,
        sourceViewerOptions,
        sourceAClassWiseComponents,
        'SourceAComplianceMainReviewCell',
        'SourceAComplianceDetailedReviewCell',
        'SourceAComplianceDetailedReviewComment',
         sourceAComplianceHierarchy);

    // populate review table
    sourceAComplianceReviewManager.populateReviewTable();
    if (comparisonReviewManager !== undefined)
        comparisonReviewManager.complianceA = sourceAComplianceReviewManager;

}

function loadSourceBComplianceData(complianceCheckGroups,
    sourceViewerOptions,
    sourceBClassWiseComponents,
    sourceBComplianceHierarchy) {    

    sourceBComplianceReviewManager = new ComplianceReviewManager(complianceCheckGroups,
        sourceViewerOptions,
        sourceBClassWiseComponents,
        'SourceBComplianceMainReviewCell',
        'SourceBComplianceDetailedReviewCell',
        'SourceBComplianceDetailedReviewComment',
         sourceBComplianceHierarchy);


    // populate review table
    sourceBComplianceReviewManager.populateReviewTable();
    if (comparisonReviewManager !== undefined)
        comparisonReviewManager.complianceB = sourceBComplianceReviewManager;

}

function loadComparisonData(comparisonCheckGroups,
    sourceAViewerOptions,
    sourceBViewerOptions,
    sourceAClassWiseComponents,
    sourceBClassWiseComponents,
    sourceAComponentsHierarchy,
    sourceBComponentsHierarchy) {

    comparisonReviewManager = new ComparisonReviewManager(comparisonCheckGroups,
        sourceAViewerOptions,
        sourceBViewerOptions,
        sourceAClassWiseComponents,
        sourceBClassWiseComponents,
        "ComparisonMainReviewCell",
        "ComparisonDetailedReviewCell",
        sourceAComponentsHierarchy,
        sourceBComponentsHierarchy);

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
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var object = JSON.parse(projectinfo);
    try {

        $.ajax({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "SaveCheckResultsToCheckSpaceDB",
                'ProjectName': object.projectname
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

function toggleDropdown() {
    document.getElementById("newReferenceDropdown").classList.toggle("show");
}