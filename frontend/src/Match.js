import React from 'react';
import './App.css';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
const width = "408px"
export default class Match extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.props.data
        this.changeHandler = this.changeHandler.bind(this)
        this.move = this.move.bind(this)    
    }
    changeHandler(value, field) {       
        let dict = Object.assign({}, this.state)
        if (field === 'status' && value === "Live") {
            let link = prompt("Enter Link to Match Thread", "")
            if (link === null)
                return
            dict['link'] = link
        }
        dict[field] = value

        this.setState(dict)
        this.props.updateApp(dict)
    }
    move(direction) {
        this.props.move(this.state.id, direction)
    }
    handleDateChange(day) {
        let parseCheck = Date.parse(day)
        if (!parseCheck) {
            this.setState({day:day})
        }
        else {
            this.setState({day:day.toString().substring(4,10)})
        }
    }
    render() {
        return(
            <div className ="well" style = {{marginTop: "10px", padding: "5px", display:"flex", justifyContent: "space-between", backgroundColor: "#white"}}>
                <div style={{position: "relative"}}>
                    <i className="fas fa-angle-up fa-2x" style={{color: "black", position: "relative",  top: "-12px", left: "0px", cursor: "pointer"}} onClick={() => this.move(-1)}></i>
                    <i className="fas fa-angle-down fa-2x" style={{color: "black", position: "absolute", top: "55%", left: "0px", cursor: "pointer"}} onClick={() => this.move(1)}></i>
                </div>
                <div>
                    <DayPickerInput value = {this.state.day} onDayChange = {(day) => this.handleDateChange(day)} placeholder="Select Date" />
                    {this.state.status === "Upcoming" ? (
                        <input onChange = {(e) => this.changeHandler(e.target.value, "time")} value = {this.state.time} placeholder={"Enter Time"}/>
                    ) :(
                        <input onChange = {(e) => this.changeHandler(e.target.value, "link")} value = {this.state.link} />

                    )}
                    <select style={{height:"26px"}} value={this.state.status} onChange = {(e) => this.changeHandler(e.target.value, "status")}>
                        <option value={"Upcoming"}> Upcoming</option>
                        <option value={"Live"}> Live</option>
                        <option value={"Final"}> Final</option>
                    </select>
                    <a href={this.state.org}></a>
                    <input  onChange = {(e) => this.changeHandler(e.target.value, "org")} value ={this.state.org}/>
                </div>
                <div style={{width:width}}>
                    <a href={this.state.teamSprite}></a>
                    <input  onChange = {(e) => this.changeHandler(e.target.value, "teamName")} value ={this.state.teamName} placeholder={"Enter Team Name"}/>
                    <input  onChange = {(e) => this.changeHandler(e.target.value, "teamSprite")} value ={this.state.teamSprite}/>
                    {this.state.status !== "Upcoming" &&
                        <input type="number" min="0" style={{width: "30px"}} onChange = {(e) => this.changeHandler(e.target.value, "teamScore")} value ={this.state.teamScore}/>
                    }
                </div>
                <div style={{width:width}}>
                    <a href={this.state.opponentSprite}></a>
                    <input  onChange = {(e) => this.changeHandler(e.target.value, "opponentName")} value ={this.state.opponentName} placeholder={"Enter Opponent Name"}/>
                    <input  onChange = {(e) => this.changeHandler(e.target.value, "opponentSprite")} value ={this.state.opponentSprite}/>
                    {this.state.status !==   "Upcoming" &&
                        <input  type="number" min="0" style={{width: "30px"}} onChange = {(e) => this.changeHandler(e.target.value, "opponentScore")} value ={this.state.opponentScore}/>
                    }
                </div>
                <div style={{fontSize:"24px", marginRight: "5px", cursor: "pointer"}} >
                        <i className="fas fa-times fa-lg" style={{color: "red"}} onClick={() => this.props.delete(this.state.id)}></i>
                </div>
            </div>
        )
    }
}