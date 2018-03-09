<template>
  <div id="startGame">
    <home-nav :nick="player.nick" :score="player.score"></home-nav>
    <img style="width:90%;" src="../assets/sitcon.png" />
    <p><strong style="font-size: 14px;">爲維護你的遊戲品質，請遊玩時，請勿隨意走動。</strong></p>
    <div style="width: 80%; margin: 50px auto 0px auto;">
      <v-btn block color="light-blue" style="height: 80px;font-size: 28px;" to="/round">開始遊戲</v-btn>
    </div>
    <table style="width: 80%; margin: 0 auto;">
      <tr>
        <td><v-btn block color="red" style="height: 80px;font-size: 28px;" to="/prize">兌換</v-btn></td>
        <td><v-btn block color="amber" style="height: 80px;font-size: 28px;" to="/rank">排行</v-btn></td>
      </tr>
    </table>
    <!-- <div style="width: 80%; margin: 50px auto 0px auto;">
      <v-btn block color="light-blue" style="height: 80px;font-size: 28px;" to="/develop">開發模式</v-btn>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'start',
  computed: {
    player () {
      return this.$store.state.player
    },
    offline () {
      return this.$store.state.offline
    }
  },
  methods: {
    start () {
      var self = this
      if (self.player.token !== '') {
        window.socketio.once('login', (msg) => {
          if (msg === 'success') {
            window.socketio.emit('score', self.player.token)
            window.socketio.emit('nick', self.player.token)
          } else {
            this.$emit('makeToast', 'Login error')
          }
        })
        window.socketio.emit('login', self.player.token)
      }
    }
  },
  watch: {
    offline (state) {
      if (!state) this.start()
    }
  },
  mounted () {
    if (window.socketio !== undefined) {
      this.start()
    }
  }
}
</script>

<style>

</style>
