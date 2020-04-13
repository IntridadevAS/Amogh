
// all 3D and 1D source extensions
// source extensions in lowercase
var Sources3D = ["xml",
    "rvm",
    "sldasm",
    "dwg",
    "dxf",
    "dwf",
    "dwfx",
    "sldprt",
    "rvt",
    "rfa",
    "ifc",
    "step",
    "stp",
    "ste",
    "igs",
    "jt",
    "prt", "mf1", "arc", "unv", "pkg",
    "model", "session", "dlv", "exp",
    "catdrawing", "catpart", "catproduct", "catshape", "cgr",
    "3dxml",
    "obj",
    "asm", "neu", "prt", "xas", "xpr",
    "ipt", "iam",
    "asm", "par", "pwd", "psm",
    "3ds",
    "u3d",
    "sat", "sab"];
var Sources1D = ["json", "xls"];
var SourcesVSD = ["vsd", "vsdx"];

var ExcelSources = ["xls"];
var DBSources = ["json"];

// 3D Model browser
// column indices
const ModelBrowserColumns3D = {
    Select: 0,
    Component: 1,
    MainClass: 2,
    SubClass: 3,
    NodeId: 4,
    Parent: 5
}

// column names
const ModelBrowserColumnNames3D = {
    Select: "",
    Component: "Item",
    MainClass: "Category",
    SubClass: "Class",
    NodeId: "NodeId",
    Parent: "parent"
}

// 1D Model browser
// column indices
const ModelBrowserColumns1D = {
    Select: 0,
    Component: 1,
    MainClass: 2,
    SubClass: 3,
    Description: 4,
    ComponentId: 5
}

// column names
const ModelBrowserColumnNames1D = {
    Select: "",
    Component: "Item",
    MainClass: "Category",
    SubClass: "Class",
    Description: "Description",
    ComponentId: "ComponentId"
}

const ModelBrowserColumnsVisio = {
    Select: 0,
    Component: 1,
    MainClass: 2,
    SubClass: 3, 
    ID: 4,
    Parent: 5
}

const ModelBrowserColumnNamesVisio = {
    Select: "",
    Component: "Item",
    MainClass: "Category",
    SubClass: "Class",   
    ID: "ID",
    Parent: "parent"
}

// menu bar
const MenuBar = {
    ShowAllBtn: "showAll",
    ReloadDataBtn: "reloadData",
    ClearDataBtn: "clearData",
    HistoryBtn: "history",
    UnitsBtn: "units",
    CheckInfoBtn: "checkInfo",
    SaveProgressBtn: "saveProgress",
    NavCubeBtn: "navCube",
}

const GlobalConstants = {
    SourceAId : "a",
    SourceBId : "b",
    SourceCId : "c",
    SourceDId : "d",
    SourceAComponentsTable : "SourceAComponents",
    SourceBComponentsTable : "SourceBComponents",
    SourceCComponentsTable : "SourceCComponents",
    SourceDComponentsTable : "SourceDComponents",
    SourceAViewerOptionsTable : "SourceAViewerOptions",
    SourceBViewerOptionsTable : "SourceBViewerOptions",
    SourceCViewerOptionsTable : "SourceCViewerOptions",
    SourceDViewerOptionsTable : "SourceDViewerOptions",
    SourceASelectedComponentsTable : "SourceASelectedComponents",
    SourceBSelectedComponentsTable : "SourceBSelectedComponents",
    SourceCSelectedComponentsTable : "SourceCSelectedComponents",
    SourceDSelectedComponentsTable : "SourceDSelectedComponents",
    SourceANotSelectedComponentsTable :  "SourceANotSelectedComponents",
    SourceBNotSelectedComponentsTable :  "SourceBNotSelectedComponents",
    SourceCNotSelectedComponentsTable :  "SourceCNotSelectedComponents",
    SourceDNotSelectedComponentsTable :  "SourceDNotSelectedComponents",
}
