const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
//const url = require("url");
let host = null;

const ipcMain = electron.ipcMain;
const {download} = require("electron-dl");

let win;
function createWindow()
{
    win = new BrowserWindow({title:'xCheckStudio', frame:false,  show: false, icon: 'public/symbols/XcheckLogoIcon.png'});
    win.setMinimumSize(1124,750);
    win.maximize();
    win.show();
    
    var serverDetailsPageUrl = path.join(__dirname, 'index.html');
    win.loadURL(serverDetailsPageUrl);

    ipcMain.on("download", (event, info) => {
        // info.properties.onProgress = status => window.webContents.send("download progress", status);
        console.log("startind download");
        download(BrowserWindow.getFocusedWindow(), info.url, info.properties)
            .then(
                dl => {
                    console.log("downloaded..1");
                    win.webContents.send("download complete", dl.getSavePath());
                    console.log("downloaded..2 " + dl.getSavePath());
                }
            );
    });
   
    win.on('closed', ()=>{
        win = null;
    })
}

app.on('ready', createWindow);

// add ignore gpu blacklist flag
app.commandLine.appendSwitch('ignore-gpu-blacklist');

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