<template>
  <v-app>
    <v-content>
      <v-container fluid  v-if="pageData.page === 'offline'">
        <div class="page" id="startGame">
          <!-- <div class="info-block" style="margin-top: 12px;">
            <div style="text-align: left;">{{ player.nick }}</div>
            <div style="text-align: right;">Score:{{ player.score }}</div>
          </div> -->
          <img src="./assets/sitcon.png" />
          <div style="width: 70%; margin: 50px auto 0px auto;">
            <p style="height: 80px;font-size: 28px;">遊戲尚未到開放時間</p>
          </div>
        </div>
      </v-container>
      <v-container fluid v-else>
        <div class="page" id="startGame" v-if="player.token!=='' && pageData.page==='start'">
          <div class="info-block" style="margin-top: 12px;">
            <div style="text-align: left;">{{ player.nick }}</div>
            <div style="text-align: right;">Score:{{ player.score }}</div>
          </div>
          <img src="./assets/sitcon.png" />
          <div style="width: 70%; margin: 50px auto 0px auto;">
            <v-btn block color="light-blue" style="height: 80px;font-size: 28px;" @click.stop="openRound">開始遊戲</v-btn>
          </div>
          <table style="width: 70%; margin: 0 auto;">
            <tr>
              <td><v-btn block color="red" style="height: 80px;font-size: 28px;" @click.stop="openPrize">兌換</v-btn></td>
              <td><v-btn block color="amber" style="height: 80px;font-size: 28px;" @click.stop="openRank">排行</v-btn></td>
            </tr>
          </table>
        </div>
        <div class="page" id="rank" v-if="pageData.rank!==null && pageData.page==='rank'">
          <div class="info-block">
            <div style="text-align: left;" @click="pageData.page='start'"><v-icon large>keyboard_arrow_left</v-icon>&nbsp;<span>排行</span></div>
          </div>
          <p style="font-size: 36px;text-align:center;"><span style="font-size:72px;">{{ pageData.rank.user }}</span> of {{ pageData.rank.sum }}</p>
          <table style="width:90%;text-align:center;margin:0 auto;">
            <tr v-for="(user,index) of pageData.rank.ranks" :key="'ranks-'+index">
              <td>{{ index+1 }}</td>
              <td>{{ user.nick }}</td>
              <td>{{ user.score }}</td>
            </tr>
          </table>
        </div>
        <div class="page" id="prize" v-if="pageData.prizes.length!==0 && pageData.page==='prize'">
          <div class="info-block">
            <div style="text-align: left;" @click="pageData.page='start'"><v-icon large>keyboard_arrow_left</v-icon>&nbsp;<span>兌換</span></div>
          </div>
          <p style="font-size: 28px;text-align:center;">最高分數: <span style="font-size:48px;">{{ player.score }}</span></p>
          <p style="font-size: 28px;text-align:center;">分數: <span style="font-size:48px;">{{ player.score-player.cost }}</span></p>
          <div style="width: 90%; margin: 50px auto 0px auto;">
            <template v-for="(prize,index) of pageData.prizes.prizes">
              <v-btn v-if="prize.needScore!==0" :key="'prizes-'+index" outline block color="black" style="height: 80px;font-size: 18px;">{{ prize.name }} {{ prize.needScore }}分<template v-if="prize.playerOnly"><br>只能兌換一次</template></v-btn>
              <v-btn v-else :key="'prizes-'+index" outline block disabled color="black" style="height: 80px;font-size: 18px;color:black !important;">{{ prize.name }}</v-btn>
            </template>
          </div>
        </div>
        <div class="page" id="round" v-if="pageData.rounds.length!==0 && pageData.page==='round'">
          <div class="info-block">
            <div style="text-align: left;" @click="pageData.page='start'"><v-icon large>keyboard_arrow_left</v-icon>&nbsp;<span>選擇關卡</span></div>
          </div>
          <div style="width: 90%; margin: 50px auto 0px auto;">
            <v-btn v-for="(round,index) of pageData.rounds" :key="'rounds-'+index" block color="amber" style="height: 80px;font-size: 24px;">{{ round }}</v-btn>
          </div>
        </div>
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

export default {
  name: 'App',
  data () {
    return {
      socket: null,
      player: {
        token: '',
        nick: '',
        score: 0,
        cost: 0
      },
      pageData: {
        page: '',
        rank: null,
        prizes: [],
        rounds: []
      },
      gameRound: {
        room: ''
      },
      snackbar: false,
      timeout: 10000,
      barText: ''
    }
  },
  beforeMount () {
    try {
      var token = window.localStorage.getItem('ccip-token')
      if (token !== null) {
        this.player.token = token
      } else {
        if ((this.parameters().token || '').length !== 0) {
          this.player.token = this.parameters().token
          window.localStorage.setItem('ccip-token', this.parameters().token)
        }
      }
    } catch (error) {
      window.alert('請離開 iOS 隱私模式 或 Add to homescreen')
    }
  },
  mounted () {
    this.startConnect()
  },
  methods: {
    startConnect () {
      var self = this
      fetch('https://king-api.sitcon.party/').then(() => {
        self.socket = io(config.socket, { rememberTransport: false, transports: ['websocket'] })
        if (self.player.token !== '' && self.socket) {
          self.alwaysEvent()
          self.startGame()
        }
      }).catch((error) => {
        self.pageData.page = 'offline'
        console.log(error)
      })

      // this.initSocket()
    },
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
      self.socket.on('connect', () => {
        console.log('connect')
      })
      self.socket.on('score', (score) => {
        console.log('score')
        self.player.score = score.score
        self.player.cost = score.cost
      })
      self.socket.on('nick', (nick) => {
        console.log('nick')
        self.player.nick = nick
      })
      self.socket.on('rank', (msg) => {
        console.log('rank', msg)
        self.pageData.rank = msg
      })
      self.socket.on('prize', (msg) => {
        console.log('prize', msg)
        self.pageData.prizes = msg
      })
      self.socket.on('chooseLevel', (msg) => {
        console.log('chooseLevel', msg)
        self.pageData.rounds = msg
      })
    },
    startGame () {
      var self = this
      self.pageData.page = 'start'
      if (self.player.token !== '') {
        self.socket.on('login', (msg) => {
          if (msg === 'success') {
            self.socket.emit('score', self.player.token)
            self.socket.emit('nick', self.player.token)
          } else {
            self.barText = 'Login error'
            self.snackbar = true
          }
        })
        self.socket.emit('login', self.player.token)
      }
    },
    openRank () {
      var self = this
      self.pageData.page = 'rank'
      self.socket.emit('rank', this.player.token)
    },
    openPrize () {
      var self = this
      self.pageData.page = 'prize'
      self.socket.emit('score', this.player.token)
      self.socket.emit('prize', this.player.token)
    },
    openRound () {
      var self = this
      self.pageData.page = 'round'
      self.socket.emit('chooseLevel')
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
}
.page {
  width: 100vw;
  height: 100vh;
  background-color: #FFFFFF;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  text-align: center;
}

#startGame > .info-block {
  font-size: 0px;
  width: 90%;
  margin: 0 auto;
}

#startGame > .info-block > * {
  display: inline-block;
  width: 50%;
  height: 50px;
  font-size: 24px;
  font-weight: 500;
}

#startGame > img {
  height: 40%;
  max-width: 80%;
  height: auto;
  margin: 0 auto;
}

#rank {
  font-size: 24px;
}

#rank > .info-block {
  margin: 0 auto;
  height: 50px;
  font-size: 24px;
  font-weight: 500;
  padding: 8px;
}

#rank > .info-block > div > * {
  vertical-align: middle;
}

#prize {
  font-size: 24px;
}

#prize > .info-block {
  margin: 0 auto;
  height: 50px;
  font-size: 24px;
  font-weight: 500;
  padding: 8px;
}

#prize > .info-block > div > * {
  vertical-align: middle;
}

#round {
  font-size: 24px;
}

#round > .info-block {
  margin: 0 auto;
  height: 50px;
  font-size: 24px;
  font-weight: 500;
  padding: 8px;
}
</style>
