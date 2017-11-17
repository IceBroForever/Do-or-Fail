import React from "react"
import request from './request'
import VideoStreamer from "./VideoStreamer"

export default class PlayerInterface extends React.Component {

    constructor(props) {
        super(props);

        setInterval(updatePositionOnServer, 10000);
    }

    render() {
        return <VideoStreamer player={this.props.player} />
    }

}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition((position) => resolve(position))
        else reject()
    })
}

function updatePositionOnServer() {
    getCurrentPosition()
        .then((position) => {
            let { latitude, longitude } = position.coords;

            return request({
                method: 'POST',
                url: '/user/player/updatePos',
                params: {
                    latitude,
                    longitude
                }
            })
        })
        .then((responce) => {
            console.log(responce);
        })
}