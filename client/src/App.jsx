import React from 'react'
import { Switch, Route, Link, Redirect } from 'react-router-dom'
import auth from './auth'
import LoginWindow from './views/Login'
import RegisterWindow from './views/Register'

export default class App extends React.Component {

    render() {
        return (
            <Switch>
                <Route exact path='/login' component={LoginWindow} />
                <Route exact path='/resgister' component={RegisterWindow} />
                <Route path='/' render={() => {
                    if (auth.isAuthorized()) return (
                        <span>authorized {localStorage.getItem('token')}</span>
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