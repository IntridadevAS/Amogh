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

function ExportToExcel() {
    var workbook = new ExcelJS.Workbook();  

    for(var i = 0; i < ExportManager.SelectedTableIds.length; i++) {
        var tableId = ExportManager.SelectedTableIds[i];
        tableId = tableId.replace("#","");
        var tableName = tableId.split("_")[0];

        var worksheet = workbook.addWorksheet(tableName);
        var grid = $(ExportManager.SelectedTableIds[i]).dxDataGrid("instance");

        if(i == ExportManager.SelectedTableIds.length-1) {
            exportDataGrid({
                worksheet: worksheet, dataGrid: grid, topLeftCell: { row: 0, column: 1 },
                saveEnabled: true, workbook
            });
        }
        else {
           exportDataGrid({
                worksheet: worksheet, dataGrid: grid, topLeftCell: { row: 0, column: 1 },
                saveEnabled: false
            });
        }
        
    }

    // close popup after export
    closeSaveAs();
    closeOutpuToOverlay();
}