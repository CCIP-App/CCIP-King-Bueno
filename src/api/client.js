import axios from 'axios'
import globalConfig from '../../config/index.js'
var config = {
  baseURL: globalConfig.server,
  timeout: 3000
}

var client = axios.create(config)

export default {
  checkServer: (token) => {
    return client.get('/?token=' + token)
  }
}
