var ReviewModule = {
    onSaveProgress: function (silent) {

        return new Promise((resolve) => {
            // show busy spinner        
            showBusyIndicator();

            // create project DB
            this.createCheckSpaceDBonSave().then(function (result) {
                if (!result) {
                    // remove busy spinner        
                    hideBusyIndicator();
                    return resolve(false);
                }

                ReviewModule.saveAll().then(function (res) {
                    if (!res) {
                        // remove busy spinner        
                        hideBusyIndicator();
                        return resolve(false);
                    }

                    if (!silent) {
                        alert("Saved project information.");
                    }

                    // remove busy spinner        
                    hideBusyIndicator();
                    return resolve(true);
                });
            });
        });

    },

    saveAll: function () {
        return new Promise((resolve) => {
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
                    'CheckName': checkinfo.checkname
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

    createCheckSpaceDBonSave: function () {
        return new Promise((resolve) => {
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            $.ajax({
                url: 'PHP/ProjectManager.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "CreateCheckSpaceDBonSave",
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname
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