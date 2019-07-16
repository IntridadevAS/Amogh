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

        // create configuration button click
        var createConfigurationButton = document.getElementById("createConfigurationButton");
        createConfigurationButton.onclick = function()
        {
            _this.OnCreateConfigurationClicked();
        }

         // manage configuration button click
         var manageConfigurationButton = document.getElementById("manageConfigurationButton");
         manageConfigurationButton.onclick = function()
         {
            _this.OnManageConfigurationClicked();
         }       
    }

    PREPManager.prototype.OnCreateConfigurationClicked = function () {               
        window.open("createConfiguration.html");        
    }

    PREPManager.prototype.OnManageConfigurationClicked = function () {               
        alert("Manage configuration clicked.")
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