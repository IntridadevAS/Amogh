function PREPManager() {
    PREPManager.prototype.Init = function () {
        var _this = this;

        this.SetUserName();

        // manage role button click
        var managerRolesBtn = document.getElementById("manageRolesButton");
        managerRolesBtn.onclick = function()
        {
            _this.OnManageRolesClicked();
        }
    }

    PREPManager.prototype.OnManageRolesClicked = function () {               
        window.open("UserRoles.html");        
    }

    PREPManager.prototype.SetUserName = function () {
        $.ajax({
            data: { 'variable': 'Name' },
            type: "POST",
            url: "PHP/GetSessionVariable.php"
        }).done(function (msg) {
            if (msg !== 'fail') {
                var pierrediv = document.getElementById("pierre");
                if (msg != "" && pierrediv != null)
                    pierrediv.innerHTML = msg;
            }
        });
    }
}