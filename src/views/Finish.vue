<template>
  <div id="Loading">
    <h2 v-if="finish.win" class="amber--text">You win!</h2>
    <h2 v-else class="grey--text">You lose!</h2>
    <p>{{ finish.playerScore + ((finish.win)?' &gt; ':' &lt; ') + finish.computerScore }}</p>
    <div style="width: 80%; margin: 50px auto 0px auto;">
      <v-btn block color="cyan" large to="/start">回主頁</v-btn>
      <v-btn block dark color="teal" large to="/round">再玩一次</v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'loading',
  props: ['level'],
  computed: {
    player () {
      return this.$store.state.player
    },
    finish () {
      return this.$store.state.round.finish
    }
  },
  beforeMount () {

  }
}
</script>

<style>
h2 {
  margin-top: 10vh;
  font-size: 56px;
  margin-bottom: 10vh;
}
</style>
