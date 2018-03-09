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
        api.checkServer(this.parameters().token).then((res) => {
          this.$store.commit('setOffline', false)
          window.socketio = io(config.socket, { rememberTransport: false, transports: ['websocket'] })
          this.alwaysEvent()
        }).catch(() => {
          this.$store.commit('setOffline', true)
          this.$router.replace('/offline')
        })
      } else {
        this.$store.commit('setOffline', true)
        this.$router.replace('/offline')
      }
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
      window.socketio.on('disconnect', () => {
        console.log('disconnect')
        self.makeToast('已離線，請重新整理。')
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
