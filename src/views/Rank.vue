<template>
  <div id="rank">
    <back-nav title="排行" topUrl="/start"></back-nav>
    <p style="font-size: 36px;text-align:center;"><span style="font-size:72px;">{{ rank.user }}</span> of {{ rank.sum }}</p>
    <table style="width:90%;text-align:center;margin:0 auto;">
      <tr v-for="(user,index) of rank.ranks" :key="'ranks-'+index">
        <td>{{ index+1 }}</td>
        <td>{{ user.nick }}</td>
        <td>{{ user.score }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: 'rank',
  data () {
    return {
      rank: []
    }
  },
  computed: {
    player () {
      return this.$store.state.player
    }
  },
  beforeMount () {
    window.socketio.once('rank', (msg) => {
      console.log('rank', msg)
      this.rank = msg
    })
    window.socketio.emit('rank', this.player.token)
  }
}
</script>

<style>

</style>
