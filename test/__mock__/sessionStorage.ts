let storage: Record<string, string> = {}
global.sessionStorage = {
  length: -1,
  getItem(key) {
    return storage[key]
  },
  setItem(key, value) {
    storage[key] = value
  },
  removeItem(key) {
    delete storage[key]
  },
  key(index) {
    return Object.keys(storage)[index]
  },
  clear() {
    storage = {}
  },
}
