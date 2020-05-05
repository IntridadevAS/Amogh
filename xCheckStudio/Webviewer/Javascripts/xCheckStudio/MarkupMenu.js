// Markup menu
function MarkupMenu(id) {
    this.Id = id;

    this.ActiveOperator = null;    
 
    this.SelectedRowKey = {
        "bookmark": null,
        "markup": null,
        "annotations" : null
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

    // Close shapes menu, if open
    if (this.ShapesMenu.Active) {
        this.ShapesMenu.Close();
    }
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
                if (!_this.ShapesMenu.Active) {
                    _this.ShapesMenu.Open();
                }
                else {
                    _this.ShapesMenu.Close();
                }
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
                    DevExpress.ui.notify("Screenshot is captured.", "success", 1500);
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
            Title: "Backward",
            ImageSrc: "public/symbols/Backward.svg",
            click: function () {
                var views = model.views[_this.Id].markupViews;
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
            id: 7,
            Title: "Forward",
            ImageSrc: "public/symbols/Forward.svg",
            click: function () {
                var views = model.views[_this.Id].markupViews;
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
            id: 8,
            Title: "Clear Marks",
            ImageSrc: "public/symbols/MarkupDelete.svg",
            click: function () {
                var totalClearedMarkups = Object.keys(model.views[_this.Id].markupViews).length;
                model.views[_this.Id].markupViews = {};

                // refresh grid
                if (model.views[_this.Id].displayMenu.ViewsOpen) {
                    _this.LoadMarkupViews(true);
                }

                DevExpress.ui.notify("'" + totalClearedMarkups + "'" + " markups cleared.", "success", 1500);
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
    var index = Object.keys(model.views[this.Id].markupViews).length + 1;
    var name = "Markup-" + index;
    view.setName(name);

    // var name = view.getName();;
    var uniqueId = view.getUniqueId();
    model.views[this.Id].markupViews[name] = uniqueId;

    // refresh grid
    if (model.views[_this.Id].displayMenu.ViewsOpen) {
        this.LoadMarkupViews();
    }

    DevExpress.ui.notify("'" + name + "'" + " markup created.", "success", 1500);
}

MarkupMenu.prototype.OnViewDeleted = function (view) {
    var name = view.getName();
    delete model.views[this.Id].markupViews[name];
}

MarkupMenu.prototype.ActivateView = function (viewId) {
    this.Webviewer.markupManager.activateMarkupViewWithPromise(viewId).then(function(result){

    })

    this.ViewActivatedBefore = true;
};

MarkupMenu.prototype.DeleteViews = function () {
    var selectedRows = $("#markupsGrid" + this.Id).dxDataGrid("instance").getSelectedRowsData()
    if (selectedRows.length === 0) {
        return;
    }

    for (var i = 0; i < selectedRows.length; i++) {
        this.Webviewer.markupManager.deleteMarkupView(selectedRows[i].Id);
        delete model.views[this.Id].markupViews[selectedRows[i].View];
    }

    // refresh grid
    this.LoadMarkupViews();
};

MarkupMenu.prototype.ShowViews = function () {
    var _this = this;
    model.views[_this.Id].displayMenu.ViewsOpen = true;

    document.getElementById("markupViewsContainer" + this.Id).style.display = "block";

    $("#markupViewTabs" + this.Id).dxTabPanel({
        dataSource: [
            { title: "Bookmarks", template: "tab1" },
            { title: "Markups", template: "tab2" },
            { title: "Tags", template: "tab3" }
        ],
        deferRendering: false,
        selectedIndex : 1
    });

    this.LoadMarkupViews(true);
    model.views[_this.Id].displayMenu.BookmarkMenu.LoadBookmarkViews(false);
    model.views[_this.Id].displayMenu.TagsMenu.LoadAnnotations(false);

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
    var views = model.views[this.Id].markupViews;
    for (var view in views) {
        markupsData.push({
            "View": view,
            "Id": views[view]
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
    model.views[this.Id].displayMenu.ViewsOpen = false;

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

    this.Active = false;
}

ShapesMenu.prototype.Open = function () {
    this.Active = true;

    var element = document.getElementById("shapesMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    this.ShowMenu();
}

ShapesMenu.prototype.Close = function () {
    this.Active = false;

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