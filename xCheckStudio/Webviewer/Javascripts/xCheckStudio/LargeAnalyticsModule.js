function populateLargeAnalyticsData(checkResults) {
    for (var key in checkResults) {

        if (!checkResults.hasOwnProperty(key)) {
            continue;
        }

        if (key == 'Comparisons') {
            comparisonCheckGroups = true;
        }
        else if (key == 'Compliances') {
            sourceAComplianceCheckGroups = true;
            sourceBComplianceCheckGroups = true;
        }
    }

    analyticsManager = new LargeAnalyticsManager();

    // draw pie and bar charts 
    if (comparisonCheckGroups) {
        analyticsManager.populateLargeAnalyticsComparisonCharts();
        activeResultType = "comparison";
    }

    else if (sourceAComplianceCheckGroups) {
        analyticsManager.populateLargeAnalyticsComplianceACharts();
        activeResultType = "complianceA";
    }

    else if (sourceBComplianceCheckGroups) {
        analyticsManager.populateLargeAnalyticsComplianceBCharts();
        activeResultType = "complianceB";
    }
}