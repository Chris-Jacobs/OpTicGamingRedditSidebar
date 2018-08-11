import React, { Component } from 'react';
import './App.css';
import axios from 'axios'
import Match from './Match'
const server = 'http://localhost:5000'
class App extends Component {
  constructor() {
    super()
    this.state = {
      loaded: false,
      changes: false,
      resetNum: -1
    }
    this.update = this.update.bind(this)
    this.pushData = this.pushData.bind(this)
    this.getData()

  }
  getData() {
    axios.get(server).then(response => {
      this.setState( {
        data: response.data,
        loaded: true,
        changes: false,
        resetNum: this.state.resetNum + 1
      })
    })
  }
  pushData() {
    console.log(this.state.data)
    axios.post(server, this.state.data).then(response =>{
      this.setState({changes: false})
    }).catch(function(error) {
      console.log(error)
      alert("Error Pushing Changes")
    })
    
  }
  move(id,direction) {
    console.log(id)
    let temp = Object.assign({}, this.state.data)
    let number = temp[id].order
    let newNumber = number + direction
    for (let match in temp) {
      if (temp[match].order === newNumber) {
        temp[match].order = number
        temp[id].order = newNumber
        console.log(temp)
        this.setState({data: temp, changes: true})
        return
      }
    }
  }
  add() {
    const uuidv1 = require('uuid/v1');
    var id = uuidv1();
    console.log(id)
    var match = {
      id: id,
      order: Object.keys(this.state.data).length,
      status: "Upcoming",
      teamSprite: "#i_optic",
      org: "#i_",
      opponentSprite:"#i_",
      teamScore: null,
      opponentScore: null,
      link: null
    }
    let temp = Object.assign({}, this.state.data)
    temp[id] = match
    this.setState({data: temp, changes: true})
  }
  delete(id) {
    let temp = Object.assign({}, this.state.data)
    let order = temp[id].order
    for (let match in temp) {
      let old = temp[match].order
      if(old > order) {
        temp[match].order = old - 1
      }
    }
    delete temp[id]
    this.setState({data: temp, changes: true})

  }
  update(data){
    console.log(data)
    let temp = Object.assign({}, this.state.data)
    temp[data.id] = data
    console.log(temp)
    this.setState({data: temp, changes: true})
  }
  render() {
    console.log(this.state.data)
    if (!this.state.loaded) {
      return (
        <div style={{position: "absolute", top: "40%", left: "50%", textAlign: "center"}}>
          <i className="fas fa-sync fa-spin fa-6x" style={{color: "white"}}></i>
        </div>
      )

    }
    else {
      let data = []
      for (let match in this.state.data) {
        data.push(this.state.data[match])
      }
      data.sort((a,b) => {return a.order - b.order})
      let refreshText = this.state.changes ? "Reset" : "Refresh"
      return (
          <div>
              <div className = "well" style={{position: "fixed", display: "flex", justifyContent: "space-around", width: '100%', zIndex:1}} >
                <button className = "btn btn-primary" onClick = {() => this.add()}>Add Match</button>
                <button className = "btn btn-success" onClick = {() => this.pushData()} disabled = {!this.state.changes}> Push to Subreddit </button>
                <button className = "btn btn-warning" onClick = {() => this.getData()}>{refreshText}</button>
                <button className = "btn btn-info" onClick ={() =>window.open('https://www.reddit.com/r/OpTicGaming/wiki/edit_sidebar', '_blank')}>View Sidebar</button>
              </div>
              <div style= {{paddingTop: "74px"}}>
                {data.map((match) => {
                  return <Match data = {match} key={match.id + "_" + this.state.resetNum} updateApp = {(data) => this.update(data)} delete = {(id) => this.delete(id)} move = {(i,d) => this.move(i,d)} />
                })}
              </div>
          </div>
      );
    }
  }
}

export default App;
