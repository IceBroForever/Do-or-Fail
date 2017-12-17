import React from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import auth from '../../auth'

import '../../../styles/PlayerProfile.scss'

export default class PlayerProfile extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            player: null,
            show: false
        };

        this.getPlayerInfo = this.getPlayerInfo.bind(this);
    }

    async getPlayerInfo(login) {
        let responce = await auth.request({
            method: 'GET',
            url: '/player/' + login
        });

        return responce.data;
    }

    async componentWillReceiveProps(newProps) {
        if (!newProps.show) {
            return this.setState({
                show: false,
                player: null
            });
        }

        let player = null;

        try {
            player = await this.getPlayerInfo(newProps.player);
        } catch (error) {
            console.log(error);
        }

        this.setState({
            show: true,
            player
        })
    }

    render() {

        let isOnline;
        if (this.state.show) {
            isOnline = this.state.player.isOnline;
        }

        return (
            <Dialog
                open={this.state.show}
                contentClassName='Dialog'
                bodyClassName='Container'
                actions={this.props.actions}
            >
                TODO: Player profile
            </Dialog>
        );
    }

}