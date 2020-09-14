using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

using Reprise;

namespace XcheckStudioHubManager
{
    class LicenseManager
    {
        public static String Product = "xcheckstudio-hub";
        public static String Version = "1.0";
        public static int Count = 1;
        public static bool Valid = false;

        public static String LicenseDir
        {
            get
            {
                string appDir = AppDomain.CurrentDomain.BaseDirectory;
                System.IO.DirectoryInfo di = new System.IO.DirectoryInfo(appDir);
                return System.IO.Path.Combine(di.Parent.FullName, "License");
            }
        }

        public static bool Validate()
        {           
            IntPtr handle = RLM.rlm_init(LicenseManager.LicenseDir, ".", null);
            int stat = RLM.rlm_stat(handle);
            if (stat != 0)
            {
                Console.WriteLine("rlm_init returns " + stat);
            }
            else
            {
                Console.WriteLine("rlm_init successful");

                // Check out a license
                IntPtr license = LicenseManager.Checkout(handle,
                    LicenseManager.Product,
                    LicenseManager.Version,
                    LicenseManager.Count);

                stat = RLM.rlm_license_stat(license);

                Dictionary<string, string>  licenseAttributes = new Dictionary<string, string>();
                licenseAttributes["Product"] = LicenseManager.Product;
                licenseAttributes["Version"] = LicenseManager.Version;
                licenseAttributes["Expiry"] = RLM.marshalToString(RLM.rlm_license_exp(license));
                licenseAttributes["Days Until Expiry"] = RLM.rlm_license_exp_days(license).ToString();

                // Check it back in
                RLM.rlm_checkin(license);

                if (stat == 0)
                {
                    LicenseManager.Valid = true;
                    LicenseManager.showLicenseInfo(licenseAttributes);

                    return true;
                }
                else
                {
                    LicenseManager.Valid = false;
                }
            }

            return false;
        }

        private static IntPtr Checkout(IntPtr handle, String prod, String ver, int count)
        {
            IntPtr license = RLM.rlm_checkout(handle, prod, ver, count);
            return license;
        }

        public static String GetMacAddress()
        {

            IntPtr handle = RLM.rlm_init(LicenseManager.LicenseDir, ".", null);
            int stat = RLM.rlm_stat(handle);
            if (stat == 0)
            {

                // Get the hostid of this system
                byte[] hostID = new byte[RLM.RLM_MAX_HOSTID_STRING];
                RLM.rlm_hostid(handle, RLM.RLM_HOSTID_ETHER, hostID);
                System.Text.ASCIIEncoding enc = new System.Text.ASCIIEncoding();
                String str = enc.GetString(hostID);

                return str;
            }

            return null;
        }

        public static void showLicenseInfo(Dictionary<string, string> licenseAttributes) {
            if (licenseAttributes.ContainsKey("Days Until Expiry"))
            {
                int number;
                if (Int32.TryParse(licenseAttributes["Days Until Expiry"], out number))
                {

                    if (number <= 5)
                    {
                        string licenseInfo = "";
                        foreach (KeyValuePair<string, string> entry in licenseAttributes)
                        {
                            // do something with entry.Value or entry.Key
                            licenseInfo += entry.Key + " : " + entry.Value + "\n";
                        }
                        MessageBox.Show(licenseInfo);
                    }
                }
            }
        }
    }
}
