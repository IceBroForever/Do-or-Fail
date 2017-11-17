import React from "react"
import request from "./request"
import GameMap from "./GameMap"

export default class WatcherInterface extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div>
                <GameMap />
            </div>
        );
    }

}

// TODO TODO fetching data from server and adding markers