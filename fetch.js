const axios = require("axios"), fs = require("fs")
// config = require("./config.json")
const KEY = process.argv[2]
let playlistid = "UUt7fwAhXDy3oNFTAzF2o8Pw"
let npt, arr = {}, second = 1, fpt="no"
let badarray = {}

let ratingreg = new RegExp(/.+\/10/) // smh he had to ruin my beautiful regex because sometimes its not a definitive score (CLASSIC/:triumph:/etc)
let normalreg = new RegExp(/[0-9]{0,10}\/10/)

async function getPlayListItems(pid, npt=null) {
    if(npt === fpt) { // the current page token is the first one
        console.log("finished!")
        require("./override.js")
        return;
    }

    let result = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
        params: {
            part: 'id,snippet',
            maxResults: 50,
            playlistId: pid,
            key: KEY,
            pageToken: npt
        }
    });

    if(second === 2) fpt = npt; // genius strat
    second++

    npt = result.data.nextPageToken
    result.data.items.forEach(a => {
        if(a.snippet.title.includes("ALBUM REVIEW") || // did i miss some? i dont think so
            a.snippet.title.includes("MIXTAPE REVIEW") || // also maybe i should do this with regex but lmao no
            a.snippet.title.includes("EP REVIEW")) {
            let r = a.snippet.description.match(normalreg) // this is just numbers
            let alsocouldbe = a.snippet.description.match(ratingreg) // wack
            if(r && r[0] === "/10") r[0] = alsocouldbe
            if(a.snippet.description.toLowerCase().includes("classic/10")) r = "classic/10"
            // if(r) console.log(r[0].replace('\\n').trim())
            let q = a.snippet.title.split("-"), artist, album;
            if(!q[1] || !q[0]) {
                console.log(q[1], q[0]) // it cant figure out the artists/albums for these, jus do em manually
            } else {
                artist = q[0].trim(), album = q[1].replace(/[A-Z]+ REVIEW/, "").trim()
            }
            // try this when doing the search: https://flaviocopes.com/how-to-sort-array-by-date-javascript/
            let months = ["Jan ",'Feb ','Mar ','Apr ','May ','Jun ',"Jul ",'Aug ',"Sep ","Oct ","Nov ","Dec "]
            let date = a.snippet.publishedAt.split("T")[0];
            let nicedate = months[date.split('-')[1]-1]+date.split('-')[2]+", "+date.split('-')[0]
            if(r === null) {
                // this means that theres just no score in the description which is ANNOYING and BAD
                badarray[a.snippet.resourceId.videoId] = {
                    title: a.snippet.title,
                    rating: "not in the description",
                    album: album.replace("(QUICK)", ''),
                    artist: artist,
                    date: date,
                    nicedate: nicedate,
                    id: a.snippet.resourceId.videoId,
                    thumb: a.snippet.thumbnails.default.url
                }
            }
            arr[a.snippet.resourceId.videoId] = { // https://google.com/search?q=javascript+remove+duplicates+from+array
                title: a.snippet.title,
                rating: r || "???/10",
                album: album,
                artist: artist,
                date: date,
                nicedate: nicedate,
                id: a.snippet.resourceId.videoId,
                thumb: a.snippet.thumbnails.default.url
            }
        }
    })
    fs.writeFileSync("result.json", JSON.stringify(arr));
    // not sure about manual_todo.json cos i guess i can just assume that they 
    // fs.writeFileSync("manual_todo.json", JSON.stringify(badarray))
    getPlayListItems(playlistid, npt)
};

console.log("started!")
getPlayListItems(playlistid)