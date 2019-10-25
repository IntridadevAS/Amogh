// comparison main review table
// indices
const ComparisonColumns = {
    Select: 0,
    SourceAName: 1,
    SourceBName: 2,
    Status: 3,
    SourceANodeId: 4,
    SourceBNodeId: 5,
    SourceAId: 6,
    SourceBId: 7,
    ResultId: 8,
    GroupId: 9
}

// column names
const ComparisonColumnNames = {
    Select: "Select",
    SourceAName: "SourceA",
    SourceBName: "SourceB",
    Status: "Status",
    SourceANodeId: "SourceANodeId",
    SourceBNodeId: "SourceBNodeId",
    SourceAId: "SourceAId",
    SourceBId: "SourceBId",
    ResultId: "ID",
    GroupId: "groupId"
}

// comparison property table
// indices
const ComparisonPropertyColumns = {
    Select: 0,
    SourceAName: 1,
    SourceAValue: 2,
    SourceBValue: 3,
    SourceBName: 4,
    Status: 5
}

// column names
const ComparisonPropertyColumnNames = {
    Select: "Select",
    SourceAName: "PropertyA",
    SourceAValue: "ValueA",
    SourceBValue: "ValueB",
    SourceBName: "PropertyB",
    Status: "Status"
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
    Status: 3
}

// column names
const CompliancePropertyColumnNames = {
    Select: "Select",
    PropertyName: "Property",
    PropertyValue: "Value",
    Status: "Status"
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
    HistoryBtn: "history",
    UnitsBtn: "units",
    CheckInfoBtn: "checkInfo",
    SaveProgressBtn: "saveProgress",
    ResetBtn: "reset",
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
