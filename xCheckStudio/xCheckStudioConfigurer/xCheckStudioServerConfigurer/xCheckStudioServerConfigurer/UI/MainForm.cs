using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace XcheckStudioHubManager
{
    public partial class MainForm : Form
    {
        Process wampServerProcess;
        private Timer timer;
        private const int interval = 12 * 60 * 60 * 1000; // 12 hrs
       
        public MainForm()
        {
            InitializeComponent();

            enableControlsOnLoad();

            timer = new Timer();
            timer.Tick += timerTick;
            timer.Enabled = true;
            timer.Interval = interval;
        }

        void timerTick(object sender, EventArgs e)
        {
            timer.Interval = interval;

            // validate license
            LicenseManager.Validate();
            if (!LicenseManager.Valid)
            {
                MessageBox.Show("License validation failed", "Failed", MessageBoxButtons.OK);
                this.Close();
            }           
        }

        private void onStart(object sender, EventArgs e)
        {
            try
            {
                string portString = ApachePort.Text;
                int port = -1;
                int.TryParse(portString, out port);
                if (port == -1)
                {
                    MessageBox.Show("Please enter valid port number.", "xCheckStudio");
                    return;
                }

                if (!isPortAvailable(port))
                {
                    MessageBox.Show("Entered port number is not available.\nPlease enter valid port number.", "xCheckStudio");
                    return;
                }

                //if (!checkIfPortIsValid())
                //{
                //    return;
                //}

                // change wamp manager settings
                changeWampManagerSettings();

                // change httpd settings
                changeHttpdSettings();

                // change httpd vhosts settings
                changeHttpdVhostsSettings();

                // change apache port
                //changeApachePort();

                // change php settings
                changePHPSettings();

                // install SQL server drivers
                if (SQLServerIntegration.Checked)
                {
                    integrateSQLServer();
                }

                // start WAMP server
                if (startServer())
                {
                    Start.Enabled = false;
                    Stop.Enabled = true;

                    //hide it from the task bar  
                    //and show the system tray icon (represented by the NotifyIcon control)  
                    //if (this.WindowState == FormWindowState.Minimized)
                    //{
                    Hide();
                    NotifyIcon.Visible = true;
                    //}
                }
            }
            catch
            {
                MessageBox.Show("Error occurred while starting server.", "xCheckStudio");
            }
        }

        private bool isPortAvailable(int port)
        {

            bool isAvailable = true;

            // Evaluate current system tcp connections. This is the same information provided
            // by the netstat command line application, just in .Net strongly-typed object
            // form.  We will look through the list, and if our port we would like to use
            // in our TcpClient is occupied, we will set isAvailable to false.
            IPGlobalProperties ipGlobalProperties = IPGlobalProperties.GetIPGlobalProperties();
            IPEndPoint[] tcpConnInfoArray = ipGlobalProperties.GetActiveTcpListeners();

            foreach (IPEndPoint endpoint in tcpConnInfoArray)
            {
                if (endpoint.Port == port)
                {
                    isAvailable = false;
                    break;
                }
            }

            return isAvailable;
        }

        private void changeHttpdVhostsSettings()
        {
            try
            {
                string wampDirectory = WAMPDirectory.Text;
                var filePath = Path.Combine(wampDirectory, @"bin\apache\apache2.4.39\conf\extra\httpd-vhosts.conf");

                // read all file lines and text
                string[] fileLines = File.ReadAllLines(filePath);
                string allFileText = File.ReadAllText(filePath);

                // change apache port to listen
                changeVirtualHostPort(fileLines, ref allFileText);

                // change vhost root directory
                changeVHostRootDirectory(fileLines, ref allFileText);

                // grant access
                changeGrantAccessSetting(fileLines, ref allFileText);

                // write updated all file text
                File.WriteAllText(filePath, allFileText);
            }
            catch
            {
                MessageBox.Show("Error occurred while changing Httpd vhosts settings.", "xCheckStudio");
            }
        }

        private void changeVHostRootDirectory(string[] fileLines,
                                              ref string allFileText)
        {
            try
            {
                // get line to replace
                List<string> linesToReplace = new List<string>();
                foreach (var line in fileLines)
                {
                    if (line.Contains("DocumentRoot") ||
                        line.Contains("<Directory \""))
                    {
                        linesToReplace.Add(line);
                    }
                }

                // replace line
                if (linesToReplace.Count > 0)
                {
                    string serverRootDirectory = ServerRootDir.Text;
                    foreach (string lineToReplace in linesToReplace)
                    {
                        var index = lineToReplace.IndexOf('"');
                        if (index != -1)
                        {
                            var newLine = lineToReplace.Substring(0, index);
                            newLine += "\"" + serverRootDirectory + "\"";
                            if (lineToReplace.Contains("<Directory \""))
                            {
                                newLine += ">";
                            }

                            allFileText = allFileText.Replace(lineToReplace, newLine);
                        }
                    }
                }
            }
            catch
            {
                MessageBox.Show("Error occurred while httpd Port.", "xCheckStudio");
            }
        }

        private void changeVirtualHostPort(string[] fileLines,
                                           ref string allFileText)
        {
            try
            {
                // get line to replace
                string lineToReplace = null;
                foreach (var line in fileLines)
                {
                    if (line.Contains("<VirtualHost") &&
                        !line.Contains("#"))
                    {
                        lineToReplace = line;
                    }
                }

                // replace line
                if (lineToReplace != null)
                {
                    string apachePort = ApachePort.Text;
                    var newLine = "<VirtualHost *:" + apachePort + ">";
                    allFileText = allFileText.Replace(lineToReplace, newLine);
                }
            }
            catch
            {
                MessageBox.Show("Error occurred while changing Virtual host port.", "xCheckStudio");
            }
        }

        private void changeHttpdSettings()
        {
            try
            {
                string wampDirectory = WAMPDirectory.Text;
                var filePath = Path.Combine(wampDirectory, @"bin\apache\apache2.4.39\conf\httpd.conf");

                // read all file lines and text
                string[] fileLines = File.ReadAllLines(filePath);
                string allFileText = File.ReadAllText(filePath);

                // change apache port to listen
                changeHttpdPort(fileLines, ref allFileText);

                // change apache port to listen
                changeServerRootDirectory(fileLines, ref allFileText);

                // grant access
                changeGrantAccessSetting(fileLines, ref allFileText);

                // write updated all file text
                File.WriteAllText(filePath, allFileText);
            }
            catch
            {
                MessageBox.Show("Error occurred while changing Httpd settings.", "xCheckStudio");
            }
        }

        private void changeGrantAccessSetting(string[] fileLines,
                                              ref string allFileText)
        {
            try
            {
                // get line to replace
                string lineToReplace = null;
                foreach (var line in fileLines)
                {
                    if (line.Contains("Require local") &&
                        !line.Contains("#"))
                    {
                        lineToReplace = line;
                    }
                }

                // replace line
                if (lineToReplace != null)
                {
                    var newLine = "Require all granted";
                    allFileText = allFileText.Replace(lineToReplace, newLine);
                }
            }
            catch
            {
                MessageBox.Show("Error occurred while httpd Port.", "xCheckStudio");
            }
        }

        private void changeServerRootDirectory(string[] fileLines,
                                              ref string allFileText)
        {
            try
            {
                // get line to replace
                List<string> linesToReplace = new List<string>();
                foreach (var line in fileLines)
                {
                    if ((line.Contains("DocumentRoot") ||
                        line.Contains("<Directory \"")) &&
                        !line.Contains("#") &&
                        !line.Contains("${SRVROOT}"))
                    {
                        linesToReplace.Add(line);
                    }
                }

                // replace line
                if (linesToReplace.Count > 0)
                {
                    string serverRootDirectory = ServerRootDir.Text;
                    foreach (string lineToReplace in linesToReplace)
                    {
                        var index = lineToReplace.IndexOf('"');
                        if (index != -1)
                        {
                            var newLine = lineToReplace.Substring(0, index);
                            newLine += "\"" + serverRootDirectory + "\"";
                            if (lineToReplace.Contains("<Directory \""))
                            {
                                newLine += ">";
                            }
                            allFileText = allFileText.Replace(lineToReplace, newLine);
                        }
                    }
                }
            }
            catch
            {
                MessageBox.Show("Error occurred while httpd Port.", "xCheckStudio");
            }
        }

        private void changeHttpdPort(string[] fileLines,
                                      ref string allFileText)
        {
            try
            {
                // get line to replace
                List<string> linesToReplace = new List<string>();
                foreach (var line in fileLines)
                {
                    if (line.Contains("Listen") &&
                        !line.Contains("#"))
                    {
                        linesToReplace.Add(line);
                    }
                }

                foreach (var line in fileLines)
                {
                    if (line.Contains("ServerName") &&
                        !line.Contains("#"))
                    {
                        linesToReplace.Add(line);
                    }
                }

                // replace line
                if (linesToReplace.Count > 0)
                {
                    string apachePort = ApachePort.Text;
                    foreach (string lineToReplace in linesToReplace)
                    {
                        var index = lineToReplace.LastIndexOf(':');
                        if (index != -1)
                        {
                            var newLine = lineToReplace.Substring(0, index + 1);
                            newLine += apachePort;
                            allFileText = allFileText.Replace(lineToReplace, newLine);
                        }
                    }
                }
            }
            catch
            {
                MessageBox.Show("Error occurred while httpd Port.", "xCheckStudio");
            }
        }

        private bool startServer()
        {
            try
            {
                string wampDirectory = WAMPDirectory.Text;
                string wampManagerPath = Path.Combine(wampDirectory, "wampmanager.exe");
                string wampManagerSettingsPath = Path.Combine(wampDirectory, "wampmanager.ini");

                ProcessStartInfo wampServerProcessInfo = new ProcessStartInfo();
                wampServerProcessInfo.FileName = wampManagerPath;
                wampServerProcessInfo.Arguments = wampManagerSettingsPath;
                wampServerProcess = Process.Start(wampServerProcessInfo);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error occurred while starting Server.", "xCheckStudio");
                return false;
            }

            return true;
        }

        private void integrateSQLServer()
        {
            try
            {
                //// add SQL Server driver dlls
                //if (addSQLServerDriverDlls())
                //{
                // add extensions for SQL server drivers in php.ini
                addSQLServerDriverExtensions();
                //}
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error occurred while integrating SQL Server.", "xCheckStudio");
            }
        }

        private bool addSQLServerDriverExtensions()
        {
            try
            {
                // get php version number
                string phpVerison = getPHPVersion();

                // construct path to php 
                string wampDirectory = WAMPDirectory.Text;
                var phpPath = "bin\\php\\php" + phpVerison;

                // construct path to php settings file
                var phpIniPath = Path.Combine(wampDirectory, phpPath, "phpForApache.ini");

                // get sql Server DLL paths
                var curDir = Directory.GetCurrentDirectory();
                var pdoNtsDllPath = Path.Combine(curDir, "SQL Server Driver DLLs", "php_pdo_sqlsrv_72_nts_x64.dll");
                var pdotsDllPath = Path.Combine(curDir, "SQL Server Driver DLLs", "php_pdo_sqlsrv_72_ts_x64.dll");
                var ntsDllPath = Path.Combine(curDir, "SQL Server Driver DLLs", "php_sqlsrv_72_nts_x64.dll");
                var tsDllPath = Path.Combine(curDir, "SQL Server Driver DLLs", "php_sqlsrv_72_ts_x64.dll");

                bool pdoNtsFound = false;
                bool pdotsFound = false;
                bool ntsFound = false;
                bool tsFound = false;
                foreach (var line in File.ReadAllLines(phpIniPath))
                {
                    if (line.Contains("extension=\"" + pdoNtsDllPath + "\""))
                    {
                        pdoNtsFound = true;
                    }
                    else if (line.Contains("extension=\"" + pdotsDllPath + "\""))
                    {
                        pdotsFound = true;
                    }
                    else if (line.Contains("extension=\"" + ntsDllPath + "\""))
                    {
                        ntsFound = true;
                    }
                    else if (line.Contains("extension=\"" + tsDllPath + "\""))
                    {
                        tsFound = true;
                    }
                }

                if (!pdoNtsFound ||
                   !pdotsFound ||
                   !ntsFound ||
                   !tsFound)
                {
                    string newContent = Environment.NewLine +
                                        "; SQL Server Extensions" +
                                        Environment.NewLine;
                    if (!pdoNtsFound)
                    {
                        newContent += "extension=\"" + pdoNtsDllPath + "\"" +
                                     Environment.NewLine;
                    }
                    if (!pdotsFound)
                    {
                        newContent += "extension=\"" + pdotsDllPath + "\"" +
                                    Environment.NewLine;
                    }
                    if (!ntsFound)
                    {
                        newContent += "extension=\"" + ntsDllPath + "\"" +
                                    Environment.NewLine;
                    }
                    if (!tsFound)
                    {
                        newContent += "extension=\"" + tsDllPath + "\"" +
                                    Environment.NewLine;
                    }

                    File.AppendAllText(phpIniPath, newContent);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error occurred while adding SQL Server extentions.", "xCheckStudio");
                return false;
            }

            return true;
        }

        //private bool addSQLServerDriverDlls()
        //{
        //    try
        //    {
        //        // get php version number
        //        string phpVerison = getPHPVersion();

        //        // construct path to php 
        //        string wampDirectory = WAMPDirectory.Text;
        //        var phpPath = "bin\\php\\php" + phpVerison;

        //        string phpExtPath = Path.Combine(wampDirectory, phpPath, "ext");

        //        string sourceFilePath = Path.Combine("SQL Server Driver DLLs", "php_pdo_sqlsrv_72_nts_x64.dll");
        //        string destFilePath = Path.Combine(phpExtPath, "php_pdo_sqlsrv_72_nts_x64.dll");
        //        if (File.Exists(sourceFilePath) &&
        //            !File.Exists(destFilePath))
        //        {
        //            File.Copy(sourceFilePath, destFilePath, true);
        //        }

        //        sourceFilePath = Path.Combine("SQL Server Driver DLLs", "php_pdo_sqlsrv_72_ts_x64.dll");
        //        destFilePath = Path.Combine(phpExtPath, "php_pdo_sqlsrv_72_ts_x64.dll");
        //        if (File.Exists(sourceFilePath) &&
        //            !File.Exists(destFilePath))
        //        {
        //            File.Copy(sourceFilePath, destFilePath, true);
        //        }

        //        sourceFilePath = Path.Combine("SQL Server Driver DLLs", "php_sqlsrv_72_nts_x64.dll");
        //        destFilePath = Path.Combine(phpExtPath, "php_sqlsrv_72_nts_x64.dll");
        //        if (File.Exists(sourceFilePath) &&
        //            !File.Exists(destFilePath))
        //        {
        //            File.Copy(sourceFilePath, destFilePath, true);
        //        }

        //        sourceFilePath = Path.Combine("SQL Server Driver DLLs", "php_sqlsrv_72_ts_x64.dll");
        //        destFilePath = Path.Combine(phpExtPath, "php_sqlsrv_72_ts_x64.dll");
        //        if (File.Exists(sourceFilePath) &&
        //            !File.Exists(destFilePath))
        //        {
        //            File.Copy(sourceFilePath, destFilePath, true);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        MessageBox.Show("Error occurred while adding SQL Server driver dlls.", "xCheckStudio");
        //        return false;
        //    }

        //    return true;
        //}

        private void changePHPSettings()
        {
            try
            {
                // get php version number
                string phpVerison = getPHPVersion();

                // construct path to php 
                string wampDirectory = WAMPDirectory.Text;
                var phpPath = "bin\\php\\php" + phpVerison;

                // construct path to php settings file
                var phpIniPath = Path.Combine(wampDirectory, phpPath, "phpForApache.ini");

                string maxExecutionTimeLine = null;
                string maxInputTimeLine = null;
                string postMaxSizeLine = null;
                string uploadMaxFilesizeLine = null;
                string memoryLimitLine = null;
                string maxFileUploadsLine = null;
                foreach (var line in File.ReadAllLines(phpIniPath))
                {
                    if (line.Contains("max_execution_time"))
                    {
                        maxExecutionTimeLine = line;
                        continue;
                    }
                    else if (line.Contains("max_input_time"))
                    {
                        maxInputTimeLine = line;
                        continue;
                    }
                    else if (line.Contains("post_max_size"))
                    {
                        postMaxSizeLine = line;
                        continue;
                    }
                    else if (line.Contains("upload_max_filesize"))
                    {
                        uploadMaxFilesizeLine = line;
                        continue;
                    }
                    else if (line.Contains("memory_limit"))
                    {
                        memoryLimitLine = line;
                        continue;
                    }
                    else if (line.Contains("max_file_uploads"))
                    {
                        maxFileUploadsLine = line;
                        continue;
                    }
                }

                // update file
                string text = File.ReadAllText(phpIniPath);

                if (maxExecutionTimeLine != null)
                {
                    string value = MaxExecutionTime.Text;
                    string newMaxExecutionTimeLine = "max_execution_time = " + value;
                    text = text.Replace(maxExecutionTimeLine, newMaxExecutionTimeLine);
                }
                if (maxInputTimeLine != null)
                {
                    string value = MaxInputTime.Text;
                    string newMaxInputTimeLine = "max_input_time = " + value;
                    text = text.Replace(maxInputTimeLine, newMaxInputTimeLine);
                }
                if (postMaxSizeLine != null)
                {
                    string value = PostMaxSize.Text;
                    string newPostMaxSizeLine = "post_max_size = " + value;
                    text = text.Replace(postMaxSizeLine, newPostMaxSizeLine);
                }
                if (uploadMaxFilesizeLine != null)
                {
                    string value = UploadMaxFileSize.Text;
                    string newUploadMaxFilesizeLine = "upload_max_filesize = " + value;
                    text = text.Replace(uploadMaxFilesizeLine, newUploadMaxFilesizeLine);
                }
                if (memoryLimitLine != null)
                {
                    string value = MemoryLimit.Text;
                    string newMemoryLimitLine = "memory_limit = " + value;
                    text = text.Replace(memoryLimitLine, newMemoryLimitLine);
                }
                if (maxFileUploadsLine != null)
                {
                    string value = MaxFileUploads.Text;
                    string newMaxFileUploadsLine = "max_file_uploads = " + value;
                    text = text.Replace(maxFileUploadsLine, newMaxFileUploadsLine);
                }

                File.WriteAllText(phpIniPath, text);
            }

            catch (Exception ex)
            {
                MessageBox.Show("Error occurred while changing PHP settings.", "xCheckStudio");
            }
        }
        private string getPHPVersion()
        {
            string phpVersion = null;

            try
            {
                string wampDirectory = WAMPDirectory.Text;
                var filePath = Path.Combine(wampDirectory, "wampmanager.conf");

                foreach (var line in File.ReadAllLines(filePath))
                {
                    if (line.Contains("phpVersion"))
                    {
                        int startIndex = line.IndexOf('"');
                        int lastIndex = line.LastIndexOf('"');
                        if (startIndex != -1 &&
                            lastIndex != -1 &&
                            startIndex != lastIndex)
                        {
                            var length = lastIndex - (startIndex + 1);
                            return line.Substring(startIndex + 1, length);
                        }
                    }
                }
            }
            catch
            {
                MessageBox.Show("Error occurred while reding PHP version.", "xCheckStudio");
            }

            return phpVersion;
        }

        private void changeWampManagerSettings()
        {
            try
            {
                string wampDirectory = WAMPDirectory.Text;
                var filePath = Path.Combine(wampDirectory, "wampmanager.conf");

                // read all file lines and text
                string[] fileLines = File.ReadAllLines(filePath);
                string allFileText = File.ReadAllText(filePath);

                // change apache port used
                changeApachePort(fileLines, ref allFileText);

                // change use apache port other than flag
                changeApacheUseOtherPort(fileLines, ref allFileText);

                // change online status
                changeOnlineStatus(fileLines, ref allFileText);

                // change menu item online
                setMenuItemOnline(fileLines, ref allFileText);

                // write updated all file text
                File.WriteAllText(filePath, allFileText);
            }
            catch
            {
                MessageBox.Show("Error occurred while changing Wamp Manager settings.", "xCheckStudio");
            }
        }

        private void changeApacheUseOtherPort(string[] fileLines,
                                              ref string allFileText)
        {
            try
            {
                // get line to replace
                string lineToReplace = null;
                foreach (var line in fileLines)
                {
                    if (line.Contains("apacheUseOtherPort"))
                    {
                        lineToReplace = line;
                        break;
                    }
                }

                // replace line
                if (lineToReplace != null)
                {
                    var newLine = "apacheUseOtherPort = \"on\"";
                    allFileText = allFileText.Replace(lineToReplace, newLine);
                }
            }
            catch
            {
                MessageBox.Show("Error occurred while changing user other Apache Port.", "xCheckStudio");
            }
        }

        private void setMenuItemOnline(string[] fileLines,
                                       ref string allFileText)
        {
            try
            {
                // get line to replace
                string lineToReplace = null;
                foreach (var line in fileLines)
                {
                    if (line.Contains("MenuItemOnline"))
                    {
                        lineToReplace = line;
                        break;
                    }
                }

                // replace line
                if (lineToReplace != null)
                {
                    string newLine = null;
                    if (Online.Checked)
                    {
                        newLine = "MenuItemOnline = \"on\"";
                    }
                    else
                    {
                        newLine = "MenuItemOnline = \"off\"";
                    }
                    allFileText = allFileText.Replace(lineToReplace, newLine);
                }
            }
            catch
            {
                MessageBox.Show("Error occurred while changing menu item online.", "xCheckStudio");
            }
        }

        private void changeOnlineStatus(string[] fileLines,
                                        ref string allFileText)
        {
            try
            {
                // get line to replace
                string lineToReplace = null;
                foreach (var line in fileLines)
                {
                    if (line.Contains("status"))
                    {
                        lineToReplace = line;
                        break;
                    }
                }

                // replace line
                if (lineToReplace != null)
                {
                    string newLine = null;
                    if (Online.Checked)
                    {
                        newLine = "status = \"online\"";
                    }
                    else
                    {
                        newLine = "status = \"offline\"";
                    }
                    allFileText = allFileText.Replace(lineToReplace, newLine);
                }
            }
            catch
            {
                MessageBox.Show("Error occurred while changing online status.", "xCheckStudio");
            }
        }

        private void changeApachePort(string[] fileLines,
                                      ref string allFileText)
        {
            try
            {
                // get line to replace
                string lineToReplace = null;
                foreach (var line in fileLines)
                {
                    if (line.Contains("apachePortUsed"))
                    {
                        lineToReplace = line;
                        break;
                    }
                }

                // replace line
                if (lineToReplace != null)
                {
                    string apachePort = ApachePort.Text;

                    var newLine = "apachePortUsed = \"" + apachePort + "\"";
                    allFileText = allFileText.Replace(lineToReplace, newLine);
                }
            }
            catch
            {
                MessageBox.Show("Error occurred while changing Apache Port.", "xCheckStudio");
            }
        }

        private void onCancel(object sender, EventArgs e)
        {
            this.Close();
        }

        private void onStop(object sender, EventArgs e)
        {
            try
            {
                if (wampServerProcess != null)
                {
                    wampServerProcess.Kill();
                    wampServerProcess = null;

                    // kill httpd processes
                    killProcesse("httpd");

                    Start.Enabled = true;
                    Stop.Enabled = false;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error occurred while stoping server.", "xCheckStudio");
            }
        }

        private void onMainFormLoad(object sender, EventArgs e)
        {
        }

        private void onAllowEditCheckChanged(object sender, EventArgs e)
        {

            if (AllowEdit.Checked)
            {
                enableSettingInputs(true);
            }
            else
            {
                enableSettingInputs(false);
            }
        }

        private void enableSettingInputs(bool enable)
        {
            WAMPDirectory.Enabled = enable;
            BrowseWampDir.Enabled = enable;
            ServerRootDir.Enabled = enable;
            BrowseServerRootDir.Enabled = enable;
            ApachePort.Enabled = enable;
            MaxExecutionTime.Enabled = enable;
            MaxInputTime.Enabled = enable;
            PostMaxSize.Enabled = enable;
            UploadMaxFileSize.Enabled = enable;
            MemoryLimit.Enabled = enable;
            SQLServerIntegration.Enabled = enable;
            Online.Enabled = enable;
            MaxFileUploads.Enabled = enable;
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            onStop(null, null);
        }

        private void BrowseServerRootDir_Click(object sender, EventArgs e)
        {
            FolderBrowserDialog folderDlg = new FolderBrowserDialog();
            folderDlg.ShowNewFolderButton = false;
            // Show the FolderBrowserDialog.  
            DialogResult result = folderDlg.ShowDialog();
            if (result == DialogResult.OK)
            {
                ServerRootDir.Text = folderDlg.SelectedPath;
                Environment.SpecialFolder root = folderDlg.RootFolder;
            }
        }

        private void BrowseWampDir_Click(object sender, EventArgs e)
        {
            FolderBrowserDialog folderDlg = new FolderBrowserDialog();
            folderDlg.ShowNewFolderButton = false;
            // Show the FolderBrowserDialog.  
            DialogResult result = folderDlg.ShowDialog();
            if (result == DialogResult.OK)
            {
                WAMPDirectory.Text = folderDlg.SelectedPath;
                Environment.SpecialFolder root = folderDlg.RootFolder;
            }
        }

        private static void killProcesse(string processName)
        {
            foreach (var process in Process.GetProcessesByName(processName))
            {
                process.Kill();
            }
        }

        private void onResize(object sender, EventArgs e)
        {
            //if the form is minimized  
            //hide it from the task bar  
            //and show the system tray icon (represented by the NotifyIcon control)  
            if (this.WindowState == FormWindowState.Minimized)
            {
                Hide();
                NotifyIcon.Visible = true;
            }
        }

        private void onNotifyIconClick(object sender, MouseEventArgs e)
        {
            Show();
            this.WindowState = FormWindowState.Normal;
            NotifyIcon.Visible = false;
        }

        private void onLicenseLinkLabelClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            LicenseInfoForm licenseInfoForm = new LicenseInfoForm();
            licenseInfoForm.StartPosition = FormStartPosition.CenterParent;
            licenseInfoForm.ShowDialog();

            enableControlsOnLoad();
        }

        private void enableControlsOnLoad()
        {
            if (LicenseManager.Valid)
            {
            //WAMPDirectory.Enabled = true;
            //BrowseWampDir.Enabled = true;
            //ServerRootDir.Enabled = true;
            //BrowseServerRootDir.Enabled = true;
            AllowEdit.Enabled = true;
            Start.Enabled = true;
            
            LicenseStatusLabel.Text = "Active";
            LicenseStatusLabel.ForeColor = Color.Green;

            // server root dir
            var curDir = Directory.GetCurrentDirectory();
            ServerRootDir.Text = Directory.GetParent(curDir).FullName;
            }
            else
            {
                //WAMPDirectory.Enabled = false;
                //BrowseWampDir.Enabled = false;
                //ServerRootDir.Enabled = false;
                BrowseServerRootDir.Enabled = false;
                AllowEdit.Enabled = false;
                Start.Enabled = false;

                LicenseStatusLabel.Text = "InActive";
                LicenseStatusLabel.ForeColor = Color.Red;
            }
        }

        private void onSignOutUsers(object sender, EventArgs e)
        {
            string rootDir = ServerRootDir.Text;
            //string rootDir = @"D:\Intrida\Source Code\VS Code\xCheckStudioViewer\xCheckStudio\Webviewer";

            SignOutUsersForm signOutUsersForm = new SignOutUsersForm(rootDir);
            signOutUsersForm.StartPosition = FormStartPosition.CenterParent;
            signOutUsersForm.ShowDialog();
        }
    }
}
