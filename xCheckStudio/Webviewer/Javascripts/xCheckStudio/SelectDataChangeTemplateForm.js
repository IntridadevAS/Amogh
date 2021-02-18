let SelectDataChangeTemplateForm = {
    formId: "selectDataChangeTemplateForm",
    captionBarId: "selectDataChangeTemplateFormCaptionBar",
    nameBoxId: "selectDataChangeTemplateNameBox",
    applyBtnId: "selectDataChangeTemplateFormApplyBtn",
    closeBtnId: "selectDataChangeTemplateFormCloseBtn",
    templateSelectId: "selectDataChangeTemplatesDL",
    active: false,
    templateSelect: null,

    getFormElement: function () {
        return document.getElementById(SelectDataChangeTemplateForm.formId);
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

        SelectDataChangeTemplateForm.active = true;

        // block ui elements
        document.getElementById("uiBlockingOverlay").style.display = "block";

        var form = SelectDataChangeTemplateForm.getFormElement();
        form.style.display = "block";
        form.style.top = "calc( 50% - 141px)";    
        form.style.left = "calc( 50% - 225px)"; 

        // Make the DIV element draggable:
        xCheckStudio.Util.dragElement(form,
            document.getElementById(SelectDataChangeTemplateForm.captionBarId));

            SelectDataChangeTemplateForm.init();
    },

    close: function () {
        SelectDataChangeTemplateForm.active = false;

        // unblock ui elements
        document.getElementById("uiBlockingOverlay").style.display = "none";

        var form = SelectDataChangeTemplateForm.getFormElement();
        form.style.display = "none";

    },

    init: function () {
        // var _this = this;
        this.populateTemplates();

        // Init controsl
        // apply btn
        SelectDataChangeTemplateForm.registerOnclick(SelectDataChangeTemplateForm.applyBtnId, function () {
            SelectDataChangeTemplateForm.onApply();
        });

        // on close
        SelectDataChangeTemplateForm.registerOnclick(SelectDataChangeTemplateForm.closeBtnId, function () {
            SelectDataChangeTemplateForm.close();
        });
    },

    registerOnclick: function (eleId, callback) {
        document.getElementById(eleId).onclick = function () {
            callback();
        };
    },

    onApply: function () {
        _this = this;
    if (this.templateSelect) {
        var selectedDataChangeHighlight = this.templateSelect.option("value");
    
    var dataChangeHighlightTemplates = model.dataChangeHighlightTemplates;
        if (selectedDataChangeHighlight in dataChangeHighlightTemplates) {
            var groupingProperties = model.dataChangeHighlightTemplates[selectedDataChangeHighlight].properties;
        }
        model.views[model.currentTabId].groupView.Show(GlobalConstants.GroupView.DataChangeHighlight,selectedDataChangeHighlight);

        model.views[model.currentTabId].activeTableView = GlobalConstants.TableView.Group;
        var sourceManager = SourceManagers[model.currentTabId];
        sourceManager.ShowGroupViewControls(true);
        model.views[model.currentTabId].groupView.ActiveGroupViewType = GlobalConstants.GroupView.DataChangeHighlight;
        model.views[model.currentTabId].groupView.OnGroupTemplateChanged(selectedDataChangeHighlight);

    }

        
    },

    populateTemplates: function () {
        var allTemplates = [];

        // let currentSourceType = SourceManagers[model.currentTabId].SourceType.toLowerCase();
        for (var templateName in model.dataChangeHighlightTemplates) {
            // let template = model.dataChangeHighlightTemplates[templateName];
            // if (template["dataSourceType"].toLowerCase() !== currentSourceType.toLowerCase()) {
            //     continue;
            // }

            allTemplates.push(templateName);
        }

        this.templateSelect = $("#" + SelectDataChangeTemplateForm.templateSelectId).dxSelectBox({
            items: allTemplates,
        }).dxSelectBox("instance");
    },

    setTemplateSelectValue: function (value) {
        this.templateSelect.option("value", value);
    },
}