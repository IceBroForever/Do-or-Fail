import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardTitle, CardText, CardActions } from 'material-ui/Card'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import CheckBox from 'material-ui/Checkbox'
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import auth from '../auth'

import '../../styles/LoginAndRegisterForm.scss'

const patternError = 'Use characters, numbers, ".", "_". Length 5 - 16.';
const requireError = 'This field is required';

export default class RegisterWindow extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            login: '',
            password: '',
            secondPassword: '',
            showPassword: false,
            loginError: '',
            passwordError: '',
            secondPasswordError: '',
            role: '',
            roleError: ''
        }

        this.handleLoginChange = this.handleLoginChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSecondPasswordChange = this.handleSecondPasswordChange.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleRoleChange = this.handleRoleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleLoginChange(event, newValue) {
        event.preventDefault();

        this.setState({
            login: newValue
        })
    }

    handlePasswordChange(event, newValue) {
        event.preventDefault();

        this.setState({
            password: newValue
        })
    }

    handleSecondPasswordChange(event, newValue) {
        event.preventDefault();

        this.setState({
            secondPassword: newValue
        })
    }

    handleCheckboxChange(event, isChecked) {
        event.preventDefault();

        this.setState({
            showPassword: isChecked
        })
    }

    handleRoleChange(event, newValue) {
        event.preventDefault();

        this.setState({
            role: newValue
        });
    }

    async handleSubmit(event) {
        event.preventDefault();

        let loginError = '', passwordError = '', secondPasswordError = '', roleError = '';

        if (!this.state.login) loginError = requireError;
        else if (!/[a-zA-Z0-9._]{5,16}/.test(this.state.login)) loginError = patternError;

        if (!this.state.password) passwordError = requireError;
        else if (!/[a-zA-Z0-9._]{5,16}/.test(this.state.password)) passwordError = patternError;
        else if (this.state.password != this.state.secondPassword) passwordError = 'Passwords do not match';

        if (!this.state.secondPassword) secondPasswordError = requireError;

        if(!this.state.role) roleError = requireError;

        if (!loginError && !passwordError && !secondPasswordError && !roleError) {
            // request({
            //     method: 'POST',
            //     url: '/register',
            //     data: {
            //         login: this.state.login,
            //         password: this.state.password
            //     }
            // })
            //     .then(responce => {
            //         console.log(responce);
            //         if (responce.data.error) {
            //             this.setState({
            //                 loginError: responce.data.error,
            //                 passwordError,
            //                 secondPasswordError
            //             });
            //         }
            //         else {

            //         }
            //     });
        }
        else {
            this.setState({
                loginError,
                passwordError,
                secondPasswordError
            });
        }
    }

    render() {
        return (
            <div className='LoginAndRegisterForm'>
                <Card className='card'>
                    <CardTitle title='Registration' />
                    <CardText>
                        <TextField
                            name='login'
                            hintText={this.state.login || 'Write login you want'}
                            floatingLabelText='Login'
                            fullWidth={true}
                            type='text'
                            onChange={this.handleLoginChange}
                            errorText={this.state.loginError}
                        />
                        <TextField
                            name='password'
                            hintText={this.state.password || 'Write password you want'}
                            floatingLabelText='Password'
                            fullWidth={true}
                            type={this.state.showPassword ? 'text' : 'password'}
                            onChange={this.handlePasswordChange}
                            errorText={this.state.passwordError}
                        />
                        <TextField
                            name='secondpassword'
                            hintText={this.state.secondPassword || 'Just repeat password'}
                            floatingLabelText='Confirm password'
                            fullWidth={true}
                            type={this.state.showPassword ? 'text' : 'password'}
                            onChange={this.handleSecondPasswordChange}
                            errorText={this.state.secondPasswordError}
                        />
                        <CheckBox
                            label='Show passwords'
                            checked={this.state.showPassword}
                            onCheck={this.handleCheckboxChange}
                            checkedIcon={<Visibility />}
                            uncheckedIcon={<VisibilityOff />}
                        />
                        <RadioButtonGroup
                            className='role'
                            onChange={this.handleRoleChange}
                            name='role'
                        >
                            <RadioButton
                                value='player'
                                label='Player'
                            />
                            <RadioButton
                                value='watcher'
                                label='Watcher'
                            />
                        </RadioButtonGroup>
                    </CardText>
                    <CardActions>
                        <RaisedButton
                            primary={true}
                            label='Register'
                            onClick={this.handleSubmit}
                        />
                        <RaisedButton
                            secondary={true}
                            label='Log in'
                            href='/login'
                        />
                    </CardActions>
                </Card>
            </div>
        );
    }
}