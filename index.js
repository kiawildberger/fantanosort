let table = document.getElementById('table'), 
    filter = document.getElementById("filter"), 
    button = document.querySelector('input[type="button"]'),
    countresults = document.getElementById("countresults"),
    ssort = document.getElementById("ssort");
    sortdrop = document.getElementById("sortmode-drop")
let json, fullarr = [], neversorted = [];
let ordered, others; // ordered does not have others in it

function createTR(i) {
    let colors = ["#FF5F33", "#CC4C29", "#96381E", "#85321B", "#692715", "#36140B", "#14693D", "#1D9657", "#27CC77", "#30FF94", "#30FF94"]
    let tr = document.createElement("tr")
    let score = i.flatscore || "no rating";
    let color = "white"
    if(parseFloat(i.flatscore) === parseFloat(i.rating.toString().split("/")[0])) color = colors[parseFloat(i.flatscore.toString().trim())]
    let textcolor = "black"
    if(parseFloat(i.flatscore) === 5) textcolor = "white"
    if(i.rating instanceof Array) score = i.rating[0]
    tr.innerHTML = `<td class="thumb"><a href="https://youtube.com/watch?v=${i.id}" target="_blank"><img src="${i.thumb}"/></a></td>
    <td class="album">${i.album}</td>
    <td class="artist">${i.artist}</td>
    <td class="rating" style="background-color:${color || "#000000" };color:${textcolor}">${i.rating}</td>
    <td class="date">${i.nicedate}</td>`
    table.appendChild(tr)
    tr.addEventListener("click", () => console.log(i))
}
function resetTR() {
    Array.from(document.querySelectorAll("tr")).forEach(e => {if(e.id != "headers")e.remove()})
}

function find(album) {
    return neversorted.filter(x => x.album == album) || fullarr.filter(x => x.album == album)
}
async function populate() {
    let data = await fetch("https://raw.githubusercontent.com/kiawildberger/fantanosort/master/result.json")
    let order_data = await fetch("https://raw.githubusercontent.com/kiawildberger/fantanosort/master/ordered.json")
    ordered = await order_data.json()
    others = ordered[0]
    ordered.shift()
    json = await data.json()
    console.log(Object.values(json).length)
    Object.values(json).forEach(i => {
        if(i.rating instanceof Array) i.rating = i.rating[0]
        if(i.rating === null) i.rating = "1/10"
        if(i.rating === "c") i.rating = "classic"
        i.flatscore = parseFloat(i.rating.toString().replace("/10")); // some are NaN probably so jus make those special cases at the bottom ig (or the top???)
        i.flatscore = (i.flatscore > 10) ? i.flatscore = 7 : i.flatscore; // 7 is average?? idk should be in override.js so ig it doesnt matter too much
        if(!i.artist||!i.album) return;
        fullarr.push(i)
        neversorted.push(i)
        createTR(i)
    })
}

// all this just so it shows the "** reviews loaded" smh
async function start() { await populate(); countresults.innerText=fullarr.length+" reviews loaded" } start()

filter.addEventListener("keypress", e => { if(e.key === "Enter") process() })
button.addEventListener("click", process)

function filternsort(fvalue) {
    // this is for all of them but ordered
    if(!fvalue) return { bydate: neversorted.slice(), ordered: ordered.flat() }
    let sorting = ordered.slice().flat().reverse()
    sorting = sorting.filter(x => {
        if(x.artist !== undefined && x.artist.toLowerCase().includes(fvalue.toLowerCase()) ||
           x.album !== undefined && x.album.toLowerCase().includes(fvalue.toLowerCase())) return x;
    })
    let othersfiltered = others.slice().filter(x => {
        if(x.artist !== undefined && x.artist.toLowerCase().includes(fvalue.toLowerCase()) ||
           x.album !== undefined && x.album.toLowerCase().includes(fvalue.toLowerCase())) return x;
    })
    // and here they are by date
    let bydate = neversorted.slice().filter(x => {
        if(x.artist !== undefined && x.artist.toLowerCase().includes(fvalue.toLowerCase()) ||
           x.album !== undefined && x.album.toLowerCase().includes(fvalue.toLowerCase())) return x;
    })
    return {
        ordered: sorting.flat(),
        orderedothers: othersfiltered.flat(),
        bydate: bydate.flat()
    }
}

let sortedarray = neversorted, issorted = false, total, isfiltered = false;
function process() { // this should be called filter but thats the element smh
    if(filter.value === "") {
        resetTR()
        neversorted.forEach(e => { // id like to do this in one line but guess not lmao
            createTR(e)
        })
        countresults.innerText = neversorted.length+" reviews loaded"
        sortdrop.value = 'null'
        return;
    }
    let fns = filternsort(filter.value)
    switch(sortmode) {
        case 0:
            total = fns.bydate
            break;
        case 1: // 10s
            total = fns.ordered.reverse().concat(fns.orderedothers)
            break;
        case 2: // 0s
            total = fns.ordered.concat(fns.orderedothers)
            break;
        case 3:
            total = fns.bydate.reverse()
            break;
    }
    if(!isfiltered && (sortmode === 1 || sortmode === 2)) {
        total = total.concat(others)
    }
    resetTR()
    // if(!total) total = Array.from(artists.concat(albums))
    if(total.length === 0) {
        countresults.innerText = "nothing found for \""+filter.value+"\""
    } else {
        if(filter.value!="") countresults.innerText = total.length +" results found for \""+filter.value+"\""
        total.forEach(e => { createTR(e) })
    }
    if(filter.value==="") countresults.innerText = neversorted.length+" reviews loaded"
    isfiltered = true;
}

let arraytosort, others_tosort = []

// when filtered, highest and lowest dont work. when sorted by highest or lowest, filtering works.

function sort(sortmode) {
    let total;
    let fns = filternsort(filter.value)
    if(isfiltered) fns.ordered = fns.ordered.reverse()
    switch(sortmode) {
        case 0:
            total = fns.bydate
            break;
        case 1: // 10s
            total = fns.ordered.reverse().concat(fns.orderedothers)
            break;
        case 2: // 0s
            total = fns.ordered.concat(fns.orderedothers)
            break;
        case 3:
            total = fns.bydate.reverse()
            break;
    }
    if(!isfiltered && (sortmode === 1 || sortmode === 2)) {
        total = total.concat(others)
    }
    resetTR();
    total.flat().forEach(e => {
        if(e && e.rating === null || e.rating[0] === null) e.rating = "no rating";
        createTR(e)
    })
    if(total.length === 0) {
        countresults.innerText = "nothing found for \""+filter.value+"\""
    } else {
        if(filter.value!="") countresults.innerText = total.length +" results found for \""+filter.value+"\""
    }
    if(filter.value==="") countresults.innerText = neversorted.length+" reviews loaded"
}

let sortmode = 0; // 0 neutral 1 ascending 2 descending
let sortmodecodes = ["latest", "highest", "lowest", "oldest"]
sortdrop.addEventListener("change", () => {
    if(sortdrop.value === "null") return;
    sortmode = parseInt(sortdrop.value);
    // sortmode = (sortmode === 3) ? 0 : sortdrop.value;
    ssort.innerHTML = sortmodecodes[parseInt(sortmode)]
    if(sortmode > 0) { issorted = true; } else { issorted = false; }
    sort(parseInt(sortmode))
})

// chart.js

let ctx = document.getElementById("chart").getContext("2d")
let charttype = "bar";

let data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // 0-10, + wacky scores

function updateData() {
    neversorted.forEach(e => {
        switch(e.rating.replace("/10", "")) { // pain
            case "10":
                data[10]++
                break;
            case "9":
                data[9]++;
                break;
            case "8":
                data[8]++;
                break;
            case "7":
                data[7]++;
                break;
            case "6":
                data[6]++;
                break;
            case "5":
                data[5]++;
                break;
            case "4":
                data[4]++
                break;
            case "3":
                data[3]++
                break;
            case "2":
                data[2]++
                break;
            case "1":
                data[1]++;
                break;
            case "0":
                data[0]++;
                break;
            default:
                data[11]++
                break;
        }
    })
}

let chart = new Chart(ctx, {
    type: charttype,
    data: {
        labels: ["0/10", "1/10", "2/10", "3/10", "4/10", "5/10", "6/10", "7/10", "8/10", "9/10", "10/10"],
        datasets: [{
            label: "amount of scores given",
            data: data,
            backgroundColor: [
                'rgba(255, 95, 51, 0.8)',
                'rgba(204, 76, 41, 0.8)',
                'rgba(150, 56, 30, 0.8)', // 2
                'rgba(133, 50, 27, 0.8)', // 3
                'rgba(105, 39, 21, 0.8)', // 4
                'rgba(54, 20, 11, 0.8)', // 5
                'rgba(20, 105, 61, 0.8)', // 6
                'rgba(29, 150, 87, 0.8)', // 7
                'rgba(39, 204, 119, 0.8)', // 8
                'rgba(48, 255, 148, 0.8)', // 9
                'rgba(48, 255, 148, 0.8)' // 10
            ],
            borderColor: [
                'rgb(0, 0, 0)'
            ],
            borderWidth: 1,
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
})

document.getElementById("chartbutton").addEventListener("click", () => {
    let chartElem = document.getElementById("chartdiv")
    if(chartElem.style.display === "none") {
        chartElem.style.display = "block"
        document.getElementById("table").style.display = "none"
        document.getElementById("table").style.display = "none"
        document.getElementById("sortmode-drop").disabled = true
        document.getElementById("filter").disabled = true
        document.getElementById("chartbutton").value = "Hide chart"
    } else {
        chartElem.style.display = "none";
        document.getElementById("table").style.display = "block"
        document.getElementById("sortmode-drop").disabled = false
        document.getElementById("filter").disabled = false
        document.getElementById("chartbutton").value = "View chart"
    }
    updateData()
})

