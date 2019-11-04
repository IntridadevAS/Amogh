// function openProject() {

//     getProjectsInfo().then(function (projects) {
//         var loadProjectDiv = document.getElementById('loadProjectDiv');
//         loadProjectDiv.innerHTML = "";
//         // this is to keep trak of odd and even rows
//         var i = 1;
//         for (var key in projects) {
//             var project = projects[key];

//             if (!('projectname' in project) &&
//                 !('description' in project)) {
//                 continue;
//             }

//             // create div for project
//             var projectDiv = document.createElement('div');
//             projectDiv.style.width = "100%";

//             if (i % 2 === 0) {
//                 projectDiv.style.backgroundColor = '#98d0d2'
//             }
//             else {
//                 projectDiv.style.backgroundColor = '#c6d298';
//             }

//             var projectNameDiv = document.createElement('div');
//             projectNameDiv.innerText = project['projectname'];
//             projectNameDiv.style.width = "100%";
//             projectDiv.appendChild(projectNameDiv);

//             var projectDescDiv = document.createElement('div');
//             projectDescDiv.innerText = project['description'];
//             projectDescDiv.style.width = "100%";
//             projectDiv.appendChild(projectDescDiv);

//             var projectscopeDiv = document.createElement('div');
//             projectscopeDiv.innerText = project['projectscope'];
//             projectscopeDiv.style.width = "100%";
//             projectDiv.appendChild(projectscopeDiv);

//             var projectidDiv = document.createElement('div');
//             projectidDiv.innerText = project['projectid'];
//             projectidDiv.style.display = "none";
//             projectDiv.appendChild(projectidDiv);           

//             projectDiv.onclick = function () {
//                 var projectName = this.children[0].innerText;
//                 var projectId = this.children[3].innerText;

//                 loadProject(projectName, projectId);
//             }

//             loadProjectDiv.appendChild(projectDiv);

//             i++;
//         }

//         showLoadProjectDiv();
//     });
// }

function loadCheckSpaceInCheckPage() {
    initCheckSpace().then(function (result) {
        if (!result) {
            return;
        }

        // load checkspace
        loadCheckSpaceForCheck(result.Data);
    });
}

function initCheckSpace() {
    return new Promise((resolve) => {
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        $.ajax({
            data: {
                'InvokeFunction': "InitTempCheckSpaceDB",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname
            },
            async: false,
            type: "POST",
            url: "PHP/ProjectLoadManager.php"
        }).done(function (msg) {
            var message = JSON.parse(msg);
            if (message.MsgCode === 1) {
                return resolve(message);
            }

            return resolve(undefined);
        });
    });
}

function loadCheckSpaceForCheck(data) {

    if (!("controlStates" in data)) {
        return;
    }

    var controlStates = data["controlStates"];
    // readCheckModuleControlsState().then(function (controlStates) {
    //     if (!controlStates) {
    //         return;
    //     }

    // restore comparison switch state
    if ("comparisonSwith" in controlStates &&
        controlStates["comparisonSwith"].toLowerCase() === 'true') {

        var comparisonCB = document.getElementById('comparisonSwitch');
        comparisonCB.checked = true;
    }

    loadDataSets(data);
    // });

    // // restore the control state
    // $.ajax({
    //     data: {
    //         'InvokeFunction': 'ReadCheckModuleControlsState',
    //         'ProjectName': projectinfo.projectname,
    //         'CheckName': checkinfo.checkname
    //     },
    //     type: "POST",
    //     url: "PHP/ProjectManager.php"
    // }).done(function (msg) {
    //      if (msg !== 'fail') {
    //         var checkModuleControlsState = JSON.parse(msg);

    //         // comparison swith
    //         if ("comparisonSwith" in checkModuleControlsState &&
    //             checkModuleControlsState["comparisonSwith"].toLowerCase() === 'true') {

    //             var comparisonCB = document.getElementById('comparisonSwitch');
    //             comparisonCB.checked = true;
    //             // var comparisonCB = document.querySelector('.module1 .group31 .comparisonswitch .toggle-2udj');
    //             // if (comparisonCB.classList.contains('state1')) {
    //             //     comparisonCB.classList.remove("state1");
    //             //     comparisonCB.classList.add("state2");
    //             //     comparisonCB.classList.add("state1-to-state2");
    //             // }
    //         }

    //         // source A compliance swith
    //         if ("sourceAComplianceSwitch" in checkModuleControlsState &&
    //             checkModuleControlsState["sourceAComplianceSwitch"].toLowerCase() === 'true') {

    //                 var complianceCB = document.getElementById('complianceSwitch');    
    //                 complianceCB.checked = true;  
    //         }

    //         // source B compliance swith
    //         if ("sourceBComplianceSwitch" in checkModuleControlsState &&
    //             checkModuleControlsState["sourceBComplianceSwitch"].toLowerCase() === 'true') {

    //             var complianceSourceBCB = document.querySelector('.module1 .group2 .complianceswitch .toggle-Hm8P2');
    //             if (complianceSourceBCB.classList.contains('state2')) {
    //                 complianceSourceBCB.classList.remove("state2");
    //                 complianceSourceBCB.classList.add("state1");
    //                 complianceSourceBCB.classList.add("state2-to-state1");
    //             }
    //         }

    //         // source A check all swith
    //         if ("sourceACheckAllSwitch" in checkModuleControlsState &&
    //             checkModuleControlsState["sourceACheckAllSwitch"].toLowerCase() === 'true') {

    //             var sourceACheckAllCB = document.querySelector('.module1 .group1 .checkallswitch .toggle-KJzr');
    //             if (sourceACheckAllCB.classList.contains('state1')) {
    //                 sourceACheckAllCB.classList.remove("state1");
    //                 sourceACheckAllCB.classList.add("state2");
    //                 sourceACheckAllCB.classList.add("state1-to-state2");

    //             }
    //         }

    //         // source B check all swith
    //         if ("sourceBCheckAllSwitch" in checkModuleControlsState &&
    //             checkModuleControlsState["sourceBCheckAllSwitch"].toLowerCase() === 'true') {

    //             var sourceBCheckAllCB = document.querySelector('.module1 .group2 .checkallswitch .toggle-KJzr2');
    //             if (sourceBCheckAllCB.classList.contains('state1')) {
    //                 sourceBCheckAllCB.classList.remove("state1");
    //                 sourceBCheckAllCB.classList.add("state2");
    //                 sourceBCheckAllCB.classList.add("state1-to-state2");
    //             }
    //         }
    //     }
    // });


    // // read check case info
    // $.ajax({
    //     url: 'PHP/CheckCaseinfoReader.php',
    //     type: "POST",
    //     async: true,
    //     data: {
    //         'ProjectName': projectinfo.projectname,
    //         'CheckName': checkinfo.checkname
    //     },
    //     success: function (checkCaseString) {
    //         if (checkCaseString === "fail") {
    //             return;
    //         }

    //         var checkCaseInfo = JSON.parse(checkCaseString);

    //         // if ('checkCaseData' in checkCaseInfo) {
    //         //     checkCaseManager = JSON.parse(checkCaseInfo['checkCaseData']);

    //         //     if ('CheckCase' in checkCaseManager) {
    //         //         var checkCase = checkCaseManager['CheckCase'];
    //         //         if ('Name' in checkCase) {

    //         //             var checkCaseName = checkCase['Name'];

    //         //             //add check case name to check case select box and select it
    //         //             var checkCaseSelectElement = document.getElementById("checkCaseSelect");
    //         //             var option = document.createElement("option");
    //         //             option.text = checkCaseName;
    //         //             checkCaseSelectElement.add(option);
    //         //             checkCaseSelectElement.value = checkCaseName;

    //         //             checkCaseSelectElement.disabled = true;
    //         //         }
    //         //     }
    //         // }

    //         // // load sources in viewer and browser table                    
    //         // $.ajax({
    //         //     url: 'PHP/SourceViewerOptionsReader.php',
    //         //     type: "POST",
    //         //     async: true,
    //         //     data: {
    //         //         'ProjectName': projectinfo.projectname,
    //         //         'CheckName': checkinfo.checkname
    //         //     },
    //         //     success: function (vieweroptionsString) {
    //         //         var viewerOptions = JSON.parse(vieweroptionsString);

    //         //         viewPanels.addFilesPanel.classList.add("hide");

    //         //         for (var srcId in viewerOptions) {
    //         //             var viewerOption = viewerOptions[srcId];

    //         //             loadDataSource(viewerOption);
    //         //         }
    //         //     }
    //         // });
    //     }
    // });
}

function loadDataSets(data) {
    // return new Promise((resolve) => {
    if (!("checkCaseInfo" in data) ||
        !("sourceViewerOptions" in data)) {
        return;
    }
    var checkCaseInfo = data["checkCaseInfo"];
    var viewerOptions = data["sourceViewerOptions"];
    // readCheckCaseInfo().then(function (checkCaseInfo) {
    //     if (!checkCaseInfo) {
    //         return;
    //     }

    // var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    // var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    // // load sources in viewer and browser table                    
    // $.ajax({
    //     url: 'PHP/SourceViewerOptionsReader.php',
    //     type: "POST",
    //     async: true,
    //     data: {
    //         'ProjectName': projectinfo.projectname,
    //         'CheckName': checkinfo.checkname
    //     },
    //     success: function (vieweroptionsString) {
    // var viewerOptions = JSON.parse(vieweroptionsString);

    viewPanels.addFilesPanel.classList.add("hide");

    // get selected check case name
    var checkCaseName;
    if ('checkCaseData' in checkCaseInfo) {
        var checkCaseManager = JSON.parse(checkCaseInfo['checkCaseData']);

        if ('CheckCase' in checkCaseManager) {
            var checkCase = checkCaseManager['CheckCase'];
            if ('Name' in checkCase) {
                checkCaseName = checkCase['Name'];
            }
        }
    }

    for (var srcId in viewerOptions) {
        var viewerOption = viewerOptions[srcId];
        loadDataSource(viewerOption, data, checkCaseName);
    }
    //     }
    // });
    // });
    // });
}

// function readCheckModuleControlsState() {
//     return new Promise((resolve) => {

//         var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
//         var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

//         // restore the control state
//         $.ajax({
//             data: {
//                 'InvokeFunction': 'ReadCheckModuleControlsState',
//                 'ProjectName': projectinfo.projectname,
//                 'CheckName': checkinfo.checkname
//             },
//             type: "POST",
//             url: "PHP/ProjectManager.php"
//         }).done(function (msg) {
//             if (msg !== 'fail') {
//                 var checkModuleControlsState = JSON.parse(msg);
//                 return resolve(checkModuleControlsState);
//             }

//             return resolve(undefined);
//         });
//     });
// }

// function readCheckCaseInfo() {
//     return new Promise((resolve) => {

//         var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
//         var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

//         // read check case info
//         $.ajax({
//             url: 'PHP/CheckCaseinfoReader.php',
//             type: "POST",
//             async: true,
//             data: {
//                 'ProjectName': projectinfo.projectname,
//                 'CheckName': checkinfo.checkname
//             },
//             success: function (checkCaseString) {
//                 if (checkCaseString === "fail") {
//                     return resolve(undefined);
//                 }

//                 var checkCaseInfo = JSON.parse(checkCaseString);
//                 return resolve(checkCaseInfo);
//             }
//         });
//     });
// }

function loadDataSource(viewerOption, data, checkCaseName) {

    var addedSource = controller.addNewFile(viewerOption.source);
    restoreComplianceSwitchState(addedSource, data["controlStates"]);

    viewTabs.createTab(addedSource);
    viewPanels.showPanel(addedSource.viewPanel);

    // get selected components 
    var allSelectedComponents = data["selectedComponents"];
    var selectedComponents;
    if (addedSource.id === GlobalConstants.SourceAId) {
        selectedComponents = allSelectedComponents.SourceA;
    }
    else if (addedSource.id === GlobalConstants.SourceBId) {
        selectedComponents = allSelectedComponents.SourceB;
    }
    else if (addedSource.id === GlobalConstants.SourceCId) {
        selectedComponents = allSelectedComponents.SourceC;
    }
    else if (addedSource.id === GlobalConstants.SourceDId) {
        selectedComponents = allSelectedComponents.SourceD;
    }

    var fileExtension = xCheckStudio.Util.getFileExtension(viewerOption.source.toLowerCase());
    if (xCheckStudio.Util.isSource3D(fileExtension)) {

        xCheckStudio.Util.fileExists(viewerOption.endPointUri).then(function (success) {
            if (success) {

                // getSelectedComponentsFromDB(source).then(function (selectedComponents) {
                //     if (!selectedComponents) {
                //         return;
                //     }

                var sourceManager = createSourceManager(addedSource.id, 
                    viewerOption.source,
                    fileExtension,
                    addedSource.visualizer.id,
                    addedSource.tableData.id,
                    viewerOption.endPointUri);
                SourceManagers[addedSource.id] = sourceManager;

                // get hiddent components
                var hiddenItems = [];
                var hiddenComponents = data.hiddenComponents;
                if ("hiddenComponents" in hiddenComponents) {
                    var comps = JSON.parse(hiddenComponents["hiddenComponents"]);
                    if (addedSource.id in comps) {
                        for (var node in comps[addedSource.id]) {
                            hiddenItems.push(Number(node));
                        }
                    }
                }
                // get visible components
                var visibleItems = [];
                if ("visibleComponents" in hiddenComponents) {
                    var comps = JSON.parse(hiddenComponents["visibleComponents"]);
                    if (addedSource.id in comps) {
                        for (var node in comps[addedSource.id]) {
                            visibleItems.push(Number(node));
                        }
                    }
                }

                sourceManager.HiddenNodeIds = hiddenItems;

                sourceManager.LoadData(selectedComponents["NodeIdwiseSelectedComps"], visibleItems).then(function (result) {
                    filterCheckCases(fileExtension);

                    var checkCaseSelectElement = document.getElementById("checkCaseSelect");
                    checkCaseSelectElement.value = checkCaseName;
                });

                // });
            }
        });
    }
    else if (xCheckStudio.Util.isSource1D(fileExtension)) {

        if (!("classWiseComponents" in data)) {
            return;
        }

        var classWiseComponents;      
        if (addedSource.id === GlobalConstants.SourceAId) {            
            classWiseComponents = data["classWiseComponents"].SourceA;
        }
        else if (addedSource.id === GlobalConstants.SourceBId) {            
            classWiseComponents = data["classWiseComponents"].SourceB;
        }
        else if (addedSource.id === GlobalConstants.SourceCId) {
            classWiseComponents = data["classWiseComponents"].SourceC;
        }
        else if (addedSource.id === GlobalConstants.SourceDId) {
            classWiseComponents = data["classWiseComponents"].SourceD;
        }

        // var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        // var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        // // get class wise properties for excel and other 1D datasources               
        // $.ajax({
        //     url: 'PHP/ClasswiseComponentsReader.php',
        //     type: "POST",
        //     async: false,
        //     data: {
        //         'Source': source,
        //         'ProjectName': projectinfo.projectname,
        //         'CheckName': checkinfo.checkname
        //     },
        //     success: function (msg) {
        //         if (msg != 'fail') {

        //             classWiseComponents = JSON.parse(msg);

        // getSelectedComponentsFromDB(source).then(function (selectedComponents) {
        //     if (!selectedComponents) {
        //         return;
        //     }

        var sourceManager = createSourceManager(addedSource.id,
            viewerOption.source,
            fileExtension,
            addedSource.visualizer.id,
            addedSource.tableData.id);
        SourceManagers[addedSource.id] = sourceManager;

        sourceManager.RestoreData(classWiseComponents, selectedComponents["NodeIdwiseSelectedComps"]);
        // });
        // }
        // }
        // });
    }
    // });
}

// function getSelectedComponentsFromDB(source) {

//     return new Promise((resolve) => {
//         var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
//         var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

//         $.ajax({
//             data: {
//                 'InvokeFunction': 'ReadSelectedComponents',
//                 'source': source,
//                 'ProjectName': projectinfo.projectname,
//                 'CheckName': checkinfo.checkname
//             },
//             type: "POST",
//             url: "PHP/ProjectManager.php"
//         }).done(function (selectedCompsString) {

//             if (selectedCompsString) {
//                 var selectedComponenets = JSON.parse(selectedCompsString);
//                 return resolve(selectedComponenets);
//             }
//             return resolve(undefined);

//         });
//     });
// }

function restoreComplianceSwitchState(addedSource, controlStates) {
    if (addedSource.id === "a" &&
        controlStates.sourceAComplianceSwitch.toLowerCase() === "true") {
        addedSource.complianceSwitchChecked = true;
    }
    else if (addedSource.id === "b" &&
        controlStates.sourceBComplianceSwitch.toLowerCase() === "true") {
        addedSource.complianceSwitchChecked = true;
    }
    else if (addedSource.id === "c" &&
        controlStates.sourceCComplianceSwitch.toLowerCase() === "true") {
        addedSource.complianceSwitchChecked = true;
    }
    else if (addedSource.id === "d" &&
        controlStates.sourceDComplianceSwitch.toLowerCase() === "true") {
        addedSource.complianceSwitchChecked = true;
    }
}
// function loadProject(projectName, projectId) {

//     createTempCheckSpaceDB(projectName).then(function (result) {

//         $.ajax({
//             data: {
//                 'InvokeFunction': 'CreateProjectSession',
//                 'projectName': projectName,
//                 'projectId': projectId,
//                 'loadProject': 'TRUE',
//                 'sourceAPath': "Projects/" + projectName + "/SourceA",
//                 'sourceBPath': "Projects/" + projectName + "/SourceB"
//             },
//             type: "POST",
//             url: "PHP/ProjectManager.php"
//         }).done(function (msg) {
//             if (msg !== 'fail') {
//                 var fromCheckClick = localStorage.getItem('FromCheckClick')
//                 // localStorage.clear();

//                 if (fromCheckClick.toLowerCase() === 'true') {
//                     window.location.href = "checkModule.html";
//                 }
//                 else if (fromCheckClick.toLowerCase() === 'false') {
//                     window.location.href = "module2.html";
//                 }
//             }
//         });

//     });
// }

// function createTempCheckSpaceDB(projectName)
// {
//     return new Promise((resolve) => {

//         $.ajax({
//             data: {
//                 'InvokeFunction': "CreateTempCheckSpaceDB",
//                 'ProjectName': projectName
//             },
//             async: false,
//             type: "POST",
//             url: "PHP/ProjectLoadManager.php"
//         }).done(function (msg) {

//             return resolve(true);
//         });

//     });
// }

// function getProjectsInfo() {

//     return new Promise((resolve) => {
//         var userinfo = JSON.parse(localStorage.getItem('userinfo'));
//         var userId = userinfo.userid;
//         if (userId === NaN) {
//             resolve(undefined);
//         }

//         // get projects information
//         $.ajax({
//             data: {
//                 'InvokeFunction': 'GetProjects',
//                 'userid': userId
//             },
//             type: "POST",
//             url: "PHP/ProjectManager.php"
//         }).done(function (msg) {

//             if (msg !== 'fail') {
//                 var projects = JSON.parse(msg);

//                 resolve(projects);
//             }
//             else {
//                 resolve(undefined);
//             }

//         });
//     });
// }

// function showLoadProjectDiv() {
//     document.getElementById("loadProjectDiv").style.display = "block";
// }

// function closeLoadProjectDiv() {
//     document.getElementById("loadProjectDiv").style.display = "none";
// }