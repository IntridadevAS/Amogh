function ExportExcel() {
    this.reviewWorkbook = new ExcelJS.Workbook();
    this.modelBrowserWorkook;
    this.currentExport = "";
    this.rowCount = 9;
}


ExportExcel.prototype.ExportReviewTablesData = async function (selectedTables, exportProperties) {
    var index = 0;
    var save = false;

    var textBoxInstance = $("#reportNameTextBox").dxTextBox("instance");
    var workbookName = textBoxInstance.option("value");

    this.currentExport = "Review";
    var exportComparisonData;
    var exportComplianceData;

    for (var id in selectedTables) {
        index++;
        if (index == Object.keys(selectedTables).length) {
            save = true;
        }

        if (id == "Comparison") {
            this.rowCount = 9;

            if (!exportComparisonData) {
                exportComparisonData = new ComparisonData();
            }
            await exportComparisonData.ExportComparisonComponents(selectedTables[id], exportProperties, save, id, workbookName, this);
        }
        if (id.includes("Compliance")) {
            this.rowCount = 9;

            if (!exportComplianceData) {
                exportComplianceData = new ComplianceData();
            }

            await exportComplianceData.ExportComplianceComponents(selectedTables[id], exportProperties, save, id, workbookName, this);
        }
    }
}

ExportExcel.prototype.ExportDatasetsData = async function (selectedTables, datasets) {

    this.currentExport = "Dataset";
    var dataset = new DatasetData();
    for (var id in selectedTables) {

        var datasetGroups = datasets[id];

        this.modelBrowserWorkook = new ExcelJS.Workbook();
        var workbookName = id.split(".")[0];

        this.rowCount = 1;

        await dataset.ExportDatasetsDataComponents(selectedTables[id], datasetGroups, this.modelBrowserWorkook, true, workbookName, this);

    }
}

ExportExcel.prototype.ExportGroups = async function (selectedTables, save, worksheetName, workbookName, workbook) {
    var _this = this;

    var worksheet;
    if (this.currentExport.toLowerCase() == "review") {
        worksheet = workbook.addWorksheet(worksheetName);
        this.CustomiseHeader(worksheet, worksheetName);
    }

    var isLastTable = false;

    for (var id = 0; id < selectedTables.length; id++) {

        var tableName = selectedTables[id];

        if (this.currentExport.toLowerCase() == "dataset") {
            worksheet = workbook.addWorksheet(tableName);
        }

        if (id == selectedTables.length - 1) {
            isLastTable = true;
        }

        await this.ExportGroup(tableName, worksheet, save, isLastTable, workbookName, workbook).then(function (result) {
            if (result) {
                _this.rowCount = result;
            }

            if (isLastTable) {
                _this.RemoveTempTables(selectedTables);
            }
        });

    }
}

ExportExcel.prototype.RemoveTempTables = function (selectedTables) {
    for (var id = 0; id < selectedTables.length; id++) {
        var tableName = selectedTables[id];

        $("#" + tableName + "_tempTable").remove();

    }
}

ExportExcel.prototype.ExportGroup = async function (tableName, worksheet, save, isLastTable, workbookName, workbook) {
    var _this = this;

    if (this.currentExport.toLowerCase() == "review") {
        Object.assign(worksheet.getRow(this.rowCount).getCell(1), { value: tableName, font: { bold: true, size: 12 }, alignment: { horizontal: 'left', vertical: 'top' }, });
    }

    var dataGrid = $("#" + tableName + "_tempTable").dxDataGrid(("instance"));

    var headerStyles = {
        font: { bold: true, size: 11 },
        alignment: { horizontal: 'left', vertical: 'top' },
        border: {
            top: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } }
        }
    }

    await DevExpress.excelExporter.exportDataGrid({
        worksheet: worksheet,
        component: dataGrid,
        topLeftCell: { row: _this.rowCount + 1, column: 1 },
        customizeCell: function (options) {
            var gridCell = options.gridCell;
            var excelCell = options.cell;
            excelCell.alignment = { horizontal: 'left', vertical: 'top' }
            excelCell.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            };

            excelCell.width = 30;

            if (gridCell.rowType == "header") {
                excelCell.style = headerStyles;
            }
        },
    }).then(function (dataGridRange) {
        if (save && isLastTable) {
            _this.SaveWorkBook(workbookName, workbook);
        }
        else {
            if (_this.currentExport.toLowerCase() == "review") {
                _this.rowCount = dataGridRange.to.row + 3;
            }
        }
    });
}

ExportExcel.prototype.CreateTemporaryComponentGrid = function (component, containerDiv, header) {
    return new Promise((resolve) => {
        $(function () {
            $("#" + containerDiv).dxDataGrid({
                dataSource: component,
                columns: header,
                columnAutoWidth: true,
                columnResizingMode: 'widget',
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

ExportExcel.prototype.CustomiseHeader = function (worksheet, worksheetName) {
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
        for (var cellIndex = 1; cellIndex < 11; cellIndex++) {
            Object.assign(worksheet.getRow(rowIndex).getCell(cellIndex), generalStyles);
        }
    }
    worksheet.getRow(1).height = 20;
    worksheet.getRow(1).font = { bold: true, size: 16 };
    worksheet.getRow(7).numFmt = "d mmmm yyyy";
    worksheet.getRow(1).getCell(3).font = { bold: true, size: 16 };
    worksheet.getColumn(1).values = ["Project/CheckSpace Name:", "CheckCase Name:", "DataSet Name:", "CheckType:", "UserName:", "Date: "];
    worksheet.getColumn(6).values = [projectinfo.projectname + "/" + checkinfo.checkname, "RVM_2_XML", checkResults.sourceInfo.sourceAFileName + " & " + checkResults.sourceInfo.sourceBFileName, worksheetName, userinfo.alias, new Date()];
}

ExportExcel.prototype.SaveWorkBook = function (workbookName, workbook) {

    workbook.xlsx.writeBuffer().then(function (buffer) {
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), workbookName + ".xlsx");
        hideBusyIndicator();
    });
}

function ComparisonData() {
    this.ComparisonExportComplete = false;
}

ComparisonData.prototype.CreateTableData = function (selectedTables, exportProperties, checkData) {

    var tablesData = [];
    for (var id = 0; id < selectedTables.length; id++) {
        var tableName = selectedTables[id];
      
        var sources = checkResults["Comparisons"][0]["sources"];

        var checkComponents = this.GetCategoryComponents(tableName, checkData);
        var tableData = [];
        var propertyIndex = 1;
        var sourcePropertyNamesGroup = []
        for (var componentId in checkComponents) {
            component = checkComponents[componentId];

            tableRowContent = {};

            if (sources.length > 1) {
                tableRowContent[ComparisonColumnNames.SourceAName] = component.sourceAName;
                tableRowContent[ComparisonColumnNames.SourceBName] = component.sourceBName;
            }

            if (sources.length > 2) {
                tableRowContent[ComparisonColumnNames.SourceCName] = component.sourceCName;

            }

            if (sources.length > 3) {
                tableRowContent[ComparisonColumnNames.SourceDName] = component.sourceDName;
            }

            tableRowContent["ComponentStatus"] = component.status;

            if (exportProperties) {
                var properties = component.properties;
                for (var propertyId in properties) {
                    var property = properties[propertyId];
                    var propertyObj = {};
                    var propName = [];

                    if (sources.length > 1) {
                        var property1 = {};
                        property1["caption"] = property.sourceAName;

                        if (property.sourceAName == null) {
                            property1["caption"] = "Missing property";
                        }

                        propName.push(property1["caption"]);

                        propertyObj["propertA_"] = property.sourceAValue;

                        if (property.sourceAValue == null) {
                            propertyObj["propertA_"] = "";
                        }



                        var property2 = {};
                        property2["caption"] = property.sourceBName;

                        if (property.sourceBName == null) {
                            property2["caption"] = "Missing property";
                        }

                        propertyObj["propertB_"] = property.sourceBValue;

                        if (property.sourceBValue == null) {
                            propertyObj["propertB_"] = "";
                        }

                        propName.push(property2["caption"]);

                    }

                    if (sources.length > 2) {

                        var property3 = {};
                        property3["caption"] = property.sourceCName;

                        if (property.sourceCName == null) {
                            property3["caption"] = "Missing property";
                        }

                        propertyObj["propertC_"] = property.sourceCValue;

                        if (property.sourceBValue == null) {
                            propertyObj["propertC_"] = "";
                        }


                        propName.push(property3["caption"]);

                    }

                    if (sources.length > 3) {
                        var property4 = {};
                        property4["caption"] = property.sourceDName;

                        if (property.sourceDName == null) {
                            property4["caption"] = "Missing property";
                        }

                        propertyObj["propertD_"] = property.sourceDValue;

                        if (property.sourceDValue == null) {
                            propertyObj["propertD_"] = "";
                        }

                        propName.push(property4["caption"]);
                    }

                    var a = JSON.stringify(sourcePropertyNamesGroup);
                    var b = JSON.stringify(propName);
                    var c = a.indexOf(b)
                    if (c == -1) {
                        sourcePropertyNamesGroup.push(propName);
                        for (var a in propertyObj) {
                            var key = a + propertyIndex;
                            tableRowContent[key] = propertyObj[a];
                        }
                        var statusKey = "Status_" + propertyIndex
                        tableRowContent[statusKey] = property.severity;

                        propertyIndex++;
                    }
                    else {
                        for (var index in sourcePropertyNamesGroup) {
                            var arr = sourcePropertyNamesGroup[index];
                            if (JSON.stringify(arr) == JSON.stringify(propName)) {
                                var propIndex = Number(index) + 1;
                                for (var a in propertyObj) {
                                    var key = a + propIndex;
                                    tableRowContent[key] = propertyObj[a];
                                }
                                var statusKey = "Status_" + propIndex
                                tableRowContent[statusKey] = property.severity;
                                break;
                            }
                        }
                    }
                }
            }
            tableData.push(tableRowContent);
        }

        tablesData[tableName] = tableData;
    }

    return tablesData;
}

ComparisonData.prototype.GetData = function () {
    return new Promise((resolve) => {
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        $.ajax({
            data: {
                'InvokeFunction': "ReadSavedComparisonCheckData",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname,
            },
            async: true,
            type: "POST",
            url: "PHP/ProjectLoadManager.php"
        }).done(function (msg) {
            var message = JSON.parse(msg);

            if (message.MsgCode === 1) {
                return resolve(message.Data);
            }

            return resolve(null);
        });
    });
}

ComparisonData.prototype.CreateTableHeader = function (selectedTables, exportProperties, checkData) {
    var tablesHeaders = [];
    for (var id = 0; id < selectedTables.length; id++) {
        var tableName = selectedTables[id];
        var components = this.GetCategoryComponents(tableName, checkData);
        var headers = [];

        var sources = checkResults["Comparisons"][0]["sources"];
        for (var sourceId = 0; sourceId < sources.length; sourceId++) {
            var Obj = {};

            Obj["caption"] = sources[sourceId];
            if (sourceId == 0) {
                Obj["dataField"] = ComparisonColumnNames.SourceAName;
            }
            if (sourceId == 1) {
                Obj["dataField"] = ComparisonColumnNames.SourceBName;
            }
            if (sourceId == 2) {
                Obj["dataField"] = ComparisonColumnNames.SourceCName;
            }
            if (sourceId == 3) {
                Obj["dataField"] = ComparisonColumnNames.SourceDName;
            }

            headers.push(Obj);
        }

        var obj = {
            "caption": "Status",
            "dataField": "ComponentStatus"
        };

        headers.push(obj);

        if (exportProperties) {
            var data = {};

            var propertyIndex = 1;
            var groups = [];

            var sourcePropertyNamesGroup = []
            for (var componentId in components) {
                var component = components[componentId];
                var properties = component["properties"];

                for (var propertyId in properties) {
                    var property = properties[propertyId];

                    var group = [];
                    var propName = [];

                    if (sources.length > 1) {
                        var property1 = {};
                        property1["caption"] = property.sourceAName;

                        if (property.sourceAName == null) {
                            property1["caption"] = "Missing property";
                        }

                        propName.push(property1["caption"]);

                        property1["dataField"] = "propertA_" + propertyIndex;

                        group.push(property1);

                        var property2 = {};
                        property2["caption"] = property.sourceBName;

                        if (property.sourceBName == null) {
                            property2["caption"] = "Missing property";
                        }

                        propName.push(property2["caption"]);

                        property2["dataField"] = "propertB_" + propertyIndex;

                        group.push(property2);

                    }

                    if (sources.length > 2) {

                        var property3 = {};
                        property3["caption"] = property.sourceCName;

                        if (property.sourceCName == null) {
                            property3["caption"] = "Missing property";
                        }

                        propName.push(property3["caption"]);

                        property3["dataField"] = "propertC_" + propertyIndex;

                        group.push(property3);

                    }

                    if (sources.length > 3) {
                        var property4 = {};
                        property4["caption"] = property.sourceDName;

                        if (property.sourceDName == null) {
                            property4["caption"] = "Missing property";
                        }

                        propName.push(property4["caption"]);

                        property4["dataField"] = "propertD_" + propertyIndex;

                        group.push(property4);
                    }

                    var propertyStatus = {};
                    propertyStatus["caption"] = "Status";
                    propertyStatus["dataField"] = "Status_" + propertyIndex;
                    group.push(propertyStatus);

                    var a = JSON.stringify(sourcePropertyNamesGroup);
                    var b = JSON.stringify(propName);
                    var c = a.indexOf(b)
                    if (c == -1) {
                        sourcePropertyNamesGroup.push(propName);
                        groups.push(group);
                        propertyIndex++;
                    }
                }
            }

            for (var a in groups) {
                for (var b in groups[a]) {
                    headers.push(groups[a][b]);
                }
            }

            tablesHeaders[tableName] = headers;
        }
        else {
            tablesHeaders[tableName] = headers;
        }

    }

    return tablesHeaders;
}

ComparisonData.prototype.GetCategoryComponents = function (tableName, data) {
    // var comparisonGroups = checkResults["Comparisons"][0]["results"];
    for (var groupId in data) {
        if (tableName == data[groupId].componentClass) {
            return data[groupId].components;
        }
    }
}

ComparisonData.prototype.ExportComparisonComponents = function (selectedTables, exportProperties, save, worksheetName, workbookName, exportExcelInstance) {
    return new Promise((resolve) => {
        this.CreateReviewExportDummyDataGrids(selectedTables, exportProperties, worksheetName, exportExcelInstance).then(function () {
            exportExcelInstance.ExportGroups(selectedTables, save, worksheetName, workbookName, exportExcelInstance.reviewWorkbook).then(function () {
                return resolve(true);
            });
        });
    })
}

ComparisonData.prototype.CreateReviewExportDummyDataGrids = async function (selectedTables, exportProperties, worksheetName, exportExcelInstance) {
    var _this = this;
    return new Promise((resolve) => {
        // let checkData = this.GetData();
        this.GetData().then(function (checkData) {
            if (!checkData) {
                return resolve(false);
            }

            let headers = _this.CreateTableHeader(selectedTables, exportProperties, checkData);
            let data = _this.CreateTableData(selectedTables, exportProperties, checkData);
            let parentTable = document.getElementById("comparisonTables");

            var allPromises = [];
            for (var tableName in headers) {
                var header = headers[tableName];
                var tableData = data[tableName];

                var datagridDiv = document.createElement("DIV");
                datagridDiv.id = tableName + "_tempTable";
                datagridDiv.style.display = "none";
                parentTable.append(datagridDiv);

                allPromises.push(exportExcelInstance.CreateTemporaryComponentGrid(tableData, datagridDiv.id, header));
            }

            if (allPromises.length > 0) {
                xCheckStudio.Util.waitUntilAllPromises(allPromises).then(function (res) {
                    return resolve(res);
                });
            }
            else {
                return resolve(true);
            }
        });
    });
}


function ComplianceData(worksheetName) {
    this.ComparisonExportComplete = false;
    this.WorkSheetName = worksheetName
}

ComplianceData.prototype.CreateTableData = function (selectedTables, exportProperties) {

    var tablesData = [];
    for (var id = 0; id < selectedTables.length; id++) {
        var tableName = selectedTables[id];

        // var sources = checkResults["Comparisons"][0]["sources"];

        var dataObj = this.GetCategoryComponentsAndSourceName(tableName);
        var tableData = [];
        var propertyIndex = 1;
        var sourcePropertyNamesGroup = []
        checkComponents = dataObj["Components"];
        for (var componentId in checkComponents) {
            component = checkComponents[componentId];

            tableRowContent = {};

            tableRowContent[ComplianceColumnNames.SourceName] = component.name;
            tableRowContent["ComponentStatus"] = component.status;

            if (component.accepted == "true") {
                tableRowContent["ComponentStatus"] = "OK(A)";
            }


            if (exportProperties) {
                var properties = component.properties;
                for (var propertyId in properties) {
                    var property = properties[propertyId];
                    var propertyObj = {};
                    var propName;

                    var property1 = {};
                    property1["caption"] = property.name;

                    if (property.name == null) {
                        property1["caption"] = "Missing property";
                    }

                    propertyObj["propert_"] = property.value;

                    if (property.value == null) {
                        propertyObj["propert_"] = "";
                    }

                    propName = property1["caption"];

                    if (!sourcePropertyNamesGroup.includes(propName)) {
                        sourcePropertyNamesGroup.push(propName);
                        for (var a in propertyObj) {
                            var key = a + propertyIndex;
                            tableRowContent[key] = propertyObj[a];
                        }
                        var statusKey = "Status_" + propertyIndex
                        tableRowContent[statusKey] = property.severity;

                        var ruleKey = "Rule_" + propertyIndex
                        tableRowContent[ruleKey] = property.rule;
                        tableRowContent[statusKey] = property.severity;

                        propertyIndex++;
                    }
                    else {

                        var propIndex = sourcePropertyNamesGroup.indexOf(propName) + 1;
                        for (var a in propertyObj) {
                            var key = a + propIndex;
                            tableRowContent[key] = propertyObj[a];
                        }
                        var statusKey = "Status_" + propIndex
                        tableRowContent[statusKey] = property.severity;

                        var ruleKey = "Rule_" + propIndex
                        tableRowContent[ruleKey] = property.rule;

                    }
                }
            }
            tableData.push(tableRowContent);
        }

        tablesData[tableName] = tableData;
    }

    return tablesData;
}

ComplianceData.prototype.CreateTableHeader = function (selectedTables, exportProperties) {
    var tablesHeaders = [];
    for (var id = 0; id < selectedTables.length; id++) {
        var tableName = selectedTables[id];
        var dataObj = this.GetCategoryComponentsAndSourceName(tableName);
        var headers = [];

        var source = dataObj["source"];

        var obj = {
            "caption": source,
            "dataField": ComplianceColumnNames.SourceName
        }

        headers.push(obj);

        var obj = {
            "caption": "Status",
            "dataField": "ComponentStatus"
        };

        headers.push(obj);

        if (exportProperties) {
            var data = {};

            var propertyIndex = 1;
            var groups = [];
            var components = dataObj["Components"];

            var sourcePropertyNamesGroup = []
            for (var componentId in components) {
                var component = components[componentId];
                var properties = component["properties"];

                for (var propertyId in properties) {
                    var property = properties[propertyId];

                    var group = [];
                    var propName;

                    var property1 = {};
                    property1["caption"] = property.name;

                    if (property.name == null) {
                        property1["caption"] = "Missing property";
                    }

                    propName = property1["caption"];

                    property1["dataField"] = "propert_" + propertyIndex;

                    group.push(property1);


                    var propertyStatus = {};
                    var propertyRule = {};
                    propertyStatus["caption"] = "Status";
                    propertyStatus["dataField"] = "Status_" + propertyIndex;

                    propertyRule["caption"] = "Rule";
                    propertyRule["dataField"] = "Rule_" + propertyIndex;
                    group.push(propertyStatus);
                    group.push(propertyRule);

                    if (!sourcePropertyNamesGroup.includes(propName)) {
                        sourcePropertyNamesGroup.push(propName);
                        groups.push(group);
                        propertyIndex++;
                    }
                }
            }

            for (var a in groups) {
                for (var b in groups[a]) {
                    headers.push(groups[a][b]);
                }
            }

            tablesHeaders[tableName] = headers;
        }
        else {
            tablesHeaders[tableName] = headers;
        }

    }

    return tablesHeaders;
}

ComplianceData.prototype.GetCategoryComponentsAndSourceName = function (tableName) {

    var data = {};
    var Compliances = checkResults["Compliances"];

    var complianceGroups;
    if (this.WorkSheetName == "ComplianceA") {
        complianceGroups = Compliances[0]["results"];
        data["source"] = Compliances[0].source;
    }
    else if (this.WorkSheetName == "ComplianceB") {
        complianceGroups = Compliances[1]["results"];
        data["source"] = Compliances[1].source;
    }
    else if (this.WorkSheetName == "ComplianceC") {
        complianceGroups = Compliances[2]["results"];
        data["source"] = Compliances[2].source;
    }
    if (this.WorkSheetName == "ComplianceD") {
        complianceGroups = Compliances[3]["results"];
        data["source"] = Compliances[3].source;
    }

    for (var groupId in complianceGroups) {
        if (tableName == complianceGroups[groupId].componentClass) {
            data["Components"] = complianceGroups[groupId].components;
            return data;
        }
    }
}

ComplianceData.prototype.ExportComplianceComponents = function (selectedTables, exportProperties, save, worksheetName, workbookName, exportExcelInstance) {
    return new Promise((resolve) => {
        this.CreateReviewExportDummyDataGrids(selectedTables, exportProperties, worksheetName, exportExcelInstance).then(function () {
            exportExcelInstance.ExportGroups(selectedTables, save, worksheetName, workbookName, exportExcelInstance.reviewWorkbook).then(function () {
                return resolve(true);
            });
        });
    })
}

ComplianceData.prototype.CreateReviewExportDummyDataGrids = async function (selectedTables, exportProperties, worksheetName, exportExcelInstance) {
    var _this = this;
    var headers;
    var data;
    var parentTable;


    this.WorkSheetName = worksheetName;
    headers = this.CreateTableHeader(selectedTables, exportProperties);
    data = this.CreateTableData(selectedTables, exportProperties);
    if (worksheetName == "ComplianceA") {
        parentTable = document.getElementById("complianceSource1tables");
    }
    else if (worksheetName == "ComplianceB") {
        parentTable = document.getElementById("complianceSource2tables");
    }
    else if (worksheetName == "ComplianceC") {
        parentTable = document.getElementById("complianceSource3tables");
    }
    else if (worksheetName == "ComplianceD") {
        parentTable = document.getElementById("complianceSource4tables");
    }

    for (var tableName in headers) {
        var header = headers[tableName];
        var tableData = data[tableName];

        var datagridDiv = document.createElement("DIV");
        datagridDiv.id = tableName + "_tempTable";
        datagridDiv.style.display = "none";
        parentTable.append(datagridDiv);

        await exportExcelInstance.CreateTemporaryComponentGrid(tableData, datagridDiv.id, header);

    }

}

function DatasetData(worksheetName) {
    this.WorkSheetName = worksheetName
}

DatasetData.prototype.CreateTableData = function (tableName, components, headers) {

    var tablesData = [];
    var tableData = [];

    var propertyIndex = 2;
    var sourcePropertyNamesGroup = []
    var checkComponents = components;
    for (var componentId in checkComponents) {
        component = checkComponents[componentId];

        tableRowContent = {};

        var properties = component.properties;
        for (var propertyId in properties) {
            var property = properties[propertyId];
            var propertyObj = {};
            var propName;

            var property1 = {};
            property1["caption"] = property.name;

            if (property.name == null) {
                property1["caption"] = "Missing property";
            }

            propertyObj["propert_"] = property.value;

            if (property.value == null) {
                propertyObj["propert_"] = "";
            }

            propName = property1["caption"];

            if (!sourcePropertyNamesGroup.includes(propName)) {
                if (property.name.toLowerCase() == "name" || property.name.toLowerCase() == "tagname") {
                    sourcePropertyNamesGroup.unshift(propName);
                    tableRowContent["propert_1"] = propertyObj[a];
                    continue;
                }
                else {
                    for (var a in propertyObj) {
                        var key = a + propertyIndex;
                        tableRowContent[key] = propertyObj[a];
                    }
                }
                sourcePropertyNamesGroup.push(propName);
                propertyIndex++;
            }
            else {

                var propIndex = sourcePropertyNamesGroup.indexOf(propName) + 1;
                if (property.name.toLowerCase() == "name" || property.name.toLowerCase() == "tagname") {
                    tableRowContent["propert_1"] = propertyObj[a];
                }
                else {
                    for (var a in propertyObj) {
                        var key = a + propIndex;
                        tableRowContent[key] = propertyObj[a];
                    }
                }
            }
        }
        tableData.push(tableRowContent);
    }

    tablesData[tableName] = tableData;

    return tablesData;
}

DatasetData.prototype.CreateTableHeader = function (tableName, components) {

    var tablesHeaders = [];

    var headers = [];

    var data = {};

    var propertyIndex = 2;
    var groups = [];

    var sourcePropertyNamesGroup = []
    for (var componentId in components) {
        var component = components[componentId];
        var properties = component["properties"];

        for (var propertyId in properties) {
            var property = properties[propertyId];

            var group = [];
            var propName;

            var property1 = {};
            property1["caption"] = property.name;

            if (property.name == null) {
                property1["caption"] = "Missing property";
            }
            else if (property.name.toLowerCase() == "name" || property.name.toLowerCase() == "tagname") {
                property1["dataField"] = "propert_1";
                if (propertyIndex == 2) {
                    propertyIndex = 1;
                }
            }
            else {
                property1["dataField"] = "propert_" + propertyIndex;
            }

            propName = property1["caption"];

            group.push(property1);

            if (!sourcePropertyNamesGroup.includes(propName)) {
                sourcePropertyNamesGroup.push(propName);
                if (property.name.toLowerCase() == "name" || property.name.toLowerCase() == "tagname") {
                    groups.unshift(group);
                    continue;
                }
                groups.push(group);
                propertyIndex++;
            }
        }
    }

    for (var a in groups) {
        for (var b in groups[a]) {
            headers.push(groups[a][b]);
        }
    }

    tablesHeaders[tableName] = headers;

    return tablesHeaders;
}

DatasetData.prototype.ExportDatasetsDataComponents = function (selectedTables, datasetGroups, workbook, save, workbookName, exportExcelInstance) {
    return new Promise((resolve) => {
        this.CreateDatasetExportDummyDataGrids(selectedTables, datasetGroups, exportExcelInstance).then(function () {
            exportExcelInstance.ExportGroups(selectedTables, save, "", workbookName, workbook).then(function () {
                return resolve(true);
            });
        });
    })
}

DatasetData.prototype.CreateDatasetExportDummyDataGrids = async function (selectedTables, datasetsGroups, exportExcelInstance) {
    for (var id in selectedTables) {
        var tableName = selectedTables[id];

        var components = datasetsGroups[tableName];


        headers = this.CreateTableHeader(tableName, components);
        data = this.CreateTableData(tableName, components, headers);
        parentTable = document.getElementById("dataset1");

        var header = headers[tableName];
        var tableData = data[tableName];

        var datagridDiv = document.createElement("DIV");
        datagridDiv.id = tableName + "_tempTable";
        datagridDiv.style.display = "none";
        parentTable.append(datagridDiv);

        await exportExcelInstance.CreateTemporaryComponentGrid(tableData, datagridDiv.id, header);
    }
}
