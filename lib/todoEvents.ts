// Simple event emitter — chat thi todo change thay tyare home ne notify karva
type Listener = () => void;

const listeners: Listener[] = [];

export const todoEvents = {
  // Home screen subscribe kare
  subscribe(fn: Listener) {
    listeners.push(fn);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx > -1) listeners.splice(idx, 1);
    };
  },

  // Chat thi emit karo — add/remove thay tyare
  emit() {
    listeners.forEach((fn) => fn());
  },
};
