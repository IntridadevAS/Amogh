var OrderMaintained = 'true';
var AllSelectedComponenets;
var loadSavedProject = false;
var sourceManager1;
var sourceManager2;
var checkCaseManager;
var checkCaseFilesData;
var checkCaseSelected = false;

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

    // perform comparison check
    var comparisonPerformed = performComparisonCheck(comparisonCB,
        checkcase,
        OrderMaintained);

    // perform source a compliance check                      
    var sourceACompliancePerformed = performSourceAComplianceCheck(complianceSourceACB, checkcase, OrderMaintained);

    // perform source b compliance check                      
    var sourceBCompliancePerformed = performSourceBComplianceCheck(complianceSourceBCB, checkcase, OrderMaintained);


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

    // hide busy spinner
    busySpinner.classList.remove('show');
    if (!comparisonPerformed &&
        !sourceACompliancePerformed &&
        !sourceBCompliancePerformed) {
        return;
    }

    document.getElementById("checkcompletealert").style.display = "block";
}

function performComparisonCheck(comparisonCB, checkcase, dataSourceOrderMaintained) {

    var checkPerformed = false;
    if (sourceManager1 &&
        sourceManager2 &&
        comparisonCB.classList.contains("state2")) {

        var sourceAModelBrowser = sourceManager1.GetModelBrowser();
        var sourceBModelBrowser = sourceManager2.GetModelBrowser();
        if (!sourceAModelBrowser || !sourceBModelBrowser) {
            OnShowToast('Comparison check can not be performed.');
            return;
        }

        // check if there are no selected components
        if (sourceAModelBrowser.GetSelectedComponents().length === 0 &&
            sourceBModelBrowser.GetSelectedComponents().length === 0) {
            //alert("Comparison check can not be performed.\nNo selected components found for both data sources.");
            OnShowToast('Comparison check can not be performed.</br>No selected components found for both data sources.');
            return;
        }

        var checkType = checkcase.getCheckType("Comparison");

        if (!comparisonCheckManager) {
            comparisonCheckManager = new CheckManager();
            comparisonCheckManager.performCheck(checkType,
                true,
                undefined,
                dataSourceOrderMaintained);

            checkPerformed = true;
        }
    }

    return checkPerformed
}

function performSourceAComplianceCheck(complianceSourceACB, checkcase, dataSourceOrderMaintained) {
    if (sourceManager1 && complianceSourceACB.classList.contains("state1")) {

        var checkType = undefined;
        var studioInterface = undefined;
        var sourcePropsForCompliance = undefined;
        if (dataSourceOrderMaintained == 'true') {
            checkType = checkcase.getCheckType("ComplianceSourceA");
            if (!checkType) {
                checkType = checkcase.getCheckType("Compliance");
            }
            studioInterface = sourceManager1;
            sourcePropsForCompliance = sourceManager1.SourceProperties;
        }
        else {
            checkType = checkcase.getCheckType("ComplianceSourceB");
            if (!checkType) {
                checkType = checkcase.getCheckType("Compliance");
            }
            studioInterface = sourceManager1;
            sourcePropsForCompliance = sourceManager1.SourceProperties;
        }

        if (!checkType ||
            !studioInterface ||
            !sourcePropsForCompliance) {
            OnShowToast('Compliance check can not be performed.');
            return false;
        }

        var sourceAModelBrowser = sourceManager1.GetModelBrowser();
        if (!sourceAModelBrowser) {
            OnShowToast('Compliance check can not be performed.');
            return false;
        }


        if (sourceAModelBrowser.GetSelectedComponents().length === 0) {
            OnShowToast('Compliance check can not be performed.</br>No selected components found for data source A.');
            return false;
        }
        else {
            if (!sourceAComplianceCheckManager) {
                sourceAComplianceCheckManager = new CheckManager();
                sourceAComplianceCheckManager.performCheck(checkType,
                    false,
                    studioInterface,
                    dataSourceOrderMaintained);

                return true;
            }
        }
    }

    return false;
}

function performSourceBComplianceCheck(complianceSourceBCB, checkcase, dataSourceOrderMaintained) {
    if (sourceManager2 && complianceSourceBCB.classList.contains("state1")) {
        var checkType = undefined;
        var studioInterface = undefined;
        var sourcePropsForCompliance = undefined;

        if (dataSourceOrderMaintained == 'true') {
            checkType = checkcase.getCheckType("ComplianceSourceB");
            if (!checkType) {
                checkType = checkcase.getCheckType("Compliance");
            }
            studioInterface = sourceManager2;
            sourcePropsForCompliance = sourceManager2.SourceProperties;
        }
        else {
            checkType = checkcase.getCheckType("ComplianceSourceA");
            if (!checkType) {
                checkType = checkcase.getCheckType("Compliance");
            }
            studioInterface = sourceManager2;
            sourcePropsForCompliance = sourceManager2.SourceProperties;
        }

        if (!checkType ||
            !studioInterface ||
            !sourcePropsForCompliance) {
            OnShowToast('Compliance check can not be performed.');
            return false;
        }

        var sourceBModelBrowser = sourceManager2.GetModelBrowser();
        if (!sourceBModelBrowser) {
            OnShowToast('Compliance check can not be performed.');
            return false;
        }


        if (sourceBModelBrowser.GetSelectedComponents().length === 0) {
            //alert("Compliance check on Source A can not be performed.\nNo selected components found.");
            OnShowToast('Compliance check can not be performed.</br>No selected components found for data source B.');
            return false;
        }
        else {
            if (!sourceBComplianceCheckManager) {
                sourceBComplianceCheckManager = new CheckManager();
                sourceBComplianceCheckManager.performCheck(checkType,
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
        if (checkType.toLowerCase() === "comparison") {
            functionToInvoke = "DeleteComparisonResults";
        }
        else if (checkType.toLowerCase() === "sourceacompliance") {
            functionToInvoke = "DeleteSourceAComplianceResults";
        }
        else if (checkType.toLowerCase() === "sourcebcompliance") {
            functionToInvoke = "DeleteSourceBComplianceResults";
        }

        if (functionToInvoke === undefined) {
            return resolve(false);
        }
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var object = JSON.parse(projectinfo);
        $.ajax({
            data: {
                'InvokeFunction': functionToInvoke,
                'ProjectName': object.projectname
            },
            async: false,
            type: "POST",
            url: "PHP/ProjectManager.php"
        }).done(function (msg) {

            return resolve(true);
        });
    });
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
    // component = document.getElementById('createbtnA');
    // addClass(component, 'disabledbutton');

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
    // $.ajax({
    //     data: { 'variable': 'Name' },
    //     type: "POST",
    //     url: "PHP/GetSessionVariable.php"
    // }).done(function (msg) {
    //     if (msg !== 'fail') {
    //         var pierrediv = document.getElementById("pierre");
    //         if (msg != "" && pierrediv != null)
    //             pierrediv.innerHTML = msg;
    //     }
    // });
    var pierrediv = document.getElementById("pierre");
    pierrediv.innerHTML = localStorage.getItem("username");
}

function setProjectName() {
    // $.ajax({
    //     data: { 'variable': 'ProjectName' },
    //     type: "POST",
    //     url: "PHP/GetSessionVariable.php"
    // }).done(function (msg) {
    //     if (msg !== 'fail') {
    //         var powerplantdiv = document.getElementById("powerplant");
    //         if (msg != "" && powerplantdiv != null)
    //             powerplant.innerHTML = msg;
    //     }
    // });
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var projectInfoObject = JSON.parse(projectinfo);
    var powerplantdiv = document.getElementById("powerplant");
    powerplant.innerHTML = projectInfoObject.projectname;
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
    modelTreeContainer) {

    let fileName = file.name;
    var fileExtension = xCheckStudio.Util.getFileExtension(fileName);

    if (!sourceManager1) {
        sourceManager1 = createSourceManager(fileExtension, viewerContainer, modelTreeContainer);
        sourceManager1.LoadData(file);
    }
    else {
        sourceManager2 = createSourceManager(fileExtension, viewerContainer, modelTreeContainer);
        sourceManager2.LoadData(file);
    }
}

function restoreExcelDataSource(classWiseComponents,
    viewerContainer,
    modelTreeContainer,
    selectedComponents,
    fileName) {

    //let fileName = file.name;
    var fileExtension = xCheckStudio.Util.getFileExtension(fileName);

    if (!sourceManager1) {
        sourceManager1 = createSourceManager(fileExtension,
            viewerContainer,
            modelTreeContainer,
            undefined);
        sourceManager1.RestoreData(classWiseComponents,
            selectedComponents);
    }
    else {
        sourceManager2 = createSourceManager(fileExtension,
            viewerContainer,
            modelTreeContainer,
            undefined);
        sourceManager2.RestoreData(classWiseComponents,
            selectedComponents);
    }
}

function restoreDBDataSource(classWiseComponents,
    viewerContainer,
    modelTreeContainer,
    selectedComponents,
    fileName) {

    //let fileName = file.name;
    var fileExtension = xCheckStudio.Util.getFileExtension(fileName);

    if (!sourceManager1) {
        sourceManager1 = createSourceManager(fileExtension, viewerContainer, modelTreeContainer);
        sourceManager1.RestoreData(classWiseComponents,
            selectedComponents);
    }
    else {
        sourceManager2 = createSourceManager(fileExtension, viewerContainer, modelTreeContainer);
        sourceManager2.RestoreData(classWiseComponents,
            selectedComponents);
    }
}

//open windows file selector dialog
function OnLoadClick(isFirstDataSource) {
    var modal;
    var modalMaximizeViewer;
    if (isFirstDataSource === "true") {
        // get first source type
        if (checkCaseManager === undefined) {
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
        if (checkCaseManager === undefined) {
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

    // if (!checkCaseManager) {
    //     alert("CheckCaseManager not found.");
    //     document.getElementById(formId).reset();
    //     return;
    // }

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
        fileExtension.toLowerCase() === "igs" ||
        fileExtension.toLowerCase() === "xls") {
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
            else if (fileExtension.toLowerCase() === "xls") {
                if (loadExcelDataSource(fileExtension,
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
        if (fileExtension.toLowerCase() === "json" ||
            fileExtension.toLowerCase() === "xls") {
            convertToSCS = 'false';
        }

        formData.append('ConvertToSCS', convertToSCS);
        xhr.send(formData);

    }
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

function checkIsOrderMaintained(checkType) {
    OrderMaintained = 'true';
    if (checkType &&
        sourceManager1 &&
        sourceManager1.SourceType.toLowerCase() !== checkType.SourceAType.toLowerCase()) {
        OrderMaintained = 'false';
    }
    else if (checkType &&
        sourceManager1 && checkType.SourceBType &&
        checkType.SourceAType.toLowerCase() == checkType.SourceBType.toLowerCase()) {

        var checkCaseType = checkType;
        outer_loop:
        for (var i = 0; i < checkCaseType.ComponentGroups.length; i++) {

            var ComponentGroup = checkCaseType.ComponentGroups[i];
            for (var j = 0; j < ComponentGroup.ComponentClasses.length; j++) {

                var componentClass = ComponentGroup.ComponentClasses[j];
                for (var sourceAMatchwithPropertyName in componentClass.MatchwithProperties) {

                    var sourceBMatchwithPropertyName = componentClass.MatchwithProperties[sourceAMatchwithPropertyName];
                    for (var genericObject in sourceManager1.SourceProperties) {

                        if (sourceManager1.SourceProperties[genericObject].MainComponentClass == ComponentGroup.SourceAName) {

                            if (sourceManager1.SourceProperties[genericObject].SubComponentClass == componentClass.SourceAName) {

                                for (var l = 0; l < sourceManager1.SourceProperties[genericObject].properties.length; l++) {

                                    var genericComponent = sourceManager1.SourceProperties[genericObject].properties[l];
                                    if (genericComponent.Name == sourceAMatchwithPropertyName) {

                                        continue;
                                    }
                                    else if (genericComponent.Name == sourceBMatchwithPropertyName) {

                                        OrderMaintained = 'false';
                                        break outer_loop;
                                    }
                                }
                            }
                            else if (sourceManager1.SourceProperties[genericObject].SubComponentClass == componentClass.SourceBName) {

                                OrderMaintained = 'false';
                                break outer_loop;
                            }
                        }
                        else if (sourceManager1.SourceProperties[genericObject].MainComponentClass == ComponentGroup.SourceBName) {

                            OrderMaintained = 'false';
                            break outer_loop;
                        }
                    }
                }
            }
        }
    }
}

function getCheckCase(sourcetype, viewerContainer) {
    var fileName;
    var dummylist = [];
    var checkCaseSelect = document.getElementById("checkCaseSelect");

    if(sourcetype == undefined || 
       viewerContainer == undefined) {
       
        checkCaseFilesData.FilteredCheckCaseDataList = [];
        checkCaseFilesData.populateCheckCases();
    } 
    else {
        var fileExtensionA;
        var fileExtensionB;
        if (sourceAFileName !== undefined) {
            fileExtensionA = xCheckStudio.Util.getFileExtension(sourceAFileName).toUpperCase();
        }
        if (sourceBFileName !== undefined) {
            fileExtensionB = xCheckStudio.Util.getFileExtension(sourceBFileName).toUpperCase();
    
        }
    
        // checkCaseSelect.options.add(new Option("None", "None"));
    
        if(viewerContainer == "viewerContainer1") {
            if(fileExtensionB == undefined) {
                checkCaseFilesData.FilteredCheckCaseDataList = [];
                for (var i = 0; i < checkCaseFilesData.CheckCaseFileDataList.length; i++) {
                    var checkCaseFileData = checkCaseFilesData.CheckCaseFileDataList[i];
                        if (checkCaseFileData.SourceTypes.includes(sourcetype)) {
                            checkCaseFilesData.FilteredCheckCaseDataList.push(checkCaseFileData);
                        }      
                }
            }
            else {
                for (var i = 0; i < checkCaseFilesData.FilteredCheckCaseDataList.length; i++) {
                    var checkCaseFileData = checkCaseFilesData.FilteredCheckCaseDataList[i];
                    var count = checkCaseFileData.SourceTypes.filter(x => x==sourcetype).length;
                    if(fileExtensionA == fileExtensionB) {
                        if(count >= 2)
                            dummylist.push(checkCaseFileData);
                    }
                    else if (checkCaseFileData.SourceTypes.includes(sourcetype)) {
                        dummylist.push(checkCaseFileData);
                    }      
                }
                checkCaseFilesData.FilteredCheckCaseDataList = [];
                checkCaseFilesData.FilteredCheckCaseDataList = dummylist;
            }         
        }
    
        else if(viewerContainer == "viewerContainer2") {
            if(fileExtensionA !== undefined) {
                for (var i = 0; i < checkCaseFilesData.FilteredCheckCaseDataList.length; i++) {
                    var checkCaseFileData = checkCaseFilesData.FilteredCheckCaseDataList[i];
                    var count = checkCaseFileData.SourceTypes.filter(x => x==sourcetype).length;
                    if(fileExtensionA == fileExtensionB) {
                        if(count >= 2)
                            dummylist.push(checkCaseFileData);
                    }
                    else if (checkCaseFileData.SourceTypes.includes(sourcetype)) {
                        dummylist.push(checkCaseFileData);
                    }      
                }
            }
            else {
                checkCaseFilesData.FilteredCheckCaseDataList = [];
                for (var i = 0; i < checkCaseFilesData.CheckCaseFileDataList.length; i++) {
                    var checkCaseFileData = checkCaseFilesData.CheckCaseFileDataList[i];
                    var count = checkCaseFileData.SourceTypes.filter(x => x==sourcetype).length;
                    if(fileExtensionA == fileExtensionB) {
                        if(count >= 2)
                            dummylist.push(checkCaseFileData);
                    }
                    else if (checkCaseFileData.SourceTypes.includes(sourcetype)) {
                        dummylist.push(checkCaseFileData);
                    }    
                }
            }       
            checkCaseFilesData.FilteredCheckCaseDataList = [];
            checkCaseFilesData.FilteredCheckCaseDataList = dummylist;
        }
    
        for (var i = checkCaseSelect.length - 1; i >= 0; i--) {
            checkCaseSelect.remove(i);
        }
                
        for (var i = 0; i < checkCaseFilesData.FilteredCheckCaseDataList.length; i++) {
            var checkCaseData = checkCaseFilesData.FilteredCheckCaseDataList[i];

            checkCaseSelect.options.add(new Option(checkCaseData.CheckCaseName, checkCaseData.CheckCaseName));
        }

        for (var i = 0; i < checkCaseSelect.options.length; i++) {
            var checkCaseOption = checkCaseSelect.options[i];
            checkCaseOption.className = "casesppidvspdm";
        }


        for (var i = 0; i < checkCaseFilesData.CheckCaseFileDataList.length; i++) {
            var checkCaseFileData = checkCaseFilesData.CheckCaseFileDataList[i];
            if (checkCaseFileData.CheckCaseName === checkCaseSelect.value) {
                fileName = checkCaseFileData.FileName;
                break;
            }
        }
    
        if (fileName !== undefined) {
            checkCaseManager.readCheckCaseData(fileName);
        }
    }
}

function loadExcelDataSource(fileExtension,
    file,
    viewerContainer,
    modelTreeContainer) {
    // if (!checkCaseManager) {
    //     alert("CheckCaseManager not found.");
    //     return false;
    // }
    var fileExtensionA;
    var fileExtensionB;

    fileExtensionA = xCheckStudio.Util.getFileExtension(sourceAFileName).toUpperCase();
    if (sourceBFileName !== undefined) {
        fileExtensionB = xCheckStudio.Util.getFileExtension(sourceBFileName).toUpperCase();
    }

    if (checkCaseManager && checkCaseManager.CheckCase && checkCaseSelected) {
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
                if ((sourceAType.toLowerCase() !== sourceBType.toLowerCase()) && (sourceAType.toLowerCase() !== fileExtension.toLowerCase() &&
                    sourceBType.toLowerCase() !== fileExtension.toLowerCase())) {
                    alert("Data source type doesn't match with check case.");
                    return false;
                }
                else if (fileExtensionA == fileExtensionB && sourceAType !== sourceBType) {
                    if (sourceAType.toLowerCase() == fileExtensionA.toLowerCase() && fileExtension == fileExtensionA.toLowerCase()) {
                        alert("Data source type doesn't match with check case.");
                        return false;
                    }
                    else if(sourceBType.toLowerCase() == fileExtensionA.toLowerCase() && fileExtension == fileExtensionB.toLowerCase()) {
                        alert("Data source type doesn't match with check case.");
                        return false;
                    }
                }
                else if(sourceAType == sourceBType && fileExtensionA !== fileExtensionB) {
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
    }
    else if (checkCaseManager && !checkCaseSelected) {
        getCheckCase(fileExtension, viewerContainer);

    }


    readExcelDataSource(file[0],
        viewerContainer,
        modelTreeContainer);
    return true;

}

function loadModel(fileName,
    viewerContainer,
    modelTreeContainer, formId) {

    if (!checkCaseManager) {
        alert("CheckCaseManager not found.");
        return false;
    }
    var fileExtension = xCheckStudio.Util.getFileExtension(fileName).toLowerCase();
    var fileExtensionA;
    var fileExtensionB;
    fileExtensionA = xCheckStudio.Util.getFileExtension(sourceAFileName).toUpperCase();
    if (sourceBFileName !== undefined) {
        fileExtensionB = xCheckStudio.Util.getFileExtension(sourceBFileName).toUpperCase();

    }

    if (checkCaseManager && checkCaseManager.CheckCase && checkCaseSelected) {
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
                if ((sourceAType.toLowerCase() !== sourceBType.toLowerCase()) && (sourceAType.toLowerCase() !== fileExtension.toLowerCase() &&
                sourceBType.toLowerCase() !== fileExtension.toLowerCase())) {
                    alert("Data source type doesn't match with check case.");
                    return false;
                }
                else if (fileExtensionA == fileExtensionB && sourceAType !== sourceBType) {
                    if (sourceAType.toLowerCase() == fileExtensionA.toLowerCase() && fileExtension == fileExtensionA.toLowerCase()) {
                        alert("Data source type doesn't match with check case.");
                        return false;
                    }
                    else if(sourceBType.toLowerCase() == fileExtensionA.toLowerCase() && fileExtension == fileExtensionB.toLowerCase()) {
                        alert("Data source type doesn't match with check case.");
                        return false;
                    }
                }
                else if(sourceAType == sourceBType && fileExtensionA !== fileExtensionB) {
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
    }


    // get SCS file path and load model into viewer
    var fileNameWithoutExt = undefined;
    if (fileName.includes(".")) {
        fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    }
    else {
        fileNameWithoutExt = fileName;
    }

    $.ajax({
        data: { 'viewerContainer': viewerContainer, 'fileName': fileNameWithoutExt, 'dataSourceType': '3D' },
        type: "POST",
        url: "PHP/GetSourceFilePath.php"
    }).done(function (uri) {
        if (uri !== 'fail') {

            // uri contains SCS file path, so load
            xCheckStudio.Util.fileExists(uri).then(function (success) {
                if (success) {

                    if (viewerContainer === "viewerContainer1") {
                        sourceManager1 = createSourceManager(fileExtension, viewerContainer, modelTreeContainer, uri);
                        sourceManager1.LoadData().then(function (result) {

                        });
                    }
                    else if (viewerContainer === "viewerContainer2") {
                        sourceManager2 = createSourceManager(fileExtension, viewerContainer, modelTreeContainer, uri);
                        sourceManager2.LoadData().then(function (result) {

                        });
                    }
                    manageControlsOnDatasourceLoad(fileName, viewerContainer, modelTreeContainer);
                    if (!checkCaseSelected) {
                        getCheckCase(fileExtension, viewerContainer);
                    }
                    return true;
                }
                else {
                    if (formId) {
                        document.getElementById(formId).reset();
                    }
                    alert("File not found to load.");
                    return false;
                }
            });
        }
        else {
            if (formId) {
                document.getElementById(formId).reset();
            }
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

            if (sourceManager1 && modelTreeContainer === "modelTree1") {
                if (sourceManager1.IsSCSource()) {

                    var checkedComponent = {};

                    checkedComponent['Name'] = row.cells[modelBrowserComponentColumn].textContent.trim();
                    checkedComponent['MainComponentClass'] = row.cells[modelBrowserMainClassColumn].textContent.trim();
                    checkedComponent['ComponentClass'] = row.cells[modelBrowserSubClassColumn].textContent.trim();
                    checkedComponent["NodeId"] = row.cells[modelBrowserNodeIdColumn].textContent.trim();

                    if (checkBoxId === "checkAllSourceACB" &&
                        !sourceManager1.ModelTree.SelectedCompoentExists(row)) {
                        sourceManager1.ModelTree.AddSelectedComponent(checkedComponent);
                    }
                }
                else if (sourceManager1.IsExcelSource()) {
                    checkedComponent = {
                        'Name': row.cells[1].textContent.trim(),
                        'MainComponentClass': row.cells[2].textContent.trim(),
                        'ComponentClass': row.cells[3].textContent.trim(),
                        'Description': row.cells[4].textContent.trim()
                    };

                    if (checkBoxId === "checkAllSourceACB" &&
                        sourceManager1 &&
                        !sourceManager1.ModelTree.SelectedCompoentExists(row)) {
                        sourceManager1.ModelTree.AddSelectedComponent(checkedComponent);
                    }
                }
                else if (sourceManager1.IsDBSource()) {
                    checkedComponent = {
                        'Name': row.cells[1].textContent.trim(),
                        'MainComponentClass': row.cells[2].textContent.trim(),
                        'ComponentClass': row.cells[3].textContent.trim(),
                        'Description': row.cells[4].textContent.trim()
                    };

                    if (checkBoxId === "checkAllSourceACB" &&
                        sourceManager1 &&
                        !sourceManager1.ModelTree.SelectedCompoentExists(row)) {
                        sourceManager1.ModelTree.AddSelectedComponent(checkedComponent);
                    }
                }

            }
            if (sourceManager2 && modelTreeContainer === "modelTree2") {
                if (sourceManager2.IsSCSource()) {
                    var checkedComponent = {};
                    checkedComponent["Name"] = row.cells[modelBrowserComponentColumn].textContent.trim();
                    checkedComponent["MainComponentClass"] = row.cells[modelBrowserMainClassColumn].textContent.trim();
                    checkedComponent["ComponentClass"] = row.cells[modelBrowserSubClassColumn].textContent.trim();
                    checkedComponent["NodeId"] = row.cells[modelBrowserNodeIdColumn].textContent.trim();

                    if (checkBoxId === "checkAllSourceBCB" &&
                        !sourceManager2.ModelTree.SelectedCompoentExists(row)) {
                        sourceManager2.ModelTree.AddSelectedComponent(checkedComponent);
                    }
                }
                else if (sourceManager2.IsExcelSource()) {
                    checkedComponent = {
                        'Name': row.cells[1].textContent.trim(),
                        'MainComponentClass': row.cells[2].textContent.trim(),
                        'ComponentClass': row.cells[3].textContent.trim(),
                        'Description': row.cells[4].textContent.trim()
                    };

                    if (checkBoxId === "checkAllSourceBCB" &&
                        sourceManager2 &&
                        !sourceManager2.ModelTree.SelectedCompoentExists(row)) {
                        sourceManager2.ModelTree.AddSelectedComponent(checkedComponent);
                    }
                }
                else if (sourceManager2.IsDBSource()) {
                    checkedComponent = {
                        'Name': row.cells[1].textContent.trim(),
                        'MainComponentClass': row.cells[2].textContent.trim(),
                        'ComponentClass': row.cells[3].textContent.trim(),
                        'Description': row.cells[4].textContent.trim()
                    };

                    if (checkBoxId === "checkAllSourceBCB" &&
                        sourceManager2 &&
                        !sourceManager2.ModelTree.SelectedCompoentExists(row)) {
                        sourceManager2.ModelTree.AddSelectedComponent(checkedComponent);
                    }
                }
            }
        }
    }

    if (!checkBox) {
        if (checkBoxId === "checkAllSourceACB" &&
            sourceManager1) {
            sourceManager1.ModelTree.ClearSelectedComponent();
        }
        else if (checkBoxId === "checkAllSourceBCB" &&
            sourceManager2) {
            sourceManager2.ModelTree.ClearSelectedComponent();
        }
    }
}

function loadDbDataSource(fileExtension,
    file,
    viewerContainer,
    modelTreeContainer) {

    var sourceAType;
    var sourceBType;

    var fileExtensionA;
    var fileExtensionB;
    fileExtensionA = xCheckStudio.Util.getFileExtension(sourceAFileName).toUpperCase();
    if (sourceBFileName !== undefined) {
        fileExtensionB = xCheckStudio.Util.getFileExtension(sourceBFileName).toUpperCase();
    }

    if (checkCaseManager && checkCaseManager.CheckCase && checkCaseSelected) {
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
                if ((sourceAType.toLowerCase() !== sourceBType.toLowerCase()) && (sourceAType.toLowerCase() !== fileExtension.toLowerCase() &&
                sourceBType.toLowerCase() !== fileExtension.toLowerCase())) {
                    alert("Data source type doesn't match with check case.");
                    return false;
                }
                else if (fileExtensionA == fileExtensionB && sourceAType !== sourceBType) {
                    if (sourceAType.toLowerCase() == fileExtensionA.toLowerCase() && fileExtension == fileExtensionA.toLowerCase()) {
                        alert("Data source type doesn't match with check case.");
                        return false;
                    }
                    else if(sourceBType.toLowerCase() == fileExtensionA.toLowerCase() && fileExtension == fileExtensionB.toLowerCase()) {
                        alert("Data source type doesn't match with check case.");
                        return false;
                    }
                }
                else if(sourceAType == sourceBType && fileExtensionA !== fileExtensionB) {
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
                    readDbDataSource(uri,
                        file[0].name,
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

function readDbDataSource(uri,
    fileName,
    viewerContainer,
    modelTreeContainer) {

    // let fileName = file.name;
    var uri = "../" + uri;
    var fileExtension = xCheckStudio.Util.getFileExtension(fileName);

    var fileExtensionA;
    var fileExtensionB;
    fileExtensionA = xCheckStudio.Util.getFileExtension(sourceAFileName).toUpperCase();
    if (sourceBFileName !== undefined) {
        fileExtensionB = xCheckStudio.Util.getFileExtension(sourceBFileName).toUpperCase();

    }

    if (!sourceManager1) {
        sourceManager1 = createSourceManager(fileExtension, viewerContainer, modelTreeContainer);
        sourceManager1.LoadData(uri).then(function (result) {
            if (!checkCaseSelected) {
                getCheckCase(fileExtension, viewerContainer);
            }
        });
    }
    else {
        sourceManager2 = createSourceManager(fileExtension, viewerContainer, modelTreeContainer);
        sourceManager2.LoadData(uri).then(function (result) {
            if (!checkCaseSelected) {
                getCheckCase(fileExtension, viewerContainer);
            }
        });
    }
}

function saveData() {

    var sourceANodeIdvsComponentIdList;
    var sourceASelectedComponents;
    var sourceBNodeIdvsComponentIdList;
    var sourceBSelectedComponents;
    var sourceAType;
    var sourceBType;

    if (sourceManager1) {
        if (sourceManager1.IsSCSource()) {
            //virewer container Data
            var viewerOptions = [];
            viewerOptions.push(sourceManager1.Webviewer._params.containerId);
            viewerOptions.push(sourceManager1.Webviewer._params.endpointUri);
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var object = JSON.parse(projectinfo);
            // write viewer options data to data base
            $.ajax({
                url: 'PHP/ViewerOptionsWriter.php',
                type: "POST",
                async: false,
                data:
                {
                    "SourceViewerOptions": JSON.stringify(viewerOptions),
                    "SourceViewerOptionsTable": "SourceAViewerOptions",
                    'ProjectName': object.projectname
                },
                success: function (msg) {
                }
            });

            sourceANodeIdvsComponentIdList = sourceManager1.NodeIdvsComponentIdList;
            sourceASelectedComponents = sourceManager1.ModelTree.GetSelectedComponents();
            sourceAType = sourceManager1.SourceType;

        }
        else if (sourceManager1.IsExcelSource() ||
            sourceManager1.IsDBSource()) {
            //sourceANodeIdvsComponentIdList = sourceManager1.NodeIdvsComponentIdList;
            sourceANodeIdvsComponentIdList = {};
            sourceASelectedComponents = sourceManager1.ModelTree.GetSelectedComponents();
            sourceAType = sourceManager1.SourceType;
        }

    }

    if (sourceManager2) {
        if (sourceManager2.IsSCSource()) {

            //virewer container Data
            var viewerOptions = [];
            viewerOptions.push(sourceManager2.Webviewer._params.containerId);
            viewerOptions.push(sourceManager2.Webviewer._params.endpointUri);
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var object = JSON.parse(projectinfo);
            // write viewer options data to data base
            $.ajax({
                url: 'PHP/ViewerOptionsWriter.php',
                type: "POST",
                async: false,
                data:
                {
                    "SourceViewerOptions": JSON.stringify(viewerOptions),
                    "SourceViewerOptionsTable": "SourceBViewerOptions",
                    'ProjectName': object.projectname
                },
                success: function (msg) {
                }
            });


            sourceBNodeIdvsComponentIdList = sourceManager2.NodeIdvsComponentIdList;
            sourceBSelectedComponents = sourceManager2.ModelTree.GetSelectedComponents();
            sourceBType = sourceManager2.SourceType;
        }
        else if (sourceManager2.IsExcelSource() ||
            sourceManager2.IsDBSource()) {

            //sourceBNodeIdvsComponentIdList = sourceManager2.NodeIdvsComponentIdList;
            sourceBNodeIdvsComponentIdList = {};
            sourceBSelectedComponents = sourceManager2.ModelTree.GetSelectedComponents();
            sourceBType = sourceManager2.SourceType;
        }
    }

    // control states
    var controlStatesArray = getControlStates();

    // write source A selected components, differet control statuses to DB        
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var object = JSON.parse(projectinfo);

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
            "orderMaintained": OrderMaintained,
            "comparisonSwithOn": controlStatesArray['ComparisonSwitch'],
            "sourceAComplianceSwitchOn": controlStatesArray['SourceAComplianceSwitch'],
            "sourceBComplianceSwitchOn": controlStatesArray['SourceBComplianceSwitch'],
            "sourceACheckAllSwitchOn": controlStatesArray['SourceACheckAllSwitch'],
            "sourceBCheckAllSwitchOn": controlStatesArray['SourceBCheckAllSwitch'],
            "ProjectName": object.projectname
        },
        success: function (msg) {
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
    if (sourceManager1) {
        sourceAModelTree = sourceManager1.ModelTree;
    }

    if (sourceManager2) {
        sourceBModelTree = sourceManager2.ModelTree;
    }

    // var sourceAClassWiseComponets = 0;
    // var sourceBClassWiseComponets = 0;

    if (sourceAModelTree) {
        var count = sourceAModelTree.GetSelectedComponents().length;
        sourceACheckedItemCount = count > 0 ? count : 0;
    }
    if (sourceBModelTree) {
        var count = sourceBModelTree.GetSelectedComponents().length;
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

        if (sourceManager1 && sourceManager1.Webviewer) {
            currentViewer = sourceManager1.Webviewer;
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
        if (sourceManager2 && sourceManager2.Webviewer) {
            currentViewer = sourceManager2.Webviewer;
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

function resetCheckSwitchesForSource2() {
    var component = document.querySelector('.module1 .group2 .checkallswitch .toggle-KJzr2');
    if (isCurrentState(component, 'state2')) {
        if (component.classList.contains("disabledbutton")) {
            return;
        }
        component.addEventListener(transitionEvent, transitiontoggleKJzrcsB8xgZstate1tostate2EndedHandler);
        removeAllClassesButFirst(component, 'state2-to-state1');
        addClass(component, 'state1');
        addClass(component, 'state2-to-state1');
    }
    var component = document.querySelector('.module1 .group2 .complianceswitch .toggle-Hm8P2');
    if (isCurrentState(component, 'state1')) {
        if (component.classList.contains("disabledbutton")) {
            return;
        }
        component.addEventListener(transitionEvent, transitiontoggleHm8PS0BCR4ustate2tostate1EndedHandler);
        removeAllClassesButFirst(component, 'state2-to-state1');
        addClass(component, 'state2');
        addClass(component, 'state1-to-state2');
    }
}

function resetCheckSwitchesForSource1() {
    var component = document.querySelector('.module1 .group1 .checkallswitch .toggle-KJzr');
    if (isCurrentState(component, 'state2')) {
        if (component.classList.contains("disabledbutton")) {
            return;
        }
        component.addEventListener(transitionEvent, transitiontoggleKJzrcsB8xgZstate2tostate1EndedHandler);
        removeAllClassesButFirst(component, 'state2-to-state1');
        addClass(component, 'state1');
        addClass(component, 'state2-to-state1');
    }

    var component = document.querySelector('.module1 .group1 .complianceswitch .toggle-Hm8P');
    if (isCurrentState(component, 'state1')) {
        if (component.classList.contains("disabledbutton")) {
            return;
        }
        component.addEventListener(transitionEvent, transitiontoggleHm8PS0BCR4ustate2tostate1EndedHandler);
        removeAllClassesButFirst(component, 'state2-to-state1');
        addClass(component, 'state2');
        addClass(component, 'state1-to-state2');
    }
}

function clearDBEntriesOnClearModule(source) {

    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var object = JSON.parse(projectinfo);

    $.ajax({
        data: { 'Source': source,
        'ProjectName': object.projectname
        },
        type: "POST",
        url: "PHP/RemoveComponentsFromDB.php"
    }).done(function (msg) {
        if (msg == 'fail') {
        }
        // remove busy spinner
        var busySpinner = document.getElementById("divLoading");
        busySpinner.classList.remove('show')
    });

    $.ajax({
        data: { 
            'Source': source,
            'ProjectName': object.projectname
        },
        type: "POST",
        url: "PHP/DeleteSourceFilesFromDirectory.php"
    }).done(function (msg) {
        if (msg == 'fail') {
        }
        // remove busy spinner
        var busySpinner = document.getElementById("divLoading");
        busySpinner.classList.remove('show')
    });
}

function clearData(source) {
    var comparisonCB = document.querySelector('.module1 .group31 .comparisonswitch .toggle-2udj');
    if (isCurrentState(comparisonCB, 'state2')) {
        if (comparisonCB.classList.contains("disabledbutton")) {
            return;
        }

        comparisonCB.addEventListener(transitionEvent, transitiontoggle2udjlGv4xgMstate1tostate2EndedHandler);
        removeAllClassesButFirst(comparisonCB, 'state1-to-state2');
        addClass(comparisonCB, 'state1');
        addClass(comparisonCB, 'state2-to-state1');
    }
    if (source.toLowerCase() == "both") {
        document.getElementById("modelTree1").innerHTML = "";;
        document.getElementById("SourceAComponentCount").innerHTML = "";
        document.getElementById("dataSource1ModelBrowserTab").innerHTML = "Source 1";
        document.getElementById("dataSource1ViewerContainerTab").innerHTML = "Source 1";
        $("#viewerContainer1").empty();
        document.getElementById("createbtnA").style.display = "block";
        document.getElementById("loadDataA").style.display = "block";
        if (document.getElementById("createbtnA").classList.contains("disabledbutton")) {
            document.getElementById("createbtnA").classList.remove('disabledbutton');
        }
        $('#checkAll1').attr('value', 'false');
        $('#compliance1').attr('value', 'false');

        document.getElementById("modelTree2").innerHTML = "";
        document.getElementById("SourceBComponentCount").innerHTML = "";
        document.getElementById("dataSource2ModelBrowserTab").innerText = "Source 2";
        document.getElementById("dataSource2ViewerContainerTab").innerHTML = "Source 2";
        $("#viewerContainer2").empty();
        document.getElementById("createbtnB").style.display = "block";
        document.getElementById("loadDataB").style.display = "block";
        document.getElementById("checkCaseSelect").value = "None";
        resetCheckSwitchesForSource1();
        resetCheckSwitchesForSource2();
        sourceManager1 = null;
        sourceManager2 = null;
        enableDropZone("dropZone1");
        getCheckCase();
        clearDBEntriesOnClearModule(source);

    }
    else if (source.toLowerCase() == "sourcea") {
        document.getElementById("modelTree1").innerHTML = "";;
        document.getElementById("SourceAComponentCount").innerHTML = "";
        document.getElementById("dataSource1ModelBrowserTab").innerHTML = "Source 1";
        document.getElementById("dataSource1ViewerContainerTab").innerHTML = "Source 1";
        $("#viewerContainer1").empty();

        document.getElementById("createbtnA").style.display = "block";
        if (document.getElementById("createbtnA").classList.contains("disabledbutton")) {
            document.getElementById("createbtnA").classList.remove('disabledbutton');
        }
        document.getElementById("loadDataA").style.display = "block";
        if (document.getElementById("dataSource1ModelBrowserTab").innerHTML == "Source 1") {
            component = document.getElementById('createbtnB');
            addClass(component, 'disabledbutton');
        }
        resetCheckSwitchesForSource1();
        enableDropZone("dropZone1");
        excludeNone = true;
        sourceAFileName = undefined;
        var fileExtensionA;
        var fileExtensionB;
        var sourceType;
        if (sourceBFileName !== undefined) {
            fileExtensionB = xCheckStudio.Util.getFileExtension(sourceBFileName).toUpperCase();
            sourceType = fileExtensionB.toLowerCase();
        }

        if (sourceAFileName == undefined && sourceBFileName == undefined) {
            excludeNone = false;
        }
        sourceManager1 = null;
        getCheckCase(sourceType, 'viewerContainer2');
        clearDBEntriesOnClearModule(source);
      
    }
    else if (source.toLowerCase() == "sourceb") {
        document.getElementById("modelTree2").innerHTML = "";
        document.getElementById("SourceBComponentCount").innerHTML = "";
        document.getElementById("dataSource2ModelBrowserTab").innerText = "Source 2";
        document.getElementById("dataSource2ViewerContainerTab").innerHTML = "Source 2";
        $("#viewerContainer2").empty();
        document.getElementById("createbtnB").style.display = "block";
        if (document.getElementById("createbtnB").classList.contains("disabledbutton")) {
            document.getElementById("createbtnB").classList.remove('disabledbutton');
        }
        document.getElementById("loadDataB").style.display = "block";

        if (document.getElementById("dataSource1ModelBrowserTab").innerHTML == "Source 1") {
            component = document.getElementById('createbtnB');
            addClass(component, 'disabledbutton');
        }
        resetCheckSwitchesForSource2();
        enableDropZone("dropZone2");
        sourceBFileName = undefined;
        excludeNone = true;
        var fileExtensionA;
        var fileExtensionB;
        var sourceType;
        if (sourceAFileName !== undefined) {
            fileExtensionA = xCheckStudio.Util.getFileExtension(sourceAFileName).toUpperCase();
            sourceType = fileExtensionA.toLowerCase();
        }

        sourceManager2 = null;
        if (sourceAFileName == undefined && sourceBFileName == undefined) {
            excludeNone = false;
        }
        getCheckCase(sourceType, 'viewerContainer1');
        clearDBEntriesOnClearModule(source);

    }
}
function cancelreviewresults() {
    sourceAComplianceCheckManager = undefined;
    sourceBComplianceCheckManager = undefined;
    comparisonCheckManager = undefined;

    document.getElementById("checkcompletealert").style.display = "none";
}

function reviewresults() {
    saveData();
    window.location = "module2.html";
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
    var loadsavedproject = localStorage.getItem('loadSavedProject')
    
    if(loadsavedproject == 'true') {
        return true;
    }
    else 
    {
        return false;
    }
    // return new Promise((resolve) => {

    //     $.ajax({
    //         data: {
    //             'InvokeFunction': 'IsLoadProject'
    //         },
    //         type: "POST",
    //         url: "PHP/ProjectManager.php"
    //     }).done(function (msg) {
    //         var result = false;
    //         if (msg.toLowerCase() === 'true') {
    //             result = true;
    //         }

    //         resolve(result);
    //     });
    // });
}


function loadProjectForCheck() {
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var object = JSON.parse(projectinfo);

    // restore the control state
    $.ajax({
        data: {
            'InvokeFunction': 'ReadCheckModuleControlsState',
            'ProjectName': object.projectname
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
        data: {
            'ProjectName': object.projectname
        },
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
                data: {
                    'ProjectName': object.projectname
                },
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

                if ('orderMaintained' in dataSourceInfo &&
                    dataSourceInfo['orderMaintained'].toLowerCase === 'false') {
                    OrderMaintained = 'false';
                }
                else {
                    OrderMaintained = 'true';
                }
            }
            getSelectedComponentsFromDB(source).then(function (selectedCompsResult) {

                var selectedComponents = undefined;
                // select source A selected components
                if ('SourceANodeIdwiseSelectedComps' in AllSelectedComponenets) {
                    selectedComponents = AllSelectedComponenets['SourceANodeIdwiseSelectedComps'];
                }

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

                // get project name
                // $.ajax({
                //     data: { 'variable': 'ProjectName' },
                //     type: "POST",
                //     url: "PHP/GetSessionVariable.php"
                // }).done(function (msg) {
                //     if (msg !== 'fail') {
                //         // load source A
                        
                //     }
                // });
            });
        }
    });
}

function loadSourceA(viewerParams, dataSourceInfo, selectedComponents) {

    return new Promise((resolve) => {

        if (dataSourceInfo.sourceAType.toLowerCase() === "xls" ||
            dataSourceInfo.sourceAType.toLowerCase() === "json") {
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var object = JSON.parse(projectinfo);
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
                    if (msg != 'fail' &&
                        msg != "") {
                        var sourceAClassWiseComponents = JSON.parse(msg);

                        // open tab 
                        OpenTab('tab1');

                        if (dataSourceInfo.sourceAType.toLowerCase() === "xls") {
                            restoreExcelDataSource(sourceAClassWiseComponents,
                                "viewerContainer1",
                                "modelTree1",
                                selectedComponents,
                                dataSourceInfo["sourceAFileName"]);
                        }
                        else if (dataSourceInfo.sourceAType.toLowerCase() === "json") {
                            restoreDBDataSource(sourceAClassWiseComponents,
                                "viewerContainer1",
                                "modelTree1",
                                selectedComponents,
                                dataSourceInfo["sourceAFileName"]);
                        }

                         // hide load data source a button
                         hideLoadButton("modelTree1");
                         
                         addTabHeaders("modelTree1", dataSourceInfo["sourceAFileName"]);
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
                    }

                    return resolve(true);
                }
            });
        }
        else {

            if (viewerParams['SourceAContainerId'] === undefined ||
                viewerParams['SourceAEndPointUri'] === undefined) {
                return;
            }

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

            sourceManager1 = createSourceManager(fileExtension,
                "viewerContainer1",
                "modelTree1",
                viewerParams['SourceAEndPointUri']);
            sourceManager1.LoadData(selectedComponents).then(function (result) {

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

        if (dataSourceInfo.sourceBType.toLowerCase() === "xls" ||
            dataSourceInfo.sourceBType.toLowerCase() === "json") {
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var object = JSON.parse(projectinfo);
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
                    if (msg != 'fail' &&
                        msg != "") {
                        var sourceBClassWiseComponents = JSON.parse(msg);

                        // open tab to avoid issue of viewer not getting updated with model, 
                        // when tab is hidden and model is loaded on it
                        CreateNewTab();
                        OpenTab('tab2');

                        if (dataSourceInfo.sourceAType.toLowerCase() === "xls") {
                            restoreExcelDataSource(sourceBClassWiseComponents,
                                "viewerContainer2",
                                "modelTree2",
                                selectedComponents,
                                dataSourceInfo["sourceBFileName"]);
                        }
                        else if (dataSourceInfo.sourceAType.toLowerCase() === "json") {
                            restoreDBDataSource(sourceBClassWiseComponents,
                                "viewerContainer2",
                                "modelTree2",
                                selectedComponents,
                                dataSourceInfo["sourceBFileName"]);
                        }

                        addTabHeaders("modelTree2", dataSourceInfo["sourceAFileName"]);
                        // hide load data source b button
                        hideLoadButton("modelTree2");

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
                    }

                    return resolve(true);
                }
            });
        }
        else {

            if (viewerParams['SourceBContainerId'] === undefined ||
                viewerParams['SourceBEndPointUri'] === undefined) {
                return;
            }

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
            sourceManager2 = createSourceManager(fileExtension,
                "viewerContainer2",
                "modelTree2",
                viewerParams['SourceBEndPointUri']);
            sourceManager2.LoadData(selectedComponents).then(function (result) {

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
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var object = JSON.parse(projectinfo);
        $.ajax({
            url: 'PHP/DataSourceInfoReader.php',
            type: "POST",
            async: true,
            data: {
                'ProjectName': object.projectname
            },
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
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var object = JSON.parse(projectinfo);

    return new Promise((resolve) => {
        $.ajax({
            data: {
                'InvokeFunction': 'ReadSelectedComponents',
                'source': source,
                'ProjectName': object.projectname
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

function onHomeClick() {
    if (confirm("You will be redirected to the Home page.\nAre you sure?")) {
        window.location = "landingPage.html";
    }
}

function onSaveProject(event) {
    var busySpinner = document.getElementById("divLoading");
    busySpinner.className = 'show';
    try {

        // create project DB
        createProjectDBonSave().then(function (result) {
            if (result) {

                // save components to checkspaceDB
                saveComponentsToCheckSpaceDB();

                // save control states
                saveControlsState();

                // save data source info
                saveDataSourceInfo();

                // save source viewer options
                saveSourceViewerOptions();

                // save selected components
                saveSelectedComponents();

                // save not selected components
                saveNotSelectedComponents();

                alert("Saved project information.");
            }
        });
    }
    catch (error) {
        console.log(error.message);
    }
    finally {
        // remove busy spinner        
        busySpinner.classList.remove('show')
    }
}

function saveComponentsToCheckSpaceDB() {
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var object = JSON.parse(projectinfo);
    $.ajax({
        url: 'PHP/ProjectManager.php',
        type: "POST",
        async: false,
        data:
        {
            'InvokeFunction': "SaveComponentsToCheckSpaceDB",
            'ProjectName': object.projectname
        },
        success: function (msg) {
        }
    });
}

function createProjectDBonSave() {
    return new Promise((resolve) => {
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var object = JSON.parse(projectinfo);

        $.ajax({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "CreateProjectDBonSaveInCheckModule",
                'ProjectName': object.projectname
            },
            success: function (msg) {
                if (msg != 'fail') {
                    return resolve(true);
                }

                return resolve(false);
            }
        });
    });
}

function saveNotSelectedComponents() {
    // write source a selected components
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var object = JSON.parse(projectinfo);
    if (sourceManager1) {
        var selectedCompoents = sourceManager1.ModelTree.GetSelectedComponents();

        // write source a selected components
        $.ajax({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "SaveNotSelectedComponents",
                "notSelectedComponentsTable": "SourceANotSelectedComponents",
                "selectedComponents": JSON.stringify(selectedCompoents),
                "componentsTable": "SourceAComponents",
                "ProjectName": object.projectname
            },
            success: function (msg) {
            }
        });
    }

    // write source Bselected components
    if (sourceManager2) {
        var selectedCompoents = sourceManager2.ModelTree.GetSelectedComponents();

        // write source a selected components
        $.ajax({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "SaveNotSelectedComponents",
                "notSelectedComponentsTable": "SourceBNotSelectedComponents",
                "selectedComponents": JSON.stringify(selectedCompoents),
                "componentsTable": "SourceBComponents",
                "ProjectName": object.projectname
            },
            success: function (msg) {
            }
        });
    }
}

function saveSelectedComponents() {
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var object = JSON.parse(projectinfo);
    // write source a selected components
    if (sourceManager1) {
        var selectedCompoents = sourceManager1.ModelTree.GetSelectedComponents();
        var nodeIdvsComponentIdList = sourceManager1.NodeIdvsComponentIdList;
        // write source a selected components
        $.ajax({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "SaveSelectedComponents",
                "selectedComponentsTableName": "SourceASelectedComponents",
                "nodeIdvsComponentIdList": JSON.stringify(nodeIdvsComponentIdList),
                "selectedComponents": JSON.stringify(selectedCompoents),
                "ProjectName": object.projectname
            },
            success: function (msg) {
            }
        });
    }

    // write source b selected components
    if (sourceManager2) {
        var selectedCompoents = sourceManager2.ModelTree.GetSelectedComponents();
        var nodeIdvsComponentIdList = sourceManager2.NodeIdvsComponentIdList;
        // write source a selected components
        $.ajax({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "SaveSelectedComponents",
                "selectedComponentsTableName": "SourceBSelectedComponents",
                "nodeIdvsComponentIdList": JSON.stringify(nodeIdvsComponentIdList),
                "selectedComponents": JSON.stringify(selectedCompoents),
                "ProjectName": object.projectname
            },
            success: function (msg) {
            }
        });
    }
}
function saveSourceViewerOptions() {

    // write source a viewer options
    if (sourceManager1 &&
        sourceManager1.Webviewer &&
        sourceManager1.Webviewer._params) {

        var viewerOptions = [];
        viewerOptions.push(sourceManager1.Webviewer._params.containerId);
        viewerOptions.push(sourceManager1.Webviewer._params.endpointUri);
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var object = JSON.parse(projectinfo);
        // write viewer options data to data base
        $.ajax({
            url: 'PHP/ViewerOptionsWriter.php',
            type: "POST",
            async: false,
            data:
            {
                "SourceViewerOptions": JSON.stringify(viewerOptions),
                "SourceViewerOptionsTable": "SourceAViewerOptions",
                'ProjectName': object.projectname
            },
            success: function (msg) {
            }
        });
    }

    // write source b viewer options
    if (sourceManager2 &&
        sourceManager2.Webviewer &&
        sourceManager2.Webviewer._params) {

        var viewerOptions = [];
        viewerOptions.push(sourceManager2.Webviewer._params.containerId);
        viewerOptions.push(sourceManager2.Webviewer._params.endpointUri);
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var object = JSON.parse(projectinfo);
        // write viewer options data to data base
        $.ajax({
            url: 'PHP/ViewerOptionsWriter.php',
            type: "POST",
            async: false,
            data:
            {
                "SourceViewerOptions": JSON.stringify(viewerOptions),
                "SourceViewerOptionsTable": "SourceBViewerOptions",
                'ProjectName': object.projectname
            },
            success: function (msg) {
            }
        });
    }
}

function saveDataSourceInfo() {

    var sourceAType = undefined;
    if (sourceManager1) {
        sourceAType = sourceManager1.SourceType;
    }
    var sourceBType = undefined;
    if (sourceManager2) {
        sourceBType = sourceManager2.SourceType;
    }
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var object = JSON.parse(projectinfo);
    $.ajax
        ({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "SaveDatasourceInfo",
                "SourceAFileName": sourceAFileName,
                "SourceBFileName": sourceBFileName,
                "SourceAType": sourceAType,
                "SourceBType": sourceBType,
                "orderMaintained": OrderMaintained,
                "ProjectName": object.projectname
            },
            success: function (msg) {

            },
            error: function (error) {
                console.log(error)
            }
        });
}

function saveControlsState() {
    var controlStatesArray = getControlStates();
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var object = JSON.parse(projectinfo);
    $.ajax
        ({
            url: 'PHP/ProjectManager.php',
            type: "POST",
            async: false,
            data:
            {
                'InvokeFunction': "SaveCheckModuleControlsState",
                "comparisonSwithOn": controlStatesArray['ComparisonSwitch'],
                "sourceAComplianceSwitchOn": controlStatesArray['SourceAComplianceSwitch'],
                "sourceBComplianceSwitchOn": controlStatesArray['SourceBComplianceSwitch'],
                "sourceACheckAllSwitchOn": controlStatesArray['SourceACheckAllSwitch'],
                "sourceBCheckAllSwitchOn": controlStatesArray['SourceBCheckAllSwitch'],
                "ProjectName": object.projectname
            },
            success: function (msg) {

            },
            error: function (error) {
                console.log(error)
            }
        });
}

function getControlStates() {
    // control states
    var comparisonCB = document.querySelector('.module1 .group31 .comparisonswitch .toggle-2udj');
    var complianceSourceACB = document.querySelector('.module1 .group1 .complianceswitch .toggle-Hm8P');
    var complianceSourceBCB = document.querySelector('.module1 .group2 .complianceswitch .toggle-Hm8P2');
    var sourceACheckAllCB = document.querySelector('.module1 .group1 .checkallswitch .toggle-KJzr');
    var sourceBCheckAllCB = document.querySelector('.module1 .group2 .checkallswitch .toggle-KJzr2');

    var comparisonSwitchOn = 'false';
    if (comparisonCB.classList.contains("state2")) {
        comparisonSwitchOn = 'true';
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

    var controlStatesArray = {};
    controlStatesArray['ComparisonSwitch'] = comparisonSwitchOn;
    controlStatesArray['SourceAComplianceSwitch'] = sourceAComplianceSwitchOn;
    controlStatesArray['SourceBComplianceSwitch'] = sourceBComplianceSwitchOn;
    controlStatesArray['SourceACheckAllSwitch'] = sourceACheckAllSwitchOn;
    controlStatesArray['SourceBCheckAllSwitch'] = sourceBCheckAllSwitchOn;

    return controlStatesArray;
}
