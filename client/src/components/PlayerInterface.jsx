import React from 'react'
import auth from '../auth'
import VideoStreamer from './VideoStreamer'

export default class PlayerInterface extends React.Component {

    constructor(props) {
        super(props);

        this.getCurrentPosition = this.getCurrentPosition.bind(this);
        this.sendPositionInfo = this.sendPositionInfo.bind(this);

        this.state = {
            timerId: setInterval(this.sendPositionInfo, 5000),
            stream: null
        };

        this.streamGenerated = this.streamGenerated.bind(this);
    }

    streamGenerated(stream) {
        console.log('generated');
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

    render() {
        return (
            <VideoStreamer streamGenerated={this.streamGenerated} />
        );
    }

}