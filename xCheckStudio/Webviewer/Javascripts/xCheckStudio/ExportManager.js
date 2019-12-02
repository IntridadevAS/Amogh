var XLSX;
if (typeof (require) !== 'undefined') {
    XLSX = require('xlsx');
}

var comparisonExportManager = new ComparisonExportManager();
var complianceAExportManager = new ComplianceExportManager();
var complianceBExportManager = new ComplianceExportManager();
var complianceCExportManager = new ComplianceExportManager();
var complianceDExportManager = new ComplianceExportManager();

var dataset1 = new Dataset();
var dataset2 = new Dataset();
var dataset3 = new Dataset();
var dataset4 = new Dataset();

var ExportManager = {
    ExcelOutputFormInitialised : false,
    Datasets : {}
}

function ShowSelectBox() {
    var overlay = document.getElementById("ExcelOutputOverlay");
    var popup = document.getElementById("ExcelOutputPopup");


    overlay.style.display = 'block';
    popup.style.display = 'block';

    if(!ExportManager.ExcelOutputFormInitialised) {
        CreateDevExtremeWidgets();
        ExportManager.ExcelOutputFormInitialised = true;
    }
    else {
        ResetExportOptionsForm();
    }
}

function ResetExportOptionsForm() {
    $("#comparisonOutputSwitch").dxSwitch("instance").reset();      
    $("#complianceOutputSwitch").dxSwitch("instance").reset();  
    $("#ExportComparisonPropertiesSwitch").dxSwitch("instance").reset();
    $("#reportNameTextBox").dxTextBox("instance").reset();
    $("#modelBrowserExportSwitch").dxSwitch("instance").reset();
    $("#reviewResultsExportSwitch").dxSwitch("instance").reset();

    if($("#comparisonTables").dxDataGrid("instance")) {
        $("#comparisonTables").dxDataGrid("instance").clearSelection();
    }

    if($("#complianceSource1tables").dxDataGrid("instance")) {
        $("#complianceSource1tables").dxDataGrid("instance").clearSelection();
    }

    if($("#complianceSource2tables").dxDataGrid("instance")) {
        $("#complianceSource2tables").dxDataGrid("instance").clearSelection();
    }

    if($("#complianceSource3tables").dxDataGrid("instance")) {
        $("#complianceSource3tables").dxDataGrid("instance").clearSelection();
    }

    if($("#complianceSource4tables").dxDataGrid("instance")) {
        $("#complianceSource4tables").dxDataGrid("instance").clearSelection();
    }

    if($("#dataset1").dxDataGrid("instance")) {
        $("#dataset1").dxDataGrid("instance").clearSelection();
    }

    if($("#dataset2").dxDataGrid("instance")) {
        $("#dataset2").dxDataGrid("instance").clearSelection();
    }

    if($("#dataset3").dxDataGrid("instance")) {
        $("#dataset3").dxDataGrid("instance").clearSelection();
    }

    if($("#dataset4").dxDataGrid("instance")) {
        $("#dataset4").dxDataGrid("instance").clearSelection();
    }
}

function DisableReviewExportForm() {
    $("#comparisonOutputSwitch").dxSwitch("instance").option("disabled", true);
    $("#complianceOutputSwitch").dxSwitch("instance").option("disabled", true);
    $("#ExportComparisonPropertiesSwitch").dxSwitch("instance").option("disabled", true);
    $("#reportNameTextBox").dxTextBox("instance").option("disabled", true);
    $("#reviewResultsExportSwitch").dxSwitch("instance").option("disabled", true);

    if($("#comparisonTables").dxDataGrid("instance")) {
        $("#comparisonTables").dxDataGrid("instance").option("disabled", true);
    }

    if($("#complianceSource1tables").dxDataGrid("instance")) {
        $("#complianceSource1tables").dxDataGrid("instance").option("disabled", true);
    }

    if($("#complianceSource2tables").dxDataGrid("instance")) {
        $("#complianceSource2tables").dxDataGrid("instance").option("disabled", true);
    }

    if($("#complianceSource3tables").dxDataGrid("instance")) {
        $("#complianceSource3tables").dxDataGrid("instance").option("disabled", true);
    }

    if($("#complianceSource4tables").dxDataGrid("instance")) {
        $("#complianceSource4tables").dxDataGrid("instance").option("disabled", true);
    }

}

function EnableReviewExportForm() {
    $("#reviewResultsExportSwitch").dxSwitch("instance").option("disabled", false);
    $("#comparisonOutputSwitch").dxSwitch("instance").option("disabled", false);
    $("#complianceOutputSwitch").dxSwitch("instance").option("disabled", false);
    $("#ExportComparisonPropertiesSwitch").dxSwitch("instance").option("disabled", false);
    $("#reportNameTextBox").dxTextBox("instance").option("disabled", false);

    
    
    if($("#comparisonTables").dxDataGrid("instance")) {
        $("#comparisonTables").dxDataGrid("instance").option("disabled", false);
    }

    if($("#complianceSource1tables").dxDataGrid("instance")) {
        $("#complianceSource1tables").dxDataGrid("instance").option("disabled", false);
    }

    if($("#complianceSource2tables").dxDataGrid("instance")) {
        $("#complianceSource2tables").dxDataGrid("instance").option("disabled", false);
    }

    if($("#complianceSource3tables").dxDataGrid("instance")) {
        $("#complianceSource3tables").dxDataGrid("instance").option("disabled", false);
    }

    if($("#complianceSource4tables").dxDataGrid("instance")) {
        $("#complianceSource4tables").dxDataGrid("instance").option("disabled", false);
    }
}

function EnableModelBrowserExportForm() {
    $("#modelBrowserExportSwitch").dxSwitch("instance").option("disabled", false);

    if($("#dataset1").dxDataGrid("instance")) {
        $("#dataset1").dxDataGrid("instance").option("disabled", false);
    }

    if($("#dataset2").dxDataGrid("instance")) {
        $("#dataset2").dxDataGrid("instance").option("disabled", false);
    }

    if($("#dataset3").dxDataGrid("instance")) {
        $("#dataset3").dxDataGrid("instance").option("disabled", false);
    }

    if($("#dataset4").dxDataGrid("instance")) {
        $("#dataset4").dxDataGrid("instance").option("disabled", false);
    }
}

function DisableModelBrowserExportForm() {

    $("#modelBrowserExportSwitch").dxSwitch("instance").option("disabled", true);

    if($("#dataset1").dxDataGrid("instance")) {
        $("#dataset1").dxDataGrid("instance").option("disabled", true);
    }

    if($("#dataset2").dxDataGrid("instance")) {
        $("#dataset2").dxDataGrid("instance").option("disabled", true);
    }

    if($("#dataset3").dxDataGrid("instance")) {
        $("#dataset3").dxDataGrid("instance").option("disabled", true);
    }

    if($("#dataset4").dxDataGrid("instance")) {
        $("#dataset4").dxDataGrid("instance").option("disabled", true);
    }
}

function CreateDevExtremeWidgets() {

    CreateReviewExportForm();
    CreateDataSetExportForm();
}

function CreateDataSetExportForm() {
    new DevExpress.ui.dxSwitch(document.getElementById("modelBrowserExportSwitch"), { 
        onValueChanged : function(e) {
            if(e.value) {
                DisableReviewExportForm();
            }
            else {
                EnableReviewExportForm();
            }
        }
    });

    var columnHeaders = [{dataField : "key", caption : "Key", visible : false}, {dataField : "name", caption : "Name"}];

    for(var key in checkResults.sourceInfo) {
        var components;
        var tableId;
        var datasetInstance;
        
        if(key == "sourceAFileName") {
            components = checkResults["sourceAComponents"];
            document.getElementById("dataset1Name").innerText = checkResults.sourceInfo[key];
            tableId = "dataset1";
            datasetInstance = dataset1;
        }
        else if(key == "sourceBFileName") {
            components = checkResults["sourceBComponents"];
            document.getElementById("dataset2Name").innerText = checkResults.sourceInfo[key];
            tableId = "dataset2";
            datasetInstance = dataset2;
        }
        else if(key == "sourceCFileName") {
            components = checkResults["sourceCComponents"];
            document.getElementById("dataset3Name").innerText = checkResults.sourceInfo[key];
            tableId = "dataset3";
            datasetInstance = dataset3;
        }
        else if(key == "sourceDFileName") {
            components = checkResults["sourceDComponents"];
            document.getElementById("dataset4Name").innerText = checkResults.sourceInfo[key];
            tableId = "dataset4";
            datasetInstance = dataset4;
        }
        else {
            continue;
        }

        if(!Object.keys(ExportManager.Datasets).includes(checkResults.sourceInfo[key])) { 
            var categoryComponentList = GetCategoryWiseComponentList(components);
            ExportManager.Datasets[checkResults.sourceInfo[key]] = categoryComponentList;
            var categories = Object.keys(ExportManager.Datasets[checkResults.sourceInfo[key]]);
            var tableData = [];
            for(var i in categories) {
                var obj = {"key": i,  "name" : categories[i]};
                tableData.push(obj);
            }
            datasetInstance.CreateTables(tableId, columnHeaders, tableData);
        }

    }
}

function GetCategoryWiseComponentList(components) {
    var categoryList = {};
    for(var id in components) {
        var component = components[id];
        if(!Object.keys(categoryList).includes(component.mainclass)) {
            categoryList[component.mainclass] = [];
            categoryList[component.mainclass].push(component)
        }
        else {
            categoryList[component.mainclass].push(component)
        }
    }

    return categoryList;
}

function CreateReviewExportForm() {
    new DevExpress.ui.dxSwitch(document.getElementById("reviewResultsExportSwitch"), { 
        onValueChanged : function(e) {
            if(e.value) {
                DisableModelBrowserExportForm();
            }
            else {
                EnableModelBrowserExportForm();
            }
        }
    });
    new DevExpress.ui.dxTextBox(document.getElementById("reportNameTextBox"), { placeholder: "Enter Excel File Name..." });
    new DevExpress.ui.dxSwitch(document.getElementById("comparisonOutputSwitch"), {  });
    new DevExpress.ui.dxSwitch(document.getElementById("complianceOutputSwitch"), {  });
    new DevExpress.ui.dxSwitch(document.getElementById("ExportComparisonPropertiesSwitch"), { });

    var tableData = [];
    var columnHeaders = [{dataField : "key", caption : "Key", visible : false}, {dataField : "name", caption : "Name"}];

    var ComparisonGroups = checkResults["Comparisons"][0]["results"];
    for(var id in ComparisonGroups) {
        var tableName = ComparisonGroups[id].componentClass;
        var obj = {"key": id,  "name" : tableName};
        tableData.push(obj);
    }

    comparisonExportManager.CreateTables("comparisonTables", columnHeaders, tableData);

    var Compliances = checkResults["Compliances"];

    for(var id in Compliances) {

        var complianceGroups = Compliances[id]["results"];
        var tableData = [];
        for(var i in complianceGroups) {
            var tableName = complianceGroups[i].componentClass;
            var obj = {"key": i,  "name" : tableName};
            tableData.push(obj);
        }

        if(id == 0) {
            document.getElementById("complianceDataset1Name").innerText = Compliances[id].source;
            complianceAExportManager.CreateTables("complianceSource1tables", columnHeaders, tableData);
        }
        if(id == 1) {
            document.getElementById("complianceDataset2Name").innerText = Compliances[id].source;
            complianceBExportManager.CreateTables("complianceSource2tables", columnHeaders, tableData);
        }
        if(id == 2) {
            document.getElementById("complianceDataset3Name").innerText = Compliances[id].source;
            complianceCExportManager.CreateTables("complianceSource3tables", columnHeaders, tableData);
        }
        if(id == 3) {
            document.getElementById("complianceDataset4Name").innerText = Compliances[id].source;
            complianceDExportManager.CreateTables("complianceSource4tables", columnHeaders, tableData);
        }
    }
}

function OnExcelClick() {
    ShowSelectBox();
    var exportButton = document.getElementById("exportButton");
    exportButton.onclick= function () {
        ExportToExcel();
    };
}

function ExportToExcel() {

    showBusyIndicator();
    var reviewExoprtForm = $("#reviewResultsExportSwitch").dxSwitch("instance").option("disabled");
    var datasetSwitchForm = $("#modelBrowserExportSwitch").dxSwitch("instance").option("disabled");

    if(!reviewExoprtForm) {
        ExportReviewTableResults();
    }
    else if(!datasetSwitchForm) {
        ExportDatasets();
    }
    else {
        hideBusyIndicator();
        return;
    }
}

function ExportReviewTableResults() {
    var exportToExcel = new ExportExcel();
    var selectedTables = {};
    var comparisonSwitch = $("#comparisonOutputSwitch").dxSwitch("instance");
    var comparisonValueswitch = comparisonSwitch.option("value");

    var complianceSwitch = $("#complianceOutputSwitch").dxSwitch("instance");
    var complianceValueswitch = complianceSwitch.option("value");

    var exportPropertiesSwitch =  $("#ExportComparisonPropertiesSwitch").dxSwitch("instance");
    var exportProperties = exportPropertiesSwitch.option("value");    

    if(comparisonValueswitch && comparisonExportManager.SelectedTableIds.length > 0) {
        selectedTables["Comparison"] = comparisonExportManager.SelectedTableIds;
    } 

    if(complianceValueswitch) {
        if(complianceAExportManager.SelectedTableIds.length > 0) {
            selectedTables["ComplianceA"] = complianceAExportManager.SelectedTableIds;
        }

        if(complianceBExportManager.SelectedTableIds.length > 0) {
            selectedTables["ComplianceB"] = complianceBExportManager.SelectedTableIds;
        }

        if(complianceCExportManager.SelectedTableIds.length > 0) {
            selectedTables["ComplianceC"] = complianceCExportManager.SelectedTableIds;
        }

        if(complianceDExportManager.SelectedTableIds.length > 0) {
            selectedTables["ComplianceD"] = complianceDExportManager.SelectedTableIds;
        }
    }

    if(Object.keys(selectedTables).length > 0) {
        exportToExcel.ExportReviewTablesData(selectedTables, exportProperties).then(function() {
            closeSaveAs();
            closeOutpuToOverlay();
        });
    }
    else {
        hideBusyIndicator();
        return;
    }
}

function ExportDatasets() {
    var exportToExcel = new ExportExcel();

    var datasetExportSwitch = $("#modelBrowserExportSwitch").dxSwitch("instance");
    var datasetSwitchValue = datasetExportSwitch.option("value");

    var selectedTables = {};

    if(datasetSwitchValue) {
        if(dataset1.SelectedTableIds.length > 0) {
            selectedTables[checkResults.sourceInfo["sourceAFileName"]] = dataset1.SelectedTableIds;
        }

        if(dataset2.SelectedTableIds.length > 0) {
            selectedTables[checkResults.sourceInfo["sourceBFileName"]] = dataset2.SelectedTableIds;
        }

        if(dataset3.SelectedTableIds.length > 0) {
            selectedTables[checkResults.sourceInfo["sourceCFileName"]] = dataset3.SelectedTableIds;
        }

        if(dataset4.SelectedTableIds.length > 0) {
            selectedTables[checkResults.sourceInfo["sourceDFileName"]] = dataset4.SelectedTableIds;
        }
    }

    if(Object.keys(selectedTables).length > 0) {
        exportToExcel.ExportDatasetsData(selectedTables, ExportManager.Datasets).then(function() {
            closeSaveAs();
            closeOutpuToOverlay();
        });
    }
    else {
        hideBusyIndicator();
        return;
    }
}

function ComparisonExportManager() {
    this.SelectedTableIds = [];
}

ComparisonExportManager.prototype.CreateTables = function(containerDiv, columnHeaders, tableData) {
    var _this = this;

    $(function () {
        $("#" + containerDiv).dxDataGrid({
            dataSource: tableData,
            keyExpr: "key",
            columns: columnHeaders,
            columnAutoWidth: true,
            wordWrapEnabled: false,
            showBorders: false,
            allowColumnResizing: true,
            hoverStateEnabled: true,
            showColumnHeaders: false,
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "always",
                recursive: true
            },
            paging: {
                enabled: false
            },
            scrolling: {
                mode: "standard"
            },
            onCellPrepared: function (e) {
                e.cellElement.css("font-size", "8px");
                e.cellElement.css("height", "9px");
            },
            onSelectionChanged: function(e) {
                if(e.currentSelectedRowKeys.length > 0) {
                    for(var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                        e.component.byKey(e.currentSelectedRowKeys[i]).done(function(dataObject) {
                            _this.SelectedTableIds.push(dataObject.name)
                        }).fail(function(error) {
                            // handle error
                        });
                    }
                }
                else {
                    for(var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                        e.component.byKey(e.currentDeselectedRowKeys[i]).done(function(dataObject) {
                            var index = _this.SelectedTableIds.indexOf(dataObject.name)
                            if (index > -1) {
                                _this.SelectedTableIds.splice(index, 1);
                            }
                        }).fail(function(error) {
                            // handle error
                        });
                    }
                }
                
            },
        });
    });
}

function ComplianceExportManager() {
    this.SelectedTableIds = [];
}

ComplianceExportManager.prototype.CreateTables = function(containerDiv, columnHeaders, tableData) {
    var _this = this;

    $(function () {
        $("#" + containerDiv).dxDataGrid({
            dataSource: tableData,
            keyExpr: "key",
            columns: columnHeaders,
            columnAutoWidth: true,
            wordWrapEnabled: false,
            showBorders: false,
            allowColumnResizing: true,
            hoverStateEnabled: true,
            showColumnHeaders: false,
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "always",
                recursive: true
            },
            paging: {
                enabled: false
            },
            scrolling: {
                mode: "standard"
            },
            onCellPrepared: function (e) {
                e.cellElement.css("font-size", "8px");
                e.cellElement.css("height", "9px");
            },
            onSelectionChanged: function(e) {
                if(e.currentSelectedRowKeys.length > 0) {
                    for(var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                        e.component.byKey(e.currentSelectedRowKeys[i]).done(function(dataObject) {
                            _this.SelectedTableIds.push(dataObject.name)
                        }).fail(function(error) {
                            // handle error
                        });
                    }
                }
                else {
                    for(var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                        e.component.byKey(e.currentDeselectedRowKeys[i]).done(function(dataObject) {
                            var index = _this.SelectedTableIds.indexOf(dataObject.name)
                            if (index > -1) {
                                _this.SelectedTableIds.splice(index, 1);
                            }
                        }).fail(function(error) {
                            // handle error
                        });
                    }
                }
                
            },
        });
    });
}

function Dataset() {
    this.SelectedTableIds = [];
}

Dataset.prototype.CreateTables = function(containerDiv, columnHeaders, tableData) {
    var _this = this;

    $(function () {
        $("#" + containerDiv).dxDataGrid({
            dataSource: tableData,
            keyExpr: "key",
            columns: columnHeaders,
            columnAutoWidth: true,
            wordWrapEnabled: false,
            showBorders: false,
            allowColumnResizing: true,
            hoverStateEnabled: true,
            showColumnHeaders: false,
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "always",
                recursive: true
            },
            paging: {
                enabled: false
            },
            scrolling: {
                mode: "standard"
            },
            onCellPrepared: function (e) {
                e.cellElement.css("font-size", "8px");
                e.cellElement.css("height", "9px");
            },
            onSelectionChanged: function(e) {
                if(e.currentSelectedRowKeys.length > 0) {
                    for(var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                        e.component.byKey(e.currentSelectedRowKeys[i]).done(function(dataObject) {
                            _this.SelectedTableIds.push(dataObject.name)
                        }).fail(function(error) {
                            // handle error
                        });
                    }
                }
                else {
                    for(var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                        e.component.byKey(e.currentDeselectedRowKeys[i]).done(function(dataObject) {
                            var index = _this.SelectedTableIds.indexOf(dataObject.name)
                            if (index > -1) {
                                _this.SelectedTableIds.splice(index, 1);
                            }
                        }).fail(function(error) {
                            // handle error
                        });
                    }
                }
                
            },
        });
    });
}