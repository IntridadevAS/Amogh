var xCheckStudioInterface1;
var xCheckStudioInterface2;
var checkCaseManager;
var checkCaseFilesData;

var checkCaseName;
var sourceAFileName;
var sourceBFileName;
var sourceATotalItemCount = 0;
var sourceACheckedItemCount = 0;
var sourceBTotalItemCount = 0;
var sourceBCheckedItemCount = 0;

var hiidenEntities = [];

var currentViewer;


window.onload = function () {

    // disable controls on load
    disableControlsOnLoad();

    // set project name
    setProjectName();        

    // set user name
    setUserName();    
    
    var checkButton = document.getElementById("checkButton");
    checkButton.onclick = function () {
        // show busy loader
        var busySpinner = document.getElementById("divLoading");
        busySpinner.className = 'show';

        sourceAComplianceCheckManager = undefined;
        sourceBComplianceCheckManager = undefined;
        comparisonCheckManager = undefined;

        var checkCaseSelect = document.getElementById("checkCaseSelect");
        if (checkCaseSelect.value === "None") {
            // hide busy spinner
            busySpinner.classList.remove('show');           
            OnShowToast('Please select check case from list.');
            return;
        }

        // check if any check case type is selected
        var comparisonCB = document.querySelector('.module1 .group31 .comparisonswitch .toggle-2udj');
        var complianceSourceACB = document.querySelector('.module1 .group1 .complianceswitch .toggle-Hm8P');
        var complianceSourceBCB = document.querySelector('.module1 .group2 .complianceswitch .toggle-Hm8P2');
        if (!comparisonCB.classList.contains("state2") &&
            !complianceSourceACB.classList.contains("state1") &&
            !complianceSourceBCB.classList.contains("state1")) {
            // hide busy spinner
            busySpinner.classList.remove('show');
            OnShowToast('No selected check type found.</br>Please select check type.');           
            return;
        }

        var checkPerformed = false;
        //var checkMethod;
        for (var i = 0; i < checkCaseManager.CheckCase.CheckTypes.length; i++) {
            var checkType = checkCaseManager.CheckCase.CheckTypes[i];
            var comparisonCB = document.getElementById('comparisonCB');
            if (checkType.Name.toLowerCase() === "comparison" &&
                xCheckStudioInterface1 &&
                xCheckStudioInterface2 &&
                checkType.SourceAType.toLowerCase() === xCheckStudioInterface1.SourceType.toLowerCase() &&
                checkType.SourceBType.toLowerCase() === xCheckStudioInterface2.SourceType.toLowerCase()) {
                var component = document.querySelector('.module1 .group31 .comparisonswitch .toggle-2udj');
                if (component.classList.contains("state2")) {

                    var sourceAModelBrowser = xCheckStudioInterface1.getModelBrowser();
                    var sourceBModelBrowser = xCheckStudioInterface2.getModelBrowser();
                    if (!sourceAModelBrowser || !sourceBModelBrowser) {
                        continue;
                    }

                    // check if there are no selected components
                    if (sourceAModelBrowser.selectedCompoents.length === 0 &&
                        sourceBModelBrowser.selectedCompoents.length === 0) {
                        //alert("Comparison check can not be performed.\nNo selected components found for both data sources.");
                        OnShowToast('Comparison check can not be performed.</br>No selected components found for both data sources.');
                        continue;
                    }

                    if (!comparisonCheckManager) {
                        comparisonCheckManager = new CheckManager();
                        comparisonCheckManager.performCheck(xCheckStudioInterface1.sourceProperties,
                            xCheckStudioInterface2.sourceProperties,
                            checkType,
                            true,
                            undefined);

                        checkPerformed = true;
                    }
                }
            }

            else {
                if (xCheckStudioInterface1) {
                    var complianceSourceACB = document.getElementById("complianceSourceACB");
                    if (checkType.Name.toLowerCase() === "compliance" || checkType.Name.toLowerCase() === "compliancesourcea") {
                        if (checkType.SourceAType.toLowerCase() === xCheckStudioInterface1.SourceType.toLowerCase()) {
                            var component = document.querySelector('.module1 .group1 .complianceswitch .toggle-Hm8P');
                            if (component.classList.contains("state1")) {

                                // check if there are no selected components
                                var sourceAModelBrowser = xCheckStudioInterface1.getModelBrowser();
                                if (!sourceAModelBrowser) {
                                    continue;
                                }

                                if (sourceAModelBrowser.selectedCompoents.length === 0) {
                                    //alert("Compliance check on Source A can not be performed.\nNo selected components found.");
                                    OnShowToast('Comparison check can not be performed.</br>No selected components found for both data sources.');
                                    //continue;
                                }
                                else {
                                    if (!sourceAComplianceCheckManager) {
                                        sourceAComplianceCheckManager = new CheckManager();
                                        sourceAComplianceCheckManager.performCheck(xCheckStudioInterface1.sourceProperties,
                                            undefined,
                                            checkType,
                                            false,
                                            xCheckStudioInterface1);

                                        checkPerformed = true;
                                    }
                                }
                            }

                        }
                    }
                }

                if (xCheckStudioInterface2) {
                    var complianceSourceBCB = document.getElementById("complianceSourceBCB");
                    if (checkType.Name.toLowerCase() === "compliance" || checkType.Name.toLowerCase() === "compliancesourceb") {
                        if (checkType.SourceAType.toLowerCase() === xCheckStudioInterface2.SourceType.toLowerCase()) {
                            var component = document.querySelector('.module1 .group2 .complianceswitch .toggle-Hm8P2');
                            if (component.classList.contains("state1")) {

                                // check if there are no selected components
                                var sourceBModelBrowser = xCheckStudioInterface2.getModelBrowser();
                                if (!sourceBModelBrowser) {
                                    continue;
                                }

                                if (sourceBModelBrowser.selectedCompoents.length === 0) {
                                    //alert("Compliance check on Source B can not be performed.\nNo selected components found.");
                                    //continue;

                                    OnShowToast('Compliance check on Source B can not be performed.</br>No selected components found.');
                                }
                                else {
                                    if (!sourceBComplianceCheckManager) {
                                        sourceBComplianceCheckManager = new CheckManager();
                                        sourceBComplianceCheckManager.performCheck(xCheckStudioInterface2.sourceProperties,
                                            undefined,
                                            checkType,
                                            false,
                                            xCheckStudioInterface2);

                                        checkPerformed = true;
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }
        // hide busy spinner
        busySpinner.classList.remove('show');
        if (!checkPerformed) {
            return;
        }
        document.getElementById("checkcompletealert").style.display = "block";
    };

    var checkCaseSelect = document.getElementById("checkCaseSelect");
    checkCaseSelect.onchange = function () {
        if (this.value === "None") {
            checkCaseManager = undefined;

            // disable controls
            disableControlsOnLoad();

            return;
        }

        var fileName;
        for (var i = 0; i < checkCaseFilesData.CheckCaseFileDataList.length; i++) {
            var checkCaseFileData = checkCaseFilesData.CheckCaseFileDataList[i];
            if (checkCaseFileData.CheckCaseName === this.value) {
                fileName = checkCaseFileData.FileName;
                break;
            }
        }
        if (fileName === undefined) {
            return;
        }

        // read check case data from XML checkcase data file
        checkCaseManager = new CheckCaseManager();
        checkCaseManager.readCheckCaseData(fileName);

        // if valid check case is selected, then enable source A controls              
        var component = document.getElementById('createbtnA');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // enable drop zone for source A
        enableDropZone("dropZone1");
    }

    // read check cases files list
    checkCaseFilesData = new CheckCaseFilesData();
    checkCaseFilesData.readCheckCaseFiles();
};

document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
}, false);

function hide() {
    if (currentViewer) {

        var results = currentViewer.selectionManager.getResults();

        var map = {};
        for (var i = 0; i < results.length; i++) {
            var selectedItem = results[i];
            map[selectedItem._nodeId] = false;
            hiidenEntities.push(selectedItem._nodeId);
        }

        currentViewer.model.setNodesVisibilities(map);
    }
}

function showAll() {
    if (currentViewer && hiidenEntities.length > 0) {
        var map = {};
        for (var i = 0; i < hiidenEntities.length; i++) {
            var hiddenEntity = hiidenEntities[i];
            map[hiddenEntity] = true;
        }

        currentViewer.model.setNodesVisibilities(map);
        hiidenEntities = [];
    }
}

function startExplode() {

    if (currentViewer) {
        var slider;
        var outputFiled;
        var overlayField;
        if (currentViewer._params.containerId === "viewerContainer1") {
            slider = document.getElementById("explodeSlider1");
            outputFiled = document.getElementById("explodeValue1");
            overlayField = document.getElementById("overlay1");
        }
        else if (currentViewer._params.containerId === "viewerContainer2") {
            slider = document.getElementById("explodeSlider2");
            outputFiled = document.getElementById("explodeValue2");
            overlayField = document.getElementById("overlay2");
        }
        if (!slider || !outputFiled || !overlayField) {
            return;
        }

        // overlayField.style.top = "270px";
        // overlayField.style.left = "555px";

        overlayField.style.bottom = "30px";
        //overlayField.style.right = "15px";

        overlayField.style.display = "block";

        outputFiled.innerHTML = slider.value;

        slider.oninput = function () {
            outputFiled.innerHTML = this.value;

            if (currentViewer) {
                var explodeManager = currentViewer.getExplodeManager();
                if (explodeManager.getActive()) {
                    explodeManager.stop();
                }

                explodeManager.setMagnitude(Number(this.value));
                explodeManager.start().then(function () {

                });
            }

        }
    }
}

function stopExplode() {
    if (currentViewer) {
        var explodeManager = currentViewer.getExplodeManager();
        if (explodeManager.getActive()) {
            explodeManager.stop();
        }

        var slider;
        var overlayField;
        if (currentViewer._params.containerId === "viewerContainer1") {
            slider = document.getElementById("explodeSlider1");
            overlayField = document.getElementById("overlay1");
        }
        else if (currentViewer._params.containerId === "viewerContainer2") {
            slider = document.getElementById("explodeSlider2");
            overlayField = document.getElementById("overlay2");
        }
        if (!slider || !overlayField) {
            return;
        }
        slider.value = 0;
        overlayField.style.display = "none";
    }
}

function setFront() {
    if (currentViewer) {
        currentViewer.view.setViewOrientation(Communicator.ViewOrientation.Front, Communicator.DefaultTransitionDuration);
    }
}

function setBack() {
    if (currentViewer) {
        currentViewer.view.setViewOrientation(Communicator.ViewOrientation.Back, Communicator.DefaultTransitionDuration);
    }
}

function setTop() {
    if (currentViewer) {
        currentViewer.view.setViewOrientation(Communicator.ViewOrientation.Top, Communicator.DefaultTransitionDuration);
    }
}

function setBottom() {
    if (currentViewer) {
        currentViewer.view.setViewOrientation(Communicator.ViewOrientation.Bottom, Communicator.DefaultTransitionDuration);
    }
}

function setRight() {
    if (currentViewer) {
        currentViewer.view.setViewOrientation(Communicator.ViewOrientation.Right, Communicator.DefaultTransitionDuration);
    }
}

function setLeft() {
    if (currentViewer) {
        currentViewer.view.setViewOrientation(Communicator.ViewOrientation.Left, Communicator.DefaultTransitionDuration);
    }
}

function setISO() {
    if (currentViewer) {
        currentViewer.view.setViewOrientation(Communicator.ViewOrientation.Iso, Communicator.DefaultTransitionDuration);
    }
}

function disableControlsOnLoad() {
    // diable check all CB for source A
    var component = document.querySelector('.module1 .group1 .checkallswitch .toggle-KJzr');
    addClass(component, 'disabledbutton');

    // diable compliance CB for source A
    component = document.querySelector('.module1 .group1 .complianceswitch .toggle-Hm8P');
    addClass(component, 'disabledbutton');

    // diable check all CB for source B
    component = document.querySelector('.module1 .group2 .checkallswitch .toggle-KJzr2');
    addClass(component, 'disabledbutton');

    // diable compliance CB for source B
    component = document.querySelector('.module1 .group2 .complianceswitch .toggle-Hm8P2');
    addClass(component, 'disabledbutton');

    // diable comparison switch
    component = document.querySelector('.module1 .group31 .comparisonswitch .toggle-2udj');
    addClass(component, 'disabledbutton');

    // disable source A load button
    component = document.getElementById('createbtnA');
    addClass(component, 'disabledbutton');

    // disable source B load button
    component = document.getElementById('createbtnB');
    addClass(component, 'disabledbutton');

    // disable check button            
    component = document.getElementById('checkButton');
    addClass(component, 'disabledbutton');

    component = document.getElementById('infobtn');
    addClass(component, 'disabledbutton');
}

function setUserName() {
    $.ajax({
        data: { 'variable': 'name' },
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
        data: { 'variable': 'projectname' },
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

// function postData(url, method) {
//     // remove post data js files from server from earlier check results, if any
//     $.ajax({
//         data: '',
//         url: 'postData/postDataCleaner.php',
//         method: 'POST', // or GET
//         async: false,
//         success: function (msg) {
//             //alert('Post Data files deleted');
//         }
//     });

//     checkCaseName = checkCaseManager.CheckCase.Name;

//     var sourceAClasswiseCheckedComponents = 0;
//     var sourceBClasswiseCheckedComponents = 0;

//     var sourceAModelTree;
//     var sourceBModelTree;
//     if (xCheckStudioInterface1) {
//         sourceAModelTree = xCheckStudioInterface1.getModelBrowser();
//         sourceAClasswiseCheckedComponents = sourceAModelTree.getClassWiseCheckedComponents(xCheckStudioInterface1.SourceType);
//     }

//     if (xCheckStudioInterface2) {
//         sourceBModelTree = xCheckStudioInterface2.getModelBrowser();
//         sourceBClasswiseCheckedComponents = sourceBModelTree.getClassWiseCheckedComponents(xCheckStudioInterface2.SourceType);
//     }

//     var sourceAClassWiseComponets = 0;
//     var sourceBClassWiseComponets = 0;

//     if (sourceAModelTree) {
//         var count = sourceAModelTree.selectedCompoents.length;
//         sourceACheckedItemCount = count > 0 ? count : 0;
//         sourceAClassWiseComponets = xCheckStudioInterface1.getClassWiseComponents();
//     }
//     if (sourceBModelTree) {
//         var count = sourceBModelTree.selectedCompoents.length;
//         sourceBCheckedItemCount = count > 0 ? count : 0;
//         sourceBClassWiseComponets = xCheckStudioInterface2.getClassWiseComponents();
//         // sourceBClasswiseCheckedComponents = sourceBModelTree.getClassWiseCheckedComponents();
//     }

//     var analyticsDetailsData = new AnalyticsData(checkCaseName, sourceAFileName, sourceBFileName,
//         sourceATotalItemCount, sourceACheckedItemCount,
//         sourceBTotalItemCount, sourceBCheckedItemCount,
//         sourceAClasswiseCheckedComponents,
//         sourceBClasswiseCheckedComponents,
//         sourceAClassWiseComponets,
//         sourceBClassWiseComponets);


//     $.ajax({
//         url: 'PHP/analyticsDetailsDataWriter.php',
//         type: "POST",
//         async: false,
//         data: { "AnalyticsDetailsData": JSON.stringify(analyticsDetailsData) },
//         success: function (data) {
//             // alert("success");
//         }
//     });

//     // post comparison data
//     if (comparisonCheckManager) {
//         $.ajax({
//             url: 'PHP/comparisonCheckpostDataWriter.php',
//             type: "POST",
//             async: false,
//             data: { "ComparisonCheckManager": JSON.stringify(comparisonCheckManager) },
//             success: function (data) {
//                 // alert("success");
//                 //$("#result").html(data);
//             }
//         });
//     }

//     // post source A compliance data
//     if (sourceAComplianceCheckManager) {
//         $.ajax({
//             url: 'PHP/sourceAComplianceDataWriter.php',
//               type: "POST",
//             async: false,
//             data: { "SourceAComplianceCheckManager": sourceAComplianceCheckManager.CheckComponentsGroupsData },
//             success: function (data) {
//                 //alert("success");
//                 //$("#result").html(data);
//             }
//         });
//     }

//     // post source B compliance data
//     if (sourceBComplianceCheckManager) {
//         $.ajax({
//             url: 'PHP/sourceBComplianceDataWriter.php',
//             type: "POST",
//             async: false,
//             data: { "SourceBComplianceCheckManager": JSON.stringify(sourceBComplianceCheckManager) },
//             success: function (data) {
//             }
//         });
//     }

//     // post source A viewer data
//     if (xCheckStudioInterface1) {
//         if (xCheckStudioInterface1.SourceType.toLowerCase() === "xml" ||
//             xCheckStudioInterface1.SourceType.toLowerCase() === "rvm" ||
//             xCheckStudioInterface1.SourceType.toLowerCase() === "sldasm" ||
//             xCheckStudioInterface1.SourceType.toLowerCase() === "dwg" ||
//             xCheckStudioInterface1.SourceType.toLowerCase() === "sldprt") {
//             //virewer container Data
//             var viewerOptions = [];
//             viewerOptions.push(xCheckStudioInterface1._firstViewer._params.containerId);
//             viewerOptions.push(xCheckStudioInterface1._firstViewer._params.endpointUri);

//             $.ajax({
//                 url: 'PHP/sourceAViewerDataWriter.php',
//                 type: "POST",
//                 async: false,
//                 data: {
//                     "SourceAViewerData": JSON.stringify(viewerOptions)
//                 },
//                 success: function (msg) {
//                         //alert("success");
//                         //$("#result").html(data);
//                     }
//             })

//             // postnode id and component data relation
//             if (xCheckStudioInterface1.nodeIdVsComponentData) {
//                 $.ajax({
//                     url: 'PHP/sourceANodeIdVsComponentDataWriter.php',
//                     type: "POST",
//                     async: false,
//                     data: { "SourceANodeIdVsComponentData": JSON.stringify(xCheckStudioInterface1.nodeIdVsComponentData) },
//                     success: function (data) {
//                         //alert("success");
//                         //$("#result").html(data);
//                     }
//                 });
//             }

//             if (xCheckStudioInterface1.componentIdVsComponentData) {
//                 $.ajax({
//                     url: 'PHP/sourceAComponentIdVsComponentDataWriter.php',
//                     type: "POST",
//                     async: false,
//                     data: { "sourceAComponentIdVsComponentData": JSON.stringify(xCheckStudioInterface1.componentIdVsComponentData) },
//                     success: function (data) {
//                         //alert("success");
//                         //$("#result").html(data);
//                     }
//                 });
//             }
//         }

//         else if (xCheckStudioInterface1.SourceType.toLowerCase() === "xls") {

//             $.ajax({
//                 url: 'PHP/SourceASheetDataWriter.php',
//                 type: "POST",
//                 async: false,
//                 data: { "SourceASheetData": JSON.stringify(xCheckStudioInterface1.excelReader.sourceDataSheet) },
//                 success: function (data) {
//                     //alert("success");
//                     //$("#result").html(data);
//                 }
//             });
//         }

//     }

//     if (xCheckStudioInterface2) {
//         if (xCheckStudioInterface2.SourceType.toLowerCase() === "xml" ||
//             xCheckStudioInterface2.SourceType.toLowerCase() === "rvm" ||
//             xCheckStudioInterface2.SourceType.toLowerCase() === "sldasm" ||
//             xCheckStudioInterface2.SourceType.toLowerCase() === "dwg" ||
//             xCheckStudioInterface1.SourceType.toLowerCase() === "sldprt") {
//             //virewer container Data
//             var viewerOptions = [];
//             viewerOptions.push(xCheckStudioInterface2._firstViewer._params.containerId);
//             viewerOptions.push(xCheckStudioInterface2._firstViewer._params.endpointUri);

//             $.ajax({
//                 url: 'PHP/sourceBViewerDataWriter.php',
//                 type: "POST",
//                 async: false,
//                 data: { "SourceBViewerData": JSON.stringify(viewerOptions) },
//                 success: function (data) {
//                     //alert("success");
//                     //$("#result").html(data);
//                 }
//             });


//             // postnode id and component data relation
//             if (xCheckStudioInterface2.nodeIdVsComponentData) {
//                 $.ajax({
//                     url: 'PHP/sourceBNodeIdVsComponentDataWriter.php',
//                     type: "POST",
//                     async: false,
//                     data: { "SourceBNodeIdVsComponentData": JSON.stringify(xCheckStudioInterface2.nodeIdVsComponentData) },
//                     success: function (data) {
//                         //alert("success");
//                         //$("#result").html(data);
//                     }
//                 });
//             }

//             if (xCheckStudioInterface2.componentIdVsComponentData) {
//                 $.ajax({
//                     url: 'PHP/sourceBComponentIdVsComponentDataWriter.php',
//                     type: "POST",
//                     async: false,
//                     data: { "sourceBComponentIdVsComponentData": JSON.stringify(xCheckStudioInterface2.componentIdVsComponentData) },
//                     success: function (data) {
//                         //alert("success");
//                         //$("#result").html(data);
//                     }
//                 });
//             }

//         }

//         else if (xCheckStudioInterface2.SourceType.toLowerCase() === "xls") {

//             $.ajax({
//                 url: 'PHP/SourceBSheetDataWriter.php',
//                 type: "POST",
//                 async: false,
//                 data: { "SourceBSheetData": JSON.stringify(xCheckStudioInterface2.excelReader.sourceDataSheet) },
//                 success: function (data) {
//                     //alert("success");
//                     //$("#result").html(data);
//                 }
//             });
//         }
//     }
// }

function CreateNewTab() {
    var parent = document.getElementById("tab2Parent");
    parent.style.display = "block";
    var tab2 = document.getElementById("tab2");
    tab2.style.display = "block";
    tab2.style.backgroundColor = "#F3F0F4";

    //modelbrowser2
    var dataSourceTab = document.getElementById("dataSource2");
    dataSourceTab.style.display = "block";

    var parentViewer = document.getElementById("tab2ViewerParent");
    parentViewer.style.display = "block";
    var tab2Viewer = document.getElementById("tab2Viewer");
    tab2Viewer.style.display = "block";
    tab2Viewer.style.backgroundColor = "#F3F0F4";
    //viewerContainer2
    var viewerContainer2 = document.getElementById("viewerContainer2")
    viewerContainer2.style.display = "block";
    var elementCountTab = document.getElementById("SourceBComponentCount");
    elementCountTab.style.display = "block";

    //tab1
    var tab2 = document.getElementById("tab1");
    tab2.style.display = "block";
    tab2.style.backgroundColor = "lightgray";
    //viewertab
    var tab1Viewer = document.getElementById("tab1Viewer");
    tab1Viewer.style.display = "block";
    tab1Viewer.style.backgroundColor = "lightgray";
    //modelBrowser1
    var dataSource1Tab = document.getElementById("modelTree1");
    dataSource1Tab.style.display = "none";
    //viewerContainer1
    var viewerContainer1 = document.getElementById("viewerContainer1")
    viewerContainer1.style.display = "none";
    //count
    var elementCountTab = document.getElementById("SourceAComponentCount");
    elementCountTab.style.display = "none";


    if (currentViewer) {

        stopExplode();
        currentViewer = undefined;
    }
}

function readExcelDataSource(file,
    viewerContainer,
    modelTreeContainer) {

    let fileName = file.name;
    var fileExtension = xCheckStudio.Util.getFileExtension(fileName);

    if (!xCheckStudioInterface1) {
        xCheckStudioInterface1 = new xCheckStudio.xCheckStudioInterface(fileExtension);
        xCheckStudioInterface1.readExcelFileData(file, modelTreeContainer);
    }
    else {
        xCheckStudioInterface2 = new xCheckStudio.xCheckStudioInterface(fileExtension);
        xCheckStudioInterface2.readExcelFileData(file, modelTreeContainer);
    }
}

//open windows file selector dialog
function OnLoadClick(isFirstDataSource) {
    var modal;
    var modalMaximizeViewer;
    if (isFirstDataSource === "true") {
        // get first source type
        if (checkCaseManager === undefined ||
            checkCaseManager.CheckCase === undefined ||
            checkCaseManager.CheckCase.CheckTypes === undefined ||
            checkCaseManager.CheckCase.CheckTypes.length === 0) {
            return;
        }

        modal = document.getElementById('projectselectiondialogModal');
        modalMaximizeViewer = document.getElementById('maximizeViewerContainer');
        // When the user clicks the button, open the modal 
        modal.style.display = "block";
        document.getElementById("projectselectiondialog-content").innerHTML = "";
        $('#loaddatadialog').clone().appendTo('#projectselectiondialog-content');

        var loadDataDialogContent = document.getElementsByClassName("loaddatadialog2")[0];
        var browseDivContent = loadDataDialogContent.getElementsByClassName("browse")[0];
        var formContent = browseDivContent.getElementsByTagName("form")[0];
        formContent.id = "uploadDatasourceAForm";
        var inputContent = formContent.getElementsByTagName("input")[0];
        var onchnageString = "loadDataSource(event, 'file-input', 'uploadDatasourceAForm', 'viewerContainer1', 'modelTree1')";
        inputContent.setAttribute("onchange", onchnageString);

        // enable source a controls
        // diable check all CB for source A
        var component = document.querySelector('.module1 .group1 .checkallswitch .toggle-KJzr');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // diable compliance CB for source A
        component = document.querySelector('.module1 .group1 .complianceswitch .toggle-Hm8P');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // enable source B, load button
        component = document.getElementById('createbtnB');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // enable drop zone for source B
        enableDropZone("dropZone2");

        // enable check button
        component = document.getElementById('checkButton');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // enable info  button
        component = document.getElementById('infobtn');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }
    }
    else if (isFirstDataSource === "false") {
        // get second source type
        if (checkCaseManager === undefined ||
            checkCaseManager.CheckCase === undefined ||
            checkCaseManager.CheckCase.CheckTypes === undefined ||
            checkCaseManager.CheckCase.CheckTypes.length === 0) {
            return;
        }

        modal = document.getElementById('projectselectiondialogModal');
        modalMaximizeViewer = document.getElementById('maximizeViewerContainer');
        // When the user clicks the button, open the modal 
        modal.style.display = "block";
        document.getElementById("projectselectiondialog-content").innerHTML = "";
        $('#loaddatadialog').clone().appendTo('#projectselectiondialog-content');
        var loadDataDialogContent = document.getElementsByClassName("loaddatadialog2")[0];
        var browseDivContent = loadDataDialogContent.getElementsByClassName("browse")[0];
        var formContent = browseDivContent.getElementsByTagName("form")[0];
        formContent.id = "uploadDatasourceBForm";
        var inputContent = formContent.getElementsByTagName("input")[0];
        var onchnageString = "loadDataSource(event, 'file-input', 'uploadDatasourceBForm', 'viewerContainer2', 'modelTree2')"
        inputContent.setAttribute("onchange", onchnageString);

        // enable source B controls
        // enable check all CB for source B
        component = document.querySelector('.module1 .group2 .checkallswitch .toggle-KJzr2');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // enable compliance CB for source B
        component = document.querySelector('.module1 .group2 .complianceswitch .toggle-Hm8P2');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }

        // enable comparison switch
        component = document.querySelector('.module1 .group31 .comparisonswitch .toggle-2udj');
        if (component.classList.contains("disabledbutton")) {
            component.classList.remove('disabledbutton');
        }
    }
}

window.onclick = function (event) {
    if (event.target.id == "projectselectiondialogModal") {
        document.getElementById('projectselectiondialogModal').style.display = "none";
    }

    if (event.target.id == "maximizeViewerContainer") {
        returnViewer(maximizedViewerData);
        document.getElementById('maximizeViewerContainer').style.display = "none";
    }
    var closebutton = document.getElementById("closeLoadDialog");
    if (event.target === closebutton) {
        document.getElementById('projectselectiondialogModal').style.display = "none";
    }
    var i = document.getElementById("menu").style;
    if (i.visibility === "visible") {
        i.visibility = "hidden";        
    }
}

function loadDataSource(event,
    dataSource,
    formId,
    viewerContainer,
    modelTreeContainer) {

    if (!checkCaseManager ||
        !checkCaseManager.CheckCase) {
        alert("CheckCaseManager not found.");
        document.getElementById(formId).reset();
        return;
    }
    var modal = document.getElementById('projectselectiondialogModal');
    modal.style.display = "none";

    let selectedFiles = document.getElementById(dataSource).files;
    let selectedFilesCount = selectedFiles.length;
    if (selectedFilesCount == 0) {
        document.getElementById(formId).reset();
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "PHP/getSourceData.php", true);
    xhr.onload = function (data) {
        if (data.target.response === "undefined") {
            OnShowToast('Valid data source not found');
            return;
        }
        else{
            addTabHeaders(modelTreeContainer, data.target.response);
            var fileExtension = xCheckStudio.Util.getFileExtension(data.target.response).toLowerCase();
            uploadAndLoadModel(fileExtension, 
                              data.target.response,
                              viewerContainer, 
                              modelTreeContainer, 
                              dataSource, 
                              formId, 
                              event.target.files);
        }
    };
    var formData = new FormData(document.getElementById(formId));
    xhr.send(formData);
}

function addTabHeaders(modelTreeContainer, fileName){
    var tabHeader;
    if (modelTreeContainer === "modelTree1") {
        tabHeader = document.getElementById("dataSource1ModelBrowserTab");
        localStorage.setItem("SourceAName", fileName);
        sourceAFileName = fileName;
        document.getElementById("dataSource1ViewerContainerTab").innerText = fileName;
    }
    else if (modelTreeContainer === "modelTree2") {
        tabHeader = document.getElementById("dataSource2ModelBrowserTab");
        localStorage.setItem("SourceBName", fileName);
        sourceBFileName = fileName;
        document.getElementById("dataSource2ViewerContainerTab").innerText = fileName;
    }
    tabHeader.innerText = fileName;
}

function uploadAndLoadModel(fileExtension, fileName,viewerContainer, modelTreeContainer, dataSource, formId, files)
{
    if (fileExtension.toLowerCase() === "xml" ||
        fileExtension.toLowerCase() === "rvm" ||
        fileExtension.toLowerCase() === "sldasm" ||
        fileExtension.toLowerCase() === "dwg" ||
        fileExtension.toLowerCase() === "sldprt" ||
        fileExtension.toLowerCase() === "rvt" ||
        fileExtension.toLowerCase() === "rfa") {

        var busySpinner = document.getElementById("divLoading");
        busySpinner.className = 'show';

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "uploads/uploadfiles.php", true);
        xhr.onload = function (event) {
            if (fileExtension.toLowerCase() === "json") {
                    if (loadDbDataSource(fileExtension,
                    files,
                    viewerContainer,
                    modelTreeContainer)) {
                    hideLoadButton(modelTreeContainer);
                }
           }
            else {
                loadModel(fileName, 
                        viewerContainer, 
                        modelTreeContainer);  
            }         
          
            busySpinner.classList.remove('show')
        };
        var formData = new FormData(document.getElementById(formId));
        formData.append('viewerContainer', viewerContainer);
        xhr.send(formData);

    }
    else if (fileExtension.toLowerCase() === "xls") {
        {
            if (loadExcelDataSource(fileExtension,
                files,
                viewerContainer,
                modelTreeContainer)) {
                hideLoadButton(modelTreeContainer);
            }
        }
    }
    // else if (fileExtension.toLowerCase() === "json") {
    //     {
    //         if (loadDbDataSource(fileExtension,
    //             files,
    //             viewerContainer,
    //             modelTreeContainer)) {
    //             hideLoadButton(modelTreeContainer);
    //         }
    //     }
    // }
}

function hideLoadButton(modelTreeContainer) {
    if (modelTreeContainer === "modelTree1") {
        document.getElementById("createbtnA").style.display = "none";
        document.getElementById("loadDataA").style.display = "none";
    }
    else if (modelTreeContainer === "modelTree2") {
        document.getElementById("createbtnB").style.display = "none";
        document.getElementById("loadDataB").style.display = "none";
    }
}

function loadExcelDataSource(fileExtension,
    file,
    viewerContainer,
    modelTreeContainer) {
    if (!checkCaseManager ||
        !checkCaseManager.CheckCase) {
        alert("CheckCaseManager not found.");
        return false;
    }

    var sourceAType;
    var sourceBType;
    for (var i = 0; i < checkCaseManager.CheckCase.CheckTypes.length; i++) {
        var checkType = checkCaseManager.CheckCase.CheckTypes[i];
        if (checkType.Name.toLowerCase() === "comparison") {
            sourceAType = checkType.SourceAType;
            sourceBType = checkType.SourceBType;
        }
        else if (checkType.Name.toLowerCase() === "compliance") {
            sourceAType = checkType.SourceAType;
        }
    }

    if (viewerContainer === "viewerContainer1") {
        if (!sourceAType ||
            sourceAType.toLowerCase() !== fileExtension.toLowerCase()) {
            alert("Data source type doesn't match with check case.");
            return false;
        }
    }
    else if (viewerContainer === "viewerContainer2") {
        if (!sourceBType ||
            sourceBType.toLowerCase() !== fileExtension.toLowerCase()) {
            alert("Data source type doesn't match with check case.");
            return false;
        }
    }
    readExcelDataSource(file[0],
        viewerContainer,
        modelTreeContainer);

    return true;

}

function loadModel(fileName,
    viewerContainer,
    modelTreeContainer) {

    if (!checkCaseManager ||
        !checkCaseManager.CheckCase) {
        alert("CheckCaseManager not found.");
        return false;
    }
   
    var fileExtension = xCheckStudio.Util.getFileExtension(fileName).toLowerCase();

    var sourceAType;
    var sourceBType;
    for (var i = 0; i < checkCaseManager.CheckCase.CheckTypes.length; i++) {
        var checkType = checkCaseManager.CheckCase.CheckTypes[i];
        if (checkType.Name.toLowerCase() === "comparison") {
            sourceAType = checkType.SourceAType;
            sourceBType = checkType.SourceBType;
        }
        else if (checkType.Name.toLowerCase() === "compliance") {
            sourceAType = checkType.SourceAType;
        }
    }

    if (viewerContainer === "viewerContainer1") {
        if (!sourceAType ||
            sourceAType.toLowerCase() !== fileExtension.toLowerCase()) {
            alert("Data source type doesn't match with check case.");
            return false;
        }
    }
    else if (viewerContainer === "viewerContainer2") {
        if (!sourceBType ||
            sourceBType.toLowerCase() !== fileExtension.toLowerCase()) {
            alert("Data source type doesn't match with check case.");
            return false;
        }
    }

    // get SCS file path and load model into viewer
    fileName = fileName.substring(0, fileName.lastIndexOf('.'));

    $.ajax({
        data: { 'viewerContainer': viewerContainer, 'fileName' : fileName, 'dataSourceType' : '3D'},
        type: "POST",
        url: "PHP/GetSourceFilePath.php"
    }).done(function (uri) {
        if (uri !== 'fail') {

            // uri contains SCS file path, so load
            xCheckStudio.Util.fileExists(uri).then(function (success) {
                if (success) {
                   
                    viewerOptions = {
                        containerId: viewerContainer,
                        endpointUri: uri,
                        modelTree: modelTreeContainer
                    };

                    if (viewerContainer === "viewerContainer1") {
                        xCheckStudioInterface1 = new xCheckStudio.xCheckStudioInterface(fileExtension);
                        xCheckStudioInterface1.setupViewer(viewerOptions, true);
                    }
                    else if (viewerContainer === "viewerContainer2") {
                        xCheckStudioInterface2 = new xCheckStudio.xCheckStudioInterface(fileExtension);
                        xCheckStudioInterface2.setupViewer(viewerOptions, false);
                    }

                    manageControlsOnDatasourceLoad(fileName, viewerContainer, modelTreeContainer); 
                    return true;
                }
                else {
                    document.getElementById(formId).reset();
                    alert("File not found to load.");
                    return false;
                }
            });
        }
        else {
            document.getElementById(formId).reset();
            return false;
        }

    });            

    return true;
}

function checkAllCBClick(checkBox, modelTreeContainer, checkBoxId) {

    var modelTreeContainerElement = document.getElementById(modelTreeContainer);
    if (!modelTreeContainerElement) {
        return;
    }

    var modelTreeHeaderDiv = modelTreeContainerElement.children[0];
    if (!modelTreeHeaderDiv) {
        return;
    }

    var modelBrowserTable = modelTreeContainerElement.children[1];
    if (!modelBrowserTable) {
        return;
    }

    var modelBrowserTableRows = modelBrowserTable.getElementsByTagName("tr");
    // var currentTable = modelTreeParentDiv.children[0];

    for (var i = 0; i < modelBrowserTableRows.length; i++) {
        var row = modelBrowserTableRows[i];

        var currentCheckBox = row.cells[0].children[0];
        if (!currentCheckBox) {
            continue;
        }

        if (checkBox === currentCheckBox.checked) {
            continue;
        }

        currentCheckBox.checked = checkBox;
        if (currentCheckBox.checked) {
            var checkedComponent;

            if (xCheckStudioInterface1 && modelTreeContainer === "modelTree1") {
                if (xCheckStudioInterface1.SourceType.toLowerCase() === "xml" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "rvm" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "sldasm" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "dwg" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "sldprt") {

                    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(xCheckStudioInterface1.SourceType,
                        row.cells[modelBrowserMainClassColumn].textContent.trim());

                    var checkedComponent = {};

                    checkedComponent[identifierProperties.name] = row.cells[modelBrowserComponentColumn].textContent.trim();
                    checkedComponent[identifierProperties.mainCategory] = row.cells[modelBrowserMainClassColumn].textContent.trim();
                    checkedComponent[identifierProperties.subClass] = row.cells[modelBrowserSubClassColumn].textContent.trim();
                                              
                    checkedComponent["NodeId"] = row.cells[modelBrowserNodeIdColumn].textContent.trim();

                    if (checkBoxId === "checkAllSourceACB" &&
                        xCheckStudioInterface1 &&
                        !xCheckStudioInterface1._modelTree.selectedCompoentExists(row)) {
                        xCheckStudioInterface1._modelTree.selectedCompoents.push(checkedComponent);
                    }
                }
                else if (xCheckStudioInterface1.SourceType.toLowerCase() === "xls") {
                    checkedComponent = {
                        'Name': row.cells[1].textContent.trim(),
                        'MainComponentClass': row.cells[2].textContent.trim(),
                        'ComponentClass': row.cells[3].textContent.trim(),
                        'Description': row.cells[4].textContent.trim()
                    };

                    if (checkBoxId === "checkAllSourceACB" &&
                        xCheckStudioInterface1 &&
                        !xCheckStudioInterface1.excelReader.excelModelBrowser.selectedCompoentExists(row)) {
                        xCheckStudioInterface1.excelReader.excelModelBrowser.selectedCompoents.push(checkedComponent);
                    }
                }

            }
            if (xCheckStudioInterface2 && modelTreeContainer === "modelTree2") {
                if (xCheckStudioInterface2.SourceType.toLowerCase() === "xml" ||
                    xCheckStudioInterface2.SourceType.toLowerCase() === "rvm" ||
                    xCheckStudioInterface2.SourceType.toLowerCase() === "sldasm" ||
                    xCheckStudioInterface2.SourceType.toLowerCase() === "dwg" ||
                    xCheckStudioInterface2.SourceType.toLowerCase() === "sldprt") {

                    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(xCheckStudioInterface2.SourceType,
                        row.cells[modelBrowserMainClassColumn].textContent.trim());
                    var checkedComponent = {};
                    checkedComponent[identifierProperties.name] = row.cells[modelBrowserComponentColumn].textContent.trim();
                    checkedComponent[identifierProperties.mainCategory] = row.cells[modelBrowserMainClassColumn].textContent.trim();
                    checkedComponent[identifierProperties.subClass] = row.cells[modelBrowserSubClassColumn].textContent.trim();

                    checkedComponent["NodeId"] = row.cells[modelBrowserNodeIdColumn].textContent.trim();

                    if (checkBoxId === "checkAllSourceBCB" &&
                        xCheckStudioInterface2 &&
                        !xCheckStudioInterface2._modelTree.selectedCompoentExists(row)) {
                        xCheckStudioInterface2._modelTree.selectedCompoents.push(checkedComponent);
                    }
                }
                else if (xCheckStudioInterface2.SourceType.toLowerCase() === "xls") {
                    checkedComponent = {
                        'Name': row.cells[1].textContent.trim(),
                        'MainComponentClass': row.cells[2].textContent.trim(),
                        'ComponentClass': row.cells[3].textContent.trim(),
                        'Description': row.cells[4].textContent.trim()
                    };

                    if (checkBoxId === "checkAllSourceBCB" &&
                        xCheckStudioInterface2 &&
                        !xCheckStudioInterface2.excelReader.excelModelBrowser.selectedCompoentExists(row)) {
                        xCheckStudioInterface2.excelReader.excelModelBrowser.selectedCompoents.push(checkedComponent);
                    }
                }
            }
        }
    }

    if (!checkBox) {
        if (checkBoxId === "checkAllSourceACB" &&
            xCheckStudioInterface1) {
            if (xCheckStudioInterface1.SourceType.toLowerCase() === "xml") {
                xCheckStudioInterface1._modelTree.selectedCompoents = [];
            }
            else if (xCheckStudioInterface1.SourceType.toLowerCase() === "xls") {
                xCheckStudioInterface1.excelReader.excelModelBrowser.selectedCompoents = [];
            }

        }
        else if (checkBoxId === "checkAllSourceBCB" &&
            xCheckStudioInterface2) {
            if (xCheckStudioInterface2.SourceType.toLowerCase() === "xml") {
                xCheckStudioInterface2._modelTree.selectedCompoents = [];
            }
            else if (xCheckStudioInterface2.SourceType.toLowerCase() === "xls") {
                xCheckStudioInterface2.excelReader.excelModelBrowser.selectedCompoents = [];
            }
        }
    }
}

function loadDbDataSource(fileExtension,
    file,
    viewerContainer,
    modelTreeContainer) {
    if (!checkCaseManager ||
        !checkCaseManager.CheckCase) {
        alert("CheckCaseManager not found.");
        return false;
    }

    var sourceAType;
    var sourceBType;
    for (var i = 0; i < checkCaseManager.CheckCase.CheckTypes.length; i++) {
        var checkType = checkCaseManager.CheckCase.CheckTypes[i];
        if (checkType.Name.toLowerCase() === "comparison") {
            sourceAType = checkType.SourceAType;
            sourceBType = checkType.SourceBType;
        }
        else if (checkType.Name.toLowerCase() === "compliance") {
            sourceAType = checkType.SourceAType;
        }
    }

    if (viewerContainer === "viewerContainer1") {
        if (!sourceAType ||
            sourceAType.toLowerCase() !== fileExtension.toLowerCase()) {
            alert("Data source type doesn't match with check case.");
            return false;
        }
    }
    else if (viewerContainer === "viewerContainer2") {
        if (!sourceBType ||
            sourceBType.toLowerCase() !== fileExtension.toLowerCase()) {
            alert("Data source type doesn't match with check case.");
            return false;
        }
    }
        var fileName = file[0].name.substring(0, file[0].name.lastIndexOf('.'));
        $.ajax({
            data: { 'viewerContainer': viewerContainer, 'fileName' : fileName, 'dataSourceType' : '1D' },
            type: "POST",
            url: "PHP/GetSourceFilePath.php"
        }).done(function (uri) {
            if (uri !== 'fail') {
                xCheckStudio.Util.fileExists(uri).then(function (success) {
                    if (success) {
                        readDbDataSource(file[0],
                            viewerContainer,
                            modelTreeContainer);
                }
                else {
                    document.getElementById(formId).reset();
                    alert("File not found to load.");
                    return false;
                }
            });
        }
        else {
            document.getElementById(formId).reset();
            return false;
        }
    });
   
    return true;

}

function readDbDataSource(file,
    viewerContainer,
    modelTreeContainer) {

    let fileName = file.name;
    var fileExtension = xCheckStudio.Util.getFileExtension(fileName);
    var categoryPresent = false;

    // if (!xCheckStudioInterface1) {
    //     xCheckStudioInterface1 = new xCheckStudio.xCheckStudioInterface(fileExtension);
    //     xCheckStudioInterface1.readDbFileData(file, modelTreeContainer);
    // }
    // else {
    //     xCheckStudioInterface2 = new xCheckStudio.xCheckStudioInterface(fileExtension);
    //     xCheckStudioInterface2.readDbFileData(file, modelTreeContainer);
    // }
    Db_data = new Array();
    $.ajax({
        url:'PHP/PDOConnectionForDatabases.php',
        type:'POST',
        dataType: 'JSON',
        data: ({functionality : 'importData'}),
        async: false,
        success: function (data) {                   
            Db_data = data;
        },
        error: function(xhr, status, error) {
            console.log(error)
        },
    });
    if (!xCheckStudioInterface1) {
        xCheckStudioInterface1 = new xCheckStudio.xCheckStudioInterface(fileExtension);
        xCheckStudioInterface1.readDbFileData(Db_data, modelTreeContainer, viewerContainer);
    }
    else {
        xCheckStudioInterface2 = new xCheckStudio.xCheckStudioInterface(fileExtension);
        xCheckStudioInterface2.readDbFileData(Db_data, modelTreeContainer, viewerContainer);
    }
    
}

function postData(url, method) {
    // remove post data js files from server from earlier check results, if any
    // $.ajax({
    //     data: '',
    //     url: 'postData/postDataCleaner.php',
    //     method: 'POST', // or GET
    //     async: false,
    //     success: function (msg) {
    //         //alert('Post Data files deleted');
    //     }
    // });

    checkCaseName = checkCaseManager.CheckCase.Name;

    var sourceAClasswiseCheckedComponents = 0;
    var sourceBClasswiseCheckedComponents = 0;

    var sourceAModelTree;
    var sourceBModelTree;
    if (xCheckStudioInterface1) {
        sourceAModelTree = xCheckStudioInterface1.getModelBrowser();
        sourceAClasswiseCheckedComponents = sourceAModelTree.getClassWiseCheckedComponents(xCheckStudioInterface1.SourceType);
    }

    if (xCheckStudioInterface2) {
        sourceBModelTree = xCheckStudioInterface2.getModelBrowser();
        sourceBClasswiseCheckedComponents = sourceBModelTree.getClassWiseCheckedComponents(xCheckStudioInterface2.SourceType);
    }

    var sourceAClassWiseComponets = 0;
    var sourceBClassWiseComponets = 0;

    if (sourceAModelTree) {
        var count = sourceAModelTree.selectedCompoents.length;
        sourceACheckedItemCount = count > 0 ? count : 0;
        sourceAClassWiseComponets = xCheckStudioInterface1.getClassWiseComponents();
    }
    if (sourceBModelTree) {
        var count = sourceBModelTree.selectedCompoents.length;
        sourceBCheckedItemCount = count > 0 ? count : 0;
        sourceBClassWiseComponets = xCheckStudioInterface2.getClassWiseComponents();
        // sourceBClasswiseCheckedComponents = sourceBModelTree.getClassWiseCheckedComponents();
    }

    var analyticsDetailsData = new AnalyticsData(checkCaseName,
        sourceAFileName,
        sourceBFileName,
        sourceATotalItemCount,
        sourceACheckedItemCount,
        sourceBTotalItemCount,
        sourceBCheckedItemCount,
        sourceAClasswiseCheckedComponents,
        sourceBClasswiseCheckedComponents,
        sourceAClassWiseComponets,
        sourceBClassWiseComponets);


    $.ajax({
        url: 'PHP/analyticsDetailsDataWriter.php',
        type: "POST",
        async: true,
        data: { "AnalyticsDetailsData": JSON.stringify(analyticsDetailsData) },
        success: function (data) {
            // alert("success");
        }
    });

    // post comparison data
    // if (comparisonCheckManager) {
    //     $.ajax({
    //         url: 'PHP/comparisonCheckpostDataWriter.php',
    //         type: "POST",
    //         async: false,
    //         data: { "ComparisonCheckManager": JSON.stringify(comparisonCheckManager) },
    //         success: function (data) {
    //             // alert("success");
    //             //$("#result").html(data);
    //         }
    //     });
    // }

    // // post source A compliance data
    // if (sourceAComplianceCheckManager) {
    //     $.ajax({
    //         url: 'PHP/sourceAComplianceDataWriter.php',
    //   		type: "POST",
    //         async: false,
    //         data: { "SourceAComplianceCheckManager": sourceAComplianceCheckManager.CheckComponentsGroupsData },
    //         success: function (data) {
    //             //alert("success");
    //             //$("#result").html(data);
    //         }
    //     });
    // }

    // // post source B compliance data
    // if (sourceBComplianceCheckManager) {
    //     $.ajax({
    //         url: 'PHP/sourceBComplianceDataWriter.php',
    //         type: "POST",
    //         async: false,
    //         data: { "SourceBComplianceCheckManager": JSON.stringify(sourceBComplianceCheckManager) },
    //         success: function (data) {
    //         }
    //     });
    // }

    // post source A viewer data
    var sourceANodeIdvsComponentIdList;
    var sourceASelectedComponents;
    var sourceBNodeIdvsComponentIdList;
    var sourceBSelectedComponents;

    if (xCheckStudioInterface1) {
        if (xCheckStudioInterface1.SourceType.toLowerCase() === "xml" ||
            xCheckStudioInterface1.SourceType.toLowerCase() === "rvm" ||
            xCheckStudioInterface1.SourceType.toLowerCase() === "sldasm" ||
            xCheckStudioInterface1.SourceType.toLowerCase() === "dwg" ||
            xCheckStudioInterface1.SourceType.toLowerCase() === "sldprt") {
            //virewer container Data
            var viewerOptions = [];
            viewerOptions.push(xCheckStudioInterface1._firstViewer._params.containerId);
            viewerOptions.push(xCheckStudioInterface1._firstViewer._params.endpointUri);

            // write viewer options data to data base
            $.ajax({
                url: 'PHP/ViewerOptionsWriter.php',
                type: "POST",
                async: true,
                data:
                {
                    "SourceViewerOptions": JSON.stringify(viewerOptions),
                    "SourceViewerOptionsTable": "SourceAViewerOptions"
                },
                success: function (msg) {
                    //alert("success");
                    //$("#result").html(data);
                }
            });

            sourceANodeIdvsComponentIdList =  xCheckStudioInterface1.NodeIdvsComponentIdList;
            sourceASelectedComponents = xCheckStudioInterface1.getModelBrowser().selectedCompoents;

            
            // postnode id and component data relation
            // if (xCheckStudioInterface1.nodeIdVsComponentData) {
            //     $.ajax({
            //         url: 'PHP/sourceANodeIdVsComponentDataWriter.php',
            //         type: "POST",
            //         async: false,
            //         data: { "SourceANodeIdVsComponentData": JSON.stringify(xCheckStudioInterface1.nodeIdVsComponentData) },
            //         success: function (data) {
            //             //alert("success");
            //             //$("#result").html(data);
            //         }
            //     });
            // }

            // if (xCheckStudioInterface1.componentIdVsComponentData) {
            //     $.ajax({
            //         url: 'PHP/sourceAComponentIdVsComponentDataWriter.php',
            //         type: "POST",
            //         async: false,
            //         data: { "sourceAComponentIdVsComponentData": JSON.stringify(xCheckStudioInterface1.componentIdVsComponentData) },
            //         success: function (data) {
            //             //alert("success");
            //             //$("#result").html(data);
            //         }
            //     });
            // }
        }
        else if (xCheckStudioInterface1.SourceType.toLowerCase() === "xls") {
            $.ajax({
                url: 'PHP/SourceASheetDataWriter.php',
                type: "POST",
                async: true,
                data: { "SourceASheetData": JSON.stringify(xCheckStudioInterface1.excelReader.sourceDataSheet) },
                success: function (data) {
                    //alert("success");
                    //$("#result").html(data);
                }
            });
        }     
      
 }

    if (xCheckStudioInterface2) {
        if (xCheckStudioInterface2.SourceType.toLowerCase() === "xml" ||
            xCheckStudioInterface2.SourceType.toLowerCase() === "rvm" ||
            xCheckStudioInterface2.SourceType.toLowerCase() === "sldasm" ||
            xCheckStudioInterface2.SourceType.toLowerCase() === "dwg" ||
            xCheckStudioInterface1.SourceType.toLowerCase() === "sldprt") {

            //virewer container Data
            var viewerOptions = [];
            viewerOptions.push(xCheckStudioInterface2._firstViewer._params.containerId);
            viewerOptions.push(xCheckStudioInterface2._firstViewer._params.endpointUri);

            // write viewer options data to data base
            $.ajax({
                url: 'PHP/ViewerOptionsWriter.php',
                type: "POST",
                async: true,
                data:
                {
                    "SourceViewerOptions": JSON.stringify(viewerOptions),
                    "SourceViewerOptionsTable": "SourceBViewerOptions"
                },
                success: function (msg) {
                    //alert("success");
                    //$("#result").html(data);
                }
            });


            sourceBNodeIdvsComponentIdList =  xCheckStudioInterface2.NodeIdvsComponentIdList;
            sourceBSelectedComponents = xCheckStudioInterface2.getModelBrowser().selectedCompoents;

            // // postnode id and component data relation
            // if (xCheckStudioInterface2.nodeIdVsComponentData) {
            //     $.ajax({
            //         url: 'PHP/sourceBNodeIdVsComponentDataWriter.php',
            //         type: "POST",
            //         async: false,
            //         data: { "SourceBNodeIdVsComponentData": JSON.stringify(xCheckStudioInterface2.nodeIdVsComponentData) },
            //         success: function (data) {
            //             //alert("success");
            //             //$("#result").html(data);
            //         }
            //     });
            // }

            // if (xCheckStudioInterface2.componentIdVsComponentData) {
            //     $.ajax({
            //         url: 'PHP/sourceBComponentIdVsComponentDataWriter.php',
            //         type: "POST",
            //         async: false,
            //         data: { "sourceBComponentIdVsComponentData": JSON.stringify(xCheckStudioInterface2.componentIdVsComponentData) },
            //         success: function (data) {
            //             //alert("success");
            //             //$("#result").html(data);
            //         }
            //     });
            // }

        }
        else if (xCheckStudioInterface2.SourceType.toLowerCase() === "xls") {

            $.ajax({
                url: 'PHP/SourceBSheetDataWriter.php',
                type: "POST",
                async: true,
                data: { "SourceBSheetData": JSON.stringify(xCheckStudioInterface2.excelReader.sourceDataSheet) },
                success: function (data) {
                    //alert("success");
                    //$("#result").html(data);
                }
            });
        }
    }

    // write source A selected components, differet control statuses to DB        
    $.ajax({
        url: 'PHP/ProjectDatawriter.php',
        type: "POST",
        async: true,
        data:
        {
            "SourceANodeIdvsComponentIdList": JSON.stringify(sourceANodeIdvsComponentIdList),
            "SourceASelectedComponents": JSON.stringify(sourceASelectedComponents),
            "SourceBNodeIdvsComponentIdList": JSON.stringify(sourceBNodeIdvsComponentIdList),
            "SourceBSelectedComponents": JSON.stringify(sourceBSelectedComponents)
        },
        success: function (msg) 
        {
            //alert("success");
            //$("#result").html(data);
        }
    });
}