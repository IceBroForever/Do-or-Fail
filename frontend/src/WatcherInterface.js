import React from "react"
import GameMap from "./GameMap"

export default class WatcherInterface extends React.Component {

    constructor(props) {
        super(props);

        let defaultParams = {
            position: {
                latitude: 35,
                longitude: 0
            },
            zoom: 4
        }

        this.state = defaultParams;
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation)
                navigator.geolocation.getCurrentPosition((position) => resolve(position))
            else reject()
        })
    }

    componentDidMount() {
        this.getCurrentPosition()
            .then((position) => {
                let { latitude, longitude } = position.coords;
                this.setState({ position: { latitude, longitude }, zoom: 18 });
            })
            .catch((error) => console.log(error));
    }

    render() {
        return (<GameMap
            player={this.props.player}
            position={this.state.position}
            zoom={this.state.zoom}
            google={window.google}
        />);
    }

}