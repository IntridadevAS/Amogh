var ReviewModule = {
    onSaveProgress: function (silent) {

        return new Promise((resolve) => {
            // show busy spinner        
            showBusyIndicator();

            // create project DB
            // this.createCheckSpaceDBonSave().then(function (result) {
            //     if (!result) {
            //         // remove busy spinner        
            //         hideBusyIndicator();
            //         return resolve(false);
            //     }

            ReviewModule.saveAll().then(function (res) {
                if (!res) {
                    // remove busy spinner        
                    hideBusyIndicator();
                    return resolve(false);
                }

                if (!silent) {
                    //showSavedDataPrompt();
                }

                // remove busy spinner        
                hideBusyIndicator();
                return resolve(true);
            });
            // });
        });

    },

    saveAll: function () {
        return new Promise((resolve) => {
            let allComponents = {};
            for (var srcId in checkResults.allComponents) {
                allComponents["AllComponents" + srcId] = JSON.parse(checkResults.allComponents[srcId]);
            }

            // get views and tags
            var viewsAndTags = this.getViewsAndTags();        

            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            $.ajax({
                url: 'PHP/ProjectManager.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "SaveAll",
                    'Context': "review",
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname,
                    "allComponents": JSON.stringify(allComponents),
                    "viewsAndTags": JSON.stringify(viewsAndTags)
                },
                success: function (msg) {
                    if (msg != 'fail') {
                        return resolve(true);
                    }

                    return resolve(false);
                }
            });
        });
    },

    getViewsAndTags: function () {
        // first serialize current active check views
        for (var checkType in model.checks) {
            if (model.checks[checkType].reviewManager) {
                model.checks[checkType].reviewManager.SerializeViewsAndTags();
            }
        }

        let viewsAndTags = {};

        // annotations
        viewsAndTags["annotations"] = {};
        viewsAndTags["annotations"]["comparison"] = {};
        for (var prop in model.annotations["comparison"]) {
            if (!prop.includes("_serialized")) {
                continue;
            }

            viewsAndTags["annotations"]["comparison"][prop] = model.annotations["comparison"][prop];
        }
        viewsAndTags["annotations"]["compliance"] = {};
        for (var prop in model.annotations["compliance"]) {
            if (!prop.includes("_serialized")) {
                continue;
            }

            viewsAndTags["annotations"]["compliance"][prop] = model.annotations["compliance"][prop];
        }

        // bookmarks
        viewsAndTags["bookmarks"] = {};
        viewsAndTags["bookmarks"]["comparison"] = {};
        for (var prop in model.bookmarks["comparison"]) {
            if (!prop.includes("_serialized")) {
                continue;
            }

            viewsAndTags["bookmarks"]["comparison"][prop] = model.bookmarks["comparison"][prop];
        }
        viewsAndTags["bookmarks"]["compliance"] = {};
        for (var prop in model.bookmarks["compliance"]) {
            if (!prop.includes("_serialized")) {
                continue;
            }

            viewsAndTags["bookmarks"]["compliance"][prop] = model.bookmarks["compliance"][prop];
        }


         // bookmarks
         viewsAndTags["markupViews"] = {};
         viewsAndTags["markupViews"]["comparison"] = {};
         for (var prop in model.markupViews["comparison"]) {
             if (!prop.includes("_serialized")) {
                 continue;
             }
 
             viewsAndTags["markupViews"]["comparison"][prop] = model.markupViews["comparison"][prop];
         }
         viewsAndTags["markupViews"]["compliance"] = {};
         for (var prop in model.markupViews["compliance"]) {
             if (!prop.includes("_serialized")) {
                 continue;
             }
 
             viewsAndTags["markupViews"]["compliance"][prop] = model.markupViews["compliance"][prop];
         }
        
        
        return viewsAndTags;
    }
}