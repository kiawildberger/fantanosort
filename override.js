(function() {
    const fs = require("fs")
    let data = JSON.parse(fs.readFileSync("./result.json"))
    function set(id, key, value) { if(data[id] && data[id][key]) data[id][key] = value; }

    set("JX54Kz7DaZQ", "rating", "7/10")

    fs.writeFileSync("./result.json", JSON.stringify(data))
})();