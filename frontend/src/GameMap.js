import React from 'react'
import { Map, GoogleApiWrapper } from 'google-maps-react'

class GameMapContainer extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (<div style={{ position: 'relative', width: '100%', height: '400px' }}>
            <Map google={this.props.google}
                streetViewControl={false}
                fullscreenControl={false}
                zoom={this.props.zoom}
                center={{
                    lat: this.props.position.latitude,
                    lng: this.props.position.longitude
                }}>
            </Map>
        </div>);
    }
}

export default GoogleApiWrapper({
    apiKey: "AIzaSyDJkq57UAMGEFrPd-OsV6_NYhdV2guuJf4"
})(GameMapContainer);