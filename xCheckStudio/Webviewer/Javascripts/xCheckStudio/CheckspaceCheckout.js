let CheckspaceCheckout = {

    checkout: function (projName, checkId, userId) {
        return new Promise((resolve) => {
            $.ajax({
                data: {
                    'InvokeFunction': 'CheckoutCheckspace',
                    'projectName': projName,
                    'checkId': checkId,
                    'userId': userId
                },
                type: "POST",
                url: "PHP/CheckSpaceManager.php"
            }).done(function (msg) {
                var object = xCheckStudio.Util.tryJsonParse(msg);
                return resolve(object);
            });
        });
    },

    checkinCheckspace: function () {
        return new Promise((resolve) => {
            var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
            var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
            if (!projectinfo ||
                !checkinfo) {
                return resolve(true);
            }
            
            $.ajax({
                url: 'PHP/CheckSpaceManager.php',
                type: "POST",
                async: false,
                data:
                {
                    'InvokeFunction': "CheckinCheckspace",
                    'projectName': projectinfo.projectname,
                    'checkId': checkinfo.checkid
                },
                success: function (msg) {
                    return resolve(true);
                }
            });
        });
    },
}