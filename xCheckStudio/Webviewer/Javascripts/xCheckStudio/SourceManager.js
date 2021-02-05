var SourceManagers = {};

function SourceManager(id, sourceName, sourceType) {
    this.Id = id;
    this.SourceName = sourceName;
    this.SourceType = sourceType;

    this.SourceProperties = {};
    this.ModelTree = undefined;

    // group view controls
    this.GroupTemplateSelect = null;
    this.GroupHighlightTypeSelect = null;
    this.HighlightSelectionBtn = null;
    this.GroupDatabaseViewBtn = null;
    this.TableGroupHeaderName = null;

    // virtual function
    SourceManager.prototype.GetViewerContainerID = function () {
    };

    SourceManager.prototype.GetModelBrowser = function () {
        return this.ModelTree;
    }

    SourceManager.prototype.GetAllComponents = function () {
        return this.SourceProperties;
    }
    
    // virtual function
    SourceManager.prototype.Is3DSource = function () {
        return false;
    };

    // virtual function
    SourceManager.prototype.Is1DSource = function () {
        return false;
    };

    // virtual function
    SourceManager.prototype.IsSVGSource = function () {
        return false;
    };

    // virtual function
    SourceManager.prototype.ResizeViewer = function () {
    }

    SourceManager.prototype.GetComponentsTableName = function (nodeId) {
        if (this.Id === "a") {
            return GlobalConstants.SourceAComponentsTable;
        }
        else if (this.Id === "b") {
            return GlobalConstants.SourceBComponentsTable;
        }
        else if (this.Id === "c") {
            return GlobalConstants.SourceCComponentsTable;
        }
        else if (this.Id === "d") {
            return GlobalConstants.SourceDComponentsTable;
        }
    }

    SourceManager.prototype.GetPropertiesTableName = function (nodeId) {
        if (this.Id === "a") {
            return "SourceAProperties"
        }
        else if (this.Id === "b") {
            return "SourceBProperties"
        }
        else if (this.Id === "c") {
            return "SourceCProperties"
        }
        else if (this.Id === "d") {
            return "SourceDProperties"
        }
    }

    SourceManager.prototype.GetAllSourceProperties = function () {
        return [];
    }

    SourceManager.prototype.ShowGroupViewControls = function (show) {
        //this.GroupTemplateSelect.option("visible", show);
        //this.GroupHighlightTypeSelect.option("visible", show);
        if (show) {
            //this.HighlightSelectionBtn.style.display = "block";
            //this.GroupDatabaseViewBtn.style.display = "block";
            this.TableGroupHeaderName.style.display = "block";
        }
        else {
            //this.HighlightSelectionBtn.style.display = "none";
            //this.GroupDatabaseViewBtn.style.display = "none";
            this.TableGroupHeaderName.style.display = "none";
        }

        this.GroupTemplateSelect.option("value", null);
    }
}

