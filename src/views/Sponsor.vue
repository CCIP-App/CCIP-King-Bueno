<template>
  <div id="Sponsor">
    <p>本網頁會自動更新</p>
    <h2>已作答總題數：<span>{{ sum }}</span></h2>
    <h2>總體答對率：<span>{{ currectPercent }}%</span></h2>
    <v-card>
      <v-card-title>
        <v-text-field
          append-icon="search"
          label="搜尋題目"
          single-line
          hide-details
          v-model="search">
        </v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="result"
        hide-actions
        class="elevation-1"
        :search="search">
        <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
        <template slot="items" slot-scope="props">
          <td class="text-xs-left">{{ props.item.question }}</td>
          <td class="text-xs-left">{{ props.item.sum }}</td>
          <td class="text-xs-left">{{ props.item.currect }}%</td>
          <template v-for="(option,index) of props.item.options">
            <td :key="'options-'+index" :class="{yellow: option.currect}" class="text-xs-left">{{ option.content + ' - ' + option.answearTimes + '次' }}</td>
          </template>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import api from '../api/client.js'
export default {
  name: 'Sponsor',
  props: ['name'],
  data () {
    return {
      search: '',
      sum: 0,
      currect: 0,
      result: [],
      headers: [
        {
          text: '題目',
          align: 'left',
          value: 'question'
        },
        { text: '作答次數', value: 'sum' },
        { text: '答對率', value: 'currect' },
        { text: '選項 A', value: 'options[0].answearTimes' },
        { text: '選項 B', value: 'options[1].answearTimes' },
        { text: '選項 C', value: 'options[2].answearTimes' },
        { text: '選項 D', value: 'options[3].answearTimes' }
      ]
    }
  },
  computed: {
    currectPercent () {
      if (this.sum !== 0) return parseFloat((this.currect / this.sum * 100).toFixed(1))
      else return 0
    }
  },
  methods: {
    calcSum (options) {
      var sum = 0
      for (var option of options) {
        sum += option.answearTimes
      }
      return sum
    },
    calcCurrect (options) {
      for (var option of options) {
        if (option.currect) {
          return (option.answearTimes)
        }
      }
      return 0
    },
    loadSponsor () {
      api.getSponsor(this.name).then((res) => {
        var temp = res.data
        this.sum = 0
        this.currect = 0
        for (var ele of temp) {
          this.sum += this.calcSum(ele.options)
          this.currect += this.calcCurrect(ele.options)
          ele.sum = this.calcSum(ele.options)
          if (ele.sum !== 0) ele.currect = parseFloat((this.calcCurrect(ele.options) / ele.sum * 100).toFixed(1))
          else ele.currect = 0
        }
        this.result = temp
      })
    }
  },
  beforeMount () {
    this.loadSponsor()
    setInterval(() => {
      this.loadSponsor()
    }, 30000)
  }
}
</script>

<style scoped>
h2 {
  font-size: 24px;
  margin-top: 15px;
  margin-bottom: 15px;
}
p {
  font-size: 18px
}
</style>
