<template>
  <div id="round">
    <back-nav title="選擇關卡" topUrl="/start"></back-nav>
    <div style="width: 90%; margin: 50px auto 0px auto;">
      <v-btn v-for="(round,index) of rounds" :key="'rounds-'+index" block color="amber" style="height: 80px;font-size: 24px;" :to="'/loading/'+round">{{ round }}</v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'round',
  data () {
    return {
      rounds: []
    }
  },
  computed: {
    player () {
      return this.$store.state.player
    }
  },
  beforeMount () {
    window.socketio.on('chooseLevel', (msg) => {
      console.log('chooseLevel', msg)
      this.rounds = msg
    })
    window.socketio.emit('chooseLevel', this.player.token)
  }
}
</script>

<style>

</style>
