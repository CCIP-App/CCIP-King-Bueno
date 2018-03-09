<template>
  <div id="prize">
    <back-nav title="兌換" topUrl="/start"></back-nav>
    <p style="font-size: 28px;text-align:center;">最高分數: <span style="font-size:48px;">{{ player.score }}</span></p>
    <p style="font-size: 28px;text-align:center;">分數: <span style="font-size:48px;">{{ player.score-player.cost }}</span></p>
    <div style="width: 90%; margin: 50px auto 0px auto;">
      <template v-for="(prize,index) of prizes.prizes">
        <v-btn v-if="prize.needScore!==0" :key="'prizes-'+index" outline block color="black" style="height: 80px;font-size: 18px;" @click.stop="open(prize.name)">{{ prize.name }} {{ prize.needScore }}分<template v-if="prize.playerOnly"><br>只能兌換一次</template></v-btn>
        <v-btn v-else :key="'prizes-'+index" outline block disabled color="black" style="height: 80px;font-size: 18px;color:black !important;">{{ prize.name }}</v-btn>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'prize',
  data () {
    return {
      prizes: []
    }
  },
  computed: {
    player () {
      return this.$store.state.player
    }
  },
  methods: {
    open (name) {
      this.$router.replace('/convert/' + name)
    }
  },
  beforeMount () {
    window.socketio.once('prize', (msg) => {
      console.log('prize', msg)
      this.prizes = msg
    })
    window.socketio.emit('score', this.player.token)
    window.socketio.emit('prize', this.player.token)
  }
}
</script>

<style>

</style>
