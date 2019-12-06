function loadCheckSpaceInReviewPage() {

    return new Promise((resolve) => {
        initCheckSpace().then(function (result) {
            if (!result) {
                return resolve(undefined);
            }

            return resolve(result);
        });
    });
}

function initCheckSpace() {
    return new Promise((resolve) => {       
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
       
        $.ajax({
            data: {
                'InvokeFunction': "InitTempCheckSpaceDB",
                'ProjectName': projectinfo.projectname,
                'CheckName': checkinfo.checkname,
                'Context': "Review"
            },
            async: false,
            type: "POST",
            url: "PHP/ProjectLoadManager.php"
        }).done(function (msg) {
            var message = JSON.parse(msg);

            if (message.MsgCode === 1) {
                return resolve(message);
            }

            return resolve(undefined);
        });
    });
}