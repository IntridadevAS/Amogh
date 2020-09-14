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
    public partial class LicenseInfoForm : Form
    {
        public LicenseInfoForm()
        {
            InitializeComponent();

            initForm();
        }

        private void initForm()
        {
            Product.Text = LicenseManager.Product;
            Version.Text = LicenseManager.Version;

            if (LicenseManager.Valid)
            {
                License.Text = "Active";
                License.ForeColor = Color.Green;

                //InstallLicense.Enabled = false;
                //RequestLicense.Enabled = false;
            }
            else
            {
                License.Text = "InActive";
                License.ForeColor = Color.Red;
            }
        }

        private void onCancel(object sender, EventArgs e)
        {
            this.Close();
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
        }

        private void onInstallLicense(object sender, EventArgs e)
        {
            InstallLicenseForm installLicenseForm = new InstallLicenseForm();            
            installLicenseForm.StartPosition = FormStartPosition.CenterParent;
            installLicenseForm.ShowDialog();

            if (LicenseManager.Valid)
            {
                License.Text = "Active";
                License.ForeColor = Color.Green;

                //InstallLicense.Enabled = false;
                //RequestLicense.Enabled = false;
            }
        }

        private void onRequestLicense(object sender, EventArgs e)
        {
            RequestLicenseForm requestLicenseForm = new RequestLicenseForm();           
            requestLicenseForm.StartPosition = FormStartPosition.CenterParent;
            requestLicenseForm.ShowDialog();
        }
    }
}
