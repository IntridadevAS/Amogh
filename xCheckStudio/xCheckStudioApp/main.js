const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
//const path = require("path");
//const url = require("url");

let win;
function createWindow()
{

    win = new BrowserWindow({title:'xCheckStudio'});
    
    win.loadURL('http://172.16.16.113:11180/xCheckStudio.html');

   //win.setMenu(null);    
    win.webContents.openDevTools();
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