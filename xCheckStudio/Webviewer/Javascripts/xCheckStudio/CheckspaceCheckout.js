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
    }
}