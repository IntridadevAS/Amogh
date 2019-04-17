function loaded()
{
	var lang = getParameterValue("lang");
	if (lang != "") String.locale = lang;

	localizeHTMLTag("checkAll1");
	localizeHTMLTag("compliance1");
	localizeHTMLTag("infoproperties3Key1");
	localizeHTMLTag("comparisonSW");
	localizeHTMLTag("loadDataA");
	localizeHTMLTag("loadDataB");
	localizeHTMLTag("datagraphics");
	localizeHTMLTag("headercheck");
	localizeHTMLTag("dataSource1ModelBrowserTab");
	localizeHTMLTag("dataSource2ModelBrowserTab");
	localizeHTMLTag("dataSource1ViewerContainerTab");
	localizeHTMLTag("dataSource2ViewerContainerTab");
	localizeHTMLTag("checkcaseid");
	localizeHTMLTag("projectnameid");
	localizeHTMLTag("unitselection");
	localizeHTMLTag("customunit");
	localizeHTMLTag("metricunit");
	localizeHTMLTag("imperialunit");
	localizeHTMLTag("username");
	localizeHTMLTag("browsetoloadData");
	localizeHTMLTag("browse1");
	localizeHTMLTag("connecttodatasource");
	localizeHTMLTag("moresources");

}


/* Some helper functions: */

var _ = function (string) {
	return string.toLocaleString();
};

function localizeHTMLTag(tagId)
{
	tag = document.getElementById(tagId);
	tag.innerHTML = _(tag.innerHTML.trim());

}

function getParameterValue(parameter)
{
	parameter = parameter.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + parameter + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if(results == null)
		return "";
	else
		return results[1];
}

// window.onload = loaded();