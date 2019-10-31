const CheckPageCleanUp = {
    onLeavingPage: function () {
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
            }
        });
    }
}