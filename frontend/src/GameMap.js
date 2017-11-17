import React from 'react'
import request from './request'
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react'

class GameMapContainer extends React.Component {

    constructor(props) {
        super(props);

        let defaultParams = {
            center: {
                lat: 35,
                lng: 0
            },
            zoom: 4,
            playersOnline: []
        }

        this.state = defaultParams;

        this.checkPlayersOnline = this.checkPlayersOnline.bind(this);

        this.checkPlayersOnline;
        setInterval(this.checkPlayersOnline, 5000);
    }

    checkPlayersOnline() {
        request({
            method: 'GET',
            url: '/user/watcher/getOnlinePlayers'
        })
            .then((responce) => {
                let { players: playersID } = responce.data;

                if (playersID.length == 0) {
                    this.setState({ playersOnline: [] });
                    return;
                }

                let players = [];

                for (let i = 0; i < playersID.length; i++) {

                    let num = i;

                    request({
                        method: 'GET',
                        url: '/user/userInfo',
                        params: {
                            id: playersID[num],
                            fields: [
                                'login',
                                'position'
                            ]
                        }
                    })
                        .then((responce) => {
                            players.push(responce.data);
                            if (num == playersID.length - 1) this.setState({ playersOnline: players });
                        })
                }
            })
    }

    componentDidMount() {
        getCurrentPosition()
            .then((position) => {
                let { latitude, longitude } = position.coords;
                this.setState({ center: { lat: latitude, lng: longitude }, zoom: 18 });
            })
            .catch((error) => console.log(error));
    }


    render() {

        let playersMarkers = this.state.playersOnline.map((player) => {
            return (
                <Marker
                    title={player.login}
                    name={player.id}
                    position={{
                        lat: player.position.latitude,
                        lng: player.position.longitude
                    }} />
            )
        })

        return (<div style={{ position: 'relative', width: '100%', height: '400px' }}>
            <Map google={this.props.google}
                streetViewControl={false}
                fullscreenControl={false}
                zoom={this.state.zoom}
                center={this.state.center}
            >
                {playersMarkers}
            </Map>
        </div>);
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition((position) => resolve(position))
        else reject()
    })
}

export default GoogleApiWrapper({
    apiKey: "AIzaSyDJkq57UAMGEFrPd-OsV6_NYhdV2guuJf4"
})(GameMapContainer);