import React from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import auth from '../auth'

import '../../styles/PlayerProfile.scss'

export default class PlayerProfile extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            player: null,
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
        if (!newProps.player) {
            return this.setState({
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
            player
        })
    }

    render() {
        let open = this.state.player != null;

        let isOnline;
        if (open) {
            isOnline = this.state.player.isOnline;
        }

        return (
            <Dialog
                open={open}
                contentClassName='Dialog'
                bodyClassName='Container'
                actions={[
                    <FlatButton
                        label='Back to map'
                        onClick={this.props.backToMapClicked}
                    />,
                    <RaisedButton
                        label='Connect to game session'
                        onClick={this.props.connectToGameSession}
                        disabled={!isOnline}
                        primary={true}
                    />
                ]}
            >
                TODO: Player profile
            </Dialog>
        );
    }

}