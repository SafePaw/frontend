import akitaInu from '../assets/preset/akitaInu.png'
import bichon from '../assets/preset/bichon.png'
import bostonTerrier from '../assets/preset/bostonTerrier.png'
import bulldog from '../assets/preset/bulldog.png'
import corgi from '../assets/preset/corgi.png'
import dachshund from '../assets/preset/dachshund.png'
import doodle from '../assets/preset/doodle.png'
import greyhound from '../assets/preset/greyhound.png'
import jackRusselTerrior from '../assets/preset/jackRusselTerrior.png'
import maltese from '../assets/preset/maltese.png'
import mix from '../assets/preset/mix.png'
import pomeranian from '../assets/preset/pomeranian.png'
import poodle from '../assets/preset/poodle.png'
import shihTzu from '../assets/preset/shihTzu.png'
import terrier from '../assets/preset/terrier.png'

export interface DogMarkerPreset {
  id: string
  label: string
  imageSrc: string
}

export const DOG_MARKER_PRESETS: DogMarkerPreset[] = [
  { id: 'akita-inu', label: '아키타 이누', imageSrc: akitaInu },
  { id: 'bichon', label: '비숑', imageSrc: bichon },
  { id: 'boston-terrier', label: '보스턴 테리어', imageSrc: bostonTerrier },
  { id: 'bulldog', label: '불독', imageSrc: bulldog },
  { id: 'corgi', label: '웰시코기', imageSrc: corgi },
  { id: 'dachshund', label: '닥스훈트', imageSrc: dachshund },
  { id: 'doodle', label: '두들', imageSrc: doodle },
  { id: 'greyhound', label: '그레이하운드', imageSrc: greyhound },
  { id: 'jack-russel-terrier', label: '잭 러셀 테리어', imageSrc: jackRusselTerrior },
  { id: 'maltese', label: '말티즈', imageSrc: maltese },
  { id: 'mix', label: '믹스견', imageSrc: mix },
  { id: 'pomeranian', label: '포메라니안', imageSrc: pomeranian },
  { id: 'poodle', label: '푸들', imageSrc: poodle },
  { id: 'shih-tzu', label: '시츄', imageSrc: shihTzu },
  { id: 'terrier', label: '화이트 테리어', imageSrc: terrier },
]

export const DEFAULT_PRESET_ID = DOG_MARKER_PRESETS[0].id
