import React from 'react';
import ReactDOM from 'react-dom';
import MapContainer from './Map';
import "./index.css"
import registerServiceWorker from './registerServiceWorker'

async function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if(navigator.geolocation)
            navigator.geolocation.getCurrentPosition((position) => resolve(position))
        else reject()
    })
}

getCurrentPosition()
.then((position) => {
    ReactDOM.render(<MapContainer google={window.google} 
                        initPos={position.coords}
                    />, document.getElementById('root'));
    registerServiceWorker();
})
