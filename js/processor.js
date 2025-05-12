// PROCESSOR of data 
// 📓
// 🔗
//emoji link 
const addEmojis = true;
angular.module('app', [])
    .controller('demoCtrl', function ($scope, $timeout) {

        const debugMode = true; //enable for printouts
        // COLORS for labels 
        const colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];

        // D3 colors -         https://d3js.org/d3-scale-chromatic/categorical
        // const colorScale = d3.scale.category10();

        // ALGORITHMS
        $scope.distributorAlgorithms = [
            // 'fifo',
            'simple',
            'overlap',
            'none'
        ];

        // var in field Impact 
        const significant = ['significant', 'major'];
        // FORCE 
        const useForce = false;

        // graph directions
        $scope.directions = ['up', 'down', 'left', 'right'];
        const verticalOrientation = ['left', 'right']; // to get changes between Vertical & horizontal
        let previousDirection = 'right';
        let previousAmountOfNodes = 0;

        // GET TAGs object list {tag: true}
        $scope.tags = {};
        Object.keys(filters['byTag']).forEach(tagFun);
        function tagFun(value, index, array) {
            // console.log(value);
            $scope.tags[value] = true;
        };

        $scope.onTag = function (val) {
            $scope.tags[val] = !$scope.tags[val];
            console.log("ON TAG BUTTON: " + val + " - " + $scope.tags[val]);
        };
        $scope.toggleTags = function () {
            console.log("TOGGLE TAGS-- todo");
        };

        // update immediately
        $scope.autoLayout = true;

        // ---------------------------------------------------------
        // -- FILTER VARs -----------------------
        // ---------------------------------------------------------
        $scope.dataYearMax = dataYearMax;
        $scope.dataYearMin = dataYearMin;

        // TYPES ------------------------------------------------------
        const typeAll = 'ALL'
        $scope.dataTypes = (Object.keys(filters['byType']));
        $scope.dataTypes.unshift(typeAll); // unshift to add to array start
        //  GENEALOGIES
        $scope.dataGenealogies = (Object.keys(filters['byGenealogy']));
        $scope.dataGenealogies.unshift(typeAll); // // unshift to add to array start
        // 
        let nNodes = 0;
        // console.log("TYPES: " + $scope.dataTypes);
        // ---------------------------------------------------------
        // Render options 
        // ---------------------------------------------------------
        $scope.options = {
            // DIRECTION 
            direction: previousDirection, // 'right', // initial direction
            // NODE PROPERTIES / not used
            amount: nData,
            minWidth: 40,
            maxWidth: 60,

            // axis to nodes 
            layerGap: 150,
            // layout properties / not used 
            lineSpacing: 2,
            nodeSpacing: 3,
            minPos: 0,
            maxPos: 960,
            // Layout
            density: 0.75,
            algorithm: 'overlap',
        };
        // filters 
        $scope.filters = {
            filterTypes: typeAll,
            filterGenealogies: typeAll,

            filterTags: false,

            // YEAR 
            filterYear: false,
            yearMin: dataYearMin,
            yearMax: dataYearMax,

            // significance
            onlyMajor: false, //show only major
            constrainAmountOfNodes: false
        };

        // ---------------------------------------------------------
        // GET NODES - APPLY FILTERS TO DATA AND CREATE NODES ARRAY 
        // ---------------------------------------------------------
        let nodes = [];

        // function to get node data
        function generateNodes() {
            console.log(">Generate");
            nodes = filterData();
        };


        // function to filter data -> nodes
        function filterData() {
            // IF FILTER YEAR
            let filteredIndexes = [];

            // 1. FILTER YEAR RANGE ----------------------------------------------
            if ($scope.filters.filterYear) {
                if (debugMode) console.log('filter year range: ' + $scope.filters.yearMin + " to " + $scope.filters.yearMax);
                for (let y in filters['byYear']) {
                    if (y >= $scope.filters.yearMin && y <= $scope.filters.yearMax) {
                        filteredIndexes = filteredIndexes.concat(filters['byYear'][y]);
                    };
                }; //end loop
            } // end filter year
            else { // if not filter by year then get array of all indexes
                filteredIndexes = Array(nData).fill(0).map((_, index) => index);
            };

            // TAGS 
            if ($scope.filters.filterTags) {

            };

            // 2. FILTER CATEGORY -------------------------------------------------
            if ($scope.filters.filterTypes != typeAll) {

                const filteredByType = filters['byType'][$scope.filters.filterTypes];
                // if (debugMode) console.log("FILTER BY TYPE: "+ filteredByType); 
                filteredIndexes = filteredIndexes.filter(value => filteredByType.includes(value));
            };
            // 3. FILTER BY GENEALOGY  --------------------------------------------
            if ($scope.filters.filterGenealogies != typeAll) {
                const filteredByGen = filters['byGenealogy'][$scope.filters.filterGenealogies];
                if (debugMode) console.log("FILTER BY GEN: " + $scope.filters.filterGenealogies);
                filteredIndexes = filteredIndexes.filter(value => filteredByGen.includes(value));
            };

            // 4. FILTER SIGNIFICANCE ---------------------------------------------
            // ERROR CREATES DOUBLE ENTRIES
            if ($scope.filters.onlyMajor) {
                let onlyMajorIndexes = filters['byImpact']['major'];
                filteredIndexes = filteredIndexes.filter(value => onlyMajorIndexes.includes(value));
            };

            // CREATE ARRAY 
            let reducedArray = filteredIndexes.map(item => data[item]);

            // LIMIT AMOUNT FROM OPTIONS ---------------------
            // let len = data.length;
            if ($scope.filters.constrainAmountOfNodes) {
                reducedArray = reducedArray.slice(0, Math.min(reducedArray.length, $scope.options.amount));
            };
            // let reducedArray = data.slice(0, Math.min(nData, $scope.options.amount));
            // console.log(reducedArray);
            // LOG
            nNodes = reducedArray.length;
            $scope.options.amount = nNodes;
            console.log(">Prepared nodes. Length: " + nNodes);

            // change label 
            // const label = document.getElementById("label-num-labels");
            // label.innerHTML = "Number of nodes: " + nNodes;

            return reducedArray;
        };

        // ---------------------------------------------------------
        // LAYOUT 
        // ---------------------------------------------------------
        function layout(options, callback) {
            if (debugMode) console.log(">LAYOUT");

            // if (useForce) {
            //     console.log(">USING FORCE---------------------");

            //     // FORCE CONSTRUCTOR
            //     var force = new labella.Force({
            //         minPos: -10,
            //         maxPos: 600
            //     });
            //     force.nodes(nodes);
            //     force.compute();
            //     //
            //     nodes = force.nodes();
            // };
            // var force = new labella.Force({
            //     minPos: +options.minPos,
            //     maxPos: +options.maxPos,
            //     lineSpacing: +options.lineSpacing,
            //     nodeSpacing: +options.nodeSpacing,

            //     density: +options.density,
            //     algorithm: options.algorithm
            // });

            // createChart();

            function chartNodes() {

                if (debugMode) console.log(">CHART NODES / Layout");

                chart.data(nodes)
                    // on mouse over event
                    .on("dotMouseover", mouseOver)
                    .on("dotMouseout", mouseOut)
                    .on("labelMouseout", mouseOut)
                    .on("labelMouseover", mouseOver)
                    .on("labelClick", mouseClick)
                    .resizeToFit();
            };

            chartNodes();
        };

        // ---------------------------------------------------------
        // CREATE CHART + mouse events / triggered in LAYOUT & REGENERATE
        // ---------------------------------------------------------

        // create chart container, with size etc.
        // css id #timeline
        let timelineDiv = document.getElementById("#timeline");
        let chart;

        // DELETE SVG
        function deleteTimelineDiv() {

            if (timelineDiv) {
                timelineDiv.innerHTML = "";//reset SVG
                if (debugMode) console.log("Delete SVG");
            };
        };

        // canvas size 
        const initialWidth =400; 
        const initialHeight=9000; 
        $scope.canvasWidth = initialWidth;
        $scope.canvasHeight = initialHeight;

        function getWidth(direction) {

            if (verticalOrientation.includes(direction)) {
                return 800;
            } else {
                console.log("nodes: " + nNodes);
                return 2000;
            };
        };


        function createChart() {
            if (debugMode) console.log("Create CHART");

            deleteTimelineDiv();

            // https://github.com/kristw/d3kit-timeline/blob/master/docs/api.md
            chart = new d3KitTimeline('#timeline',
                {
                    // density: 0.75,
                    algorithm: $scope.options.algorithm, // 'overlap',
                    labella: {
                        algorithm: $scope.options.algorithm
                    },
                    // direction: 'down',
                    direction: $scope.options.direction,
                    initialWidth: $scope.canvasWidth,// getWidth($scope.options.direction),//graphWidth, //1000,
                    initialHeight: $scope.canvasHeight,//getWidth(!$scope.options.direction), //6000,
                    layerGap: $scope.options.layerGap, // axis to label 
                    dotRadius: 5,
                    labelBgColor: function (d) { return getColor(d); }, // LABEL COLOR
                    linkColor : function (d){return getColor(d); }, // LINE COLOR 
                    // dotColor: function (d) { return getColor(d); }, // DOT COLOR
                    textFn: function (d) { return d.title + (addEmojis ? (d.url ? " 🔗" : "") : "") },//+ (d.text?" 💬":"")}, // TITLE
                    // LABELS 
                    // textYOffset: 0.85em, // vertical offset for text within label 
                    labelPadding: { left: 5, right: 5, top: 5, bottom: 1 }, // label padding
                    // MARGIN OF CHART 
                    margin: {
                        left: getMarginLeft($scope.options.direction),
                        right: getMarginRight($scope.options.direction),
                        top: getMarginTop($scope.options.direction),
                        bottom: getMarginBottom($scope.options.direction)
                    } // graph padding
                });

        };


        function resetChart() {
            console.log("RESET CHART");
            deleteTimelineDiv();

            //direction 
            chart.options({ direction: $scope.options.direction });
            // algorithm 
            chart.options({ algorithm: $scope.options.algorithm });
            chart.options({
                labella: {
                    algorithm: $scope.options.algorithm
                }
            });
            // margins 
            chart.options({
                margin: {
                    left: getMarginLeft($scope.options.direction),
                    right: getMarginRight($scope.options.direction),
                    top: getMarginTop($scope.options.direction),
                    bottom: getMarginBottom($scope.options.direction)
                }
            }); // graph padding
            // size 
            chart.options({ initialWidth: getWidth($scope.options.direction) });
            chart.options({ initialHeight: getWidth(!$scope.options.direction) });
            // resize 
            chart.data(nodes).resizeToFit();
        };

        $scope.onCanvasSizeChange = function () {
            console.log("onCanvasSizeChange");

            $scope.updateChart();
        };

        $scope.updateChart = function () {
            console.log(">>UpdateChart");


            deleteTimelineDiv();

            // resetChart(); 

            chart.options({ initialWidth: $scope.canvasWidth });
            chart.options({ initialHeight: $scope.canvasHeight });
            chart.options({ direction: 'left' });

            // resize 
            chart.data(nodes).resizeToFit();

        };

        //  = new d3KitTimeline('#timeline',
        //     {
        //         // density: 0.75,
        //         algorithm: $scope.options.algorithm, // 'overlap',
        //         // direction: 'down',
        //         direction: $scope.options.direction,
        //         initialWidth: 800, //sizeShort, //1000,
        //         initialHeight: 2000, //sizeLong, //6000,
        //         layerGap: 50,
        //         dotRadius: 4,
        //         labelPadding: { left: 5, right: 5, top:5, bottom: 1 }, // label padding
        //         labelBgColor: function (d) { return getColor(d); }, // LABEL COLOR
        //         // dotColor: function (d) { return d.color; }, // DOT COLOR
        //         textFn: function (d) { return d.title + (addEmojis ? (d.url ? " 🔗" : "") : "") },//+ (d.text?" 💬":"")}, // TITLE
        //         margin: { left: 70, right: 30, top: 30, bottom: 30 } // graph padding
        //     });


        // ----------------------------------------------
        // regenerate
        // ----------------------------------------------
        $scope.regenerate = function () {
            console.log(">Regenerate: Generate, chart");
            // 1. generate node data (options)
            generateNodes();
            // 2. chart.data(nodes)
            // chartNodes();  
            // 3. if autolayout (update layout))
            if ($scope.autoLayout) {
                console.log(">>> Autolayout");
                $scope.updateLayout($scope.options);
            }
        };

        // UPDATE LAYOUT - calls layout
        $scope.updateLayout = function () {
            console.log("UPDATE LAYOUT");
            layout($scope.options);
        };

        // function to call for UI updates
        // $scope.autoRegenerate = function () {
        //     console.log(">Autoregenerate...")
        //     if ($scope.autoLayout) {
        //         $scope.regenerate();
        //     };
        // };

        // INITIALIZE -------------------------------------------------------------
        function initialize() {
            console.log(">Initialize");
            // get nodes 
            generateNodes();
            // create chart 
            createChart();
            // layout 
            layout($scope.options);
        };

        // initialize chart 
        initialize();


        let prevAmountOfNodes = 0;
        $scope.refilterData = function () {
            console.log(">Refilter data");
            nodes = filterData();

            // find node difference to rearrange the canvas size if needed 
            if (previousAmountOfNodes != 0) {
                const nodeAmtDiff = nNodes - previousAmountOfNodes;
                console.log(">>Node Amount diffrence: " + nodeAmtDiff);
                previousAmountOfNodes = nNodes;
            } else {//first assignment 
                previousAmountOfNodes = nNodes;
            };

            // prevAmountOfNodes = nodes.length;

            // // 
            // if (previousAmountOfNodes != 0) {
            //     const nodeAmtDiff = prevAmountOfNodes - nNodes;
            //     console.log("Node amt diff:" + nodeAmtDiff);
            // };

            // AUTO LAYOUTU CHART  
            if ($scope.autoLayout) layout($scope.options);
        };
        $scope.resetFilters = function () {
            console.log(">>Reset filters");
            $scope.filters.filterYear = false;
            $scope.filters.onlyMajor = false;
            $scope.filters.constrainAmountOfNodes = false;
            $scope.filters.filterTypes = typeAll;
            $scope.filters.filterGenealogies = typeAll;

            // refilter 
            $scope.refilterData();
        };

        // $scope.regenerate();

        // ----------------------------------------------
        // ----------------------------------------------
        // UTIL
        // ----------------------------------------------
        // ----------------------------------------------

        // ---------------------------------------------------------
        // DOWNLOAD SVG 
        // from https://codepen.io/michaelslevy/pen/zYGMxRR
        // ---------------------------------------------------------
        $scope.downloadSVG = function () {
            if (debugMode) console.log("download SVG");
            const obj = document.getElementById("timeline").innerHTML;
            const blob = new Blob([obj], { type: 'image/svg+xml' });
            let url = URL.createObjectURL(blob);
            // add download as hred to element by id 
            document.getElementById("save-svg").href = url;
        };

        // UTIL-GET COLOR
        function getColor(node) {
            //let colorIndex = node.typeInt * 2;

            let colorIndex = ($scope.dataTypes.indexOf(node.type) - 1); // -1 for 'ALL'
            {
                colorIndex *= 2;
                colorIndex += isSignificant(node);

            };
            return colors[colorIndex];
        };
        //UTIL-SIGNIFICANCE
        function isSignificant(node) {
            let impact = node['impact'].toLowerCase().trim();
            return significant.includes(impact) ? 0 : 1;
        };
        // ----------------------------------------------
        // MARGINS 
        // ----------------------------------------------

        // MARGIN TOP 
        function getMarginTop(direction) {
            if (direction == 'down') return 30;
            else return 30;
        };
        function getMarginBottom(direction) {
            if (direction == 'up') return 30;
            else return 30;
        };

        // MARGIN LEFT 
        function getMarginLeft(direction) {
            if (direction == 'right') return 70;
            else return 30;
        };
        // MARGIN RIGHT 
        function getMarginRight(direction) {
            if (direction == 'left') return 70;
            else return 30;
        };

        // ---------------------------------------------------------
        // MOUSE EVENTS 
        // ---------------------------------------------------------
        // d: data / i: index
        function mouseClick(d, i) {
            // console.log("click on " + d.title);
            if (d.url) {
                window.open("http://localhost:1313" + d.url);
            };
        }
        function mouseOver(d, i) {
            if (d.text) {
                const pop = document.getElementById('popup');
                pop.classList.add("visible");
                // TEXT 
                pop.innerHTML = d.text; //+"--"+ d.currentPos.x;
                // set position
                //  console.log("POS: "+ chart.nodes()[i].currentPos); 

                pop.style.left = (mouseX - window.scrollX) + 'px';//event.MouseEvent.pageX;
                pop.style.top = (mouseY + 35 - window.scrollY) + 'px';//event.MouseEvent.pageX;

                // change mouse pointer
                if (d.url) {
                    document.body.style.cursor = "pointer";
                };
            };

        };

        function mouseOut(d, i) {
            // make popup invisible 
            const pop = document.getElementById('popup');
            pop.classList.remove("visible");
            // reset mouse pointer
            document.body.style.cursor = "default";
        };
        // -----------------------------
        // Get mouse X/Y & page scroll 
        let mouseX = 0;
        let mouseY = 0;

        (function () {
            document.onmousemove = handleMouseMove;
            function handleMouseMove(event) {
                mouseX = event.pageX;
                mouseY = event.pageY;
                // scrollX=
            }
        })();
        // ---------------------------------------------------------
        // UI TRIGGERED FUNCTIONS - FILTERS 
        // ---------------------------------------------------------

        $scope.onSelectDirection = function () {
            // console.log("New Direction: " + $scope.options.direction);
            // $scope.updateLayout();

            if (verticalOrientation.includes($scope.options.direction)) {
                if (verticalOrientation.includes(previousDirection)) {
                    console.log(">>Orientation stays VERTICAL");
                } else {
                    console.log(">>Orientation change to HORIZONTAL");
                };
            } else if (verticalOrientation.includes($scope.options.direction) == false) {
                if (verticalOrientation.includes(previousDirection) == false) {
                    console.log(">>Orientation stays HORIZONTAL");
                } else {
                    console.log(">>Orientation change to VERTICAL");
                };
            };

            // assign 
            previousDirection = $scope.options.direction;

            resetChart();
        };

        // CONSTRAIN YEAR MIN/MAX RANGE
        $scope.onSliderYearMin = function () {
            if ($scope.filters.yearMin < dataYearMin) { //constrain within data range 
                $scope.filters.yearMin = dataYearMin;
            } else if ($scope.filters.yearMin > $scope.filters.yearMax) { // constrain to be at least equals with Max
                $scope.filters.yearMin = $scope.filters.yearMax;
            };
            //update label 
            const label = document.getElementById("label-year-min-range");
            label.innerHTML = "Year min " + $scope.options.yearMin;

            //print 
            if (debugMode) console.log("----Year range MIN change: " + $scope.options.yearMin + "-" + $scope.options.yearMax);

            if ($scope.filterYear) {
                $scope.refilterData();
            };
        };

        $scope.onSliderYearMax = function () {
            if ($scope.filters.yearMax > dataYearMax) { //constrain within data range 
                $scope.filters.yearMax = dataYearMax;
            } else if ($scope.filters.yearMax < $scope.filters.yearMin) { // constrain to be at least equals with Max
                $scope.filters.yearMax = $scope.filters.yearMin;
            };
            //label
            const label = document.getElementById("label-year-max-range");
            label.innerHTML = "Year max " + $scope.filters.yearMax;

            // print 
            if (debugMode) console.log("----Year range MAX change: " + $scope.filters.yearMin + "-" + $scope.filters.yearMax);

            if ($scope.filters.filterYear) {
                $scope.refilterData();
            };
        };
    }); 