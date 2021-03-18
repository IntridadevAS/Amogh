const {remote} = require('electron');
const fs = remote.require('fs');
const Path = require('path');

module.exports = {        
    //note that I would be calling fs functions in here, but I never get that far because the error happens on remote.require('fs')
    determineFiletype: function(currentDirectory, fileName){}
}