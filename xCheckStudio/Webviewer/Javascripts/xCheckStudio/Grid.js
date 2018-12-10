var hot3;

// API to apply color to selecrted cell
//seletcolor : id of input color picker
function applyColor(selectColor)
{   
  var selected = hot3.getSelected();
  if(selected)
  {
    for (var index = 0; index < selected.length; index += 1)
    {
        var item = selected[index];
        var startRow = Math.min(item[0], item[2]);
        var endRow = Math.max(item[0], item[2]);
        var startCol = Math.min(item[1], item[3]);
        var endCol = Math.max(item[1], item[3]);

         for (var rowIndex = startRow; rowIndex <= endRow; rowIndex += 1)
          {
                for (var columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) 
                {          
                    var cell = hot3.getSelected("getCell",rowIndex,columnIndex);
                    var cellNew = hot3.getCell(rowIndex,columnIndex);
                    var foreColor = '#000';
                    var colorPicSecond = document.getElementById(selectColor.id).value;
                    colorPicSecond = colorPicSecond.slice(1);
           
                    var backgroundColor = "#"+colorPicSecond;
                    cellNew.style.color = '#ffff00';
                    cellNew.style.background = backgroundColor;
                }
         }
     }
  }
}

function createGridView(sheetData,hot,numberOfRows,numberOfCols)
{
    var sheetDataHeaders = [];
    var properties = sheetData[0].properties;
    for(var i = 0; i < properties.length; i++)
    {
        sheetDataHeaders.push(properties[i].Name);
    }

    var sheetPropertiesArray = [];
    for(var i = 0; i < sheetData.length; i++)
    {
        var property = sheetData[i].properties;
        var propertiesArray = [];
        for(var j =0; j < property.length; j++)
        {
            propertiesArray.push(property[j].Value);
        }
        sheetPropertiesArray.push(propertiesArray);
    }

    document.getElementById(hot).innerHTML = "" ;
    var sel = "#"+hot;
    var hotElement = document.querySelector(sel);
    hotElement.style.width = "700px";
    hotElement.style.height = "620px";
    hotElement.classList = "scrollable";
    var rowCount = 0//document.getElementById(numberOfRows.id).value;
    var colCount = 0//document.getElementById(numberOfCols.id).value;
    var  hotSettings = {
            data: sheetPropertiesArray,
            outsideClickDeselects: false,
            stretchH: 'all',       
            autoWrapRow: true,                   
            manualRowResize: true,
            manualColumnResize: true,
           // rowHeaders: true,
            colHeaders: sheetDataHeaders, 
            manualRowMove: true,
            manualColumnMove: true,
            contextMenu: true,
            filters: true,
            dropdownMenu: true            
        }       
       if(rowCount)
       {
           hotSettings.maxRows=rowCount;
       }
       if(colCount)
       {
           hotSettings.maxCols = colCount;
       }
       hot3 = new Handsontable(hotElement, hotSettings);

}

//To highlight a cell on mouse click event in default color
Handsontable.hooks.add('afterOnCellMouseDown',  function(event, coords){
  
    var maxRow = hot3.table.rows.length-1;
    var maxCol = hot3.table.rows[0].cells.length-1;
    if(maxRow> document.getElementById(numberOfRows.id).value && document.getElementById(numberOfRows.id).value != "" && document.getElementById(numberOfCols.id).value!="" && maxCol > document.getElementById(numberOfCols.id).value)
    {
        maxRow = document.getElementById(numberOfRows.id).value;
        maxCol =document.getElementById(numberOfCols.id).value;
    }
   var cell;    
   for(var rowIndex = 0; rowIndex<maxRow; rowIndex++)
   {
       for(var columnIndex = 0; columnIndex<=maxCol;columnIndex++)
       {
            cell = this.getCell(rowIndex,columnIndex);
            // var color = cell.style.background;
            if(rowIndex==coords.row && columnIndex==coords.col && (cell.style.background =="" || cell.style.background=="rgb(255, 255, 255)"))
            {   
                cell.style.color = '#000000';              
                cell.style.background = '#ffff00';
               
            }
            else if((rowIndex!=coords.row || columnIndex!=coords.col) && cell.style.background=="rgb(255, 255, 0)")
            {         
                cell.style.color = '#000000';                   
                cell.style.background = '#ffffff';
            }
       }
   }
});
