class CheckSpace {
    constructor(checkid, checkname, checkstatus, checkconfiguration, checkdescription, checkcomments, checkisfavourite, checkdate, projectid, userid) {
        this._checkid = checkid;
        this._checkname = checkname;
        this._checkstatus = checkstatus;
        this._checkconfiguration = checkconfiguration;
        this._checkdescription = checkdescription;
        this._checkcomments = checkcomments;
        this._checkisfavourite = checkisfavourite;
        this._checkdate = checkdate;
        this._projectid = projectid;
        this._userid = userid;
    }

    get checkid(){
        return this._checkid;
    }

    set checkid(checkid){
        this._checkid = checkid;
    }

    get checkname(){
        return this._checkname;
    }

    set checkname(checkname){
        this._checkname = checkname;
    }

    get checkstatus(){
        return  this._checkstatus;
    }

    set checkstatus(checkstatus){
        this._checkstatus = checkstatus;
    }

    get checkconfiguration(){
        return this._checkconfiguration;
    }

    set checkconfiguration(checkconfiguration){
        this._checkconfiguration = checkconfiguration;
    }

    get checkdescription(){
        return this._checkdescription;
    }

    set checkdescription(checkdescription){
        this._checkdescription = checkdescription;
    }

    get  checkcomments(){
        return this._checkcomments;
    }

    set checkcomments(checkcomments){
        this._checkcomments = checkcomments;
    }

    get checkisfavourite(){
        return this._checkisfavourite;
    }

    set checkisfavourite(checkisfavourite){
        this._checkisfavourite = checkisfavourite;
    }

    get checkdate(){
        return this._checkdate;
    }

    set checkdate(checkdate){
        this._checkdate = checkdate;
    }


    get projectid(){
        return this._projectid;
    }

    set projectid(projectid){
        this._projectid = projectid;
    }

    get userid(){
        this._userid;
    }
    set userid(userid){
        this._userid = userid;
    }
}