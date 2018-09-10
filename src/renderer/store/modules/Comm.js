const state = {
  terminals: [],
  commList: [],
  tabs: [],
  commandHistory: []
}

// sync mutations
const mutations = {
  ADD_TERMINAL (state, terminal) {
    state.terminals.push(terminal)
  },
  DEL_TERMINAL (state, i) {
    state.terminals.splice(i, 1)
  },
  ADD_COMM (state, comm) {
    state.commList.push(comm)
  },
  DEL_COMM (state, i) {
    state.commList.splice(i, 1)
  },
  ADD_TAB (state, tab) {
    state.tabs.push(tab)
  },
  DEL_TAB (state, i) {
    state.tabs.splice(i, 1)
  },
  ADD_HISTORY (state, i, command) {
    if (state.terminals[i].commandHistory === undefined) {
      state.terminals[i].history = ['']
      state.terminals[i].historyIdx = 0
    } else {
      state.terminals[i].commandHistory.push(command)
      state.terminals[i].historyIdx = state.terminals[i].commandHistory.length - 1
    }
  }
}

// async actions
const actions = {
  update_connection_type ({ commit }, type) {
    commit('UPDATE_CONNECTION_TYPE', type)
  }
}

export default {
  state,
  mutations,
  actions
}
