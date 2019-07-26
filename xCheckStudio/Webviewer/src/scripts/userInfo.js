
let userInformation = {
  init: function(){
    cookieInfo = document.cookie;
    let splitCookies = cookieInfo.split('; ');
    for (cookie of splitCookies) {
      let key = cookie.split('=')[0];
      let value = cookie.split('=')[1];
      userInformation[key] = value
    }
  }
}

userInformation.init();
