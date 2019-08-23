
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
    NodeId: 4
}

// column names
const ModelBrowserColumnNames3D = {
    Select: "",
    Component: "Item",
    MainClass: "Category",
    SubClass: "Item Class",
    NodeId: "NodeId"
}

// 1D Model browser
// column indices
const ModelBrowserColumns1D = {
    Select: 0,
    Component: 1,
    MainClass: 2,
    SubClass: 3,
    Description: 4
}

// column names
const ModelBrowserColumnNames1D = {
    Select: "",
    Component: "Item",
    MainClass: "Category",
    SubClass: "Item Class",
    Description: "Description"
}
