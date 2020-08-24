const ReviewPageCleanUp = {
    onLeavingPage: function (checkinChckspace = true) {
        return new Promise((resolve) => {
            let allPromises = [];

            // clean up all temporary files and variables
            allPromises.push(ReviewPageCleanUp.cleanTempFilesAndVars());

            // checkin back the checkspace
            if (checkinChckspace === true) {
                allPromises.push(CheckspaceCheckout.checkinCheckspace());
            }

            xCheckStudio.Util.waitUntilAllPromises(allPromises).then(function (res) {
                return resolve(true);
            });

            // // clean up all temporary files and variables
            // var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            // var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            // $.ajax({
            //     url: 'PHP/ProjectManager.php',
            //     type: "POST",
            //     async: false,
            //     data:
            //     {
            //         'InvokeFunction': "ClearTemporaryCheckSpaceDB",
            //         'ProjectName': projectinfo.projectname,
            //         'CheckName': checkinfo.checkname,
            //         'ProjectId': checkinfo.projectid
            //     },
            //     success: function (msg) {
            //         return resolve(true);
            //     }
            // });
        });
    },

    // checkinCheckspace: function () {
    //     return new Promise((resolve) => {
    //         var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
    //         var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

    //         $.ajax({
    //             url: 'PHP/CheckSpaceManager.php',
    //             type: "POST",
    //             async: false,
    //             data:
    //             {
    //                 'InvokeFunction': "CheckinCheckspace",
    //                 'projectName': projectinfo.projectname,
    //                 'checkId': checkinfo.checkid
    //             },
    //             success: function (msg) {
    //                 return resolve(true);
    //             }
    //         });
    //     });
    // },

    cleanTempFilesAndVars: function () {
        return new Promise((resolve) => {
            // clean up all temporary files and variables
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

            $.ajax({
                url: 'PHP/ProjectManager.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "ClearTemporaryCheckSpaceDB",
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname,
                    'ProjectId': checkinfo.projectid
                },
                success: function (msg) {
                    return resolve(true);
                }
            });
        });
    },

    onSaveAndLeavePage: function () {
        return new Promise((resolve) => {
            ReviewModule.onSaveProgress(true).then(function (result) {
                if (result) {
                    ReviewPageCleanUp.onLeavingPage(true).then(function (res) {
                        return resolve(true);
                    });
                }
                {
                    return resolve(false);
                }
            });
        });
    }
}