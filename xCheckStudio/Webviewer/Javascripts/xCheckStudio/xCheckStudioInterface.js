
function createSourceManager(fileName,
    sourceType,
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

        sourceManager = new XMLSourceManager(fileName, sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "rvm") {
        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };
        sourceManager = new RVMSourceManager(fileName, sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "sldasm" ||
        sourceType.toLowerCase() === "sldprt") {
        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };
        sourceManager = new SolidWorksSourceManager(fileName, sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "dwg") {
        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };
        sourceManager = new DWGSourceManager(fileName, sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "rvt" ||
        sourceType.toLowerCase() === "rfa") {
        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };
        sourceManager = new RVTSourceManager(fileName, sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "ifc") {
        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };
        sourceManager = new IFCSourceManager(fileName, sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "step" ||
        sourceType.toLowerCase() === "stp" ||
        sourceType.toLowerCase() === "ste") {
        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };
        sourceManager = new STEPSourceManager(fileName, sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "igs") {
        viewerOptions = {
            containerId: viewerContainer,
            endpointUri: uri,
            modelTree: modelTreeContainer
        };
        sourceManager = new IGSSourceManager(fileName, sourceType, viewerOptions);
    }
    else if (sourceType.toLowerCase() === "json") {
        sourceManager = new DBSourceManager(fileName, sourceType, viewerContainer, modelTreeContainer);
    }
    else if (sourceType.toLowerCase() === "xls") {
        sourceManager = new ExcelSourceManager(fileName, sourceType, viewerContainer, modelTreeContainer);
    }

    return sourceManager;
}

