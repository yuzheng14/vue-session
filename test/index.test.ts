import './__mock__/sessionStorage'
import VueSession, { getVueSession, useVueSession, vueSession } from '../src/index'

function withFlashData<T>(obj: T): T & { 'vue-session-flash-key': {} } {
  ;(obj as T & { 'vue-session-flash-key': {} })['vue-session-flash-key'] = {}
  return obj as T & { 'vue-session-flash-key': {} }
}

describe('export test', () => {
  it('default export', () => expect(VueSession).toBeDefined())
  it('vueSession export', () => expect(vueSession).toBeDefined())
  it('useVueSession export', () => expect(useVueSession).toBeDefined())
  it('getVueSession export', () => expect(getVueSession).toBeDefined())
})

describe('VueSession test', () => {
  it('install', () => expect(VueSession.install).toBeDefined())
})

describe('vueSession test', () => {
  beforeEach(() => vueSession.destroy())
  it('storage is sessionStorage', () => expect(vueSession.storage).toBe(window.sessionStorage))
  it('key', () => expect(vueSession.key).toBe('vue-session-key'))
  it('flash_key', () => expect(vueSession.flash_key).toBe('vue-session-flash-key'))
  it('setAll & getAll', () => {
    vueSession.setAll({ test1: 'test1', test2: 'test2' })
    expect(vueSession.getAll<{ test1: 'test1'; test2: 'test2' }>()).toEqual(
      withFlashData({
        test1: 'test1',
        test2: 'test2',
      })
    )
  })
  it('set & get', () => {
    const test = {
      a: 1,
      b: 2,
    }
    vueSession.set('test', test)
    expect(vueSession.get<{ test: { a: 1; b: 2 } }>('test')).toEqual({ a: 1, b: 2 })
  })
  it('start', () => {
    vueSession.start()
    expect(vueSession.id()).toBeDefined()
  })
  it('renew', () => {
    vueSession.renew('114514')
    expect(vueSession.id()).toEqual('sess:114514')
  })
  it('exists', () => {
    expect(vueSession.id()).toBeUndefined()
    expect(vueSession.exists()).toBeFalsy()
    vueSession.start()
    expect(vueSession.id()).toBeDefined()
    expect(vueSession.exists()).toBeTruthy()
  })
  it('has', () => {
    expect(vueSession.has('test')).toBeFalsy()
    vueSession.set('test', 'test')
    expect(vueSession.has('test')).toBeTruthy()
  })
  it('remove', () => {
    const test = 'test'
    expect(vueSession.has(test)).toBeFalsy()
    vueSession.set(test, test)
    expect(vueSession.has('test')).toBeTruthy()
    vueSession.remove(test)
    expect(vueSession.has(test)).toBeFalsy()
  })
  it('clear', () => {
    vueSession.setAll({ test1: 'test1', test2: 'test2' })
    vueSession.start()
    expect(vueSession.has('test1')).toBeTruthy()
    vueSession.clear()
    expect(vueSession.has('test1')).toBeFalsy()
    expect(vueSession.id()).toBeDefined()
    expect(vueSession.has(vueSession.flash_key)).toBeTruthy()
  })
  it('destroy', () => {
    vueSession.setAll({ test1: 'test1', test2: 'test2' })
    vueSession.start()
    expect(vueSession.has('test1')).toBeTruthy()
    vueSession.destroy()
    expect(vueSession.has('test1')).toBeFalsy()
    expect(vueSession.id()).toBeUndefined()
    expect(vueSession.has(vueSession.flash_key)).toBeDefined()
  })
  it('id', () => {
    expect(vueSession.id()).toBeFalsy()
    vueSession.start()
    expect(vueSession.id()).toBeTruthy()
  })

  // flash test
  it('flash parent', () => expect(vueSession.flash.parent()).toBe(vueSession))
  it('flash set & get', () => {
    const test = 'test'
    vueSession.flash.set(test, test)
    expect(vueSession.flash.get(test)).toBeDefined()
    expect(vueSession.flash.get(test)).toBeUndefined()
  })
  it('flash remove', () => {
    const test = 'test'
    vueSession.flash.set(test, test)
    vueSession.flash.remove(test)
    expect(vueSession.flash.get(test)).toBeUndefined()
  })
})
