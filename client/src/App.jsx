import React from 'react'
import { Switch, Route, Link, Redirect } from 'react-router-dom'
import auth from './auth'
import LoginWindow from './views/Login'
import RegisterWindow from './views/Register'
import UserInterface from './views/UserInterface'

export default class App extends React.Component {

    render() {
        return (
            <Switch>
                <Route exact path='/login' component={LoginWindow} />
                <Route exact path='/register' component={RegisterWindow} />
                <Route path='/' render={() => {
                    if (auth.isAuthorized()) return (
                        <UserInterface />
                    );
                    else return (
                        <Redirect to='/login' />
                    );
                }}
                />
            </Switch>
        );
    }
}