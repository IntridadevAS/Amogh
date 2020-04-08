var SourceManagers = {};

function SourceManager(id, sourceName, sourceType)
{
    this.Id = id;
    this.SourceName = sourceName;  
    this.SourceType = sourceType;  
    
    this.SourceProperties = {};
    this.ModelTree = undefined;
   
    // virtual function
    SourceManager.prototype.GetViewerContainerID = function () {
    }; 

    SourceManager.prototype.GetModelBrowser = function () {
        return this.ModelTree;
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
}

