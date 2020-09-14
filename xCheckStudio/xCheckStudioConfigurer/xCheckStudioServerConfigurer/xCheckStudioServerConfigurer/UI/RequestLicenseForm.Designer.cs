namespace XcheckStudioHubManager
{
    partial class RequestLicenseForm
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
            this.Request = new System.Windows.Forms.Button();
            this.NameLabel = new System.Windows.Forms.Label();
            this.OrganizationLabel = new System.Windows.Forms.Label();
            this.DesignationLabel = new System.Windows.Forms.Label();
            this.EmailIDLabel = new System.Windows.Forms.Label();
            this.HostIdLabel = new System.Windows.Forms.Label();
            this.UserName = new System.Windows.Forms.TextBox();
            this.Organization = new System.Windows.Forms.TextBox();
            this.Designation = new System.Windows.Forms.TextBox();
            this.EmailId = new System.Windows.Forms.TextBox();
            this.HostId = new System.Windows.Forms.TextBox();
            this.MainTableLayoutPanel.SuspendLayout();
            this.SuspendLayout();
            // 
            // MainTableLayoutPanel
            // 
            this.MainTableLayoutPanel.ColumnCount = 3;
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 114F));
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 89F));
            this.MainTableLayoutPanel.Controls.Add(this.Cancel, 2, 6);
            this.MainTableLayoutPanel.Controls.Add(this.Request, 1, 6);
            this.MainTableLayoutPanel.Controls.Add(this.NameLabel, 0, 0);
            this.MainTableLayoutPanel.Controls.Add(this.OrganizationLabel, 0, 1);
            this.MainTableLayoutPanel.Controls.Add(this.DesignationLabel, 0, 2);
            this.MainTableLayoutPanel.Controls.Add(this.EmailIDLabel, 0, 3);
            this.MainTableLayoutPanel.Controls.Add(this.HostIdLabel, 0, 4);
            this.MainTableLayoutPanel.Controls.Add(this.UserName, 1, 0);
            this.MainTableLayoutPanel.Controls.Add(this.Organization, 1, 1);
            this.MainTableLayoutPanel.Controls.Add(this.Designation, 1, 2);
            this.MainTableLayoutPanel.Controls.Add(this.EmailId, 1, 3);
            this.MainTableLayoutPanel.Controls.Add(this.HostId, 1, 4);
            this.MainTableLayoutPanel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.MainTableLayoutPanel.Location = new System.Drawing.Point(0, 0);
            this.MainTableLayoutPanel.Name = "MainTableLayoutPanel";
            this.MainTableLayoutPanel.RowCount = 7;
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.Size = new System.Drawing.Size(334, 186);
            this.MainTableLayoutPanel.TabIndex = 0;
            // 
            // Cancel
            // 
            this.Cancel.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.Cancel.Location = new System.Drawing.Point(256, 163);
            this.Cancel.Name = "Cancel";
            this.Cancel.Size = new System.Drawing.Size(75, 20);
            this.Cancel.TabIndex = 0;
            this.Cancel.Text = "Cancel";
            this.Cancel.UseVisualStyleBackColor = true;
            this.Cancel.Click += new System.EventHandler(this.onCancel);
            // 
            // Request
            // 
            this.Request.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.Request.Location = new System.Drawing.Point(167, 163);
            this.Request.Name = "Request";
            this.Request.Size = new System.Drawing.Size(75, 20);
            this.Request.TabIndex = 1;
            this.Request.Text = "Request";
            this.Request.UseVisualStyleBackColor = true;
            this.Request.Click += new System.EventHandler(this.onRequest);
            // 
            // NameLabel
            // 
            this.NameLabel.AutoSize = true;
            this.NameLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.NameLabel.Location = new System.Drawing.Point(3, 0);
            this.NameLabel.Name = "NameLabel";
            this.NameLabel.Size = new System.Drawing.Size(108, 30);
            this.NameLabel.TabIndex = 2;
            this.NameLabel.Text = "Name";
            this.NameLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // OrganizationLabel
            // 
            this.OrganizationLabel.AutoSize = true;
            this.OrganizationLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.OrganizationLabel.Location = new System.Drawing.Point(3, 30);
            this.OrganizationLabel.Name = "OrganizationLabel";
            this.OrganizationLabel.Size = new System.Drawing.Size(108, 30);
            this.OrganizationLabel.TabIndex = 3;
            this.OrganizationLabel.Text = "Organization";
            this.OrganizationLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // DesignationLabel
            // 
            this.DesignationLabel.AutoSize = true;
            this.DesignationLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.DesignationLabel.Location = new System.Drawing.Point(3, 60);
            this.DesignationLabel.Name = "DesignationLabel";
            this.DesignationLabel.Size = new System.Drawing.Size(108, 30);
            this.DesignationLabel.TabIndex = 4;
            this.DesignationLabel.Text = "Customer Ref No";
            this.DesignationLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // EmailIDLabel
            // 
            this.EmailIDLabel.AutoSize = true;
            this.EmailIDLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.EmailIDLabel.Location = new System.Drawing.Point(3, 90);
            this.EmailIDLabel.Name = "EmailIDLabel";
            this.EmailIDLabel.Size = new System.Drawing.Size(108, 30);
            this.EmailIDLabel.TabIndex = 5;
            this.EmailIDLabel.Text = "Email ID";
            this.EmailIDLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // HostIdLabel
            // 
            this.HostIdLabel.AutoSize = true;
            this.HostIdLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.HostIdLabel.Location = new System.Drawing.Point(3, 120);
            this.HostIdLabel.Name = "HostIdLabel";
            this.HostIdLabel.Size = new System.Drawing.Size(108, 30);
            this.HostIdLabel.TabIndex = 6;
            this.HostIdLabel.Text = "Host ID(MAC ID)";
            this.HostIdLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // UserName
            // 
            this.MainTableLayoutPanel.SetColumnSpan(this.UserName, 2);
            this.UserName.Dock = System.Windows.Forms.DockStyle.Fill;
            this.UserName.Location = new System.Drawing.Point(117, 3);
            this.UserName.Name = "UserName";
            this.UserName.Size = new System.Drawing.Size(214, 20);
            this.UserName.TabIndex = 7;
            // 
            // Organization
            // 
            this.MainTableLayoutPanel.SetColumnSpan(this.Organization, 2);
            this.Organization.Dock = System.Windows.Forms.DockStyle.Fill;
            this.Organization.Location = new System.Drawing.Point(117, 33);
            this.Organization.Name = "Organization";
            this.Organization.Size = new System.Drawing.Size(214, 20);
            this.Organization.TabIndex = 8;
            // 
            // Designation
            // 
            this.MainTableLayoutPanel.SetColumnSpan(this.Designation, 2);
            this.Designation.Dock = System.Windows.Forms.DockStyle.Fill;
            this.Designation.Location = new System.Drawing.Point(117, 63);
            this.Designation.Name = "Designation";
            this.Designation.Size = new System.Drawing.Size(214, 20);
            this.Designation.TabIndex = 9;
            // 
            // EmailId
            // 
            this.MainTableLayoutPanel.SetColumnSpan(this.EmailId, 2);
            this.EmailId.Dock = System.Windows.Forms.DockStyle.Fill;
            this.EmailId.Location = new System.Drawing.Point(117, 93);
            this.EmailId.Name = "EmailId";
            this.EmailId.Size = new System.Drawing.Size(214, 20);
            this.EmailId.TabIndex = 10;
            // 
            // HostId
            // 
            this.MainTableLayoutPanel.SetColumnSpan(this.HostId, 2);
            this.HostId.Dock = System.Windows.Forms.DockStyle.Fill;
            this.HostId.Location = new System.Drawing.Point(117, 123);
            this.HostId.Name = "HostId";
            this.HostId.Size = new System.Drawing.Size(214, 20);
            this.HostId.TabIndex = 11;
            // 
            // RequestLicenseForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(334, 186);
            this.ControlBox = false;
            this.Controls.Add(this.MainTableLayoutPanel);
            this.Name = "RequestLicenseForm";
            this.Text = "Request License Form";
            this.MainTableLayoutPanel.ResumeLayout(false);
            this.MainTableLayoutPanel.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TableLayoutPanel MainTableLayoutPanel;
        private System.Windows.Forms.Button Cancel;
        private System.Windows.Forms.Button Request;
        private System.Windows.Forms.Label NameLabel;
        private System.Windows.Forms.Label OrganizationLabel;
        private System.Windows.Forms.Label DesignationLabel;
        private System.Windows.Forms.Label EmailIDLabel;
        private System.Windows.Forms.Label HostIdLabel;
        private System.Windows.Forms.TextBox UserName;
        private System.Windows.Forms.TextBox Organization;
        private System.Windows.Forms.TextBox Designation;
        private System.Windows.Forms.TextBox EmailId;
        private System.Windows.Forms.TextBox HostId;
    }
}