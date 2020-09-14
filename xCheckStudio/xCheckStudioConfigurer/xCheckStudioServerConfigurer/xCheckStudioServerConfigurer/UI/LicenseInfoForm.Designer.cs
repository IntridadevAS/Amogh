namespace XcheckStudioHubManager
{
    partial class LicenseInfoForm
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
            this.ProductLabel = new System.Windows.Forms.Label();
            this.VersionLabel = new System.Windows.Forms.Label();
            this.Product = new System.Windows.Forms.Label();
            this.Version = new System.Windows.Forms.Label();
            this.LicenseLabel = new System.Windows.Forms.Label();
            this.License = new System.Windows.Forms.Label();
            this.Cancel = new System.Windows.Forms.Button();
            this.RequestLicense = new System.Windows.Forms.Button();
            this.InstallLicense = new System.Windows.Forms.Button();
            this.MainTableLayoutPanel.SuspendLayout();
            this.SuspendLayout();
            // 
            // MainTableLayoutPanel
            // 
            this.MainTableLayoutPanel.ColumnCount = 4;
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 68F));
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 109F));
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 83F));
            this.MainTableLayoutPanel.Controls.Add(this.ProductLabel, 0, 0);
            this.MainTableLayoutPanel.Controls.Add(this.VersionLabel, 0, 1);
            this.MainTableLayoutPanel.Controls.Add(this.Product, 1, 0);
            this.MainTableLayoutPanel.Controls.Add(this.Version, 1, 1);
            this.MainTableLayoutPanel.Controls.Add(this.LicenseLabel, 0, 2);
            this.MainTableLayoutPanel.Controls.Add(this.License, 1, 2);
            this.MainTableLayoutPanel.Controls.Add(this.Cancel, 3, 3);
            this.MainTableLayoutPanel.Controls.Add(this.RequestLicense, 2, 3);
            this.MainTableLayoutPanel.Controls.Add(this.InstallLicense, 1, 3);
            this.MainTableLayoutPanel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.MainTableLayoutPanel.Location = new System.Drawing.Point(0, 0);
            this.MainTableLayoutPanel.Name = "MainTableLayoutPanel";
            this.MainTableLayoutPanel.RowCount = 4;
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 32F));
            this.MainTableLayoutPanel.Size = new System.Drawing.Size(383, 123);
            this.MainTableLayoutPanel.TabIndex = 0;
            // 
            // ProductLabel
            // 
            this.ProductLabel.AutoSize = true;
            this.ProductLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.ProductLabel.Location = new System.Drawing.Point(3, 0);
            this.ProductLabel.Name = "ProductLabel";
            this.ProductLabel.Size = new System.Drawing.Size(62, 30);
            this.ProductLabel.TabIndex = 0;
            this.ProductLabel.Text = "Product";
            this.ProductLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // VersionLabel
            // 
            this.VersionLabel.AutoSize = true;
            this.VersionLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.VersionLabel.Location = new System.Drawing.Point(3, 30);
            this.VersionLabel.Name = "VersionLabel";
            this.VersionLabel.Size = new System.Drawing.Size(62, 30);
            this.VersionLabel.TabIndex = 1;
            this.VersionLabel.Text = "Version";
            this.VersionLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // Product
            // 
            this.Product.AutoSize = true;
            this.MainTableLayoutPanel.SetColumnSpan(this.Product, 2);
            this.Product.Dock = System.Windows.Forms.DockStyle.Fill;
            this.Product.Location = new System.Drawing.Point(71, 0);
            this.Product.Name = "Product";
            this.Product.Size = new System.Drawing.Size(226, 30);
            this.Product.TabIndex = 3;
            this.Product.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // Version
            // 
            this.Version.AutoSize = true;
            this.MainTableLayoutPanel.SetColumnSpan(this.Version, 2);
            this.Version.Dock = System.Windows.Forms.DockStyle.Fill;
            this.Version.Location = new System.Drawing.Point(71, 30);
            this.Version.Name = "Version";
            this.Version.Size = new System.Drawing.Size(226, 30);
            this.Version.TabIndex = 4;
            this.Version.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // LicenseLabel
            // 
            this.LicenseLabel.AutoSize = true;
            this.LicenseLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.LicenseLabel.Location = new System.Drawing.Point(3, 60);
            this.LicenseLabel.Name = "LicenseLabel";
            this.LicenseLabel.Size = new System.Drawing.Size(62, 30);
            this.LicenseLabel.TabIndex = 5;
            this.LicenseLabel.Text = "License";
            this.LicenseLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // License
            // 
            this.License.AutoSize = true;
            this.MainTableLayoutPanel.SetColumnSpan(this.License, 2);
            this.License.Dock = System.Windows.Forms.DockStyle.Fill;
            this.License.Location = new System.Drawing.Point(71, 60);
            this.License.Name = "License";
            this.License.Size = new System.Drawing.Size(226, 30);
            this.License.TabIndex = 6;
            this.License.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // Cancel
            // 
            this.Cancel.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.Cancel.Location = new System.Drawing.Point(305, 100);
            this.Cancel.Name = "Cancel";
            this.Cancel.Size = new System.Drawing.Size(75, 20);
            this.Cancel.TabIndex = 2;
            this.Cancel.Text = "Close";
            this.Cancel.UseVisualStyleBackColor = true;
            this.Cancel.Click += new System.EventHandler(this.onCancel);
            // 
            // RequestLicense
            // 
            this.RequestLicense.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.RequestLicense.Location = new System.Drawing.Point(197, 100);
            this.RequestLicense.Name = "RequestLicense";
            this.RequestLicense.Size = new System.Drawing.Size(100, 20);
            this.RequestLicense.TabIndex = 7;
            this.RequestLicense.Text = "Request License";
            this.RequestLicense.UseVisualStyleBackColor = true;
            this.RequestLicense.Click += new System.EventHandler(this.onRequestLicense);
            // 
            // InstallLicense
            // 
            this.InstallLicense.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.InstallLicense.Location = new System.Drawing.Point(88, 100);
            this.InstallLicense.Name = "InstallLicense";
            this.InstallLicense.Size = new System.Drawing.Size(100, 20);
            this.InstallLicense.TabIndex = 8;
            this.InstallLicense.Text = "Install License";
            this.InstallLicense.UseVisualStyleBackColor = true;
            this.InstallLicense.Click += new System.EventHandler(this.onInstallLicense);
            // 
            // LicenseInfoForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(383, 123);
            this.ControlBox = false;
            this.Controls.Add(this.MainTableLayoutPanel);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.Name = "LicenseInfoForm";
            this.Text = "License Info";
            this.MainTableLayoutPanel.ResumeLayout(false);
            this.MainTableLayoutPanel.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TableLayoutPanel MainTableLayoutPanel;
        private System.Windows.Forms.Label ProductLabel;
        private System.Windows.Forms.Label VersionLabel;
        private System.Windows.Forms.Button Cancel;
        private System.Windows.Forms.Label Product;
        private System.Windows.Forms.Label Version;
        private System.Windows.Forms.Label LicenseLabel;
        private System.Windows.Forms.Label License;
        private System.Windows.Forms.Button RequestLicense;
        private System.Windows.Forms.Button InstallLicense;
    }
}