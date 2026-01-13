import { Adjective, Noun, Verb, Word, WordType } from './types';

export const getNounLookups = (noun: Noun): (string | null)[] => {
  return [
    noun.cases.nominative.singular,
    noun.cases.genitive.singular,
    noun.cases.dative.singular,
    noun.cases.accusative.singular,
    noun.cases.nominative.plural,
    noun.cases.genitive.plural,
    noun.cases.dative.plural,
    noun.cases.accusative.plural
  ];
};

const switchSeparable = (form: string) => {
  const sf = form.split(' ');

  if (sf.length === 1) return form;
  return sf[1] + sf[0];
};

export const getVerbLookups = (verb: Verb): (string | null)[] => {
  return [
    switchSeparable(verb.present.ich),
    switchSeparable(verb.present.du),
    switchSeparable(verb.present.es),
    switchSeparable(verb.present.ihr),
    switchSeparable(verb.present.Sie),
    switchSeparable(verb.simple.ich),
    switchSeparable(verb.simple.du),
    switchSeparable(verb.simple.es),
    switchSeparable(verb.simple.ihr),
    switchSeparable(verb.simple.Sie),
    verb.imperative?.du ?? null,
    verb.perfect,
    verb.zuinfinitive,
    verb.lemma.replace(/·/, '')
  ];
};

export const getAdjectiveLookups = (adjective: Adjective): (string | null)[] => {
  return [
    adjective.lemma,

    adjective.strong.accusative.m,
    adjective.strong.dative.m,
    adjective.strong.dative.f,
    adjective.strong.dative.p,
    adjective.strong.genitive.m,
    adjective.strong.genitive.p,
    adjective.strong.nominative.m,
    adjective.strong.nominative.n,
    adjective.strong.nominative.f,
    adjective.strong.nominative.p,

    adjective.mixed.accusative.m,
    adjective.mixed.dative.m,
    adjective.mixed.dative.p,
    adjective.mixed.genitive.p,
    adjective.mixed.nominative.m,
    adjective.mixed.nominative.n,
    adjective.mixed.nominative.f,
    adjective.mixed.nominative.p,

    adjective.weak.accusative.m,
    adjective.weak.dative.m,
    adjective.weak.dative.f,
    adjective.weak.genitive.m,
    adjective.weak.nominative.m
  ];
};

export type LookupTables = {
  nounLookupTable: { [key: string]: Noun };
  verbLookupTable: { [key: string]: Verb };
  adjectiveLookupTable: { [key: string]: Adjective };
};

export const getLookupTables = (words: Word[]): LookupTables => {
  const nounLookupTable: { [key: string]: Noun } = {};
  const verbLookupTable: { [key: string]: Verb } = {};
  const adjectiveLookupTable: { [key: string]: Adjective } = {};

  words.forEach((w) => {
    if (w.type === WordType.Noun) {
      const n = w as Noun;
      getNounLookups(n).forEach((r) => {
        if (r === null) return;
        nounLookupTable[r.toLowerCase()] = n;
      });
    } else if (w.type === WordType.Verb) {
      const v = w as Verb;
      getVerbLookups(v).forEach((r) => {
        if (r === null) return;
        verbLookupTable[r] = v;
      });
    } else if (w.type === WordType.Adjective) {
      const a = w as Adjective;
      getAdjectiveLookups(a).forEach((r) => {
        if (r === null) return;
        adjectiveLookupTable[r] = a;
      });
    }
  });

  return { nounLookupTable, verbLookupTable, adjectiveLookupTable };
};
