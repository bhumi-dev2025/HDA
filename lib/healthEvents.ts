type Listener = () => void;
const listeners: Listener[] = [];

export const healthEvents = {
  subscribe(fn: Listener) {
    listeners.push(fn);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx > -1) listeners.splice(idx, 1);
    };
  },
  emit() {
    listeners.forEach((fn) => fn());
  },
};
