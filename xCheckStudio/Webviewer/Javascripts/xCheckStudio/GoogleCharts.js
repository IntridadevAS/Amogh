
// Creates a Line chart for provided data
//data : data in the DataTable Format containing rows and  columns
//title_field : Title Which you want to set for Line Chart
//div : Name of  div block where you want to display this Chart.
dataTable = window.datatbl;
function  drawLineChart(data,title_field,div, colorsArray)
{
    // var options = createOptions(); 
    // document.getElementById(div.id).style.border = "solid 2px black"; 
    var options = {
        isStacked: true,
     };  
    options.title = title_field; 
    options.colors = colorsArray;
    options.pointSize = 10;
    options.series= {
        0: { },
        1: { },
        2: {lineDashStyle: [4, 2]  }
      },
    // options.chartArea={left:"5%",top:"10%",width:'100%',height:'100%'}
    options.legend = "none";
    // if(div.id !== undefined)
    //     {
            LineChart = new google.visualization.LineChart(document.getElementById(div));  
        // }
        // else{
        //     LineChart = new google.visualization.LineChart(document.getElementById(div.ma.id));  
        // }
    
    LineChart.draw(data, options);
}

// Creates a Pie chart for provided data
//data : data in the DataTable Format containing rows and  columns
//title_field : Title Which you want to set for Pie Chart
//div : Name of  div block where you want to display this Chart.
function  drawPieChart(data,title_field,div, colorsArray)
{
    var options = {
       isStacked: true,
       height: 180,
       width: 180
    };  
    // document.getElementById(div.id).style.border = "solid 2px black"; 
    options.title = title_field; 
    options.pieHole= 0.55;
    options.colors = colorsArray;
    options.legend = "none";
    // options.backgroundColor= "#F4F4F4";
    options.pieSliceText="none";
    options.chartArea={left:"2.5%",top:"2.5%",width:'95%',height:'95%'}
    pieChart = new google.visualization.PieChart(document.getElementById(div.id));   
    
    pieChart.draw(data, options);    
}

// Creates a Bar chart for provided data
//data : data in the DataTable Format containing rows and  columns
//title_field : Title Which you want to set for Bar Chart
//div : Name of  div block where you want to display this Chart.
function drawBarChart(data,title_field,div, colorsArray) 
{
    // var options = createOptions(); 
    var options = {
        isStacked: true,
     };
    options.title = title_field;  
    options.colors = colorsArray; 
    options.chartArea={left:"10%",top:"10%",width:'80%',height:'70%'}
    options.legend = "none";
    var chartBar = new google.visualization.ColumnChart(document.getElementById(div.id)); 
    chartBar.draw(data, options);   
 }  

 //creates charts with info in options such as title, height,width,colors
 //For divided Bar chart isStacked value should be set "true"
 //If values for color will be available after calling addColor(first,second) API
 //If AddColor is not called Default colors get applied
function createOptions()
{
    var options;
    if(this.fColor  != undefined)
    {
       options = {isStacked: true,
                  colors: [this.fColor,this.sColor],                            
                };
    }
    else
    {
       options = { isStacked: true,   
    };
    }     
    return options;
}  

//Addes color to stacked bar chart or line chart
//number of colors should be equal to (column-1) i.e. number of entities
function addColor(first,second)
{
        var colorPicFirst = document.getElementById(first.id).value;
        colorPicFirst = colorPicFirst.slice(1);
        this.fColor = colorPicFirst;

        var colorPicSecond = document.getElementById(second.id).value;
        colorPicSecond = colorPicSecond.slice(1);
        this.sColor = colorPicSecond;
 }





 