<template>
  <header>
    <v-toolbar fixed dark app color="rgba(0,0,0,0.65)">
      <v-toolbar-title>{{nick}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-title>{{ 'Score: '+score }}</v-toolbar-title>
    </v-toolbar>
  </header>
</template>

<script>
export default {
  name: 'main-nav',

  props: {
    nick: String,
    score: Number
  }
}
</script>
<style scoped>

</style>
