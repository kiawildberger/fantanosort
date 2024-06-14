const axios = require("axios"), fs = require("fs"), result = require('./result.json'), core = require('@actions/core')
// config = require("./config.json")
const KEY = process.argv[2]
let playlistid = "UUt7fwAhXDy3oNFTAzF2o8Pw"
let npt, arr = {}, second = 1, fpt="no"
let badarray = {}


// some are self titled, if title has "self-titled" then album is artist



let ratingreg = new RegExp(/.+\/10/) // smh he had to ruin my beautiful regex because sometimes its not a definitive score (CLASSIC/:triumph:/etc)
let normalreg = new RegExp(/[0-9]{0,10}\/10/)

let zeroes = [], ones = [], twos = [], threes = [], fours = [], fives = [], sixes = [], sevens = [], eights = [], nines = [], tens = [], other = [], ordered = [];

async function getPlayListItems(pid, npt=null) {
    if(npt === fpt) { // the current page token is the first one
        console.log("finished!")
        require("./override.js")
        sortOrdered()
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
            let r = a.snippet.description.replace("tumblr.com/post/10", '').replace(/theneedledrop\.com\/(?:articles)?\/?\d+\/10\//, '').match(normalreg) // this is just numbers
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

            let t;
            if(r !== null && r instanceof Array) r = r.flat()
            if(r !== null && !r.includes(null)) t = r[0].split('/')[0] || r.split("/")[0]
            if(r === null) {
                // this means that theres just no score in the description which is ANNOYING and BAD
                badarray[a.snippet.resourceId.videoId] = {
                    title: a.snippet.title,
                    rating: "not in the description",
                    album: album.replace("(QUICK)", '') || "needs fix pls",
                    artist: artist,
                    date: date,
                    flatscore: t,
                    nicedate: nicedate,
                    id: a.snippet.resourceId.videoId,
                    thumb: a.snippet.thumbnails.default.url
                }
            }
            let g = { // https://google.com/search?q=javascript+remove+duplicates+from+array
                title: a.snippet.title,
                rating: r || "???/10",
                album: album,
                artist: artist,
                date: date,
                flatscore: t,
                nicedate: nicedate,
                id: a.snippet.resourceId.videoId,
                thumb: a.snippet.thumbnails.default.url
            }
            let id = a.snippet.resourceId.videoId;
            arr[id] = g
        }
    })
    
    getPlayListItems(playlistid, npt)
};

console.log("started!")
getPlayListItems(playlistid);

async function sortOrdered() {
    Object.values(arr).forEach(g => {
        t = g.flatscore;
        switch(parseFloat(t)) { // efficiemcy
            case 0:
                zeroes.push(g)
                break;
            case 1:
                ones.push(g)
                break;
            case 2:
                twos.push(g);
                break;
            case 3:
                threes.push(g);
                break;
            case 4:
                fours.push(g)
                break
            case 5:
                fives.push(g)
                break
            case 6:
                sixes.push(g)
                break
            case 7:
                sevens.push(g)
                break
            case 8:
                eights.push(g)
                break
            case 9:
                nines.push(g)
                break
            case 10:
                tens.push(g)
                break
            default:
                other.push(g)
                break
        }
    })
    ordered[0] = other;
    ordered[1] = zeroes;
    ordered[2] = ones;
    ordered[3] = twos;
    ordered[4] = threes;
    ordered[5] = fours;
    ordered[6] = fives;
    ordered[7] = sixes;
    ordered[8] = sevens;
    ordered[9] = eights;
    ordered[10] = nines;
    ordered[11] = tens;
    if(Object.keys(result).length === arr.length) {
        // there is no change, exit the action and make it so it doesn't fail
        // can i like cancel actions
        core.setMessage("no update")
        // core.setOutput()
        process.exit(0)
    }
    fs.writeFileSync("result.json", JSON.stringify(arr));
    fs.writeFileSync("ordered.json", JSON.stringify(ordered))
    // not sure about manual_todo.json cos i guess i can just assume that they 
    // fs.writeFileSync("manual_todo.json", JSON.stringify(badarray))
}
