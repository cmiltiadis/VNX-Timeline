// NEW VERSION OF DATA LOADER
// -JSON file from Google Sheets renamed to data.js, 
// - prepended file contents with "json= "
// - output a new list named data

const emoji_videogame = '🕹️'; // emoji_videogame

console.log("read-data.js -> json");

// year range 
let dataYearMin = 2000;
let dataYearMax = 2000;

// filters 
let filters = {}; // container for all filters 

// call main function 
const data = analyzeData();
const nData = data.length;
console.log("Loaded " + nData + " data items (data const)");
// console.log("Ingored: " + ignoreCounter + " data entries.");

// const nData = Object.entries(json).length;

function analyzeData() {
    let data = []; // to hold processed data


    //get keys and values 
    const values = Object.values(json);
    // get value keys 
    const valueKeys = Object.keys(values[0]);
    console.log("KEYS:  " + valueKeys);

    let dataTypes = {};
    let dataImpacts = {};
    let dataYears = {};
    let dataTags = {};
    let dataGenealogies = {};
    let typeCounter = 0;

    let ignoreCounter = 0;

    for (let i = 0; i < Object.entries(json).length; i++) {

        const key = Object.entries(json)[i][0];
        const val = Object.entries(json)[i][1];

        if (val.IGNORE == true) {
            ignoreCounter++;
            console.log(ignoreCounter + "--Ignore entry: " + key);
            // continue;
        };

        // DATE -----------------------------------------
        var date = new Date(val.Date);

        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDay();

        // DATE TEST ----------------------------------
        // Get year range 
        if (year > dataYearMax) dataYearMax = year;
        if (year < dataYearMin) dataYearMin = year;

        // Get list by Year - OK ----------------------
        if (year in dataYears) {
            dataYears[year].push(i);
        } else {
            dataYears[year] = [i];
        };
        // Get list by Impact - OK  ------------------------
        let impact = "";
        if (val.Impact) {
            impact = val.Impact.toLowerCase();
            if (impact in dataImpacts) { // if impact is there add index
                dataImpacts[impact].push(i);
            } else {
                dataImpacts[impact] = [i];
                if (impact == null) console.log("NULL IMPACT AT " + key);
            };
        } else {
            console.log("No impact for: " + key);
        }
        // Get list by Type - OK  ------------------------
        const type = val.Type;
        if (type in dataTypes) {
            dataTypes[type].push(i);
        } else {
            dataTypes[type] = [i];
            typeCounter++;
            // console.log("New type: " + type);
        };
        // TAGS 
        let tags = [];
        if (val.Tags) {
            tags = val.Tags.split(", ");

            tags.forEach(addToList);

            function addToList(value) {
                value = value.trim();
                if (value in dataTags) {
                    dataTags[value].push(i);
                } else {
                    // console.log("new tag: "+ value); 
                    dataTags[value] = [i];
                };
            };
        }
        // GENEALOGY 
        let genealogies = [];
        if (val.Genealogy) {
            genealogies = val.Genealogy.split(", ");
            genealogies.forEach(addToList);

            function addToList(value) {
                if (value in dataGenealogies) {
                    dataGenealogies[value].push(i);
                } else {
                    // console.log("new Genealogy: "+ value); 
                    dataGenealogies[value] = [i];
                };
            };
        };

        //Internal URL
        const internalURL = val['Internal URL'];
        const addEmojis = true;

        // console.log(internalURL); 
        const newEntry = {
            title: (addEmojis && tags.includes('videogame') ? emoji_videogame : "") + key,
            time: date, //new Date(year, month, day), 
            // by: val.by,
            url: internalURL,
            href: val.URL, // some have href
            impact: impact,
            type: type, 
            // typeInt:  dataTypes[type], //typeCounter,
            tags: tags,
            // text to display on popup 
            text: (val.Text ? paragraph(val.Text) : "")
                + (val.By ? paragraph(strong("By ") + val.By) : "")
                // + (paragraph((val.Approx? "ca. ":"") + date.toLocaleDateString() )) // date 
                + paragraph(strong("Date: ") + getDateString(date, val.Approx, val['End date']))
                + (val.Engine?paragraph( strong("Engine: ") + val.Engine):"")
                + (val.Type ? paragraph(strong("Type: ") + val.Type) : "")
                + (val.Genre ? paragraph("Genre: " + val.Genre) : "")
                + (val.Tags ? paragraph(strong("Tags: ") + italics(tags)) : "")
                + (val.Genealogy ? paragraph(strong("Genealogies: ") + italics(genealogies)) : "")
            // + (val.Approx?"ca.":"")
            // + (val["End date"] ? paragraph("From " + formatDate(day, month, year) + " until " + val['End date']) : formatDate(day,month,year ))

        };

        data.push(newEntry); // add to data array 
    };

    function getDateString(date, approximate, endDate) {
        // let fEndDate= (endDate!=null)? endDate: ""; 
        return (approximate ? "ca. " : "")
            + date.toLocaleDateString()
            + (endDate ? " - " +getEndDate(endDate) : "");
        //+     (endDate? "-"+ ((date instanceof Date)? endDate.toLocaleDateString(): endDate):""); 

    };

    function getEndDate(value){
        if (value instanceof Date){
            console.log(value); 
            return value.toLocaleDateString(); 
        
        } 
        else return new Date(value).toLocaleDateString();  
    }; 

    function formatDate(day, month, year) {
        return day + "." + month + "." + year;
    };

    // print date range 
    console.log("Year range: " + dataYearMin + "-" + dataYearMax);

    // SAVE FILTERS --------------------------
    filters['byYear'] = dataYears;
    filters['byImpact'] = dataImpacts;
    filters['byType'] = dataTypes; // (.Type)
    filters['byTag'] = dataTags; // (.Tags)
    filters['byGenealogy'] = dataGenealogies; // (.Genealogy)

    // TEST PRINT 
    // GET nTags & nGenealogies
    //  const nTags = Object.keys(dataTags).length;
    // console.log("#Tags: "+nTags); 
    //  const nGenealogies = Object.keys(dataGenealogies).length;
    // console.log("#Genealogies: "+nGenealogies); 
    // console.log("GENEALOGIES"); 
    // console.log(dataGenealogies); 
    // console.log("Year list"); 
    // console.log(dataYears);
    // console.log("IMPACT LIST");  
    // console.log(dataImpacts); 
    console.log("Data analysis OK");

    return data;
};  // END ANALYZE DATA -------------------------------------------------------------------------



// util function to add paragraphs to mouse over text 
function paragraph(input) {
    return "<p>" + input + "</p>";
};
function strong(input) {
    return "<strong>" + input + "</strong>";
};
function italics(input) {
    return "<i>" + input + "</i>";
};


// // -----------------------------------------
