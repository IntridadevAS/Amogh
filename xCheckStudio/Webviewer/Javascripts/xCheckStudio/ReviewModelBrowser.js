function ReviewModelBrowser(id, sourceFileName)
{
    this.Id = id;
    this.SourceFileName = sourceFileName;
}

ReviewModelBrowser.prototype.Is1D = function () {
    return false;
}

ReviewModelBrowser.prototype.Is3D = function () {
    return false;
}

ReviewModelBrowser.prototype.IsVisio = function () {
    return false;
}