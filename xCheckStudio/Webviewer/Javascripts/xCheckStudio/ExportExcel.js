function ExportExcel() {
    this.reviewWorkbook = new ExcelJS.Workbook();
    this.modelBrowserWorkook;
    this.currentExport = "";
    this.rowCount = 9;
}

ExportExcel.prototype.ExportReviewTablesData = async function (selectedTables) {
    var index = 0;
    var save = false;

    // var textBoxInstance = $("#reportNameTextBox").dxTextBox("instance");
    // var workbookName = textBoxInstance.option("value");
    let workbookName = "Excel Report";

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

            await exportComparisonData.ExportComparisonComponents(
                selectedTables[id]["categories"],
                selectedTables[id]["exportProperties"],
                save,              
                id,
                workbookName,
                this);
        }
        else if (id.includes("Compliance")) {
            this.rowCount = 9;

            if (!exportComplianceData) {
                exportComplianceData = new ComplianceData();
            }

            await exportComplianceData.ExportComplianceComponents(
                selectedTables[id]["categories"],
                selectedTables[id]["exportProperties"],
                save,              
                id,
                workbookName,
                this);
        }
    }
}

ExportExcel.prototype.ExportDatasetsData = async function (selectedDatasets) {

    this.currentExport = "Dataset";
    var dataset = new DatasetData();
    for (let i = 0; i < selectedDatasets.length; i++) {
        let selectedDataset = selectedDatasets[i];

        this.modelBrowserWorkook = new ExcelJS.Workbook();
        var workbookName = selectedDataset["selectedDataset"].split(".")[0];

        var data = selectedDataset["datasetData"];

        this.rowCount = 1;
        await dataset.ExportDatasetsDataComponents(
            selectedDataset["selectedCategories"],
            data,
            this.modelBrowserWorkook,
            true,
            workbookName,
            this);
    }
}

ExportExcel.prototype.ExportComparisonGroups = async function (
    allTablesData, 
    save, 
    worksheetName, 
    workbookName, 
    workbook) {
    var _this = this;

    var worksheet;
    if (this.currentExport.toLowerCase() == "review") {
        worksheet = workbook.addWorksheet(worksheetName);
        this.CustomiseHeader(worksheet, worksheetName);
    }

    let gridNames = [];
    var isLastTable = false;
    let allTableHeaders = allTablesData["headers"];
    for (let i = 0; i < Object.keys(allTableHeaders).length; i++) {
        let categoryGroupName = Object.keys(allTableHeaders)[i];     

        let categoryGroup = allTableHeaders[categoryGroupName]
        for (let j = 0; j < Object.keys(categoryGroup).length; j++) {
            let classGroupName = Object.keys(categoryGroup)[j];

            // export category group name
            if (j === 0) {
                Object.assign(
                    worksheet.getRow(this.rowCount).getCell(1),
                    {
                        value: categoryGroupName,
                        font: { bold: true, size: 18 },
                        alignment: { horizontal: 'left', vertical: 'top' },
                    });
                this.rowCount += 1;
            }

            let tableId = categoryGroupName + "-" + classGroupName;
            gridNames.push(tableId);           

            if ((i === Object.keys(allTableHeaders).length - 1) &&
                (j === Object.keys(categoryGroup).length - 1)) {
                isLastTable = true;
            }            

            await this.ExportGroup(
                classGroupName,
                tableId,
                worksheet,
                save,
                isLastTable,
                workbookName,
                workbook).then(function (result) {

                    if (result) {
                        _this.rowCount = result;
                    }

                    if (isLastTable) {
                        _this.RemoveTempTables(gridNames);
                    }
                });
        }
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

        await this.ExportGroup(
            tableName,
            tableName,
            worksheet,
            save,
            isLastTable,
            workbookName,
            workbook).then(function (result) {
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

        $("#" + tableName.replace(/\s/g, '') + "_tempTable").remove();

    }
}

ExportExcel.prototype.ExportGroup = async function (
    tableCaption,
    tableName,
    worksheet,
    save,
    isLastTable,
    workbookName,
    workbook) {
    var _this = this;

    if (this.currentExport.toLowerCase() == "review") {
        Object.assign(
            worksheet.getRow(this.rowCount).getCell(1),
            {
                value: tableCaption,
                font: { bold: true, size: 12 },
                alignment: { horizontal: 'left', vertical: 'top' },
            });
    }

    var dataGrid = $("#" + tableName.replace(/\s/g, '') + "_tempTable").dxDataGrid(("instance"));

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

    let tableFromRow = _this.rowCount + 1;
    let tableFromColumn = 1;
    let tableToColumn = 1;
    await DevExpress.excelExporter.exportDataGrid({
        worksheet: worksheet,
        component: dataGrid,
        topLeftCell: { row: tableFromRow, column: tableFromColumn },
        autoFilterEnabled: true,
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

            if (gridCell.rowType == "group") {
                let excelRow = worksheet.getRow(excelCell.fullAddress.row);
                if (excelRow) {
                    let value = excelRow.getCell(1).value;
                    if (value) {
                        if (value.toLowerCase().includes("error")) {
                            excelCell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: "fad9d7" }
                            };
                        }
                        else if (value.toLowerCase().includes("ok")) {
                            excelCell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: "c9ffcf" }
                            };
                        }
                        else if (value.toLowerCase().includes("no match")) {
                            excelCell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: "dddbff" }
                            };
                        }
                        else if (value.toLowerCase().includes("warning")) {
                            excelCell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: "f9ffc7" }
                            };
                        }
                        else if (value.toLowerCase().includes("undefined")) {

                        }
                    }
                }
            }
            else if (gridCell.rowType == "header") {
                excelCell.style = headerStyles;
                excelCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: "BEDFE6" }
                };
            }
            else if (gridCell.rowType == "data") {
                if (_this.currentExport.toLowerCase() === "review") {

                    let columnDataField = gridCell.column.dataField;
                    if (columnDataField.toLowerCase() === "sourcea" ||
                        columnDataField.toLowerCase() === "sourceb" ||
                        columnDataField.toLowerCase() === "sourcec" ||
                        columnDataField.toLowerCase() === "sourced" ||
                        columnDataField.toLowerCase() === "componentstatus") {
                        excelCell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: "D3D3D3" }
                        };

                        excelCell.font = { bold: true, size: 12 };
                        excelCell.width = 50;
                    }
                    else if (columnDataField.includes("_")) {
                        var index = columnDataField.indexOf("_");
                        if (index !== -1) {
                            let numStr = columnDataField.slice(index + 1);
                            if (!isNaN(numStr)) {
                                let num = Number(numStr);
                                if (num % 2 === 0) {
                                    excelCell.fill = {
                                        type: 'pattern',
                                        pattern: 'solid',
                                        fgColor: { argb: "D3D3D3" }
                                    };
                                }
                                else {
                                    // excelCell.fill = {
                                    //     type: 'pattern',
                                    //     pattern: 'solid',
                                    //     fgColor: { argb: "D2DA64" }
                                    // };
                                }
                            }
                        }
                    }
                }
                else if (_this.currentExport.toLowerCase() === "dataset") {
                    _this.setAlternateRowColor(gridCell, excelCell);
                }
            }

            // get last cell index
            if (excelCell.fullAddress.col > tableToColumn) {
                tableToColumn = excelCell.fullAddress.col
            }
        },
    }).then(function (dataGridRange) {

        // // Add auto filter to table
        // let tableToRow = dataGridRange.to.row;
        // worksheet.autoFilter = {
        //     from: {
        //         row: tableFromRow,
        //         column: tableFromColumn
        //     },
        //     to: {
        //         row: tableToRow,
        //         column: tableToColumn
        //     }
        // }

        if (save && isLastTable) {
            _this.SaveWorkBook(workbookName, workbook);
        }
        else {
            if (_this.currentExport.toLowerCase() == "review") {
                _this.rowCount = dataGridRange.to.row + 2;
            }
        }
    });
}

ExportExcel.prototype.setAlternateRowColor = function (gridCell, excelCell) {
    if (gridCell.rowType === "data") {
        if (excelCell.fullAddress.row % 2 === 0) {
            excelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D3D3D3" }, bgColor: { argb: "D3D3D3" } };
        }
    }
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
                    mode: "virtual",
                    rowRenderingMode: 'virtual',
                    columnRenderingMode: 'virtual'
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

    // get check case name
    let checkCaseName = "";
    if ("checkcaseInfo" in checkResults &&
        "checkCaseData" in checkResults.checkcaseInfo) {
        let checkCaseData = JSON.parse(checkResults.checkcaseInfo.checkCaseData);
        checkCaseName = checkCaseData.CheckCase.Name;
    }

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
    worksheet.getColumn(6).values = [projectinfo.projectname + "/" + checkinfo.checkname, checkCaseName, checkResults.sourceInfo.sourceAFileName + " & " + checkResults.sourceInfo.sourceBFileName, worksheetName, userinfo.alias, new Date()];
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

                        if (property.accepted === "true") {
                            tableRowContent[statusKey] = "ACCEPTED";
                        }
                        else {
                            tableRowContent[statusKey] = property.severity;
                        }

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
                                if (property.accepted === "true") {
                                    tableRowContent[statusKey] = "ACCEPTED";
                                }
                                else {
                                    tableRowContent[statusKey] = property.severity;
                                }
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

ComparisonData.prototype.GetCheckcaseMappingInfo = function (component, sources, datasetOrdersInCheckcase) {

    // let datasetOrdersInCheckcase = getDataSourceOrderInCheckcase();

    let checkcase = JSON.parse(checkResults.checkcaseInfo.checkCaseData).CheckCase;

    // get comparison checkcase type
    let comparisonCheckcaseType = null;
    for (var i = 0; i < checkcase.CheckTypes.length; i++) {
        if (checkcase.CheckTypes[i].Name.toLowerCase() === "comparison") {
            comparisonCheckcaseType = checkcase.CheckTypes[i];
            break;
        }
    }
    if (comparisonCheckcaseType === null) {
        return null;
    }

    // let splitResult = tableName.split("-");
    // if (splitResult.length < 2) {
    //     continue;
    // }

    // get checkcase mapping category group
    // let checkcaseCategoryGroup = null;
    let mappingList = ["SourceAName", "SourceBName", "SourceCName", "SourceDName"];
    // for (let ii = 0; ii < comparisonCheckcaseType.ComponentGroups.length; ii++) {
    //     let componentGroup = comparisonCheckcaseType.ComponentGroups[ii];
    //     if (componentGroup[mappingList[datasetOrdersInCheckcase["a"] - 1]] === component.sourceAMainClass &&
    //         componentGroup[mappingList[datasetOrdersInCheckcase["b"] - 1]] === component.sourceBMainClass) {
    //         if (sources.length === 3) {
    //             if (componentGroup[mappingList[datasetOrdersInCheckcase["c"] - 1]] === component.sourceCMainClass) {
    //                 checkcaseCategoryGroup = componentGroup;
    //                 break;
    //             }
    //         }
    //         else if (sources.length === 4) {
    //             if (componentGroup[mappingList[datasetOrdersInCheckcase["c"] - 1]] === component.sourceCMainClass &&
    //                 componentGroup[mappingList[datasetOrdersInCheckcase["d"] - 1]] === component.sourceDMainClass) {
    //                 checkcaseCategoryGroup = componentGroup;
    //                 break;
    //             }
    //         }
    //         else {
    //             checkcaseCategoryGroup = componentGroup;
    //             break;
    //         }
    //     }
    // }
    // if (checkcaseCategoryGroup === null) {
    //     return null;
    // }

    // class mapping info
    let classMappingArray = this.GetClassMappingInfo(component.classMappingInfo, 0);
    // let classMappingStr = component.classMappingInfo.split(",")[0];
    // classMappingStr = classMappingStr.replace(new RegExp(' ', 'g'), "");
    // classMappingStr = classMappingStr.replace(new RegExp('Class:', 'g'), "");
    // let classMappingArray = classMappingStr.split("-");

    // get check case class mapping
    let checkcaseClassMapping = null;
    for (let i = 0; i < comparisonCheckcaseType.ComponentGroups.length; i++) {
        let checkcaseCategoryGroup = comparisonCheckcaseType.ComponentGroups[i];

        for (let j = 0; j < checkcaseCategoryGroup.ComponentClasses.length; j++) {
            let componentClass = checkcaseCategoryGroup.ComponentClasses[j];

            if (componentClass[mappingList[datasetOrdersInCheckcase["a"] - 1]] === classMappingArray[0] &&
                componentClass[mappingList[datasetOrdersInCheckcase["b"] - 1]] === classMappingArray[1]) {
                if (sources.length === 3) {
                    if (componentClass[mappingList[datasetOrdersInCheckcase["c"] - 1]] === classMappingArray[2]) {
                        checkcaseClassMapping = componentClass;
                        break;
                    }
                }
                else if (sources.length === 4) {
                    if (componentClass[mappingList[datasetOrdersInCheckcase["c"] - 1]] === classMappingArray[2] &&
                        componentClass[mappingList[datasetOrdersInCheckcase["d"] - 1]] === classMappingArray[3]) {
                        checkcaseClassMapping = componentClass;
                        break;
                    }
                }
                else {
                    checkcaseClassMapping = componentClass;
                    break;
                }
            }
        }
    }
    //  if (checkcaseClassMapping === null) {
    //      return null;
    //  }

    return checkcaseClassMapping;
}

ComparisonData.prototype.GetPropertyMapping = function (properties, mappedProperties, datasetOrdersInCheckcase) {
    let mappingList = ["SourceAName", "SourceBName", "SourceCName", "SourceDName"];
    for (let i = 0; i < mappedProperties.length; i++) {
        let mappedProperty = mappedProperties[i];

        let match = false;
        for (let j = 0; j < properties.length; j++) {
            let property = properties[j];
            if (property === "missing property") {
                continue;
            }

            let srcId = null;
            if (j === 0) {
                srcId = "a";
            }
            else if (j === 1) {
                srcId = "b";
            }
            else if (j === 2) {
                srcId = "c";
            }
            else if (j === 3) {
                srcId = "d";
            }
            else {
                continue;
            }
            if (mappedProperty[mappingList[datasetOrdersInCheckcase[srcId] - 1]].toLowerCase() === property.toLowerCase()) {
                match = true;
            }
            else {
                match = false;
                break;
            }
        }
        if (match) {
            return mappedProperty;
        }
    }

    return null;
}

ComparisonData.prototype.GetClassMappingArray = function (classMappingInfo) {
    return classMappingInfo.split(",");
}

ComparisonData.prototype.GetClassMappingInfo = function (classMappingInfo, index) {
    let classMappings = this.GetClassMappingArray(classMappingInfo);
    if (classMappings.length > index) {
        let classMappingStr = classMappings[index];
        classMappingStr = classMappingStr.replace(new RegExp(' ', 'g'), "");
        classMappingStr = classMappingStr.replace(new RegExp('Class:', 'g'), "");
        return classMappingStr.split("-");
    }

    return null;
}

ComparisonData.prototype.GetTablesData = function (selectedTables, exportProperties, checkData) {
    var tablesHeaders = [];
    var tablesData = [];

    let datasetOrdersInCheckcase = getDataSourceOrderInCheckcase();
    let mappingList = ["SourceAName", "SourceBName", "SourceCName", "SourceDName"];

    var sources = checkResults["Comparisons"][0]["sources"];
    for (var id = 0; id < selectedTables.length; id++) {
        var tableName = selectedTables[id];
        var components = this.GetCategoryComponents(tableName, checkData);

        var allHeaders = {};
        var allData = {};
        let propertyNameGroups = {};
        for (var componentId in components) {
            let component = components[componentId];

            // // get check case mapping info
            // let checkCaseMappingInfo = null;
            // if (component.status.toLowerCase() !== "undefined") {
            //     checkCaseMappingInfo = this.GetCheckcaseMappingInfo(component, sources, datasetOrdersInCheckcase);
            // }

            if (component.status.toLowerCase() === "no match" ||
                component.status.toLowerCase() === "undefined") {
                let rowData = {};
                let classGroup = "No Match";
                if (component.status.toLowerCase() === "undefined") {
                    classGroup = "Undefined";
                }

                // check if no match is already in allHeaders. if not,
                // then add
                if (!(classGroup in allHeaders)) {
                    allHeaders[classGroup] = [];
                    allData[classGroup] = [];
                    propertyNameGroups[classGroup] = {
                        captions: [],
                        dataFields: []
                    };

                    // get source names
                    for (let sourceId = 0; sourceId < sources.length; sourceId++) {
                        let obj = {};
                        obj["caption"] = sources[sourceId];
                        if (sourceId === 0) {
                            obj["dataField"] = "SourceA";
                        }
                        if (sourceId === 1) {
                            obj["dataField"] = "SourceB";
                        }
                        if (sourceId === 2) {
                            obj["dataField"] = "SourceC";
                        }
                        if (sourceId === 3) {
                            obj["dataField"] = "SourceD";
                        }
                        allHeaders[classGroup].push(obj);
                    }
                    
                    // component status
                    allHeaders[classGroup].push({
                        "caption": "Status",
                        "dataField": "ComponentStatus",
                        // "groupIndex": 0
                    });
                    allHeaders[classGroup].push({
                        "caption": "Class Mapping",
                        "dataField": "ClassMapping",
                        "groupIndex": 0
                    });
                }
                if(component.sourceAName !== null)
                {
                    rowData["SourceA"] = component.sourceAName;
                }
                else if(component.sourceBName !== null)
                {
                    rowData["SourceB"] = component.sourceBName;
                }
                else if(component.sourceCName !== null)
                {
                    rowData["SourceC"] = component.sourceCName;
                }
                else if(component.sourceDName !== null)
                {
                    rowData["SourceD"] = component.sourceDName;
                }              
                rowData["ComponentStatus"] = component.status;
                rowData["ClassMapping"] = classGroup;

                 // now export properties
                 if (!exportProperties) {
                    allData[classGroup].push(rowData);
                    continue;
                }

                var properties = component["properties"];
                for (let j = 0; j < properties.length; j++) {
                    let property = properties[j];

                    let group = [];
                    let propNames = [];
                    let propDataFields = [];

                    let propertyIndex = allHeaders[classGroup].length;

                    let property1 = {};
                    if (property.sourceAName !== null) {
                        property1["caption"] = property.sourceAName;
                        property1["dataField"] = "property_" + propertyIndex;

                        rowData[property1["dataField"]] = property.sourceAValue;
                    }
                    else if (property.sourceBName !== null) {
                        property1["caption"] = property.sourceBName;
                        property1["dataField"] = "property_" + propertyIndex;

                        rowData[property1["dataField"]] = property.sourceBValue;
                    }
                    else if (property.sourceCName !== null) {
                        property1["caption"] = property.sourceCName;
                        property1["dataField"] = "property_" + propertyIndex;

                        rowData[property1["dataField"]] = property.sourceCValue;
                    }
                    else if (property.sourceDName !== null) {
                        property1["caption"] = property.sourceDName;
                        property1["dataField"] = "property_" + propertyIndex;

                        rowData[property1["dataField"]] = property.sourceDName;
                    }                   
                    group.push(property1);                   
                    propNames.push(property1["caption"].toLowerCase());                   
                    propDataFields.push(property1["dataField"]);
                    
                    //  // property group status
                    //  var propertyStatus = {};
                    //  propertyStatus["caption"] = "Status";
                    //  propertyStatus["dataField"] = "Status_" + propertyIndex;
                    //  group.push(propertyStatus);
                    //  rowData[propertyStatus["dataField"]] = property.severity;
                    //  propDataFields.push(propertyStatus["dataField"]);

                     // add group to collection
                     var a = propertyNameGroups[classGroup]["captions"];
                     var b = JSON.stringify(propNames);
                     var c = a.indexOf(b)
                     if (c === -1) {
                         propertyNameGroups[classGroup]["captions"].push(b);
                         propertyNameGroups[classGroup]["dataFields"].push(propDataFields);
                         // groups.push(group);
                         for (let k = 0; k < group.length; k++) {
                             allHeaders[classGroup].push(group[k]);
                         }
                         propertyIndex++;
                     }
                     else {
                         // correct the datafields with already existing ones
                         let propDatafields = propertyNameGroups[classGroup]["dataFields"][c];
                         for (let ii = 0; ii < propDatafields.length; ii++) {
                             let oldDataField = "property_" + propertyIndex;
                             if (oldDataField in rowData) {
                                 let value = rowData[oldDataField];
                                 delete rowData[oldDataField];
                                 rowData[propDatafields[ii]] = value;
                             }
                         }
                     }
                }

                // push rowdata to all data array
                allData[classGroup].push(rowData); 
            }          
            else {
                let classMappingArray = this.GetClassMappingInfo(component.classMappingInfo, 0);
                if (classMappingArray === null ||
                    classMappingArray.length < 2) {
                    continue;;
                }
                let checkCaseMappingInfo = this.GetCheckcaseMappingInfo(component, sources, datasetOrdersInCheckcase);

                // get class group string
                let classGroup = "";
                for (let j = 0; j < classMappingArray.length; j++) {
                    if (j === 0) {
                        classGroup = classMappingArray[j];
                    }
                    else {
                        classGroup += "-" + classMappingArray[j];
                    }
                }

                let rowData = {};
                // check if class group is already in allHeaders. if not,
                // then add
                if (!(classGroup in allHeaders)) {
                    allHeaders[classGroup] = [];
                    allData[classGroup] = [];
                    propertyNameGroups[classGroup] = {
                        captions: [],
                        dataFields: []
                    };

                    // get source names
                    for (let sourceId = 0; sourceId < sources.length; sourceId++) {
                        let obj = {};
                        obj["caption"] = sources[sourceId];
                        if (sourceId === 0) {
                            obj["dataField"] = "SourceA";
                        }
                        if (sourceId === 1) {
                            obj["dataField"] = "SourceB";
                        }
                        if (sourceId === 2) {
                            obj["dataField"] = "SourceC";
                        }
                        if (sourceId === 3) {
                            obj["dataField"] = "SourceD";
                        }
                        allHeaders[classGroup].push(obj);
                    }

                    // component status
                    allHeaders[classGroup].push({
                        "caption": "Status",
                        "dataField": "ComponentStatus",
                        // "groupIndex": 0
                    });
                    allHeaders[classGroup].push({
                        "caption": "Class Mapping",
                        "dataField": "ClassMapping",
                        "groupIndex": 0
                    });
                }
                rowData["SourceA"] = component.sourceAName;
                rowData["SourceB"] = component.sourceBName;
                if (sources.length > 2) {
                    rowData["SourceC"] = component.sourceCName;
                }
                if (sources.length > 3) {
                    rowData["SourceD"] = component.sourceDName;
                }
                rowData["ComponentStatus"] = component.status;
                rowData["ClassMapping"] = classGroup;

                // now export properties
                if (!exportProperties) {
                    allData[classGroup].push(rowData);
                    continue;
                }

                var properties = component["properties"];

                // let propertyIndex = 1;
                for (let j = 0; j < properties.length; j++) {
                    let property = properties[j];

                    let group = [];
                    let propNames = [];
                    let propDataFields = [];

                    let propertyIndex = allHeaders[classGroup].length;

                    // Source a property
                    let property1 = {};
                    property1["caption"] = property.sourceAName;
                    property1["dataField"] = "propertA_" + propertyIndex;
                    rowData[property1["dataField"]] = property.sourceAValue;
                    if (property.sourceAName == null) {
                        property1["caption"] = "Missing property";
                        rowData[property1["dataField"]] = "NULL";
                    }                   

                    // Source b property
                    var property2 = {};
                    property2["caption"] = property.sourceBName;
                    property2["dataField"] = "propertB_" + propertyIndex;
                    rowData[property2["dataField"]] = property.sourceBValue;
                    if (property.sourceBName == null) {
                        property2["caption"] = "Missing property";
                        rowData[property2["dataField"]] = "NULL";
                    }                   

                    group.push(property1);
                    group.push(property2);
                    propNames.push(property1["caption"].toLowerCase());
                    propNames.push(property2["caption"].toLowerCase());
                    propDataFields.push(property1["dataField"]);
                    propDataFields.push(property2["dataField"]);

                    // Source c property
                    if (sources.length > 2) {
                        var property3 = {};
                        property3["caption"] = property.sourceCName;
                        property3["dataField"] = "propertC_" + propertyIndex;
                        rowData[property3["dataField"]] = property.sourceCValue;
                        if (property.sourceCName == null) {
                            property3["caption"] = "Missing property";
                            rowData[property3["dataField"]] = "NULL";
                        }

                        group.push(property3);
                        propNames.push(property3["caption"].toLowerCase());
                        propDataFields.push(property3["dataField"]);
                    }

                    // Source d property
                    if (sources.length > 3) {
                        var property4 = {};
                        property4["caption"] = property.sourceDName;
                        property4["dataField"] = "propertD_" + propertyIndex;
                        rowData[property4["dataField"]] = property.sourceDValue;
                        if (property.sourceDName == null) {
                            property4["caption"] = "Missing property";
                            rowData[property4["dataField"]] = "NULL";
                        }

                        group.push(property4);
                        propNames.push(property4["caption"].toLowerCase());
                        propDataFields.push(property4["dataField"]);
                    }

                    // property group status
                    var propertyStatus = {};
                    propertyStatus["caption"] = "Status";
                    propertyStatus["dataField"] = "Status_" + propertyIndex;
                    group.push(propertyStatus);
                    rowData[propertyStatus["dataField"]] = property.severity;
                    propDataFields.push(propertyStatus["dataField"]);

                    // remove missing property
                    if (propNames.indexOf("missing property") !== -1 &&
                        checkCaseMappingInfo !== null) {
                        let propertyMapping = this.GetPropertyMapping(
                            propNames,
                            checkCaseMappingInfo.MappingProperties,
                            datasetOrdersInCheckcase);

                        if (propertyMapping) {
                            for (let i = 0; i < propNames.length; i++) {
                                if (propNames[i] === "missing property") {
                                    let srcId = null;
                                    if (i === 0) {
                                        srcId = "a";
                                    }
                                    else if (i === 1) {
                                        srcId = "b";
                                    }
                                    else if (i === 2) {
                                        srcId = "c";
                                    }
                                    else if (i === 3) {
                                        srcId = "d";
                                    }
                                    else {
                                        continue;
                                    }
                                    group[i].caption = propertyMapping[mappingList[datasetOrdersInCheckcase[srcId] - 1]];
                                    propNames[i] = group[i].caption.toLowerCase();
                                    // propNames[i] = propertyMapping[mappingList[datasetOrdersInCheckcase[srcId] - 1]];
                                    // group[i].caption = propNames[i];
                                }
                            }
                        }
                    }

                    var a = propertyNameGroups[classGroup]["captions"];
                    var b = JSON.stringify(propNames);
                    var c = a.indexOf(b)
                    if (c === -1) {
                        propertyNameGroups[classGroup]["captions"].push(b);
                        propertyNameGroups[classGroup]["dataFields"].push(propDataFields);
                        // groups.push(group);
                        for (let k = 0; k < group.length; k++) {
                            allHeaders[classGroup].push(group[k]);
                        }
                        propertyIndex++;
                    }
                    else {
                        // correct the datafields with already existing ones
                        let propDatafields = propertyNameGroups[classGroup]["dataFields"][c];
                        for (let ii = 0; ii < propDatafields.length; ii++) {
                            let oldDataField = null;
                            if (ii === 0) {
                                oldDataField = "propertA_" + propertyIndex;
                            }
                            else if (ii === 1) {
                                oldDataField = "propertB_" + propertyIndex;
                            }
                            else if (sources.length > 2 && ii === 2) {
                                oldDataField = "propertC_" + propertyIndex;
                            }
                            else if (sources.length > 3 && ii === 3) {
                                oldDataField = "propertD_" + propertyIndex;
                            }
                            else if (ii === propDatafields.length - 1) {
                                oldDataField = "Status_" + propertyIndex;
                            }

                            if (oldDataField in rowData) {
                                let value = rowData[oldDataField];
                                delete rowData[oldDataField];
                                rowData[propDatafields[ii]] = value;
                            }
                        }
                    }
                }

                // push rowdata to all data array
                allData[classGroup].push(rowData);
            }
        }

        tablesHeaders[tableName] = allHeaders;
        tablesData[tableName] = allData;
    }

    return {
        "headers": tablesHeaders,
        "rowsData": tablesData,
    };
}

ComparisonData.prototype.GetCategoryComponents = function (tableName, data) {
    // var comparisonGroups = checkResults["Comparisons"][0]["results"];
    for (var groupId in data) {
        if (tableName == data[groupId].componentClass) {
            return data[groupId].components;
        }
    }
}

ComparisonData.prototype.ExportComparisonComponents = function (
    selectedTables,
    exportProperties,
    save,
    worksheetName,
    workbookName,
    exportExcelInstance) {
    return new Promise((resolve) => {

        this.CreatDummyDataGrids(
            selectedTables,
            exportProperties,
            worksheetName,
            exportExcelInstance).then(function (data) {
                if (!data) {
                    return resolve(false);;
                }

                // // tables
                // let tables = [];
                // for (let categoryGroup in data.headers) {
                //     for (let classGroup in data.headers[categoryGroup]) {
                //         tables.push(classGroup);
                //     }
                // }

                exportExcelInstance.ExportComparisonGroups(
                    data,
                    save,
                    worksheetName,
                    workbookName,
                    exportExcelInstance.reviewWorkbook).then(function () {
                        return resolve(true);
                    });

            });
    })
}

ComparisonData.prototype.CreatDummyDataGrids = async function (
    selectedTables, 
    exportProperties,
    worksheetName, 
    exportExcelInstance) {
    var _this = this;
    return new Promise((resolve) => {
        // let checkData = this.GetData();
        this.GetData().then(function (checkData) {
            if (!checkData) {
                return resolve(false);
            }

            // let headers = _this.CreateTableHeader(selectedTables, exportProperties, checkData);
            // let data = _this.CreateTableData(selectedTables, exportProperties, checkData);
            let tablesData = _this.GetTablesData(selectedTables, exportProperties, checkData);
            let headers = tablesData["headers"];
            let data = tablesData["rowsData"];
            let parentTable = document.getElementById("dummyReviewsGridDiv");

            var allPromises = [];
            for (var categoryGroup in headers) {
                for (var classGroup in headers[categoryGroup]) {
                   
                    var header = headers[categoryGroup][classGroup];
                    var tableData = data[categoryGroup][classGroup];
                    
                    var datagridDiv = document.createElement("DIV");
                    datagridDiv.id = categoryGroup.replace(/\s/g, '') + "-" + classGroup.replace(/\s/g, '') + "_tempTable";
                    datagridDiv.style.display = "none";
                    parentTable.append(datagridDiv);

                    allPromises.push(exportExcelInstance.CreateTemporaryComponentGrid(tableData, datagridDiv.id, header));
                }
            }

            if (allPromises.length > 0) {
                xCheckStudio.Util.waitUntilAllPromises(allPromises).then(function (res) {
                    return resolve(tablesData);
                });
            }
            else {
                return resolve(null);
            }
        });
    });
}

function ComplianceData(worksheetName) {
    this.ComparisonExportComplete = false;
    this.WorkSheetName = worksheetName
}

ComplianceData.prototype.CreateTableData = function (selectedTables, exportProperties, checkData) {

    var tablesData = [];
    for (var id = 0; id < selectedTables.length; id++) {
        var tableName = selectedTables[id];

        // var sources = checkResults["Comparisons"][0]["sources"];

        var dataObj = this.GetGroupComponents(tableName, checkData);
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

ComplianceData.prototype.GetData = function (worksheetName) {
    return new Promise((resolve) => {
        var source = null;
        if (worksheetName.toLowerCase() == "compliancea") {
            source = "a";
        }
        else if (worksheetName.toLowerCase() == "complianceb") {
            source = "b";
        }
        else if (worksheetName.toLowerCase() == "compliancec") {
            source = "c";
        }
        else if (worksheetName.toLowerCase() == "complianced") {
            source = "d";
        }
        else {
            return resolve(null);
        }

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        $.ajax({
            data: {
                'InvokeFunction': "ReadComplianceSavedCheckData",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname,
                "Source": source
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

ComplianceData.prototype.CreateTableHeader = function (selectedTables, exportProperties, checkData) {
    var tablesHeaders = [];
    for (var id = 0; id < selectedTables.length; id++) {
        var tableName = selectedTables[id];
        var dataObj = this.GetGroupComponents(tableName, checkData);
        var headers = [];

        var source = dataObj["source"];

        var obj = {
            "caption": source,
            "dataField": ComplianceColumnNames.SourceName
        }

        headers.push(obj);

        var obj = {
            "caption": "Status",
            "dataField": "ComponentStatus",
            "groupIndex" : 0           
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

ComplianceData.prototype.GetGroupComponents = function (tableName, checkData) {
    var data = {};
    var Compliances = checkResults["Compliances"];

    if (this.WorkSheetName == "ComplianceA") {
        data["source"] = Compliances[0].source;
    }
    else if (this.WorkSheetName == "ComplianceB") {
        data["source"] = Compliances[1].source;
    }
    else if (this.WorkSheetName == "ComplianceC") {
        data["source"] = Compliances[2].source;
    }
    if (this.WorkSheetName == "ComplianceD") {
        data["source"] = Compliances[3].source;
    }

    for (var groupId in checkData) {
        if (tableName == checkData[groupId].componentClass) {
            data["Components"] = checkData[groupId].components;
            return data;
        }
    }

    return null;
}

ComplianceData.prototype.ExportComplianceComponents = function (
    selectedTables, 
    exportProperties, 
    save,
    worksheetName, 
    workbookName, 
    exportExcelInstance) {

    return new Promise((resolve) => {
        
        this.CreatDummyDataGrids(
            selectedTables, 
            exportProperties, 
            worksheetName, 
            exportExcelInstance).then(function () {

            exportExcelInstance.ExportGroups(
                selectedTables, 
                save,
                worksheetName, 
                workbookName, 
                exportExcelInstance.reviewWorkbook).then(function () {
                return resolve(true);
            });
        });

    });

}

ComplianceData.prototype.CreatDummyDataGrids = async function (selectedTables, exportProperties, worksheetName, exportExcelInstance) {
    var _this = this;
    var headers;
    var data;
    var parentTable;

    return new Promise((resolve) => {
        // let checkData = this.GetData();
        _this.GetData(worksheetName).then(function (checkData) {
            if (!checkData) {
                return resolve(false);
            }

            _this.WorkSheetName = worksheetName;
            headers = _this.CreateTableHeader(selectedTables, exportProperties, checkData);
            data = _this.CreateTableData(selectedTables, exportProperties, checkData);
            // if (worksheetName == "ComplianceA") {
            parentTable = document.getElementById("dummyReviewsGridDiv");
            // }
            // else if (worksheetName == "ComplianceB") {
            //     parentTable = document.getElementById("complianceSource2tables");
            // }
            // else if (worksheetName == "ComplianceC") {
            //     parentTable = document.getElementById("complianceSource3tables");
            // }
            // else if (worksheetName == "ComplianceD") {
            //     parentTable = document.getElementById("complianceSource4tables");
            // }

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

DatasetData.prototype.ExportDatasetsDataComponents = function (
    selectedTables, 
    datasetGroups, 
    workbook, 
    save,   
    workbookName,
    exportExcelInstance) {

    return new Promise((resolve) => {

        this.CreateDatasetExportDummyDataGrids(
            selectedTables,
            datasetGroups,
            exportExcelInstance).then(function () {

                exportExcelInstance.ExportGroups(
                    selectedTables, 
                    save,
                    "",
                    workbookName,
                    workbook).then(function () {
                        return resolve(true);
                    });

            });
    });

}

DatasetData.prototype.CreateDatasetExportDummyDataGrids = async function (selectedTables, datasetsGroups, exportExcelInstance) {
    for (var id in selectedTables) {
        var tableName = selectedTables[id];

        var components = datasetsGroups[tableName];


        headers = this.CreateTableHeader(tableName, components);
        data = this.CreateTableData(tableName, components, headers);
        parentTable = document.getElementById("dummyDatasetsGridDiv");

        var header = headers[tableName];
        var tableData = data[tableName];

        var datagridDiv = document.createElement("DIV");
        datagridDiv.id = tableName + "_tempTable";
        datagridDiv.style.display = "none";
        parentTable.append(datagridDiv);

        await exportExcelInstance.CreateTemporaryComponentGrid(tableData, datagridDiv.id, header);
    }
}
