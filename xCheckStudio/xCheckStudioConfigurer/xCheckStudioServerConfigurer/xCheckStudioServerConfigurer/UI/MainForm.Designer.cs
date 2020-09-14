namespace XcheckStudioHubManager
{
    partial class MainForm
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
            this.components = new System.ComponentModel.Container();
            System.Windows.Forms.Label UploadMaxFileSizeLabel;
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(MainForm));
            this.MainTableLayoutPanel = new System.Windows.Forms.TableLayoutPanel();
            this.MaxFileUploads = new System.Windows.Forms.TextBox();
            this.BrowseServerRootDir = new System.Windows.Forms.Button();
            this.ServerRootDir = new System.Windows.Forms.TextBox();
            this.ServerRootDirLable = new System.Windows.Forms.Label();
            this.MemoryLimit = new System.Windows.Forms.TextBox();
            this.UploadMaxFileSize = new System.Windows.Forms.TextBox();
            this.PostMaxSize = new System.Windows.Forms.TextBox();
            this.MaxInputTime = new System.Windows.Forms.TextBox();
            this.MaxExecutionTime = new System.Windows.Forms.TextBox();
            this.ApachePort = new System.Windows.Forms.TextBox();
            this.ApachePortLabel = new System.Windows.Forms.Label();
            this.Start = new System.Windows.Forms.Button();
            this.WAMPDirectoryLabel = new System.Windows.Forms.Label();
            this.WAMPDirectory = new System.Windows.Forms.TextBox();
            this.Cancel = new System.Windows.Forms.Button();
            this.Stop = new System.Windows.Forms.Button();
            this.BrowseWampDir = new System.Windows.Forms.Button();
            this.MaxExecutionTimeLabel = new System.Windows.Forms.Label();
            this.MaxInputTimeLabel = new System.Windows.Forms.Label();
            this.PostMaxSizeLabel = new System.Windows.Forms.Label();
            this.MemoryLimitLabel = new System.Windows.Forms.Label();
            this.SQLServerIntegration = new System.Windows.Forms.CheckBox();
            this.Online = new System.Windows.Forms.CheckBox();
            this.AllowEdit = new System.Windows.Forms.CheckBox();
            this.LicenseLinkLabel = new System.Windows.Forms.LinkLabel();
            this.LicenseStatusLabel = new System.Windows.Forms.Label();
            this.MaxFileUploadsLabel = new System.Windows.Forms.Label();
            this.SignOutUsers = new System.Windows.Forms.Button();
            this.NotifyIcon = new System.Windows.Forms.NotifyIcon(this.components);
            UploadMaxFileSizeLabel = new System.Windows.Forms.Label();
            this.MainTableLayoutPanel.SuspendLayout();
            this.SuspendLayout();
            // 
            // UploadMaxFileSizeLabel
            // 
            UploadMaxFileSizeLabel.AutoSize = true;
            this.MainTableLayoutPanel.SetColumnSpan(UploadMaxFileSizeLabel, 2);
            UploadMaxFileSizeLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            UploadMaxFileSizeLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            UploadMaxFileSizeLabel.Location = new System.Drawing.Point(3, 180);
            UploadMaxFileSizeLabel.Name = "UploadMaxFileSizeLabel";
            UploadMaxFileSizeLabel.Size = new System.Drawing.Size(132, 30);
            UploadMaxFileSizeLabel.TabIndex = 16;
            UploadMaxFileSizeLabel.Text = "Upload Max File Size";
            UploadMaxFileSizeLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // MainTableLayoutPanel
            // 
            this.MainTableLayoutPanel.ColumnCount = 5;
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 54F));
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 84F));
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 84F));
            this.MainTableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 81F));
            this.MainTableLayoutPanel.Controls.Add(this.MaxFileUploads, 2, 8);
            this.MainTableLayoutPanel.Controls.Add(this.BrowseServerRootDir, 4, 1);
            this.MainTableLayoutPanel.Controls.Add(this.ServerRootDir, 2, 1);
            this.MainTableLayoutPanel.Controls.Add(this.ServerRootDirLable, 0, 1);
            this.MainTableLayoutPanel.Controls.Add(this.MemoryLimit, 2, 7);
            this.MainTableLayoutPanel.Controls.Add(this.UploadMaxFileSize, 2, 6);
            this.MainTableLayoutPanel.Controls.Add(this.PostMaxSize, 2, 5);
            this.MainTableLayoutPanel.Controls.Add(this.MaxInputTime, 2, 4);
            this.MainTableLayoutPanel.Controls.Add(this.MaxExecutionTime, 2, 3);
            this.MainTableLayoutPanel.Controls.Add(this.ApachePort, 2, 2);
            this.MainTableLayoutPanel.Controls.Add(this.ApachePortLabel, 0, 2);
            this.MainTableLayoutPanel.Controls.Add(this.Start, 2, 13);
            this.MainTableLayoutPanel.Controls.Add(this.WAMPDirectoryLabel, 0, 0);
            this.MainTableLayoutPanel.Controls.Add(this.WAMPDirectory, 2, 0);
            this.MainTableLayoutPanel.Controls.Add(this.Cancel, 4, 13);
            this.MainTableLayoutPanel.Controls.Add(this.Stop, 3, 13);
            this.MainTableLayoutPanel.Controls.Add(this.BrowseWampDir, 4, 0);
            this.MainTableLayoutPanel.Controls.Add(this.MaxExecutionTimeLabel, 0, 3);
            this.MainTableLayoutPanel.Controls.Add(this.MaxInputTimeLabel, 0, 4);
            this.MainTableLayoutPanel.Controls.Add(this.PostMaxSizeLabel, 0, 5);
            this.MainTableLayoutPanel.Controls.Add(UploadMaxFileSizeLabel, 0, 6);
            this.MainTableLayoutPanel.Controls.Add(this.MemoryLimitLabel, 0, 7);
            this.MainTableLayoutPanel.Controls.Add(this.SQLServerIntegration, 2, 9);
            this.MainTableLayoutPanel.Controls.Add(this.Online, 2, 10);
            this.MainTableLayoutPanel.Controls.Add(this.AllowEdit, 2, 11);
            this.MainTableLayoutPanel.Controls.Add(this.LicenseLinkLabel, 0, 13);
            this.MainTableLayoutPanel.Controls.Add(this.LicenseStatusLabel, 1, 13);
            this.MainTableLayoutPanel.Controls.Add(this.MaxFileUploadsLabel, 0, 8);
            this.MainTableLayoutPanel.Controls.Add(this.SignOutUsers, 0, 12);
            this.MainTableLayoutPanel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.MainTableLayoutPanel.Location = new System.Drawing.Point(0, 0);
            this.MainTableLayoutPanel.Name = "MainTableLayoutPanel";
            this.MainTableLayoutPanel.RowCount = 14;
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.MainTableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.MainTableLayoutPanel.Size = new System.Drawing.Size(463, 418);
            this.MainTableLayoutPanel.TabIndex = 0;
            // 
            // MaxFileUploads
            // 
            this.MaxFileUploads.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.MainTableLayoutPanel.SetColumnSpan(this.MaxFileUploads, 2);
            this.MaxFileUploads.Dock = System.Windows.Forms.DockStyle.Fill;
            this.MaxFileUploads.Enabled = false;
            this.MaxFileUploads.Location = new System.Drawing.Point(141, 243);
            this.MaxFileUploads.Name = "MaxFileUploads";
            this.MaxFileUploads.Size = new System.Drawing.Size(238, 20);
            this.MaxFileUploads.TabIndex = 28;
            this.MaxFileUploads.Text = "100";
            // 
            // BrowseServerRootDir
            // 
            this.BrowseServerRootDir.Enabled = false;
            this.BrowseServerRootDir.Location = new System.Drawing.Point(385, 33);
            this.BrowseServerRootDir.Name = "BrowseServerRootDir";
            this.BrowseServerRootDir.Size = new System.Drawing.Size(75, 23);
            this.BrowseServerRootDir.TabIndex = 24;
            this.BrowseServerRootDir.Text = "Browse";
            this.BrowseServerRootDir.UseVisualStyleBackColor = true;
            this.BrowseServerRootDir.Click += new System.EventHandler(this.BrowseServerRootDir_Click);
            // 
            // ServerRootDir
            // 
            this.ServerRootDir.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.MainTableLayoutPanel.SetColumnSpan(this.ServerRootDir, 2);
            this.ServerRootDir.Dock = System.Windows.Forms.DockStyle.Fill;
            this.ServerRootDir.Enabled = false;
            this.ServerRootDir.Location = new System.Drawing.Point(141, 33);
            this.ServerRootDir.Name = "ServerRootDir";
            this.ServerRootDir.Size = new System.Drawing.Size(238, 20);
            this.ServerRootDir.TabIndex = 23;
            this.ServerRootDir.Text = "C:\\Program Files\\xCheckStudio";
            // 
            // ServerRootDirLable
            // 
            this.ServerRootDirLable.AutoSize = true;
            this.MainTableLayoutPanel.SetColumnSpan(this.ServerRootDirLable, 2);
            this.ServerRootDirLable.Dock = System.Windows.Forms.DockStyle.Fill;
            this.ServerRootDirLable.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.ServerRootDirLable.Location = new System.Drawing.Point(3, 30);
            this.ServerRootDirLable.Name = "ServerRootDirLable";
            this.ServerRootDirLable.Size = new System.Drawing.Size(132, 30);
            this.ServerRootDirLable.TabIndex = 22;
            this.ServerRootDirLable.Text = "Server Root Directory";
            this.ServerRootDirLable.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // MemoryLimit
            // 
            this.MemoryLimit.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.MainTableLayoutPanel.SetColumnSpan(this.MemoryLimit, 2);
            this.MemoryLimit.Dock = System.Windows.Forms.DockStyle.Fill;
            this.MemoryLimit.Enabled = false;
            this.MemoryLimit.Location = new System.Drawing.Point(141, 213);
            this.MemoryLimit.Name = "MemoryLimit";
            this.MemoryLimit.Size = new System.Drawing.Size(238, 20);
            this.MemoryLimit.TabIndex = 12;
            this.MemoryLimit.Text = "1024M";
            // 
            // UploadMaxFileSize
            // 
            this.UploadMaxFileSize.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.MainTableLayoutPanel.SetColumnSpan(this.UploadMaxFileSize, 2);
            this.UploadMaxFileSize.Dock = System.Windows.Forms.DockStyle.Fill;
            this.UploadMaxFileSize.Enabled = false;
            this.UploadMaxFileSize.Location = new System.Drawing.Point(141, 183);
            this.UploadMaxFileSize.Name = "UploadMaxFileSize";
            this.UploadMaxFileSize.Size = new System.Drawing.Size(238, 20);
            this.UploadMaxFileSize.TabIndex = 11;
            this.UploadMaxFileSize.Text = "1024M";
            // 
            // PostMaxSize
            // 
            this.PostMaxSize.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.MainTableLayoutPanel.SetColumnSpan(this.PostMaxSize, 2);
            this.PostMaxSize.Dock = System.Windows.Forms.DockStyle.Fill;
            this.PostMaxSize.Enabled = false;
            this.PostMaxSize.Location = new System.Drawing.Point(141, 153);
            this.PostMaxSize.Name = "PostMaxSize";
            this.PostMaxSize.Size = new System.Drawing.Size(238, 20);
            this.PostMaxSize.TabIndex = 10;
            this.PostMaxSize.Text = "1024M";
            // 
            // MaxInputTime
            // 
            this.MaxInputTime.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.MainTableLayoutPanel.SetColumnSpan(this.MaxInputTime, 2);
            this.MaxInputTime.Dock = System.Windows.Forms.DockStyle.Fill;
            this.MaxInputTime.Enabled = false;
            this.MaxInputTime.Location = new System.Drawing.Point(141, 123);
            this.MaxInputTime.Name = "MaxInputTime";
            this.MaxInputTime.Size = new System.Drawing.Size(238, 20);
            this.MaxInputTime.TabIndex = 9;
            this.MaxInputTime.Text = "120";
            // 
            // MaxExecutionTime
            // 
            this.MaxExecutionTime.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.MainTableLayoutPanel.SetColumnSpan(this.MaxExecutionTime, 2);
            this.MaxExecutionTime.Dock = System.Windows.Forms.DockStyle.Fill;
            this.MaxExecutionTime.Enabled = false;
            this.MaxExecutionTime.Location = new System.Drawing.Point(141, 93);
            this.MaxExecutionTime.Name = "MaxExecutionTime";
            this.MaxExecutionTime.Size = new System.Drawing.Size(238, 20);
            this.MaxExecutionTime.TabIndex = 8;
            this.MaxExecutionTime.Text = "300";
            // 
            // ApachePort
            // 
            this.ApachePort.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.MainTableLayoutPanel.SetColumnSpan(this.ApachePort, 2);
            this.ApachePort.Dock = System.Windows.Forms.DockStyle.Fill;
            this.ApachePort.Enabled = false;
            this.ApachePort.Location = new System.Drawing.Point(141, 63);
            this.ApachePort.Name = "ApachePort";
            this.ApachePort.Size = new System.Drawing.Size(238, 20);
            this.ApachePort.TabIndex = 7;
            this.ApachePort.Text = "11180";
            // 
            // ApachePortLabel
            // 
            this.ApachePortLabel.AutoSize = true;
            this.MainTableLayoutPanel.SetColumnSpan(this.ApachePortLabel, 2);
            this.ApachePortLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.ApachePortLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.ApachePortLabel.Location = new System.Drawing.Point(3, 60);
            this.ApachePortLabel.Name = "ApachePortLabel";
            this.ApachePortLabel.Size = new System.Drawing.Size(132, 30);
            this.ApachePortLabel.TabIndex = 6;
            this.ApachePortLabel.Text = "Apache Port";
            this.ApachePortLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // Start
            // 
            this.Start.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.Start.Enabled = false;
            this.Start.Location = new System.Drawing.Point(220, 395);
            this.Start.Name = "Start";
            this.Start.Size = new System.Drawing.Size(75, 20);
            this.Start.TabIndex = 1;
            this.Start.Text = "Start Server";
            this.Start.UseVisualStyleBackColor = true;
            this.Start.Click += new System.EventHandler(this.onStart);
            // 
            // WAMPDirectoryLabel
            // 
            this.WAMPDirectoryLabel.AutoSize = true;
            this.MainTableLayoutPanel.SetColumnSpan(this.WAMPDirectoryLabel, 2);
            this.WAMPDirectoryLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.WAMPDirectoryLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.WAMPDirectoryLabel.Location = new System.Drawing.Point(3, 0);
            this.WAMPDirectoryLabel.Name = "WAMPDirectoryLabel";
            this.WAMPDirectoryLabel.Size = new System.Drawing.Size(132, 30);
            this.WAMPDirectoryLabel.TabIndex = 0;
            this.WAMPDirectoryLabel.Text = "WAMP Directory";
            this.WAMPDirectoryLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // WAMPDirectory
            // 
            this.WAMPDirectory.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.MainTableLayoutPanel.SetColumnSpan(this.WAMPDirectory, 2);
            this.WAMPDirectory.Dock = System.Windows.Forms.DockStyle.Fill;
            this.WAMPDirectory.Enabled = false;
            this.WAMPDirectory.Location = new System.Drawing.Point(141, 3);
            this.WAMPDirectory.Name = "WAMPDirectory";
            this.WAMPDirectory.Size = new System.Drawing.Size(238, 20);
            this.WAMPDirectory.TabIndex = 1;
            this.WAMPDirectory.Text = "C:\\wamp64";
            // 
            // Cancel
            // 
            this.Cancel.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.Cancel.Location = new System.Drawing.Point(386, 395);
            this.Cancel.Name = "Cancel";
            this.Cancel.Size = new System.Drawing.Size(74, 20);
            this.Cancel.TabIndex = 3;
            this.Cancel.Text = "Cancel";
            this.Cancel.UseVisualStyleBackColor = true;
            this.Cancel.Click += new System.EventHandler(this.onCancel);
            // 
            // Stop
            // 
            this.Stop.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.Stop.Enabled = false;
            this.Stop.Location = new System.Drawing.Point(304, 395);
            this.Stop.Name = "Stop";
            this.Stop.Size = new System.Drawing.Size(75, 20);
            this.Stop.TabIndex = 4;
            this.Stop.Text = "Stop Server";
            this.Stop.UseVisualStyleBackColor = true;
            this.Stop.Click += new System.EventHandler(this.onStop);
            // 
            // BrowseWampDir
            // 
            this.BrowseWampDir.Enabled = false;
            this.BrowseWampDir.Location = new System.Drawing.Point(385, 3);
            this.BrowseWampDir.Name = "BrowseWampDir";
            this.BrowseWampDir.Size = new System.Drawing.Size(75, 23);
            this.BrowseWampDir.TabIndex = 5;
            this.BrowseWampDir.Text = "Browse";
            this.BrowseWampDir.UseVisualStyleBackColor = true;
            this.BrowseWampDir.Click += new System.EventHandler(this.BrowseWampDir_Click);
            // 
            // MaxExecutionTimeLabel
            // 
            this.MaxExecutionTimeLabel.AutoSize = true;
            this.MainTableLayoutPanel.SetColumnSpan(this.MaxExecutionTimeLabel, 2);
            this.MaxExecutionTimeLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.MaxExecutionTimeLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.MaxExecutionTimeLabel.Location = new System.Drawing.Point(3, 90);
            this.MaxExecutionTimeLabel.Name = "MaxExecutionTimeLabel";
            this.MaxExecutionTimeLabel.Size = new System.Drawing.Size(132, 30);
            this.MaxExecutionTimeLabel.TabIndex = 13;
            this.MaxExecutionTimeLabel.Text = "Max Execution Time";
            this.MaxExecutionTimeLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // MaxInputTimeLabel
            // 
            this.MaxInputTimeLabel.AutoSize = true;
            this.MainTableLayoutPanel.SetColumnSpan(this.MaxInputTimeLabel, 2);
            this.MaxInputTimeLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.MaxInputTimeLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.MaxInputTimeLabel.Location = new System.Drawing.Point(3, 120);
            this.MaxInputTimeLabel.Name = "MaxInputTimeLabel";
            this.MaxInputTimeLabel.Size = new System.Drawing.Size(132, 30);
            this.MaxInputTimeLabel.TabIndex = 14;
            this.MaxInputTimeLabel.Text = "Max Input Time";
            this.MaxInputTimeLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // PostMaxSizeLabel
            // 
            this.PostMaxSizeLabel.AutoSize = true;
            this.MainTableLayoutPanel.SetColumnSpan(this.PostMaxSizeLabel, 2);
            this.PostMaxSizeLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.PostMaxSizeLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.PostMaxSizeLabel.Location = new System.Drawing.Point(3, 150);
            this.PostMaxSizeLabel.Name = "PostMaxSizeLabel";
            this.PostMaxSizeLabel.Size = new System.Drawing.Size(132, 30);
            this.PostMaxSizeLabel.TabIndex = 15;
            this.PostMaxSizeLabel.Text = "Post Max Size";
            this.PostMaxSizeLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // MemoryLimitLabel
            // 
            this.MemoryLimitLabel.AutoSize = true;
            this.MainTableLayoutPanel.SetColumnSpan(this.MemoryLimitLabel, 2);
            this.MemoryLimitLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.MemoryLimitLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.MemoryLimitLabel.Location = new System.Drawing.Point(3, 210);
            this.MemoryLimitLabel.Name = "MemoryLimitLabel";
            this.MemoryLimitLabel.Size = new System.Drawing.Size(132, 30);
            this.MemoryLimitLabel.TabIndex = 17;
            this.MemoryLimitLabel.Text = "Memory Limit";
            this.MemoryLimitLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // SQLServerIntegration
            // 
            this.SQLServerIntegration.AutoSize = true;
            this.SQLServerIntegration.Checked = true;
            this.SQLServerIntegration.CheckState = System.Windows.Forms.CheckState.Checked;
            this.MainTableLayoutPanel.SetColumnSpan(this.SQLServerIntegration, 2);
            this.SQLServerIntegration.Dock = System.Windows.Forms.DockStyle.Fill;
            this.SQLServerIntegration.Enabled = false;
            this.SQLServerIntegration.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.SQLServerIntegration.Location = new System.Drawing.Point(141, 273);
            this.SQLServerIntegration.Name = "SQLServerIntegration";
            this.SQLServerIntegration.Size = new System.Drawing.Size(238, 24);
            this.SQLServerIntegration.TabIndex = 19;
            this.SQLServerIntegration.Text = "SQL Server Integration";
            this.SQLServerIntegration.UseVisualStyleBackColor = true;
            // 
            // Online
            // 
            this.Online.AutoSize = true;
            this.Online.Checked = true;
            this.Online.CheckState = System.Windows.Forms.CheckState.Checked;
            this.MainTableLayoutPanel.SetColumnSpan(this.Online, 2);
            this.Online.Dock = System.Windows.Forms.DockStyle.Fill;
            this.Online.Enabled = false;
            this.Online.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.Online.Location = new System.Drawing.Point(141, 303);
            this.Online.Name = "Online";
            this.Online.Size = new System.Drawing.Size(238, 24);
            this.Online.TabIndex = 21;
            this.Online.Text = "Online";
            this.Online.UseVisualStyleBackColor = true;
            // 
            // AllowEdit
            // 
            this.AllowEdit.AutoSize = true;
            this.AllowEdit.Dock = System.Windows.Forms.DockStyle.Fill;
            this.AllowEdit.Enabled = false;
            this.AllowEdit.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.AllowEdit.Location = new System.Drawing.Point(141, 333);
            this.AllowEdit.Name = "AllowEdit";
            this.AllowEdit.Size = new System.Drawing.Size(154, 24);
            this.AllowEdit.TabIndex = 20;
            this.AllowEdit.Text = "Edit Settings";
            this.AllowEdit.UseVisualStyleBackColor = true;
            this.AllowEdit.CheckedChanged += new System.EventHandler(this.onAllowEditCheckChanged);
            // 
            // LicenseLinkLabel
            // 
            this.LicenseLinkLabel.AutoSize = true;
            this.LicenseLinkLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.LicenseLinkLabel.Location = new System.Drawing.Point(3, 388);
            this.LicenseLinkLabel.Name = "LicenseLinkLabel";
            this.LicenseLinkLabel.Size = new System.Drawing.Size(48, 30);
            this.LicenseLinkLabel.TabIndex = 25;
            this.LicenseLinkLabel.TabStop = true;
            this.LicenseLinkLabel.Text = "License:";
            this.LicenseLinkLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            this.LicenseLinkLabel.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.onLicenseLinkLabelClicked);
            // 
            // LicenseStatusLabel
            // 
            this.LicenseStatusLabel.AutoSize = true;
            this.LicenseStatusLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.LicenseStatusLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.LicenseStatusLabel.Location = new System.Drawing.Point(54, 388);
            this.LicenseStatusLabel.Margin = new System.Windows.Forms.Padding(0, 0, 3, 0);
            this.LicenseStatusLabel.Name = "LicenseStatusLabel";
            this.LicenseStatusLabel.Size = new System.Drawing.Size(81, 30);
            this.LicenseStatusLabel.TabIndex = 26;
            this.LicenseStatusLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // MaxFileUploadsLabel
            // 
            this.MaxFileUploadsLabel.AutoSize = true;
            this.MainTableLayoutPanel.SetColumnSpan(this.MaxFileUploadsLabel, 2);
            this.MaxFileUploadsLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.MaxFileUploadsLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.MaxFileUploadsLabel.Location = new System.Drawing.Point(3, 240);
            this.MaxFileUploadsLabel.Name = "MaxFileUploadsLabel";
            this.MaxFileUploadsLabel.Size = new System.Drawing.Size(132, 30);
            this.MaxFileUploadsLabel.TabIndex = 27;
            this.MaxFileUploadsLabel.Text = "Max File Uploads";
            this.MaxFileUploadsLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // SignOutUsers
            // 
            this.MainTableLayoutPanel.SetColumnSpan(this.SignOutUsers, 2);
            this.SignOutUsers.Dock = System.Windows.Forms.DockStyle.Fill;
            this.SignOutUsers.Location = new System.Drawing.Point(3, 363);
            this.SignOutUsers.Name = "SignOutUsers";
            this.SignOutUsers.Size = new System.Drawing.Size(132, 22);
            this.SignOutUsers.TabIndex = 30;
            this.SignOutUsers.Text = "Sign Out Users";
            this.SignOutUsers.UseVisualStyleBackColor = true;
            this.SignOutUsers.Click += new System.EventHandler(this.onSignOutUsers);
            // 
            // NotifyIcon
            // 
            this.NotifyIcon.BalloonTipIcon = System.Windows.Forms.ToolTipIcon.Info;
            this.NotifyIcon.BalloonTipText = "XcheckStudio-HubManager";
            this.NotifyIcon.BalloonTipTitle = "XcheckStudio-HubManager";
            this.NotifyIcon.Icon = ((System.Drawing.Icon)(resources.GetObject("NotifyIcon.Icon")));
            this.NotifyIcon.Text = "XcheckStudio-HubManager";
            this.NotifyIcon.MouseClick += new System.Windows.Forms.MouseEventHandler(this.onNotifyIconClick);
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.AutoValidate = System.Windows.Forms.AutoValidate.EnableAllowFocusChange;
            this.ClientSize = new System.Drawing.Size(463, 418);
            this.Controls.Add(this.MainTableLayoutPanel);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Name = "MainForm";
            this.Text = "XcheckStudio Hub Manager";
            this.Load += new System.EventHandler(this.onMainFormLoad);
            this.Resize += new System.EventHandler(this.onResize);
            this.MainTableLayoutPanel.ResumeLayout(false);
            this.MainTableLayoutPanel.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TableLayoutPanel MainTableLayoutPanel;
        private System.Windows.Forms.Label WAMPDirectoryLabel;
        private System.Windows.Forms.TextBox WAMPDirectory;
        private System.Windows.Forms.Button Start;
        private System.Windows.Forms.Button Cancel;
        private System.Windows.Forms.Button Stop;
        private System.Windows.Forms.Button BrowseWampDir;
        private System.Windows.Forms.TextBox ApachePort;
        private System.Windows.Forms.Label ApachePortLabel;
        private System.Windows.Forms.TextBox MaxInputTime;
        private System.Windows.Forms.TextBox MaxExecutionTime;
        private System.Windows.Forms.TextBox MemoryLimit;
        private System.Windows.Forms.TextBox UploadMaxFileSize;
        private System.Windows.Forms.TextBox PostMaxSize;
        private System.Windows.Forms.Label MaxExecutionTimeLabel;
        private System.Windows.Forms.Label MaxInputTimeLabel;
        private System.Windows.Forms.Label PostMaxSizeLabel;
        private System.Windows.Forms.Label MemoryLimitLabel;
        private System.Windows.Forms.CheckBox SQLServerIntegration;
        private System.Windows.Forms.CheckBox AllowEdit;
        private System.Windows.Forms.CheckBox Online;
        private System.Windows.Forms.Button BrowseServerRootDir;
        private System.Windows.Forms.TextBox ServerRootDir;
        private System.Windows.Forms.Label ServerRootDirLable;
        private System.Windows.Forms.NotifyIcon NotifyIcon;
        private System.Windows.Forms.LinkLabel LicenseLinkLabel;
        private System.Windows.Forms.Label LicenseStatusLabel;
        private System.Windows.Forms.Label MaxFileUploadsLabel;
        private System.Windows.Forms.TextBox MaxFileUploads;
        private System.Windows.Forms.Button SignOutUsers;
    }
}

