var AllSelectedComponenets;
var loadSavedProject = false;
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

function onCheckButtonClick() {
    var busySpinner = document.getElementById("divLoading");
    busySpinner.className = 'show';

    sourceAComplianceCheckManager = undefined;
    sourceBComplianceCheckManager = undefined;
    comparisonCheckManager = undefined;

    var checkCaseSelect = document.getElementById("checkCaseSelect");
    if (checkCaseSelect.value === "None") {
        // hide busy spinner
        busySpinner.classList.remove('show');
        //alert("Please select check case from list.")
        OnShowToast('Please select check case from list.');
        return;
    }

    // check if any check case type is selected
    var comparisonCB = document.querySelector('.module1 .group31 .comparisonswitch .toggle-2udj');
    var complianceSourceACB = document.querySelector('.module1 .group1 .complianceswitch .toggle-Hm8P');
    var complianceSourceBCB = document.querySelector('.module1 .group2 .complianceswitch .toggle-Hm8P2');
    
    // check if one of the check switch is on
    if (!comparisonCB.classList.contains("state2") &&
        !complianceSourceACB.classList.contains("state1") &&
        !complianceSourceBCB.classList.contains("state1")) {
        // hide busy spinner
        busySpinner.classList.remove('show');
        OnShowToast('No selected check type found.</br>Please select check type.');        
        return;
    }

    //var checkPerformed = false;  
    var checkcase = new CheckCase("");
    checkcase.CheckTypes = checkCaseManager.CheckCase.CheckTypes;
    var dataSourceOrderMaintained = checkCaseManager.OrderMaintained;
    
    //var comparisonPerformed = false;
    // var sourceACompliancePerformed = false;
    // var sourceBCompliancePerformed = false;

    // perform comparison check
    var comparisonPerformed = performComparisonCheck(comparisonCB, 
                                                     checkcase, 
                                                     dataSourceOrderMaintained);
    
    // perform source a compliance check                      
    var sourceACompliancePerformed = performSourceAComplianceCheck(complianceSourceACB, checkcase, dataSourceOrderMaintained);

    // perform source b compliance check                      
    var sourceBCompliancePerformed = performSourceBComplianceCheck(complianceSourceBCB, checkcase, dataSourceOrderMaintained );


    // if  source a compliance check is not performed, then delete the comparison result tables from project database if already exists.
    if (!comparisonPerformed) {
        deleteCheckResultsFromDB("Comparison").then(function (result) {

        });
    }

    // if comparison check is not performed, then delete the comparison result tables from project database if already exists.
    if (!sourceACompliancePerformed) {
        deleteCheckResultsFromDB("SourceACompliance").then(function (result) {

        });
    }
    // if source b compliance check is not performed, then delete the comparison result tables from project database if already exists.
    if (!sourceBCompliancePerformed) {
        deleteCheckResultsFromDB("SourceBCompliance").then(function (result) {

        });
    }

    // if (xCheckStudioInterface1 && 
    //     xCheckStudioInterface2 && 
    //     comparisonCB.classList.contains("state2")) {

    //     var sourceAModelBrowser = xCheckStudioInterface1.getModelBrowser();
    //     var sourceBModelBrowser = xCheckStudioInterface2.getModelBrowser();
    //     if (!sourceAModelBrowser || !sourceBModelBrowser) {
    //         OnShowToast('Comparison check can not be performed.');
    //     }

    //     // check if there are no selected components
    //     if (sourceAModelBrowser.selectedCompoents.length === 0 &&
    //         sourceBModelBrowser.selectedCompoents.length === 0) {
    //         //alert("Comparison check can not be performed.\nNo selected components found for both data sources.");
    //         OnShowToast('Comparison check can not be performed.</br>No selected components found for both data sources.');
    //         //return;
    //     }

    //     checkType = checkcase.getCheckType("Comparison");

    //     if (!comparisonCheckManager) {
    //         comparisonCheckManager = new CheckManager();
    //         comparisonCheckManager.performCheck(xCheckStudioInterface1.sourceProperties,
    //             xCheckStudioInterface2.sourceProperties,
    //             checkType,
    //             true,
    //             undefined,
    //             dataSourceOrderMaintained);

    //         checkPerformed = true;
    //         comparisonPerformed = true;
    //     }
    // }

    
    // if (xCheckStudioInterface1 && complianceSourceACB.classList.contains("state1")) {
    //     if (dataSourceOrderMaintained == 'true') {
    //         checkType = checkcase.getCheckType("ComplianceSourceA");
    //         if (!checkType) {
    //             checkType = checkcase.getCheckType("Compliance");
    //         }
    //         studioInterface = xCheckStudioInterface1;
    //         sourcePropsForCompliance = xCheckStudioInterface1.sourceProperties;
    //     }
    //     else {
    //         checkType = checkcase.getCheckType("ComplianceSourceB");
    //         if (!checkType) {
    //             checkType = checkcase.getCheckType("Compliance");
    //         }
    //         studioInterface = xCheckStudioInterface1;
    //         sourcePropsForCompliance = xCheckStudioInterface1.sourceProperties;
    //     }
    //     var sourceAModelBrowser = xCheckStudioInterface1.getModelBrowser();
    //     if (!sourceAModelBrowser) {
    //         OnShowToast('Compliance check can not be performed.');
    //     }


    //     if (sourceAModelBrowser.selectedCompoents.length === 0) {
    //         //alert("Compliance check on Source A can not be performed.\nNo selected components found.");
    //         OnShowToast('Compliance check can not be performed.</br>No selected components found for data source A.');
    //         //continue;
    //     }
    //     else {
    //         if (!sourceAComplianceCheckManager) {
    //             sourceAComplianceCheckManager = new CheckManager();
    //             sourceAComplianceCheckManager.performCheck(sourcePropsForCompliance,
    //                 undefined,
    //                 checkType,
    //                 false,
    //                 studioInterface,
    //                 dataSourceOrderMaintained);

    //             checkPerformed = true;
    //             sourceACompliancePerformed = true;
    //         }
    //     }
    // }
    
    // if (xCheckStudioInterface2 && complianceSourceBCB.classList.contains("state1")) {
    //     if (dataSourceOrderMaintained == 'true') {
    //         checkType = checkcase.getCheckType("ComplianceSourceB");
    //         if (!checkType) {
    //             checkType = checkcase.getCheckType("Compliance");
    //         }
    //         studioInterface = xCheckStudioInterface2;
    //         sourcePropsForCompliance = xCheckStudioInterface2.sourceProperties;
    //     }
    //     else {
    //         checkType = checkcase.getCheckType("ComplianceSourceA");
    //         if (!checkType) {
    //             checkType = checkcase.getCheckType("Compliance");
    //         }
    //         studioInterface = xCheckStudioInterface2;
    //         sourcePropsForCompliance = xCheckStudioInterface2.sourceProperties;
    //     }
    //     var sourceBModelBrowser = xCheckStudioInterface2.getModelBrowser();
    //     if (!sourceBModelBrowser) {
    //         OnShowToast('Compliance check can not be performed.');
    //     }


    //     if (sourceBModelBrowser.selectedCompoents.length === 0) {
    //         //alert("Compliance check on Source A can not be performed.\nNo selected components found.");
    //         OnShowToast('Compliance check can not be performed.</br>No selected components found for data source B.');
    //         //continue;
    //     }
    //     else {
    //         if (!sourceBComplianceCheckManager) {
    //             sourceBComplianceCheckManager = new CheckManager();
    //             sourceBComplianceCheckManager.performCheck(sourcePropsForCompliance,
    //                 undefined,
    //                 checkType,
    //                 false,
    //                 studioInterface,
    //                 dataSourceOrderMaintained);

    //             checkPerformed = true;
    //             sourceBCompliancePerformed = true;
    //         }
    //     }
    // }

    // hide busy spinner
    busySpinner.classList.remove('show');
    if (!comparisonPerformed &&
        !sourceACompliancePerformed &&
        !sourceBCompliancePerformed) {
        return;
    }

    //window.location.href = "/module2.html";
    document.getElementById("checkcompletealert").style.display = "block";
}

function performComparisonCheck(comparisonCB, checkcase, dataSourceOrderMaintained) {

    var checkPerformed = false;
    if (xCheckStudioInterface1 &&
        xCheckStudioInterface2 &&
        comparisonCB.classList.contains("state2")) {

        var sourceAModelBrowser = xCheckStudioInterface1.getModelBrowser();
        var sourceBModelBrowser = xCheckStudioInterface2.getModelBrowser();
        if (!sourceAModelBrowser || !sourceBModelBrowser) {
            OnShowToast('Comparison check can not be performed.');
        }

        // check if there are no selected components
        if (sourceAModelBrowser.selectedCompoents.length === 0 &&
            sourceBModelBrowser.selectedCompoents.length === 0) {
            //alert("Comparison check can not be performed.\nNo selected components found for both data sources.");
            OnShowToast('Comparison check can not be performed.</br>No selected components found for both data sources.');
            //return;
        }

        var checkType = checkcase.getCheckType("Comparison");

        if (!comparisonCheckManager) {
            comparisonCheckManager = new CheckManager();
            comparisonCheckManager.performCheck(xCheckStudioInterface1.sourceProperties,
                xCheckStudioInterface2.sourceProperties,
                checkType,
                true,
                undefined,
                dataSourceOrderMaintained);

            checkPerformed = true;            
        }
    }

    return checkPerformed}

function performSourceAComplianceCheck(complianceSourceACB, checkcase, dataSourceOrderMaintained ) {
    if (xCheckStudioInterface1 && complianceSourceACB.classList.contains("state1")) 
    {
        var checkType = undefined;
        var studioInterface = undefined;
        var sourcePropsForCompliance = undefined;
        if (dataSourceOrderMaintained == 'true') 
        {
            checkType = checkcase.getCheckType("ComplianceSourceA");
            if (!checkType) 
            {
                checkType = checkcase.getCheckType("Compliance");
            }
            studioInterface = xCheckStudioInterface1;
            sourcePropsForCompliance = xCheckStudioInterface1.sourceProperties;
        }
        else 
        {
            checkType = checkcase.getCheckType("ComplianceSourceB");
            if (!checkType) 
            {
                checkType = checkcase.getCheckType("Compliance");
            }
            studioInterface = xCheckStudioInterface1;
            sourcePropsForCompliance = xCheckStudioInterface1.sourceProperties;
        }     

        if (!checkType || 
            !studioInterface ||
            !sourcePropsForCompliance) {
            OnShowToast('Compliance check can not be performed.');
            return false;
        }

        var sourceAModelBrowser = xCheckStudioInterface1.getModelBrowser();
        if (!sourceAModelBrowser) {
            OnShowToast('Compliance check can not be performed.');
            return false;
        }


        if (sourceAModelBrowser.selectedCompoents.length === 0) 
        {
            OnShowToast('Compliance check can not be performed.</br>No selected components found for data source A.');
            return false;
        }
        else 
        {
            if (!sourceAComplianceCheckManager) {
                sourceAComplianceCheckManager = new CheckManager();
                sourceAComplianceCheckManager.performCheck(sourcePropsForCompliance,
                    undefined,
                    checkType,
                    false,
                    studioInterface,
                    dataSourceOrderMaintained);

               return true;
            }
        }
    }

    return false;
}

function performSourceBComplianceCheck(complianceSourceBCB, checkcase, dataSourceOrderMaintained ) {
    if (xCheckStudioInterface2 && complianceSourceBCB.classList.contains("state1")) 
    {
        var checkType = undefined;
        var studioInterface = undefined;
        var sourcePropsForCompliance = undefined;

        if (dataSourceOrderMaintained == 'true') {
            checkType = checkcase.getCheckType("ComplianceSourceB");
            if (!checkType) {
                checkType = checkcase.getCheckType("Compliance");
            }
            studioInterface = xCheckStudioInterface2;
            sourcePropsForCompliance = xCheckStudioInterface2.sourceProperties;
        }
        else {
            checkType = checkcase.getCheckType("ComplianceSourceA");
            if (!checkType) {
                checkType = checkcase.getCheckType("Compliance");
            }
            studioInterface = xCheckStudioInterface2;
            sourcePropsForCompliance = xCheckStudioInterface2.sourceProperties;
        }

        if (!checkType || 
            !studioInterface ||
            !sourcePropsForCompliance) {
            OnShowToast('Compliance check can not be performed.');
            return false;
        }

        var sourceBModelBrowser = xCheckStudioInterface2.getModelBrowser();
        if (!sourceBModelBrowser) {
            OnShowToast('Compliance check can not be performed.');
            return false;
        }


        if (sourceBModelBrowser.selectedCompoents.length === 0) {
            //alert("Compliance check on Source A can not be performed.\nNo selected components found.");
            OnShowToast('Compliance check can not be performed.</br>No selected components found for data source B.');
            return false;
        }
        else {
            if (!sourceBComplianceCheckManager) {
                sourceBComplianceCheckManager = new CheckManager();
                sourceBComplianceCheckManager.performCheck(sourcePropsForCompliance,
                    undefined,
                    checkType,
                    false,
                    studioInterface,
                    dataSourceOrderMaintained);

                    return true;
            }
        }
    }

    return false;
}

function deleteCheckResultsFromDB(checkType) {
    return new Promise((resolve) => {

        var functionToInvoke = undefined;
        if (checkType.toLowerCase() === "comparison") 
        {
            functionToInvoke = "DeleteComparisonResults";
        }
        else if (checkType.toLowerCase() === "sourceacompliance") 
        {
            functionToInvoke = "DeleteSourceAComplianceResults";
        }
        else if (checkType.toLowerCase() === "sourcebcompliance") 
        {            
            functionToInvoke = "DeleteSourceBComplianceResults";
        }

        if (functionToInvoke === undefined) {
            return resolve(false);
        }

        $.ajax({
            data: {
                'InvokeFunction': functionToInvoke
            },
            async: false,
            type: "POST",
            url: "PHP/ProjectManager.php"
        }).done(function (msg) {

            return resolve(true);
        });
    });
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
    modelTreeContainer, checkType) {

    let fileName = file.name;
    var fileExtension = xCheckStudio.Util.getFileExtension(fileName);

    if (!xCheckStudioInterface1) {
        xCheckStudioInterface1 = new xCheckStudio.xCheckStudioInterface(fileExtension, checkType);
        xCheckStudioInterface1.readExcelFileData(file, modelTreeContainer, viewerContainer);
    }
    else {
        xCheckStudioInterface2 = new xCheckStudio.xCheckStudioInterface(fileExtension);
        xCheckStudioInterface2.readExcelFileData(file, modelTreeContainer, viewerContainer);
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
        else {
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

function addTabHeaders(modelTreeContainer, fileName) {
    var tabHeader;
    if (modelTreeContainer === "modelTree1") {
        tabHeader = document.getElementById("dataSource1ModelBrowserTab");
        //localStorage.setItem("SourceAName", fileName);
        sourceAFileName = fileName;
        document.getElementById("dataSource1ViewerContainerTab").innerText = fileName;
    }
    else if (modelTreeContainer === "modelTree2") {
        tabHeader = document.getElementById("dataSource2ModelBrowserTab");
        //localStorage.setItem("SourceBName", fileName);
        sourceBFileName = fileName;
        document.getElementById("dataSource2ViewerContainerTab").innerText = fileName;
    }
    tabHeader.innerText = fileName;
}

function uploadAndLoadModel(fileExtension, fileName, viewerContainer, modelTreeContainer, dataSource, formId, files) {
    if (fileExtension.toLowerCase() === "xml" ||
        fileExtension.toLowerCase() === "rvm" ||
        fileExtension.toLowerCase() === "sldasm" ||
        fileExtension.toLowerCase() === "dwg" ||
        fileExtension.toLowerCase() === "sldprt" ||
        fileExtension.toLowerCase() === "rvt" ||
        fileExtension.toLowerCase() === "rfa" ||
        fileExtension.toLowerCase() === "ifc" ||
        fileExtension.toLowerCase() === "step" ||
        fileExtension.toLowerCase() === "stp" ||
        fileExtension.toLowerCase() === "ste" ||
        fileExtension.toLowerCase() === "json" ||
        fileExtension.toLowerCase() === "igs") {
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
                    modelTreeContainer, formId);
            }

            busySpinner.classList.remove('show')
        };
        var formData = new FormData(document.getElementById(formId));
        formData.append('viewerContainer', viewerContainer);

        var convertToSCS = 'true';
        if (fileExtension.toLowerCase() === "json") {
            convertToSCS = 'false';
        }
        formData.append('ConvertToSCS', convertToSCS);
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

function checkIsOrderMaintained(sourceAType, checkType) {
    if (checkType && xCheckStudioInterface1.SourceType.toLowerCase() !== sourceAType.toLowerCase()) {
        checkCaseManager.OrderMaintained = 'false';
    }
    else if (checkType) {
        var checkCaseType = checkType;
        outer_loop:
        for (var i = 0; i < checkCaseType.ComponentGroups.length; i++) {
            var ComponentGroup = checkCaseType.ComponentGroups[i];
            for (var j = 0; j < ComponentGroup.ComponentClasses.length; j++) {
                var componentClass = ComponentGroup.ComponentClasses[j];
                for (var sourceAMatchwithPropertyName in componentClass.MatchwithProperties) {
                    var sourceBMatchwithPropertyName = componentClass.MatchwithProperties[sourceAMatchwithPropertyName];
                    for (var genericObject in xCheckStudioInterface1.sourceProperties) {
                        if (xCheckStudioInterface1.sourceProperties[genericObject].MainComponentClass == ComponentGroup.SourceAName) {
                            if (xCheckStudioInterface1.sourceProperties[genericObject].SubComponentClass == componentClass.SourceAName) {
                                for (var l = 0; l < xCheckStudioInterface1.sourceProperties[genericObject].properties.length; l++) {
                                    var genericComponent = xCheckStudioInterface1.sourceProperties[genericObject].properties[l];
                                    if (genericComponent.Name == sourceAMatchwithPropertyName) {
                                        continue;
                                    }
                                    else if (genericComponent.Name == sourceBMatchwithPropertyName) {
                                        checkCaseManager.OrderMaintained = 'false';
                                        break outer_loop;
                                    }
                                }
                            }
                            else if (xCheckStudioInterface1.sourceProperties[genericObject].SubComponentClass == componentClass.SourceBName) {
                                checkCaseManager.OrderMaintained = 'false';
                                break outer_loop;
                            }
                        }
                        else if (xCheckStudioInterface1.sourceProperties[genericObject].MainComponentClass == ComponentGroup.SourceBName) {
                            checkCaseManager.OrderMaintained = 'false';
                            break outer_loop;
                        }
                    }
                }
            }
        }
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
            break;
        }
        else if (checkType.Name.toLowerCase() === "compliance") {
            sourceAType = checkType.SourceAType;
            break;
        }
    }

    if (viewerContainer === "viewerContainer1") {
        if (checkType.Name.toLowerCase() === "comparison" && (sourceAType || sourceBType)) {
            if (sourceAType.toLowerCase() !== fileExtension.toLowerCase() &&
                sourceBType.toLowerCase() !== fileExtension.toLowerCase()) {
                alert("Data source type doesn't match with check case.");
                return false;
            }
        }
        else {
            if (sourceAType.toLowerCase() !== fileExtension.toLowerCase()) {
                alert("Data source type doesn't match with check case.");
                return false;
            }
        }

    }
    else if (viewerContainer === "viewerContainer2") {
        if (checkType.Name.toLowerCase() === "comparison" && (sourceAType || sourceBType)) {
            if (sourceAType.toLowerCase() !== fileExtension.toLowerCase() &&
                sourceBType.toLowerCase() !== fileExtension.toLowerCase()) {
                alert("Data source type doesn't match with check case.");
                return false;
            }
        }
        else {
            if (sourceAType.toLowerCase() !== fileExtension.toLowerCase()) {
                alert("Data source type doesn't match with check case.");
                return false;
            }
        }
    }
    readExcelDataSource(file[0],
        viewerContainer,
        modelTreeContainer, checkType);
    return true;

}

function loadModel(fileName,
    viewerContainer,
    modelTreeContainer, formId) {

    if (!checkCaseManager ||
        !checkCaseManager.CheckCase) {
        alert("CheckCaseManager not found.");
        return false;
    }

    // formId = undefined;
    var fileExtension = xCheckStudio.Util.getFileExtension(fileName).toLowerCase();

    // iterate over checkcase types and find checktype for comparion.
    // If found, sourceATYpe and sourceBtype from comparison checktype
    // If comparison check type doesnt exist, get compliance check type.
    var sourceAType;
    var sourceBType;
    for (var i = 0; i < checkCaseManager.CheckCase.CheckTypes.length; i++) {
        var checkType = checkCaseManager.CheckCase.CheckTypes[i];
        if (checkType.Name.toLowerCase() === "comparison") {
            sourceAType = checkType.SourceAType;
            sourceBType = checkType.SourceBType;
            break;
        }
        else if (checkType.Name.toLowerCase() === "compliance") {
            sourceAType = checkType.SourceAType;
            break;
        }
    }

    if (viewerContainer === "viewerContainer1") {
        if (checkType.Name.toLowerCase() === "comparison" && (sourceAType || sourceBType)) {
            if (sourceAType.toLowerCase() !== fileExtension.toLowerCase() &&
                sourceBType.toLowerCase() !== fileExtension.toLowerCase()) {
                alert("Data source type doesn't match with check case.");
                return false;
            }
        }
        else {
            if (sourceAType.toLowerCase() !== fileExtension.toLowerCase()) {
                alert("Data source type doesn't match with check case.");
                return false;
            }
        }

    }
    else if (viewerContainer === "viewerContainer2") {
        if (checkType.Name.toLowerCase() === "comparison" && (sourceAType || sourceBType)) {
            if (sourceAType.toLowerCase() !== fileExtension.toLowerCase() &&
                sourceBType.toLowerCase() !== fileExtension.toLowerCase()) {
                alert("Data source type doesn't match with check case.");
                return false;
            }
        }
        else {
            if (sourceAType.toLowerCase() !== fileExtension.toLowerCase()) {
                alert("Data source type doesn't match with check case.");
                return false;
            }
        }
    }
    // get SCS file path and load model into viewer
    var fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));

    $.ajax({
        data: { 'viewerContainer': viewerContainer, 'fileName': fileNameWithoutExt, 'dataSourceType': '3D' },
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
                        xCheckStudioInterface1 = new xCheckStudio.xCheckStudioInterface(fileExtension, checkType);
                        xCheckStudioInterface1.setupViewer(viewerOptions, true).then(function (result) {

                        });
                    }
                    else if (viewerContainer === "viewerContainer2") {
                        xCheckStudioInterface2 = new xCheckStudio.xCheckStudioInterface(fileExtension);
                        xCheckStudioInterface2.setupViewer(viewerOptions, false).then(function (result) {

                        });
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
                    xCheckStudioInterface1.SourceType.toLowerCase() === "sldprt" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "ifc" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "step" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "stp" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "ste" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "rvt" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "igs") {


                    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(xCheckStudioInterface1.SourceType,
                        row.cells[modelBrowserMainClassColumn].textContent.trim());

                    var checkedComponent = {};

                    checkedComponent['Name'] = row.cells[modelBrowserComponentColumn].textContent.trim();
                    checkedComponent['MainComponentClass'] = row.cells[modelBrowserMainClassColumn].textContent.trim();
                    checkedComponent['ComponentClass'] = row.cells[modelBrowserSubClassColumn].textContent.trim();
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
                else if (xCheckStudioInterface1.SourceType.toLowerCase() === "json") {
                    checkedComponent = {
                        'Name': row.cells[1].textContent.trim(),
                        'MainComponentClass': row.cells[2].textContent.trim(),
                        'ComponentClass': row.cells[3].textContent.trim(),
                        'Description': row.cells[4].textContent.trim()
                    };

                    if (checkBoxId === "checkAllSourceACB" &&
                        xCheckStudioInterface1 &&
                        !xCheckStudioInterface1.db_reader.dbmodelbrowser.selectedCompoentExists(row)) {
                        xCheckStudioInterface1.db_reader.dbmodelbrowser.selectedCompoents.push(checkedComponent);
                    }
                }

            }
            if (xCheckStudioInterface2 && modelTreeContainer === "modelTree2") {
                if (xCheckStudioInterface2.SourceType.toLowerCase() === "xml" ||
                    xCheckStudioInterface2.SourceType.toLowerCase() === "rvm" ||
                    xCheckStudioInterface2.SourceType.toLowerCase() === "sldasm" ||
                    xCheckStudioInterface2.SourceType.toLowerCase() === "dwg" ||
                    xCheckStudioInterface2.SourceType.toLowerCase() === "sldprt" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "ifc" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "step" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "stp" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "ste" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "rvt" ||
                    xCheckStudioInterface1.SourceType.toLowerCase() === "igs") {

                    var identifierProperties = xCheckStudio.ComponentIdentificationManager.getComponentIdentificationProperties(xCheckStudioInterface2.SourceType,
                        row.cells[modelBrowserMainClassColumn].textContent.trim());
                    var checkedComponent = {};
                    checkedComponent["Name"] = row.cells[modelBrowserComponentColumn].textContent.trim();
                    checkedComponent["MainComponentClass"] = row.cells[modelBrowserMainClassColumn].textContent.trim();
                    checkedComponent["ComponentClass"] = row.cells[modelBrowserSubClassColumn].textContent.trim();
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
                else if (xCheckStudioInterface2.SourceType.toLowerCase() === "json") {
                    checkedComponent = {
                        'Name': row.cells[1].textContent.trim(),
                        'MainComponentClass': row.cells[2].textContent.trim(),
                        'ComponentClass': row.cells[3].textContent.trim(),
                        'Description': row.cells[4].textContent.trim()
                    };

                    if (checkBoxId === "checkAllSourceBCB" &&
                        xCheckStudioInterface2 &&
                        !xCheckStudioInterface2.db_reader.dbmodelbrowser.selectedCompoentExists(row)) {
                        xCheckStudioInterface2.db_reader.dbmodelbrowser.selectedCompoents.push(checkedComponent);
                    }
                }
            }
        }
    }

    if (!checkBox) {
        if (checkBoxId === "checkAllSourceACB" &&
            xCheckStudioInterface1) {
            if (xCheckStudioInterface1.SourceType.toLowerCase() === "xml" ||
                xCheckStudioInterface1.SourceType.toLowerCase() === "rvm" ||
                xCheckStudioInterface1.SourceType.toLowerCase() === "sldasm" ||
                xCheckStudioInterface1.SourceType.toLowerCase() === "dwg" ||
                xCheckStudioInterface1.SourceType.toLowerCase() === "sldprt" ||
                xCheckStudioInterface1.SourceType.toLowerCase() === "ifc" ||
                xCheckStudioInterface1.SourceType.toLowerCase() === "step" ||
                xCheckStudioInterface1.SourceType.toLowerCase() === "stp" ||
                xCheckStudioInterface1.SourceType.toLowerCase() === "ste" ||
                xCheckStudioInterface1.SourceType.toLowerCase() === "rvt" ||
                xCheckStudioInterface1.SourceType.toLowerCase() === "igs") {
                xCheckStudioInterface1._modelTree.selectedCompoents = [];
            }
            else if (xCheckStudioInterface1.SourceType.toLowerCase() === "xls") {
                xCheckStudioInterface1.db_reader.dbmodelbrowser.selectedCompoents = [];
            }
            else if (xCheckStudioInterface1.SourceType.toLowerCase() === "json") {
                xCheckStudioInterface1.db_reader.dbmodelbrowser.selectedCompoents = [];
            }

        }
        else if (checkBoxId === "checkAllSourceBCB" &&
            xCheckStudioInterface2) {
            if (xCheckStudioInterface2.SourceType.toLowerCase() === "xml" ||
                xCheckStudioInterface2.SourceType.toLowerCase() === "rvm" ||
                xCheckStudioInterface2.SourceType.toLowerCase() === "sldasm" ||
                xCheckStudioInterface2.SourceType.toLowerCase() === "dwg" ||
                xCheckStudioInterface2.SourceType.toLowerCase() === "sldprt" ||
                xCheckStudioInterface2.SourceType.toLowerCase() === "ifc" ||
                xCheckStudioInterface2.SourceType.toLowerCase() === "step" ||
                xCheckStudioInterface2.SourceType.toLowerCase() === "stp" ||
                xCheckStudioInterface2.SourceType.toLowerCase() === "ste" ||
                xCheckStudioInterface2.SourceType.toLowerCase() === "rvt" ||
                xCheckStudioInterface2.SourceType.toLowerCase() === "igs") {
                xCheckStudioInterface2._modelTree.selectedCompoents = [];
            }
            else if (xCheckStudioInterface2.SourceType.toLowerCase() === "xls") {
                xCheckStudioInterface2.db_reader.dbmodelbrowser.selectedCompoents = [];
            }
            else if (xCheckStudioInterface2.SourceType.toLowerCase() === "json") {
                xCheckStudioInterface2.db_reader.dbmodelbrowser.selectedCompoents = [];
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
            break;
        }
        else if (checkType.Name.toLowerCase() === "compliance") {
            sourceAType = checkType.SourceAType;
            break;
        }
    }

    if (viewerContainer === "viewerContainer1") {
        if (checkType.Name.toLowerCase() === "comparison" && (sourceAType || sourceBType)) {
            if (sourceAType.toLowerCase() !== fileExtension.toLowerCase() &&
                sourceBType.toLowerCase() !== fileExtension.toLowerCase()) {
                alert("Data source type doesn't match with check case.");
                return false;
            }
        }
        else {
            if (sourceAType.toLowerCase() !== fileExtension.toLowerCase()) {
                alert("Data source type doesn't match with check case.");
                return false;
            }
        }

    }
    else if (viewerContainer === "viewerContainer2") {
        if (checkType.Name.toLowerCase() === "comparison" && (sourceAType || sourceBType)) {
            if (sourceAType.toLowerCase() !== fileExtension.toLowerCase() &&
                sourceBType.toLowerCase() !== fileExtension.toLowerCase()) {
                alert("Data source type doesn't match with check case.");
                return false;
            }
        }
        else {
            if (sourceAType.toLowerCase() !== fileExtension.toLowerCase()) {
                alert("Data source type doesn't match with check case.");
                return false;
            }
        }
    }
    var fileName = file[0].name.substring(0, file[0].name.lastIndexOf('.'));
    $.ajax({
        data: { 'viewerContainer': viewerContainer, 'fileName': fileName, 'dataSourceType': '1D' },
        type: "POST",
        url: "PHP/GetSourceFilePath.php"
    }).done(function (uri) {
        if (uri !== 'fail') {
            xCheckStudio.Util.fileExists(uri).then(function (success) {
                if (success) {
                    readDbDataSource(uri, file[0],
                        viewerContainer,
                        modelTreeContainer, checkType);
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

function readDbDataSource(uri, file,
    viewerContainer,
    modelTreeContainer) {

    let fileName = file.name;
    var uri = "../" + uri;
    var fileExtension = xCheckStudio.Util.getFileExtension(fileName);

    Db_data = new Array();
    $.ajax({
        url: 'PHP/PDOConnectionForDatabases.php',
        type: 'POST',
        dataType: 'JSON',
        data: ({ uri: uri }),
        async: false,
        success: function (data) {
            Db_data = data;
        },
        error: function (xhr, status, error) {
        },
    });
    if (!xCheckStudioInterface1) {
        xCheckStudioInterface1 = new xCheckStudio.xCheckStudioInterface(fileExtension, checkType);
        xCheckStudioInterface1.readDbFileData(Db_data, modelTreeContainer, viewerContainer);
    }
    else {
        xCheckStudioInterface2 = new xCheckStudio.xCheckStudioInterface(fileExtension);
        xCheckStudioInterface2.readDbFileData(Db_data, modelTreeContainer, viewerContainer);
    }
}

function postData() {
    
    var sourceANodeIdvsComponentIdList;
    var sourceASelectedComponents;
    var sourceBNodeIdvsComponentIdList;
    var sourceBSelectedComponents;
    var sourceAType;
    var sourceBType;

    if (xCheckStudioInterface1) {
        if (xCheckStudioInterface1.SourceType.toLowerCase() === "xml" ||
            xCheckStudioInterface1.SourceType.toLowerCase() === "rvm" ||
            xCheckStudioInterface1.SourceType.toLowerCase() === "sldasm" ||
            xCheckStudioInterface1.SourceType.toLowerCase() === "dwg" ||
            xCheckStudioInterface1.SourceType.toLowerCase() === "sldprt" ||
            xCheckStudioInterface1.SourceType.toLowerCase() === "rvt" ||
            xCheckStudioInterface1.SourceType.toLowerCase() === "ifc" ||
            xCheckStudioInterface1.SourceType.toLowerCase() === "igs") {
            //virewer container Data
            var viewerOptions = [];
            viewerOptions.push(xCheckStudioInterface1._firstViewer._params.containerId);
            viewerOptions.push(xCheckStudioInterface1._firstViewer._params.endpointUri);

            // write viewer options data to data base
            $.ajax({
                url: 'PHP/ViewerOptionsWriter.php',
                type: "POST",
                async: false,
                data:
                {
                    "SourceViewerOptions": JSON.stringify(viewerOptions),
                    "SourceViewerOptionsTable": "SourceAViewerOptions"
                },
                success: function (msg) {                   
                }
            });

            sourceANodeIdvsComponentIdList = xCheckStudioInterface1.NodeIdvsComponentIdList;
            sourceASelectedComponents = xCheckStudioInterface1.getModelBrowser().selectedCompoents;
            sourceAType = xCheckStudioInterface1.SourceType;
            
        }
        else if (xCheckStudioInterface1.SourceType.toLowerCase() === "xls" || xCheckStudioInterface1.SourceType.toLowerCase() === "json") {
            sourceANodeIdvsComponentIdList = xCheckStudioInterface1.NodeIdvsComponentIdList;
            sourceASelectedComponents = xCheckStudioInterface1.getModelBrowser().selectedCompoents;
            sourceAType = xCheckStudioInterface1.SourceType;         
        }

    }

    if (xCheckStudioInterface2) {
        if (xCheckStudioInterface2.SourceType.toLowerCase() === "xml" ||
            xCheckStudioInterface2.SourceType.toLowerCase() === "rvm" ||
            xCheckStudioInterface2.SourceType.toLowerCase() === "sldasm" ||
            xCheckStudioInterface2.SourceType.toLowerCase() === "dwg" ||
            xCheckStudioInterface2.SourceType.toLowerCase() === "sldprt" ||
            xCheckStudioInterface2.SourceType.toLowerCase() === "rvt" ||
            xCheckStudioInterface2.SourceType.toLowerCase() === "ifc" ||
            xCheckStudioInterface2.SourceType.toLowerCase() === "igs") {

            //virewer container Data
            var viewerOptions = [];
            viewerOptions.push(xCheckStudioInterface2._firstViewer._params.containerId);
            viewerOptions.push(xCheckStudioInterface2._firstViewer._params.endpointUri);

            // write viewer options data to data base
            $.ajax({
                url: 'PHP/ViewerOptionsWriter.php',
                type: "POST",
                async: false,
                data:
                {
                    "SourceViewerOptions": JSON.stringify(viewerOptions),
                    "SourceViewerOptionsTable": "SourceBViewerOptions"
                },
                success: function (msg) {                  
                }
            });


            sourceBNodeIdvsComponentIdList = xCheckStudioInterface2.NodeIdvsComponentIdList;
            sourceBSelectedComponents = xCheckStudioInterface2.getModelBrowser().selectedCompoents;
            sourceBType = xCheckStudioInterface2.SourceType;
        }
        else if (xCheckStudioInterface2.SourceType.toLowerCase() === "xls" || xCheckStudioInterface2.SourceType.toLowerCase() === "json") {

            sourceBNodeIdvsComponentIdList = xCheckStudioInterface2.NodeIdvsComponentIdList;
            sourceBSelectedComponents = xCheckStudioInterface2.getModelBrowser().selectedCompoents;
            sourceBType = xCheckStudioInterface2.SourceType;
        }
    }

    // control states
    var comparisonCB = document.querySelector('.module1 .group31 .comparisonswitch .toggle-2udj');
    var complianceSourceACB = document.querySelector('.module1 .group1 .complianceswitch .toggle-Hm8P');
    var complianceSourceBCB = document.querySelector('.module1 .group2 .complianceswitch .toggle-Hm8P2');
    var sourceACheckAllCB = document.querySelector('.module1 .group1 .checkallswitch .toggle-KJzr');
    var sourceBCheckAllCB = document.querySelector('.module1 .group2 .checkallswitch .toggle-KJzr2');

    var comparisonSwithOn = 'false';
    if (comparisonCB.classList.contains("state2")) {
        comparisonSwithOn = 'true';
    }

    var sourceAComplianceSwitchOn = 'false';
    if (complianceSourceACB.classList.contains("state1")) {
        sourceAComplianceSwitchOn = 'true';
    }

    var sourceBComplianceSwitchOn = 'false';
    if (complianceSourceBCB.classList.contains("state1")) {
        sourceBComplianceSwitchOn = 'true';
    }

    var sourceACheckAllSwitchOn = 'false';
    if (sourceACheckAllCB.classList.contains("state2")) {
        sourceACheckAllSwitchOn = 'true';
    }
    var sourceBCheckAllSwitchOn = 'false';
    if (sourceBCheckAllCB.classList.contains("state2")) {
        sourceBCheckAllSwitchOn = 'true';
    }

    // write source A selected components, differet control statuses to DB        
    $.ajax({
        url: 'PHP/ProjectDatawriter.php',
        type: "POST",
        async: false,
        data:
        {
            "SourceANodeIdvsComponentIdList": JSON.stringify(sourceANodeIdvsComponentIdList),
            "SourceASelectedComponents": JSON.stringify(sourceASelectedComponents),
            "SourceBNodeIdvsComponentIdList": JSON.stringify(sourceBNodeIdvsComponentIdList),
            "SourceBSelectedComponents": JSON.stringify(sourceBSelectedComponents),
            "SourceAFileName": sourceAFileName,
            "SourceBFileName": sourceBFileName,
            "SourceAType": sourceAType,
            "SourceBType": sourceBType,
            "CheckCaseManager": JSON.stringify(checkCaseManager),
            "comparisonSwithOn": comparisonSwithOn,
            "sourceAComplianceSwitchOn": sourceAComplianceSwitchOn,
            "sourceBComplianceSwitchOn": sourceBComplianceSwitchOn,
            "sourceACheckAllSwitchOn": sourceACheckAllSwitchOn,
            "sourceBCheckAllSwitchOn": sourceBCheckAllSwitchOn
        },
        success: function (msg) {
            //alert("success");
            //$("#result").html(data);
        },
        error: function (error) {
            console.log(error)
        }
    });
}

function OnInfoClick() {
    document.getElementById("checkinfo").style.display = "block";

    var sourceAModelTree;
    var sourceBModelTree;
    if (xCheckStudioInterface1) {
        sourceAModelTree = xCheckStudioInterface1.getModelBrowser();
    }

    if (xCheckStudioInterface2) {
        sourceBModelTree = xCheckStudioInterface2.getModelBrowser();
    }

    var sourceAClassWiseComponets = 0;
    var sourceBClassWiseComponets = 0;

    if (sourceAModelTree) {
        var count = sourceAModelTree.selectedCompoents.length;
        sourceACheckedItemCount = count > 0 ? count : 0;
    }
    if (sourceBModelTree) {
        var count = sourceBModelTree.selectedCompoents.length;
        sourceBCheckedItemCount = count > 0 ? count : 0;
    }

    // for source A
    if (sourceAFileName !== undefined) {
        document.getElementById("headerval1").innerHTML = sourceAFileName;
    }
    var sourceACount = document.getElementById("SourceAComponentCount").innerText;
    if (sourceACount.split(":")[1] !== undefined) {
        document.getElementById("infoproperties1val1").innerHTML = sourceACount.split(":")[1].trim();
    }
    else {
        document.getElementById("infoproperties1val1").innerHTML = 0;
    }
    document.getElementById("infoproperties1val2").innerHTML = sourceACheckedItemCount;
    var sourceACompliancebtn = document.getElementById("complianceSourceACB");
    if (sourceACompliancebtn.className.includes("state2-to-state1")) {
        document.getElementById("infoproperties1val3").innerHTML = "Enabled";
    }
    else {
        document.getElementById("infoproperties1val3").innerHTML = "Disabled";
    }

    //for source B
    if (sourceBFileName !== undefined) {
        document.getElementById("headerval2").innerHTML = sourceBFileName;
    }
    var sourceBCount = document.getElementById("SourceBComponentCount").innerText;
    if (sourceBCount.split(":")[1] !== undefined) {
        document.getElementById("infoproperties2val1").innerHTML = sourceBCount.split(":")[1].trim();
    }
    else {
        document.getElementById("infoproperties2val1").innerHTML = 0;
    }
    document.getElementById("infoproperties2val2").innerHTML = sourceBCheckedItemCount;
    var sourceBCompliancebtn = document.getElementById("complianceSourceBCB");
    if (sourceBCompliancebtn.className.includes("state2-to-state1")) {
        document.getElementById("infoproperties2val3").innerHTML = "Enabled";
    }
    else {
        document.getElementById("infoproperties2val3").innerHTML = "Disabled";
    }

    //for both sources
    document.getElementById("infoproperties3val1").innerHTML = checkCaseManager.CheckCase.Name;
    var comparisonBtn = document.getElementById("comparisonCB");
    if (comparisonBtn.className.includes("state1-to-state2")) {
        document.getElementById("infoproperties3val2").innerHTML = "Enabled";
    }
    else {
        document.getElementById("infoproperties3val2").innerHTML = "Disabled";
    }
    //document.getElementById("infoproperties3val2").innerHTML = ;
}

function OnInfoClose() {
    document.getElementById("checkinfo").style.display = "none";
}

function OpenTab(tabName) {
    if (tabName === "tab1" ||
        tabName === "tab1Viewer") {
        document.getElementById("dataSource2").style.display = "none";
        document.getElementById("modelTree2").style.display = "none";
        document.getElementById("viewerContainer2").style.display = "none";
        document.getElementById("SourceBComponentCount").style.display = "none"
        document.getElementById("tab2").style.backgroundColor = "lightgray";
        document.getElementById("tab2Viewer").style.backgroundColor = "lightgray";

        document.getElementById("dataSource1").style.display = "block";
        document.getElementById("modelTree1").style.display = "block";
        document.getElementById("viewerContainer1").style.display = "block";
        document.getElementById("SourceAComponentCount").style.display = "block"
        document.getElementById("tab1").style.backgroundColor = "#F3F0F4";
        document.getElementById("tab1Viewer").style.backgroundColor = "#F3F0F4";

        if (currentViewer &&
            currentViewer._params.containerId !== "viewerContainer1") {

            stopExplode();
            currentViewer = undefined;
        }

        if (xCheckStudioInterface1 && xCheckStudioInterface1._firstViewer) {
            currentViewer = xCheckStudioInterface1._firstViewer;
        }
    }
    else if (tabName === "tab2" || tabName === "tab2Viewer") {
        document.getElementById("dataSource1").style.display = "none";
        document.getElementById("modelTree1").style.display = "none";
        document.getElementById("viewerContainer1").style.display = "none";
        document.getElementById("SourceAComponentCount").style.display = "none"
        document.getElementById("tab1").style.backgroundColor = "lightgray";
        document.getElementById("tab1Viewer").style.backgroundColor = "lightgray";

        document.getElementById("dataSource2").style.display = "block";
        document.getElementById("modelTree2").style.display = "block";
        document.getElementById("viewerContainer2").style.display = "block";
        document.getElementById("SourceBComponentCount").style.display = "block"
        document.getElementById("tab2").style.backgroundColor = "#F3F0F4";
        document.getElementById("tab2Viewer").style.backgroundColor = "#F3F0F4";

        if (currentViewer &&
            currentViewer._params.containerId !== "viewerContainer2") {

            stopExplode();
            currentViewer = undefined;
        }
        if (xCheckStudioInterface2 && xCheckStudioInterface2._firstViewer) {
            currentViewer = xCheckStudioInterface2._firstViewer;
        }
    }
}

function OnCheckClicked() {
    // Get the modal
    var modal = document.getElementById('projectselectiondialogModal');

    // When the user clicks the button, open the modal 
    modal.style.display = "block";
    $('#projectselectiondialog-content').load("/projectselectiondialog.html")
}

function OnShowHideMenu() {
    var x = document.getElementById("openmenu");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }

}

function clearData() {
    // window.location.reload();
    document.getElementById("modelTree1").innerHTML = "";;
    document.getElementById("SourceAComponentCount").innerHTML = "";
    document.getElementById("dataSource1ModelBrowserTab").innerHTML = "Source 1";
    document.getElementById("dataSource1ViewerContainerTab").innerHTML = "Source 1";
    $("#viewerContainer1").empty();
    document.getElementById("createbtnA").style.display = "block";
    document.getElementById("loadDataA").style.display = "block";


    document.getElementById("modelTree2").innerHTML = "";
    document.getElementById("SourceBComponentCount").innerHTML = "";
    document.getElementById("dataSource2ModelBrowserTab").innerText = "Source 2";
    document.getElementById("dataSource2ViewerContainerTab").innerHTML = "Source 2";
    $("#viewerContainer2").empty();
    document.getElementById("createbtnB").style.display = "block";
    document.getElementById("loadDataB").style.display = "block";

    document.getElementById("checkCaseSelect").value = "None";
}
function cancelreviewresults() {
    sourceAComplianceCheckManager = undefined;
    sourceBComplianceCheckManager = undefined;
    comparisonCheckManager = undefined;

    document.getElementById("checkcompletealert").style.display = "none";
}

function reviewresults() {
    postData();
    window.location = "/module2.html";
}

function OnShowToast(text) {
    document.getElementById("toast").style.display = "block";
    if ($('#toast').is(':visible')) {
        document.getElementById("toasttext").innerHTML = text;
        $('#toast').fadeIn('slow', function () {

            $('#toast').delay(2500).fadeOut();
        });
    }
}

function isLoadProject() {
    return new Promise((resolve) => {

        $.ajax({
            data: {
                'InvokeFunction': 'IsLoadProject'
            },
            type: "POST",
            url: "PHP/ProjectManager.php"
        }).done(function (msg) {
            var result = false;
            if (msg.toLowerCase() === 'true') {
                result = true;
            }

            resolve(result);
        });
    });
}


function loadProjectForCheck() {
    // restore the control state
    $.ajax({
        data: {
            'InvokeFunction': 'ReadCheckModuleControlsState'
        },
        type: "POST",
        url: "PHP/ProjectManager.php"
    }).done(function (msg) {
        if (msg !== 'fail') {
            var checkModuleControlsState = JSON.parse(msg);

            // comparison swith
            if ("comparisonSwith" in checkModuleControlsState &&
                checkModuleControlsState["comparisonSwith"].toLowerCase() === 'true') {

                var comparisonCB = document.querySelector('.module1 .group31 .comparisonswitch .toggle-2udj');
                if (comparisonCB.classList.contains('state1')) {
                    comparisonCB.classList.remove("state1");
                    comparisonCB.classList.add("state2");
                    comparisonCB.classList.add("state1-to-state2");
                }
            }

            // source A compliance swith
            if ("sourceAComplianceSwitch" in checkModuleControlsState &&
                checkModuleControlsState["sourceAComplianceSwitch"].toLowerCase() === 'true') {

                var complianceSourceACB = document.querySelector('.module1 .group1 .complianceswitch .toggle-Hm8P');
                if (complianceSourceACB.classList.contains('state2')) {
                    complianceSourceACB.classList.remove("state2");
                    complianceSourceACB.classList.add("state1");
                    complianceSourceACB.classList.add("state2-to-state1");

                }
            }

            // source B compliance swith
            if ("sourceBComplianceSwitch" in checkModuleControlsState &&
                checkModuleControlsState["sourceBComplianceSwitch"].toLowerCase() === 'true') {

                var complianceSourceBCB = document.querySelector('.module1 .group2 .complianceswitch .toggle-Hm8P2');
                if (complianceSourceBCB.classList.contains('state2')) {
                    complianceSourceBCB.classList.remove("state2");
                    complianceSourceBCB.classList.add("state1");
                    complianceSourceBCB.classList.add("state2-to-state1");
                }
            }

            // source A check all swith
            if ("sourceACheckAllSwitch" in checkModuleControlsState &&
                checkModuleControlsState["sourceACheckAllSwitch"].toLowerCase() === 'true') {

                var sourceACheckAllCB = document.querySelector('.module1 .group1 .checkallswitch .toggle-KJzr');
                if (sourceACheckAllCB.classList.contains('state1')) {
                    sourceACheckAllCB.classList.remove("state1");
                    sourceACheckAllCB.classList.add("state2");
                    sourceACheckAllCB.classList.add("state1-to-state2");

                }
            }

            // source B check all swith
            if ("sourceBCheckAllSwitch" in checkModuleControlsState &&
                checkModuleControlsState["sourceBCheckAllSwitch"].toLowerCase() === 'true') {

                var sourceBCheckAllCB = document.querySelector('.module1 .group2 .checkallswitch .toggle-KJzr2');
                if (sourceBCheckAllCB.classList.contains('state1')) {
                    sourceBCheckAllCB.classList.remove("state1");
                    sourceBCheckAllCB.classList.add("state2");
                    sourceBCheckAllCB.classList.add("state1-to-state2");
                }
            }
        }
    });

    // read check case info
    $.ajax({
        url: 'PHP/CheckCaseinfoReader.php',
        type: "POST",
        async: true,
        data: {},
        success: function (checkCaseString) {
            if (checkCaseString === "fail") {
                return;
            }

            var checkCaseInfo = JSON.parse(checkCaseString);

            if ('checkCaseData' in checkCaseInfo) {
                checkCaseManager = JSON.parse(checkCaseInfo['checkCaseData']);

                if ('CheckCase' in checkCaseManager) {
                    var checkCase = checkCaseManager['CheckCase'];
                    if ('Name' in checkCase) {

                        var checkCaseName = checkCase['Name'];

                        //add check case name to check case select box and select it
                        var checkCaseSelectElement = document.getElementById("checkCaseSelect");
                        var option = document.createElement("option");
                        option.text = checkCaseName;
                        checkCaseSelectElement.add(option);
                        checkCaseSelectElement.value = checkCaseName;

                        checkCaseSelectElement.disabled = true;
                    }
                }
            }

            // load sources in viewer and browser table            
            $.ajax({
                url: 'PHP/SourceViewerOptionsReader.php',
                type: "POST",
                async: true,
                data: {},
                success: function (vieweroptionsString) {
                    var viewerOptions = JSON.parse(vieweroptionsString);

                    // load data sources
                    loadSources(viewerOptions);
                }
            });
        }
    });
}

function loadSources(viewerOptions) {
    getDataSourceInfo().then(function (dataSourceInfo) {
        if (dataSourceInfo === undefined) {
            return;
        }

        if ('sourceAFileName' in dataSourceInfo) {
            var source = 'SourceA';
            if ('sourceBFileName' in dataSourceInfo) {
                source = 'Both';
            }
            getSelectedComponentsFromDB(source).then(function (selectedCompsResult) {

                var selectedComponents = undefined;
                // select source A selected components
                if ('SourceANodeIdwiseSelectedComps' in AllSelectedComponenets) {
                    selectedComponents = AllSelectedComponenets['SourceANodeIdwiseSelectedComps'];
                }

                // load source A
                loadSourceA(viewerOptions, dataSourceInfo, selectedComponents).then(function (isSourceALoaded) {

                    // load source B
                    if ('sourceBFileName' in dataSourceInfo) {

                        selectedComponents = undefined;
                        if ('SourceBNodeIdwiseSelectedComps' in AllSelectedComponenets) {
                            // select source B selected components      
                            selectedComponents = AllSelectedComponenets['SourceBNodeIdwiseSelectedComps'];
                        }

                        loadSourceB(viewerOptions, dataSourceInfo, selectedComponents).then(function (isSourceBLoaded) {

                        });

                    }
                });

            });
        }
    });
}

function loadSourceA(viewerParams, dataSourceInfo, selectedComponents) {

    return new Promise((resolve) => {
        // var sourceAViewerOptions = undefined;
        //var sourceAClassWiseComponents = undefined;
        if (viewerParams['SourceAContainerId'] === undefined ||
            viewerParams['SourceAEndPointUri'] === undefined) {
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

                    return resolve(true);
                }
            });
        }
        else {
            //sourceAViewerOptions = [viewerOptions['SourceAContainerId'], viewerOptions['SourceAEndPointUri']];

            // open tab to avoid issue of viewer not getting updated with model, 
            // when tab is hidden and model is loaded on it
            OpenTab('tab1');

            var viewerOptions = {
                containerId: 'viewerContainer1',
                endpointUri: viewerParams['SourceAEndPointUri'],
                modelTree: "modelTree1"
            };

            // hide load data source a button
            hideLoadButton("modelTree1");

            // set tab headers
            var file = viewerParams['SourceAEndPointUri'];
            var index = file.lastIndexOf("/");
            if (index != -1 &&
                file.length > (index + 1)) {
                file = file.substring(index + 1);
            }          

            index = file.lastIndexOf(".");
            if (index != -1 &&
                file.length > (index + 1)) {
                file = file.substring(0, index + 1);
            }      

            var fileExtension = dataSourceInfo['sourceAType'];
            file = file + fileExtension;
            
            addTabHeaders("modelTree1", file);

            xCheckStudioInterface1 = new xCheckStudio.xCheckStudioInterface(fileExtension, undefined, selectedComponents);
            xCheckStudioInterface1.setupViewer(viewerOptions, true).then(function (result) {

                // enable source a controls
                // enable check all CB for source A
                var component = document.querySelector('.module1 .group1 .checkallswitch .toggle-KJzr');
                if (component.classList.contains("disabledbutton")) {
                    component.classList.remove('disabledbutton');
                }

                // diable compliance CB for source A
                component = document.querySelector('.module1 .group1 .complianceswitch .toggle-Hm8P');
                if (component.classList.contains("disabledbutton")) {
                    component.classList.remove('disabledbutton');
                }

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

                return resolve(true);
            });
        }
    });
}

function loadSourceB(viewerParams, dataSourceInfo, selectedComponents) {

    return new Promise((resolve) => {

        // var sourceBViewerOptions = undefined;
        // var sourceBClassWiseComponents = undefined;
        if (viewerParams['SourceBContainerId'] === undefined ||
            viewerParams['SourceBEndPointUri'] === undefined) {
            // this ajax call is synchronous

            // get class wise properties for excel and other 1D datasources
            $.ajax({
                url: 'PHP/ClasswiseComponentsReader.php',
                type: "POST",
                async: false,
                data: { 'Source': "SourceB" },
                success: function (msg) {
                    if (msg != 'fail' &&
                        msg != "") {
                        sourceBClassWiseComponents = JSON.parse(msg);
                    }

                    return resolve(true);
                }
            });
        }
        else {
            //sourceBViewerOptions = [viewerOptions['SourceBContainerId'], viewerOptions['SourceBEndPointUri']];

            // open tab to avoid issue of viewer not getting updated with model, 
            // when tab is hidden and model is loaded on it
            CreateNewTab();
            OpenTab('tab2');

            var viewerOptions = {
                containerId: 'viewerContainer2',
                endpointUri: viewerParams['SourceBEndPointUri'],
                modelTree: "modelTree2"
            };

            // hide load data source b button
            hideLoadButton("modelTree2");

            // set tab headers
            var file = viewerParams['SourceBEndPointUri'];
            var index = file.lastIndexOf("/");
            if (index != -1 &&
                file.length > (index + 1)) {
                file = file.substring(index + 1);
            }

            index = file.lastIndexOf(".");
            if (index != -1 &&
                file.length > (index + 1)) {
                file = file.substring(0, index + 1);
            }      

            var fileExtension = dataSourceInfo['sourceBType'];
            file = file + fileExtension;
            addTabHeaders("modelTree2", file);

            //var fileExtension = dataSourceInfo['sourceBType'];
            xCheckStudioInterface2 = new xCheckStudio.xCheckStudioInterface(fileExtension, undefined, selectedComponents);
            xCheckStudioInterface2.setupViewer(viewerOptions, false).then(function (result) {

                // enable source b controls        
                // enable check all CB for source B
                var component = document.querySelector('.module1 .group2 .checkallswitch .toggle-KJzr2');
                if (component.classList.contains("disabledbutton")) {
                    component.classList.remove('disabledbutton');
                }

                // diable compliance CB for source A
                component = document.querySelector('.module1 .group2 .complianceswitch .toggle-Hm8P2');
                if (component.classList.contains("disabledbutton")) {
                    component.classList.remove('disabledbutton');
                }

                // enable comparison switch
                component = document.querySelector('.module1 .group31 .comparisonswitch .toggle-2udj');
                if (component.classList.contains("disabledbutton")) {
                    component.classList.remove('disabledbutton');
                }

                // enable info  button
                component = document.getElementById('infobtn');
                if (component.classList.contains("disabledbutton")) {
                    component.classList.remove('disabledbutton');
                }

                return resolve(true);
            });
        }
    });
}

function getDataSourceInfo() {
    return new Promise((resolve) => {
        // read data source info
        $.ajax({
            url: 'PHP/DataSourceInfoReader.php',
            type: "POST",
            async: true,
            data: {},
            success: function (msg) {
                if (msg === "fail") {
                    return resolve(undefined);
                }

                var dataSourceInfo = JSON.parse(msg);
                return resolve(dataSourceInfo);
            }
        });
    });
}

function getSelectedComponentsFromDB(source) {
    return new Promise((resolve) => {
        $.ajax({
            data: {
                'InvokeFunction': 'ReadSelectedComponents',
                'source': source
            },
            type: "POST",
            url: "PHP/ProjectManager.php"
        }).done(function (selectedCompsString) {

            if (selectedCompsString !== 'false') {
                AllSelectedComponenets = JSON.parse(selectedCompsString);
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    });
}

function selectComponents(modelTreeContainer) {

    var selectedComponents = undefined;
    // select source A selected components
    if (modelTreeContainer === 'modelTree1' &&
        'SourceANodeIdwiseSelectedComps' in AllSelectedComponenets) {
        selectedComponents = AllSelectedComponenets['SourceANodeIdwiseSelectedComps'];
    }
    else if (modelTreeContainer === 'modelTree2' &&
        'SourceBNodeIdwiseSelectedComps' in AllSelectedComponenets) {
        // select source B selected components      
        selectedComponents = AllSelectedComponenets['SourceBNodeIdwiseSelectedComps'];
    }

    if (selectedComponents === undefined) {
        return;
    }

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

        var nodeIdString = row.cells[modelBrowserNodeIdColumn].textContent.trim()
        var nodeIdFromRow = Number(nodeIdString)
        if (nodeIdFromRow === NaN) {
            continue;
        }

        if (nodeIdFromRow in selectedComponents) {
            var currentCheckBox = row.cells[0].children[0];
            if (!currentCheckBox ||
                currentCheckBox.checked == true) {
                continue;
            }

            currentCheckBox.checked == true;
        }
    }
}