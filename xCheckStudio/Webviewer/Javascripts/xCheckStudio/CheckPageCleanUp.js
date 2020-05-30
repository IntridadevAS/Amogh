const CheckPageCleanUp = {
    onLeavingPage: function () {
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
            CheckModule.onSaveProgress(true).then(function (result) {
                if (result) {
                    CheckPageCleanUp.onLeavingPage().then(function (res) {
                        return resolve(true);
                    });
                }
                {
                    return resolve(false);
                }
            });
        });
    },

    onLeavingVault: function () {
        return new Promise((resolve) => {
            // clean up all temporary files and variables
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));

            $.ajax({
                url: 'PHP/DataVault.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "ClearTempVaultData",
                    'ProjectName': projectinfo.projectname
                },
                success: function (msg) {
                    return resolve(true);
                }
            });
        });
    }
}