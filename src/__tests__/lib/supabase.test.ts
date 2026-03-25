import { getAssetUrl } from '@/lib/supabase'

describe('getAssetUrl', () => {
  it('retorna uma URL https com o caminho correto', () => {
    const url = getAssetUrl('cases/test/cover.jpg')
    expect(url).toContain('cases/test/cover.jpg')
    expect(url).toMatch(/^https:\/\//)
  })

  it('nao lanca erro com path vazio', () => {
    expect(() => getAssetUrl('')).not.toThrow()
  })

  it('retorna URL com o bucket flyingstudio no path', () => {
    const url = getAssetUrl('test.jpg')
    expect(url).toContain('flyingstudio')
  })
})
