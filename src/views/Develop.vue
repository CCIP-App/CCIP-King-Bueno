<template>
  <div id="Problem">
    <div class="inline">
      <div class="infor"><p>IU</p><p>{{score}}</p></div>
      <div class="timer"><v-progress-circular indeterminate :size="100" color="green">{{countDown}}</v-progress-circular></div>
      <div class="infor"><p>COM</p><p>{{comScore}}</p></div>
    </div>
    <div class="problem-text">{{ problem }}</div>
    <div class="option">
      <v-btn
        class="option-text"
        v-for="(option,index) of options"
        :key="'option-'+index"
        outline block large
        color="blue darken-4"
        @click.stop="answear(index)"
        :class="{ smallt: (option.length > 20) }">
        <v-icon color="red">clear</v-icon>{{ option }}<v-icon color="red">check</v-icon>
      </v-btn>
    </div>
    <table style="width: 80%; margin: 0 auto;">
      <tr>
        <td><v-btn block color="red" style="height: 80px;font-size: 28px;" @click="nextP(false)">上一個</v-btn></td>
        <td><v-btn block color="amber" style="height: 80px;font-size: 28px;" @click="nextP(true)">下一個</v-btn></td>
      </tr>
    </table>
  </div>
</template>

<script>
import TWEEN from '@tweenjs/tween.js'
import api from '../api/client.js'
export default {
  name: 'problem',
  data () {
    return {
      timeLine: 0,
      problem: '',
      options: [],
      countDown: 0,
      internal: null,
      score: 0,
      comScore: 0,
      now: 0,
      allProblem: []
    }
  },
  computed: {
    player () {
      return this.$store.state.player
    },
    round () {
      return this.$store.state.round
    }
  },
  methods: {
    start () {
      this.startRound()
      // this.internal = setInterval(() => {
      //   if (this.countDown > 0) {
      //     this.countDown -= 1
      //   } else {
      //     this.startRound()
      //   }
      // }, 1000)
    },
    startRound () {
      // window.socketio.emit('getProblem', {token: this.player.token, roomName: this.round.room})
      this.now += 1
      this.problem = this.allProblem[this.now].question
      this.options = this.allProblem[this.now].options
      this.countDown = 5
    },
    answear (index) {
      if (!this.playerAnsView) {
        this.playerAnswear = index
        // window.socketio.emit('answear', {token: this.player.token, roomName: this.round.room, num: index})
      }
    },
    animate (time) {
      window.requestAnimationFrame(this.animate)
      TWEEN.update(time)
    },
    nextP (index) {
      if (index) this.now += 1
      else this.now -= 1
      this.problem = this.allProblem[this.now].question
      this.options = this.allProblem[this.now].options
      this.countDown = 5
    }
  },
  beforeMount () {
    // window.socketio.on('getProblem', (msg) => {
    //   console.log(msg)
    //   this.problem = msg.question
    //   this.options = msg.options
    //   this.countDown = msg.times
    // })
    // window.socketio.on('computer', (msg) => {
    //   this.comCurrect = msg.currect
    //   this.comAnswear = msg.option
    //   var self = this
    //   var tweeningNumber = { score: self.comScore }
    //   new TWEEN.Tween(tweeningNumber)
    //     .easing(TWEEN.Easing.Quadratic.Out)
    //     .to({ score: window.parseInt(self.comScore) + window.parseInt(msg.score) }, 500)
    //     .onUpdate(function () {
    //       self.comScore = tweeningNumber.score.toFixed(0)
    //     })
    //     .start()
    //   this.comAnsView = true
    // })
    // window.socketio.on('answear', (msg) => {
    //   this.playerCurrect = msg.currect
    //   var self = this
    //   var tweeningNumber = { score: self.score }
    //   new TWEEN.Tween(tweeningNumber)
    //     .easing(TWEEN.Easing.Quadratic.Out)
    //     .to({ score: window.parseInt(self.score) + window.parseInt(msg.score) }, 500)
    //     .onUpdate(function () {
    //       self.score = tweeningNumber.score.toFixed(0)
    //     })
    //     .start()
    //   this.playerAnsView = true
    // })
    // window.socketio.on('finish', (msg) => {
    //   clearInterval(this.internal)
    //   this.internal = null
    //   this.$store.commit('setFinish', msg)
    //   this.$router.replace('/finish')
    // })

    // requestAnimationFrame(this.animate)

    api.getAllProblem().then((res) => {
      this.allProblem = res.data
      this.start()
    })
  }
}
</script>

<style>
.inline {
  font-size: 0px;
}
.inline > * {
  display: inline-block;
  vertical-align: top;
}
.inline > .infor {
  width: 30%;
  font-size: 24px;
}
.inline > .infor > p {
  margin: 10px;
}
.inline > .timer {
  width: 40%;
  font-size: 30px;
}

.problem-text {
  /* margin-top: 5vh; */
  width: 100%;
  height: 35vh;
  text-align: justify;
  font-size: 16px
}
.option {
  margin-top: 15px;
}
.option-text {
  width: 100%;
  margin-top: 15px;
  position: relative;
}

.btn__content:before {
  background-color: transparent !important;
}

.btn__content {
  white-space:initial !important;
  text-transform: none;
}
.smallt > .btn__content {
  font-size: 12px
}
</style>
