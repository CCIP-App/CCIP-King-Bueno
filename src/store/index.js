import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    offline: true,
    player: {
      token: '',
      nick: '',
      score: 0,
      cost: 0
    },
    round: {
      room: '',
      finish: null
    }
  },

  actions: {},

  mutations: {
    setOffline (state, offline) {
      state.offline = offline
    },
    setToken (state, token) {
      state.player.token = token
    },
    setNick (state, nick) {
      state.player.nick = nick
    },
    setScore (state, score) {
      state.player.score = score
    },
    setCost (state, cost) {
      state.player.cost = cost
    },
    setRoom (state, room) {
      state.round.room = room
    },
    setFinish (state, finish) {
      state.round.finish = finish
    }
  }
})
