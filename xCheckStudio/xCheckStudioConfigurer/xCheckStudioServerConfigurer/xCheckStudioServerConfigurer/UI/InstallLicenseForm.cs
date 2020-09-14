using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace XcheckStudioHubManager
{
    public partial class InstallLicenseForm : Form
    {
        public InstallLicenseForm()
        {
            InitializeComponent();
        }

        private void Cancel_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
        }

        private void onBrowse(object sender, EventArgs e)
        {
            OpenFileDialog openFileDialog = new OpenFileDialog();
            openFileDialog.Title = "Browse License File";
            openFileDialog.DefaultExt = "lic";
            openFileDialog.Filter = "license files (*.lic)|*.lic";
            openFileDialog.CheckFileExists = true;            

            openFileDialog.ShowDialog();

            LicenseFile.Text = openFileDialog.FileName;
        }

        private void onInstall(object sender, EventArgs e)
        {
            if (LicenseFile.Text == null ||
                LicenseFile.Text == "")
            {
                MessageBox.Show("Please select valid license file", "Failed", MessageBoxButtons.OK);
                return;
            }

            try
            {
                String destFile = System.IO.Path.Combine(LicenseManager.LicenseDir, "license.lic");

                // To copy a file to another location and 
                // overwrite the destination file if it already exists.
                System.IO.File.Copy(LicenseFile.Text, destFile, true);
                               
                LicenseManager.Validate();
                if (LicenseManager.Valid)
                {
                    MessageBox.Show("License installed and validated successfully", "Success", MessageBoxButtons.OK);
                    this.Close();
                }
                else
                {
                    MessageBox.Show("License validation failed", "Failed", MessageBoxButtons.OK);
                }
            }
            catch
            {
                MessageBox.Show("License installation failed", "Failed", MessageBoxButtons.OK);
            }
        }
    }
}
