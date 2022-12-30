import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css'
let fullarr = [], sortingarr= [], sortstate = 'date'
const sortoptions = ["date", "artist", "score"]

class ReviewRow extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (<div className="reviewrow">
      <div className="title">{this.props.title}</div>
      <div className="artist">{this.props.artist}</div>
      <div className="rating">{this.props.rating}</div>
    </div>)
    // <img className="thumbnail" src={this.props.turl}/>
  }
}

class ReviewTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {sort: this.props.by} // date, artist, score, search
  }
  render() {
    fullarr = fullarr.slice(1,6)
    console.log(fullarr)
    switch(this.props.by) {
      case "date": // default
        return (
          <div by={this.props.by} id="reviewtable">
            {fullarr}
          </div>
        )
      case "artist":
        fullarr = fullarr.sort((a, b) => a.artist.localeCompare(b.artist))
        console.log(fullarr)
        return (
          <div by={this.props.by} id="reviewtable">
            {fullarr}
          </div>
        )
    }
    return fullarr.slice(1, 6)
    // sorting = sorting.filter(x => {
    //     if(x.artist !== undefined && x.artist.toLowerCase().includes(fvalue.toLowerCase()) ||
    //        x.album !== undefined && x.album.toLowerCase().includes(fvalue.toLowerCase())) return x;
    // })
    // let othersfiltered = others.slice().filter(x => {
    //     if(x.artist !== undefined && x.artist.toLowerCase().includes(fvalue.toLowerCase()) ||
    //        x.album !== undefined && x.album.toLowerCase().includes(fvalue.toLowerCase())) return x;
    // })
    // // and here they are by date
    // let bydate = neversorted.slice().filter(x => {
    //     if(x.artist !== undefined && x.artist.toLowerCase().includes(fvalue.toLowerCase()) ||
    //        x.album !== undefined && x.album.toLowerCase().includes(fvalue.toLowerCase())) return x;
    // })
  }
}

// function updateSort() {
//   console.log('sort updte!?')
//   rtable.setState({sort: document.querySelector("div.Dropdown-placeholder.is-selected").innerText})
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
let rtable = <ReviewTable by={sortstate} id="reviewtable"/>;
loadJSON().then(() => {
  root.render(
    <div>
      <span className="sortWrapper">
        <span>Sorting by:</span> <Dropdown options={sortoptions} onChange={sortchange} value="date" />
      </span>

      {rtable}
    </div>
  )

  function sortchange() {
    // is this bad. i think it might be.
    console.log(rtable.props)
    // document.getElementById("reviewtable").setAttribute("by",
    //   document.querySelector("div.Dropdown-placeholder.is-selected").innerText)
    // rtable.setState({sort: document.querySelector("div.Dropdown-placeholder.is-selected").innerText})
    rtable.props.updateSort()
    console.log(rtable.props)
  }
})

async function loadJSON() {
  let data = await fetch("https://raw.githubusercontent.com/kiawildberger/fantanosort/master/result.json");
  // if i use react to fix my shitty sort bs then maybe i dont need the ordered data??? would be nice tbh
  // let order_data = await fetch("https://raw.githubusercontent.com/kiawildberger/fantanosort/master/ordered.json")
  let json = await data.json()
  console.log(Object.values(json).length)
  Object.values(json).forEach(i => {
        if(i.rating instanceof Array) i.rating = i.rating[0]
        if(i.rating === null) i.rating = "1/10"
        if(i.rating === "c") i.rating = "classic"
        i.flatscore = parseFloat(i.rating.toString().replace("/10")); // some are NaN probably so jus make those special cases at the bottom ig (or the top???)
        i.flatscore = (i.flatscore > 10) ? i.flatscore = 7 : i.flatscore; // 7 is average?? idk should be in override.js so ig it doesnt matter too much
        if(!i.artist||!i.album) return;
        let turl = "https:/\/i.ytimg.com/vi/"+i.id+"/default.jpg"
        fullarr.push(<ReviewRow key={i.id} turl={turl} artist={i.artist} title={i.album} rating={i.rating} />)
        sortingarr = fullarr.slice()
  })
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
