var SourceManagers = {};

function SourceManager(sourceType)
{
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
    SourceManager.prototype.IsSCSource = function () {
        return false;
    }; 

   // virtual function
   SourceManager.prototype.IsExcelSource = function () {
        return false;
    }; 

    // virtual function
    SourceManager.prototype.IsDBSource = function () {
        return false;
    }; 
}

