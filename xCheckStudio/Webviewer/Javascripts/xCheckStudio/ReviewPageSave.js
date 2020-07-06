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
}