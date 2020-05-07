// TagsMenu menu
function TagsMenu(id, viewerId) {
    // call super constructor
    HoveringMenu.call(this, id, viewerId);
  
    this.InitAnnotationOperator();

    this.Active = false;

    this.SelectedRowKey = {
        "bookmark": null,
        "markup": null,
        "annotations": null
    };
}
// inherit from parent
TagsMenu.prototype = Object.create(HoveringMenu.prototype);
TagsMenu.prototype.constructor = TagsMenu;

TagsMenu.prototype.InitAnnotationOperator = function () {
    model.checks[this.Id].annotationOperator = new Example.AnnotationOperator(this.Webviewer);
    model.checks[this.Id].annotationOperatorId = this.Webviewer.registerCustomOperator(model.checks[this.Id].annotationOperator);
}

TagsMenu.prototype.Open = function () {
    this.Active = true;

    var element = document.getElementById("tagsMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    this.ShowMenu();
    this.InitEvents();

    this.RegisterOnClick();
}

TagsMenu.prototype.Close = function () {
    this.Active = false;

    this.GetDisplayMenu().Close();

    var element = document.getElementById("tagsMenu" + this.Id);
    element.setAttribute('style', 'display:none');

    this.UnRegisterOnClick();
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

TagsMenu.prototype.GetControls = function () {
    var _this = this;
    return controls = [
        {
            Title: "Tag",
            ImageSrc: "public/symbols/Tag.svg",
            click: function () {
                _this.ActivateOperator();                
            }
        },
        {
            Title: "Tag Views",
            ImageSrc: "public/symbols/MarkupViews.svg",
            click: function () {
                if (!model.checks[_this.Id].isViewsOpen()) {
                    _this.ShowViews();
                }
                else {
                    // unhighlight
                    if (_this.SelectedRowKey["annotations"]) {
                        var annotation = model.checks[_this.Id].annotations[_this.ViewerId][_this.SelectedRowKey["annotations"].Id];
                        annotation.unHighlight();
                        _this.Webviewer.markupManager.refreshMarkup();
                    }
                    _this.HideViews();
                }
            }
        },
        {
            Title: "Clear Tags",
            ImageSrc: "public/symbols/MarkupDelete.svg",
            click: function () {
               _this.DeleteAnnotations();
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

TagsMenu.prototype.ShowViews = function () {
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
        selectedIndex: 2
    });

    this.GetMarkupMenu().LoadMarkupViews(false);
    this.GetBookmarkMenu().LoadBookmarkViews(false);
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
    DragElement(document.getElementById("markupViewsContainer" + this.Id),
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
    var annotations = model.checks[this.Id].annotations[this.ViewerId];
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

                var annotation = model.checks[_this.Id].annotations[_this.ViewerId][_this.SelectedRowKey["annotations"].Id];   
                annotation.unHighlight();
            }

            _this.SelectedRowKey["annotations"] = e.key;

            _this.ApplyHighlightColor(e.rowElement[0]);
            
            var annotation = model.checks[_this.Id].annotations[_this.ViewerId][e.data.Id];   
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

// TagsMenu.prototype.HideViews = function () {
//     model.checks[this.Id].viewsOpen = false;

//     // unhighlight
//     if (this.SelectedRowKey["annotations"]) {
//         var annotation = model.checks[this.Id].annotations[this.ViewerId][this.SelectedRowKey["annotations"].Id];
//         annotation.unHighlight();
//         this.Webviewer.markupManager.refreshMarkup();
//     }

//     document.getElementById("markupViewsContainer" + this.Id).style.display = "none";
// }

TagsMenu.prototype.DeleteAnnotations = function () {
    var totalClearedAnnotatios = Object.keys(model.checks[this.Id].annotations[this.ViewerId]).length;
    for (var markupHandle in model.checks[this.Id].annotations[this.ViewerId]) {
        this.DeleteAnnotation(markupHandle);
    }

    model.checks[this.Id].annotations[this.ViewerId] = {};

    // refresh grid
    if (model.checks[this.Id].isViewsOpen()) {
        this.LoadAnnotations();
    }
    
    this.SelectedRowKey["annotations"] = null;

    DevExpress.ui.notify("'" + totalClearedAnnotatios + "'" + " tags cleared.", "success", 1500);
};

TagsMenu.prototype.ApplyHighlightColor = function (row) {
    row.style.backgroundColor = "#e6e8e8";
}

TagsMenu.prototype.RemoveHighlightColor = function (row) {
    row.style.backgroundColor = "#ffffff";
}

TagsMenu.prototype.ActivateOperator = function () {
    this.Webviewer.operatorManager.set(model.checks[this.Id].annotationOperatorId, 1);
}

TagsMenu.prototype.DeActivateOperator = function () {
    this.Webviewer.operatorManager.remove(model.checks[this.Id].annotationOperatorId);
}

TagsMenu.prototype.InitEvents = function () {
    var _this = this;

    model.checks[this.Id].annotationOperator.setCallbacks({
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

    document.getElementById(_this.Webviewer._params.containerId).addEventListener("wheel", function () {
        event.stopPropagation();
        _this.DeActivateOperator();
    });
}

TagsMenu.prototype.OnAnnotationAdded = function (markupHandle, annotationMarkup) {
    model.checks[this.Id].annotations[this.ViewerId][markupHandle] = annotationMarkup;
    if (model.checks[this.Id].isViewsOpen()) {
        this.LoadAnnotations();
    }
}

TagsMenu.prototype.OnAnnotationDeleted = function (annotationMarkup) {
}

TagsMenu.prototype.RenameAnnotation = function (markupHandle, newMarkupName) {
    var annotation = model.checks[this.Id].annotations[this.ViewerId][markupHandle];   
    if (newMarkupName !== null) {
        annotation.setLabel(newMarkupName);
        this.Webviewer.markupManager.refreshMarkup();
    }
};

TagsMenu.prototype.DeleteAnnotation = function (markupHandle) {
    this.Webviewer.markupManager.unregisterMarkup(markupHandle);
    delete model.checks[this.Id].annotations[this.ViewerId][markupHandle];   
};