
function createSourceManager(sourceType,
    viewerContainer,
    modelTreeContainer,
    uri) {
    var sourceManager = undefined;
    if (sourceType.toLowerCase() === "xml") {

        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };

        sourceManager = new XMLSourceManager(sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "rvm") {
        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };
        sourceManager = new RVMSourceManager(sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "sldasm" ||
        sourceType.toLowerCase() === "sldprt") {
        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };
        sourceManager = new SolidWorksSourceManager(sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "dwg") {
        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };
        sourceManager = new DWGSourceManager(sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "rvt" ||
        sourceType.toLowerCase() === "rfa") {
        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };
        sourceManager = new RVTSourceManager(sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "ifc") {
        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };
        sourceManager = new IFCSourceManager(sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "step" ||
        sourceType.toLowerCase() === "stp" ||
        sourceType.toLowerCase() === "ste") {
        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };
        sourceManager = new STEPSourceManager(sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "igs") {
        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };
        sourceManager = new IGSSourceManager(sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "json") {
        sourceManager = new DBSourceManager(sourceType, viewerContainer, modelTreeContainer);
    }
    else if (sourceType.toLowerCase() === "xls") {
        sourceManager = new ExcelSourceManager(sourceType, viewerContainer, modelTreeContainer);
    }

    return sourceManager;
}

