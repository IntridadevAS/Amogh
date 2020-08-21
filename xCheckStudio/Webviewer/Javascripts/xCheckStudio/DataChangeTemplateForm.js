let DataChangeTemplateForm = {
    formId: "dataChangeTemplateForm",
    captionBarId: "dataChangeTemplateFormCaptionBar",
    nameBoxId: "dataChangeTemplateNameBox",
    applyBtnId: "dataChangeTemplateFormApplyBtn",
    closeBtnId: "dataChangeTemplateFormCloseBtn",
    templateSelectId: "dataChangeTemplatesDL",
    sourceSelectId: "dataChangeTemplateSourceSelect",
    targetSelectId: "dataChangeTemplateTargetSelect",
    historySelectId: "dataChangeTemplateHistorySelect",
    optionsId: "dataChangeTemplateFormOptions",
    resetId: "dataChangeTemplateFormReset",
    removeId: "dataChangeTemplateFormRemove",
    active: false,
    nameBox: null,
    templateSelect: null,
    revisions: null,
    sourceBox: null,
    targetBox: null,
    options : null,

    getFormElement: function () {
        return document.getElementById(DataChangeTemplateForm.formId);
    },

    enableForm: function(){
        var form = this.getFormElement();
        form.style.zIndex = "101";
    },

    disableForm: function(){
        var form = this.getFormElement();
        form.style.zIndex = "99";
    },

    open: function () {
        if (model.currentTabId === null) {
            return;
        }

        DataChangeTemplateForm.active = true;

        // block ui elements
        document.getElementById("uiBlockingOverlay").style.display = "block";

        var form = DataChangeTemplateForm.getFormElement();
        form.style.display = "block";
        form.style.top = ((window.innerHeight / 2) - 275) + "px";
        form.style.left = ((window.innerWidth / 2) - 145) + "px";

        // Make the DIV element draggable:
        xCheckStudio.Util.dragElement(form,
            document.getElementById(DataChangeTemplateForm.captionBarId));

        DataChangeTemplateForm.init();
    },

    close: function () {
        DataChangeTemplateForm.active = false;

        // unblock ui elements
        document.getElementById("uiBlockingOverlay").style.display = "none";

        var form = DataChangeTemplateForm.getFormElement();
        form.style.display = "none";

        this.revisions = null;
    },

    init: function () {
        // var _this = this;
        this.populateTemplates();

        DataChangeRevisioning.readRevisions(null).then(function (revisions) {
            if (!revisions) {
                return;
            }
            DataChangeTemplateForm.revisions = revisions;

            DataChangeTemplateForm.populateSourceRevisions();
            DataChangeTemplateForm.populateTargetRevisions();
            DataChangeTemplateForm.populateChangeHistory();
        });

        // name box
        DataChangeTemplateForm.nameBox = $("#" + DataChangeTemplateForm.nameBoxId).dxTextBox({
            placeholder: "Enter Name..."
        }).dxTextBox("instance");

        // Init controsl
        // apply btn
        DataChangeTemplateForm.registerOnclick(DataChangeTemplateForm.applyBtnId, function () {
            DataChangeTemplateForm.onApply();
        });

        // on close
        DataChangeTemplateForm.registerOnclick(DataChangeTemplateForm.closeBtnId, function () {
            DataChangeTemplateForm.close();
        });

        // on reset
        DataChangeTemplateForm.registerOnclick(DataChangeTemplateForm.resetId, function () {
            DataChangeTemplateForm.reset();
        });

        // on delete template
        DataChangeTemplateForm.registerOnclick(DataChangeTemplateForm.removeId, function () {
            DataChangeTemplateForm.deleteTemplate();
        });

        // on open options
        DataChangeTemplateForm.registerOnclick(DataChangeTemplateForm.optionsId, function () {
            DataChangeTemplateForm.openOptions();
        });
    },

    registerOnclick: function (eleId, callback) {
        document.getElementById(eleId).onclick = function () {
            callback();
        };
    },

    openOptions: function () {
        var source = this.sourceBox.option("value");
        var target = this.targetBox.option("value");
        if (!source ||
            source === "" ||
            !target ||
            target === "") {
            alert("Please select Source and Target Revisions before adding options.");
            return;
        }

        // Source revision
        let srcRevInfo = {};
        if (source.toLowerCase() === "current") {
            srcRevInfo["revisionName"] = "Current";
        }
        else {
            let splitArray = source.split("(");

            srcRevInfo["revisionName"] = splitArray[0];

            splitArray = splitArray[1].split(':');
            srcRevInfo["dataSourceType"] = splitArray[0];
            srcRevInfo["dataSourceName"] = splitArray[1].replace(")", "");
        }

        // target revision
        let targetRevInfo = {};
        if (target.toLowerCase() === "current") {
            targetRevInfo["revisionName"] = "Current";
        }
        else
        {
            let splitArray = target.split("(");

            targetRevInfo["revisionName"] = splitArray[0];

            splitArray = splitArray[1].split(':');
            targetRevInfo["dataSourceType"] = splitArray[0];
            targetRevInfo["dataSourceName"] = splitArray[1].replace(")", "");
        }

        DataChangeTemplateOptionsForm.open(srcRevInfo, targetRevInfo);

        // block current form ui
        this.disableForm();
    },

    reset: function () {
        if (this.templateSelect.option("value").toLowerCase() !== "new") {
            this.setTemplateSelectValue("New");
        }
        else {
            // update  controls
            this.nameBox.option("value", "");

            // reset source and target
            DataChangeTemplateForm.setSourceValue(null);
            DataChangeTemplateForm.setTargetValue(null);
            DataChangeTemplateForm.setChangeHistoryValue(null);
        }
    },

    deleteTemplate: function () {
        var templateName = DataChangeTemplateForm.nameBox.option("value");
        if (!templateName ||
            templateName === "") {
            return;
        }

        if (templateName in model.dataChangeHighlightTemplates) {
            delete model.dataChangeHighlightTemplates[templateName];
        }

        // // template config
        // if (templateName in model.dataChangeTemplateConfigs) {
        //     // save template configs
        //     delete model.dataChangeTemplateConfigs[templateName];

        //     // save data change template configs to json
        //     DataChangeTemplateForm.writeTemplateConfigs().then(function (success) {
        //     });
        // }

        // update  controls
        DataChangeTemplateForm.nameBox.option("value", "");

        // reset source and target
        DataChangeTemplateForm.setSourceValue(null);
        DataChangeTemplateForm.setTargetValue(null);
        DataChangeTemplateForm.setChangeHistoryValue(null);

        // add template to template select control
        let templates = DataChangeTemplateForm.templateSelect.getDataSource().items();
        let index = templates.indexOf(templateName);
        if (index !== -1) {
            templates.splice(index, 1);
        }
        DataChangeTemplateForm.templateSelect.option("items", templates);
        DataChangeTemplateForm.setTemplateSelectValue("New");

        // update template select for table view
        var sourceManager = SourceManagers[this.Id];
        let groupViewType = sourceManager.GroupHighlightTypeSelect.option("value");
        if (groupViewType.toLowerCase() === "data change highlight") {
            sourceManager.GroupTemplateSelect.option("items", ["Clear"].concat(Object.keys(model.dataChangeHighlightTemplates)));
        }

        DevExpress.ui.notify("Data change highlight template '" + templateName + "' deleted successfully.");
    },

    onApply: function () {
        var source = this.sourceBox.option("value");
        if (!source ||
            source === "") {
            alert("Please select Source Revision to save template.");
            return;
        }

        var target = this.targetBox.option("value");
        if (!target ||
            target === "") {
            alert("Please select Target Revision to save template.");
            return;
        }

        var templateName = this.nameBox.option("value");
        if (!templateName ||
            templateName === "") {
            alert("Please enter Name to save template.");
            return;
        }        

        let sourceRev = null;
        let targetRev = null;

        let sourceRevName = null;
        let sourceType = null;
        if (source.toLowerCase() === "current") {
            sourceRev = { id: "Current" };
        }
        else {
            let splitArray = source.split("(");
            sourceRevName = splitArray[0];
            sourceType = splitArray[1].split(":")[0];
        }

        let targetRevName = null;
        let targetType = null;
        if (target.toLowerCase() === "current") {
            targetRev = { id: "Current" };
        }
        else {
            let splitArray = target.split("(");
            targetRevName = splitArray[0];
            targetType = splitArray[1].split(":")[0];
        }
        for (let i = 0; i < DataChangeTemplateForm.revisions.length; i++) {
            if (sourceRev !== null &&
                targetRev !== null) {
                break;
            }

            let revision = DataChangeTemplateForm.revisions[i];
            if (!sourceRev &&
                revision.name === sourceRevName &&
                revision.dataSourceType.toLowerCase() === sourceType.toLowerCase()) {
                sourceRev = revision;
            }

            if (!targetRev &&
                revision.name === targetRevName &&
                revision.dataSourceType.toLowerCase() === targetType.toLowerCase()) {
                targetRev = revision;
            }
        }
        if (sourceRev === null ||
            targetRev === null) {
            return;
        }

        // check if template with same name already exist
        if (templateName in model.dataChangeHighlightTemplates) {
            if (confirm("'" +
                templateName +
                "' already exists.\nDo you want to overwrite?") === false) {
                return;
            }
        }

        // save template
        model.dataChangeHighlightTemplates[templateName] = {
            "source": sourceRev,
            "target": targetRev,
            "options": this.options
        };

        // // save template configs
        // model.dataChangeTemplateConfigs[templateName] = {
        //     "matchWith": {
        //         "source": "Name",
        //         "target": "Name"
        //     }
        // }
        // // save data change template configs to json
        // DataChangeTemplateForm.writeTemplateConfigs().then(function (success) {
        // });

        // update  controls
        this.nameBox.option("value", "");

        // reset source and target
        DataChangeTemplateForm.setSourceValue(null);
        DataChangeTemplateForm.setTargetValue(null);
        DataChangeTemplateForm.setChangeHistoryValue(null);

        // add template to template select control
        let templates = this.templateSelect.getDataSource().items();
        if (templates.indexOf(templateName) === -1) {
            templates.push(templateName);
        }
        this.templateSelect.option("items", templates);
        this.setTemplateSelectValue("New");

        // update template select for table view
        var sourceManager = SourceManagers[this.Id];
        let groupViewType = sourceManager.GroupHighlightTypeSelect.option("value");
        if (groupViewType.toLowerCase() === "data change highlight") {
            sourceManager.GroupTemplateSelect.option("items", ["Clear"].concat(Object.keys(model.dataChangeHighlightTemplates)));
        }

        DevExpress.ui.notify("Data change highlight template '" + templateName + "' created successfully.");
    },

    getRevision: function (revId) {
        if (revId.toLowerCase() === "current") {
            return { id: "Current" };
        }

        for (let i = 0; i < DataChangeTemplateForm.revisions.length; i++) {
            let revision = DataChangeTemplateForm.revisions[i];
            if (revision.id === revId) {
                return revision;
            }
        }

        return null;
    },

    getRevisionText: function (revId) {
        let revision = this.getRevision(revId);
        if (revision === null) {
            return null;
        }

        let text = null;
        if (revision.id.toLowerCase() === "current") {
            text = "Current";
        }
        else {
            text = revision.name + "(" + revision.dataSourceType + ":" + revision.dataSourceName + ")";
        }

        return text;
    },

    setSourceRevision: function (revId) {
        let revText = this.getRevisionText(revId);
        this.sourceBox.option("value", revText);
    },

    setTargetRevision : function(revId){
        let revText = this.getRevisionText(revId);
        this.targetBox.option("value", revText);
    },    

    populateSourceRevisions: function () {

        this.sourceBox = $("#" + DataChangeTemplateForm.sourceSelectId).dxTextBox({
            placeholder: "Select Source Revision...",
            stylingMode: "outlined",
            buttons: [{
                name: "sourceRevSelect",
                location: "after",
                options: {
                    icon: "public/symbols/Add-Filled.svg",
                    // stylingMode: "outlined",
                    type: "normal",
                    onClick: function () {
                        SelectRevisionForm.setCaption("Select Source Revision");

                        // get current selected revision info
                        let selRevText = DataChangeTemplateForm.sourceBox.option("value");
                        
                        let selRevInfo = {};
                        if (selRevText) {
                            if (selRevText.toLowerCase() === "current") {
                                selRevInfo["revisionName"] = "Current";
                            }
                            else {
                                let splitArray = selRevText.split("(");

                                selRevInfo["revisionName"] = splitArray[0];

                                splitArray = splitArray[1].split(':');
                                selRevInfo["dataSourceType"] = splitArray[0];
                                selRevInfo["dataSourceName"] = splitArray[1].replace(")", "");
                            }
                        }
                        SelectRevisionForm.open("source", selRevInfo);

                        // block define template form
                        DataChangeTemplateForm.disableForm();
                    }
                }
            }]
        }).dxTextBox("instance");
    },

    populateTargetRevisions: function () {
        this.targetBox = $("#" + DataChangeTemplateForm.targetSelectId).dxTextBox({
            placeholder: "Select Target Revision...",
            stylingMode: "outlined",
            buttons: [{
                name: "targetRevSelect",
                location: "after",
                options: {
                    icon: "public/symbols/Add-Filled.svg",
                    // stylingMode: "outlined",
                    type: "normal",
                    onClick: function () {
                        SelectRevisionForm.setCaption("Select Target Revision");

                        // get current selected revision info
                        let selRevText = DataChangeTemplateForm.targetBox.option("value");
                        let selRevInfo = {};
                        if (selRevText) {
                            if (selRevText.toLowerCase() === "current") {
                                selRevInfo["revisionName"] = "Current";
                            }
                            else {
                                let splitArray = selRevText.split("(");

                                selRevInfo["revisionName"] = splitArray[0];

                                splitArray = splitArray[1].split(':');
                                selRevInfo["dataSourceType"] = splitArray[0];
                                selRevInfo["dataSourceName"] = splitArray[1].replace(")", "");
                            }
                        }
                        SelectRevisionForm.open("target", selRevInfo);   
                        
                        // block define template form
                        DataChangeTemplateForm.disableForm();
                    }
                }
            }]
        }).dxTextBox("instance");
    },

    populateChangeHistory: function () {
        var changeHistory = [];

        this.historySelect = $("#" + DataChangeTemplateForm.historySelectId).dxSelectBox({
            items: changeHistory,
            placeholder: "Select Change History...",
            onValueChanged: function (data) {
                // if (data.value.toLowerCase() !== "new") {
                //     DataChangeTemplateForm.NameTextBox.option("value", data.value);
                //     DataChangeTemplateForm.NameTextBox.option("disabled", true);
                // }
                // else {
                //     DataChangeTemplateForm.NameTextBox.option("value", "");
                //     DataChangeTemplateForm.NameTextBox.option("disabled", false);               
                // }    
                // _this.PopulateTemplateGrid();
            }

        }).dxSelectBox("instance");
    },

    populateTemplates: function () {
        var allTemplates = [
            "New"
        ];

        // let currentSourceType = SourceManagers[model.currentTabId].SourceType.toLowerCase();
        for (var templateName in model.dataChangeHighlightTemplates) {
            // let template = model.dataChangeHighlightTemplates[templateName];
            // if (template["dataSourceType"].toLowerCase() !== currentSourceType.toLowerCase()) {
            //     continue;
            // }

            allTemplates.push(templateName);
        }

        this.templateSelect = $("#" + DataChangeTemplateForm.templateSelectId).dxSelectBox({
            items: allTemplates,
            value: "New",
            onValueChanged: function (data) {
                if (data.value.toLowerCase() !== "new") {

                    DataChangeTemplateForm.setTemplateNameValue(data.value);
                    DataChangeTemplateForm.nameBox.option("disabled", true);

                    // load template
                    let template = model.dataChangeHighlightTemplates[data.value];                  
             
                    DataChangeTemplateForm.setSourceValue(DataChangeTemplateForm.getRevisionText(template.source.id));
                    DataChangeTemplateForm.setTargetValue(DataChangeTemplateForm.getRevisionText(template.target.id));
                    DataChangeTemplateForm.setChangeHistoryValue(null);

                    // set options
                    DataChangeTemplateForm.setOptions(template.options);
                }
                else {
                    DataChangeTemplateForm.setTemplateNameValue(null);
                    DataChangeTemplateForm.nameBox.option("disabled", false);

                    // reset source and target
                    DataChangeTemplateForm.setSourceValue(null);
                    DataChangeTemplateForm.setTargetValue(null);
                    DataChangeTemplateForm.setChangeHistoryValue(null);

                     // set options
                     DataChangeTemplateForm.setOptions(null);
                }
            }

        }).dxSelectBox("instance");
    },

    setSourceValue: function (value) {
        this.sourceBox.option("value", value);
    },

    setTargetValue: function (value) {
        this.targetBox.option("value", value);
    },

    setOptions: function(options){
        this.options = options;
    },

    setTemplateNameValue: function (value) {
        this.nameBox.option("value", value);
    },

    setTemplateSelectValue: function (value) {
        this.templateSelect.option("value", value);
    },

    setChangeHistoryValue: function (value) {
        this.historySelect.option("value", value);
    },
}

let DataChangeTemplateOptionsForm = {
    formId: "dataChangeTemplateOptionsForm",
    captionBarId: "dataChangeTemplateOptionsFormCaptionBar",
    applyBtnId: "dataChangeOptionsApplyBtn",
    closeBtnId: "dataChangeTemplateOptionsCloseBtn",
    listBySelectId: "dataChangeOptionsListBySelect",
    matchwithAddBtnId: "dataChangeOptionsMatchWithAdd",
    matchwithClearBtnId: "dataChangeOptionsMatchWithClear",
    matchwithGridId: "dataChangeOptionsMatchwithGrid",
    active: false,
    matchwithGrid: null,
    listBySelect: null,

    getFormElement: function () {
        return document.getElementById(this.formId);
    },

    open: function (sourceRevInfo, targetRevInfo) {
        this.active = true;

        var form = this.getFormElement();
        form.style.display = "block";
        form.style.top = ((window.innerHeight / 2) - 275) + "px";
        form.style.left = ((window.innerWidth / 2) - 145) + "px";

        // Make the DIV element draggable:
        xCheckStudio.Util.dragElement(form,
            document.getElementById(this.captionBarId));

        this.init(sourceRevInfo, targetRevInfo);
    },

    close: function () {
        DataChangeTemplateOptionsForm.active = false;

        var form = DataChangeTemplateOptionsForm.getFormElement();
        form.style.display = "none";

         // unblock define template form
         DataChangeTemplateForm.enableForm();
    },

    init: function (sourceRevInfo, targetRevInfo) {       
      
        if (model.currentTabId) {
            let allPromises = [];

            // source
            allPromises.push(this.getAllProperties(sourceRevInfo));

            // target
            allPromises.push(this.getAllProperties(targetRevInfo));

            xCheckStudio.Util.waitUntilAllPromises(allPromises).then(function (res) {
                // create matchwith grid
                DataChangeTemplateOptionsForm.createMatchwithGrid(res[0], res[1]);
                
                // list by select
                DataChangeTemplateOptionsForm.populateListBySelect(res[1]);
            });
        }        

        // apply btn
        this.registerOnclick(this.applyBtnId, function () {
            DataChangeTemplateOptionsForm.onApply();
        });

        // on close
        this.registerOnclick(this.closeBtnId, function () {
            DataChangeTemplateOptionsForm.close();
        });

        // on match with add
        this.registerOnclick(this.matchwithAddBtnId, function () {
            DataChangeTemplateOptionsForm.onAddMatchwith();
        });
        // on match with clear
        this.registerOnclick(this.matchwithClearBtnId, function () {
            DataChangeTemplateOptionsForm.onClearMatchwith();
        });
    },

    getAllProperties: function (revInfo) {
        return new Promise((resolve) => {

            if (revInfo["revisionName"].toLowerCase() === "current") {
                let allSrcProperties = SourceManagers[model.currentTabId].GetAllSourceProperties();

                return resolve(allSrcProperties);
            }
            else {
                DataChangeRevisioning.readAllRevisionProperties(revInfo).then(function (properties) {                    
                    return resolve(properties);
                });
            }
        });
    },

    populateListBySelect: function (allProperties) {

        let value = null;
        if (DataChangeTemplateForm.options &&
            "listby" in DataChangeTemplateForm.options) {
            value = DataChangeTemplateForm.options["listby"];
        }

        this.listBySelect = $("#" + this.listBySelectId).dxSelectBox({
            // items: sourceRevisions,
            dataSource: allProperties,
            value : value,
            placeholder: "Select List By Property...",
            searchEnabled: true,
            onValueChanged: function (data) {
            }

        }).dxSelectBox("instance");
    },

    registerOnclick: function (eleId, callback) {
        document.getElementById(eleId).onclick = function () {
            callback();
        };
    },

    onAddMatchwith: function () {
        if (DataChangeTemplateOptionsForm.matchwithGrid) {
            DataChangeTemplateOptionsForm.matchwithGrid.addRow();
            DataChangeTemplateOptionsForm.matchwithGrid.deselectAll();
        }
    },

    onClearMatchwith: function () {
        if (DataChangeTemplateOptionsForm.matchwithGrid) {

            var selectedRowKeys = DataChangeTemplateOptionsForm.matchwithGrid.getSelectedRowKeys();

            var totalRowsToRemove = selectedRowKeys.length;
            for (var i = 0; i < totalRowsToRemove; i++) {
                var rowIndex = DataChangeTemplateOptionsForm.matchwithGrid.getRowIndexByKey(selectedRowKeys[i]);
                if (rowIndex > -1) {
                    DataChangeTemplateOptionsForm.matchwithGrid.deleteRow(rowIndex);
                    DataChangeTemplateOptionsForm.matchwithGrid.refresh(true);
                }
            }
        }
    },

    onApply: function () {
        if (this.matchwithGrid.hasEditData() === true) {
            this.matchwithGrid.saveEditData().then(() => {
                DataChangeTemplateOptionsForm.applyOptions();
            });
        }
        else {
            DataChangeTemplateOptionsForm.applyOptions();
        }
    },

    applyOptions: function () {
        
        // matchwith properties
        let matchwithProps = [];
        let rows = this.matchwithGrid.getVisibleRows();
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            matchwithProps.push({
                "source": row.data.Source,
                "target": row.data.Target
            });
        }

        // listby property
        let listByProperty = this.listBySelect.option("value");

        // close this form
        let options = {
            "matchwith" : matchwithProps,
            "listby" : listByProperty
        };

        DataChangeTemplateForm.setOptions(options);
        this.close();
    },

    createMatchwithGrid: function (allSrcProperties, allTargetProperties) {

        // Create grid        
        var columns = [];

        var column = {};
        column["caption"] = "Id";
        column["dataField"] = "Id";
        column["visible"] = false;
        columns.push(column);

        column = {};
        column["caption"] = "Source";
        column["dataField"] = "Source";
        column["width"] = "50%";
        column["visible"] = true;
        column["lookup"] = { "dataSource": allSrcProperties }
        column["validationRules"] = [{ type: "required" }]
        columns.push(column);

        column = {};
        column["caption"] = "Target";
        column["dataField"] = "Target";
        column["width"] = "50%";
        column["visible"] = true;
        column["lookup"] = { "dataSource": allTargetProperties };
        column["validationRules"] = [{ type: "required" }];
        columns.push(column);

        let rowsData = [];
        if (DataChangeTemplateForm.options &&
            "matchwith" in DataChangeTemplateForm.options) {
            let matchwiths = DataChangeTemplateForm.options["matchwith"];
            for (let i = 0; i < matchwiths.length; i++) {
                let matchwith = matchwiths[i];

                rowsData.push({
                    "Id": i + 1,
                    "Source": matchwith.source,
                    "Target": matchwith.target
                });
            }
        }
       
        this.matchwithGrid = $("#" + this.matchwithGridId).dxDataGrid({
            columns: columns,
            dataSource: rowsData,
            allowColumnResizing: true,
            columnResizingMode: 'widget',
            showBorders: true,
            showRowLines: true,
            paging: { enabled: false },
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "always",
            },
            // scrolling: {
            //     mode: "virtual",
            //     rowRenderingMode: "virtual"
            // },
            editing: {
                mode: "cell",
                allowUpdating: true,
                texts: {
                    confirmDeleteMessage: ""
                },
            },
            onRowInserted: function (e) {
                e.component.cellValue(e.component.getRowIndexByKey(e.key), "id", e.component.getRowIndexByKey(e.key) + 1);
            },
            // onRowRemoved: function (e) {    
            // },
            // onRowUpdating(e) {    
            // },
            onEditorPreparing: function (e) {
                if (e.parentType !== "dataRow" ||
                    e.type === "selection") {
                    return;
                }
                if (e.dataField) {
                    if (e.dataField.toLowerCase() === "Source") {
                        e.editorOptions.itemTemplate = function (itemData, itemIndex, itemElement) {
                            $('<div>')
                                .appendTo(itemElement)
                                .text(itemData['Source'])
                                .attr('title', itemData['Source']);
                        }
                    }
                    else if (e.dataField.toLowerCase() === "Target") {
                        e.editorOptions.itemTemplate = function (itemData, itemIndex, itemElement) {
                            $('<div>')
                                .appendTo(itemElement)
                                .text(itemData['Target'])
                                .attr('title', itemData['Target']);
                        }
                    }
                }
            },
            onCellPrepared: function (e) {
                if (e.rowType !== "data") {
                    return;
                }

                if (e.columnIndex == 1) {
                    e.cellElement.mousemove(function () {
                        if ("Source" in e.data) {
                            e.cellElement.attr('title', e.data["Source"]);
                        }
                    });
                }
                if (e.columnIndex == 2) {
                    e.cellElement.mousemove(function () {
                        if ("Target" in e.data) {
                            e.cellElement.attr('title', e.data["Target"]);
                        }
                    });
                }
            },
            // onContextMenuPreparing: function (e) {
            //     if (e.row.rowType === "data") {
            //         e.items = [
            //             {
            //                 text: "Remove Color",
            //                 onItemClick: function () {
            //                     e.row.data["Color"] = null; 
            //                     e.row.cells[colorColumnIndex].cellElement[0].style.backgroundColor = "#FFFFFF";
            //                 }
            //             }
            //         ]
            //     }
            // }
        }).dxDataGrid("instance");
    },
}

let SelectRevisionForm = {
    formId: "selectRevisionForm",
    captionBarId: "selectRevisionCaptionBar",
    captionId: "selectRevisionCaption",
    applyBtnId: "selectRevisionApplyBtn",
    closeBtnId: "selectRevisionCloseBtn",
    useCurrentCBId: "useCurrentRevisionCB",
    datasetTypeSelectLabelId: "srfDatasetTypeSelectLabel",
    datasetNameSelectLabelId: "srfDatasetNameSelectLabel",
    revSelectLabelId: "srfRevSelectLabel",
    datasetTypeSelectId: "srfDatasetTypeSelect",
    datasetNameSelectId: "srfDatasetNameSelect",
    revSelectId: "srfRevSelect",
    useCurrentCB: null,
    datasetTypeSelect: null,
    datasetNameSelect: null,
    revSelect: null,
    typeWiseRevisions: {},
    //selectedRevId: null,
    context: null,
    getFormElement: function () {
        return document.getElementById(this.formId);
    },

    setCaption: function (caption) {
        document.getElementById(this.captionId).innerText = caption;
    },

    open: function (context, selRevInfo) {
        this.active = true;
        //this.selectedRevId = null;
        this.context = context;

        var form = this.getFormElement();
        form.style.display = "block";
        form.style.top = ((window.innerHeight / 2) - 275) + "px";
        form.style.left = ((window.innerWidth / 2) - 145) + "px";

        // Make the DIV element draggable:
        xCheckStudio.Util.dragElement(form,
            document.getElementById(this.captionBarId));

        this.init(selRevInfo);
    },

    close: function () {
        this.active = false;

        var form = this.getFormElement();
        form.style.display = "none";

        // unblock define template form
        DataChangeTemplateForm.enableForm();
    },

    init: function (selRevInfo) {

        // var allProperties = [];
        // if (model.currentTabId) {
        //     allProperties = SourceManagers[model.currentTabId].GetAllSourceProperties();
        // } 

        // // create matchwith grid
        // this.createMatchwithGrid(allProperties);

        // get dataset type wise revisions
        this.typeWiseRevisions = {};
        for (let i = 0; i < DataChangeTemplateForm.revisions.length; i++) {
            let rev = DataChangeTemplateForm.revisions[i];
            if (!(rev.dataSourceType in this.typeWiseRevisions)) {
                this.typeWiseRevisions[rev.dataSourceType] = {};
            }

            if (!(rev.dataSourceName in this.typeWiseRevisions[rev.dataSourceType])) {
                this.typeWiseRevisions[rev.dataSourceType][rev.dataSourceName] = [];
            }

            this.typeWiseRevisions[rev.dataSourceType][rev.dataSourceName].push(rev);
        }

        // Init controls    
        let useCurrent = false;        
        let dataSourceType = null;
        let dataSourceNames = []
        let dataSourceName = null;
        let revisionNames = [];
        let revisionId = null;
        if (selRevInfo) {
            if ("revisionName" in selRevInfo) {
                if (selRevInfo["revisionName"].toLowerCase() === "current") {
                    useCurrent = true;
                }
                // else {
                //     revisionName = selRevInfo["revisionName"];
                // }
            }

            if ("dataSourceType" in selRevInfo) {
                dataSourceType = selRevInfo["dataSourceType"];
                dataSourceNames = Object.keys(this.typeWiseRevisions[dataSourceType])
            }

            if ("dataSourceName" in selRevInfo) {
                dataSourceName = selRevInfo["dataSourceName"];

                let revs = this.typeWiseRevisions[dataSourceType][dataSourceName];
                for (let i = 0; i < revs.length; i++) {
                    let rev = revs[i];
                    revisionNames.push({
                        label: rev.name,
                        value: rev.id
                    });

                    if (selRevInfo["revisionName"] === rev.name) {
                        revisionId = rev.id;
                    }
                }                
            }
        }

        this.initUseCurrent(useCurrent);
        this.initTypeSelect(dataSourceType);
        this.initDatasetNameSelect(dataSourceNames, dataSourceName);
        this.initRevisionSelect(revisionNames, revisionId);
        
        // SelectRevisionForm.useCurrentCB.option("value", useCurrent);
        // SelectRevisionForm.datasetTypeSelect.option("value", dataSourceType);
        // SelectRevisionForm.datasetNameSelect.option("value", dataSourceName);
        // SelectRevisionForm.revSelect.option("value", revisionName);

        // this.initUseCurrent().then(function () {
        //     SelectRevisionForm.initTypeSelect().then(function () {
        //         SelectRevisionForm.initDatasetNameSelect().then(function () {
        //             SelectRevisionForm.initRevisionSelect().then(function () {
        //                 SelectRevisionForm.useCurrentCB.option("value", useCurrent);
        //                 SelectRevisionForm.datasetTypeSelect.option("value", dataSourceType);
        //                 SelectRevisionForm.datasetNameSelect.option("value", dataSourceName);
        //                 SelectRevisionForm.revSelect.option("value", revisionName);
        //             });
        //         });
        //     });
        // });

        // apply btn
        this.registerOnclick(this.applyBtnId, function () {
            SelectRevisionForm.onApply();
        });

        // on close
        this.registerOnclick(this.closeBtnId, function () {
            SelectRevisionForm.close();
        });
    },

    initUseCurrent: function (useCurrent) {
        return new Promise((resolve) => {

            // if (!this.useCurrentCB) {
                this.useCurrentCB = $("#" + this.useCurrentCBId).dxCheckBox({
                    value: useCurrent,
                    text: "Use Current Revision",
                    onInitialized: function (e) {
                        return resolve(true);
                    },
                    onValueChanged: function (data) {
                        if (data.value === true) {
                            // disable select revision controls
                            SelectRevisionForm.enableSelectRevControls(false);
                        }
                        else {
                            // disable select revision controls
                            SelectRevisionForm.enableSelectRevControls(true);
                        }
                    }
                }).dxCheckBox("instance");
            // }
            // else {
            //     return resolve(true);
            // }
        });
    },

    enableSelectRevControls: function (enable) {
        this.datasetTypeSelect.option("disabled", !enable);
        this.datasetNameSelect.option("disabled", !enable);
        this.revSelect.option("disabled", !enable);

        if (enable === false) {
            document.getElementById(this.datasetTypeSelectLabelId).classList.add("disableText");
            document.getElementById(this.datasetNameSelectLabelId).classList.add("disableText");
            document.getElementById(this.revSelectLabelId).classList.add("disableText");
        }
        else {
            document.getElementById(this.datasetTypeSelectLabelId).classList.remove("disableText");
            document.getElementById(this.datasetNameSelectLabelId).classList.remove("disableText");
            document.getElementById(this.revSelectLabelId).classList.remove("disableText");
        }
    },

    initTypeSelect: function (dataSourceType) {

        return new Promise((resolve) => {
            // if (!this.datasetTypeSelect) {
                this.datasetTypeSelect = $("#" + this.datasetTypeSelectId).dxSelectBox({
                    dataSource: Object.keys(this.typeWiseRevisions),
                    value: dataSourceType,
                    placeholder: "Dataset Type...",
                    searchEnabled: true,
                    onInitialized: function (e) {
                        return resolve(true);                        
                    },
                    onValueChanged: function (data) {
                        if (data.value in SelectRevisionForm.typeWiseRevisions) {
                            let sourceNames = Object.keys(SelectRevisionForm.typeWiseRevisions[data.value]);
                            SelectRevisionForm.datasetNameSelect.option("dataSource", sourceNames);
                        }

                        SelectRevisionForm.datasetNameSelect.option("value", null);
                    }

                }).dxSelectBox("instance");
            // }
            // else {
            //     return resolve(true);
            // }
        });
    },

    initDatasetNameSelect: function (dataSourceNames, dataSourceName) {

        return new Promise((resolve) => {

            // if (!this.datasetNameSelect) {
                this.datasetNameSelect = $("#" + this.datasetNameSelectId).dxSelectBox({
                    dataSource: dataSourceNames,
                    value : dataSourceName,
                    placeholder: "Dataset Name...",
                    searchEnabled: true,
                    onInitialized: function (e) {
                        return resolve(true);
                    },
                    onValueChanged: function (data) {
                        let selectedType = SelectRevisionForm.datasetTypeSelect.option("value");
                        if (selectedType in SelectRevisionForm.typeWiseRevisions) {
                            if (data.value in SelectRevisionForm.typeWiseRevisions[selectedType]) {
                                let revs = SelectRevisionForm.typeWiseRevisions[selectedType][data.value];


                                // populate revisions
                                let revisions = [];
                                for (let i = 0; i < revs.length; i++) {
                                    let revision = revs[i];
                                    revisions.push({
                                        label: revision.name,
                                        value: revision.id
                                    });
                                }

                                // let revNames = [];
                                // for(let i = 0; i < revs.length; i++){
                                //     revNames.push(revs[i].name);
                                // }
                                SelectRevisionForm.revSelect.option("dataSource", revisions);
                            }
                        }

                        SelectRevisionForm.revSelect.option("value", null);
                    }

                }).dxSelectBox("instance");
            // }
            // else {
            //     return resolve(true);
            // }
        });
    },

    initRevisionSelect: function (revisionNames, revisionName) {

        return new Promise((resolve) => {
            // if (!this.revSelect) {
                this.revSelect = $("#" + this.revSelectId).dxSelectBox({
                    dataSource: revisionNames,
                    value: revisionName,
                    displayExpr: "label",
                    valueExpr: "value",
                    placeholder: "Revision...",
                    searchEnabled: true,
                    onInitialized: function (e) {
                        return resolve(true);
                    },
                    onValueChanged: function (data) {
                    }
                }).dxSelectBox("instance");
            // }
            // else {
            //     return resolve(true);
            // }
        });
    },

    onApply: function () {
        let selectedRevId = null;
        let useCurrent = this.useCurrentCB.option("value");
        if (useCurrent === true) {
            //this.selectedRevId = "Current";
            //return;
            selectedRevId = "Current";
        }
        else {
            selectedRevId = this.revSelect.option("value");
        }
        if (selectedRevId === null) {
            return;
        }

        if (this.context.toLowerCase() === "source") {
            DataChangeTemplateForm.setSourceRevision(selectedRevId);
        }
        else if (this.context.toLowerCase() === "target") {
            DataChangeTemplateForm.setTargetRevision(selectedRevId);
        }

        // close this form
        this.useCurrentCB.option("value", false);
        this.datasetTypeSelect.option("value", null);
        this.datasetNameSelect.option("value", null);
        this.revSelect.option("value", null);
        this.close();
    },

    registerOnclick: function (eleId, callback) {
        document.getElementById(eleId).onclick = function () {
            callback();
        };
    },
}