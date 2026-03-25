import fs from 'fs'
import path from 'path'

const pagePath = path.join(process.cwd(), 'src/app/page.tsx')
const pageSource = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, 'utf8') : ''

describe('HomePage — seções de portfolio removidas (MIG-03)', () => {
  it('não importa HeroSection', () => {
    expect(pageSource).not.toMatch(/import.*HeroSection/)
  })

  it('não importa DsbraveSection', () => {
    expect(pageSource).not.toMatch(/import.*DsbraveSection/)
  })

  it('não importa ProjectsGallerySection', () => {
    expect(pageSource).not.toMatch(/import.*ProjectsGallerySection/)
  })

  it('não importa AnniversarySection', () => {
    expect(pageSource).not.toMatch(/import.*AnniversarySection/)
  })

  it('não importa PartnersSection', () => {
    expect(pageSource).not.toMatch(/import.*PartnersSection/)
  })

  it('não importa ServicesCarouselSection', () => {
    expect(pageSource).not.toMatch(/import.*ServicesCarouselSection/)
  })

  it('não importa SolutionsCtaSection', () => {
    expect(pageSource).not.toMatch(/import.*SolutionsCtaSection/)
  })

  it('não importa AppsSection', () => {
    expect(pageSource).not.toMatch(/import.*AppsSection/)
  })

  it('não importa ServiceCardsSection', () => {
    expect(pageSource).not.toMatch(/import.*ServiceCardsSection/)
  })

  it('não importa GiantTypographySection', () => {
    expect(pageSource).not.toMatch(/import.*GiantTypographySection/)
  })

  it('mantém HeroSubtitleSection como placeholder', () => {
    expect(pageSource).toMatch(/import.*HeroSubtitleSection/)
  })
})
