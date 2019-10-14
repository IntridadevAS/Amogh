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
    SourceId : "SourceId",
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

    LargeAnalyticsContainer : "largeAnalyticsContainer",
    AnalyticsButton : "comparisonAnalyticsBtn",
    SmallAnalyticsContainer : "comparisonSmallAnalyticsContainer",

}

const Compliance = {
    MainReviewContainer: "complianceMainContainer",
    DetailInfoContainer: "complianceDetailInfo",
    ViewerContainer: "compliance1",

    AnalyticsButton : "complianceAnalyticsBtn",
    SmallAnalyticsContainer : "complianceSmallAnalyticsContainer",
}

// menu bar
const MenuBar ={
    ReCheckBtn : "reCheck",  
    ShowAllBtn : "showAll",      
    HistoryBtn : "history",
    UnitsBtn : "units",
    CheckInfoBtn : "checkInfo",
    SaveProgressBtn : "saveProgress",
    ResetBtn : "reset",
    NavCubeBtn : "navCube",
}

