function saveData() {

    var sourceANodeIdvsComponentIdList;
    var sourceASelectedComponents;
    var sourceBNodeIdvsComponentIdList;
    var sourceBSelectedComponents;
    var sourceAType;
    var sourceBType;   
    var sourceAName;
    var sourceBName;  

    if ("a" in SourceManagers) {
        var sourceManagerA = SourceManagers["a"];
        sourceAName = sourceManagerA.SourceName;
        if (sourceManagerA.Is3DSource()) {
            //virewer container Data
            var viewerOptions = [];
            //viewerOptions.push(sourceManagerA.Webviewer._params.containerId);
            viewerOptions.push(sourceManagerA.Webviewer._params.endpointUri);
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
            // write viewer options data to data base
            $.ajax({
                url: 'PHP/ViewerOptionsWriter.php',
                type: "POST",
                async: false,
                data:
                {
                    "SourceViewerOptions": JSON.stringify(viewerOptions),
                    "SourceViewerOptionsTable": "SourceAViewerOptions",
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname
                },
                success: function (msg) {
                }
            });

            sourceANodeIdvsComponentIdList = sourceManagerA.NodeIdvsComponentIdList;
            sourceASelectedComponents = sourceManagerA.ModelTree.GetSelectedComponents();
            sourceAType = sourceManagerA.SourceType;

        }
        else if (sourceManagerA.Is1DSource()) {
            //sourceANodeIdvsComponentIdList = sourceManager1.NodeIdvsComponentIdList;
            sourceANodeIdvsComponentIdList = {};
            sourceASelectedComponents = sourceManagerA.ModelTree.GetSelectedComponents();
            sourceAType = sourceManagerA.SourceType;
        }

    }

    if ("b" in SourceManagers){
        var sourceManagerB =SourceManagers["b"];
        sourceBName = sourceManagerB.SourceName;
        if (sourceManagerB.Is3DSource()) {

            //virewer container Data
            var viewerOptions = [];
            //viewerOptions.push(sourceManagerB.Webviewer._params.containerId);
            viewerOptions.push(sourceManagerB.Webviewer._params.endpointUri);
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
            // write viewer options data to data base
            $.ajax({
                url: 'PHP/ViewerOptionsWriter.php',
                type: "POST",
                async: false,
                data:
                {
                    "SourceViewerOptions": JSON.stringify(viewerOptions),
                    "SourceViewerOptionsTable": "SourceBViewerOptions",
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname
                },
                success: function (msg) {
                }
            });


            sourceBNodeIdvsComponentIdList = sourceManagerB.NodeIdvsComponentIdList;
            sourceBSelectedComponents = sourceManagerB.ModelTree.GetSelectedComponents();
            sourceBType = sourceManagerB.SourceType;
        }
        else if (sourceManagerB.Is1DSource()) {

            //sourceBNodeIdvsComponentIdList = sourceManager2.NodeIdvsComponentIdList;
            sourceBNodeIdvsComponentIdList = {};
            sourceBSelectedComponents = sourceManagerB.ModelTree.GetSelectedComponents();
            sourceBType = sourceManagerB.SourceType;
        }
    }

    // control states
    var controlStatesArray = getControlStates();

    // write source A selected components, differet control statuses to DB        
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    
    OrderMaintained = true;
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
            "SourceAFileName": sourceAName,
            "SourceBFileName": sourceBName,
            "SourceAType": sourceAType,
            "SourceBType": sourceBType,
            "orderMaintained": OrderMaintained,
            "comparisonSwithOn": controlStatesArray['ComparisonSwitch'],
            "sourceAComplianceSwitchOn": controlStatesArray['SourceAComplianceSwitch'],
            "sourceBComplianceSwitchOn": controlStatesArray['SourceBComplianceSwitch'],
            "sourceACheckAllSwitchOn": controlStatesArray['SourceACheckAllSwitch'],
            "sourceBCheckAllSwitchOn": controlStatesArray['SourceBCheckAllSwitch'],
            "ProjectName": projectinfo.projectname,
            'CheckName': checkinfo.checkname
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
    var comparisonCB = document.getElementById('comparisonSwitch');
    var complianceCB = document.getElementById('complianceSwitch');
    //var complianceSourceBCB = document.querySelector('.module1 .group2 .complianceswitch .toggle-Hm8P2');
    // var sourceACheckAllCB = document.querySelector('.module1 .group1 .checkallswitch .toggle-KJzr');
    // var sourceBCheckAllCB = document.querySelector('.module1 .group2 .checkallswitch .toggle-KJzr2');

    var comparisonSwitchOn = 'false';
    if (comparisonCB.checked) {
        comparisonSwitchOn = 'true';
    }

    var sourceAComplianceSwitchOn = 'false';
    var sourceBComplianceSwitchOn = 'false';
    if (complianceCB.checked) {
        sourceAComplianceSwitchOn = 'true';
        sourceBComplianceSwitchOn = 'true';
    }

    // var sourceBComplianceSwitchOn = 'false';
    // if (complianceSourceBCB.classList.contains("state1")) {
    //     sourceBComplianceSwitchOn = 'true';
    // }

    var sourceACheckAllSwitchOn = 'false';
    // if (sourceACheckAllCB.classList.contains("state2")) {
    //     sourceACheckAllSwitchOn = 'true';
    // }
    var sourceBCheckAllSwitchOn = 'false';
    // if (sourceBCheckAllCB.classList.contains("state2")) {
    //     sourceBCheckAllSwitchOn = 'true';
    // }

    var controlStatesArray = {};
    controlStatesArray['ComparisonSwitch'] = comparisonSwitchOn;
    controlStatesArray['SourceAComplianceSwitch'] = sourceAComplianceSwitchOn;
    controlStatesArray['SourceBComplianceSwitch'] = sourceBComplianceSwitchOn;
    controlStatesArray['SourceACheckAllSwitch'] = sourceACheckAllSwitchOn;
    controlStatesArray['SourceBCheckAllSwitch'] = sourceBCheckAllSwitchOn;

    return controlStatesArray;
}
