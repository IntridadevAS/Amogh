let Analytics = {
    AnalyticsData : {},

    ShowSmallAnalytics: function (parentContainer, analyticsContainerId) {
        var _this = this;

        parentContainer.style.display = "none";
        document.getElementById(analyticsContainerId).style.display = "block";
        
        if(Object.keys(this.AnalyticsData).length > 0) {
            _this.LoadSmallAnalytics(analyticsContainerId);
        }
        else {
            this.GetAnalyticsData().then(function() {
                _this.LoadSmallAnalytics(analyticsContainerId);
            });
        }
    },

    ShowLargeAnalytics: function () {
        var _this = this;
        var modal = document.getElementById(Comparison.LargeAnalyticsContainer);
        modal.style.display = "block";

        if(Object.keys(this.AnalyticsData).length > 0) {
            _this.LoadLargeAnalytics();
        }
        else {
            this.GetAnalyticsData().then(function() {
                _this.LoadLargeAnalytics();
            });
        }
    },
    
    GetAnalyticsData : function() {
        var _this = this;
        var projectinfo = JSON.parse(localStorage.getItem('projectinfo'));
        var checkinfo = JSON.parse(localStorage.getItem('checkinfo'));

        return new Promise((resolve) => {
            $.ajax({
                url: 'PHP/AnalyticsDataReader.php',
                type: "POST",
                async: true,
                data: { 
                    'ProjectName': projectinfo.projectname,
                    'CheckName': checkinfo.checkname
                },
                success : function(msg) {
                    analyticsData = JSON.parse(msg);
                    _this.AnalyticsData = analyticsData;
                    return resolve(true);
                }
            });
        });
    },

    LoadSmallAnalytics : function(analyticsContainerId) {
        var currentCheck = GetCurrentCheck();
        if(analyticsContainerId.includes("comparison")) {
            document.getElementById("IFrameSmallAnalyticsComparison").contentWindow.LoadAnalyticsContent(this.AnalyticsData, currentCheck);
        }
        else {
            document.getElementById("IFrameSmallAnalyticsCompliance").contentWindow.LoadAnalyticsContent(this.AnalyticsData, currentCheck);
        }
    },

    LoadLargeAnalytics : function() {
        var currentCheck = GetCurrentCheck();
        document.getElementById("IFramelargeAnalytics").contentWindow.LoadAnalyticsContent(this.AnalyticsData, currentCheck);
    },

    showAnalytics: function (selected) {
        let parent = selected.parentNode;
    
        if (selected.id == Comparison.AnalyticsButton && model.selectedComparisons.length > 0) {
          if (!parent.classList.contains("maximize")) {
            this.ShowSmallAnalytics(parent, Comparison.SmallAnalyticsContainer);
          }
          else {
            this.ShowLargeAnalytics();
          }
        }
        else if (selected.id == Compliance.AnalyticsButton && model.selectedCompliance) {
          if (!parent.classList.contains("maximize")) {
            this.ShowSmallAnalytics(parent, Compliance.SmallAnalyticsContainer);
          }
          else {
            this.ShowLargeAnalytics();
          }
        }
    },
}

