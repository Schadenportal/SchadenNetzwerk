import merge from 'lodash/merge';
import {
  de as deAdapter,
  it as itAdapter,
  uk as ukAdapter,
  es as esAdapter,
  tr as trAdapter,
  fr as frAdapter,
  ru as ruAdapter,
  pl as plAdapter,
  el as elAdapter,
  enUS as enUSAdapter,
} from 'date-fns/locale';

// core
import {
  itIT as itCore,
  ukUA as ukCore,
  esES as esCore,
  trTR as trCore,
  ruRU as ruCore,
  plPL as plCore,
  elGR as elCore,
  enUS as enUSCore,
  deDE as deDECore,
  frFR as frFRCore,
} from '@mui/material/locale';
// date-pickers
import {
  itIT as itDate,
  trTR as trDate,
  ukUA as ukDate,
  esES as esDate,
  ruRU as ruDate,
  plPL as plDate,
  elGR as elDate,
  enUS as enUSDate,
  deDE as deDEDate,
  frFR as frFRDate,
} from '@mui/x-date-pickers/locales';
// data-grid
import {
  ukUA as ukDataGrid,
  trTR as trDataGrid,
  esES as esDataGrid,
  itIT as itDataGrid,
  ruRU as ruDataGrid,
  plPL as plDataGrid,
  elGR as elDataGrid,
  enUS as enUSDataGrid,
  deDE as deDEDataGrid,
  frFR as frFRDataGrid,
} from '@mui/x-data-grid';

// PLEASE REMOVE `LOCAL STORAGE` WHEN YOU CHANGE SETTINGS.
// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: 'English',
    value: 'en',
    systemValue: merge(enUSDate, enUSDataGrid, enUSCore),
    adapterLocale: enUSAdapter,
    icon: 'flagpack:us',
  },
  {
    label: 'Deutsch',
    value: 'de',
    systemValue: merge(deDEDate, deDEDataGrid, deDECore),
    adapterLocale: deAdapter,
    icon: 'flagpack:de',
  },
  {
    label: 'Français',
    value: 'fr',
    systemValue: merge(frFRDate, frFRDataGrid, frFRCore),
    adapterLocale: frAdapter,
    icon: 'flagpack:fr',
  },
  {
    label: 'Italiano',
    value: 'it',
    systemValue: merge(itDate, itDataGrid, itCore),
    adapterLocale: itAdapter,
    icon: 'flagpack:it',
  },
  {
    label: 'Español',
    value: 'es',
    systemValue: merge(esDate, esDataGrid, esCore),
    adapterLocale: esAdapter,
    icon: 'flagpack:es',
  },
  {
    label: 'Türkçe',
    value: 'tr',
    systemValue: merge(trDate, trDataGrid, trCore),
    adapterLocale: trAdapter,
    icon: 'flagpack:tr',
  },
  {
    label: 'Русский',
    value: 'ru',
    systemValue: merge(ruDate, ruDataGrid, ruCore),
    adapterLocale: ruAdapter,
    icon: 'flagpack:ru',
  },
  {
    label: 'Polski',
    value: 'pl',
    systemValue: merge(plDate, plDataGrid, plCore),
    adapterLocale: plAdapter,
    icon: 'flagpack:pl',
  },
  {
    label: 'Ελληνικά',
    value: 'el',
    systemValue: merge(elDate, elDataGrid, elCore),
    adapterLocale: elAdapter,
    icon: 'flagpack:gr',
  },
  {
    label: 'Українська',
    value: 'ua',
    systemValue: merge(ukDate, ukDataGrid, ukCore),
    adapterLocale: ukAdapter,
    icon: 'flagpack:ua',
  },
];

export const defaultLang = allLangs[0]; // English

// GET MORE COUNTRY FLAGS
// https://icon-sets.iconify.design/flagpack/
// https://www.dropbox.com/sh/nec1vwswr9lqbh9/AAB9ufC8iccxvtWi3rzZvndLa?dl=0
