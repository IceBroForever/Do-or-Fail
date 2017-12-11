import React from 'react'
import GoogleMap from '../components/GoogleMap'

import '../../styles/GoogleMap.scss'

export default class WatcherInterface extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='GoogleMap'>
                <GoogleMap google={window.google} />
            </div>
        );
    }

}