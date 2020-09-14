namespace XcheckStudioHubManager
{
    partial class InstallLicenseForm
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
            this.Install = new System.Windows.Forms.Button();
            this.LicenseFileLabel = new System.Windows.Forms.Label();
            this.LicenseFile = new System.Windows.Forms.TextBox();
            this.Browse = new System.Windows.Forms.Button();
            this.MainTableLayoutPanel.SuspendLayout();
            this.SuspendLayout();
            // 
            // MainTableLayoutPanel
            // 
            this.MainTableLayoutPanel.ColumnCount = 3;
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 71F));
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 83F));
            this.MainTableLayoutPanel.Controls.Add(this.Cancel, 2, 2);
            this.MainTableLayoutPanel.Controls.Add(this.Install, 1, 2);
            this.MainTableLayoutPanel.Controls.Add(this.LicenseFileLabel, 0, 0);
            this.MainTableLayoutPanel.Controls.Add(this.LicenseFile, 1, 0);
            this.MainTableLayoutPanel.Controls.Add(this.Browse, 2, 0);
            this.MainTableLayoutPanel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.MainTableLayoutPanel.Location = new System.Drawing.Point(0, 0);
            this.MainTableLayoutPanel.Name = "MainTableLayoutPanel";
            this.MainTableLayoutPanel.RowCount = 3;
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.Size = new System.Drawing.Size(452, 62);
            this.MainTableLayoutPanel.TabIndex = 0;
            // 
            // Cancel
            // 
            this.Cancel.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.Cancel.Location = new System.Drawing.Point(374, 39);
            this.Cancel.Name = "Cancel";
            this.Cancel.Size = new System.Drawing.Size(75, 20);
            this.Cancel.TabIndex = 0;
            this.Cancel.Text = "Cancel";
            this.Cancel.UseVisualStyleBackColor = true;
            this.Cancel.Click += new System.EventHandler(this.Cancel_Click);
            // 
            // Install
            // 
            this.Install.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.Install.Location = new System.Drawing.Point(291, 39);
            this.Install.Name = "Install";
            this.Install.Size = new System.Drawing.Size(75, 20);
            this.Install.TabIndex = 1;
            this.Install.Text = "Install";
            this.Install.UseVisualStyleBackColor = true;
            this.Install.Click += new System.EventHandler(this.onInstall);
            // 
            // LicenseFileLabel
            // 
            this.LicenseFileLabel.AutoSize = true;
            this.LicenseFileLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.LicenseFileLabel.Location = new System.Drawing.Point(3, 0);
            this.LicenseFileLabel.Name = "LicenseFileLabel";
            this.LicenseFileLabel.Size = new System.Drawing.Size(65, 30);
            this.LicenseFileLabel.TabIndex = 2;
            this.LicenseFileLabel.Text = "License File";
            this.LicenseFileLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // LicenseFile
            // 
            this.LicenseFile.Dock = System.Windows.Forms.DockStyle.Fill;
            this.LicenseFile.Location = new System.Drawing.Point(74, 3);
            this.LicenseFile.Name = "LicenseFile";
            this.LicenseFile.Size = new System.Drawing.Size(292, 20);
            this.LicenseFile.TabIndex = 3;
            // 
            // Browse
            // 
            this.Browse.Location = new System.Drawing.Point(372, 3);
            this.Browse.Name = "Browse";
            this.Browse.Size = new System.Drawing.Size(75, 20);
            this.Browse.TabIndex = 4;
            this.Browse.Text = "Browse";
            this.Browse.UseVisualStyleBackColor = true;
            this.Browse.Click += new System.EventHandler(this.onBrowse);
            // 
            // InstallLicenseForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(452, 62);
            this.ControlBox = false;
            this.Controls.Add(this.MainTableLayoutPanel);
            this.Name = "InstallLicenseForm";
            this.Text = "Install License ";
            this.MainTableLayoutPanel.ResumeLayout(false);
            this.MainTableLayoutPanel.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TableLayoutPanel MainTableLayoutPanel;
        private System.Windows.Forms.Button Cancel;
        private System.Windows.Forms.Button Install;
        private System.Windows.Forms.Label LicenseFileLabel;
        private System.Windows.Forms.TextBox LicenseFile;
        private System.Windows.Forms.Button Browse;
    }
}