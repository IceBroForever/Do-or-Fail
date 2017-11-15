import React from "react"
import axios from "axios"
import { Link } from "react-router-dom"

export default class Login extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            login: null,
            password: null,
            role: null,
            message: null
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleLoginChange = this.handleLoginChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleRoleChange = this.handleRoleChange.bind(this);
    }

    handleSubmit(event) {
        const { login, password, role } = this.state;

        axios.post('/login', {
            login,
            password,
            role
        })
            .then((responce) => {
                console.dir(responce);
            })
        event.preventDefault();
    }

    handleLoginChange(event) {
        this.setState({ login: event.target.value });
    }

    handlePasswordChange(event) {
        this.setState({ password: event.target.value });
    }

    handleRoleChange(event) {
        this.setState({ role: event.target.value });
    }

    render() {
        let messageElement = <span>{this.state.message}</span>;

        return (<form onSubmit={this.handleSubmit}>
            <label>
                Login:
                <input type="text" value={this.state.login} onChange={this.handleLoginChange} />
            </label>
            {this.state.message == "No such user" && messageElement}
            <label>
                Password:
                <input type="password" value={this.state.password} onChange={this.handlePasswordChange} />
            </label>
            {this.state.message == "Wrong password" && messageElement}
            <label>
                Role:
                    <label>
                    Player
                        <input type="radio" name="role" value="player" onChange={this.handleRoleChange} checked={this.state.role === "player"} />
                </label>
                <label>
                    Watcher
                        <input type="radio" name="role" value="watcher" onChange={this.handleRoleChange} checked={this.state.role === "watcher"} />
                </label>
            </label>
            <input type="submit" value="Submit" />
            <Link to="/register">Register</Link>
        </form>);
    }

}