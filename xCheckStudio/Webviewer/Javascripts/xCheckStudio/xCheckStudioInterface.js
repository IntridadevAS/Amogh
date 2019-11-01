
function createSourceManager(id,
    fileName,
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
            sourceManager = new XMLSourceManager(id, fileName, sourceType, viewerOptions);
        break;
        case "rvm":
            sourceManager = new RVMSourceManager(id, fileName, sourceType, viewerOptions);
        break;
        case "sldasm":
        case "sldprt":
            sourceManager = new SolidWorksSourceManager(id, fileName, sourceType, viewerOptions);
        break;
        case "dwg":
            sourceManager = new DWGSourceManager(id, fileName, sourceType, viewerOptions);
        break;
        case "rvt":
        case "rfa":
            sourceManager = new RVTSourceManager(id, fileName, sourceType, viewerOptions);
        break;
        case "ifc":
            sourceManager = new IFCSourceManager(id, fileName, sourceType, viewerOptions);
        break;
        case "step":
        case "stp":
        case "ste":
            sourceManager = new STEPSourceManager(id, fileName, sourceType, viewerOptions);
        break;
        case "igs":
            sourceManager = new IGSSourceManager(id, fileName, sourceType, viewerOptions);
        break;
        case "json":
            sourceManager = new DBSourceManager(id, fileName, sourceType, viewerContainer, modelTreeContainer);
        break;
        case "xls":
            sourceManager = new ExcelSourceManager(id, fileName, sourceType, viewerContainer, modelTreeContainer);
        break;
    }
    return sourceManager;
}

