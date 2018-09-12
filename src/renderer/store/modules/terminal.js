const state = {
  terminals: [],
  commList: [],
  tabs: []
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
  ADD_HISTORY (state, {pid, input}) {
    if (state.terminals[pid].history.length === 1 && state.terminals[pid].history[0] === '') {
      state.terminals[pid].history = [input]
    } else if (state.terminals[pid].history[state.terminals[pid].history.length - 1] !== input) {
      state.terminals[pid].history.push(input)
    }
    state.terminals[pid].historyIdx = state.terminals[pid].history.length - 1
  },
  INCREMENT_HISTORY_IDX (state, i) {
    state.terminals[i].historyIdx++
  },
  DECREMENT_HISTORY_IDX (state, i) {
    state.terminals[i].historyIdx--
  },
  SHOW_HISTORY_COMMAND (state, {pid, cmdIdx}) {
    state.terminals[pid].historyRecallIdx = cmdIdx
  },
  ISSUE_HISTORY_COMMAND (state, pid) {
    state.terminals[pid].historyRecallIdx = null
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
