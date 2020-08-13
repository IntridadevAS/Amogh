var checkCaseManager;
function CheckCaseManager() {
    this.CheckCase;

    CheckCaseManager.prototype.readCheckCaseData = function (fileName) {
        var _this = this;
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "PHP/ReadCheckCaseXml.php", true);
        xhr.onload = function (data) {           
            _this.CheckCase = JSON.parse(data.currentTarget.responseText);
           
            // write check case data to DB
            $.ajax({
                data: {
                    'InvokeFunction': "SaveCheckCaseData",
                    "CheckCaseManager": JSON.stringify(_this),
                    "ProjectName": projectinfo.projectname,
                    "CheckName": checkinfo.checkname
                },
                async: false,
                type: "POST",
                url: "PHP/ProjectManager.php"
            }).done(function (msg) {   
               
            });
        };
        var formData = new FormData();
        formData.append('XMLFileName', fileName);
        xhr.send(formData);

    }

    CheckCaseManager.prototype.onCheckCaseDataReadComplete = function () {
     
    }   
}




function CheckCase(name/*, complianceCheck*/) {
    this.Name = name;
    //this.ComplianceCheck = complianceCheck;

    this.CheckTypes = [];

    CheckCase.prototype.addCheckType = function (checkType) {
        this.CheckTypes.push(checkType);
    }

    CheckCase.prototype.checkTypeExists = function (checkTypeName) {
        for (var i = 0; i < this.CheckTypes.length; i++) {
            if (this.CheckTypes[i].Name === checkTypeName) {
                return true;
            }
        }

        return false;
    }

    CheckCase.prototype.getCheckType = function (checkTypeName) {
        for (var i = 0; i < this.CheckTypes.length; i++) {
            if (this.CheckTypes[i].Name === checkTypeName) {
                return this.CheckTypes[i];
            }
        }

        return undefined;
    }

    CheckCase.prototype.getCheckTypeFromSourceType = function (checktypecomliance, sourceType) {
        for (var i = 0; i < this.CheckTypes.length; i++) {
            if (this.CheckTypes[i].SourceAType.toLowerCase() === sourceType) {
                if(checktypecomliance && this.CheckTypes[i].Name !== "Comparison")
                    return this.CheckTypes[i];
                else
                    continue;
            }
        }

        return undefined;
    }
}

function CheckType(name,
    sourceAType,
    sourceBType) {
    this.Name = name;
    this.SourceAType = sourceAType;
    this.SourceBType = sourceBType;

    this.ComponentGroups = [];

    CheckType.prototype.addComponentGroup = function (componentGroup) {
        this.ComponentGroups.push(componentGroup);
    }

    CheckType.prototype.componentGroupExists = function (sourceAGroupName, sourceBGroupName) {
        for (var i = 0; i < this.ComponentGroups.length; i++) {
            // check for source A only
            if (sourceBGroupName === undefined &&
                this.ComponentGroups[i].SourceAName.toLowerCase() === sourceAGroupName.toLowerCase()) {
                return true;
            }

            // check for source B only
            if (sourceAGroupName === undefined &&
                this.ComponentGroups[i].SourceBName.toLowerCase() === sourceBGroupName.toLowerCase()) {
                return true;
            }


            // check for both sources
            if (this.ComponentGroups[i].SourceAName.toLowerCase() === sourceAGroupName.toLowerCase() &&
                this.ComponentGroups[i].SourceBName.toLowerCase() === sourceBGroupName.toLowerCase()) {
                return true;
            }
        }

        return false;
    }

    CheckType.prototype.getComponentGroup = function (sourceAGroupName, sourceBGroupName) {
        for (var i = 0; i < this.ComponentGroups.length; i++) {

            // check for source A only
            if (sourceBGroupName === undefined &&
                this.ComponentGroups[i].SourceAName.toLowerCase() === sourceAGroupName.toLowerCase()) {
                return this.ComponentGroups[i];
            }

            // check for source B only
            if (sourceAGroupName === undefined &&
                this.ComponentGroups[i].SourceBName.toLowerCase() === sourceBGroupName.toLowerCase()) {
                return this.ComponentGroups[i];
            }

            // check for both sources
            if (this.ComponentGroups[i].SourceAName.toLowerCase() === sourceAGroupName.toLowerCase() &&
                this.ComponentGroups[i].SourceBName.toLowerCase() === sourceBGroupName.toLowerCase()) {
                return this.ComponentGroups[i];
            }
        }

        return undefined;
    }
}

function CheckCaseComponentGroup(sourceAName, sourceBName) {
    //this.Name = name;
    this.SourceAName = sourceAName;
    this.SourceBName = sourceBName;

    this.ComponentClasses = [];

    CheckCaseComponentGroup.prototype.addComponent = function (componentClass) {
        this.ComponentClasses.push(componentClass);
    }

    CheckCaseComponentGroup.prototype.componentClassExists = function (sourceAClassName, sourceBClassName) {
        for (var i = 0; i < this.ComponentClasses.length; i++) {
            if (sourceAClassName === undefined &&
                sourceBClassName !== undefined &&
                this.ComponentClasses[i].SourceBName.toLowerCase() === sourceBClassName.toLowerCase()) {
                return true;
            }
            
            if (sourceBClassName === undefined &&
                sourceAClassName !== undefined &&
                this.ComponentClasses[i].SourceAName.toLowerCase() === sourceAClassName.toLowerCase()) {
                return true;
            }

            if (sourceAClassName !== undefined &&
                sourceBClassName !== undefined &&
                this.ComponentClasses[i].SourceAName.toLowerCase() === sourceAClassName.toLowerCase() &&
                this.ComponentClasses[i].SourceBName.toLowerCase() === sourceBClassName.toLowerCase()) {
                return true;
            }
        }

        return false;
    }

    CheckCaseComponentGroup.prototype.getComponentClass = function (sourceAClassName, sourceBClassName) {
        for (var i = 0; i < this.ComponentClasses.length; i++) {

            if (sourceBClassName === undefined &&
                this.ComponentClasses[i].SourceAName.toLowerCase() === sourceAClassName.toLowerCase()) {
                return this.ComponentClasses[i];
            }

            if (sourceAClassName !== undefined &&
                sourceBClassName !== undefined &&
                this.ComponentClasses[i].SourceAName.toLowerCase() === sourceAClassName.toLowerCase() &&
                this.ComponentClasses[i].SourceBName.toLowerCase() === sourceBClassName.toLowerCase()) {
                return this.ComponentClasses[i];
            }
        }

        return undefined;
    }
}
