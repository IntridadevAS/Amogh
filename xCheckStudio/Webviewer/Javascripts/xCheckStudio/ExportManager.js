var XLSX;
if (typeof (require) !== 'undefined') {
    XLSX = require('xlsx');
}

function GetCategoryWiseComponentList(components) {
    var categoryList = {};
    for (var id in components) {
        var component = components[id];
        if (!Object.keys(categoryList).includes(component.mainclass)) {
            categoryList[component.mainclass] = [];
            categoryList[component.mainclass].push(component)
        }
        else {
            categoryList[component.mainclass].push(component)
        }
    }

    return categoryList;
}

function onExcelClick() {
    // show output to excel form
    SelectExportDataTypeForm.open();
}

function exportReviewsToExcel() {
    showBusyIndicator();

    var exportToExcel = new ExportExcel();
    var selectedTables = {};

    // if comparison results are present to export
    if (SelectComparisonDataForm.selectedCategories.length > 0) {
        selectedTables["Comparison"] = {
            "categories": SelectComparisonDataForm.selectedCategories,
            "exportProperties": SelectComparisonDataForm.includeProperties
        };
    }

    // if compliance results are present to export
    if (SelectComplianceDataForm.datasets.length > 0) {
        let ids = [
            "ComplianceA",
            "ComplianceB",
            "ComplianceC",
            "ComplianceD"];

        for (let i = 0; i < SelectComplianceDataForm.datasets.length; i++) {
            let compliance = SelectComplianceDataForm.datasets[i];

            selectedTables[ids[compliance.selectedDatasetId]] = {
                "categories": compliance.selectedCategories,
                "exportProperties": SelectComplianceDataForm.includeProperties,
                "selectedDataset": compliance.selectedDataset
            };
        }
    }

    if (Object.keys(selectedTables).length > 0) {
        exportToExcel.ExportReviewTablesData(selectedTables).then(function () {
            // closeSaveAs();
            // closeOutpuToOverlay();

            SelectComparisonDataForm.clearData();
            SelectComplianceDataForm.clearData();
        });
    }
    else {
        hideBusyIndicator();
        return;
    }
    
}

function exportDatasetsToExcel() {
    showBusyIndicator();

    var exportToExcel = new ExportExcel();

    if (SelectDatasetsDataForm.datasets.length > 0) {
        exportToExcel.ExportDatasetsData(SelectDatasetsDataForm.datasets).then(function () {
            // closeSaveAs();
            // closeOutpuToOverlay();
            SelectDatasetsDataForm.clearData();
        });
    }
    else {
        hideBusyIndicator();
        return;
    }
}




// select type of data to export in excel
let SelectExportDataTypeForm = {
    formId: "exportExcelSelectDataTypeForm",
    captionBarId: "exportExcelSelectDataTypeFormCaptionBar",
    cancelBtnId: "exportExcelSelectDataTypeFormCancel",
    outputReviewsBtnId: "outputReviewsBtn",
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

        this.registerOnclick(this.outputReviewsBtnId, function () {
            SelectExportDataTypeForm.onOutputReviewsClicked();
        });

        this.registerOnclick(this.outputDatasetsBtnId, function () {
            SelectExportDataTypeForm.onOutputDatasetsClicked();
        });
    },

    onOutputReviewsClicked: function () {
        this.close();
        SelectComparisonDataForm.open();
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

// select type of data to export in excel
let SelectComparisonDataForm = {
    formId: "exportComparisonToExcelForm",
    captionBarId: "exportComparisonToExcelCaptionBar",
    cancelBtnId: "exportComparisonToExcelCancel",
    nextBtnId: "exportComparisonToExcelNext",
    categoriesTagboxId: "exportComparisonToExcelCategory",
    includePropsCBId: "exportComparisonToExcelIncludeProps",
    datasetNameId: "exportComparisonToExcelDataset",
    includePropsCB: null,
    categoriesTagbox: null,
    selectedCategories: [],
    includeProperties: false,

    open: function () {
        // show form
        this.show();

        // init controls
        this.init();
    },

    close: function (clearData = false) {
        this.hide();

        // dispose category tagbox control
        this.disposeCategoryTagbox();

        // dispose include properties cb
        this.disposeIncludePropsCB();

        if (clearData) {
            this.clearData();
            SelectComplianceDataForm.clearData();
        }
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

    disposeIncludePropsCB: function () {
        if (!this.includePropsCB) {
            return;
        }
        this.includePropsCB = null;

        var ele = document.getElementById(this.includePropsCBId);
        var parent = ele.parentElement;

        $("#" + this.includePropsCBId).dxCheckBox("dispose");
        $("#" + this.includePropsCBId).remove();

        var newDiv = document.createElement("div")
        newDiv.id = this.includePropsCBId;
        newDiv.setAttribute("class", "exportComparisonToExcelIncludeProps");
        parent.appendChild(newDiv);
    },

    disposeCategoryTagbox: function () {
        if (!this.categoriesTagbox) {
            return;
        }
        this.categoriesTagbox = null;

        var ele = document.getElementById(this.categoriesTagboxId);
        var parent = ele.parentElement;

        $("#" + this.categoriesTagboxId).dxTagBox("dispose");
        $("#" + this.categoriesTagboxId).remove();

        var newDiv = document.createElement("div")
        newDiv.id = this.categoriesTagboxId;
        newDiv.setAttribute("class", "exportComparisonToExcelCategory");
        parent.appendChild(newDiv);
    },

    clearData: function () {
        this.selectedCategories = [];
        this.includeProperties = false;
    },

    init: function () {
        let enablecategoriesTagbox = true;
        let enableIncludePropertiesCB = true;

        // Categories tagbox and dataset name
        let categories = []
        if (checkResults.Comparisons &&
            checkResults.Comparisons.length > 0) {
            let comparisonData = checkResults.Comparisons[0];
            for (let categoryId in comparisonData.results) {
                let category = comparisonData.results[categoryId].componentClass;
                categories.push(category);
            }

            // datasets name label
            let datasetLabel = "";
            for (let i = 0; i < comparisonData.sources.length; i++) {
                let source = comparisonData.sources[i];
                if (i === 0) {
                    datasetLabel = source;
                }
                else {
                    datasetLabel += "/" + source;
                }
            }
            document.getElementById(this.datasetNameId).innerText = datasetLabel;
        }
        else {
            enableIncludePropertiesCB = false;
            enablecategoriesTagbox = false;
        }

        this.categoriesTagbox = $("#" + this.categoriesTagboxId).dxTagBox({
            items: categories,
            value: this.selectedCategories,
            searchEnabled: true,
            hideSelectedItems: true,
            placeholder: "Select Categories...",
            disabled: !enablecategoriesTagbox,
            buttons: [{
                name: "selectDatasetCategories",
                location: "after",
                options: {
                    icon: "public/symbols/Add-Filled.svg",
                    type: "normal",
                    onClick: function (e) {
                        let totalItems = SelectComparisonDataForm.categoriesTagbox.option("items");
                        let value = SelectComparisonDataForm.categoriesTagbox.option("value");
                        if (!value ||
                            value.length !== totalItems.length) {
                            SelectComparisonDataForm.categoriesTagbox.option("value", totalItems);
                        }
                        else {
                            SelectComparisonDataForm.categoriesTagbox.option("value", []);
                        }
                    }
                }
            }]
        }).dxTagBox("instance");

        // include properties checkbox
        this.includePropsCB = $("#" + this.includePropsCBId).dxCheckBox({
            value: this.includeProperties,
            text: "Include Properties",
            disabled: !enableIncludePropertiesCB
        }).dxCheckBox("instance");

        this.registerOnclick(this.cancelBtnId, function () {
            SelectComparisonDataForm.close(true);
            SelectExportDataTypeForm.open();

        });

        this.registerOnclick(this.nextBtnId, function () {
            SelectComparisonDataForm.onNext();
        });
    },

    onNext: function () {

        // save current data
        if (this.categoriesTagbox) {
            this.selectedCategories = this.categoriesTagbox.option("value");
        }

        if (this.includePropsCB) {
            this.includeProperties = this.includePropsCB.option("value");
        }

        this.close();
        SelectComplianceDataForm.open();
    },

    registerOnclick: function (eleId, callback) {
        document.getElementById(eleId).onclick = function () {
            callback();
        };
    },
}

let SelectComplianceDataForm = {
    formId: "exportComplianceToExcelForm",
    captionBarId: "exportComplianceToExcelCaptionBar",
    cancelBtnId: "exportComplianceToExcelCancel",
    backBtnId: "exportComplianceToExcelBack",
    exportBtnId: "exportComplianceToExcelExport",
    includePropsCBId: "exportComplianceToExcelIncludeProps",
    addBtnId: "exportComplianceToExcelDatasetAdd",
    clearBtnId: "exportComplianceToExcelDatasetClear",
    includePropsCB: null,
    includeProperties: false,
    datasets: [],
    checkedDatasets: {},
    open: function () {
        // show form
        this.show();

        // init controls
        this.init();
    },

    close: function (clearData = false) {
        this.hide();

        // dispose include properites cb
        this.disposeIncludePropsCB();

        // clear added datasets 
        document.getElementById("exportComplianceToExcelControlsColumn").innerHTML = "";

        if (clearData) {
            this.clearData();
            SelectComparisonDataForm.clearData();
        }
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

    clearData: function () {
        this.includeProperties = false;
        this.datasets = [];
        this.checkedDatasets = {};
    },

    disposeIncludePropsCB: function () {
        var ele = document.getElementById(this.includePropsCBId);
        var parent = ele.parentElement;

        $("#" + this.includePropsCBId).dxCheckBox("dispose");
        $("#" + this.includePropsCBId).remove();

        var newDiv = document.createElement("div")
        newDiv.id = this.includePropsCBId;
        newDiv.setAttribute("class", "exportComplianceToExcelIncludeProps");
        parent.appendChild(newDiv);
    },

    init: function () {

        // restore added datasets
        for (let i = 0; i < this.datasets.length; i++) {
            let dataset = this.datasets[i];
            this.addDatasetToUI(dataset);
        }

        let enableIncludePropsCB = false;
        if (checkResults.Compliances &&
            checkResults.Compliances.length > 0) {
            enableIncludePropsCB = true;
        }

        // inc   lude properties checkbox
        this.includePropsCB = $("#" + this.includePropsCBId).dxCheckBox({
            value: this.includeProperties,
            text: "Include Properties",
            disabled: !enableIncludePropsCB,
        }).dxCheckBox("instance");

        this.registerOnclick(this.cancelBtnId, function () {
            SelectComplianceDataForm.close(true);
        });

        this.registerOnclick(this.backBtnId, function () {
            SelectComplianceDataForm.onBack();
        });

        this.registerOnclick(this.exportBtnId, function () {
            SelectComplianceDataForm.onExport();
        });

        this.registerOnclick(this.addBtnId, function () {
            SelectComplianceDataForm.onAddDatset();
        });

        this.registerOnclick(this.clearBtnId, function () {
            SelectComplianceDataForm.onClearDatasets();
        });
    },

    onAddDatset: function () {
        //get already selected dataset ids
        let selectedDatsetIds = [];
        for (let i = 0; i < this.datasets.length; i++) {
            selectedDatsetIds.push(this.datasets[i].selectedDatasetId);
        }

        SelectComplianceForm.open(selectedDatsetIds);
    },

    onClearDatasets: function () {
        this.removeDataSets();
    },

    onDataSetAdded: function (data) {
        if (data &&
            data["selectedCategories"] &&
            data["selectedDataset"]) {
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
                SelectComplianceDataForm.checkedDatasets[data.selectedDatasetId] = data.selectedDataset;
            }
            else {
                if (data.selectedDatasetId in SelectComplianceDataForm.checkedDatasets) {
                    delete SelectComplianceDataForm.checkedDatasets[data.selectedDatasetId]
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

        document.getElementById("exportComplianceToExcelControlsColumn").appendChild(item);
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

    onBack: function () {
        this.saveData();

        this.close();
        SelectComparisonDataForm.open();
    },

    onExport: function () {
        this.saveData();
        this.close();
        SelectComparisonDataForm.close();

        exportReviewsToExcel();
      //  showSelectValidCheckCasePrompt();

    },

    saveData: function () {
        if (this.includePropsCB) {
            this.includeProperties = this.includePropsCB.option("value");
        }
    },

    registerOnclick: function (eleId, callback) {
        document.getElementById(eleId).onclick = function () {
            callback();
        };
    },
}

let SelectComplianceForm = {
    formId: "exportExcelselectComplainceForm",
    cancelBtnId: "exportExcelselectComplainceCancel",
    applyBtnId: "exportExcelselectComplainceApply",
    categoriesTagboxId: "exportExcelselectComplainceCategory",
    datasetSelectId: "exportExcelselectComplainceDataset",
    datasetSelect: null,
    categoriesTagbox: null,

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
        newDiv.setAttribute("class", "exportExcelselectComplainceDataset");
        parent.appendChild(newDiv);
    },

    disposeCategoryTagbox: function () {
        var ele = document.getElementById(this.categoriesTagboxId);
        var parent = ele.parentElement;

        $("#" + this.categoriesTagboxId).dxTagBox("dispose");
        $("#" + this.categoriesTagboxId).remove();

        var newDiv = document.createElement("div")
        newDiv.id = this.categoriesTagboxId;
        newDiv.setAttribute("class", "exportExcelselectComplainceCategory");
        parent.appendChild(newDiv);
    },

    show: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById(this.formId);

        overlay.style.display = 'block';
        popup.style.display = 'block';

        // // Make the DIV element draggable:
        // xCheckStudio.Util.dragElement(popup, popup);
    },

    hide: function () {
        var overlay = document.getElementById("uiBlockingOverlay");
        var popup = document.getElementById(this.formId);

        overlay.style.display = 'none';
        popup.style.display = 'none';
    },

    init: function (selectedDatsetIds) {

        // Categories tagbox and dataset name
        let datasets = [];
        if (checkResults.Compliances &&
            checkResults.Compliances.length > 0) {
            for (let i = 0; i < checkResults.Compliances.length; i++) {
                if (selectedDatsetIds.indexOf(i) !== -1) {
                    continue;
                }

                let complianceData = checkResults.Compliances[i];
                datasets.push({
                    "name": complianceData.source,
                    "id": i
                });
            }
        }

        // dataset select        
        this.datasetSelect = $("#" + this.datasetSelectId).dxSelectBox({
            dataSource: datasets,
            displayExpr: "name",
            valueExpr: "id",
            placeholder: "Select Dataset...",
            searchEnabled: true,
            onValueChanged: function (data) {
                // for (let i = 0; i < checkResults.Compliances.length; i++) {
                let complianceData = checkResults.Compliances[data.value];

                // if (data.value === complianceData.source) {

                let categories = [];
                for (let categoryId in complianceData.results) {
                    let category = complianceData.results[categoryId].componentClass;
                    categories.push(category);
                }

                SelectComplianceForm.categoriesTagbox.option("value", null);
                SelectComplianceForm.categoriesTagbox.option("items", categories);
                //     break;
                // }
                // }
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
                    type: "normal",
                    onClick: function (e) {
                        let totalItems = SelectComplianceForm.categoriesTagbox.option("items");
                        let value = SelectComplianceForm.categoriesTagbox.option("value");
                        if (!value ||
                            value.length !== totalItems.length) {
                            SelectComplianceForm.categoriesTagbox.option("value", totalItems);
                        }
                        else {
                            SelectComplianceForm.categoriesTagbox.option("value", []);
                        }
                    }
                }
            }]
        }).dxTagBox("instance");

        this.registerOnclick(this.cancelBtnId, function () {
            SelectComplianceForm.close();
        });

        this.registerOnclick(this.applyBtnId, function () {
            SelectComplianceForm.onApply();
        });
    },

    onApply: function () {
        let data = this.getData();
        SelectComplianceDataForm.onDataSetAdded(data);
        this.close();
    },

    getData: function () {
        let selectedCategories = null;
        if (this.categoriesTagbox) {
            selectedCategories = this.categoriesTagbox.option("value");
        }

        let selectedDatasetId = null;
        let selectedDataset = null;
        if (this.datasetSelect) {
            selectedDatasetId = this.datasetSelect.option("value");
        }
        if (selectedDatasetId !== null &&
            selectedDatasetId >= 0) {
            let complianceData = checkResults.Compliances[selectedDatasetId];
            selectedDataset = complianceData.source
        }

        return {
            "selectedCategories": selectedCategories,
            "selectedDataset": selectedDataset,
            "selectedDatasetId": selectedDatasetId
        };
    },

    registerOnclick: function (eleId, callback) {
        document.getElementById(eleId).onclick = function () {
            callback();
        };
    },
}

// Select datasets to export form
let SelectDatasetsDataForm = {
    formId: "exportDatasetsToExcelForm",
    captionBarId: "exportDatasetsToExcelCaptionBar",
    cancelBtnId: "exportDatasetsToExcelCancel",
    exportBtnId: "exportDatasetsToExcelExport",
    addBtnId: "exportDatasetsToExcelDatasetAdd",
    clearBtnId: "exportDatasetsToExcelDatasetClear",
    selectedDatasetsDivId: "exportDatasetsToExcelControlsColumn",
    datasets: [],
    checkedDatasets: {},

    open: function () {
        // show form
        this.show();

        // init controls
        this.init();
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
        this.datasets = [];
        this.checkedDatasets = {};
    },

    init: function () {

        this.registerOnclick(this.cancelBtnId, function () {
            SelectDatasetsDataForm.close(true);
            SelectExportDataTypeForm.open();
            
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
            data["datasetData"]) {
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
        // this.saveData();       
        this.close();

        exportDatasetsToExcel();
    },

    saveData: function () {

    },

    registerOnclick: function (eleId, callback) {
        document.getElementById(eleId).onclick = function () {
            callback();
        };
    },
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
        let allDatasets = checkResults.sourceInfo;
        let datasets = [];
        if ("sourceAFileName" in allDatasets &&
            allDatasets["sourceAFileName"] &&
            selectedDatsetIds.indexOf(0) === -1) {
            datasets.push({
                "name": allDatasets["sourceAFileName"],
                "id": 0
            });
        }
        if ("sourceBFileName" in allDatasets &&
            allDatasets["sourceBFileName"] &&
            selectedDatsetIds.indexOf(1) === -1) {
            datasets.push({
                "name": allDatasets["sourceBFileName"],
                "id": 1
            });
        }
        if ("sourceCFileName" in allDatasets &&
            allDatasets["sourceCFileName"] &&
            selectedDatsetIds.indexOf(2) === -1) {
            datasets.push({
                "name": allDatasets["sourceCFileName"],
                "id": 2
            });
        }
        if ("sourceDFileName" in allDatasets &&
            allDatasets["sourceDFileName"] &&
            selectedDatsetIds.indexOf(3) === -1) {
            datasets.push({
                "name": allDatasets["sourceDFileName"],
                "id": 3
            });
        }

        // dataset select        
        this.datasetSelect = $("#" + this.datasetSelectId).dxSelectBox({
            dataSource: datasets,
            displayExpr: "name",
            valueExpr: "id",
            placeholder: "Select Dataset...",
            searchEnabled: true,
            onValueChanged: function (data) {
                let components = null;
                if (data.value === 0) {
                    components = checkResults["sourceAComponents"];
                }
                else if (data.value === 1) {
                    components = checkResults["sourceBComponents"];
                }
                else if (data.value === 2) {
                    components = checkResults["sourceCComponents"];
                }
                else if (data.value === 3) {
                    components = checkResults["sourceDComponents"];
                }
                if (components !== null) {
                    var categoryComponentList = GetCategoryWiseComponentList(components);
                    let categories = Object.keys(categoryComponentList);
                    SelectDatasetForm.categoriesTagbox.option("value", null);
                    SelectDatasetForm.categoriesTagbox.option("items", categories);
                }
            }
        }).dxSelectBox("instance");

        // group by select        
        this.groupBySelect = $("#" + this.groupBySelectId).dxSelectBox({
            dataSource: [],
            placeholder: "Select Group By Property...",
            searchEnabled: true,
            disabled: true,
            onValueChanged: function (data) {
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

    onApply: function () {
        let data = this.getData();
        SelectDatasetsDataForm.onDataSetAdded(data);
        this.close();
    },

    getData: function () {
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
        if (selectedDatasetId !== null &&
            selectedDatasetId >= 0) {

            if (selectedDatasetId === 0) {
                selectedDataset = checkResults.sourceInfo["sourceAFileName"];

                let components = checkResults["sourceAComponents"];
                datasetData = GetCategoryWiseComponentList(components);
            }
            else if (selectedDatasetId === 1) {
                selectedDataset = checkResults.sourceInfo["sourceBFileName"];

                let components = checkResults["sourceBComponents"];
                datasetData = GetCategoryWiseComponentList(components);
            }
            else if (selectedDatasetId === 2) {
                selectedDataset = checkResults.sourceInfo["sourceCFileName"];

                let components = checkResults["sourceCComponents"];
                datasetData = GetCategoryWiseComponentList(components);
            }
            else if (selectedDatasetId === 3) {
                selectedDataset = checkResults.sourceInfo["sourceDFileName"];

                let components = checkResults["sourceDComponents"];
                datasetData = GetCategoryWiseComponentList(components);
            }
        }

        return {
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
