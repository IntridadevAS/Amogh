var SourceManagers = {};

function SourceManager(sourceName, sourceType)
{
    this.SourceName = sourceName;  
    this.SourceType = sourceType;  
    // this.IsFirstViewer = isFirstViewer;
    this.SourceProperties = {};
    this.ModelTree = undefined;

    // // virtual function
    // SourceManager.prototype.LoadData = function(selectedComponents) {    
    //     return new Promise((resolve) => {
    //         return resolve(true);
    //     });
    // }; 

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

    // // virtual function
    // SourceManager.prototype.Is1DSource = function () {
    //     return false;
    // }; 

     // virtual function
    SourceManager.prototype.ResizeViewer = function () {
    }
}

