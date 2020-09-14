using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace XcheckStudioHubManager
{
    static class Program
    {
        public static MainForm mainForm;

        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {  
            bool createdNew;
            Mutex m = new Mutex(true, "XcheckStudio-HubManager.exe", out createdNew);
            if (!createdNew)
            {
                MessageBox.Show("XcheckStudio-HubManager.exe is already running!", "Multiple Instances");
                return;
            }

            /// Check license          
            bool success = LicenseManager.Validate();

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            mainForm = new MainForm();
            Application.Run(mainForm);
        }       
    }
}
