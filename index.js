let table = document.getElementById('table')
async function populate() {
    let data = await fetch("https://raw.githubusercontent.com/kiawildberger/sadtano-sort/master/result.json")
    let json = await data.json()
    for(i in json) { // huge
        let tr = document.createElement("tr")
        i = json[i]
        tr.innerHTML = `<td><a href="https://youtube.com/watch?v=${i.id}" target="_blank"><img src="${i.thumb}"</a></td>
        <td>${i.album}</td>
        <td>${i.artist}</td>
        <td>${i.rating[0]}</td>
        <td>${i.nicedate}</td>`
        table.appendChild(tr)
    }
}

populate()