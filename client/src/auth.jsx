import axios from 'axios';

export default class auth {
    static isAuthorized() {
        return localStorage.getItem('isAuthorized') === 'true';
    }

    static getLogin() {
        return localStorage.getItem('login');
    }

    static getRole() {
        return localStorage.getItem('role');
    }

    static async verifyAuthorization() {
        try {
            let responce = await axios({
                url: '/verify',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': undefined
                }
            });

            localStorage.setItem('isAuthorized', true);
            localStorage.setItem('login', responce.data.login);
            localStorage.setItem('role', responce.data.role);
            localStorage.setItem('token', responce.data.token);

        } catch (error) {
            this.logOut();
            throw error.responce;
        }
    }

    static async logIn(login, password) {
        try {
            let responce = await axios({
                url: '/login',
                method: 'POST',
                data: {
                    login,
                    password
                }
            });

            localStorage.setItem('isAuthorized', true);
            localStorage.setItem('login', responce.data.login);
            localStorage.setItem('role', responce.data.role);
            localStorage.setItem('token', responce.data.token);

        } catch (error) {
            throw error.responce;
        }
    }

    static async register(login, password, role, avatar) {
        let data = new FormData();

        data.append('login', login);
        data.append('password', password);
        data.append('role', role);
        data.append('avatar', avatar);

        try {
            await axios({
                url: '/register',
                method: 'POST',
                data
            });
        } catch (error) {
            throw error.responce;
        }
    }

    static logOut() {
        localStorage.setItem('isAuthorized', false);
        localStorage.removeItem('login');
        localStorage.removeItem('role');
        localStorage.removeItem('token');
    }

    static async request({
        method,
        url,
        params = null,
        data = null
    }) {
        try {
            await axios({
                method,
                url,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': undefined
                },
                params,
                data
            })
        } catch (error) {
            throw error.responce;
        }
    }

    static generateDataForWebSocketRequest(data){
        let request = {
            login: localStorage.getItem('login'),
            token: localStorage.getItem('token')
        }

        for(let key in data) request[key] = data[key];

        return request;
    }
}