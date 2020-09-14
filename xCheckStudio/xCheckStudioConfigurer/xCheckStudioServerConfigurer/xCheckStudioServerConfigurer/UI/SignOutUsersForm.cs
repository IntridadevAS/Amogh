using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;
using System.Data.SQLite;

namespace XcheckStudioHubManager
{
    public partial class SignOutUsersForm : Form
    {
        private string ServerRootDir;
        private Dictionary<int, string> LockedUsers;

        public SignOutUsersForm(string serverRootDir)
        {
            InitializeComponent();

            this.ServerRootDir = serverRootDir;
            this.LockedUsers = new Dictionary<int, string>();

            this.LoadGrid();
        }

        private void LoadGrid()
        {
            if (this.ServerRootDir == null)
            {
                return;
            }

            string mainDbPath = Path.Combine(this.ServerRootDir, @"Data\Main.db");
            if (!File.Exists(mainDbPath))
            {
                return;
            }

            // get locked users
            //Dictionary<int, string> lockedUsers = new Dictionary<int, string>();
            using (SQLiteConnection connection = new SQLiteConnection("Data Source=" + mainDbPath))
            {
                connection.Open();

                string stm = "SELECT * FROM LoginInfo Where lock=1";

                using (SQLiteCommand cmd = new SQLiteCommand(stm, connection))
                {
                    using (SQLiteDataReader rdr = cmd.ExecuteReader())
                    {
                        while (rdr.Read())
                        {
                            int userid = rdr.GetInt32(0);
                            string userAlias = rdr.GetString(4);
                            this.LockedUsers[userid] = userAlias;
                        }
                    }
                }
            }

            if (this.LockedUsers == null ||
                this.LockedUsers.Count == 0)
            {
                return;
            }

            foreach (KeyValuePair<int, string> lockedUser in this.LockedUsers)
            {
                var index = this.UsersGrid.Rows.Add();
                this.UsersGrid.Rows[index].Cells["Select"].Value = false;
                this.UsersGrid.Rows[index].Cells["User"].Value = lockedUser.Value;
                this.UsersGrid.Rows[index].Cells["UserId"].Value = lockedUser.Key;
            }
        }

        private void onCancel(object sender, EventArgs e)
        {
            this.Close();
        }

        private void onSignOut(object sender, EventArgs e)
        {
            this.signOutSelectedUsers();

            this.Close();
        }

        private void signOutSelectedUsers()
        {

            string mainDbPath = Path.Combine(this.ServerRootDir, @"Data\Main.db");
            if (!File.Exists(mainDbPath))
            {
                return;
            }

            int signedOutUsers = 0;
            using (SQLiteConnection connection = new SQLiteConnection("Data Source=" + mainDbPath))
            {
                connection.Open();
                using (SQLiteCommand command = new SQLiteCommand(connection))
                {
                    foreach (DataGridViewRow row in this.UsersGrid.Rows)
                    {
                        DataGridViewCheckBoxCell selectCell = row.Cells[0] as DataGridViewCheckBoxCell;
                        if ((bool)selectCell.Value == true)
                        {
                            DataGridViewCell userIdCell = row.Cells[2];

                            command.CommandText =
                            "update LoginInfo set lock = 0 where userid=:id";
                            command.Parameters.Add("id", DbType.String).Value = userIdCell.Value;
                            command.ExecuteNonQuery();

                            signedOutUsers++;
                        }
                    }
                }
            }

            MessageBox.Show("'" + signedOutUsers + " user(s) have been signed out.");
        }

        private void onSelectAll(object sender, EventArgs e)
        {
            foreach (DataGridViewRow row in this.UsersGrid.Rows)
            {
                DataGridViewCheckBoxCell cb = row.Cells[0] as DataGridViewCheckBoxCell;
                if (cb != null)
                {
                    cb.Value = this.SelectAll.Checked; //because chk.Value is initialy null
                }
            }
        }
    }
}
