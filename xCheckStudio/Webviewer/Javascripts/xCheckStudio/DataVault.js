const DataVault = {
    active: false,
    grid: null,
    toggle: function () {
        if (!this.active) {
            this.open();
        }
        else {
            this.close();
        }
    },

    open: function () {
        this.active = true;

        onToggleOverlayDisplay(true);
        document.getElementById("dataVaultOverlay").style.display = "block";

        document.getElementById("dataVaultOverlayCloseBtn").onclick = function () {
            DataVault.close();
        };

        //populate Data Vault Grid
        this.populateDataVaultGrid();

        // Enable vault switch
        $("#enableVaultSwitch").dxSwitch({
            value: true,
            switchedOffText: "Disabled",
            switchedOnText: "Enabled",
            onValueChanged: function (e) {

            }
        }).dxSwitch("instance");

        // Make the DIV element draggable:
        xCheckStudio.Util.dragElement(document.getElementById("dataVaultOverlay"),
            document.getElementById("dataVaultOverlayCaptionBar"));
    },

    close: function () {
        this.active = false;

        onToggleOverlayDisplay(false);
        document.getElementById("dataVaultOverlay").style.display = "none";
    },

    onEnterVault: function () {
        var proj = model.currentProject;
        localStorage.setItem('projectinfo', JSON.stringify(proj));
        localStorage.setItem('checkinfo', "");

        localStorage.setItem('isDataVault', "true");

        window.location.href = "checkPage.html";
    },

    onDeleteData: function () {

    },

    populateDataVaultGrid: function () {
        // Create grid        
        var columns = [];

        var column = {};
        column["caption"] = "Name";
        column["dataField"] = "Name";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Type";
        column["dataField"] = "Type";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Description";
        column["dataField"] = "Description";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Version";
        column["dataField"] = "Version";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Added By";
        column["dataField"] = "AddedBy";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Date Added";
        column["dataField"] = "DateAdded";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Modified By";
        column["dataField"] = "ModifiedBy";
        column["width"] = "100px";
        columns.push(column);

        column = {};
        column["caption"] = "Date Modified";
        column["dataField"] = "DateModified";
        column["width"] = "100px";
        columns.push(column);

        var rowsData = [];

        var loadingBrowser = true;
        DataVault.grid = $("#dataVaultOverlayGrid").dxDataGrid({
            columns: columns,
            dataSource: rowsData,
            width: "550px",
            height: "460px",
            allowColumnResizing: true,
            columnResizingMode: 'widget',
            showBorders: true,
            showRowLines: true,
            paging: { enabled: false },
            // filterRow: {
            //     visible: true
            // },
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "always",
            },
            scrolling: {
                mode: "virtual"
            },
            editing: {
                mode: "cell",
                allowUpdating: true,
                // refreshMode: "reshape",
                texts: {
                    confirmDeleteMessage: ""
                },
            },
            onContentReady: function (e) {
                if (!loadingBrowser) {
                    return;
                }
                loadingBrowser = false;
            },
        }).dxDataGrid("instance");
    },    
}