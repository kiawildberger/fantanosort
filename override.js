(function() {
    const fs = require("fs")
    let data = JSON.parse(fs.readFileSync("./result.json"))
    /**
     * @param id the id of the review of the album that needs something changed
     * @param key what needs to be changed
     * @param value what it needs to be changed to
     */
    function set(id, key, value) { if(data[id] && data[id][key]) data[id][key] = value; }

    // this is for manually correcting things that are wack
    // this sets the score for polygondwanaland (by king gizzard) to 7/10 because a link screwed it up and i spent like 3 hours trying to fix it and failed
    set("JX54Kz7DaZQ", "rating", "7/10")
    /* the keys that you'd probably need are-
        artist
        album
        rating (score/10)

       of course there are a bunch of other ones, some of which i dont use but they're still there. check fetch.js for em all
    */


    fs.writeFileSync("./result.json", JSON.stringify(data))
})();