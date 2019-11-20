var XLSX;
if (typeof (require) !== 'undefined') {
    XLSX = require('xlsx');
}

var ExportManager = {
    SelectedTableIds : []
}

function Destroy() {
    var viewerContainerElement = document.getElementById("selectionListOfTables");
    var style = viewerContainerElement.style;

    var parent = viewerContainerElement.parentElement;

    $("#selectionListOfTables").remove();

    var viewerContainerDiv = document.createElement("div")
    viewerContainerDiv.id = "selectionListOfTables";
    viewerContainerDiv.style.cssText = style.cssText;

    parent.appendChild(viewerContainerDiv);
}

function ShowSelectBox() {
    var overlay = document.getElementById("selectTableToExportOverlay");
    var popup = document.getElementById("selectTableToExportPopup");
    // var exportManager = new ExportManager();

    DisplayCategoriesToExport();

    overlay.style.display = 'block';
    popup.style.display = 'block';
}

function DisplayCategoriesToExport() {
    ExportManager.SelectedTableIds = [];

    Destroy();

    var tableData = [];
    var checkTableIds = model["checks"][model.currentCheck]["reviewTable"].CheckTableIds;
    for(var id in checkTableIds) {
        var tableId = checkTableIds[id];
        tableId = tableId.replace("#","");
        var tableName = tableId.split("_")[0];
        var obj = {"key": id,  "name" : tableName};
        tableData.push(obj);
    }
    var columnHeaders = [{dataField : "key", caption : "Key", visible : false}, {dataField : "name", caption : "Name"}];

    $(function () {
        $("#selectionListOfTables").dxDataGrid({
            dataSource: tableData,
            keyExpr: "key",
            columns: columnHeaders,
            columnAutoWidth: true,
            wordWrapEnabled: false,
            showBorders: false,
            allowColumnResizing: true,
            hoverStateEnabled: true,
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
                if (e.rowType == "header") {
                    e.cellElement.css("text-align", "center");
                    e.cellElement.css("color", "black");
                    e.cellElement.css("font-weight", "bold");
                }
            },
            onSelectionChanged: function(e) {
                if(e.currentSelectedRowKeys.length > 0) {
                    for(var i = 0; i < e.currentSelectedRowKeys.length; i++) {
                        ExportManager.SelectedTableIds.push(checkTableIds[Number(e.currentSelectedRowKeys[i])]);
                    }
                }
                else {
                    for(var i = 0; i < e.currentDeselectedRowKeys.length; i++) {
                        var index = ExportManager.SelectedTableIds.indexOf(checkTableIds[Number(e.currentDeselectedRowKeys[i])]);
                        if (index > -1) {
                            ExportManager.SelectedTableIds.splice(index, 1);
                        }
                    }
                }
                
            },
        });
    });
}

function OnExcelClick() {
    ShowSelectBox();
    var exportButton = document.getElementById("exportToButton");
    exportButton.onclick= function () {
        ExportToExcel();
    };
}

// function GetCheckInfo() {
//     var Info = [];

//     var projectName = localStorage.projectinfo["projectname"];
//     var checkName = localStorage.checkinfo["checkname"];
//     var userName = localStorage.userinfo["alias"];

//     projectName = "Project/CheckSpace Name : " + projectName + "/" + checkName;
//     userName - "UserName : " + userName;

//     if(model.currentCheck == "comparison") {

//     }

// }

function ExportToExcel() {
    // GetCheckInfo();
    // CreateHeaderForExcel();
    var excelSheetData = CreateDataToExport();
    var nextRow;
    var ws;

    for(var table in excelSheetData) {
        // var headerOfTable = excelSheetData[table][0]
        // excelSheetData[table].shift();
        var data = excelSheetData[table];

        if(!ws) {
            ws = XLSX.utils.aoa_to_sheet(data);
            nextRow = data.length + 8;
        }
        else {
            var startFrom = "A" + nextRow;
            XLSX.utils.sheet_add_aoa(ws, data, {origin: startFrom});
        }
        
    }

    // A workbook is the name given to an Excel file
    var wb = XLSX.utils.book_new() // make Workbook of Excel

    // add Worksheet to Workbook
    // Workbook contains one or more worksheets
    XLSX.utils.book_append_sheet(wb, ws, model.currentCheck) // sheetAName is name of Worksheet

    // export Excel file
    XLSX.writeFile(wb, 'D:/Intrida/Output/book234.xlsx') //


    // close popup after export
    closeSaveAs();
    closeOutpuToOverlay();
}

// function CreateHeaderForExcel() {
//     var manager = model.checks[model.currentCheck].reviewManager;
//     var results;
//     if(model.currentCheck.toLowerCase() == "comparison") {
//         results = manager.ComparisonCheckManager['results'];
//     }
//     else {
//         results = manager.ComplianceCheckManager['results'];
//     }

//     var sourceAHeader = [];
//     var sourceBHeader = [];
//     var headerArray = [];

//     for(var tid = 0; tid < ExportManager.SelectedTableIds.length; tid++) {
//         var tableId = ExportManager.SelectedTableIds[tid];
//         tableId = tableId.replace("#","");
//         var tableName = tableId.split("_")[0];
//         for(var id in results) {
//             if(results[id].componentClass.toLowerCase() == tableName.toLowerCase()) {
//                 var components = results[id].components;
//                 for(var i in components) {
//                     var component = components[i];
//                     var properties = component.properties;
//                     for(var j in properties) {
//                         var property = properties[j];

//                         if(property.sourceAName !== null) {
//                             if(!sourceAHeader.includes(property.sourceAName))
//                                 sourceAHeader.push(property.sourceAName);
//                             else if(property.sourceAName == "")
//                                 sourceAHeader.push(property.sourceAName);
//                         }
//                         else {
//                             sourceAHeader.push("");
//                         }

//                         if(property.sourceBName !== null) {
//                             if(!sourceBHeader.includes(property.sourceBName))
//                                 sourceBHeader.push(property.sourceBName);
//                             else if(property.sourceBName == "")
//                                 sourceBHeader.push(property.sourceBName);
//                         }
//                         else {
//                             sourceBHeader.push("");
//                         }
//                     }
//                 }
//                 break;
//             }
//         }
//     }



// }

function CreateDataToExport() {

    var manager = model.checks[model.currentCheck].reviewManager;
    var results;
    if(model.currentCheck.toLowerCase() == "comparison") {
        results = manager.ComparisonCheckManager['results'];
    }
    else {
        results = manager.ComplianceCheckManager['results'];
    }

    var dataObject = {};

    for(var tid = 0; tid < ExportManager.SelectedTableIds.length; tid++) {
        var tableId = ExportManager.SelectedTableIds[tid];
        tableId = tableId.replace("#","");
        var tableName = tableId.split("_")[0];
        for(var id in results) {
            if(results[id].componentClass.toLowerCase() == tableName.toLowerCase()) {
                var components = results[id].components;
                var componentsArray = [];
                var headerArray = [];
                var headerArrayFilled = false;
                for(var i in components) {
                    var component = components[i];
                    var comp = [];
                    comp.push(component.sourceAName);
                    comp.push(component.sourceBName);
                    comp.push(component.status);

                    if(!headerArrayFilled) {
                        headerArray.push("Item A");
                        headerArray.push("Item B");
                        headerArray.push("Status");
                    }
                    
                    var properties = component.properties;
                    for(var j in properties) {
                        var property = properties[j];

                        if(!headerArrayFilled) {

                            if(property.sourceAName !== null) {
                                headerArray.push(property.sourceAName);
                            }
                            else {
                                headerArray.push(" ");
                            }

                            if(property.sourceBName !== null) {
                                headerArray.push(property.sourceBName);
                            }
                            else {
                                headerArray.push(" ");
                            }
                            
                            
                            headerArray.push("Status");
                        }

                        if (property.transpose == "lefttoright") {
                            comp.push(property.sourceAValue);    
                            comp.push(property.sourceBValue);
                        }
                        else if (property.transpose == "righttoleft") {
                            comp.push(property.sourceBValue);
                            comp.push(property.sourceAValue);
                        }
                        else if (property.transpose == null) {
                            comp.push(property.sourceAValue);
                            comp.push(property.sourceBValue);
                        }

                        comp.push(property.severity);
                    }

                    if(!headerArrayFilled) {
                        componentsArray.push(headerArray);
                        headerArrayFilled = true;
                    }
                    componentsArray.push(comp);
                }
                
                dataObject[tableName] = componentsArray;
                break;
            }
        }
    }
    
    return dataObject;
}