function ModelViewsMenu(id) {
    this.Id = id;

    this.Webviewer = SourceManagers[model.currentTabId].Webviewer;

    this.Active = false;

    this.DisplayStylesMenu = new DisplayStylesMenu(id, this.Webviewer);
    this.SectioningMenu = new SectioningMenu(id, this.Webviewer);
    this.MeasureMenu = new MeasureMenu(id, this.Webviewer);

    this.Controls = SourceManagers[model.currentTabId].GetControlIds();
    this.ExplodeManager;
    this.TranslucencyManager;

    this.ListItems;   
}

ModelViewsMenu.prototype.Open = function () {
    this.Active = true;
    model.views[this.Id].activeMenu = this;

    var element = document.getElementById("modelViewsMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    // update the list items dynamically
    this.UpdateListItems();

    // Load menu
    this.LoadMenu();
}

ModelViewsMenu.prototype.Close = function () {
    this.Active = false;
    model.views[this.Id].activeMenu = null;

    model.views[this.Id].displayMenu.Close();

    var element = document.getElementById("modelViewsMenu" + this.Id);
    element.setAttribute('style', 'display:none');

    // Close sub-menus
    if (this.DisplayStylesMenu.Active) {
        this.DisplayStylesMenu.Close();
    }
    if (this.SectioningMenu.Active) {
        this.SectioningMenu.Close();
    }
    if (this.MeasureMenu.Active) {
        this.MeasureMenu.Close();
    }
}

ModelViewsMenu.prototype.LoadMenu = function () {

    var _this = this;
    $("#modelViewsMenu" + this.Id).dxList({
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

ModelViewsMenu.prototype.GetControls = function () {
    // var _this = this;
    if (this.ListItems) {
        return this.ListItems;
    }

    this.ListItems = [
        {
            Title: "3D Display Styles",
            ImageSrc: "public/symbols/DisplayStyles.svg",
            click: function (e, menu) {
                if (menu.DisplayStylesMenu.Active) {
                    menu.DisplayStylesMenu.Close();
                }
                else {
                    menu.DisplayStylesMenu.Open();
                }
            }
        },
        {
            Title: "Sectioning",
            ImageSrc: "public/symbols/Sectioning.svg",
            click: function (e, menu) {
                if (!menu.SectioningMenu.Active) {
                    menu.SectioningMenu.Open();
                }
                else {
                    menu.SectioningMenu.Close();
                }
            }
        },
        {
            Title: "Background Colors",
            ImageSrc: "public/symbols/ColorPallete.svg",
            click: function (e, menu) {
                openBackgroundColorPallete(menu.Webviewer);
            }
        },
        {
            Title: "Fit",
            ImageSrc: "public/symbols/ZoomFit.svg",
            click: function (e, menu) {
                menu.Webviewer.view.fitWorld();
            }
        },
        {
            Title: "Explode",
            ImageSrc: "public/symbols/Explode.svg",
            click: function (e, menu) {
                if (!menu.ExplodeManager) {
                    menu.StartExplode();
                }
                else {
                    menu.StopExplode();
                }
            }
        },
        {
            Title: "Translucency",
            ImageSrc: "public/symbols/Transparency.svg",
            click: function (e, menu) {
                if (!menu.TranslucencyManager) {
                    menu.StartTranslucency();
                }
                else {
                    menu.StopTranslucency();
                }
            }
        },
        {
            Title: "Measure",
            ImageSrc: "public/symbols/Measure.svg",
            click: function (e, menu) {
                if (!menu.MeasureMenu.Active) {
                    menu.MeasureMenu.Open();
                }
                else {
                    menu.MeasureMenu.Close();
                }
            }
        },
        {
            Title: "Navigation: Orbit",
            ImageSrc: "public/symbols/Orbit.svg",
            click: function (e, menu) {
                if (this.Title === "Navigation: Orbit") {
                    this.Title = "Navigation: Walkthrough";
                    this.ImageSrc = "public/symbols/Walkthrough.svg";
                    event.target.src = this.ImageSrc;

                    menu.Webviewer.operatorManager.set(Communicator.OperatorId.Walk, 0);

                    // Chnaging to walk mode forces projection to be chnaged to
                    // perspective so to make projection menu item consistent
                    // update items and load menu
                    // update the list items dynamically
                    menu.UpdateListItems();
                    // Load menu
                    menu.LoadMenu();
                }
                else {
                    this.Title = "Navigation: Orbit";
                    this.ImageSrc = "public/symbols/Orbit.svg";
                    event.target.src = this.ImageSrc;

                    menu.Webviewer.operatorManager.set(Communicator.OperatorId.Navigate, 0);
                }
            }
        },
        {
            Title: "Projection: Perspective",
            ImageSrc: "public/symbols/Perspective.svg",
            click: function (e, menu) {
                if (this.Title === "Projection: Perspective") {
                    this.Title = "Projection: Orthographic";
                    this.ImageSrc = "public/symbols/Orthographic.svg";
                    event.target.src = this.ImageSrc;

                    menu.Webviewer.view.setProjectionMode(Communicator.Projection.Orthographic);
                }
                else {
                    this.Title = "Projection: Perspective";
                    this.ImageSrc = "public/symbols/Perspective.svg";
                    event.target.src = this.ImageSrc;
                    menu.Webviewer.view.setProjectionMode(Communicator.Projection.Perspective);
                }
            }
        },
        {
            Title: "Axis Triad",
            ImageSrc: "public/symbols/Triad.svg",
            click: function (e, menu) {
                toggleAxisTriad(menu.Webviewer);
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

    return this.ListItems;
}

ModelViewsMenu.prototype.UpdateListItems = function () {
    if (!this.ListItems) {
        this.GetControls();
    }

    // update projection
    var currentPorjection = this.Webviewer.view.getProjectionMode();

    for (var i = 0; i < this.ListItems.length; i++) {
        var listItem = this.ListItems[i];
        if (!listItem.Title.includes('Projection:')) {
            continue;
        }

        if (currentPorjection === Communicator.Projection.Orthographic) {
            listItem.Title = "Projection: Orthographic";
            listItem.ImageSrc = "public/symbols/Orthographic.svg";
        }
        else {
            listItem.Title = "Projection: Perspective";
            listItem.ImageSrc = "public/symbols/Perspective.svg";
        }
        break;
    }
}

ModelViewsMenu.prototype.StartExplode = function () {
    this.ExplodeManager = new ExplodeManager(this.Webviewer, this.Controls["explode"]);
    this.ExplodeManager.Start();
}

ModelViewsMenu.prototype.StopExplode = function () {
    if (!this.ExplodeManager) {
        return;
    }

    this.ExplodeManager.Stop();
    this.ExplodeManager = undefined;
}

ModelViewsMenu.prototype.StartTranslucency = function () {
    this.TranslucencyManager = new TranslucencyManager([this.Webviewer], undefined, this.Controls["translucency"]);
    this.TranslucencyManager.Start();
}

ModelViewsMenu.prototype.StopTranslucency = function () {
    if (!this.TranslucencyManager) {
        return;
    }

    this.TranslucencyManager.Stop();
    this.TranslucencyManager = undefined;
}

//  Display Styles Menu
function DisplayStylesMenu(id,
    viewer) {
    this.Id = id;
    this.Webviewer = viewer;
    this.Active = false;
}

DisplayStylesMenu.prototype.Open = function () {
    this.Active = true;

    var element = document.getElementById("displayStylesMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    this.ShowMenu();

    // Close other sub-menus at same level
    if (model.views[this.Id].displayMenu.ModelViewsMenu.SectioningMenu.Active) {
        model.views[this.Id].displayMenu.ModelViewsMenu.SectioningMenu.Close();
    }
    if (model.views[this.Id].displayMenu.ModelViewsMenu.MeasureMenu.Active) {
        model.views[this.Id].displayMenu.ModelViewsMenu.MeasureMenu.Close();
    }
}

DisplayStylesMenu.prototype.Close = function () {
    this.Active = false;

    var element = document.getElementById("displayStylesMenu" + this.Id);
    element.setAttribute('style', 'display:none');
}

DisplayStylesMenu.prototype.ShowMenu = function () {

    var _this = this;
    $("#displayStylesMenu" + this.Id).dxList({
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

DisplayStylesMenu.prototype.GetControls = function () {
    // var _this = this;
    return controls = [
        {
            Title: "Ghost",
            ImageSrc: "public/symbols/Xray.svg",
            click: function (e, menu) {
                menu.Webviewer.view.setDrawMode(Communicator.DrawMode.XRay);
                menu.Close();
            }
        },
        {
            Title: "Shaded With Lines",
            ImageSrc: "public/symbols/ShadedWithLines.svg",
            click: function (e, menu) {
                menu.Webviewer.view.setDrawMode(Communicator.DrawMode.WireframeOnShaded);
                menu.Close();
            }
        },
        {
            Title: "Shaded",
            ImageSrc: "public/symbols/Shaded.svg",
            click: function (e, menu) {
                menu.Webviewer.view.setDrawMode(Communicator.DrawMode.Shaded);
                menu.Close();
            }
        },
        {
            Title: "Hidden Lines",
            ImageSrc: "public/symbols/HiddenLines.svg",
            click: function (e, menu) {
                menu.Webviewer.view.setDrawMode(Communicator.DrawMode.HiddenLine);
                menu.Close();
            }
        },
        {
            Title: "Wireframe",
            ImageSrc: "public/symbols/Wireframe.svg",
            click: function (e, menu) {
                menu.Webviewer.view.setDrawMode(Communicator.DrawMode.Wireframe);
                menu.Close();
            }
        }
    ];
}

//  SectioningMenu Menu
function SectioningMenu(id, viewer) {
    this.Id = id;
    this.Webviewer = viewer;
    this.Active = false;

    this.Planes = {
    };

    this.UseIndividualSection = false;
    this.PlanesVisible = true;
}

SectioningMenu.prototype.Open = function () {
    this.Active = true;

    var element = document.getElementById("sectioningMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    this.ShowMenu();

    // Close other sub-menus at same level
    if (model.views[this.Id].displayMenu.ModelViewsMenu.DisplayStylesMenu.Active) {
        model.views[this.Id].displayMenu.ModelViewsMenu.DisplayStylesMenu.Close();
    }
    if (model.views[this.Id].displayMenu.ModelViewsMenu.MeasureMenu.Active) {
        model.views[this.Id].displayMenu.ModelViewsMenu.MeasureMenu.Close();
    }
}

SectioningMenu.prototype.Close = function () {
    this.Active = false;

    var element = document.getElementById("sectioningMenu" + this.Id);
    element.setAttribute('style', 'display:none');
}

SectioningMenu.prototype.ShowMenu = function () {

    var _this = this;
    $("#sectioningMenu" + this.Id).dxList({
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

SectioningMenu.prototype.GetControls = function () {
    // var _this = this;
    return controls = [
        {
            Title: "Toggle Planes Visibility",
            ImageSrc: menu.PlanesVisible ? "public/symbols/Hide.svg" : "public/symbols/ShowAll.svg",
            click: function (e, menu) {
                menu.PlanesVisible = !menu.PlanesVisible;

                if (menu.PlanesVisible) {
                    menu.ImageSrc = "public/symbols/Hide.svg";
                    event.target.src = menu.ImageSrc;
                }
                else {
                    menu.ImageSrc = "public/symbols/ShowAll.svg";
                    event.target.src = menu.ImageSrc;
                }

                menu.UpdateCuttingPlane2();
                menu.Close();
            }
        },
        {
            Title: "Toggle Intersection",
            ImageSrc: "public/symbols/Intersection.svg",
            click: function (e, menu) {
                menu.UseIndividualSection = !menu.UseIndividualSection;
                menu.UpdateCuttingPlane2();
                menu.Close();
            }
        },
        {
            Title: "Toggle XY Sectioning",
            ImageSrc: "public/symbols/XYPlane.svg",
            click: function (e, menu) {
                if (!('XY' in menu.Planes)) {
                    menu.AddCuttingPlane(Communicator.Axis.Z);
                }
                else {
                    menu.UpdateCuttingPlane(
                        menu.Planes['XY'],
                        'XY',
                        true);
                }

                menu.Close();
            }
        },
        {
            Title: "Toggle XZ Sectioning",
            ImageSrc: "public/symbols/XZPlane.svg",
            click: function (e, menu) {
                if (!('XZ' in menu.Planes)) {
                    menu.AddCuttingPlane(Communicator.Axis.Y);
                }
                else {
                    menu.UpdateCuttingPlane(
                        menu.Planes['XZ'],
                        'XZ',
                        true);
                }

                menu.Close();
            }
        },
        {
            Title: "Toggle YZ Sectioning",
            ImageSrc: "public/symbols/YZPlane.svg",
            click: function (e, menu) {
                if (!('YZ' in menu.Planes)) {
                    menu.AddCuttingPlane(Communicator.Axis.X);
                }
                else {
                    menu.UpdateCuttingPlane(
                        menu.Planes['YZ'],
                        'YZ',
                        true);
                }
                menu.Close();
            }
        },
        {
            Title: "Clear Sectioning",
            ImageSrc: "public/symbols/ClearAll.svg",
            click: function (e, menu) {
                menu.DeactivateCuttingSections();
                DevExpress.ui.notify("Cleared cutting sections.", "success", 1500);
                menu.Close();
            }
        }
    ];
}

SectioningMenu.prototype.AddCuttingPlane = function (
    axis,
    plane = null,
    referenceGeometry = null) {
    var _this = this;

    var cuttingManager = this.Webviewer.cuttingManager;

    var cuttingSection;
    var cuttingSectionIndex;
    if (this.UseIndividualSection) {
        cuttingSectionIndex = axis;
    }
    else {
        cuttingSectionIndex = 0;
    }
    cuttingSection = cuttingManager.getCuttingSection(cuttingSectionIndex);

    this.Webviewer.model.getModelBounding(true, false).then(function (bounding) {
        // if (!plane || !referenceGeometry) {
        // referenceGeometry = [];
        // plane = new Communicator.Plane();

        switch (axis) {
            case Communicator.Axis.Z:
                _this.Planes['XY'] = {
                    "planeIdex": cuttingSection.getCount(),
                    "cuttingSectionIndex": cuttingSectionIndex
                };

                // XY                 
                // var referenceGeometry = [];
                // var plane = new Communicator.Plane();

                if (!plane) {
                    plane = new Communicator.Plane();
                    plane.normal.set(0, 0, 1);
                    plane.d = -bounding.max.z / 2;
                }

                if (!_this.PlanesVisible) {
                    referenceGeometry = null;
                }
                else if (!referenceGeometry) {
                    referenceGeometry = [];
                    max = bounding.max.z;
                    min = bounding.min.z;
                    referenceGeometry.push(new Communicator.Point3(bounding.min.x, bounding.max.y, 0));
                    referenceGeometry.push(new Communicator.Point3(bounding.max.x, bounding.max.y, 0));
                    referenceGeometry.push(new Communicator.Point3(bounding.max.x, bounding.min.y, 0));
                    referenceGeometry.push(new Communicator.Point3(bounding.min.x, bounding.min.y, 0));
                }
                break;

            case Communicator.Axis.Y:
                // XZ                
                _this.Planes['XZ'] = {
                    "planeIdex": cuttingSection.getCount(),
                    "cuttingSectionIndex": cuttingSectionIndex
                };
                // referenceGeometry = [];
                // plane = new Communicator.Plane();

                if (!plane) {
                    plane = new Communicator.Plane();
                    plane.normal.set(0, 1, 0);
                    plane.d = -bounding.max.y / 2;
                }

                if (!_this.PlanesVisible) {
                    referenceGeometry = null;
                }
                else if (!referenceGeometry) {
                    referenceGeometry = [];
                    max = bounding.max.y;
                    min = bounding.min.y;
                    referenceGeometry.push(new Communicator.Point3(bounding.min.x, 0, bounding.min.z));
                    referenceGeometry.push(new Communicator.Point3(bounding.max.x, 0, bounding.min.z));
                    referenceGeometry.push(new Communicator.Point3(bounding.max.x, 0, bounding.max.z));
                    referenceGeometry.push(new Communicator.Point3(bounding.min.x, 0, bounding.max.z));
                }
                break;

            case Communicator.Axis.X:
                // YZ                 
                _this.Planes['YZ'] = {
                    "planeIdex": cuttingSection.getCount(),
                    "cuttingSectionIndex": cuttingSectionIndex
                };
                // referenceGeometry = [];
                // plane = new Communicator.Plane();

                if (!plane) {
                    plane = new Communicator.Plane();
                    plane.normal.set(1, 0, 0);
                    plane.d = -bounding.max.x / 2;
                }

                if (!_this.PlanesVisible) {
                    referenceGeometry = null;
                }
                else if (!referenceGeometry) {
                    referenceGeometry = [];
                    max = bounding.max.x;
                    min = bounding.min.x;
                    referenceGeometry.push(new Communicator.Point3(0, bounding.max.y, bounding.min.z));
                    referenceGeometry.push(new Communicator.Point3(0, bounding.max.y, bounding.max.z));
                    referenceGeometry.push(new Communicator.Point3(0, bounding.min.y, bounding.max.z));
                    referenceGeometry.push(new Communicator.Point3(0, bounding.min.y, bounding.min.z));
                }
                break;
            default:
                return;
        }
        // }
        // else {
        //     switch (axis) {
        //         case Communicator.Axis.Z:
        //             _this.Planes['XY'] = {
        //                 "planeIdex": cuttingSection.getCount(),
        //                 "cuttingSectionIndex": cuttingSectionIndex
        //             };
        //             break;
        //         case Communicator.Axis.Y:
        //             _this.Planes['XZ'] = {
        //                 "planeIdex": cuttingSection.getCount(),
        //                 "cuttingSectionIndex": cuttingSectionIndex
        //             };
        //             break;
        //         case Communicator.Axis.X:
        //             _this.Planes['YZ'] = {
        //                 "planeIdex": cuttingSection.getCount(),
        //                 "cuttingSectionIndex": cuttingSectionIndex
        //             };
        //             break;
        //     }
        // }
        cuttingSection.addPlane(plane, referenceGeometry).then(function (success) {
            if (!success) {
                return Promise.resolve();
            }

            var p = cuttingSection.activate();

            if (null === p) {
                return Promise.resolve();
            }
            return p
        });

        cuttingManager.setStandinGeometryPickable(true);
    });
}

SectioningMenu.prototype.UpdateCuttingPlane = function (
    planeInfo,
    planeName,
    reverseDirection = false) {
    var _this = this;

    var cuttingManager = this.Webviewer.cuttingManager;
    var cuttingSection = cuttingManager.getCuttingSection(planeInfo.cuttingSectionIndex);

    // var plane = cuttingSection.getPlane(index);
    // plane.normal = plane.normal.negate();
    // cuttingSection.setPlane(index, plane);


    this.Webviewer.model.getModelBounding(true, false).then(function (bounding) {
        var referenceGeometry = null;
        var plane;

        switch (planeName) {
            case 'XY':
                var plane = cuttingSection.getPlane(planeInfo.planeIdex);
                plane.normal = plane.normal.negate();

                if (reverseDirection) {
                    plane.d = -plane.d;
                }

                if (_this.PlanesVisible) {
                    max = bounding.max.z;
                    min = bounding.min.z;
                    referenceGeometry = [];
                    referenceGeometry.push(new Communicator.Point3(bounding.min.x, bounding.max.y, 0));
                    referenceGeometry.push(new Communicator.Point3(bounding.max.x, bounding.max.y, 0));
                    referenceGeometry.push(new Communicator.Point3(bounding.max.x, bounding.min.y, 0));
                    referenceGeometry.push(new Communicator.Point3(bounding.min.x, bounding.min.y, 0));
                }
                break;

            case 'XZ':
                // XZ                
                var plane = cuttingSection.getPlane(planeInfo.planeIdex);
                plane.normal = plane.normal.negate();

                if (reverseDirection) {
                    plane.d = -plane.d;
                }

                if (_this.PlanesVisible) {
                    max = bounding.max.y;
                    min = bounding.min.y;
                    referenceGeometry = [];
                    referenceGeometry.push(new Communicator.Point3(bounding.min.x, 0, bounding.min.z));
                    referenceGeometry.push(new Communicator.Point3(bounding.max.x, 0, bounding.min.z));
                    referenceGeometry.push(new Communicator.Point3(bounding.max.x, 0, bounding.max.z));
                    referenceGeometry.push(new Communicator.Point3(bounding.min.x, 0, bounding.max.z));
                }
                break;

            case 'YZ':
                // YZ                 
                var plane = cuttingSection.getPlane(planeInfo.planeIdex);
                plane.normal = plane.normal.negate();

                if (reverseDirection) {
                    plane.d = -plane.d;
                }
                if (_this.PlanesVisible) {
                    max = bounding.max.x;
                    min = bounding.min.x;
                    referenceGeometry = [];
                    referenceGeometry.push(new Communicator.Point3(0, bounding.max.y, bounding.min.z));
                    referenceGeometry.push(new Communicator.Point3(0, bounding.max.y, bounding.max.z));
                    referenceGeometry.push(new Communicator.Point3(0, bounding.min.y, bounding.max.z));
                    referenceGeometry.push(new Communicator.Point3(0, bounding.min.y, bounding.min.z));
                }
                break;
            default:
                return;
        }

        cuttingSection.setPlane(planeInfo.planeIdex, plane, referenceGeometry).then(function (success) {
            // cuttingSection.activate();
        });
    });
}

SectioningMenu.prototype.UpdateCuttingPlane2 = function () {
    var _this = this;

    // store plae info
    var cuttingManager = this.Webviewer.cuttingManager;
    var xyPlane = null;
    var xzPlane = null;
    var yzPlane = null;
    var xyReferenceGeometry = null;
    var xzReferenceGeometry = null;
    var yzReferenceGeometry = null;
    if ('XY' in this.Planes) {
        var cuttingSection = cuttingManager.getCuttingSection(this.Planes['XY'].cuttingSectionIndex);
        xyPlane = cuttingSection.getPlane(this.Planes['XY'].planeIdex);
        xyReferenceGeometry = cuttingSection.getReferenceGeometry(this.Planes['XY'].planeIdex);
    }
    if ('XZ' in this.Planes) {
        var cuttingSection = cuttingManager.getCuttingSection(this.Planes['XZ'].cuttingSectionIndex);
        xzPlane = cuttingSection.getPlane(this.Planes['XZ'].planeIdex);
        xzReferenceGeometry = cuttingSection.getReferenceGeometry(this.Planes['XZ'].planeIdex);
    }
    if ('YZ' in this.Planes) {
        var cuttingSection = cuttingManager.getCuttingSection(this.Planes['YZ'].cuttingSectionIndex);
        yzPlane = cuttingSection.getPlane(this.Planes['YZ'].planeIdex);
        yzReferenceGeometry = cuttingSection.getReferenceGeometry(this.Planes['YZ'].planeIdex);
    }

    var p = this.DeactivateCuttingSections();
    if (!p) {
        return;
    }

    p.then(function () {

        var allPromises = [];
        if (xyPlane) {
            var p = _this.AddCuttingPlane(Communicator.Axis.Z, xyPlane, xyReferenceGeometry);
            allPromises.push(p);
        }
        if (xzPlane) {
            var p = _this.AddCuttingPlane(Communicator.Axis.Y, xzPlane, xzReferenceGeometry);
            allPromises.push(p);
        }

        if (yzPlane) {
            var p = _this.AddCuttingPlane(Communicator.Axis.X, yzPlane, yzReferenceGeometry);
            allPromises.push(p);
        }

        return Communicator.Util.waitForAll(allPromises);
    });
}

SectioningMenu.prototype.DeactivateCuttingSections = function () {
    var cuttingManager = this.Webviewer.cuttingManager;

    var allPromises = [];
    if ('XY' in this.Planes) {
        var cuttingSection = cuttingManager.getCuttingSection(this.Planes['XY'].cuttingSectionIndex);
        allPromises.push(cuttingSection.clear());
        // cuttingSection.deactivate();
        delete this.Planes['XY'];
    }
    if ('XZ' in this.Planes) {
        var cuttingSection = cuttingManager.getCuttingSection(this.Planes['XZ'].cuttingSectionIndex);
        allPromises.push(cuttingSection.clear());
        // cuttingSection.deactivate();
        delete this.Planes['XZ'];
    }
    if ('YZ' in this.Planes) {
        var cuttingSection = cuttingManager.getCuttingSection(this.Planes['YZ'].cuttingSectionIndex);
        allPromises.push(cuttingSection.clear());
        // cuttingSection.deactivate();
        delete this.Planes['YZ'];
    }

    if (allPromises.length > 0) {
        return Communicator.Util.waitForAll(allPromises);
    }
}

// Measure Menu
function MeasureMenu(id, viewer) {
    this.Id = id;
    this.Webviewer = viewer;
    this.Active = false;

    this.ActiveOperator;
    this.ViewsOpen = false;

    this.SelectedRowKey;

    var _this = this;
    this.ViewerCallbackMap = {
        measurementCreated: function (measureMarkup) {
            _this.MeasurementCreated(measureMarkup);
        }
    };
}

MeasureMenu.prototype.Open = function () {
    this.Active = true;

    var element = document.getElementById("measureMenu" + this.Id);
    element.setAttribute('style', 'display:block');

    this.ShowMenu();
    this.InitEvents();

    // Close other sub-menus at same level
    if (model.views[this.Id].displayMenu.ModelViewsMenu.DisplayStylesMenu.Active) {
        model.views[this.Id].displayMenu.ModelViewsMenu.DisplayStylesMenu.Close();
    }
    if (model.views[this.Id].displayMenu.ModelViewsMenu.SectioningMenu.Active) {
        model.views[this.Id].displayMenu.ModelViewsMenu.SectioningMenu.Close();
    }
}

MeasureMenu.prototype.Close = function () {
    this.Active = false;

    var element = document.getElementById("measureMenu" + this.Id);
    element.setAttribute('style', 'display:none');

    this.TerminateEvents();
}

MeasureMenu.prototype.ShowMenu = function () {

    var _this = this;
    $("#measureMenu" + this.Id).dxList({
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

MeasureMenu.prototype.GetControls = function () {
    // var _this = this;
    return controls = [
        {
            Title: "Point To Point Measure",
            ImageSrc: "public/symbols/Measure.svg",
            click: function (e, menu) {
                if (menu.ActiveOperator !== Communicator.OperatorId.MeasurePointPointDistance) {
                    menu.ActivateOperator(Communicator.OperatorId.MeasurePointPointDistance);
                }
                else {
                    menu.DeActivateOperator();
                }

                menu.Close();
            }
        },
        {
            Title: "Face To Face Measure",
            ImageSrc: "public/symbols/FaceToFaceMeasure.svg",
            click: function (e, menu) {
                if (menu.ActiveOperator !== Communicator.OperatorId.MeasureFaceFaceDistance) {
                    menu.ActivateOperator(Communicator.OperatorId.MeasureFaceFaceDistance);
                }
                else {
                    menu.DeActivateOperator();
                }
                menu.Close();
            }
        },
        {
            Title: "Face Angle Measure",
            ImageSrc: "public/symbols/FaceAngleMeasure.svg",
            click: function (e, menu) {
                if (menu.ActiveOperator !== Communicator.OperatorId.MeasureFaceFaceAngle) {
                    menu.ActivateOperator(Communicator.OperatorId.MeasureFaceFaceAngle);
                }
                else {
                    menu.DeActivateOperator();
                }
                menu.Close();
            }
        },
        {
            Title: "Edge Measure",
            ImageSrc: "public/symbols/Edge Measure.svg",
            click: function (e, menu) {
                if (menu.ActiveOperator !== Communicator.OperatorId.MeasureEdgeLength) {
                    menu.ActivateOperator(Communicator.OperatorId.MeasureEdgeLength);
                }
                else {
                    menu.DeActivateOperator();
                }
                menu.Close();
            }
        },
        {           
            Title: "Measure Views",
            ImageSrc: "public/symbols/MarkupViews.svg",
            click: function (e, menu) {
                if (!menu.ViewsOpen) {
                    menu.ShowViews();
                }
                else {
                    menu.HideViews();
                }

                menu.Close();
            }
        },
        {
            Title: "Clear Measures",
            ImageSrc: "public/symbols/ClearAll.svg",
            click: function (e, menu) {
                model.views[menu.Id].measures = {};

                var allMeasures = menu.Webviewer.measureManager.getAllMeasurements();
                var totalMeasuresCleared = allMeasures.length;
                for (var i = 0; i < allMeasures.length; i++) {
                    menu.Webviewer.measureManager.removeMeasurement(allMeasures[i]);
                }

                DevExpress.ui.notify("'" + totalMeasuresCleared + "'" + " measures cleared.", "success", 1500);

                // refresh grid
                if (menu.ViewsOpen) {
                    menu.LoadMeasures();
                }

                menu.Close();
            }
        }
    ];
}

MeasureMenu.prototype.InitEvents = function () {
    var _this = this;

    _this.Webviewer.setCallbacks(_this.ViewerCallbackMap);
}

MeasureMenu.prototype.TerminateEvents = function () {
    var _this = this;
    _this.Webviewer.unsetCallbacks(_this.ViewerCallbackMap);
}

MeasureMenu.prototype.MeasurementCreated = function (measureMarkup) {
    // var name = measureMarkup.getName();
    // name = name + "-" + (model.views[this.Id].measures.length + 1);
    // measureMarkup.setName(name);

    var uniqueId = measureMarkup._uniqueId;
    // model.views[this.Id].measures[name] = measureMarkup;

    model.views[this.Id].measures[uniqueId] = measureMarkup;

    // refresh grid
    if (this.ViewsOpen) {
        this.LoadMeasures();
    }
}

MeasureMenu.prototype.ShowViews = function () {
    var _this = this;
    this.ViewsOpen = true;

    document.getElementById("measureViewsContainer" + this.Id).style.display = "block";

    $("#measureViewTabs" + this.Id).dxTabPanel({
        dataSource: [
            { title: "Measures", template: "tab1" }
        ],
        deferRendering: false,
        selectedIndex: 0
    });

    this.LoadMeasures(true);

    // enable close btn
    document.getElementById("measureViewsContainerClose" + this.Id).onclick = function () {
        _this.HideViews();
    }

    // enable delete btn
    document.getElementById("measureViewsClearBtn" + this.Id).onclick = function () {
        _this.DeleteMeasures();
    }

    // Make the DIV element draggable:
    xCheckStudio.Util.dragElement(document.getElementById("measureViewsContainer" + this.Id),
        document.getElementById("measureViewsCaptionBar" + this.Id));
}

MeasureMenu.prototype.LoadMeasures = function () {
    var _this = this;

    // annotations grid
    var measureColumns = [];

    var column = {};
    column["caption"] = "Measure";
    column["dataField"] = "Measure";
    column["width"] = "100%";
    column["visible"] = true;
    measureColumns.push(column);

    column = {};
    column["caption"] = "Id";
    column["dataField"] = "Id";
    column["visible"] = false;
    measureColumns.push(column);

    var measuresData = [];
    var measures = model.views[this.Id].measures;
    for (var measureId in measures) {
        measuresData.push({
            "Measure": measures[measureId].getName(),
            "Id": measureId
        });
    }

    var   selectionAttributes = {
        mode: "multiple",
        showCheckBoxesMode: "always",
    };
 
    var editingAttributes;
    // var editingAttributes = {
    //     mode: "cell",
    //     allowUpdating: true,
    //     startEditAction: "dblClick"
    // };
  
    $("#measuresGrid" + this.Id).dxDataGrid({
        columns: measureColumns,
        dataSource: measuresData,
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
            if (_this.SelectedRowKey) {
                var rowIndex = e.component.getRowIndexByKey(_this.SelectedRowKey);
                var rowElement = e.component.getRowElement(rowIndex)[0];

                _this.RemoveHighlightColor(rowElement);
            }

            _this.SelectedRowKey = e.key;

            _this.ApplyHighlightColor(e.rowElement[0]);            
        },
        onContentReady: function (e) {
            var scrollable = e.component.getScrollable();
            scrollable.scrollTo(scrollable.scrollHeight());
        },
        onEditorPrepared(e) {
            // if (e.parentType == 'dataRow') {
            //     e.editorElement.dxTextBox('instance').option('onValueChanged', args => {
            //         e.setValue(args.value);

            //         // _this.RenameMeasure(e.row.data.Id, args.value);
            //     });
            // }
        }
    });
}

MeasureMenu.prototype.HideViews = function () {
    this.ViewsOpen = false;

    document.getElementById("measureViewsContainer" + this.Id).style.display = "none";
}

MeasureMenu.prototype.DeleteMeasures = function () {
    var selectedRows = $("#measuresGrid" + this.Id).dxDataGrid("instance").getSelectedRowsData()
    if (selectedRows.length === 0) {
        return;
    }

    for (var i = 0; i < selectedRows.length; i++) {
        var measureMarkup = model.views[this.Id].measures[selectedRows[i].Id];
        this.Webviewer.measureManager.removeMeasurement(measureMarkup);
        delete model.views[this.Id].measures[selectedRows[i].Id];
    }

    DevExpress.ui.notify("'" + selectedRows.length + "'" + " measures cleared.", "success", 1500);

    // refresh grid
    this.LoadMeasures();
}

MeasureMenu.prototype.ApplyHighlightColor = function (row) {
    row.style.backgroundColor = "#e6e8e8";
}

MeasureMenu.prototype.RemoveHighlightColor = function (row) {
    row.style.backgroundColor = "#ffffff";
}

MeasureMenu.prototype.ActivateOperator = function (operator) {
    // this.DeActivateOperator();

    this.ActiveOperator = operator;
    this.Webviewer.operatorManager.set(operator, 1);
}

MeasureMenu.prototype.DeActivateOperator = function () {

    if (this.ActiveOperator) {
        this.Webviewer.operatorManager.remove(this.ActiveOperator);
        this.ActiveOperator = null;
    }
}