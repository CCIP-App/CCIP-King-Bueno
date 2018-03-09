<template>
  <div id="Problem">
    <div class="inline">
      <div class="infor"><p>{{player.nick}}</p><p>{{score}}</p></div>
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
        <v-icon color="red" v-if="playerAnsView && playerAnswear === index">{{(!playerCurrect)?'clear':'check'}}</v-icon>{{ option }}<v-icon color="red" v-if="comAnsView && comAnswear === index">{{(!comCurrect)?'clear':'check'}}</v-icon>
      </v-btn>
    </div>
    <div class="player-time"><div class="bar"></div></div>
    <div class="com-time"><div class="bar"></div></div>
  </div>
</template>

<script>
import TWEEN from '@tweenjs/tween.js'
export default {
  name: 'problem',
  data () {
    return {
      timeLine: 0,
      problem: '',
      options: [],
      countDown: 0,
      comAnsView: false,
      comAnswear: 5,
      comCurrect: false,
      playerAnsView: false,
      playerAnswear: 5,
      playerCurrect: false,
      // internal: null,
      score: 0,
      comScore: 0,
      isAnimate: true
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
      // this.internal = setInterval(() => {
      //   if (this.countDown > 0) {
      //     this.countDown -= 1
      //   } else {
      //     this.startRound()
      //   }
      // }, 1000)
      this.startRound()
    },
    startRound () {
      window.socketio.emit('getProblem', {token: this.player.token, roomName: this.round.room})
      this.comAnsView = false
      this.playerAnsView = false
    },
    answear (index) {
      if (!this.playerAnsView) {
        this.playerAnswear = index
        window.socketio.emit('answear', {token: this.player.token, roomName: this.round.room, num: index})
      }
    },
    animate (time) {
      if (this.isAnimate) {
        window.requestAnimationFrame(this.animate)
        TWEEN.update(time)
      }
    }
  },
  beforeMount () {
    window.socketio.on('getProblem', (msg) => {
      console.log(msg)
      this.problem = msg.question
      this.options = msg.options
      this.countDown = msg.times

      var self = this
      var tweeningNumber = { countDown: self.countDown }
      new TWEEN.Tween(tweeningNumber)
        .to({ countDown: 0 }, this.countDown * 1000)
        .onUpdate(function () {
          self.countDown = tweeningNumber.countDown.toFixed(0)
        })
        .onComplete(function () {
          self.startRound()
        })
        .start()
    })
    window.socketio.on('computer', (msg) => {
      this.comCurrect = msg.currect
      this.comAnswear = msg.option
      var self = this
      var tweeningNumber = { score: self.comScore }
      new TWEEN.Tween(tweeningNumber)
        .easing(TWEEN.Easing.Quadratic.Out)
        .to({ score: window.parseInt(self.comScore) + window.parseInt(msg.score) }, 500)
        .onUpdate(function () {
          self.comScore = tweeningNumber.score.toFixed(0)
        })
        .start()
      this.comAnsView = true
    })
    window.socketio.on('answear', (msg) => {
      this.playerCurrect = msg.currect
      var self = this
      var tweeningNumber = { score: self.score }
      new TWEEN.Tween(tweeningNumber)
        .easing(TWEEN.Easing.Quadratic.Out)
        .to({ score: window.parseInt(self.score) + window.parseInt(msg.score) }, 500)
        .onUpdate(function () {
          self.score = tweeningNumber.score.toFixed(0)
        })
        .start()
      this.playerAnsView = true
    })
    window.socketio.on('finish', (msg) => {
      clearInterval(this.internal)
      this.internal = null
      this.$store.commit('setFinish', msg)
      this.$router.replace('/finish')
    })

    this.isAnimate = true
    requestAnimationFrame(this.animate)
    this.start()
  },
  beforeDestroy () {
    this.isAnimate = false
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

.btn__content {
  white-space:initial !important;
  text-transform: none;
}
.smallt > .btn__content {
  font-size: 12px
}
</style>
