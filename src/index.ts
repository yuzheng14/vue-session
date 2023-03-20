import { PluginObject } from 'vue'

type Nullable<T> = T | null

/**
 * options type of VueSession
 */
export interface VueSessionOptions {
  persist: boolean
}

/**
 * typeof VueSession.flash
 */
export interface FlashSession {
  /**
   * get VueSession instance that contain this flash instance
   */
  parent(): VueSession
  /**
   * get data by key
   * @param key data key
   */
  get<T>(key: string): Nullable<T>
  /**
   * set data by key
   * @param key data key
   * @param value data
   */
  set<T>(key: string, value: T): void
  /**
   * remove data by key
   * @param key data key
   */
  remove(key: string): void
}

/**
 * typeof vueSession
 */
export interface VueSession {
  /**
   * key of vue-session
   */
  key: 'vue-session-key'
  /**
   * key of vue-session's flash feature
   */
  flash_key: 'vue-session-flash-key'
  /**
   * key of id
   */
  id_key: 'session-id'
  /**
   * used storage (localStorage for persist, otherwise sessionStorage)
   */
  storage: Storage
  /**
   * set All data in storage
   * @param all all data to be set
   */
  setAll<T extends Record<PropertyKey, any>>(all: T): void
  /**
   * get all data
   * @returns all data in storage
   */
  getAll<T extends Record<PropertyKey, any>, D extends Record<PropertyKey, any> = any>(): T & {
    ['vue-session-flash-key']: D
  }
  /**
   * flash storage instance, it will delete the data once read it
   */
  flash: FlashSession
  /**
   * set data by key
   * @param key data key
   * @param value data
   */
  set<T>(key: string, value: T): void
  /**
   * get data by key
   * @param key data key
   * @returns data
   */
  get<T>(key: string): Nullable<T>
  /**
   * set `session-id` field in data
   */
  start(): void
  /**
   * renew `session-id` field in data by param
   * @param sessionId
   */
  renew(sessionId: string): void
  /**
   * does `session-id` field exist in all data
   */
  exists(): boolean
  /**
   * does key exist in all data
   * @param key data key
   */
  has(key: string): boolean
  /**
   * remove key-value in all data
   * @param key data key
   */
  remove(key: string): void
  /**
   * clear all data (except `session-id`)
   */
  clear(): void
  /**
   * clear vue-session's data (include `session-id`)
   */
  destroy(): void
  /**
   * get `session-id` field
   * @returns `session-id` field
   */
  id(): Nullable<string>
}

/**
 * get VueSession instance
 * @param options setting option
 * @returns VueSession instance
 */
export function getVueSession(options?: VueSessionOptions): VueSession {
  // construct VueSession instance
  const vueSession: VueSession = {
    key: 'vue-session-key',
    flash_key: 'vue-session-flash-key',
    id_key: 'session-id',
    storage: options?.persist ? window.localStorage : window.sessionStorage,
    setAll(all) {
      // if there is no `flash` data in all data, then set it
      all[this.flash_key] || ((all as Record<PropertyKey, any>)[this.flash_key] = {})
      this.storage.setItem(this.key, JSON.stringify(all))
    },
    getAll() {
      // set default to `{"vue-session-flash-key":{}}` to avoid Error
      return JSON.parse(this.storage.getItem(this.key) ?? '{"vue-session-flash-key":{}}')
    },
    flash: {
      parent() {
        return vueSession
      },
      get<T>(key: string): T {
        // get flash value
        const flash_value = (this.parent().getAll()[vueSession.flash_key] || {})[key]
        // remove this value in flash data
        this.remove(key)
        return flash_value
      },
      set(key, value) {
        // get all data
        const all = this.parent().getAll()
        // set flash data
        all[this.parent().flash_key][key] = value
        this.parent().setAll(all)
      },
      remove(key) {
        // get all data
        const all = this.parent().getAll()
        // delete flash data by key
        delete all[this.parent().flash_key][key]

        this.parent().setAll(all)
      },
    },
    set(key, value) {
      // avoid key conflict
      if (key === this.id_key) return

      // get all data
      let all = this.getAll()
      // if `session-id` is not in all data, then call start to add it
      if (!(this.id_key in all)) {
        this.start()
        all = this.getAll()
      }
      // set value
      all[key] = value
      // storage value
      this.setAll(all)
    },
    get(key) {
      return this.getAll()[key]
    },
    start() {
      const all = this.getAll()
      all[this.id_key] = 'sess:' + Date.now()
      this.setAll(all)
    },
    renew(sessionId) {
      var all = this.getAll()
      all[this.id_key] = 'sess:' + sessionId
      this.setAll(all)
    },
    exists() {
      return this.id_key in this.getAll()
    },
    has(key) {
      return key in this.getAll()
    },
    remove(key) {
      const all = this.getAll()
      delete all[key]

      this.setAll(all)
    },
    clear() {
      const all = this.getAll()
      this.setAll({ [this.id_key]: all[this.id_key], [this.flash_key]: {} })
    },
    destroy() {
      this.setAll({ [this.flash_key]: {} })
    },
    id() {
      return this.get(this.id_key)
    },
  }
  return vueSession
}

// vueSession instance (use sessionStorage)
export const vueSession = getVueSession()

// hook for Vue 3
export const useVueSession = getVueSession

// install PluginObject for Vue 2
const VueSession: PluginObject<VueSessionOptions> = {
  install(Vue, options?) {
    Vue.prototype.$session = getVueSession(options)
  },
}

export default VueSession
