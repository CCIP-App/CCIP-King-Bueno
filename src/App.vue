<template>
  <v-app>
    <v-content>
      <v-container fluid>
        <router-view @makeToast="makeToast"></router-view>
        <v-snackbar
            :timeout="timeout"
            :bottom="true"
            v-model="snackbar">
            {{ barText }}
            <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
        </v-snackbar>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import config from '../config'
import io from 'socket.io-client'
import api from './api/client.js'

export default {
  name: 'App',
  data () {
    return {
      snackbar: false,
      timeout: 10000,
      barText: ''
    }
  },
  beforeMount () {
    try {
      if ((this.parameters().token || '').length !== 0) {
        this.$store.commit('setToken', this.parameters().token)
        window.localStorage.setItem('ccip-token', this.parameters().token)
      }
      api.checkServer().then(() => {
        this.$store.commit('setOffline', false)
        window.socketio = io(config.socket, { rememberTransport: false, transports: ['websocket'] })
        this.alwaysEvent()
      }).catch(() => {
        this.$store.commit('setOffline', true)
      })
    } catch (error) {
      window.alert('請離開 iOS 隱私模式 或 Add to homescreen')
    }
  },
  methods: {
    parameters () {
      return location.search.split('?').pop().split('&').map(function (p) {
        var ps = p.split('=')
        var o = {}
        o[ps.shift()] = ps.join('=')
        return o
      }).reduce(function (a, b) {
        var o = a
        for (var k in b) {
          o[k] = b[k]
        }
        return o
      })
    },
    alwaysEvent () {
      var self = this
      window.socketio.on('connect', () => {
        console.log('connect')
      })
      window.socketio.on('score', (score) => {
        console.log('score', score)
        self.$store.commit('setScore', score.score)
        self.$store.commit('setCost', score.cost)
      })
      window.socketio.on('nick', (nick) => {
        console.log('nick')
        self.$store.commit('setNick', nick)
      })
    },
    makeToast (text) {
      this.barText = text
      this.snackbar = true
    }
    // login () {
    //   this.socket.emit('login', this.token)
    // },
    // score () {
    //   this.socket.emit('score', this.token)
    // },
    // rank () {
    //   this.socket.emit('rank', this.token)
    // },
    // chooseLevel () {
    //   this.socket.emit('chooseLevel')
    // },
    // start () {
    //   this.socket.emit('start', {token: this.token, level: '青銅級'})
    // },
    // getProblem () {
    //   this.socket.emit('getProblem', {token: this.token, roomName: this.room})
    // },
    // answear () {
    //   this.socket.emit('answear', {token: this.token, roomName: this.room, num: 0})
    //   this.data += 'client answear' + this.counter + '<br>'
    // },
    // clear () {
    //   this.data = ''
    // },
    // initSocket () {
    //   this.socket.on('connect', () => {
    //     this.data += 'connect<br>'
    //   })
    //   this.socket.on('disconnect', () => {
    //     this.data += 'disconnect<br>'
    //   })
    //   this.socket.on('login', (msg) => {
    //     this.data += 'login' + msg + '<br>'
    //   })
    //   this.socket.on('score', (msg) => {
    //     this.data += 'score' + msg + '<br>'
    //   })
    //   this.socket.on('chooseLevel', (msg) => {
    //     this.data += 'chooseLevel' + msg.toString() + '<br>'
    //     console.log('chooseLevel', msg)
    //   })
    //   this.socket.on('start', (msg) => {
    //     this.data += 'start' + msg.toString() + '<br>'
    //     console.log('start', msg)
    //     this.room = msg
    //   })
    //   this.socket.on('getProblem', (msg) => {
    //     this.data += 'getProblem' + msg.toString() + '<br>'
    //     console.log('getProblem', msg)
    //     this.counter = msg.times
    //     this.count()
    //   })
    //   this.socket.on('computer', (msg) => {
    //     this.data += 'computer' + msg.toString() + this.counter + '<br>'
    //     console.log('computer', msg)
    //   })
    //   this.socket.on('finish', (msg) => {
    //     this.data += 'finish' + msg.toString() + '<br>'
    //     console.log('finish', msg)
    //   })
    //   this.socket.on('answear', (msg) => {
    //     this.data += 'answear' + msg.toString() + '<br>'
    //     console.log('answear', msg)
    //   })
    //   this.socket.on('rank', (msg) => {
    //     this.data += 'rank' + msg.toString() + '<br>'
    //     console.log('rank', msg)
    //   })
    // }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000000;
  font-size: 24px;
}
</style>
