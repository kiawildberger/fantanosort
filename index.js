let table = document.getElementById('table')
async function populate() {
    let data = await fetch("https://raw.githubusercontent.com/kiawildberger/sadtano-sort/master/result.json")
    let json = await data.json()
    for(i in json) { // huge
        let tr = document.createElement("tr")
        i = json[i]
        let score = i.rating
        if(i.rating instanceof Array) score = i.rating[0]
        tr.innerHTML = `<td><a href="https://youtube.com/watch?v=${i.id}" target="_blank"><img src="${i.thumb}"</a></td>
        <td>${i.album}</td>
        <td>${i.artist}</td>
        <td>${score}</td>
        <td>${i.nicedate}</td>`
        table.appendChild(tr)
    }
}

populate()