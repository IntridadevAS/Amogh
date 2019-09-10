const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
//const url = require("url");
let host = null;

let win;
function createWindow()
{
    win = new BrowserWindow({title:'xCheckStudio', frame:false,  show: false, icon: 'public/symbols/XcheckLogoIcon.png'});
    win.setMinimumSize(500,500);
    win.maximize();
    win.show();
    
    var serverDetailsPageUrl = path.join(__dirname, 'index.html');
    win.loadURL(serverDetailsPageUrl);

    //win.setMenu(null);    
   
    win.on('closed', ()=>{
        win = null;
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', ()=> {
    if(process.platform !== 'darwin')
    {
        app.quit();  
    }
})

app.on('activate', ()=>{
    if(win===null)
    {
      createWindow();        
    }
})