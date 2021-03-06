
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
var Sources1D = ["json", "mssql", "mysql", "xls"];
var SourcesVSD = [ "vsd", "vsdx"];

var ExcelSources = ["xls"];
var DBSources = ["json"];

// comparison main review table
// indices
const ComparisonColumns = {
    Select: 0,
    SourceAName: 1,
    SourceBName: 2,
    SourceCName: 3,
    SourceDName: 4,
    Status: 5,
    SourceANodeId: 6,
    SourceBNodeId: 7,
    SourceCNodeId: 8,
    SourceDNodeId: 9,
    SourceAId: 10,
    SourceBId: 11,
    SourceCId: 12,
    SourceDId: 13,
    ResultId: 14,
    GroupId: 15,
    ClassMappingInfo: 16
}

// column names
const ComparisonColumnNames = {
    Select: "Select",
    SourceAName: "SourceA",
    SourceBName: "SourceB",
    SourceCName: "SourceC",
    SourceDName: "SourceD",
    Status: "Status",
    SourceANodeId: "SourceANodeId",
    SourceBNodeId: "SourceBNodeId",
    SourceCNodeId: "SourceCNodeId",
    SourceDNodeId: "SourceDNodeId",
    SourceAId: "SourceAId",
    SourceBId: "SourceBId",
    SourceCId: "SourceCId",
    SourceDId: "SourceDId",
    ResultId: "ID",
    GroupId: "groupId",
    ClassMappingInfo : "ClassMappingInfo"
}

// comparison property table
// indices
const ComparisonPropertyColumns = {
    Select: 0,
    SourceAName: 1,
    SourceAValue: 2,
    SourceBValue: 3,
    SourceBName: 4,
    SourceCName: 5,
    SourceCValue: 6,    
    SourceDValue: 7,
    SourceDName: 8,
    Status: 9,
    PropertyId: 10   
}

// column names
const ComparisonPropertyColumnNames = {
    Select: "Select",
    SourceAName: "PropertyA",
    SourceAValue: "ValueA",
    SourceBValue: "ValueB",
    SourceBName: "PropertyB",
    SourceCName: "PropertyC",
    SourceCValue: "ValueC",    
    SourceDValue: "ValueD",
    SourceDName: "PropertyD",
    Status: "Status",
    PropertyId: "PropertyId"
}


// Compliance main review table
const ComplianceColumns = {
    Select: 0,
    SourceName: 1,
    Status: 2,
    NodeId: 3,
    SourceId: 4,
    ResultId: 5,
    GroupId: 6

    // // Select: 0,
    // SourceName: 0,
    // Status: 1,
    // NodeId: 2,
    // ResultId: 3,
    // GroupId: 4
}

// Compliance main review column names
const ComplianceColumnNames = {
    Select: "Select",
    SourceName: "SourceA",
    Status: "Status",
    NodeId: "NodeId",
    SourceId: "SourceId",
    ResultId: "ID",
    GroupId: "groupId"
}

const CompliancePropertyColumns = {
    Select: 0,
    PropertyName: 1,
    PropertyValue: 2,
    Status: 3,
    PropertyId: 4,
    Rule : 5,
}

// column names
const CompliancePropertyColumnNames = {
    Select: "Select",
    PropertyName: "Property",
    PropertyValue: "Value",
    PropertyId: "PropertyId",
    Status: "Status",
    Rule : "Condition",
}


const Comparison = {
    MainReviewContainer: "comparisonMainContainer",
    DetailInfoContainer: "comparisonDetailInfo",
    ViewerAContainer: "compare1",
    ViewerBContainer: "compare2",
    ViewerCContainer: "compare3",
    ViewerDContainer: "compare4",

    LargeAnalyticsContainer: "largeAnalyticsContainer",
    AnalyticsButton: "comparisonAnalyticsBtn",
    SmallAnalyticsContainer: "comparisonSmallAnalyticsContainer",

}

const Compliance = {
    MainReviewContainer: "complianceMainContainer",
    DetailInfoContainer: "complianceDetailInfo",
    ViewerContainer: "compliance1",

    AnalyticsButton: "complianceAnalyticsBtn",
    SmallAnalyticsContainer: "complianceSmallAnalyticsContainer",
}

// menu bar
const MenuBar = {
    ReCheckBtn: "reCheck",
    ShowAllBtn: "showAll",
    RevisionBtn: "revision",
    DisplayBtn: "display",
    CheckInfoBtn: "checkInfo",
    SaveProgressBtn: "saveProgress",
    ReloadBtn: "reload",
    NavCubeBtn: "navCube",
}

/* Comparison model browser */
const Comparison3DBrowserNames = {    
    Component: "Item",
    MainClass: "Category",
    SubClass: "Class",
    Status: "Status",
    NodeId : "NodeId",
    ResultId : "ResultId",
    GroupId : "GroupId",
    Parent : "Parent"
}

const Comparison3DBrowserColumns = {  
    Component: 0,
    MainClass: 1,
    SubClass: 2,
    Status: 3,
    NodeId : 4,
    ResultId : 5,
    GroupId : 6,
    Parent : 7
}

const Comparison1DBrowserNames = {    
    Component: "Item",
    MainClass: "Category",
    SubClass: "Class",
    Status: "Status",    
    ResultId : "ResultId",
    GroupId : "GroupId",
    Parent : "Parent",
    Id : "Id"
}

const Comparison1DBrowserColumns = {  
    Component: 0,
    MainClass: 1,
    SubClass: 2,
    Status: 3,    
    ResultId : 4,
    GroupId : 5,
    Parent : 6,
    Id : 7
}

const ComparisonVisioBrowserNames = {
    Component: "Item",
    MainClass: "Category",
    SubClass: "Class",
    Status: "Status",
    NodeId: "NodeId",
    ResultId: "ResultId",
    GroupId: "GroupId",
    Parent: "Parent"
}

const ComparisonVisioBrowserColumns = {
    Component: 0,
    MainClass: 1,
    SubClass: 2,
    Status: 3,
    NodeId: 4,
    ResultId: 5,
    GroupId: 6,
    Parent : 7
}

/* Comparison model browser detailed table */
const ComparisonBrowserDetailedNames = {    
    PropertyName: "Property",
    PropertyValue: "Value",
    Mapping: "Mapping",
    Status: "Status"
}

const ComparisonBrowserDetailedColumns = {   
    PropertyName: 0,
    PropertyValue: 1,
    Mapping: 2,
    Status: 3
}

// compliance model browser
const Compliance3DBrowserColumns = {  
    Component: 0,
    MainClass: 1,
    SubClass: 2,
    Status: 3,
    NodeId : 4,
    ResultId : 5,
    GroupId : 6,
    Parent : 7
}

const Compliance3DBrowserNames = {    
    Component: "Item",
    MainClass: "Category",
    SubClass: "Class",
    Status: "Status",
    NodeId : "NodeId",
    ResultId : "ResultId",
    GroupId : "GroupId",
    Parent : "Parent"
}

const Compliance1DBrowserColumns = {  
    Component: 0,
    MainClass: 1,
    SubClass: 2,
    Status: 3,    
    ResultId : 4,
    GroupId : 5,
    Parent : 6,
    Id : 7
}

const Compliance1DBrowserNames = {    
    Component: "Item",
    MainClass: "Category",
    SubClass: "Class",
    Status: "Status",    
    ResultId : "ResultId",
    GroupId : "GroupId",
    Parent : "Parent",
    Id : "Id"
}

const ComplianceVisioBrowserColumns = {  
    Component: 0,
    MainClass: 1,
    SubClass: 2,
    Status: 3,
    NodeId : 4,
    ResultId : 5,
    GroupId : 6,
    Parent : 7
}

const ComplianceVisioBrowserNames = {    
    Component: "Item",
    MainClass: "Category",
    SubClass: "Class",
    Status: "Status",
    NodeId : "NodeId",
    ResultId : "ResultId",
    GroupId : "GroupId",
    Parent : "Parent"
}

/* Compliance model browser detailed table */
const ComplianceBrowserDetailedNames = {    
    PropertyName: "Property",
    PropertyValue: "Value",  
    Status: "Status"
}

const ComplianceBrowserDetailedColumns = {   
    PropertyName: 0,
    PropertyValue: 1,   
    Status: 2
}


const DontColorComponents = {
    "centerline": {
        "mainClass": "component",
        "parentMainClass": "pipingnetworksegment"
    }
};

const OverrideSeverityColorComponents = {
    "pipingnetworksystem": ["pipingnetworksegment"],
    "pipe": ["bran"],
    "hvac": ["bran"],
    "equi": ["cone", "cyli", "dish"]
};
