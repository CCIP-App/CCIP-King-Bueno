<template>
  <header>
    <v-toolbar fixed dark app >
      <v-btn icon :to="topUrl">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
  </header>
</template>

<script>
export default {
  name: 'main-nav',

  props: {
    title: String,
    topUrl: String
  }
}
</script>
<style scoped>

</style>
