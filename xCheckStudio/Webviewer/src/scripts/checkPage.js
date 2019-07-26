let model = {
  selectedTab: [],
  numTabs: 0,
  tabs: {
    1:{
      id:"tab1",
      name: ""
    },
    2:{
      id:"tab1",
      name: ""
    },
    3:{
      id:"tab1",
      name: ""
    },
    4:{
      id:"tab1",
      name: ""
    }
  }
}

let controller = {
  init: function(){
  },
  setNewTab: function(){
    
  }
}

let viewTabs = {
  init: function(){
    let
  },
  setNewTab: function(){

  }
}


let viewsSlider = {
  init: function() {
    let slider = document.getElementById("resize");
    let table = document.getElementById("tableData");

    slider.addEventListener("input", function(){
      table.style.width = `calc(${slider.value}%)`;
      console.log(table.offsetWidth);
      console.log()
    })

  }
}

viewsSlider.init();
