
function createSourceManager(fileName,
    sourceType,
    viewerContainer,
    modelTreeContainer,
    uri) {
    var sourceManager = undefined;
    viewerOptions = {
        containerId: viewerContainer,
        endpointUri: uri,
        modelTree: modelTreeContainer
    };
    var type = sourceType.toLowerCase();
    switch(type) {
        case "xml":
            sourceManager = new XMLSourceManager(fileName, sourceType, viewerOptions);
        break;
        case "rvm":
            sourceManager = new RVMSourceManager(fileName, sourceType, viewerOptions);
        break;
        case "sldasm":
        case "sldprt":
            sourceManager = new SolidWorksSourceManager(fileName, sourceType, viewerOptions);
        break;
        case "dwg":
            sourceManager = new DWGSourceManager(fileName, sourceType, viewerOptions);
        break;
        case "rvt":
        case "rfa":
            sourceManager = new RVTSourceManager(fileName, sourceType, viewerOptions);
        break;
        case "ifc":
            sourceManager = new IFCSourceManager(fileName, sourceType, viewerOptions);
        break;
        case "step":
        case "stp":
        case "ste":
            sourceManager = new STEPSourceManager(fileName, sourceType, viewerOptions);
        break;
        case "igs":
            sourceManager = new IGSSourceManager(fileName, sourceType, viewerOptions);
        break;
        case "json":
            sourceManager = new DBSourceManager(fileName, sourceType, viewerContainer, modelTreeContainer);
        break;
        case "xls":
            sourceManager = new ExcelSourceManager(fileName, sourceType, viewerContainer, modelTreeContainer);
        break;
    }
    return sourceManager;
}

