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

            _this.CreateTemporaryComponentGrid(data, datagridDiv.id, header).then(function (result) {
                datagridCreated++;
                if (datagridCreated == selectedTables.length) {
                    return resolve(true);
                }
            });
        }
    });
}

ExportExcel.prototype.CreateDummyDataGrids = async function (selectedTables) {
    // var _this = this;
    // var header = [{ "caption": checkResults.sourceInfo.sourceAFileName, "dataField": "SourceAName" },
    // { "caption": checkResults.sourceInfo.sourceBFileName, "dataField": "SourceBName" },
    // { "caption": "Status", "dataField": "Status" },
    // { "caption": "Information", "dataField": "Information" }];

    // for (var id = 0; id < selectedTables.length; id++) {
    //     var tableName = selectedTables[id];

    //     var components = this.GetCategoryComponents(tableName);

    //     for (var componentId in components) {
    //         var component = components[componentId];

    //         var data = [{ "SourceAName": component.sourceAName, "SourceBName": component.sourceBName, "Status": component.status, "Information": "" }];

    //         var parentTable = document.getElementById("comparisonTables");
    //         var datagridDiv = document.createElement("DIV");
    //         datagridDiv.id = component.id + "_tempTable";
    //         parentTable.append(datagridDiv);

    //         await _this.CreateTemporaryComponentGrid(data, datagridDiv.id, header, component.id);

    //         var propertyDiv = document.createElement("DIV");
    //         propertyDiv.id = component.id + "_tempTable" + "_tempPropertiestable";
    //         parentTable.append(propertyDiv);

    //         var sources = checkResults["Comparisons"][0]["sources"];
    //         var headers = _this.CreateComparisonPropertiesTableHeader(sources);

    //         var properties = component["properties"];
    //         var data = _this.CreateComparisonTableData(properties);

    //         await _this.CreateTemporaryPropertiesGrid(data, propertyDiv.id, headers);
    //     }
    // }

    var _this = this;
    var comparison = new ComparisonData();
    var headers = comparison.CreateTableHeader(selectedTables);
    var data = comparison.CreateTableData(selectedTables);

    for(var tableName in headers) {
        var header = headers[tableName];
        var tableData = data[tableName];

        var parentTable = document.getElementById("comparisonTables");
        var datagridDiv = document.createElement("DIV");
        datagridDiv.id = tableName + "_tempTable";
        parentTable.append(datagridDiv);

        await _this.CreateTemporaryComponentGrid(tableData, datagridDiv.id, header);

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
    // var components = this.GetCategoryComponents(tableName);
    var save = false;

    worksheet.mergeCells(this.rowCount, 1, this.rowCount, 2);
    worksheet.mergeCells(this.rowCount, 3, this.rowCount, 4);
    Object.assign(worksheet.getRow(this.rowCount).getCell(1), { value: tableName, font: { bold: true, size: 16, underline: 'double' } });

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

ExportExcel.prototype.CreateTemporaryComponentGrid = function (component, containerDiv, header) {
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

function ComparisonData() {
    this.ComparisonExportComplete = false;
}

ComparisonData.prototype.CreateTableData = function(selectedTables) {

    var tablesData = [];
    for (var id = 0; id < selectedTables.length; id++) {
        var tableName = selectedTables[id];

        var sources = checkResults["Comparisons"][0]["sources"];

        var checkComponents = this.GetCategoryComponents(tableName);
        var tableData = [];
        var propertyIndex = 1;
        var sourcePropertyNamesGroup = []
        for (var componentId in checkComponents) {
            component = checkComponents[componentId];

            tableRowContent = {};

            if(sources.length > 1) {
                tableRowContent[ComparisonColumnNames.SourceAName] = component.sourceAName;
                tableRowContent[ComparisonColumnNames.SourceBName] = component.sourceBName;
            }
            
            if(sources.length > 2) {
                tableRowContent[ComparisonColumnNames.SourceCName] = component.sourceCName;
                
            }

            if(sources.length > 3) {
                tableRowContent[ComparisonColumnNames.SourceDName] = component.sourceDName;
            }

            tableRowContent["ComponentStatus"] = component.status;

            var properties = component.properties;
            for (var propertyId in properties) {
                var property = properties[propertyId];
                var propertyObj = {};
                var propName = [];

                if(sources.length > 1) {
                    var property1 = {};
                    property1["caption"] = property.sourceAName;

                    if(property.sourceAName == null) {
                        property1["caption"] = "";
                    }

                    propName.push(property1["caption"]);

                    propertyObj["propertA_"] = property.sourceAValue;

                    if(property.sourceAValue == null) {
                        propertyObj["propertA_"] = "";
                    }
                     
                    

                    var property2 = {};
                    property2["caption"] = property.sourceBName;

                    if(property.sourceBName == null) {
                        property2["caption"] = "";
                    }

                    propertyObj["propertB_"] = property.sourceBValue;

                    if(property.sourceBValue == null) {
                        propertyObj["propertB_"] = "";
                    }

                    propName.push(property2["caption"]);

                }
                
                // if(sources.length > 2) {

                //     var property3 = {};
                //     property3["caption"] = property.sourceCName;

                //     if(property.sourceCName == null) {
                //         property3["caption"] = "";
                //     }

                //     propName.push(property3["caption"]);

                //     property3["dataField"] = "propert_C" + propertyIndex;

                //     group.push(property3);

                // }

                // if(sources.length > 3) {
                //     var property4 = {};
                //     property4["caption"] = property.sourceDName;

                //     if(property.sourceDName == null) {
                //         property4["caption"] = "";
                //     }

                //     propName.push(property4["caption"]);

                //     property4["dataField"] = "propert_D" + propertyIndex;

                //     group.push(property4);
                // }

                var a = JSON.stringify(sourcePropertyNamesGroup);
                var b = JSON.stringify(propName);
                var c = a.indexOf(b)
                if(c == -1) {
                    sourcePropertyNamesGroup.push(propName);
                    for(var a in propertyObj) {
                        var key =  a + propertyIndex;
                        tableRowContent[key] = propertyObj[a];
                    }
                    var statusKey = "Status_" + propertyIndex
                    tableRowContent[statusKey] = property.severity;
                    
                    propertyIndex++;
                }
                else {
                    for(var index in sourcePropertyNamesGroup) {
                        var arr = sourcePropertyNamesGroup[index];
                        if(JSON.stringify(arr)==JSON.stringify(propName)) {
                            var propIndex = Number(index)+1;
                            for(var a in propertyObj) {
                                var key =  a + propIndex;
                                tableRowContent[key] = propertyObj[a];
                            }
                            var statusKey = "Status_" + propIndex
                            tableRowContent[statusKey] = property.severity;
                            break;
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

ComparisonData.prototype.CreateTableHeader = function(selectedTables) {
    var tablesHeaders = [];
    for (var id = 0; id < selectedTables.length; id++) {
        var tableName = selectedTables[id];
        var components = this.GetCategoryComponents(tableName);
        var headers = [];

        var sources = checkResults["Comparisons"][0]["sources"];
        for(var sourceId = 0; sourceId < sources.length; sourceId++) {
            var Obj = {};

            Obj["caption"] = sources[sourceId];
            if(sourceId == 0) {
                Obj["dataField"] = ComparisonColumnNames.SourceAName;
            }
            if(sourceId == 1) {
                Obj["dataField"] = ComparisonColumnNames.SourceBName;
            }
            if(sourceId == 2) {
                Obj["dataField"] = ComparisonColumnNames.SourceCName;
            }
            if(sourceId == 3) {
                Obj["dataField"] = ComparisonColumnNames.SourceDName;
            }

            headers.push(Obj);
        }

        var obj = {
            "caption" : "Status",
            "dataField" : "ComponentStatus"
        };

        headers.push(obj);

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

                if(sources.length > 1) {
                    var property1 = {};
                    property1["caption"] = property.sourceAName;

                    if(property.sourceAName == null) {
                        property1["caption"] = "";
                    }

                    propName.push(property1["caption"]);

                    property1["dataField"] = "propertA_" + propertyIndex;

                    group.push(property1);

                    var property2 = {};
                    property2["caption"] = property.sourceBName;

                    if(property.sourceBName == null) {
                        property2["caption"] = "";
                    }

                    propName.push(property2["caption"]);

                    property2["dataField"] = "propertB_" + propertyIndex;

                    group.push(property2);

                }
                
                if(sources.length > 2) {

                    var property3 = {};
                    property3["caption"] = property.sourceCName;

                    if(property.sourceCName == null) {
                        property3["caption"] = "";
                    }

                    propName.push(property3["caption"]);

                    property3["dataField"] = "propertC_" + propertyIndex;

                    group.push(property3);

                }

                if(sources.length > 3) {
                    var property4 = {};
                    property4["caption"] = property.sourceDName;

                    if(property.sourceDName == null) {
                        property4["caption"] = "";
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
                if(c == -1) {
                    sourcePropertyNamesGroup.push(propName);
                    groups.push(group);
                    propertyIndex++;
                }
            }
        }

        // headers.push(groups);
        for(var a in groups) {
            for(var b in groups[a]) {
                headers.push(groups[a][b]);
            }
        }

        tablesHeaders[tableName] = headers;

    }

    return tablesHeaders;
}

ComparisonData.prototype.GetCategoryComponents = function(tableName) {
    var comparisonGroups = checkResults["Comparisons"][0]["results"];
    for(var groupId in comparisonGroups) {
        if(tableName == comparisonGroups[groupId].componentClass) {
            return comparisonGroups[groupId].components;
        }
    }
}