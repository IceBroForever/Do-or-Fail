import React from 'react'
import { Switch, Route, Redirect } from "react-router-dom"
import Login from './Login'
import Register from './Register'
import PlayerInterface from './PlayerInterface'
import WatcherInterface from './WatcherInterface'

export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            login: localStorage.getItem("login"),
            role: localStorage.getItem("role"),
            id: localStorage.getItem("id")
        };

        this.onLogin = this.onLogin.bind(this);
    }

    onLogin(props) {
        this.setState(props);

        localStorage.setItem('login', props.login);
        localStorage.setItem('id', props.id);
        localStorage.setItem('role', props.role);
        localStorage.setItem('token', props.token);
    }

    render() {
        return (
            <Switch>
                <Route exact path="/" render={() => {
                    if (this.state.login) {
                        if(this.state.role == "player") return <PlayerInterface player={this.state} />
                        else return <WatcherInterface player={this.state} />
                    }
                    else return (<Redirect to="/login" />);
                }} />
                <Route exact path="/login" render={() => { return <Login onLogin={this.onLogin} /> }} />
                <Route exact path="/register" render={() => { return <Register onLogin={this.onLogin} /> }} />
            </Switch>
        )
    }
}