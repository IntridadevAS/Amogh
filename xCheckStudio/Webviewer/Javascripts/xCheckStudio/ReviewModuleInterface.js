var ReviewModuleInterface = function () {
    ReviewModuleInterface.prototype.loadModels = function (viewerOptions1, viewerOptions2) {
        reviewModuleViewerInterface1 = new ReviewModuleViewerInterface(viewerOptions1);
        reviewModuleViewerInterface1.setupViewer();

        reviewModuleViewerInterface2 = new ReviewModuleViewerInterface(viewerOptions2);
        reviewModuleViewerInterface2.setupViewer();
    }

    ReviewModuleInterface.prototype.createReviewManager = function () {
        var parsedCheckmanagerData = JSON.parse(localStorage['checkManager']);
        // localStorage.removeItem('checkManager');

        var checkManager = new CheckManager("");
        checkManager.restore(parsedCheckmanagerData)

        // populate review table 
        reviewManager = new ReviewManager(checkManager);
        reviewManager.populateReviewTables();

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