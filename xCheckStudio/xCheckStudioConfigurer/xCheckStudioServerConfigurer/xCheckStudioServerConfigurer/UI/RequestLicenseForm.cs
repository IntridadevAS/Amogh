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
    public partial class RequestLicenseForm : Form
    {
        public RequestLicenseForm()
        {
            InitializeComponent();

            // get mac id
            String macId = LicenseManager.GetMacAddress();
            if (macId != null)
            {
                HostId.Text = macId;
            }
        }

        private void onCancel(object sender, EventArgs e)
        {
            this.Close();
        }

        private void onRequest(object sender, EventArgs e)
        {
            if (UserName.Text == null ||
                 UserName.Text == "")
            {
                MessageBox.Show("Name field can't be empty.", "Name", MessageBoxButtons.OK);
                return;
            }
            if (Organization.Text == null ||
                 Organization.Text == "")
            {
                MessageBox.Show("Organization field can't be empty.", "Organization", MessageBoxButtons.OK);
                return;
            }
            if (Designation.Text == null ||
                 Designation.Text == "")
            {
                MessageBox.Show("Customer Ref No field can't be empty.", "Organization", MessageBoxButtons.OK);
                return;
            }

            if (EmailId.Text == null ||
                 EmailId.Text == "")
            {
                MessageBox.Show("EmailId field can't be empty.", "Organization", MessageBoxButtons.OK);
                return;
            }

            if (HostId.Text == null ||
                 HostId.Text == "")
            {
                MessageBox.Show("HostId field can't be empty.", "Organization", MessageBoxButtons.OK);
                return;
            }

            Dictionary<string, string> requestData = new Dictionary<string, string>();
            requestData["name"] = UserName.Text;
            requestData["organization"] = Organization.Text;
            requestData["designation"] = Designation.Text;
            requestData["emailid"] = EmailId.Text;
            requestData["hostid"] = HostId.Text;

            bool success = RequestLicense.Request(requestData);
            if (success)
            {
                MessageBox.Show("License request sent successfully.", "Success", MessageBoxButtons.OK);
                this.Close();
            }
            else
            {
                MessageBox.Show("License request sending failed.", "Failed", MessageBoxButtons.OK);
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {

        }
    }
}
