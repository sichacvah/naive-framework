const h = require('virtual-dom/h');
const {Program, Task} = require('./lib');


/* Async example */

const initalState = {
  count: 0,
  running: false
};

const start = () => ({type: 'START'});
const tick = () => ({type: 'TICK'});
const stop = () => ({type: 'STOP'});

function promiseTimeout() {
  return new Promise(resolve => {
    setTimeout(resolve, 300);
  });
}


function update(state = initalState, action) {
  if (action.type === 'START') {
    return [{running: true, count: state.count}, Task.run(promiseTimeout, {success: tick})];
  }
  if (action.type === 'TICK') {
    if (state.running) return [{running: true, count: state.count + 1}, Task.run(promiseTimeout, {success: tick})];
    return [state, Task.none()];
  }
  if (action.type === 'STOP') {
    return [{count: state.count, running: false}, Task.none()];
  }

  return [state, Task.none()];
}

function button(label, onClick) {
  return h('button', {onclick: onClick}, [label]);
}

function view(state, dispatch) {
  return h('div', {}, [button('start', () => dispatch(start())), String(state.count), button('stop', () => dispatch(stop()))]);
}

Program([initalState, Task.none()], view, update, document.body);