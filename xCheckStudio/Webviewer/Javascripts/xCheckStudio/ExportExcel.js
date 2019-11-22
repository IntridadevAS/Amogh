function ExportExcel() {
    this.reviewWorkbook = new ExcelJS.Workbook();
    this.modelBrowserWorkook = new ExcelJS.Workbook();
    this.ComparisonSheetExported = false;
    this.ComplianceSheetExported
    this.rowCount = 9;
}

ExportExcel.prototype.ExportComparisonComponents = function (selectedTables, exportProperties) {
    var _this = this;
    return new Promise((resolve) => {
        if (exportProperties) {
            this.CreateDummyDataGrids(selectedTables, exportProperties).then(function () {
                _this.ExportGroups(selectedTables, exportProperties);
                return resolve(true);
            });
        }
        else {
            this.CreateComponentDataGrid(selectedTables).then(function () {
                _this.ExportGroups(selectedTables, exportProperties);
                return resolve(true);
            });
        }
    })
}

ExportExcel.prototype.CreateComponentDataGrid = function (selectedTables) {
    var _this = this;
    var datagridCreated = 0;
    return new Promise((resolve) => {
        var header = [{ "caption": checkResults.sourceInfo.sourceAFileName, "dataField": "SourceAName" },
        { "caption": checkResults.sourceInfo.sourceBFileName, "dataField": "SourceBName" },
        { "caption": "Status", "dataField": "Status" },
        { "caption": "Information", "dataField": "Information" }];

        for (var id = 0; id < selectedTables.length; id++) {
            var tableName = selectedTables[id];
            var tableID = "#" + tableName + "_" + Comparison.MainReviewContainer;
            var dataGrid = $(tableID).dxDataGrid("instance");
            var components = dataGrid.getDataSource().items();
            var data = [];

            for (var componentId = 0; componentId < components.length; componentId++) {
                var component = components[componentId];

                data.push({ "SourceAName": component.SourceA, "SourceBName": component.SourceB, "Status": component.Status, "Information": "" });

            }

            var parentTable = document.getElementById("comparisonTables");
            var datagridDiv = document.createElement("DIV");
            datagridDiv.id = tableName + "_tempTable";
            parentTable.append(datagridDiv);

            _this.CreateTemporaryComponentGrid(data, datagridDiv.id, header, component.ID).then(function (result) {
                datagridCreated++;
                if (datagridCreated == selectedTables.length) {
                    return resolve(true);
                }
            });
        }
    });
}

ExportExcel.prototype.CreateDummyDataGrids = async function (selectedTables, exportProperties) {
    var _this = this;
    var header = [{ "caption": checkResults.sourceInfo.sourceAFileName, "dataField": "SourceAName" },
    { "caption": checkResults.sourceInfo.sourceBFileName, "dataField": "SourceBName" },
    { "caption": "Status", "dataField": "Status" },
    { "caption": "Information", "dataField": "Information" }];

    for (var id = 0; id < selectedTables.length; id++) {
        var tableName = selectedTables[id];
        var tableID = "#" + tableName + "_" + Comparison.MainReviewContainer;
        var dataGrid = $(tableID).dxDataGrid("instance");
        var components = dataGrid.getDataSource().items();

        for (var componentId = 0; componentId < components.length; componentId++) {
            var component = components[componentId];

            var data = [{ "SourceAName": component.SourceA, "SourceBName": component.SourceB, "Status": component.Status, "Information": "" }];

            var parentTable = document.getElementById("comparisonTables");
            var datagridDiv = document.createElement("DIV");
            datagridDiv.id = component.ID + "_tempTable";
            parentTable.append(datagridDiv);

            await _this.CreateTemporaryComponentGrid(data, datagridDiv.id, header, component.ID);

            var propertyDiv = document.createElement("DIV");
            propertyDiv.id = component.ID + "_tempTable" + "_tempPropertiestable";
            parentTable.append(propertyDiv);

            var sources = checkResults["Comparisons"][0]["sources"];
            var headers = model.checks["comparison"]["detailedInfoTable"].CreatePropertiesTableHeader(sources);

            var properties = checkResults["Comparisons"][0]["results"][component.groupId]["components"][component.ID]["properties"];
            var data = model.checks["comparison"]["detailedInfoTable"].CreateTableData(properties);

            await _this.CreateTemporaryPropertiesGrid(data, propertyDiv.id, headers);
        }
    }
}

ExportExcel.prototype.ExportGroups = async function (selectedTables, exportProperties) {
    var _this = this;
    var worksheet = this.reviewWorkbook.addWorksheet('Comparison');
    var isLastTable = false;

    this.CustomiseHeader(worksheet);

    for (var id = 0; id < selectedTables.length; id++) {

        var tableName = selectedTables[id];
        var tableID = "#" + tableName + "_" + Comparison.MainReviewContainer;
        var dataGrid = $(tableID).dxDataGrid("instance");

        if (id == selectedTables.length - 1) {
            isLastTable = true;
        }

        await this.ExportGroup(tableName, dataGrid, isLastTable, worksheet, exportProperties).then(function (result) {
            if (result) {
                _this.rowCount = result;
            }

            if (isLastTable) {
                _this.RemoveTempTables(selectedTables, exportProperties);
            }
        });

    }
}

ExportExcel.prototype.RemoveTempTables = function (selectedTables, exportProperties) {
    for (var id = 0; id < selectedTables.length; id++) {
        var tableName = selectedTables[id];
        var tableID = "#" + tableName + "_" + Comparison.MainReviewContainer;
        var dataGrid = $(tableID).dxDataGrid("instance");
        var components = dataGrid.getDataSource().items();

        if (exportProperties) {
            for (var id = 0; id < components.length; id++) {
                var component = components[id];
                $("#" + component.ID + "_tempTable").remove();
                $("#" + component.ID + "_tempTable" + "tempPropertiestable").remove();
            }
        }
        else {
            $("#" + tableName + "_tempTable").remove();
        }

    }
}

ExportExcel.prototype.ExportGroup = async function (tableName, dataGrid, isLastTable, worksheet, exportProperties) {
    var _this = this;
    var components = dataGrid.getDataSource().items();
    var save = false;

    worksheet.mergeCells(this.rowCount, 1, this.rowCount, 2);
    worksheet.mergeCells(this.rowCount, 3, this.rowCount, 4);
    Object.assign(worksheet.getRow(this.rowCount).getCell(1), { value: tableName, font: { bold: true, size: 16, underline: 'double' } });

    if (exportProperties) {
        for (var componentId = 0; componentId < components.length; componentId++) {
            var component = components[componentId];

            if (componentId == components.length - 1 && isLastTable) {
                save = true;
            }

            await this.ExportComponent(component, worksheet, save, exportProperties).then(function (result) {
                _this.rowCount = result;
            });
        }
    }
    else {
        var dataGrid = $("#" + tableName + "_tempTable").dxDataGrid(("instance"));

        await DevExpress.excelExporter.exportDataGrid({
            worksheet: worksheet,
            component: dataGrid,
            topLeftCell: { row: _this.rowCount, column: 5 },
        }).then(function (dataGridRange) {
            if (isLastTable) {
                _this.ComparisonSheetExported = true;
                _this.SaveWorkBook();
            }
            else {
                _this.rowCount = dataGridRange.to.row + 3;
            }
        });
    }
}

ExportExcel.prototype.ExportComponent = function (component, worksheet, save, exportProperties) {
    var _this = this;
    return new Promise((resolve) => {
        var dataGrid = $("#" + component.ID + "_tempTable").dxDataGrid(("instance"));
        DevExpress.excelExporter.exportDataGrid({
            worksheet: worksheet,
            component: dataGrid,
            topLeftCell: { row: _this.rowCount, column: 5 },
        }).then(function (dataGridRange) {
            if (exportProperties) {
                _this.rowCount = dataGridRange.to.row + 2;

                var dataGrid1 = $("#" + component.ID + "_tempTable" + "_tempPropertiestable").dxDataGrid("instance");

                DevExpress.excelExporter.exportDataGrid({
                    worksheet: worksheet,
                    component: dataGrid1,
                    topLeftCell: { row: _this.rowCount, column: 5 },
                }).then(function (dataGridRange) {
                    if (save) {
                        _this.ComparisonSheetExported = true;
                        _this.SaveWorkBook();
                    }
                    _this.rowCount = dataGridRange.to.row + 3;
                    return resolve(_this.rowCount);
                });
            }
            else {
                if (save) {
                    _this.ComparisonSheetExported = true;
                    _this.SaveWorkBook();
                }
                _this.rowCount = dataGridRange.to.row + 1;
                return resolve(_this.rowCount);
            }
        });
    });
}

ExportExcel.prototype.CreateTemporaryComponentGrid = function (component, containerDiv, header, componentId) {
    return new Promise((resolve) => {
        $(function () {
            $("#" + containerDiv).dxDataGrid({
                dataSource: component,
                columns: header,
                columnAutoWidth: true,
                width: "0px",
                height: "0px",
                wordWrapEnabled: false,
                showBorders: true,
                showRowLines: true,
                allowColumnResizing: true,
                hoverStateEnabled: true,
                filterRow: {
                    visible: true
                },
                selection: {
                    mode: "multiple",
                    showCheckBoxesMode: "always",
                    recursive: true
                },
                scrolling: {
                    mode: "standard"
                },
                paging: {
                    enabled: false
                },
                onContentReady: function (e) {
                    return resolve(componentId);
                },
            });
        });
    });
}

ExportExcel.prototype.CreateTemporaryPropertiesGrid = function (component, containerDiv, header) {
    return new Promise((resolve) => {
        $(function () {
            $("#" + containerDiv).dxDataGrid({
                dataSource: component,
                columns: header,
                columnAutoWidth: true,
                width: "0px",
                height: "0px",
                wordWrapEnabled: false,
                showBorders: true,
                showRowLines: true,
                allowColumnResizing: true,
                hoverStateEnabled: true,
                filterRow: {
                    visible: true
                },
                selection: {
                    mode: "multiple",
                    showCheckBoxesMode: "always",
                    recursive: true
                },
                scrolling: {
                    mode: "standard"
                },
                paging: {
                    enabled: false
                },
                onContentReady: function (e) {
                    return resolve(true);
                },
            });
        });
    });
}

ExportExcel.prototype.CustomiseHeader = function (worksheet) {
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    var userinfo = JSON.parse(localStorage.getItem('userinfo'));

    var generalStyles = {
        font: { bold: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D3D3D3' }, bgColor: { argb: 'D3D3D3' } },
        alignment: { horizontal: 'left' }
    };
    for (var rowIndex = 1; rowIndex < 7; rowIndex++) {
        worksheet.mergeCells(rowIndex, 1, rowIndex, 5);
        worksheet.mergeCells(rowIndex, 6, rowIndex, 10);
        for(var cellIndex = 1; cellIndex < 11; cellIndex++) {
            Object.assign(worksheet.getRow(rowIndex).getCell(cellIndex), generalStyles);
        }
    }
    worksheet.getRow(1).height = 20;
    worksheet.getRow(1).font = { bold: true, size: 16 };
    worksheet.getRow(7).numFmt = "d mmmm yyyy";
    worksheet.getRow(1).getCell(3).font = { bold: true, size: 16 };
    worksheet.getColumn(1).values = ["Project/CheckSpace Name:", "CheckCase Name:", "DataSet Name:", "CheckType:", "UserName:", "Date: "];
    worksheet.getColumn(6).values = [projectinfo.projectname + "/" + checkinfo.checkname, "RVM_2_XML", checkResults.sourceInfo.sourceAFileName + " & " + checkResults.sourceInfo.sourceBFileName, "Comparison", userinfo.alias, new Date()];
}

ExportExcel.prototype.SaveWorkBook = function() {
    // if(this.ComparisonSheetExported && this.ComplianceSheetExported) {
        this.reviewWorkbook.xlsx.writeBuffer().then(function (buffer) {
            saveAs(new Blob([buffer], { type: "application/octet-stream" }), "Test1.xlsx");
        });
    // }
}