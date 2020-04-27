
function DisplayMenu(id) {
    this.Id = id;

    this.Active = false;
    this.MarkupMenu = new MarkupMenu(id);
    this.BookmarkMenu = new BookmarkMenu(id);

    this.ViewsOpen = false;
}

DisplayMenu.prototype.Toggle = function () {
    if (this.Active) {
        this.Close();
    }
    else {
        this.Open();
    }
}

DisplayMenu.prototype.Open = function () {
    this.Active = true;

    var element = document.getElementById("displayMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    this.ShowMenu();
}

DisplayMenu.prototype.Close = function () {
    this.Active = false;

    this.Hide();
}

DisplayMenu.prototype.Hide = function () {
    var element = document.getElementById("displayMenu" + this.Id);
    element.setAttribute('style', 'display:none');
}

DisplayMenu.prototype.ShowMenu = function () {

    var _this = this;
    $("#displayMenu" + this.Id).dxList({
        dataSource: _this.GetControls(),
        hoverStateEnabled: true,
        focusStateEnabled: true,
        activeStateEnabled: false,
        elementAttr: { class: "dx-theme-accent-as-background-color" },
        selectionMode: "single",
        itemTemplate: function (data, index) {
            var result = $("<div>").addClass("displayMenuItem");

            $("<img>").attr({
                "src": data.ImageSrc,
                style: "width: 25px; height: 25px;"
            }).appendTo(result);

            return result;
        },
        onSelectionChanged: function (e) {
            if (e.component._selection.getSelectedItems().length > 0) {
                e.addedItems[0].click(e);
                e.component._selection.deselectAll();
            }
        }
    });
}

DisplayMenu.prototype.GetControls = function () {
    _this = this;
    return controls = [
        {
            id: 1,
            Title: "Markup",
            ImageSrc: "public/symbols/Markup.svg",
            click: function () {
                _this.MarkupMenu.Open();
                _this.Hide();
            }
        },
        {
            id: 2,
            Title: "BookMarks",
            ImageSrc: "public/symbols/Bookmarks.svg",
            click: function () {
                _this.BookmarkMenu.Open();
                _this.Hide();
            }
        },
        {
            id: 3,
            Title: "Model Views",
            ImageSrc: "public/symbols/ModelView.svg",
            click: function () {
            }
        },
        {
            id: 4,
            Title: "Close",
            ImageSrc: "public/symbols/Close.svg",
            click: function () {
                _this.Close();
            }
        }
    ];
}


// Markup menu
function MarkupMenu(id) {
    this.Id = id;

    this.ActiveOperator = null;
    
    this.Views = {};   
    this.SelectedRowKey = {
        "bookmark": null,
        "markup": null,
    };

    this.Webviewer = SourceManagers[model.currentTabId].Webviewer;

    this.ShapesMenu = new ShapesMenu(this.Id, this.Webviewer, this);

    this.Active = false;
    this.ViewActivatedBefore = false;
}

MarkupMenu.prototype.Open = function () {
    this.Active = true;

    var element = document.getElementById("markupMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    this.ShowMenu();
    this.InitEvents();

    if (model.views[_this.Id].displayMenu.ViewsOpen) {
        this.ShowViews();
    }
}

MarkupMenu.prototype.Close = function () {
    this.Active = false;
    this.ViewActivatedBefore = false;

    model.views[this.Id].displayMenu.Close();

    var element = document.getElementById("markupMenu" + this.Id);
    element.setAttribute('style', 'display:none');
}

MarkupMenu.prototype.ShowMenu = function () {

    var _this = this;
    $("#markupMenu" + this.Id).dxList({
        dataSource: _this.GetControls(),
        hoverStateEnabled: true,
        focusStateEnabled: true,
        activeStateEnabled: false,
        elementAttr: { class: "dx-theme-accent-as-background-color" },
        selectionMode: "single",
        itemTemplate: function (data, index) {
            var result = $("<div>").addClass("markupMenuItem");

            $("<img>").attr({
                "src": data.ImageSrc,
                style: "width: 25px; height: 25px;"
            }).appendTo(result);

            return result;
        },
        onSelectionChanged: function (e) {
            if (e.component._selection.getSelectedItems().length > 0) {
                e.addedItems[0].click(e);
                e.component._selection.deselectAll();
            }
        }
    });
}

MarkupMenu.prototype.GetControls = function () {
    var _this = this;
    return controls = [
        {
            id: 1,
            Title: "Pen",
            ImageSrc: "public/symbols/MarkupPen.svg",
            click: function () {
                _this.ActivateOperator(Communicator.OperatorId.RedlinePolyline);
            }
        },
        {
            id: 2,
            Title: "Shapes",
            ImageSrc: "public/symbols/MarkupShapes.svg",
            click: function () {
                _this.ShapesMenu.Open();
            }
        },
        {
            id: 3,
            Title: "Comments",
            ImageSrc: "public/symbols/MarkupComments.svg",
            click: function () {
                _this.ActivateOperator(Communicator.OperatorId.RedlineText);
            }
        },
        {
            id: 4,
            Title: "Capture",
            ImageSrc: "public/symbols/Capture.svg",
            click: function () {
                var canvasSize = _this.Webviewer.view.getCanvasSize();
                var config = new Communicator.SnapshotConfig(canvasSize.x, canvasSize.y);
                _this.Webviewer.takeSnapshot(config).then(function (image) {
                });
            }
        },
        {
            id: 5,
            Title: "Markup Views",
            ImageSrc: "public/symbols/MarkupViews.svg",
            click: function () {
                if (!model.views[_this.Id].displayMenu.ViewsOpen) {
                    _this.ShowViews();
                }
                else {
                    _this.HideViews();
                }
            }
        },
        {
            id: 6,
            Title: "Backwards",
            ImageSrc: "public/symbols/Backward.svg",
            click: function () {
                var viewNames = Object.keys(_this.Views);
                if (viewNames.length === 0) {
                    return;
                }

                var activeView = _this.Webviewer.markupManager.getActiveMarkupView();
                if (!activeView || !_this.ViewActivatedBefore) {
                    _this.ActivateView(_this.Views[viewNames[viewNames.length - 1]]);
                }
                else {
                    var viewName = activeView.getName();
                    var index = viewNames.indexOf(viewName);
                    if (index > -1) {
                        if (index === 0) {
                            _this.ActivateView(_this.Views[viewNames[viewNames.length - 1]]);
                        }
                        else {
                            _this.ActivateView(_this.Views[viewNames[index - 1]]);
                        }
                    }
                }
            }
        },
        {
            id: 7,
            Title: "Forwards",
            ImageSrc: "public/symbols/Forward.svg",
            click: function () {
                var viewNames = Object.keys(_this.Views);
                if (viewNames.length === 0) {
                    return;
                }

                var activeView = _this.Webviewer.markupManager.getActiveMarkupView();
                if (!activeView || !_this.ViewActivatedBefore) {
                    _this.ActivateView(_this.Views[viewNames[0]]);
                }
                else {
                    var viewName = activeView.getName();
                    var index = viewNames.indexOf(viewName);
                    if (index > -1) {
                        if (index === viewNames.length - 1) {
                            _this.ActivateView(_this.Views[viewNames[0]]);
                        }
                        else {
                            _this.ActivateView(_this.Views[viewNames[index + 1]]);
                        }
                    }
                }
            }
        },
        {
            id: 8,
            Title: "Clear Marks",
            ImageSrc: "public/symbols/MarkupDelete.svg",
            click: function () {
                _this.Views = {};

                // refresh grid
                if (model.views[_this.Id].displayMenu.ViewsOpen) {
                    _this.LoadMarkupViews(true);
                }
            }
        },
        {
            id: 9,
            Title: "Return",
            ImageSrc: "public/symbols/MenuReturn.svg",
            click: function () {
                _this.Close();
                model.views[_this.Id].displayMenu.Open();
            }
        },
        {
            id: 10,
            Title: "Close",
            ImageSrc: "public/symbols/Close.svg",
            click: function () {
                _this.Close();
            }
        }
    ];
}

MarkupMenu.prototype.InitEvents = function () {
    var _this = this;

    _this.Webviewer.setCallbacks({
        viewCreated: function (view) {
            if (_this.Active) {
                _this.OnViewAdded(view);
            }
        },
        viewLoaded: function (view) {
            if (_this.Active) {
                _this.OnViewAdded(view);
            }
        },
        viewDeleted: function (view) {
            if (_this.Active) {
                _this.OnViewDeleted(view);
            }
        }
    });

    document.getElementById("visualizer" + this.Id.toUpperCase()).addEventListener("wheel", function(){
        event.stopPropagation();
        _this.DeActivateOperator();
    });
}

MarkupMenu.prototype.OnViewAdded = function (view) {
    var name = view.getName();;
    var uniqueId = view.getUniqueId();
    this.Views[name] = uniqueId;

    // refresh grid
    if (model.views[_this.Id].displayMenu.ViewsOpen) {
        this.LoadMarkupViews();
    }
}

MarkupMenu.prototype.OnViewDeleted = function (view) {
    var name = view.getName();
    delete this.Views[name];
}

MarkupMenu.prototype.ActivateView = function (viewId) {
    this.Webviewer.markupManager.activateMarkupViewWithPromise(viewId);

    this.ViewActivatedBefore = true;
};

MarkupMenu.prototype.DeleteViews = function () {
    var selectedRows = $("#markupsGrid" + this.Id).dxDataGrid("instance").getSelectedRowsData()
    if (selectedRows.length === 0) {
        return;
    }

    for (var i = 0; i < selectedRows.length; i++) {
        this.Webviewer.markupManager.deleteMarkupView(selectedRows[i].Id);
        delete this.Views[selectedRows[i].View];
    }

    // refresh grid
    this.LoadMarkupViews();
};

MarkupMenu.prototype.SerializeView = function () {
    // var selectedView = this._viewPanel.getSelectedViewUniqueId();
    // if (selectedView) {
    //     var outputText = document.getElementById("outputText");
    //     var markupManager = this._viewer.markupManager;
    //     var markupView = markupManager.getMarkupView(selectedView);
    //     console.assert(markupView !== null);
    //     var markupData = {
    //         views: [markupView.toJson()]
    //     };
    //     outputText.value = JSON.stringify(markupData);
    // }
};

MarkupMenu.prototype.LoadMarkup = function () {
    // var inputText = document.getElementById("inputText");
    // var markupManager = this._viewer.markupManager;
    // return markupManager.loadMarkupData(inputText.value);
};

MarkupMenu.prototype.ShowViews = function () {
    var _this = this;
    model.views[_this.Id].displayMenu.ViewsOpen = true;

    document.getElementById("markupViewsContainer" + this.Id).style.display = "block";

    $("#markupViewTabs" + this.Id).dxTabPanel({
        dataSource: [
            { title: "Bookmarks", template: "tab1" },
            { title: "Markups", template: "tab2" }
        ],
        deferRendering: false,
        selectedIndex : 1
    });

    this.LoadMarkupViews(true);
    model.views[_this.Id].displayMenu.BookmarkMenu.LoadBookmarkViews(false);

    // enable close btn
    document.getElementById("markupViewsContainerClose" + this.Id).onclick = function () {
        _this.HideViews();
    }

    // enable delete btn
    document.getElementById("markupViewsClearBtn" + this.Id).onclick = function () {
        _this.DeleteViews();
    }

    // Make the DIV element draggable:
    DragElement(document.getElementById("markupViewsContainer" + this.Id),
        document.getElementById("markupViewsCaptionBar" + this.Id));
}

MarkupMenu.prototype.LoadMarkupViews = function (fromMarkupMenu = true) {
    var _this = this;

    // markups grid
    var markupColumns = [];

    var column = {};
    column["caption"] = "View";
    column["dataField"] = "View";
    column["width"] = "100%";
    column["visible"] = true;
    markupColumns.push(column);

    column = {};
    column["caption"] = "Id";
    column["dataField"] = "Id";
    column["visible"] = false;
    markupColumns.push(column);

    var markupsData = [];
    for (var view in this.Views) {
        markupsData.push({
            "View": view,
            "Id": this.Views[view]
        });
    }

    var selectionAttributes;
    if (fromMarkupMenu) {
        selectionAttributes = {
            mode: "multiple",
            showCheckBoxesMode: "always",
        };
    }

    $("#markupsGrid" + this.Id).dxDataGrid({
        columns: markupColumns,
        dataSource: markupsData,
        //    height: "250px",
        // columnAutoWidth: true,
        allowColumnResizing: true,
        columnResizingMode: 'widget',
        showBorders: true,
        showRowLines: true,
        paging: { enabled: false },
        filterRow: {
            visible: true
        },
        selection: selectionAttributes,
        scrolling: {
            mode: "virtual"
        },
        onRowClick: function (e) {
            // if (_this.SelectedRowKey["markup"] === e.key) {
            //     return;
            // }

            if (_this.SelectedRowKey["markup"]) {
                var rowIndex = e.component.getRowIndexByKey(_this.SelectedRowKey["markup"]);
                var rowElement = e.component.getRowElement(rowIndex)[0];
                _this.RemoveHighlightColor(rowElement);
            }

            _this.SelectedRowKey["markup"] = e.key;

            _this.ApplyHighlightColor(e.rowElement[0]);
            _this.ActivateView(e.data.Id);
        },
        onContentReady :function(e){
            var scrollable = e.component.getScrollable();  
            scrollable.scrollTo(scrollable.scrollHeight());  
        }
    });
}

MarkupMenu.prototype.HideViews = function () {
    model.views[_this.Id].displayMenu.ViewsOpen = false;

    document.getElementById("markupViewsContainer" + this.Id).style.display = "none";
}

MarkupMenu.prototype.ApplyHighlightColor = function (row) {
    row.style.backgroundColor = "#e6e8e8";
}

MarkupMenu.prototype.RemoveHighlightColor = function (row) {
    row.style.backgroundColor = "#ffffff";
}

MarkupMenu.prototype.ActivateOperator = function (operator) {
    this.DeActivateOperator();

    this.ActiveOperator = operator;
    this.Webviewer.operatorManager.set(operator, 1);
}

MarkupMenu.prototype.DeActivateOperator = function () {

    if (this.ActiveOperator) {
        this.Webviewer.operatorManager.remove(this.ActiveOperator);
        this.ActiveOperator = null;
    }
}

// Shapes Menu
function ShapesMenu(id, webviewer, markupMenu) {
    this.Id = id;
    this.Webviewer = webviewer;
    this.MarkupMenu = markupMenu;
}

ShapesMenu.prototype.Open = function () {
    var element = document.getElementById("shapesMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    this.ShowMenu();
}

ShapesMenu.prototype.Close = function () {
    var element = document.getElementById("shapesMenu" + this.Id);
    element.setAttribute('style', 'display:none');
}

ShapesMenu.prototype.ShowMenu = function () {

    var _this = this;

    $("#shapesMenu" + this.Id).dxList({
        dataSource: _this.GetControls(),
        hoverStateEnabled: true,
        focusStateEnabled: true,
        activeStateEnabled: false,
        elementAttr: { class: "dx-theme-accent-as-background-color" },
        selectionMode: "single",
        itemTemplate: function (data, index) {
            var result = $("<div>").addClass("shapesMenuItem");

            $("<img>").attr({
                "src": data.ImageSrc,
                style: "width: 25px; height: 25px;"
            }).appendTo(result);

            return result;
        },
        onSelectionChanged: function (e) {
            if (e.component._selection.getSelectedItems().length > 0) {
                e.addedItems[0].click(e);
                e.component._selection.deselectAll();
            }
        }
    });
}

ShapesMenu.prototype.GetControls = function () {
    var _this = this;

    return [{
        Title: "Circle",
        ImageSrc: "public/symbols/ShapesCircle.svg",
        click: function () {
            _this.MarkupMenu.ActivateOperator(Communicator.OperatorId.RedlineCircle);
            _this.Close();
        }
    }, {
        Title: "Rectangle",
        ImageSrc: "public/symbols/ShapesRectangle.svg",
        click: function () {
            _this.MarkupMenu.ActivateOperator(Communicator.OperatorId.RedlineRectangle);
            _this.Close();
        }
    }];
}

// Bookmark Menu
function BookmarkMenu(id) {
    this.Id = id;
    this.Webviewer = SourceManagers[model.currentTabId].Webviewer;
    
    this.Views = {};   
    this.SelectedRowKey = {
        "bookmark": null,
        "markup": null,
    };

    this.Active = false;
    this.ViewActivatedBefore = false;
}

BookmarkMenu.prototype.Open = function () {
    this.Active = true;

    var element = document.getElementById("bookmarkMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    this.ShowMenu();
    this.InitEvents();

    if (model.views[_this.Id].displayMenu.ViewsOpen) {
        this.ShowViews();
    }
}

BookmarkMenu.prototype.Close = function () {
    this.Active = false;
    this.ViewActivatedBefore = false;

    model.views[this.Id].displayMenu.Close();

    var element = document.getElementById("bookmarkMenu" + this.Id);
    element.setAttribute('style', 'display:none');
}

BookmarkMenu.prototype.ShowMenu = function () {

    var _this = this;

    $("#bookmarkMenu" + this.Id).dxList({
        dataSource: _this.GetControls(),
        hoverStateEnabled: true,
        focusStateEnabled: true,
        activeStateEnabled: false,
        elementAttr: { class: "dx-theme-accent-as-background-color" },
        selectionMode: "single",
        itemTemplate: function (data, index) {
            var result = $("<div>").addClass("bookmarkMenuItem");

            $("<img>").attr({
                "src": data.ImageSrc,
                style: "width: 25px; height: 25px;"
            }).appendTo(result);

            return result;
        },
        onSelectionChanged: function (e) {
            if (e.component._selection.getSelectedItems().length > 0) {
                e.addedItems[0].click(e);
                e.component._selection.deselectAll();
            }
        }
    });
}

BookmarkMenu.prototype.GetControls = function () {
    var _this = this;

    return [{
        Title: "Bookmark",
        ImageSrc: "public/symbols/Bookmark.svg",
        click: function () {
            var viewId = _this.Webviewer.markupManager.createMarkupView();
            // var view = _this.Webviewer.markupManager.getMarkupView(viewId);
            // var viewName = view.getName();

            // _this.Views[viewName] = viewId;
        }
    },
    {
        Title: "Capture",
        ImageSrc: "public/symbols/Capture.svg",
        click: function () {
            var canvasSize = _this.Webviewer.view.getCanvasSize();
            var config = new Communicator.SnapshotConfig(canvasSize.x, canvasSize.y);
            _this.Webviewer.takeSnapshot(config).then(function (image) {
            });
        }
    },
    {
        Title: "Bookmark Views",
        ImageSrc: "public/symbols/MarkupViews.svg",
        click: function () {
            if (!model.views[_this.Id].displayMenu.ViewsOpen) {
                _this.ShowViews();
            }
            else {
                _this.HideViews();
            }
        }
    },
    {
        Title: "Backward",
        ImageSrc: "public/symbols/Backward.svg",
        click: function () {
            var viewNames = Object.keys(_this.Views);
            if (viewNames.length === 0) {
                return;
            }

            var activeView = _this.Webviewer.markupManager.getActiveMarkupView();
            if (!activeView || !_this.ViewActivatedBefore) {
                _this.ActivateView(_this.Views[viewNames[viewNames.length - 1]]);
            }
            else {
                var viewName = activeView.getName();
                var index = viewNames.indexOf(viewName);
                if (index > -1) {
                    if (index === 0) {
                        _this.ActivateView(_this.Views[viewNames[viewNames.length - 1]]);
                    }
                    else {
                        _this.ActivateView(_this.Views[viewNames[index - 1]]);
                    }
                }
            }
        }
    },
    {
        Title: "Forward",
        ImageSrc: "public/symbols/Forward.svg",
        click: function () {
            var viewNames = Object.keys(_this.Views);
            if (viewNames.length === 0) {
                return;
            }

            var activeView = _this.Webviewer.markupManager.getActiveMarkupView();
            if (!activeView || !_this.ViewActivatedBefore) {
                _this.ActivateView(_this.Views[viewNames[0]]);
            }
            else {
                var viewName = activeView.getName();
                var index = viewNames.indexOf(viewName);
                if (index > -1) {
                    if (index === viewNames.length - 1) {
                        _this.ActivateView(_this.Views[viewNames[0]]);
                    }
                    else {
                        _this.ActivateView(_this.Views[viewNames[index + 1]]);
                    }
                }
            }
        }
    },
    {
        Title: "ClearAll",
        ImageSrc: "public/symbols/MarkupDelete.svg",
        click: function () {
            _this.Views = {};

            // refresh grid
            if (model.views[_this.Id].displayMenu.ViewsOpen) {
                _this.LoadBookmarkViews(true);
            }
        }
    },
    {
        Title: "Return",
        ImageSrc: "public/symbols/MenuReturn.svg",
        click: function () {
            _this.Close();
            model.views[_this.Id].displayMenu.Open();
        }
    },
    {
        Title: "Close",
        ImageSrc: "public/symbols/Close.svg",
        click: function () {
            _this.Close();
        }
    }
    ];
}

BookmarkMenu.prototype.InitEvents = function () {
    var _this = this;

    _this.Webviewer.setCallbacks({
        viewCreated: function (view) {
            if (_this.Active) {
                _this.OnViewAdded(view);
            }
        },
        viewLoaded: function (view) {
            if (_this.Active) {
                _this.OnViewAdded(view);
            }
        },
        viewDeleted: function (view) {
            if (_this.Active) {
                _this.OnViewDeleted(view);
            }
        }
    });
}

BookmarkMenu.prototype.OnViewAdded = function (view) {
    var name = view.getName();;
    var uniqueId = view.getUniqueId();
    this.Views[name] = uniqueId;

    // refresh grid
    if (model.views[_this.Id].displayMenu.ViewsOpen) {
        this.LoadBookmarkViews();
    }
}

BookmarkMenu.prototype.OnViewDeleted = function (view) {
    var name = view.getName();
    delete this.Views[name];
}

BookmarkMenu.prototype.ShowViews = function () {
    var _this = this;
    model.views[_this.Id].displayMenu.ViewsOpen = true;

    document.getElementById("markupViewsContainer" + this.Id).style.display = "block";

    $("#markupViewTabs" + this.Id).dxTabPanel({
        dataSource: [
            { title: "Bookmarks", template: "tab1" },
            { title: "Markups", template: "tab2" }
        ],
        deferRendering: false,
        selectedIndex : 0
    });

    this.LoadBookmarkViews(true);
    model.views[_this.Id].displayMenu.MarkupMenu.LoadMarkupViews(false);

    // enable close btn
    document.getElementById("markupViewsContainerClose" + this.Id).onclick = function () {
        _this.HideViews();
    }

    // enable delete btn
    document.getElementById("markupViewsClearBtn" + this.Id).onclick = function () {
        _this.DeleteViews();
    }

    // Make the DIV element draggable:
    DragElement(document.getElementById("markupViewsContainer" + this.Id),
        document.getElementById("markupViewsCaptionBar" + this.Id));
}

BookmarkMenu.prototype.LoadBookmarkViews = function (fromBookmarkMenu = true) {
    var _this = this;

    // markups grid
    var markupColumns = [];

    var column = {};
    column["caption"] = "View";
    column["dataField"] = "View";
    column["width"] = "100%";
    column["visible"] = true;
    markupColumns.push(column);

    column = {};
    column["caption"] = "Id";
    column["dataField"] = "Id";
    column["visible"] = false;
    markupColumns.push(column);

    var markupsData = [];
    for (var view in this.Views) {
        markupsData.push({
            "View": view,
            "Id": this.Views[view]
        });
    }

    var selectionAttributes;
    if (fromBookmarkMenu) {
        selectionAttributes = {
            mode: "multiple",
            showCheckBoxesMode: "always",
        };
    }

    $("#bookmarksGrid" + this.Id).dxDataGrid({
        columns: markupColumns,
        dataSource: markupsData,
        //    height: "250px",
        // columnAutoWidth: true,
        allowColumnResizing: true,
        columnResizingMode: 'widget',
        showBorders: true,
        showRowLines: true,
        paging: { enabled: false },
        filterRow: {
            visible: true
        },
        selection: selectionAttributes,
        scrolling: {
            mode: "virtual"
        },
        onRowClick: function (e) {
            // if (_this.SelectedRowKey["bookmark"] === e.key) {
            //     return;
            // }

            if (_this.SelectedRowKey["bookmark"] != e.key) {
                var rowIndex = e.component.getRowIndexByKey(_this.SelectedRowKey["bookmark"]);
                var rowElement = e.component.getRowElement(rowIndex)[0];
                _this.RemoveHighlightColor(rowElement);
            }

            _this.SelectedRowKey["bookmark"] = e.key;

            _this.ApplyHighlightColor(e.rowElement[0]);
            _this.ActivateView(e.data.Id);
        },
        onContentReady :function(e){
            var scrollable = e.component.getScrollable();  
            scrollable.scrollTo(scrollable.scrollHeight());  
        }
    });
}

BookmarkMenu.prototype.ActivateView = function (viewId) {
    this.Webviewer.markupManager.activateMarkupViewWithPromise(viewId);

    this.ViewActivatedBefore = true;
};

BookmarkMenu.prototype.DeleteViews = function () {
    var selectedRows = $("#bookmarksGrid" + this.Id).dxDataGrid("instance").getSelectedRowsData()
    if (selectedRows.length === 0) {
        return;
    }

    for (var i = 0; i < selectedRows.length; i++) {
        this.Webviewer.markupManager.deleteMarkupView(selectedRows[i].Id);
        delete this.Views[selectedRows[i].View];
    }

    // refresh grid
    this.LoadBookmarkViews();
};

BookmarkMenu.prototype.HideViews = function () {
    model.views[_this.Id].displayMenu.ViewsOpen = false;

    document.getElementById("markupViewsContainer" + this.Id).style.display = "none";
}

BookmarkMenu.prototype.ApplyHighlightColor = function (row) {
    row.style.backgroundColor = "#e6e8e8";
}

BookmarkMenu.prototype.RemoveHighlightColor = function (row) {
    row.style.backgroundColor = "#ffffff";
}

function DragElement(elmnt, draggableArea) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (draggableArea) {
        // if present, the header is where you move the DIV from:
        draggableArea.onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}