<template>
  <div id="convert">
    <back-nav title="兌換" topUrl="/prize"></back-nav>
    <p>請出示此畫面至紀念品攤位，領取獎品。</p>
    <p>{{ name }}</p>
    <qrcode :value="player.token" :options="{ size: 200 }"></qrcode>
  </div>
</template>

<script>
export default {
  name: 'convert',
  props: ['name'],
  computed: {
    player () {
      return this.$store.state.player
    }
  },
  beforeMount () {

  }
}
</script>

<style>

</style>
