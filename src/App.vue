<template>
  <div id="app">
    <div>{{ counter }}</div>
    <button @click.stop="login">login</button>
    <button @click.stop="score">score</button>
    <button @click.stop="rank">rank</button>
    <button @click.stop="chooseLevel">chooseLevel</button>
    <button @click.stop="start">start</button>
    <button @click.stop="getProblem">getProblem</button>
    <button @click.stop="answear">answear</button>
    <button @click.stop="clear">clear</button>
    <div v-html="data"></div>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld'
import config from '../config'
import io from 'socket.io-client'

export default {
  name: 'App',
  data () {
    return {
      counter: 5,
      socket: null,
      token: 'xxxxxxxxxxxx',
      room: '',
      data: ''
    }
  },
  methods: {
    startConnect () {
      this.socket = io(config.socket)
      this.initSocket()
    },
    login () {
      this.socket.emit('login', this.token)
    },
    score () {
      this.socket.emit('score', this.token)
    },
    rank () {
      this.socket.emit('rank', this.token)
    },
    chooseLevel () {
      this.socket.emit('chooseLevel')
    },
    start () {
      this.socket.emit('start', {token: this.token, level: '青銅級'})
    },
    getProblem () {
      this.socket.emit('getProblem', {token: this.token, roomName: this.room})
    },
    answear () {
      this.socket.emit('answear', {token: this.token, roomName: this.room, num: 0})
      this.data += 'client answear' + this.counter + '<br>'
    },
    clear () {
      this.data = ''
    },
    count () {
      setTimeout(() => {
        this.counter--
        if (this.counter > 0) this.count()
      }, 1000)
    },
    initSocket () {
      this.socket.on('connect', () => {
        this.data += 'connect<br>'
      })
      this.socket.on('disconnect', () => {
        this.data += 'disconnect<br>'
      })
      this.socket.on('login', (msg) => {
        this.data += 'login' + msg + '<br>'
      })
      this.socket.on('score', (msg) => {
        this.data += 'score' + msg + '<br>'
      })
      this.socket.on('chooseLevel', (msg) => {
        this.data += 'chooseLevel' + msg.toString() + '<br>'
        console.log('chooseLevel', msg)
      })
      this.socket.on('start', (msg) => {
        this.data += 'start' + msg.toString() + '<br>'
        console.log('start', msg)
        this.room = msg
      })
      this.socket.on('getProblem', (msg) => {
        this.data += 'getProblem' + msg.toString() + '<br>'
        console.log('getProblem', msg)
        this.counter = msg.times
        this.count()
      })
      this.socket.on('computer', (msg) => {
        this.data += 'computer' + msg.toString() + this.counter + '<br>'
        console.log('computer', msg)
      })
      this.socket.on('finish', (msg) => {
        this.data += 'finish' + msg.toString() + '<br>'
        console.log('finish', msg)
      })
      this.socket.on('answear', (msg) => {
        this.data += 'answear' + msg.toString() + '<br>'
        console.log('answear', msg)
      })
      this.socket.on('rank', (msg) => {
        this.data += 'rank' + msg.toString() + '<br>'
        console.log('rank', msg)
      })
    }
  },
  mounted () {
    this.startConnect()
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
