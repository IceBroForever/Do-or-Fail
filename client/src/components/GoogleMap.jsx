import React from 'react'
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react'

class GoogleMap extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Map
                google={this.props.google}
                streetViewControl={true}
                fullscreenControl={false}
                zoom={15}
            >
            </Map>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: "AIzaSyDJkq57UAMGEFrPd-OsV6_NYhdV2guuJf4"
})(GoogleMap);