function contextMenuComponentLevel() {
    $("#SourceAComplianceMainReviewTbody").contextMenu({
        className : 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
        build : function($triggerElement, e){ 
            var selectedRow = $triggerElement;
            var accept = true;
            accept = chooseAction(selectedRow);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            return {
                callback: function(key, options){
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    menuItem: 
                    {
                        name: conditionalName,
                        disabled: function()
                        {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                    "reference": {
                        name: "Reference",
                    }
                }
            };
        }
    });

    $("#SourceBComplianceMainReviewTbody").contextMenu({
        className : 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
        build : function($triggerElement, e){ 
            var selectedRow = $triggerElement;
            var accept = true;
            accept = chooseAction(selectedRow);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            return {
                callback: function(key, options){
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    menuItem: 
                    {
                        name: conditionalName,
                        disabled: function()
                        {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                    "reference": {
                        name: "Reference",
                    }
                }
            };
        }
    });

    $("#ComparisonMainReviewTbody").contextMenu({
        className : 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
        build : function($triggerElement, e){ 
            var selectedRow = $triggerElement;
            var accept = true;
            var transpose = true;
            transpose = chooseRestoreTranspose(selectedRow);
            accept = chooseAction(selectedRow);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            var transposeconditionalName = (transpose) ? 'Transpose' : 'Restore';
            return {
                callback: function(key, options){
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    menuItem: 
                    {
                        name: conditionalName,
                        disabled: function()
                        {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                    menuItem1: {
                        name: transposeconditionalName,
                        disabled: function()
                        {
                            var disable = false;
                            disable = disableContextMenuTranspose(this);
                            return disable;
                        },
                        visible : function(){
                            if(transposeconditionalName == 'Restore') 
                            {
                                return false;
                            } else {
                                return true;
                            }
                        },
                        items : {
                            "lefttoright" : {name : "Left To Right"},
                            "righttoleft" : {name : "Right To Left"}
                        }
                    },
                    menuItem2 : {
                        name: transposeconditionalName,
                        visible : function(){if(transposeconditionalName == 'Restore') {return true;} else {return false;}},
                    },
                    "reference": {
                        name: "Reference",
                    }
                }
            };
        }
    });
}

function contextMenuPropertyLevel() {
    $("#ComparisonDetailedReviewTbody").contextMenu({
        className : 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
        build : function($triggerElement, e){ 
            var selectedRow = $triggerElement;
            var accept = true;
            var transpose = true;
            transpose = chooseRestoreTranspose(selectedRow);
            accept = chooseAction(selectedRow);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            var transposeconditionalName = (transpose) ? 'Transpose' : 'Restore';
            return {
                callback: function(key, options){
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    menuItem: 
                    {
                        name: conditionalName,
                        disabled: function()
                        {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                    menuItem1: {
                        name: transposeconditionalName,
                        disabled: function()
                        {
                            var disable = false;
                            disable = disableContextMenuTranspose(this);
                            return disable;
                        },
                        visible : function(){
                            if(transposeconditionalName == 'Restore') 
                            {
                                return false;
                            } else {
                                return true;
                            }
                        },
                        items : {
                            "lefttoright" : {name : "Left To Right"},
                            "righttoleft" : {name : "Right To Left"}
                        }
                    },
                    menuItem2 : {
                        name: transposeconditionalName,
                        visible : function(){if(transposeconditionalName == 'Restore') {return true;} else {return false;}},
                    }
                }
            };
        }
    });

    $("#ComplianceADetailedReviewTbody").contextMenu({
        className : 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
        build : function($triggerElement, e){ 
            var selectedRow = $triggerElement;
            var accept = true;
            accept = chooseAction(selectedRow);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            return {
                callback: function(key, options){
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    menuItem: 
                    {
                        name: conditionalName,
                        disabled: function()
                        {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                }
            };
        }
    });

    $("#ComplianceBDetailedReviewTbody").contextMenu({
        className : 'contextMenu_style',
        selector: '.jsgrid-row, .jsgrid-alt-row',
        build : function($triggerElement, e){ 
            var selectedRow = $triggerElement;
            var accept = true;
            accept = chooseAction(selectedRow);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            return {
                callback: function(key, options){
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    menuItem: 
                    {
                        name: conditionalName,
                        disabled: function()
                        {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                }
            };
        }
    });
}

function contextMenuCategoryLevel() {
    $("#SourceBComplianceMainReviewTbody").contextMenu({
        className : 'contextMenu_style',
        selector: 'BUTTON',
        build : function($triggerElement, e){ 
            var selectedRow = $triggerElement;
            var accept = true;
            accept = chooseAction(selectedRow);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            return {
                callback: function(key, options){
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    menuItem: 
                    {
                        name: conditionalName,
                        disabled: function()
                        {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                }
            };
        }
    });

    $("#SourceAComplianceMainReviewTbody").contextMenu({
        className : 'contextMenu_style',
        selector: 'BUTTON',
        build : function($triggerElement, e){ 
            var selectedRow = $triggerElement;
            var accept = true;
            accept = chooseAction(selectedRow);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            return {
                callback: function(key, options){
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    menuItem: 
                    {
                        name: conditionalName,
                        disabled: function()
                        {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                }
            };
        }
    });

    $("#ComparisonMainReviewTbody").contextMenu({
        className : 'contextMenu_style',
        selector: 'BUTTON',
        build : function($triggerElement, e){ 
            var selectedRow = $triggerElement;
            var accept = true;
            var transpose = true;
            transpose = chooseRestoreTranspose(selectedRow);
            accept = chooseAction(selectedRow);
            var conditionalName = (accept) ? 'Accept' : 'Unaccept';
            var transposeconditionalName = (transpose) ? 'Transpose' : 'Restore';
            return {
                callback: function(key, options){
                    executeContextMenuClicked(key, options, this);
                },
                items: {
                    menuItem: 
                    {
                        name: conditionalName,
                        disabled: function()
                        {
                            var disable = false;
                            disable = disableContextMenuAccept(this);
                            return disable;
                        }
                    },
                    menuItem1: {
                        name: transposeconditionalName,
                        disabled: function()
                        {
                            var disable = false;
                            disable = disableContextMenuTranspose(this);
                            return disable;
                        },
                        visible : function(){
                            if(transposeconditionalName == 'Restore') 
                            {
                                return false;
                            } else {
                                return true;
                            }
                        },
                        items : {
                            "lefttoright" : {name : "Left To Right"},
                            "righttoleft" : {name : "Right To Left"}
                        }
                    },
                    menuItem2 : {
                        name: transposeconditionalName,
                        visible : function(){if(transposeconditionalName == 'Restore') {return true;} else {return false;}},
                    }
                }
            };
        }
    });
}
