
var ReviewModuleInterface = function () {
    ReviewModuleInterface.prototype.loadModels = function (viewerOptions1, viewerOptions2) {
        reviewModuleViewerInterface1 = new ReviewModuleViewerInterface(viewerOptions1);
        reviewModuleViewerInterface1.setupViewer();

        reviewModuleViewerInterface2 = new ReviewModuleViewerInterface(viewerOptions2);
        reviewModuleViewerInterface2.setupViewer();
    }

    ReviewModuleInterface.prototype.createReviewManager = function () {
        // create check managers
        var comparisonCheckManager;
        var sourceAComplianceCheckManager;
        var sourceBComplianceCheckManager;

        if (comparisonCheckData) {
            comparisonCheckManager = new CheckManager("");
            comparisonCheckManager.restore(comparisonCheckData)
        }

        if (sourceAComplianceData) {
            sourceAComplianceCheckManager = new CheckManager("");
            sourceAComplianceCheckManager.restore(sourceAComplianceData)
        }

        if (sourceBComplianceData) {
            sourceBComplianceCheckManager = new CheckManager("");
            sourceBComplianceCheckManager.restore(sourceBComplianceData)
        }



        // populate review table
        reviewManager = new ReviewManager();
        reviewManager.populateReviewTables(comparisonCheckManager,
            sourceAComplianceCheckManager,
            sourceBComplianceCheckManager);

        // add event handler for collapsible rows
        var collapsibleRows = document.getElementsByClassName("collapsible");
        for (var i = 0; i < collapsibleRows.length; i++) {
            collapsibleRows[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var content = this.nextElementSibling;
                if (content.style.display === "block") {
                    content.style.display = "none";
                } else {
                    content.style.display = "block";
                }
            });
        }

    }   
}