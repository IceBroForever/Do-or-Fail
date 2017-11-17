import axios from 'axios'

export default ({
    method,
    url,
    params = null,
    data = null
}) => {
    return axios({
        method,
        url,
        headers:{
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': undefined
        },
        params,
        data
    })
}