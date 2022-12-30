import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import 'react-dropdown/style.css'
let sortingarr = [], fullarr = [], sortstate = 'date'
const sortoptions = ["date", "artist", "score"]

class ReviewRow extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (<tr className="reviewrow">
      <td className="title">{this.props.title}</td>
      <td className="artist">{this.props.artist}</td>
      <td className="rating">{this.props.rating}</td>
      <td className="date">{this.props.date}</td>
    </tr>)
    // <img className="thumbnail" src={this.props.turl}/>
  }
}

class Wrapper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {sort: props.sort}
  }
  changeSort = newsort => {
    console.log(newsort+"!!")
    this.setState({sort: newsort})
  }
  render() {
    return (
      <div>
        <div className="sortWrapper">
        <span>Sorting by:</span> <SortChooser default="date" click={this.changeSort.bind(this)}/>
      </div>

      <ReviewTable by={this.state.sort} id="reviewtable"/>
      </div>
    )
  }
}

const SortChooser = props => {
  console.log(props)
  const [choice, setChoice] = useState(props.default);
  const renderChoices = () => {
    for(let i in sortoptions) {
      i = sortoptions[i]
      return <span className="sortchoice" onClick={() => {props.click(i); setChoice(i)}}>{i}</span>
      // return <span className="sortchoice" onClick={() => {console.log(props)}}>{i}</span>
    }
  }
  return (
    <div className="sortchooser" by={choice}>
      <div className="choicewrapper">
        <span className="sortchoice" onClick={() => {props.click("date"); setChoice("date")}}>{"date"}</span>
        <span className="sortchoice" onClick={() => {props.click("artist"); setChoice("artist")}}>{"artist"}</span>
        <span className="sortchoice" onClick={() => {props.click("score"); setChoice("score")}}>{"score"}</span>
      </div>
    </div>
  )
}

const ReviewTable = props => {
  // props.state = {sort: sortstate} // date, artist, score, search
  const [sort, setSort] = useState(props.by)
  // props.currentconfig = fullarr
  function parseSort() {
    switch(sort) {
      case "artist":
        sortingarr = sortingarr.sort((a, b) => a.props.artist.localeCompare(b.props.artist))
        return (
          <table by={props.by} id="reviewtable">
            <tbody>
                {sortingarr}
              </tbody>
          </table>
        )
        case "score":
          sortingarr = sortingarr.sort((a, b) => Math.floor(a.props.rating.split("/")[0]) > parseInt(b.props.rating.split("/")[0]))
          return (
            <table by={props.by} id="reviewtable">
              <tbody>
                {sortingarr}
              </tbody>
            </table>
          )
      default:
      case "date": // default
        return (
          <table by={props.by} id="reviewtable">
            <tbody>
                {fullarr}
              </tbody>
          </table>
        )
    }
  }
  useEffect(() => {
    console.log("effect used! should sort by "+props.by)
    setSort(props.by)
  })
  // let result = parseSort()
  return parseSort()

    // all this shit is leftover. idk what it does but its supposed to replace that switch up there?? who fucken knows man
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

// function updateSort() {
//   console.log('sort updte!?')
//   rtable.setState({sort: document.querySelector("div.Dropdown-placeholder.is-selected").innerText})
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
loadJSON().then(() => {
  root.render(
    <Wrapper sort="date"/>
  )

  // root.render(
  //   <div>
  //     <div className="sortWrapper">
  //       <span>Sorting by:</span> <SortChooser default="date" click={sortchange}/>
  //     </div>

  //     {/* {rtable} */}
  //     <ReviewTable by="date" id="reviewtable"/>
  //   </div>
  // )
})

async function loadJSON() {
  let data = await fetch("https://raw.githubusercontent.com/kiawildberger/fantanosort/master/result.json");
  // if i use react to fix my shitty sort bs then maybe i dont need the ordered data??? would be nice tbh
  let order_data = await fetch("https://raw.githubusercontent.com/kiawildberger/fantanosort/master/ordered.json")
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
        sortingarr.push(<ReviewRow key={i.id} turl={turl} artist={i.artist} title={i.album} rating={i.rating} date={i.date} />)
        fullarr = sortingarr.slice()
  })
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
