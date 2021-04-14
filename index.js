let table = document.getElementById('table'), 
    filter = document.getElementById("filter"), 
    button = document.querySelector('input[type="button"]'),
    countresults = document.getElementById("countresults"),
    ssort = document.getElementById("ssort"),
    sortdrop = document.getElementById("sortmode-drop")
let json, fullarr = [], neversorted = [];

function createTR(i) {
    let colors = ["#FF5F33", "#CC4C29", "#96381E", "#0A361F", "#692715", "#36140B", "#14693D", "#1D9657", "#27CC77", "#30FF94", "#30FF94"]
    let tr = document.createElement("tr")
    let score = i.rating[0] || "no rating", color = colors[i.rating[0].toString().split('/')[0]];
    if(i.rating instanceof Array) score = i.rating[0]
    tr.innerHTML = `<td><a href="https://youtube.com/watch?v=${i.id}" target="_blank"><img src="${i.thumb}"</a></td>
    <td>${i.album}</td>
    <td>${i.artist}</td>
    <td style="color:${color || "#000000" };">${i.rating}</td>
    <td>${i.nicedate}</td>`
    table.appendChild(tr)
}
function resetTR() {
    Array.from(document.querySelectorAll("tr")).forEach(e => {if(e.id != "headers")e.remove()})
}

function find(album) {
    return neversorted.filter(x => x.album == album) || fullarr.filter(x => x.album == album)
}
let ordered;
async function populate() {
    let data = await fetch("https://raw.githubusercontent.com/kiawildberger/fantanosort/master/result.json")
    let order_data = await fetch("https://raw.githubusercontent.com/kiawildberger/fantanosort/master/ordered.json")
    ordered = await order_data.json()
    // let data = await fetch("127.0.0.1:5500/result.json")
    json = await data.json()
    console.log(Object.values(json).length) // this is correctly 2388
    // console.log(Object.values(json)[0])
    // for(q in json) { // huge
    Object.values(json).forEach(i => {
        // i = json[q]
        if(i.rating instanceof Array) i.rating = i.rating[0]
        if(i.rating === null) i.rating = "1/10"
        if(i.rating === "c") i.rating = "classic"
        // if(i.artist === "Death Grips") console.log(i)
        // if(i.rating && i.rating instanceof Array) i.rating = i.rating[0] // why is it null
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

filter.addEventListener("keypress", e => { if(e.keyCode === 13) process() })
button.addEventListener("click", process)

function process() {
    let total;
    sortdrop.value = "null"
    if(filter.value === "") total = neversorted
    let artists = fullarr.filter(x => x.artist.toLowerCase().includes(filter.value.toLowerCase()))
    let albums = fullarr.filter(x => x.album.toLowerCase().includes(filter.value.toLowerCase()))
    resetTR()
    if(!total) total = Array.from(artists.concat(albums))
    if(total.length === 0) {
        countresults.innerText = "nothing found for \""+filter.value+"\""
    } else {
        if(filter.value!="") countresults.innerText = total.length +" results found for \""+filter.value+"\""
        total.forEach(e => {
            createTR(e)
        })
    }
    if(filter.value==="") countresults.innerText = neversorted.length+" reviews loaded"
}


// maybe i should use something other than the regular-ass js sort like https://github.com/mziccard/node-timsort/
// or i should sort em when fetch.js run and just display the data so it loads fast(er)

function sort(sortmode) {
    let sortedarray = ordered;
    countresults.innerText = ''
    if(sortmode === 0) {
        resetTR();
        neversorted.forEach(e => {
            createTR(e)
        })
        return;
    }
    if(sortmode === 1) { // descending, highest first
        // sortedarray = sortedarray.sort((a, b) => b.flatscore - a.flatscore)
        // sortedarray = sortedarray.sort((a, b) => b.flatscore - a.flatscore)
        sortedarray.reverse()
        console.log(sortedarray)
        resetTR()
        sortedarray.forEach(e => {
            createTR(e)
        })
    }
    if(sortmode === 2) {
        // sortedarray = sortedarray.sort((a, b) => a.flatscore - b.flatscore)
        // sortedarray = sortedarray.sort((a, b) => a.flatscore - b.flatscore)
        console.log(sortedarray)
        resetTR()
        sortedarray.forEach(e => {
            createTR(e)
        })
    }
}

let sortmode = 0; // 0 neutral 1 ascending 2 descending
let sortmodecodes = ["&mdash;", "&#8593;", "&#8595;"]
ssort.addEventListener("click", () => {
    sortmode = (sortmode === 2) ? 0 : parseInt(sortmode)+1; // very smart or something idk
    if(sortmode === 3) sortmode = 0 // why is it 3 sometimes
    ssort.innerHTML = sortmodecodes[sortmode]
    sortdrop.value = "null"
    sort(sortmode)
})
sortdrop.addEventListener("change", () => {
    if(sortdrop.value === "null") return;
    sortmode = sortdrop.value;
    sortmode = (sortmode === 3) ? 0 : sortdrop.value;
    ssort.innerHTML = sortmodecodes[parseInt(sortmode)]
    sort(parseInt(sortmode))
})