
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
        case "dxf":
            sourceManager = new DWGSourceManager(id, fileName, sourceType, viewerOptions);
        case "dwf":
        case "dwfx":
            sourceManager = new DWFSourceManager(id, fileName, sourceType, viewerOptions);
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
        case "vsd":
        case "vsdx":
            sourceManager = new VisioManager(id, fileName, sourceType, viewerOptions);
            break;
        case "jt":
        case "prt":
        case "mf1":
        case "arc":
        case "unv":
        case "pkg":
        case "model":
        case "session":
        case "dlv":
        case "exp":
        case "catdrawing":
        case "catpart":
        case "catproduct":
        case "catshape":
        case "cgr":
        case "3dxml":
        case "obj":
        case "asm":
        case "neu":
        case "xas":
        case "xpr":
        case "ipt":
        case "iam":
        case "asm":
        case "par":
        case "pwd":
        case "psm":
        case "3ds":
        case "u3d":
        case "sat":
        case "sab":
            sourceManager = new SCManager(id, fileName, sourceType, viewerOptions);
            break;
    }
    return sourceManager;
}

