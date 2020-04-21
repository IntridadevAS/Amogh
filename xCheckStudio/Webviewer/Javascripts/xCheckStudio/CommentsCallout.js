function CommentsCallout() {
}

CommentsCallout.prototype.Init = function () {
    var _this = this;

    document.getElementById("commentsCalloutBtn").onclick = function () {
        if (this.classList.contains("commentsCalloutOpen")) {
            _this.Close();
        }
        else {
            _this.Open();
        }
    }

    // set checkspace name
    var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));    
    var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));
    document.getElementById("commentsCalloutNameBar").children[0].innerText = projectinfo.projectname + " / " + checkinfo.checkname;

    // Make container visible while creating tabs to
    // avoid issue with size of tabpanel
    var element = document.getElementById("commentsCalloutContainer");
    element.setAttribute('style', 'display:block !important');

    $("#commentsCalloutContainer").dxTabPanel({
        dataSource: [
            { title: "Comments", template: "tab1" },
            { title: "Notifications", template: "tab2" }
        ],
        deferRendering: false
    });

    element.setAttribute('style', 'display:none !important');

    // create comment input
    $("#commentsCalloutCommentInput").dxTextArea({
        height: "60px",
        onChange: function (e) {          
        }
    });

    document.getElementById("commentsCalloutAddCommentBtn").onclick = function () {      
        var commentInput = $('#commentsCalloutCommentInput').dxTextArea('instance');
        var value = commentInput.option('value');
        commentInput.reset();
        if (!value || value === "") {
            return;
        }

        _this.ProcessComment(value).then(function (commentData) {
            if (!commentData) {
                return;
            }

            _this.ShowComment(commentData);
        });
    }
}

CommentsCallout.prototype.Open = function ()
{
    if (openCallout) {
        openCallout.Close();
    }
    openCallout = this;

    document.getElementById("commentsCalloutBtn").classList.add("commentsCalloutOpen");            
            
    var element = document.getElementById("commentsCalloutContainer");
    element.setAttribute('style', 'display:block !important');

    document.getElementById("commentsCalloutNameBar").style.display = "block";

    var containerId = model.currentTabId;
    if (!containerId) {
        containerId = "a";
    }
    var propertyCalloutContainera = document.getElementById("propertyCalloutContainer" + containerId);
    propertyCalloutContainera.setAttribute('style', 'display:block !important');
    var rect = propertyCalloutContainera.getBoundingClientRect();
    propertyCalloutContainera.setAttribute('style', 'display:none !important');
   
    element.style.width = rect.width + "px";
    element.style.height = rect.height + "px";         
    document.getElementById("commentsCalloutNameBar").style.width = rect.width + "px";    
}

CommentsCallout.prototype.Close = function () {
    openCallout = undefined;

    document.getElementById("commentsCalloutBtn").classList.remove("commentsCalloutOpen");

    var element = document.getElementById("commentsCalloutContainer");
    element.setAttribute('style', 'display:none !important');

    document.getElementById("commentsCalloutNameBar").style.display = "none";
}

CommentsCallout.prototype.ProcessComment = function (value) {
    var _this = this;         
    return new Promise((resolve) => {

        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        //create comment data
        var commentData = {};
        commentData["value"] = value;

        // get user info 
        var userinfo = JSON.parse(localStorage.getItem('userinfo'));
        commentData["user"] = userinfo.alias;

        // var date = new Date();
        commentData["date"] = ReferenceManager.getCurrentDate();

        // add reference
        $.ajax({
            url: 'PHP/AddComment.php',
            type: "POST",
            async: true,
            data: { 
                'commentData': JSON.stringify(commentData),
                'projectName': projectinfo.projectname,
                'checkName': checkinfo.checkname
            },
            success: function (msg) {
                if (msg != 'fail') {
                    var commentData = JSON.parse(msg);

                    return resolve(commentData);
                }

                return resolve(undefined);
            }
        });
    });
  
}

CommentsCallout.prototype.ShowComment = function (commentData) {  

    var commentsArea = document.getElementById("commentsCalloutCommentsArea");

    var card = document.createElement("Div");
    card.className = "commentCard";

    var dataContainer = document.createElement("Div");
    dataContainer.className = "commentContainer";

    var commentorDiv = document.createElement("div");
    commentorDiv.textContent = commentData.user;
    commentorDiv.style.fontSize = "10px";
    commentorDiv.style.textAlign = "right";
    dataContainer.appendChild(commentorDiv);

    var commentDiv = document.createElement("div");
    commentDiv.textContent = commentData.value;
    commentDiv.style.fontSize = "11px";
    dataContainer.appendChild(commentDiv);

    var timeDiv = document.createElement("div");
    timeDiv.textContent = commentData.date;
    timeDiv.style.fontSize = "10px";
    timeDiv.style.textAlign = "right";
    dataContainer.appendChild(timeDiv);
    card.appendChild(dataContainer);

    commentsArea.appendChild(card);

    // scroll to bottom
    commentsArea.scrollTop = commentsArea.scrollHeight;

    card.onclick = function () {
        
    }

    card.ondblclick = function () {           
    }

    card.onmouseover = function () {
        ReferenceManager.Highlight(this);
    }

    card.onmouseout = function () {
        ReferenceManager.UnHighlight(this);
    }
}