import React from 'react'
import Map from 'google-map-react'

export default class GoogleMap extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            center: {
                lat: 0,
                lng: 0
            },
            zoom: 4
        };

        this.getCurrentPosition = this.getCurrentPosition.bind(this);
    }

    async componentDidMount() {
        let position = await this.getCurrentPosition();

        this.setState({
            center: {
                lat: position.latitude,
                lng: position.longitude
            }
        })
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

    distanceToMouse(markerPos, mousePos, markerProps) {
        return Math.sqrt((markerPos.x - mousePos.x) * (markerPos.x - mousePos.x) + (markerPos.y - mousePos.y) * (markerPos.y - mousePos.y));
    }

    render() {
        return (
            <Map
                bootstrapURLKeys={{
                    key: "AIzaSyDJkq57UAMGEFrPd-OsV6_NYhdV2guuJf4"
                }}
                center={this.state.center}
                zoom={this.state.zoom}
                hoverDistance={15}
                distanceToMouse={this.distanceToMouse}
                onChildClick={this.props.onPlayerMarkerClick}
            >
                {this.props.children}
            </Map>
        );
    }
}