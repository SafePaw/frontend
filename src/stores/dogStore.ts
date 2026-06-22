import { create } from 'zustand'
import { DEFAULT_PRESET_ID } from '../constants/dogMarkers'
import type { Dog, DogDraft } from '../types/dog'

interface DogStore {
  dogDraft: DogDraft
  createdDog: Dog | null

  updateDraft: (patch: Partial<DogDraft>) => void
  resetDraft: () => void
  setCreatedDog: (dog: Dog) => void
}

const DEFAULT_DRAFT: DogDraft = {
  name: '',
  gender: null,
  breed: '',
  age: '',
  weightKg: '',
  markerImageType: 'PRESET',
  markerImageValue: DEFAULT_PRESET_ID,
}

export const useDogStore = create<DogStore>((set) => ({
  dogDraft: { ...DEFAULT_DRAFT },
  createdDog: null,

  updateDraft(patch) {
    set((state) => ({ dogDraft: { ...state.dogDraft, ...patch } }))
  },

  resetDraft() {
    set({ dogDraft: { ...DEFAULT_DRAFT } })
  },

  setCreatedDog(dog) {
    set({ createdDog: dog })
  },
}))
