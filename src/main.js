// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router/index'
import store from './store/index'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import Components from './components/_index'
import VueQrcode from '@xkeshi/vue-qrcode'

Vue.use(Vuetify)

Vue.component('qrcode', VueQrcode)
Object.keys(Components).forEach(key => {
  Vue.component(key, Components[key])
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  router,
  store,
  ...App
}).$mount('#app')
