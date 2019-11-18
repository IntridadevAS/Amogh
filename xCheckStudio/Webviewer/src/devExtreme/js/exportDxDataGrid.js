function exportDataGrid({ dataGrid, workbook, worksheet, fileName = "DataGrid.xlsx", 
                         topLeftCell = { row: 1 /*1-based*/, column: 1 /*1-based*/ },
                         saveEnabled = true, customizeCell }) {
    if (!dataGrid) {
        throw "Incorrect arguments: 'dataGrid' is null";
    }
    if (!worksheet) {
        workbook = new ExcelJS.Workbook();
        worksheet = workbook.addWorksheet('Sheet 1');
    }
    if(saveEnabled && !workbook) {
        throw "Incorrect arguments: 'workbook' is null when 'saveEnabled' is true";
    }

    var result = { from: { ...topLeftCell }, to: { ...topLeftCell } };

    var currentColumnIndex = result.from.column;
    var headerRow = worksheet.getRow(result.to.row);
    for (let i = 0; i < dataGrid.getVisibleColumns().length; i++) {
        headerRow.getCell(currentColumnIndex).value = dataGrid.getVisibleColumns()[i].caption;
        customizeCell && customizeCell({
            dataGrid,
            cell: headerRow.getCell(currentColumnIndex),
            gridCell: {
                rowType: "header",
                // TODO: column, data, groupSummaryItems, totalSummaryItemName, value
            }
        });
        currentColumnIndex++;
    }
    result.to.row++;
    result.to.column += dataGrid.getVisibleColumns().length;

    return dataGrid.getController("data").loadAll().then(
        function (items) {
            for (let i = 0; i < items.length; i++) {
                var dataRow = worksheet.getRow(result.to.row);
                currentColumnIndex = result.from.column;
                for (let j = 0; j < items[i].values.length; j++) {
                    dataRow.getCell(currentColumnIndex).value = items[i].values[j];
                    customizeCell && customizeCell({
                        dataGrid,
                        cell: headerRow.getCell(currentColumnIndex),
                        gridCell: {
                            rowType: "data",
                            // TODO: column, data, groupSummaryItems, totalSummaryItemName, value
                        }
                    });
                    currentColumnIndex++;
                }
                result.to.row++;
            }
            result.to.row--;
            return Promise.resolve(result);
        }).then(function(range) {
            if(saveEnabled && workbook) {
                return workbook.xlsx.writeBuffer().then(function (buffer) {
                    var localFileName = fileName || "DataGrid.xlsx";
                    if (localFileName.substring(localFileName.length - ".xlsx".length, localFileName.length) !== ".xlsx") {
                        localFileName += ".xlsx";
                    }
                    saveAs(
                        new Blob([buffer], { type: "application/octet-stream" }),
                        localFileName
                    );
                });
            } else {
                return Promise.resolve(range);
            }
        });
}

window.exportDataGrid = exportDataGrid;