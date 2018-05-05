const diff = require('virtual-dom/diff');
const patch = require('virtual-dom/patch');
const createElement = require('virtual-dom/create-element');
const atom = require('./atom');


const Task = {
  none: () => Promise.resolve(null),
  action: (action) => Promise.resolve(action),
  run: (func, {success, fail, args}) => {
    try {
      const result = func.apply(null, args);

      if (result instanceof Promise) {
          return new Promise((resolve) => {
            return result
              .then(i => resolve(success(i)))
              .catch(e => resolve(fail(e)));
          });
      }
      return Promise.resolve(result);
    } catch(e) {
      return Promise.resolve(e);
    }
  }
}


function Program([state, task], view, update, domNode) {
  const store = atom(state);
  const actionQueue = atom([]);

  const loop = (state, task) => {
    store.reset(state);
    task.then(action => action && actionQueue.swap(queue => [action].concat(queue)));
  };

  const dispatch = (action) => {
    actionQueue.swap(queue => [action].concat(queue));
  };

  let rootNode;
  let tree;
  store.addWatch('Render', (k, a, prev, state) => {
    if (!rootNode) {
      tree = view(state, dispatch);
      rootNode = createElement(tree);
      domNode.appendChild(rootNode);
    }
    const nextTree = view(state, dispatch);
    const patches  = diff(tree, nextTree);
    rootNode = patch(rootNode, patches);
    tree = nextTree;
  });

  actionQueue.addWatch('Task', (k, a, prev, queue) => {
    if (queue.length > 0) {
      requestAnimationFrame(() => {
        const action = queue[0];
        const queueTail = queue.slice(1);
        const [state, task] = update(store.deref(), action);
        loop(state, task);
        actionQueue.reset(queueTail);
      });
    }
  });
  loop(state, task);

  return {
    dispatch: dispatch,
    getState: store.deref
  };
}

module.exports = {Task, Program};

