var ContextMenu = {

    init: function () {
        $("#content").contextMenu({
            className: 'contextMenu_style',
            selector: 'div',
            build: function ($triggerElement, e) {
                let selected = e.target.closest('.card');
                if (!selected) {
                    selected = e.target.closest('.checkSpaceFlag');
                }
                if (!selected  ||                
                    selected.classList.contains("newProjectCard") ||                
                    selected.classList.contains("newCheckCardFlag")) {
                    return false;
                }

                // if ((!$triggerElement[0].classList.contains("card") &&
                //     !$triggerElement[0].classList.contains("checkSpaceFlag")) ||                
                //     $triggerElement[0].classList.contains("newProjectCard") ||                
                //     $triggerElement[0].classList.contains("newCheckCardFlag")) {
                //     return false;
                // }                
                return {
                    callback: function (key, options) {
                        ContextMenu.onMenuItemClicked(key, options);
                    },
                    items: {
                        "duplicate": {
                            name: "Duplicate"
                        }
                    }
                };
            }
        });
    },

    onMenuItemClicked: function (key, options) {
        if (key.toLowerCase() === "duplicate") {
            var context = undefined;
            var triggerElement = options.$trigger[0].closest('.card');
            if (triggerElement) {
                context = "project";
            }
            else
            {
                triggerElement =  options.$trigger[0].closest('.checkSpaceFlag');
                if (triggerElement) {
                    context = "checkspace";
                }
            }
            if(!triggerElement || !context)
            {
                return;
            }

            
            ContextMenu.onDuplicateClicked(triggerElement, context);
        }
    },

    onDuplicateClicked: function (triggerElement, context) {
        
        if(context.toLowerCase() === "project")
        {
            controller.projectToCopy = triggerElement.id;
            showDuplicateProjectForm("Duplicate Project");     
        }
        else if(context.toLowerCase() === "checkspace")
        {
            controller.checkSpaceToCopy = triggerElement.id;
            showDuplicateProjectForm("Duplicate CheckSpace");     
        }          
    }
};