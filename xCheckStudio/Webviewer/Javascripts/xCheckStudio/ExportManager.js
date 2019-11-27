var XLSX;
if (typeof (require) !== 'undefined') {
    XLSX = require('xlsx');
}

var comparisonExportManager = new ComparisonExportManager()
var complianceAExportManager = new ComplianceAExportManager()
var complianceBExportManager = new ComplianceBExportManager()

var ExportManager = {
    ExcelOutputFormInitialised : false,
}

function ShowSelectBox() {
    var overlay = document.getElementById("Excel_Output_overlay");
    var popup = document.getElementById("Excel_Output_popup");


    overlay.style.display = 'block';
    popup.style.display = 'block';

    // var el = document.getElementById('closeExcelOutputForm');

    // el.addEventListener('click', function(){
    //     closeSaveAs();
    // }, false);

    if(!ExportManager.ExcelOutputFormInitialised) {
        CreateDevExtremeWidgets();
        ExportManager.ExcelOutputFormInitialised = true;
    }
    else {
        ResetExportOptionsForm();
    }
}

function ResetExportOptionsForm() {
    $("#comparisonTables").dxDataGrid(("instance")).clearSelection();
    $("#complianceSource1tables").dxDataGrid(("instance")).clearSelection();
    $("#complianceSource2tables").dxDataGrid(("instance")).clearSelection();
    $("#comparisonOutputSwitch").dxSwitch("instance").reset();
    // $("#complianceSource1OutputSwitch").dxSwitch("instance").reset();
    // $("#complianceSource2OutputSwitch").dxSwitch("instance").reset();        
    $("#complianceOutputSwitch").dxSwitch("instance").reset();  
    $("#ExportComparisonPropertiesSwitch").dxSwitch("instance").reset();
}

function CreateDevExtremeWidgets() {

    new DevExpress.ui.dxSwitch(document.getElementById("comparisonOutputSwitch"), {  });
    new DevExpress.ui.dxSwitch(document.getElementById("complianceOutputSwitch"), {  });
    // new DevExpress.ui.dxSwitch(document.getElementById("complianceSource2OutputSwitch"), {  });
    // new DevExpress.ui.dxSwitch(document.getElementById("complianceSource1OutputSwitch"), {  });
    new DevExpress.ui.dxSwitch(document.getElementById("ExportComparisonPropertiesSwitch"), { });

    document.getElementById("Data_source_1_A96_Text_8").innerText = checkResults["sourceInfo"].sourceAFileName;
    document.getElementById("Data_source_1_A96_Text_10").innerText = checkResults["sourceInfo"].sourceBFileName;

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

        if(document.getElementById("Data_source_1_A96_Text_8").innerText == Compliances[id].source) {
            complianceAExportManager.CreateTables("complianceSource1tables", columnHeaders, tableData);
        }
        else if(document.getElementById("Data_source_1_A96_Text_10").innerText == Compliances[id].source) {
            complianceAExportManager.CreateTables("complianceSource2tables", columnHeaders, tableData);
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
    var exportToExcel = new ExportExcel();
    var comparisonSwitch = $("#comparisonOutputSwitch").dxSwitch("instance");
    var comparisonValueswitch = comparisonSwitch.option("value");

    var complianceSwitch = $("#complianceOutputSwitch").dxSwitch("instance");
    var complianceValueswitch = complianceSwitch.option("value");

    if(comparisonValueswitch) {
        var exportPropertiesSwitch =  $("#ExportComparisonPropertiesSwitch").dxSwitch("instance");
        var exportProperties = exportPropertiesSwitch.option("value");

        exportToExcel.ExportComparisonComponents(comparisonExportManager.SelectedTableIds, exportProperties).then(function() {
            closeSaveAs();
            closeOutpuToOverlay();
        });
    }  
    else {
        ExportExcel.ComparisonSheetExported = true;
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

function ComplianceAExportManager() {
    this.SelectedTableIds = [];
}

ComplianceAExportManager.prototype.CreateTables = function(containerDiv, columnHeaders, tableData) {
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
                            ExportManager.SelectedTableIds.push(dataObject.name)
                        }).fail(function(error) {
                            // handle error
                        });
                    }
                }
                else {
                    for(var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                        e.component.byKey(e.currentDeselectedRowKeys[i]).done(function(dataObject) {
                            var index = ExportManager.SelectedTableIds.indexOf(dataObject.name)
                            if (index > -1) {
                                ExportManager.SelectedTableIds.splice(index, 1);
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

function ComplianceBExportManager() {
    this.SelectedTableIds = [];
}

ComplianceBExportManager.prototype.CreateTables = function(containerDiv, columnHeaders, tableData) {
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
                            ExportManager.SelectedTableIds.push(dataObject.name)
                        }).fail(function(error) {
                            // handle error
                        });
                    }
                }
                else {
                    for(var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                        e.component.byKey(e.currentDeselectedRowKeys[i]).done(function(dataObject) {
                            var index = ExportManager.SelectedTableIds.indexOf(dataObject.name)
                            if (index > -1) {
                                ExportManager.SelectedTableIds.splice(index, 1);
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