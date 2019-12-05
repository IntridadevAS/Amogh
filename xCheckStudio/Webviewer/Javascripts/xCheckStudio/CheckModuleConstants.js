
// all 3D and 1D source extensions
// source extensions in lowercase
var Sources3D = ["xml",
    "rvm",
    "sldasm",
    "dwg",
    "sldprt",
    "rvt",
    "rfa",
    "ifc",
    "step",
    "stp",
    "ste",
    "igs"];
var Sources1D = ["json",
    "xls"];

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
