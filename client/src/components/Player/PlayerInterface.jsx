import React from 'react'
import auth from '../auth'
import { Card, CardActions } from 'material-ui/Card'
import GameSession from './GameSessionForPlayer'
import FlatButton from 'material-ui/FlatButton'
import PlayerProfile from './PlayerProfile'

import '../../styles/Interface.scss'

export default class PlayerInterface extends React.Component {

    constructor(props) {
        super(props);

        this.getCurrentPosition = this.getCurrentPosition.bind(this);
        this.sendPositionInfo = this.sendPositionInfo.bind(this);
        this.showProfile = this.showProfile.bind(this);
        this.closeProfile = this.closeProfile.bind(this);

        this.state = {
            timerId: setInterval(this.sendPositionInfo, 5000),
            showProfile: false
        };
    }

    async sendPositionInfo() {
        try {
            let position = await this.getCurrentPosition();

            await auth.request({
                method: 'POST',
                url: '/player/' + auth.getLogin() + '/updatePosition',
                data: {
                    latitude: position.latitude,
                    longitude: position.longitude
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        let { latitude, longitude } = position.coords;

                        resolve({
                            latitude,
                            longitude
                        });
                    },
                    (error) => {
                        reject(error);
                    });
            }
            else reject(new Error('Geolocation is not available'));
        });
    }

    componentWillUnmount() {
        clearTimeout(this.state.timerId);
    }

    showProfile() {
        this.setState({
            showProfile: true
        })
    }

    closeProfile() {
        this.setState({
            showProfile: false
        })
    }

    render() {
        return (
            <div className='UserInterface'>
                <div className='CardWrapper'>
                    <Card
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <GameSession />
                        <CardActions>
                            <FlatButton
                                label='Show profile'
                                onClick={this.showProfile}
                            />
                        </CardActions>
                    </Card>
                </div>
                <PlayerProfile
                    player={this.state.showProfile ? auth.getLogin() : null}
                    backToMapClicked={this.closeProfile}
                />
            </div>
        );
    }

}