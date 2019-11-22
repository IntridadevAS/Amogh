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

            var components = this.GetCategoryComponents(tableName);
            var data = [];

            for (var componentId in components) {
                var component = components[componentId];

                data.push({ "SourceAName": component.sourceAName, "SourceBName": component.sourceBName, "Status": component.status, "Information": "" });

            }

            var parentTable = document.getElementById("comparisonTables");
            var datagridDiv = document.createElement("DIV");
            datagridDiv.id = tableName + "_tempTable";
            parentTable.append(datagridDiv);

            _this.CreateTemporaryComponentGrid(data, datagridDiv.id, header, component.id).then(function (result) {
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

        var components = this.GetCategoryComponents(tableName);

        for (var componentId in components) {
            var component = components[componentId];

            var data = [{ "SourceAName": component.sourceAName, "SourceBName": component.sourceBName, "Status": component.status, "Information": "" }];

            var parentTable = document.getElementById("comparisonTables");
            var datagridDiv = document.createElement("DIV");
            datagridDiv.id = component.id + "_tempTable";
            parentTable.append(datagridDiv);

            await _this.CreateTemporaryComponentGrid(data, datagridDiv.id, header, component.id);

            var propertyDiv = document.createElement("DIV");
            propertyDiv.id = component.id + "_tempTable" + "_tempPropertiestable";
            parentTable.append(propertyDiv);

            var sources = checkResults["Comparisons"][0]["sources"];
            var headers = _this.CreateComparisonPropertiesTableHeader(sources);

            var properties = component["properties"];
            var data = _this.CreateComparisonTableData(properties);

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

        if (id == selectedTables.length - 1) {
            isLastTable = true;
        }

        await this.ExportGroup(tableName, isLastTable, worksheet, exportProperties).then(function (result) {
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

        var components = this.GetCategoryComponents(tableName);

        if (exportProperties) {
            for (var componentId in components) {
                var component = components[componentId];
                $("#" + component.id + "_tempTable").remove();
                $("#" + component.id + "_tempTable_tempPropertiestable").remove();
            }
        }
        else {
            $("#" + tableName + "_tempTable").remove();
        }

    }
}

ExportExcel.prototype.ExportGroup = async function (tableName, isLastTable, worksheet, exportProperties) {
    var _this = this;
    var components = this.GetCategoryComponents(tableName);
    var save = false;

    worksheet.mergeCells(this.rowCount, 1, this.rowCount, 2);
    worksheet.mergeCells(this.rowCount, 3, this.rowCount, 4);
    Object.assign(worksheet.getRow(this.rowCount).getCell(1), { value: tableName, font: { bold: true, size: 16, underline: 'double' } });

    if (exportProperties) {
        var expotedComp = 1;
        for (var componentId in components) {
            var component = components[componentId];

            if (expotedComp == Object.keys(components).length && isLastTable) {
                save = true;
            }

            await this.ExportComponent(component, worksheet, save, exportProperties).then(function (result) {
                _this.rowCount = result;
                expotedComp++;
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
        var dataGrid = $("#" + component.id + "_tempTable").dxDataGrid(("instance"));
        DevExpress.excelExporter.exportDataGrid({
            worksheet: worksheet,
            component: dataGrid,
            topLeftCell: { row: _this.rowCount, column: 5 },
        }).then(function (dataGridRange) {
            if (exportProperties) {
                _this.rowCount = dataGridRange.to.row + 2;

                var dataGrid1 = $("#" + component.id + "_tempTable" + "_tempPropertiestable").dxDataGrid("instance");

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
            hideBusyIndicator();
        });
    // }
}

ExportExcel.prototype.GetCategoryComponents = function(tableName) {
    var comparisonGroups = checkResults["Comparisons"][0]["results"];
    for(var groupId in comparisonGroups) {
        if(tableName == comparisonGroups[groupId].componentClass) {
            return comparisonGroups[groupId].components;
        }
    }
}

ExportExcel.prototype.CreateComparisonPropertiesTableHeader = function (sources) {
    var columnHeaders = [];

    for (var i = 0; i < 6; i++) {
        var columnHeader = {}
        var caption;
        var columns;
        var dataField;
        var width;
        var visible = true;

        if (i == 0) {
            var group = [];
            for (var j = 1; j < Object.keys(ComparisonPropertyColumns).length; j++) {
                var headerGroupComp = {}
                var visible = true;
                if (j === ComparisonPropertyColumns.SourceAName) {
                    caption = "Property";
                    dataField = ComparisonPropertyColumnNames.SourceAName;

                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[0] = headerGroupComp;
                }
                else if (j === ComparisonPropertyColumns.SourceAValue) {
                    caption = "Value";
                    dataField = ComparisonPropertyColumnNames.SourceAValue;
                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[1] = headerGroupComp;
                }
            }
            caption = sources[0];
            dataField = null;
            columns = group;
        }

        if (i == 1) {
            var group = [];
            for (var j = 1; j < Object.keys(ComparisonPropertyColumns).length; j++) {
                var headerGroupComp = {}
                if (j === ComparisonPropertyColumns.SourceBValue) {
                    caption = "Value";
                    dataField = ComparisonPropertyColumnNames.SourceBValue;
                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[0] = headerGroupComp;
                }
                else if (j === ComparisonPropertyColumns.SourceBName) {
                    caption = "Property";
                    dataField = ComparisonPropertyColumnNames.SourceBName;

                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[1] = headerGroupComp;
                }
            }
            caption = sources[1];
            dataField = null;
            columns = group;
        }

        if (i == 2) {
            var group = [];
            for (var j = 1; j < Object.keys(ComparisonPropertyColumns).length; j++) {               
                
                if (j === ComparisonPropertyColumns.SourceCName) {
                    caption = "Property";
                    dataField = ComparisonPropertyColumnNames.SourceCName;

                    var headerGroupComp = {}
                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[0] = headerGroupComp;
                }
                else if (j === ComparisonPropertyColumns.SourceCValue) {
                    caption = "Value";
                    dataField = ComparisonPropertyColumnNames.SourceCValue;
                    
                    var headerGroupComp = {}
                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[1] = headerGroupComp;
                }              
            }
            caption = "SourceC";
            dataField = null;
            columns = group;
           
            if (sources.length < 3) {
                visible = false;
            }
            else {
                caption = sources[2];
            }
        }

        if (i == 3) {
            var group = [];
            for (var j = 1; j < Object.keys(ComparisonPropertyColumns).length; j++) {               
                
                if (j === ComparisonPropertyColumns.SourceDName) {
                    caption = "Property";
                    dataField = ComparisonPropertyColumnNames.SourceDName;

                    var headerGroupComp = {}
                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[0] = headerGroupComp;
                }
                else if (j === ComparisonPropertyColumns.SourceDValue) {
                    caption = "Value";
                    dataField = ComparisonPropertyColumnNames.SourceDValue;
                    
                    var headerGroupComp = {}
                    headerGroupComp["caption"] = caption;
                    headerGroupComp["dataField"] = dataField;
                    headerGroupComp["width"] = "20%";

                    group[1] = headerGroupComp;
                }              
            }
            caption = "SourceD";
            dataField = null;
            columns = group;
           
            if (sources.length < 4) {
                visible = false;
            }
            else {
                caption = sources[3];
            }
        }

        if (i == 4) {
            caption = "Status";
            dataField = ComparisonPropertyColumnNames.Status;
            width = "20%";           
            columns = []
        }

        if (i == 5) {
            caption = "ID";
            dataField = ComparisonPropertyColumnNames.PropertyId;
            visible = false;
        }

        columnHeader["caption"] = caption;
        if (dataField !== null) {
            columnHeader["dataField"] = dataField;
        }

        if(visible == false) {
            columnHeader["visible"] = visible;
        } 

        if (columns.length > 1 && columns !== undefined) {
            columnHeader["columns"] = columns;
        }

        columnHeader["width"] = width;

        columnHeaders.push(columnHeader);
    }

    return columnHeaders;
}

ExportExcel.prototype.CreateComparisonTableData = function (properties) {

    var property;
    var tableData = [];
    for (var propertyId in properties) {
        property = properties[propertyId];
        tableRowContent = {};
        tableRowContent[ComparisonPropertyColumnNames.SourceAName] = property.sourceAName;
        tableRowContent[ComparisonPropertyColumnNames.SourceAValue] = property.sourceAValue;
        tableRowContent[ComparisonPropertyColumnNames.SourceBValue] = property.sourceBValue;
        tableRowContent[ComparisonPropertyColumnNames.SourceBName] = property.sourceBName;
        tableRowContent[ComparisonPropertyColumnNames.SourceCName] = property.sourceCName;
        tableRowContent[ComparisonPropertyColumnNames.SourceCValue] = property.sourceCValue;  
        tableRowContent[ComparisonPropertyColumnNames.SourceDValue] = property.sourceDValue;
        tableRowContent[ComparisonPropertyColumnNames.SourceDName] = property.sourceDName;

        tableRowContent[ComparisonPropertyColumnNames.Status] = property.severity;

        if(property.sourceAName == null) {
            tableRowContent[ComparisonPropertyColumnNames.SourceAName] = "";
        }
        if(property.sourceAValue == null) {
            tableRowContent[ComparisonPropertyColumnNames.SourceAValue] = "";
        }
        if(property.sourceBName == null) {
            tableRowContent[ComparisonPropertyColumnNames.SourceBName] = "";
        }
        if(property.sourceBValue == null) {
            tableRowContent[ComparisonPropertyColumnNames.SourceBValue] = "";
        }
        if(property.sourceCName == null) {
            tableRowContent[ComparisonPropertyColumnNames.SourceCName] = "";
        }
        if(property.sourceCValue == null) {
            tableRowContent[ComparisonPropertyColumnNames.SourceCValue] = "";
        }
        if(property.sourceDName == null) {
            tableRowContent[ComparisonPropertyColumnNames.SourceDName] = "";
        }
        if(property.sourceDValue == null) {
            tableRowContent[ComparisonPropertyColumnNames.SourceDValue] = "";
        }

        if (property.transpose == 'lefttoright' && property.severity !== 'No Value') {
            tableRowContent[ComparisonPropertyColumnNames.Status] = 'OK(T)';
            tableRowContent[ComparisonPropertyColumnNames.SourceBValue] = property.sourceAValue;
        }
        else if (property.transpose == 'righttoleft' && property.severity !== 'No Value') {
            tableRowContent[ComparisonPropertyColumnNames.Status] = 'OK(T)';
            tableRowContent[ComparisonPropertyColumnNames.SourceAValue] = property.sourceBValue;
        }

        tableData.push(tableRowContent);
    }

    return tableData;
}