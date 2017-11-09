import React from 'react'
import {Map, GoogleApiWrapper} from 'google-maps-react'

export class MapContainer extends React.Component {

    constructor(props){
        super(props);
    }

    render() {
        return <Map google={this.props.google}
            streetViewControl={false}
            fullscreenControl={false}
            zoom={18}
            initialCenter={{
                lat: this.props.initPos.latitude,
                lng: this.props.initPos.longitude
            }}
        />
    }
}

export default GoogleApiWrapper({
    apiKey: "AIzaSyDJkq57UAMGEFrPd-OsV6_NYhdV2guuJf4"
})(MapContainer);