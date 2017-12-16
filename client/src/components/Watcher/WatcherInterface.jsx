import React from 'react'
import GoogleMap from '../components/GoogleMap'
import auth from '../auth'
import Avatar from 'material-ui/Avatar'
import Dialog from 'material-ui/Dialog'
import PlayerProfile from './PlayerProfile'
import GameSession from './GameSessionForWatcher'

import '../../styles/Interface.scss'
import '../../styles/GoogleMap.scss'

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
            players: []
        };

        this.getPlayersOnline = this.getPlayersOnline.bind(this);
        this.getPlayersMarkers = this.getPlayersMarkers.bind(this);
        this.onPlayerAvatarClicked = this.onPlayerAvatarClicked.bind(this);
        this.backToMap = this.backToMap.bind(this);

        this.timerId = setTimeout(this.getPlayersOnline, 5000);
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

        this.timerId = setTimeout(this.getPlayersOnline, 5000);
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

    componentWillUnmount(){
        clearTimeout(this.timerId);
    }

    render() {

        if (this.state.status == statuses.PLAYER_SELECTED) {

        }

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
                    player={this.state.selectedPlayer}
                    backToMapClicked={this.backToMap}
                    // connectToGameSession={}
                />
                <GameSession
                    player={this.state.selectedPlayer}
                    open={this.state.status == statuses.IN_SESSION}
                />
            </div>
        );
    }

}