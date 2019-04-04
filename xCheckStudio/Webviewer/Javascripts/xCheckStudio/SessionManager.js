function setSessionVariable(variableName, variableValue) {
    $.ajax({
        data: { 'variableName': variableName , 'variableValue': variableValue },
        type: "POST",
        url: "PHP/setSessionVariable.php"
    }).done(function (msg) {
        if (msg !== 'success') {
           // alert('Session variable set successfully.')
        }
    });
}