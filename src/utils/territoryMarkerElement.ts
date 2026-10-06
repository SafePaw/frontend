import type { MarkerImageType } from '../types/dog'
import { DEFAULT_MARKER_IMAGE_SRC, resolveMarkerImage } from './markerImage'

interface TerritoryMarkerDog {
  name: string
  territoryColor: string
  markerImageType?: MarkerImageType | null
  markerImageValue?: string | null
  markerImageUrl?: string | null
}

export function createTerritoryMarkerElement(dog: TerritoryMarkerDog): HTMLDivElement {
  const element = document.createElement('div')
  element.style.cssText = `width:36px;height:36px;border-radius:50%;border:2.5px solid ${dog.territoryColor};overflow:hidden;background:white;box-shadow:0 1px 4px rgba(0,0,0,0.25);flex-shrink:0;`
  const image = document.createElement('img')
  image.src = resolveMarkerImage(dog)
  image.alt = dog.name
  const objectFit = dog.markerImageType === 'UPLOADED' ? 'cover' : 'contain'
  image.style.cssText = `width:100%;height:100%;object-fit:${objectFit};`
  image.onerror = () => {
    image.onerror = null
    image.src = DEFAULT_MARKER_IMAGE_SRC
  }
  element.appendChild(image)
  return element
}
