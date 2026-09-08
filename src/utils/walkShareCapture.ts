import { toBlob } from 'html-to-image'

export async function captureWalkShareCard(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready
  const sources = new Set([
    ...Array.from(node.querySelectorAll('img'), (img) => img.currentSrc || img.src),
    ...Array.from(node.querySelectorAll('svg image'), (img) => img.getAttribute('href') ?? ''),
  ])
  await Promise.all(
    Array.from(sources)
      .filter(Boolean)
      .map(async (src) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = src
        await img.decode()
      }),
  )
  const blob = await toBlob(node, { pixelRatio: 2 })
  if (!blob) throw new Error('이미지를 만들지 못했습니다. 다른 사진으로 다시 시도해 주세요.')
  return blob
}
