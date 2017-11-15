import React from 'react'
import { Switch, Route, Redirect } from "react-router-dom"
import Login from './Login'
import Register from './Register'

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

    onLogin(props){
        this.setState(props);
    }

    render() {
        return (
            <Switch>
                <Route exact path="/" component={() => {
                    if(this.state.login) return (<h1>{this.state.login}</h1>);
                    else return (<Redirect to="/login" />);
                }} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/register" component={Register} />
            </Switch>
        )
    }
}