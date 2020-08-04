function onExportExcelClick() {
    SelectExportDataTypeForm.open();
}

// select type of data to export in excel
let SelectExportDataTypeForm = {
    formId: "exportExcelSelectDataTypeForm",
    captionBarId: "exportExcelSelectDataTypeFormCaptionBar",
    cancelBtnId: "exportExcelSelectDataTypeFormCancel",
    outputDatasetsBtnId: "outputDatasetsBtn",

    open: function () {
        // close output to overlay
        closeOutpuToOverlay();

        // show output to excel form
        this.show();

        // init controls
        this.init();
    },

    close: function () {
        this.hide();
    },

    show: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById(this.formId);

        // Make the DIV element draggable:
        xCheckStudio.Util.dragElement(popup,
            document.getElementById(this.captionBarId));

        overlay.style.display = 'block';
        popup.style.display = 'block';
    },

    hide: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById(this.formId);

        overlay.style.display = 'none';
        popup.style.display = 'none';
    },

    init: function () {
        this.registerOnclick(this.cancelBtnId, function () {
            SelectExportDataTypeForm.close();
        });


        this.registerOnclick(this.outputDatasetsBtnId, function () {
            SelectExportDataTypeForm.onOutputDatasetsClicked();
        });
    },

    onOutputDatasetsClicked: function () {
        this.close();
        SelectDatasetsDataForm.open();
    },

    registerOnclick: function (eleId, callback) {
        document.getElementById(eleId).onclick = function () {
            callback();
        };
    },
};

// Select datasets to export form
let SelectDatasetsDataForm = {
    formId: "exportDatasetsToExcelForm",
    captionBarId: "exportDatasetsToExcelCaptionBar",
    cancelBtnId: "exportDatasetsToExcelCancel",
    exportBtnId: "exportDatasetsToExcelExport",
    addBtnId: "exportDatasetsToExcelDatasetAdd",
    clearBtnId: "exportDatasetsToExcelDatasetClear",
    selectedDatasetsDivId: "exportDatasetsToExcelControlsColumn",
    allDataSets: null,
    datasets: [],
    checkedDatasets: {},

    open: function () {
        // show form
        this.show();

        this.getDatasets().then(function (datasets) {
            if (!datasets ||
                datasets.length === 0) {
                alert("No saved data found for export.");
                SelectDatasetsDataForm.close();
                return;
            }

            SelectDatasetsDataForm.allDataSets = datasets;

            // init controls
            SelectDatasetsDataForm.init();
        });
    },

    show: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById(this.formId);

        // Make the DIV element draggable:
        xCheckStudio.Util.dragElement(popup,
            document.getElementById(this.captionBarId));

        overlay.style.display = 'block';
        popup.style.display = 'block';
    },

    close: function (clearData = false) {
        this.hide();

        // clear added datasets 
        document.getElementById(this.selectedDatasetsDivId).innerHTML = "";

        if (clearData) {
            this.clearData();
        }
    },

    hide: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById(this.formId);

        overlay.style.display = 'none';
        popup.style.display = 'none';
    },

    clearData: function () {
        this.allDataSets = null;
        this.datasets = [];
        this.checkedDatasets = {};
    },

    init: function () {

        this.registerOnclick(this.cancelBtnId, function () {
            SelectDatasetsDataForm.close(true);
        });

        this.registerOnclick(this.exportBtnId, function () {
            SelectDatasetsDataForm.onExport();
        });

        this.registerOnclick(this.addBtnId, function () {
            SelectDatasetsDataForm.onAddDatset();
        });

        this.registerOnclick(this.clearBtnId, function () {
            SelectDatasetsDataForm.onClearDatasets();
        });
    },

    onAddDatset: function () {
        //get already selected dataset ids
        let selectedDatsetIds = [];
        for (let i = 0; i < this.datasets.length; i++) {
            selectedDatsetIds.push(this.datasets[i].selectedDatasetId);
        }
        SelectDatasetForm.open(selectedDatsetIds);
    },

    onClearDatasets: function () {
        this.removeDataSets();
    },

    onDataSetAdded: function (data) {
        if (data &&
            data["selectedCategories"] &&
            data["selectedDataset"] ||
            data["datasetData"] ||
            data["groupByProperty"]) {
            this.datasets.push(data);

            this.addDatasetToUI(data);
        }
    },

    addDatasetToUI: function (data) {

        let item = document.createElement("div");
        item.id = data.selectedDataset + "_" + data.selectedDatasetId;
        item.style.width = "calc(100% - 2px)";
        item.style.height = "30px";
        item.style.position = "relative";
        item.style.border = "0.25px solid lightgray";
        // item.classList.add("selectedComplianceDataset");

        let itemCB = document.createElement("div");
        itemCB.id = data.selectedDataset + "_cb";
        itemCB.style.width = "30px";
        itemCB.style.height = "100%";


        var cb = document.createElement("INPUT");
        cb.setAttribute("type", "checkbox");
        cb.style.width = "25px";
        cb.style.height = "25px";
        cb.addEventListener('change', function () {
            if (event.target.checked) {
                SelectDatasetsDataForm.checkedDatasets[data.selectedDatasetId] = data.selectedDataset;
            }
            else {
                if (data.selectedDatasetId in SelectDatasetsDataForm.checkedDatasets) {
                    delete SelectDatasetsDataForm.checkedDatasets[data.selectedDatasetId]
                }
            }
        });
        itemCB.appendChild(cb);

        item.appendChild(itemCB);

        let itemName = document.createElement("div");
        itemName.id = data.selectedDataset + "_name";
        itemName.style.width = "calc(100% - 30px)";
        itemName.style.height = "100%";
        itemName.style.position = "absolute";
        itemName.style.top = "0px";
        itemName.style.left = "30px";
        itemName.style.lineHeight = "30px";
        itemName.style.fontSize = "12px";
        itemName.style.overflow = "hidden";
        itemName.innerText = data.selectedDataset;
        item.appendChild(itemName);

        document.getElementById(this.selectedDatasetsDivId).appendChild(item);
    },

    removeDataSets: function () {

        for (var id in this.checkedDatasets) {
            let dataset = this.checkedDatasets[id];

            var item = document.getElementById(dataset + "_" + id);
            item.remove();

            let index = -1;
            for (let i = 0; i < this.datasets.length; i++) {
                if (this.datasets[i].selectedDataset === dataset) {
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                this.datasets.splice(index, 1);
            }
        }
        this.checkedDatasets = {};
    },

    onExport: function () {            
        this.close();

        exportDatasetsToExcel();
    },

    registerOnclick: function (eleId, callback) {
        document.getElementById(eleId).onclick = function () {
            callback();
        };
    },

    getDatasets: function () {
        return new Promise((resolve) => {

            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            $.ajax({
                data: {
                    'InvokeFunction': "ReadAllSavedDatasets",
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname
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
}

// Select dataset form
let SelectDatasetForm = {
    formId: "exportExcelselectDatasetForm",
    cancelBtnId: "exportExcelselectDatasetCancel",
    applyBtnId: "exportExcelselectDatasetApply",
    categoriesTagboxId: "exportExcelselectDatasetCategory",
    datasetSelectId: "exportExcelselectDataset",
    groupBySelectId: "exportExcelselectGroupBy",
    datasetSelect: null,
    groupBySelect: null,
    categoriesTagbox: null,
    allProperties: null,

    open: function (selectedDatsetIds) {
        // show form
        this.show();

        // init controls
        this.init(selectedDatsetIds);
    },

    close: function () {
        this.hide();

        // dispose data set select control
        this.disposeDatasetSelect();

        // dispose data set select control
        this.disposeGroupBySelect();

        // dispose Categories tagbox
        this.disposeCategoryTagbox();
    },

    disposeDatasetSelect: function () {
        var ele = document.getElementById(this.datasetSelectId);
        var parent = ele.parentElement;

        $("#" + this.datasetSelectId).dxSelectBox("dispose");
        $("#" + this.datasetSelectId).remove();

        var newDiv = document.createElement("div")
        newDiv.id = this.datasetSelectId;
        newDiv.setAttribute("class", "exportExcelselectDataset");
        parent.appendChild(newDiv);
    },

    disposeGroupBySelect: function () {
        var ele = document.getElementById(this.groupBySelectId);
        var parent = ele.parentElement;

        $("#" + this.groupBySelectId).dxSelectBox("dispose");
        $("#" + this.groupBySelectId).remove();

        var newDiv = document.createElement("div")
        newDiv.id = this.groupBySelectId;
        newDiv.setAttribute("class", "exportExcelselectGroupBy");
        parent.appendChild(newDiv);
    },

    disposeCategoryTagbox: function () {
        var ele = document.getElementById(this.categoriesTagboxId);
        var parent = ele.parentElement;

        $("#" + this.categoriesTagboxId).dxTagBox("dispose");
        $("#" + this.categoriesTagboxId).remove();

        var newDiv = document.createElement("div")
        newDiv.id = this.categoriesTagboxId;
        newDiv.setAttribute("class", "exportExcelselectDatasetCategory");
        parent.appendChild(newDiv);
    },

    show: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById(this.formId);

        overlay.style.display = 'block';
        popup.style.display = 'block';
    },

    hide: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById(this.formId);

        overlay.style.display = 'none';
        popup.style.display = 'none';
    },

    init: function (selectedDatsetIds) {

        // Categories tagbox and dataset name
        let allDatasetsInfo = SelectDatasetsDataForm.allDataSets;

        let datasets = [];
        if ("a" in allDatasetsInfo &&
            selectedDatsetIds.indexOf("a") === -1) {
            datasets.push({
                "name": allDatasetsInfo.sourceInfo.sourceAFileName,
                "id": "a"
            });
        }
        if ("b" in allDatasetsInfo &&
            selectedDatsetIds.indexOf("b") === -1) {
            datasets.push({
                "name": allDatasetsInfo.sourceInfo.sourceBFileName,
                "id": "b"
            });
        }
        if ("c" in allDatasetsInfo &&
            selectedDatsetIds.indexOf("c") === -1) {
            datasets.push({
                "name": allDatasetsInfo.sourceInfo.sourceCFileName,
                "id": "c"
            });
        }
        if ("d" in allDatasetsInfo &&
            selectedDatsetIds.indexOf("d") === -1) {
            datasets.push({
                "name": allDatasetsInfo.sourceInfo.sourceDFileName,
                "id": "d"
            });
        }

        // dataset select     
        this.allProperties = null;
        this.datasetSelect = $("#" + this.datasetSelectId).dxSelectBox({
            dataSource: datasets,
            displayExpr: "name",
            valueExpr: "id",
            placeholder: "Select Dataset...",
            searchEnabled: true,
            onValueChanged: function (data) {
                SelectDatasetForm.allProperties = SelectDatasetForm.getAllDatasetProperties(SelectDatasetsDataForm.allDataSets[data.value]);

                SelectDatasetForm.groupBySelect.option("value", null);
                if (SelectDatasetForm.allProperties !== null) {
                    SelectDatasetForm.groupBySelect.option("dataSource", Object.keys(SelectDatasetForm.allProperties));
                }

                // let components = null;
                // if (data.value === 0) {
                //     components = checkResults["sourceAComponents"];
                // }
                // else if (data.value === 1) {
                //     components = checkResults["sourceBComponents"];
                // }
                // else if (data.value === 2) {
                //     components = checkResults["sourceCComponents"];
                // }
                // else if (data.value === 3) {
                //     components = checkResults["sourceDComponents"];
                // }
                // if (components !== null) {
                //     var categoryComponentList = GetCategoryWiseComponentList(components);
                //     let categories = Object.keys(categoryComponentList);
                //     SelectDatasetForm.categoriesTagbox.option("value", null);
                //     SelectDatasetForm.categoriesTagbox.option("items", categories);
                // }
            }
        }).dxSelectBox("instance");

        // group by select        
        this.groupBySelect = $("#" + this.groupBySelectId).dxSelectBox({
            dataSource: [],
            placeholder: "Select Group By Property...",
            searchEnabled: true,
            // disabled: true,
            onValueChanged: function (data) {
                SelectDatasetForm.categoriesTagbox.option("value", null);
                if (SelectDatasetForm.allProperties !== null &&
                    data.value in SelectDatasetForm.allProperties) {
                    SelectDatasetForm.categoriesTagbox.option("items", ["Undefined", "UnAssigned"].concat(SelectDatasetForm.allProperties[data.value]));
                }
            }
        }).dxSelectBox("instance");

        let categories = [];
        this.categoriesTagbox = $("#" + this.categoriesTagboxId).dxTagBox({
            items: categories,
            searchEnabled: true,
            hideSelectedItems: true,
            placeholder: "Select Categories...",
            buttons: [{
                name: "selectDatasetCategories",
                location: "after",
                options: {
                    icon: "public/symbols/Add-Filled.svg",
                    // stylingMode: "outlined",
                    type: "normal",
                    onClick: function (e) {
                        let totalItems = SelectDatasetForm.categoriesTagbox.option("items");
                        let value = SelectDatasetForm.categoriesTagbox.option("value");
                        if (!value ||
                            value.length !== totalItems.length) {
                            SelectDatasetForm.categoriesTagbox.option("value", totalItems);
                        }
                        else {
                            SelectDatasetForm.categoriesTagbox.option("value", []);
                        }
                    }
                }
            }]
        }).dxTagBox("instance");

        this.registerOnclick(this.cancelBtnId, function () {
            SelectDatasetForm.close();
        });

        this.registerOnclick(this.applyBtnId, function () {
            SelectDatasetForm.onApply();
        });
    },

    getAllDatasetProperties : function (allComponents) {

        var allProperties = {};
        for (var nodeId in allComponents) {
            var component = allComponents[nodeId];
            if (component.properties.length > 0) {
                for (var i = 0; i < component.properties.length; i++) {
                    var property = component.properties[i];

                    if (!(property.Name in allProperties)) {
                        allProperties[property.Name] = [];
                    }

                    if (property.Value &&
                        property.Value !== "" &&
                        allProperties[property.Name].indexOf(property.Value) === -1) {
                        allProperties[property.Name].push(property.Value);
                    }
                }
            }
        }

        return allProperties;
    },

    onApply: function () {
        let data = this.getData();
        SelectDatasetsDataForm.onDataSetAdded(data);
        this.close();
    },

    getData: function () {
        let groupByProperty = null;
        if (this.groupBySelect) {
            groupByProperty = this.groupBySelect.option("value");
        }

        let selectedCategories = null;
        if (this.categoriesTagbox) {
            selectedCategories = this.categoriesTagbox.option("value");
        }

        let selectedDatasetId = null;
        let selectedDataset = null;
        let datasetData = null;

        if (this.datasetSelect) {
            selectedDatasetId = this.datasetSelect.option("value");
        }
        if (selectedDatasetId !== null) {

            if (selectedDatasetId === 'a') {
                selectedDataset = SelectDatasetsDataForm.allDataSets.sourceInfo["sourceAFileName"];

                datasetData = SelectDatasetsDataForm.allDataSets["a"];
            }
            else if (selectedDatasetId === "b") {
                selectedDataset = SelectDatasetsDataForm.allDataSets.sourceInfo["sourceBFileName"];

                datasetData = SelectDatasetsDataForm.allDataSets["b"];
            }
            else if (selectedDatasetId === "c") {
                selectedDataset = SelectDatasetsDataForm.allDataSets.sourceInfo["sourceCFileName"];

                datasetData = SelectDatasetsDataForm.allDataSets["c"];
            }
            else if (selectedDatasetId === "d") {
                selectedDataset = SelectDatasetsDataForm.allDataSets.sourceInfo["sourceDFileName"];

                datasetData = SelectDatasetsDataForm.allDataSets["d"];
            }
        }

        return {
            "groupByProperty": groupByProperty,
            "selectedCategories": selectedCategories,
            "selectedDataset": selectedDataset,
            "selectedDatasetId": selectedDatasetId,
            "datasetData": datasetData
        };
    },

    registerOnclick: function (eleId, callback) {
        document.getElementById(eleId).onclick = function () {
            callback();
        };
    },
}

// Export datasets to excel
function exportDatasetsToExcel() {
    if (SelectDatasetsDataForm.datasets.length === 0) {
        return;
    }

    // deep clone datasets
    let allDatasets = JSON.parse(JSON.stringify(SelectDatasetsDataForm.datasets));
    SelectDatasetsDataForm.clearData();

    // init exceljs
    const ExcelJS = require('exceljs');  
  
    // let allPromises = [];
    for (let i = 0; i < allDatasets.length; i++) {
        // create workbook
        const workbook = new ExcelJS.Workbook();

        var userinfo = JSON.parse(localStorage.getItem('userinfo'));
        workbook.creator = userinfo.alias;
        workbook.lastModifiedBy = userinfo.alias;
        workbook.created = new Date(xCheckStudio.Util.getCurrentDateTime());
        workbook.modified = new Date(xCheckStudio.Util.getCurrentDateTime());

        exportDatasetToExcel(allDatasets[i], workbook).then(function (result) {

            // save workbook
            workbook.xlsx.writeBuffer().then(function (data) {
                var blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                saveAs(blob, result.selectedDataset + ".xlsx");
            });
        });
    }   
}

function exportDatasetToExcel(dataset, workbook) {
    return new Promise((resolve) => {
        let groupedData = groupDatasets(dataset["datasetData"], dataset["groupByProperty"]);

        for (let groupName in groupedData) {
            if (dataset.selectedCategories.indexOf(groupName) === -1) {
                continue;
            }

            // create a sheet with red tab colour
            const worksheet = workbook.addWorksheet(
                groupName,
                // {
                //     properties: { tabColor: { argb: 'D3D3D3' } },
                    
                // }
            );
            
            let group = groupedData[groupName];

            let columns = [];
            for (let i = 0; i < group.columns.length; i++) {
                columns.push({
                    "name": group.columns[i],
                    "filterButton": true
                });
            }

            worksheet.addTable({
                name: groupName + '-Table',
                ref: 'A1',
                headerRow: true,
                totalsRow: false,
                // style: {
                //     // theme: 'TableStyleLight3',
                //     // showRowStripes: true,
                //     // showColumnStripes: true,
                // },
                columns: columns,
                rows: group.rows,
            });             
          
        }

        return resolve(dataset);
    });
}

function groupDatasets(datasetData, groupBy) {

    var groupedData = {};

    for (var nodeId in datasetData) {
        var component = datasetData[nodeId];

        let rowData = {
            "componentName": component.Name
        };

        let groupName = null;
        if (component.properties.length > 0) {

            // get all properties
            for (var i = 0; i < component.properties.length; i++) {
                var property = component.properties[i];

                rowData[property.Name] = property.Value;
            }

            if (groupBy in rowData) {
                // check if unassigned
                if (!rowData[groupBy] ||
                    rowData[groupBy] === "") {
                    groupName = "UnAssigned";
                }
                else {
                    groupName = rowData[groupBy];
                }
            }
            else {
                groupName = "Undefined";
            }
        }
        else {
            groupName = "Undefined";
        }

        if (!(groupName in groupedData)) {
            groupedData[groupName] = {
                "columns": ["componentName"],
                "rows": []
            };
        }

        let row = [];
        for (let prop in rowData) {
            let index = groupedData[groupName]["columns"].indexOf(prop);
            if (index === -1) {
                groupedData[groupName]["columns"].push(prop);
                index = groupedData[groupName]["columns"].length - 1;
            }
            row[index] = rowData[prop];
        }

        groupedData[groupName]["rows"].push(row);
    }

    return groupedData;
}