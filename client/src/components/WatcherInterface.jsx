import React from 'react'
import GoogleMap from '../components/GoogleMap'
import auth from '../auth'
import Avatar from 'material-ui/Avatar'

import '../../styles/GoogleMap.scss'

export default class WatcherInterface extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            players: []
        };

        this.getPlayersOnline = this.getPlayersOnline.bind(this);
        this.getPlayerMarkers = this.getPlayerMarkers.bind(this);

        this.timerId = setTimeout(this.getPlayersOnline, 5000);
    }

    async getPlayersOnline() {
        try {
            let responce = await auth.request({
                method: 'GET',
                url: '/watcher/getPlayersOnline'
            });

            console.log(responce.data);

            this.setState({
                players: responce.data.players
            });
        } catch (error) {
            console.log(error);
        }

        this.timerId = setTimeout(this.getPlayersOnline, 5000);
    }

    getPlayerMarkers() {
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

    

    render() {
        return (
            <div className='GoogleMap'>
                <GoogleMap>
                    {this.getPlayerMarkers}
                </GoogleMap>
            </div>
        );
    }

}