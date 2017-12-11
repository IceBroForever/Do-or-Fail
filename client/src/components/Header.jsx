import React from 'react'
import auth from '../auth'
import AppBar from 'material-ui/AppBar'
import FlatButton from 'material-ui/FlatButton'
import Avatar from 'material-ui/Avatar'
import { Redirect } from 'react-router-dom'

export default class Header extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            loginnedOut: false
        }

        this.onLogOut = this.onLogOut.bind(this);
    }

    onLogOut() {
        auth.logOut();
        this.setState({
            loginnedOut: true
        })
    }

    render() {
        if(this.state.loginnedOut) return(
            <Redirect to='/login' />
        );

        return (
            <AppBar
                style={{
                    width: '100%',
                    height: '100%',
                    alignItems: 'center'
                }}
                iconElementLeft={
                    <Avatar
                        src={'/' + auth.getRole() + '/' + auth.getLogin() + '/cover'}
                    />
                }
                iconElementRight={
                    <FlatButton
                        label='Logout'
                        onClick={this.onLogOut}
                    />
                }
                iconStyleRight={{
                    marginTop: '-7px' 
                }}
                title={auth.getLogin()}
            />

        );
    }
}