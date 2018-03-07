<template>
  <div id="Loading">
    <v-progress-circular style="margin-top:30vh;" indeterminate :size="200" color="green">載入中</v-progress-circular>
  </div>
</template>

<script>
export default {
  name: 'loading',
  props: ['level'],
  computed: {
    player () {
      return this.$store.state.player
    }
  },
  beforeMount () {
    window.socketio.on('start', (msg) => {
      console.log(msg)
      this.$store.commit('setRoom', msg)
      this.$router.replace('/problem')
    })
    setTimeout(() => {
      window.socketio.emit('start', { token: this.player.token, level: this.level })
    }, 3000)
  }
}
</script>

<style>

</style>
