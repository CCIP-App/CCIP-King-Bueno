import Vue from 'vue'
import Router from 'vue-router'
import store from '../store/index.js'

import Offline from '../views/offline.vue'
import Rank from '../views/rank.vue'
import Start from '../views/start.vue'
import Prize from '../views/prize.vue'
import Round from '../views/round.vue'
import Loading from '../views/Loading.vue'
import Problem from '../views/Problem.vue'
import Finish from '../views/Finish.vue'
import Convert from '../views/Convert.vue'
// import Develop from '../views/Develop.vue'
import Sponsor from '../views/Sponsor.vue'

Vue.use(Router)

let requireSocketio = (route, redirect, next) => {
  if (window.socketio === undefined) {
    next('/start')
  } else {
    next()
  }
}

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      redirect: to => {
        if (store.offline) {
          return '/offline'
        } else {
          return '/start'
        }
      }
    },
    { path: '/offline', component: Offline },
    {
      path: '/start',
      component: Start
    },
    { path: '/rank', component: Rank, beforeEnter: requireSocketio },
    { path: '/prize', component: Prize, beforeEnter: requireSocketio },
    { path: '/round', component: Round, beforeEnter: requireSocketio },
    { path: '/loading/:level', component: Loading, beforeEnter: requireSocketio, props: true },
    { path: '/problem', component: Problem, beforeEnter: requireSocketio },
    { path: '/finish', component: Finish, beforeEnter: requireSocketio },
    { path: '/convert/:name', component: Convert, beforeEnter: requireSocketio, props: true },
    // { path: '/develop', component: Develop },
    { path: '/sponsor/:name', component: Sponsor, props: true, meta: { sponsor: true } }
  ]
})
