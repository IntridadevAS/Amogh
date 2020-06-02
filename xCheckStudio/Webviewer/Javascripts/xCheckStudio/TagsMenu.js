// TagsMenu menu
function TagsMenu(id) {
    this.Id = id;

    this.Webviewer = SourceManagers[model.currentTabId].Webviewer;

    this.Active = false;  

    this.SelectedRowKey = {
        "bookmark": null,
        "markup": null,
        "annotations": null
    };
}

TagsMenu.prototype.Open = function () {
    this.Active = true;
    model.views[this.Id].activeMenu = this;

    var element = document.getElementById("tagsMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    this.ShowMenu();
    this.InitEvents();

    if (model.views[this.Id].displayMenu.ViewsOpen) {
        this.ShowViews();
    }
}

TagsMenu.prototype.Close = function () {
    this.Active = false;
    model.views[this.Id].activeMenu = null;

    model.views[this.Id].displayMenu.Close();

    var element = document.getElementById("tagsMenu" + this.Id);
    element.setAttribute('style', 'display:none');

    this.HideViews();
}

TagsMenu.prototype.ShowMenu = function () {

    var _this = this;
    $("#tagsMenu" + this.Id).dxList({
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
                e.addedItems[0].click(e, _this);
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

TagsMenu.prototype.GetControls = function () {
    // var _this = this;
    return controls = [
        {
            Title: "Tag",
            ImageSrc: "public/symbols/Tag.svg",
            click: function (e, menu) {
                menu.ActivateOperator();                
            }
        },
        {
            Title: "Tag Views",
            ImageSrc: "public/symbols/MarkupViews.svg",
            click: function (e, menu) {
                if (!model.views[menu.Id].displayMenu.ViewsOpen) {
                    menu.ShowViews();
                }
                else {
                    menu.HideViews();
                }
            }
        },
        {
            Title: "Clear Tags",
            ImageSrc: "public/symbols/MarkupDelete.svg",
            click: function (e, menu) {
                menu.DeleteAnnotations();
            }
        },
        {
            Title: "Return",
            ImageSrc: "public/symbols/MenuReturn.svg",
            click: function (e, menu) {
                menu.Close();
                model.views[menu.Id].displayMenu.Open();
            }
        },
        {
            Title: "Close",
            ImageSrc: "public/symbols/Close.svg",
            click: function (e, menu) {
                menu.Close();
            }
        }
    ];
}

TagsMenu.prototype.ShowViews = function () {
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
        selectedIndex: 2
    });

    model.views[_this.Id].displayMenu.MarkupMenu.LoadMarkupViews(false);
    model.views[_this.Id].displayMenu.BookmarkMenu.LoadBookmarkViews(false);
    this.LoadAnnotations(true);

    // enable close btn
    document.getElementById("markupViewsContainerClose" + this.Id).onclick = function () {
        _this.HideViews();
    }

    // enable delete btn
    document.getElementById("markupViewsClearBtn" + this.Id).onclick = function () {
        _this.DeleteAnnotations();
    }

    // Make the DIV element draggable:
    xCheckStudio.Util.dragElement(document.getElementById("markupViewsContainer" + this.Id),
        document.getElementById("markupViewsCaptionBar" + this.Id));
}

TagsMenu.prototype.LoadAnnotations = function (fromTagsMenu = true) {
    var _this = this;

    // annotations grid
    var annotationColumns = [];

    var column = {};
    column["caption"] = "Tag";
    column["dataField"] = "Tag";
    column["width"] = "100%";
    column["visible"] = true;
    annotationColumns.push(column);

    column = {};
    column["caption"] = "Id";
    column["dataField"] = "Id";
    column["visible"] = false;
    annotationColumns.push(column);

    var annotationsData = [];
    var annotations = model.views[this.Id].annotations;
    for (var id in annotations) {
        annotationsData.push({
            "Tag": annotations[id].getLabel(),
            "Id": id
        });
    }

    var selectionAttributes;
    var editingAttributes;
    if (fromTagsMenu) {
        //     selectionAttributes = {
        //         mode: "multiple",
        //         showCheckBoxesMode: "always",
        //     };

        editingAttributes = {
            mode: "cell",
            allowUpdating: true,
            startEditAction: "dblClick"
        };
    }

    $("#annotationsGrid" + this.Id).dxDataGrid({
        columns: annotationColumns,
        dataSource: annotationsData,
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
        editing: editingAttributes,
        onRowClick: function (e) {
            if (_this.SelectedRowKey["annotations"]) {
                var rowIndex = e.component.getRowIndexByKey(_this.SelectedRowKey["annotations"]);
                var rowElement = e.component.getRowElement(rowIndex)[0];
                
                _this.RemoveHighlightColor(rowElement);

                var annotation = model.views[_this.Id].annotations[_this.SelectedRowKey["annotations"].Id];   
                annotation.unHighlight();
            }

            _this.SelectedRowKey["annotations"] = e.key;

            _this.ApplyHighlightColor(e.rowElement[0]);
            
            var annotation = model.views[_this.Id].annotations[e.data.Id];   
            annotation.highlight();
            _this.Webviewer.markupManager.refreshMarkup();
        },
        onContentReady: function (e) {
            var scrollable = e.component.getScrollable();
            scrollable.scrollTo(scrollable.scrollHeight());
        },        
        onEditorPrepared(e) {  
            if (e.parentType == 'dataRow') {       
                e.editorElement.dxTextBox('instance').option('onValueChanged', args => {  
                    e.setValue(args.value);  

                    _this.RenameAnnotation(e.row.data.Id, args.value);     
                });  
            }  
        } 
    });
}

TagsMenu.prototype.HideViews = function () {
    model.views[this.Id].displayMenu.ViewsOpen = false;

    // unhighlight
    if (this.SelectedRowKey["annotations"]) {
        var annotation = model.views[this.Id].annotations[this.SelectedRowKey["annotations"].Id];
        annotation.unHighlight();
        this.Webviewer.markupManager.refreshMarkup();
    }

    this.SelectedRowKey["annotations"] = null;
    
    document.getElementById("markupViewsContainer" + this.Id).style.display = "none";
}

TagsMenu.prototype.DeleteAnnotations = function () {
    var totalClearedAnnotatios = Object.keys(model.views[this.Id].annotations).length;
    for (var markupHandle in model.views[this.Id].annotations) {
        this.DeleteAnnotation(markupHandle);
    }

    model.views[this.Id].annotations = {};

    // refresh grid
    if (model.views[this.Id].displayMenu.ViewsOpen) {
        this.LoadAnnotations();
    }

    DevExpress.ui.notify("'" + totalClearedAnnotatios + "'" + " tags cleared.", "success", 1500);
};

TagsMenu.prototype.ApplyHighlightColor = function (row) {
    row.style.backgroundColor = "#e6e8e8";
}

TagsMenu.prototype.RemoveHighlightColor = function (row) {
    row.style.backgroundColor = "#ffffff";
}

TagsMenu.prototype.ActivateOperator = function () {
    this.Webviewer.operatorManager.set(model.views[this.Id].annotationOperatorId, 1);
}

TagsMenu.prototype.DeActivateOperator = function () {
    this.Webviewer.operatorManager.remove(model.views[this.Id].annotationOperatorId);
}

TagsMenu.prototype.InitEvents = function () {
    var _this = this;

    model.views[this.Id].annotationOperator.setCallbacks({
        annotationAdded: function (markupHandle, annotationMarkup) {
            if (_this.Active) {
                _this.OnAnnotationAdded(markupHandle, annotationMarkup);
            }
        },
        annotationDeleted: function (annotationMarkup) {
            if (_this.Active) {
                _this.OnAnnotationDeleted(annotationMarkup);
            }
        }
    });

    document.getElementById("visualizer" + this.Id.toUpperCase()).addEventListener("wheel", function () {
        event.stopPropagation();
        _this.DeActivateOperator();
    });
}

TagsMenu.prototype.OnAnnotationAdded = function (markupHandle, annotationMarkup) {
    model.views[this.Id].annotations[markupHandle] = annotationMarkup;
    if (model.views[this.Id].displayMenu.ViewsOpen) {
        this.LoadAnnotations();
    }
}

TagsMenu.prototype.OnAnnotationDeleted = function (annotationMarkup) {
}

TagsMenu.prototype.RenameAnnotation = function (markupHandle, newMarkupName) {
    var annotation = model.views[this.Id].annotations[markupHandle];   
    if (newMarkupName !== null) {
        annotation.setLabel(newMarkupName);
        this.Webviewer.markupManager.refreshMarkup();
    }
};

TagsMenu.prototype.DeleteAnnotation = function (markupHandle) {
    this.Webviewer.markupManager.unregisterMarkup(markupHandle);
    delete model.views[this.Id].annotations[markupHandle];   
};