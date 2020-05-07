// Bookmark Menu
function BookmarkMenu(id, viewerId) {
     // call super constructor
    HoveringMenu.call(this, id, viewerId);    
        
    this.SelectedRowKey = {
        "bookmark": null,
        "markup": null,
        "annotations" : null
    };

    this.Active = false;
    this.ViewActivatedBefore = false;
}
// inherit from parent
BookmarkMenu.prototype = Object.create(HoveringMenu.prototype);
BookmarkMenu.prototype.constructor = BookmarkMenu;

BookmarkMenu.prototype.Open = function () {
    this.Active = true;

    var element = document.getElementById("bookmarkMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    this.ShowMenu();
    this.InitEvents();

    if (model.checks[this.Id].isViewsOpen()) {
        this.ShowViews();
    }

    this.RegisterOnClick();
}

BookmarkMenu.prototype.Close = function () {
    this.Active = false;
    this.ViewActivatedBefore = false;

    this.GetDisplayMenu().Close();

    var element = document.getElementById("bookmarkMenu" + this.Id);
    element.setAttribute('style', 'display:none');

    this.UnRegisterOnClick();
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
        },
        onContentReady: function (e) {
            var listitems = e.element.find('.dx-item');
            var tooltip = $("#menuTooltip" + _this.Id).dxTooltip({
                position: "right"
            }).dxTooltip('instance');
           listitems.on('dxhoverstart', function (args) {
               tooltip.content().text($(this).data().dxListItemData.Title);
               tooltip.show(args.target);
           });

           listitems.on('dxhoverend', function () {
               tooltip.hide();
           });
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
        }
    },
    {
        Title: "Capture",
        ImageSrc: "public/symbols/Capture.svg",
        click: function () {
            var canvasSize = _this.Webviewer.view.getCanvasSize();
            var config = new Communicator.SnapshotConfig(canvasSize.x, canvasSize.y);
            _this.Webviewer.takeSnapshot(config).then(function (image) {
                DevExpress.ui.notify("Screenshot is captured.", "success", 1500);
            });
        }
    },
    {
        Title: "Bookmark Views",
        ImageSrc: "public/symbols/MarkupViews.svg",
        click: function () {
            if (!model.checks[_this.Id].isViewsOpen()) {
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
            var views = model.checks[_this.Id].bookmarks[_this.ViewerId];
            var viewNames = Object.keys(views);
            if (viewNames.length === 0) {
                return;
            }

            var activeView = _this.Webviewer.markupManager.getActiveMarkupView();
            if (!activeView || !_this.ViewActivatedBefore) {
                _this.ActivateView(views[viewNames[viewNames.length - 1]]);
            }
            else {
                var viewName = activeView.getName();
                var index = viewNames.indexOf(viewName);
                if (index > -1) {
                    if (index === 0) {
                        _this.ActivateView(views[viewNames[viewNames.length - 1]]);
                    }
                    else {
                        _this.ActivateView(views[viewNames[index - 1]]);
                    }
                }
            }
        }
    },
    {
        Title: "Forward",
        ImageSrc: "public/symbols/Forward.svg",
        click: function () {
            var views = model.checks[_this.Id].bookmarks[_this.ViewerId];
            var viewNames = Object.keys(views);
            if (viewNames.length === 0) {
                return;
            }

            var activeView = _this.Webviewer.markupManager.getActiveMarkupView();
            if (!activeView || !_this.ViewActivatedBefore) {
                _this.ActivateView(views[viewNames[0]]);
            }
            else {
                var viewName = activeView.getName();
                var index = viewNames.indexOf(viewName);
                if (index > -1) {
                    if (index === viewNames.length - 1) {
                        _this.ActivateView(views[viewNames[0]]);
                    }
                    else {
                        _this.ActivateView(views[viewNames[index + 1]]);
                    }
                }
            }
        }
    },
    {
        Title: "Clear All",
        ImageSrc: "public/symbols/MarkupDelete.svg",
        click: function () {
            var totalClearedBookmarks = Object.keys(model.checks[_this.Id].bookmarks[_this.ViewerId]).length;
            model.checks[_this.Id].bookmarks[_this.ViewerId] = {};

            // refresh grid
            if (model.checks[_this.Id].isViewsOpen()) {
                _this.LoadBookmarkViews(true);
            }
            
            DevExpress.ui.notify("'" + totalClearedBookmarks + "'" + " bookmarks cleared.", "success", 1500);
        }
    },
    {
        Title: "Return",
        ImageSrc: "public/symbols/MenuReturn.svg",
        click: function () {
            _this.Close();
            _this.GetDisplayMenu().Open();
        }
    },
    {
        Title: "Close",
        ImageSrc: "public/symbols/Close.svg",
        click: function () {
            _this.Close();
            
            // Close open views and Measures form
            _this.HideAllOpenViewForms();
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

    var index = Object.keys(model.checks[this.Id].bookmarks[this.ViewerId]).length + 1;
    var name = "Bookmark-" + index;
    view.setName(name);
    // var name = view.getName();
    var uniqueId = view.getUniqueId();
    model.checks[this.Id].bookmarks[this.ViewerId][name] = uniqueId;

    // refresh grid
    if (model.checks[this.Id].isViewsOpen()) {
        this.LoadBookmarkViews();
    }

    DevExpress.ui.notify("'" + name + "'" + " bookmark created.", "success", 1500);
}

BookmarkMenu.prototype.OnViewDeleted = function (view) {
    var name = view.getName();
    delete model.checks[this.Id].bookmarks[this.ViewerId][name];
}

BookmarkMenu.prototype.ShowViews = function () {
    var _this = this;
    model.checks[_this.Id].viewsOpen = true;

    document.getElementById("markupViewsContainer" + this.Id).style.display = "block";

    $("#markupViewTabs" + this.Id).dxTabPanel({
        dataSource: [
            { title: "Bookmarks", template: "tab1" },
            { title: "Markups", template: "tab2" },
            { title: "Tags", template: "tab3" }
        ],
        deferRendering: false,
        selectedIndex : 0
    });

    this.LoadBookmarkViews(true);
    this.GetMarkupMenu().LoadMarkupViews(false);
    this.GetTagsMenu().LoadAnnotations(false);

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
    var bookmarks = model.checks[this.Id].bookmarks[this.ViewerId];
    for (var view in bookmarks) {
        markupsData.push({
            "View": view,
            "Id": bookmarks[view]
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
        delete  model.checks[this.Id].bookmarks[this.ViewerId][selectedRows[i].View];
    }

    // refresh grid
    this.LoadBookmarkViews();
};

BookmarkMenu.prototype.ApplyHighlightColor = function (row) {
    row.style.backgroundColor = "#e6e8e8";
}

BookmarkMenu.prototype.RemoveHighlightColor = function (row) {
    row.style.backgroundColor = "#ffffff";
}