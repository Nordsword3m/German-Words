import { Adjective, Noun, Verb, Word, WordType } from './types';
import { getAllValues } from '../src/utils';

export const getNounLookups = (noun: Noun): string[] => {
  return getAllValues(noun.cases);
};

export const getVerbLookups = (verb: Verb): string[] => {
  const switchables = getAllValues({
    present: verb.present,
    simple: verb.simple,
    conjunctive1: verb.conjunctive1,
    conjunctive2: verb.conjunctive2
  }).map((f) => {
    const sf = f.split(' ');

    if (sf.length === 1) return f;
    return sf[1] + sf[0];
  });

  return [
    ...switchables,
    ...getAllValues({
      imperative: verb.imperative,
      perfect: verb.perfect,
      zuinfinitive: verb.zuinfinitive,
      lemma: verb.lemma.replace(/_/g, '')
    })
  ];
};

export const getAdjectiveLookups = (adjective: Adjective): string[] => {
  return getAllValues({
    strong: adjective.strong,
    weak: adjective.weak,
    mixed: adjective.mixed,
    lemma: adjective.lemma
  });
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
        nounLookupTable[r.toLowerCase()] = n;
      });
    } else if (w.type === WordType.Verb) {
      const v = w as Verb;
      getVerbLookups(v).forEach((r) => {
        verbLookupTable[r.toLowerCase()] = v;
      });
    } else if (w.type === WordType.Adjective) {
      const a = w as Adjective;
      getAdjectiveLookups(a).forEach((r) => {
        adjectiveLookupTable[r.toLowerCase()] = a;
      });
    }
  });

  return { nounLookupTable, verbLookupTable, adjectiveLookupTable };
};
