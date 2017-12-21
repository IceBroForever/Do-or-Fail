import React from 'react'
import GoogleMap from './GoogleMap'
import auth from '../../auth'
import Avatar from 'material-ui/Avatar'
import Dialog from 'material-ui/Dialog'
import PlayerProfile from '../Player/PlayerProfile'
import GameSession from './GameSessionForWatcher'
import Snackbar from 'material-ui/Snackbar';

import '../../../styles/Interface.scss'
import '../../../styles/GoogleMap.scss'
import FlatButton from 'material-ui/FlatButton/FlatButton';
import RaisedButton from 'material-ui/RaisedButton/RaisedButton';

const statuses = {
    ON_MAP: 'ON_MAP',
    PLAYER_SELECTED: 'PLAYER_SELECTED',
    IN_SESSION: 'IN_SESSION'
}

export default class WatcherInterface extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            status: statuses.ON_MAP,
            selectedPlayer: '',
            players: [],
            messageToShow: null
        };

        this.getPlayersOnline = this.getPlayersOnline.bind(this);
        this.getPlayersMarkers = this.getPlayersMarkers.bind(this);
        this.onPlayerAvatarClicked = this.onPlayerAvatarClicked.bind(this);
        this.backToMap = this.backToMap.bind(this);
        this.connectToGameSession = this.connectToGameSession.bind(this);
        this.onSessionClosed = this.onSessionClosed.bind(this);

        this.timerId = setTimeout(this.getPlayersOnline, 1000);
    }

    async getPlayersOnline() {
        try {
            let responce = await auth.request({
                method: 'GET',
                url: '/watcher/getPlayersOnline'
            });

            console.log(responce.data.players);

            this.setState({
                players: responce.data.players
            });
        } catch (error) {
            console.log(error);
        }

        this.timerId = setTimeout(this.getPlayersOnline, 1000);
    }

    async onPlayerAvatarClicked(login, avatarProps) {
        this.setState({
            status: statuses.PLAYER_SELECTED,
            selectedPlayer: login
        });
    }

    getPlayersMarkers() {
        let playersMarkers = [];

        if (this.state.players)
            for (let player of this.state.players) {
                playersMarkers.push(
                    <div
                        className='Avatar'
                        lat={player.position.latitude}
                        lng={player.position.longitude}
                        key={player.login}
                    >
                        <Avatar
                            size={30}
                            src={'/player/' + player.login + '/cover'}
                        />
                    </div>
                )
            }

        return playersMarkers;
    }

    backToMap() {
        this.setState({
            status: statuses.ON_MAP,
            selectedPlayer: null
        });
    }

    connectToGameSession() {
        this.setState({
            status: statuses.IN_SESSION
        });
    }

    onSessionClosed(byPlayer) {
        this.setState({
            messageToShow: <Snackbar
                open={true}
                message={byPlayer ? "GameSession was closed by player" : "You disconnected from session"}
                autoHideDuration={2000}
            />,
            status: statuses.ON_MAP,
            selectedPlayer: ''
        });
    }

    componentWillUnmount() {
        clearTimeout(this.timerId);
    }

    render() {

        let actionsForProfile = (
            [
                <FlatButton
                    label='Back to map'
                    onClick={this.backToMap}
                />,
                <RaisedButton
                    label='Connect to game session'
                    primary={true}
                    onClick={this.connectToGameSession}
                />
            ]
        );

        let message = this.state.messageToShow;
        this.state.messageToShow = null;

        return (
            <div className='UserInterface'>
                <div className='GoogleMap'>
                    <GoogleMap
                        onChildClick={this.onPlayerAvatarClicked}
                    >
                        {this.getPlayersMarkers()}
                    </GoogleMap>
                </div>
                <PlayerProfile
                    show={this.state.status == statuses.PLAYER_SELECTED}
                    player={this.state.selectedPlayer}
                    actions={actionsForProfile}
                />
                <GameSession
                    player={this.state.selectedPlayer}
                    show={this.state.status == statuses.IN_SESSION}
                    onClose={this.onSessionClosed}
                />
                {message}
            </div>
        );
    }

}