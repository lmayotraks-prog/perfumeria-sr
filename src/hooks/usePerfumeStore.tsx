'use client';
// src/hooks/usePerfumeStore.tsx — Estado global SR Essences (Vistas Boutique + Bolsa de Cotización + Dama/Caballero + 25K)
import { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import {
  Perfume,
  FilterState,
  UIState,
  AmbianceMode,
  DepartmentMode,
  ViewerMode,
  AppView,
  QuoteBagItem,
} from '@/types';
import {
  AVAILABLE_PERFUMES,
  getDepartmentPerfumes,
  getFeaturedByDepartment,
} from '@/data/availableCatalog';
import { expandSearchTerms } from '@/lib/olfactoryDictionary';

const BAG_STORAGE_KEY = 'sr-essences-bag-v1';

export interface EncyclopediaPreset {
  brand?: string;
  perfumer?: string;
  includeNote?: string;
  accord?: string;
  search?: string;
  ts: number;
}

interface StoreState {
  filters: FilterState;
  ui: UIState;
  filteredPerfumes: Perfume[];
  activePerfume: Perfume;
  detailPerfume: Perfume | null;
  encyclopediaPreset: EncyclopediaPreset | null;
  bag: QuoteBagItem[];
}

type Action =
  | { type: 'SET_ACTIVE_PERFUME'; id: string }
  | { type: 'SELECT_CUSTOM_PERFUME'; perfume: Perfume }
  | { type: 'SET_VIEW'; view: AppView }
  | { type: 'ENTER_UNIVERSE'; department: DepartmentMode }
  | { type: 'SET_DEPARTMENT'; department: DepartmentMode; keepActiveIfMatching?: boolean }
  | { type: 'OPEN_DETAIL'; perfume: Perfume }
  | { type: 'CLOSE_DETAIL' }
  | { type: 'JUMP_TO_ENCYCLOPEDIA'; preset: Omit<EncyclopediaPreset, 'ts'> }
  | { type: 'CLEAR_ENCYCLOPEDIA_PRESET' }
  | { type: 'SET_FILTER'; key: keyof FilterState; value: unknown }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_DRAWER_OPEN'; open: boolean }
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'SET_BAG_OPEN'; open: boolean }
  | { type: 'TOGGLE_BAG' }
  | { type: 'ADD_TO_BAG'; perfume: Perfume; sizeMl?: 50 | 100 }
  | { type: 'REMOVE_FROM_BAG'; id: string; sizeMl: 50 | 100 }
  | { type: 'UPDATE_BAG_ITEM'; id: string; oldSizeMl: 50 | 100; sizeMl?: 50 | 100; qty?: number }
  | { type: 'CLEAR_BAG' }
  | { type: 'HYDRATE_BAG'; bag: QuoteBagItem[] }
  | { type: 'SET_AMBIANCE'; ambiance: AmbianceMode }
  | { type: 'TOGGLE_AMBIANCE' }
  | { type: 'SET_VIEWER_MODE'; mode: ViewerMode };

const DEFAULT_FILTERS: FilterState = {
  search: '',
  family: null,
  gender: null,
  brand: null,
  notes: [],
  priceRange: [0, 500000],
  season: null,
  occasion: null,
  sortBy: 'featured',
  showBestsellers: false,
  showNewArrivals: false,
};

const INITIAL_DEPT: DepartmentMode = 'dama';
const INITIAL_PERFUME = getFeaturedByDepartment(INITIAL_DEPT, 1)[0] || AVAILABLE_PERFUMES[0];

const DEFAULT_UI: UIState = {
  activePerfumeId: INITIAL_PERFUME.id,
  activeView: 'home',
  isViewerExpanded: false,
  isCatalogOpen: false,
  isPyramidOpen: false,
  isDrawerOpen: false,
  isBagOpen: false,
  activeSection: 'hero',
  department: INITIAL_DEPT,
  ambiance: 'lumiere',
  viewerMode: 'crystal3d',
};

function applyDepartmentFilters(dept: DepartmentMode, filters: FilterState): Perfume[] {
  let result = [...getDepartmentPerfumes(dept)];

  if (filters.search.trim()) {
    const terms = expandSearchTerms(filters.search);
    result = result.filter((p) => {
      const nameL = p.name.toLowerCase();
      const brandL = p.brand.toLowerCase();
      const familyL = p.family.toLowerCase();
      return terms.some(
        (term) =>
          nameL.includes(term) ||
          brandL.includes(term) ||
          familyL.includes(term) ||
          p.notes.some((n) => n.name.toLowerCase().includes(term)) ||
          p.accords.some((a) => a.name.toLowerCase().includes(term))
      );
    });
  }

  if (filters.brand) {
    result = result.filter((p) => p.brand === filters.brand);
  }

  if (filters.family) {
    result = result.filter((p) => p.family === filters.family);
  }

  if (filters.notes.length > 0) {
    result = result.filter((p) =>
      filters.notes.every((note) =>
        p.notes.some((n) => n.name.toLowerCase().includes(note.toLowerCase()))
      )
    );
  }

  if (filters.showBestsellers) result = result.filter((p) => p.bestseller);
  if (filters.showNewArrivals) result = result.filter((p) => p.newArrival);

  switch (filters.sortBy) {
    case 'featured':
      result.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          Number(b.bestseller) - Number(a.bestseller) ||
          b.rating - a.rating ||
          a.brand.localeCompare(b.brand)
      );
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      break;
    case 'name':
      result.sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
      break;
    case 'newest':
      result.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || b.rating - a.rating);
      break;
  }

  return result;
}

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'SET_ACTIVE_PERFUME': {
      const perfume =
        AVAILABLE_PERFUMES.find((p) => p.id === action.id) ?? state.activePerfume;
      const nextDept: DepartmentMode =
        perfume.gender === 'masculino'
          ? 'caballero'
          : perfume.gender === 'femenino'
          ? 'dama'
          : state.ui.department;
      const nextAmbiance: AmbianceMode = nextDept === 'caballero' ? 'nocturne' : 'lumiere';
      const nextViewerMode: ViewerMode =
        state.ui.viewerMode === 'film' ? 'crystal3d' : state.ui.viewerMode;

      return {
        ...state,
        ui: {
          ...state.ui,
          activePerfumeId: perfume.id,
          department: nextDept,
          ambiance: nextAmbiance,
          viewerMode: nextViewerMode,
        },
        filteredPerfumes:
          nextDept !== state.ui.department
            ? applyDepartmentFilters(nextDept, state.filters)
            : state.filteredPerfumes,
        activePerfume: perfume,
      };
    }

    case 'SELECT_CUSTOM_PERFUME': {
      return {
        ...state,
        ui: {
          ...state.ui,
          activePerfumeId: action.perfume.id,
          viewerMode: 'crystal3d',
        },
        activePerfume: action.perfume,
      };
    }

    case 'SET_VIEW': {
      return {
        ...state,
        ui: {
          ...state.ui,
          activeView: action.view,
          isDrawerOpen: false,
          isBagOpen: false,
        },
      };
    }

    case 'ENTER_UNIVERSE': {
      const nextDept = action.department;
      const nextAmbiance: AmbianceMode = nextDept === 'caballero' ? 'nocturne' : 'lumiere';
      const resetFilters: FilterState = { ...DEFAULT_FILTERS };
      const nextList = applyDepartmentFilters(nextDept, resetFilters);
      const nextActive = getFeaturedByDepartment(nextDept, 1)[0] || nextList[0] || state.activePerfume;

      return {
        ...state,
        filters: resetFilters,
        filteredPerfumes: nextList,
        activePerfume: nextActive,
        ui: {
          ...state.ui,
          activeView: 'catalog',
          department: nextDept,
          ambiance: nextAmbiance,
          activePerfumeId: nextActive.id,
          viewerMode: 'crystal3d',
          isDrawerOpen: false,
          isBagOpen: false,
        },
      };
    }

    case 'SET_DEPARTMENT': {
      const nextDept = action.department;
      const nextAmbiance: AmbianceMode = nextDept === 'caballero' ? 'nocturne' : 'lumiere';
      const resetFilters: FilterState = { ...DEFAULT_FILTERS };
      const nextList = applyDepartmentFilters(nextDept, resetFilters);

      const currentMatches =
        action.keepActiveIfMatching &&
        ((nextDept === 'dama' && state.activePerfume.gender === 'femenino') ||
          (nextDept === 'caballero' && state.activePerfume.gender === 'masculino'));

      const nextActive = currentMatches
        ? state.activePerfume
        : getFeaturedByDepartment(nextDept, 1)[0] || nextList[0] || state.activePerfume;

      return {
        ...state,
        filters: resetFilters,
        filteredPerfumes: nextList,
        activePerfume: nextActive,
        ui: {
          ...state.ui,
          department: nextDept,
          ambiance: nextAmbiance,
          activePerfumeId: nextActive.id,
          viewerMode: 'crystal3d',
        },
      };
    }

    case 'OPEN_DETAIL': {
      return {
        ...state,
        detailPerfume: action.perfume,
        activePerfume: action.perfume,
        ui: {
          ...state.ui,
          activePerfumeId: action.perfume.id,
          viewerMode: 'crystal3d',
        },
      };
    }
    case 'CLOSE_DETAIL':
      return { ...state, detailPerfume: null };

    case 'JUMP_TO_ENCYCLOPEDIA':
      return {
        ...state,
        detailPerfume: null,
        ui: {
          ...state.ui,
          activeView: 'encyclopedia',
          isDrawerOpen: false,
          isBagOpen: false,
        },
        encyclopediaPreset: { ...action.preset, ts: Date.now() },
      };
    case 'CLEAR_ENCYCLOPEDIA_PRESET':
      return { ...state, encyclopediaPreset: null };

    case 'SET_FILTER': {
      const filters = { ...state.filters, [action.key]: action.value };
      return {
        ...state,
        filters,
        filteredPerfumes: applyDepartmentFilters(state.ui.department, filters),
      };
    }

    case 'RESET_FILTERS': {
      return {
        ...state,
        filters: DEFAULT_FILTERS,
        filteredPerfumes: applyDepartmentFilters(state.ui.department, DEFAULT_FILTERS),
      };
    }

    case 'ADD_TO_BAG': {
      const sizeMl = action.sizeMl ?? 100;
      const idx = state.bag.findIndex(
        (item) => item.perfume.id === action.perfume.id && item.sizeMl === sizeMl
      );
      if (idx >= 0) {
        const nextBag = state.bag.map((item, i) =>
          i === idx ? { ...item, qty: Math.min(20, item.qty + 1) } : item
        );
        return { ...state, bag: nextBag };
      }
      return {
        ...state,
        bag: [...state.bag, { perfume: action.perfume, sizeMl, qty: 1 }],
      };
    }

    case 'REMOVE_FROM_BAG':
      return {
        ...state,
        bag: state.bag.filter(
          (item) => !(item.perfume.id === action.id && item.sizeMl === action.sizeMl)
        ),
      };

    case 'UPDATE_BAG_ITEM': {
      const target = state.bag.find(
        (item) => item.perfume.id === action.id && item.sizeMl === action.oldSizeMl
      );
      if (!target) return state;

      const nextSize = action.sizeMl ?? target.sizeMl;
      const nextQty = action.qty ?? target.qty;

      if (nextQty <= 0) {
        return {
          ...state,
          bag: state.bag.filter(
            (item) => !(item.perfume.id === action.id && item.sizeMl === action.oldSizeMl)
          ),
        };
      }

      // Si cambia el tamaño y ya existe esa combinación, fusionar cantidades
      if (nextSize !== action.oldSizeMl) {
        const duplicate = state.bag.find(
          (item) => item.perfume.id === action.id && item.sizeMl === nextSize
        );
        if (duplicate) {
          const mergedQty = Math.min(20, duplicate.qty + nextQty);
          return {
            ...state,
            bag: state.bag
              .filter((item) => !(item.perfume.id === action.id && item.sizeMl === action.oldSizeMl))
              .map((item) =>
                item.perfume.id === action.id && item.sizeMl === nextSize
                  ? { ...item, qty: mergedQty }
                  : item
              ),
          };
        }
      }

      return {
        ...state,
        bag: state.bag.map((item) =>
          item.perfume.id === action.id && item.sizeMl === action.oldSizeMl
            ? { ...item, sizeMl: nextSize, qty: Math.min(20, nextQty) }
            : item
        ),
      };
    }

    case 'CLEAR_BAG':
      return { ...state, bag: [] };
    case 'HYDRATE_BAG':
      return { ...state, bag: action.bag };

    case 'SET_DRAWER_OPEN':
      return { ...state, ui: { ...state.ui, isDrawerOpen: action.open } };
    case 'TOGGLE_DRAWER':
      return { ...state, ui: { ...state.ui, isDrawerOpen: !state.ui.isDrawerOpen, isBagOpen: false } };
    case 'SET_BAG_OPEN':
      return { ...state, ui: { ...state.ui, isBagOpen: action.open } };
    case 'TOGGLE_BAG':
      return { ...state, ui: { ...state.ui, isBagOpen: !state.ui.isBagOpen, isDrawerOpen: false } };
    case 'SET_AMBIANCE':
      return { ...state, ui: { ...state.ui, ambiance: action.ambiance } };
    case 'TOGGLE_AMBIANCE':
      return {
        ...state,
        ui: {
          ...state.ui,
          ambiance: state.ui.ambiance === 'lumiere' ? 'nocturne' : 'lumiere',
        },
      };
    case 'SET_VIEWER_MODE':
      return { ...state, ui: { ...state.ui, viewerMode: action.mode } };
    default:
      return state;
  }
}

const StoreContext = createContext<{
  state: StoreState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function PerfumeStoreProvider({ children }: { children: ReactNode }) {
  const initialState: StoreState = {
    filters: DEFAULT_FILTERS,
    ui: DEFAULT_UI,
    filteredPerfumes: applyDepartmentFilters(INITIAL_DEPT, DEFAULT_FILTERS),
    activePerfume: INITIAL_PERFUME,
    detailPerfume: null,
    encyclopediaPreset: null,
    bag: [],
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const bagHydratedRef = useRef(false);

  // Hidratar bolsa de cotización únicamente en cliente tras montaje (cero errores de hidratación SSR)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BAG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          dispatch({ type: 'HYDRATE_BAG', bag: parsed });
        }
      }
    } catch {
      // Ignorar errores de almacenamiento local
    } finally {
      bagHydratedRef.current = true;
    }
  }, []);

  // Persistir bolsa tras hidratación inicial
  useEffect(() => {
    if (!bagHydratedRef.current) return;
    try {
      window.localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(state.bag));
    } catch {
      // Ignorar errores de cuota
    }
  }, [state.bag]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.ui.ambiance);
    document.documentElement.classList.toggle('dark', state.ui.ambiance === 'nocturne');
  }, [state.ui.ambiance]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function usePerfumeStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('usePerfumeStore must be used inside PerfumeStoreProvider');
  return ctx;
}
