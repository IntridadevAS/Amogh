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

function populateCheckResults(comparisonCheckGroups,
    sourceAComplianceCheckGroups,
    sourceBComplianceCheckGroups) 
{
    if(!comparisonCheckGroups &&
      !sourceAComplianceCheckGroups &&
      !sourceBComplianceCheckGroups)
    {
        return;
    }

    $.ajax({
        url: 'PHP/SourceViewerOptionsReader.php',
        type: "POST",
        async: true,
        data: {},
        success: function (msg) {
            var viewerOptions = JSON.parse(msg);

            if (comparisonCheckGroups) {
                loadComparisonData(comparisonCheckGroups, viewerOptions);
            }

            if (sourceAComplianceCheckGroups) {
                loadSourceAComplianceData(sourceAComplianceCheckGroups,
                    viewerOptions);
            }

            if (sourceBComplianceCheckGroups) {
                loadSourceBComplianceData(sourceBComplianceCheckGroups, 
                                          viewerOptions);
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

    function loadSourceAComplianceData(complianceCheckGroups,
        viewerOptions) {

        sourceAComplianceReviewManager = new ComplianceReviewManager(complianceCheckGroups,
            [viewerOptions['SourceAContainerId'], viewerOptions['SourceAEndPointUri']],
            'SourceAComplianceMainReviewCell',
            'SourceAComplianceDetailedReviewCell',
            'SourceAComplianceDetailedReviewComment');

        // populate review table
        sourceAComplianceReviewManager.populateReviewTable();

    }

    function loadSourceBComplianceData(complianceCheckGroups,
        viewerOptions) {

        sourceBComplianceReviewManager = new  ComplianceReviewManager(complianceCheckGroups,
            [viewerOptions['SourceBContainerId'], viewerOptions['SourceBEndPointUri']],
            'SourceBComplianceMainReviewCell',
            'SourceBComplianceDetailedReviewCell',
            'SourceBComplianceDetailedReviewComment');

        // populate review table
        sourceBComplianceReviewManager.populateReviewTable();
    }

    function loadComparisonData(comparisonCheckGroups, 
                                viewerOptions)
    {
        comparisonReviewManager = new ComparisonReviewManager(comparisonCheckGroups,
            [viewerOptions['SourceAContainerId'], viewerOptions['SourceAEndPointUri']],
            [viewerOptions['SourceBContainerId'], viewerOptions['SourceBEndPointUri']],
            undefined,
            undefined,
            "ComparisonMainReviewCell",
            "ComparisonDetailedReviewCell"/*,
            undefined,
            undefined,
            undefined,
            undefined*/);

        // populate review table
        comparisonReviewManager.populateReviewTable();     
    }
}