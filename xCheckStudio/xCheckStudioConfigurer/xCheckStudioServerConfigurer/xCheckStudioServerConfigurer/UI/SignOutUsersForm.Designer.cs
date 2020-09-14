namespace XcheckStudioHubManager
{
    partial class SignOutUsersForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.MainTableLayoutPanel = new System.Windows.Forms.TableLayoutPanel();
            this.Cancel = new System.Windows.Forms.Button();
            this.SignOut = new System.Windows.Forms.Button();
            this.UsersGrid = new System.Windows.Forms.DataGridView();
            this.Select = new System.Windows.Forms.DataGridViewCheckBoxColumn();
            this.User = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.UserId = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.SelectAll = new System.Windows.Forms.CheckBox();
            this.MainTableLayoutPanel.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.UsersGrid)).BeginInit();
            this.SuspendLayout();
            // 
            // MainTableLayoutPanel
            // 
            this.MainTableLayoutPanel.ColumnCount = 3;
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 84F));
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 82F));
            this.MainTableLayoutPanel.Controls.Add(this.Cancel, 2, 1);
            this.MainTableLayoutPanel.Controls.Add(this.SignOut, 1, 1);
            this.MainTableLayoutPanel.Controls.Add(this.UsersGrid, 0, 0);
            this.MainTableLayoutPanel.Controls.Add(this.SelectAll, 0, 1);
            this.MainTableLayoutPanel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.MainTableLayoutPanel.Location = new System.Drawing.Point(0, 0);
            this.MainTableLayoutPanel.Name = "MainTableLayoutPanel";
            this.MainTableLayoutPanel.RowCount = 2;
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.Size = new System.Drawing.Size(395, 157);
            this.MainTableLayoutPanel.TabIndex = 0;
            
            // 
            // Cancel
            // 
            this.Cancel.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.Cancel.Location = new System.Drawing.Point(317, 131);
            this.Cancel.Name = "Cancel";
            this.Cancel.Size = new System.Drawing.Size(75, 23);
            this.Cancel.TabIndex = 0;
            this.Cancel.Text = "Cancel";
            this.Cancel.UseVisualStyleBackColor = true;
            this.Cancel.Click += new System.EventHandler(this.onCancel);
            // 
            // SignOut
            // 
            this.SignOut.Location = new System.Drawing.Point(232, 130);
            this.SignOut.Name = "SignOut";
            this.SignOut.Size = new System.Drawing.Size(75, 23);
            this.SignOut.TabIndex = 1;
            this.SignOut.Text = "Sign Out";
            this.SignOut.UseVisualStyleBackColor = true;
            this.SignOut.Click += new System.EventHandler(this.onSignOut);
            // 
            // UsersGrid
            // 
            this.UsersGrid.AllowUserToAddRows = false;
            this.UsersGrid.AllowUserToDeleteRows = false;
            this.UsersGrid.AllowUserToResizeColumns = false;
            this.UsersGrid.AllowUserToResizeRows = false;
            this.UsersGrid.BackgroundColor = System.Drawing.Color.White;
            this.UsersGrid.BorderStyle = System.Windows.Forms.BorderStyle.None;
            this.UsersGrid.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.UsersGrid.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.Select,
            this.User,
            this.UserId});
            this.MainTableLayoutPanel.SetColumnSpan(this.UsersGrid, 3);
            this.UsersGrid.Dock = System.Windows.Forms.DockStyle.Fill;
            this.UsersGrid.Location = new System.Drawing.Point(3, 3);
            this.UsersGrid.Name = "UsersGrid";
            this.UsersGrid.RowHeadersBorderStyle = System.Windows.Forms.DataGridViewHeaderBorderStyle.None;
            this.UsersGrid.RowHeadersVisible = false;
            this.UsersGrid.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.UsersGrid.Size = new System.Drawing.Size(389, 121);
            this.UsersGrid.TabIndex = 2;
            // 
            // Select
            // 
            this.Select.HeaderText = "Select";
            this.Select.Name = "Select";
            this.Select.Width = 50;
            // 
            // User
            // 
            this.User.HeaderText = "User";
            this.User.Name = "User";
            this.User.Resizable = System.Windows.Forms.DataGridViewTriState.True;
            this.User.SortMode = System.Windows.Forms.DataGridViewColumnSortMode.NotSortable;
            this.User.Width = 335;
            // 
            // UserId
            // 
            this.UserId.HeaderText = "UserId";
            this.UserId.Name = "UserId";
            this.UserId.Visible = false;
            // 
            // SelectAll
            // 
            this.SelectAll.AutoSize = true;
            this.SelectAll.Dock = System.Windows.Forms.DockStyle.Fill;
            this.SelectAll.Location = new System.Drawing.Point(3, 130);
            this.SelectAll.Name = "SelectAll";
            this.SelectAll.Size = new System.Drawing.Size(223, 24);
            this.SelectAll.TabIndex = 3;
            this.SelectAll.Text = "Select All";
            this.SelectAll.UseVisualStyleBackColor = true;
            this.SelectAll.CheckedChanged += new System.EventHandler(this.onSelectAll);
            // 
            // SignOutUsersForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(395, 157);
            this.ControlBox = false;
            this.Controls.Add(this.MainTableLayoutPanel);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.Name = "SignOutUsersForm";
            this.Text = "Sign Out Users";
            this.MainTableLayoutPanel.ResumeLayout(false);
            this.MainTableLayoutPanel.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.UsersGrid)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TableLayoutPanel MainTableLayoutPanel;
        private System.Windows.Forms.Button Cancel;
        private System.Windows.Forms.Button SignOut;
        private System.Windows.Forms.DataGridView UsersGrid;
        private System.Windows.Forms.DataGridViewCheckBoxColumn Select;
        private System.Windows.Forms.DataGridViewTextBoxColumn User;
        private System.Windows.Forms.DataGridViewTextBoxColumn UserId;
        private System.Windows.Forms.CheckBox SelectAll;
    }
}