let table = document.getElementById('table'), 
    filter = document.getElementById("filter"), 
    button = document.querySelector('input[type="button"]'),
    countresults = document.getElementById("countresults")
let json, array = []

function createTR(i) {
    let colors = ["#FF5F33", "#CC4C29", "#96381E", "#0A361F", "#692715", "#36140B", "#14693D", "#1D9657", "#27CC77", "#30FF94", "#30FF94"]
    let tr = document.createElement("tr")
    let score = i.rating[0], color = colors[i.rating.toString().split('/')[0]];
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

async function populate() {
    let data = await fetch("https://raw.githubusercontent.com/kiawildberger/fantanosort/master/result.json")
    json = await data.json()
    for(i in json) { // huge
        i = json[i]
        if(!i.artist||!i.album) return;
        array.push(i)
        createTR(i)
    }
}

// all this just so it shows the "** reviews loaded" smh
async function start() { await populate(); countresults.innerText=array.length+" reviews loaded" } start()

filter.addEventListener("keypress", e => { if(e.keyCode === 13) process() })
button.addEventListener("click", process)

function process() {
    let total;
    if(filter.value === "") total = array // yes i understand what this means
    let artists = array.filter(x => x.artist.toLowerCase().includes(filter.value.toLowerCase()))
    let albums = array.filter(x => x.album.toLowerCase().includes(filter.value.toLowerCase()))
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
    if(filter.value==="") countresults.innerText = array.length+" reviews loaded"
}