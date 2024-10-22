import { Word } from './types';
import { LookupTables } from './wordLookup';

export enum Tag {
  InternalPunct = '$(',
  Comma = '$,',
  SentenceFinalPunct = '$.',
  WordRemnant = 'TRUNC',
  NonWord = 'XY',
  Whitespace = '_SP',
  Number = 'CARD',

  AttributiveAdjective = 'ADJA',
  AdverbialPredicateAdjective = 'ADJD',

  Adverb = 'ADV',
  PronomialAdverb = 'PROAV',

  PostPosition = 'APPO',
  PrepositionLeft = 'APPR',
  PrepositionArticle = 'APPRART',
  PrepositionRight = 'APZR',

  Article = 'ART',
  Foreign = 'FM',
  Interjection = 'ITJ',

  ComparativeConjunction = 'KOKOM',
  CoordinateConjunction = 'KON',
  SubordinateZuInfConjunction = 'KOUI',
  SubordinateSentenceConjunction = 'KOUS',

  ProperNoun = 'NE',
  Noun = 'NN',
  ProperNoun2 = 'NNE',

  AttributiveDemonstrativePronoun = 'PDAT',
  SubstitutingDemonstrativePronoun = 'PDS',
  IndefinitePronounWithoutDeterminer = 'PIAT',
  SubstitutingIndefinitePronoun = 'PIS',
  NonReflexivePersonalPronoun = 'PPER',
  AttributivePossessivePronoun = 'PPOSAT',
  SubstitutingPossessivePronoun = 'PPOSS',
  AttributiveRelativePronoun = 'PRELAT',
  SubstitutingRelativePronoun = 'PRELS',
  ReflexivePersonalPronoun = 'PRF',
  AttributiveInterrogativePronoun = 'PWAT',
  AdverbialInterrogativeOrRelativePronoun = 'PWAV',
  SubstitutingInterrogativePronoun = 'PWS',

  ParticleWithAdjectiveOrAdverb = 'PTKA',
  AnswerParticle = 'PTKANT',
  NegativeParticle = 'PTKNEG',
  SeparableVerbalParticle = 'PTKVZ',
  ZuBeforeInf = 'PTKZU',

  FiniteAuxiliaryVerb = 'VAFIN',
  ImperativeAuxiliaryVerb = 'VAIMP',
  InfinitiveAuxiliaryVerb = 'VAINF',
  PerfectAuxiliaryVerb = 'VAPP',
  FiniteModalVerb = 'VMFIN',
  InfinitiveModalVerb = 'VMINF',
  PerfectModalVerb = 'VMPP',
  FiniteFullVerb = 'VVFIN',
  ImperativeFullVerb = 'VVIMP',
  InfinitiveFullVerb = 'VVINF',
  ZuInfinitiveFullVerb = 'VVIZU',
  PerfectFullVerb = 'VVPP'
}

export const isNounTag = (tag: Tag) => tag === Tag.Noun;
export const isAdjectiveTag = (tag: Tag) =>
  [Tag.AttributiveAdjective, Tag.AdverbialPredicateAdjective].includes(tag);
export const isVerbTag = (tag: Tag) =>
  [
    Tag.FiniteAuxiliaryVerb,
    Tag.ImperativeAuxiliaryVerb,
    Tag.InfinitiveAuxiliaryVerb,
    Tag.PerfectAuxiliaryVerb,
    Tag.FiniteModalVerb,
    Tag.InfinitiveModalVerb,
    Tag.PerfectModalVerb,
    Tag.FiniteFullVerb,
    Tag.ImperativeFullVerb,
    Tag.InfinitiveFullVerb,
    Tag.ZuInfinitiveFullVerb,
    Tag.PerfectFullVerb
  ].includes(tag);
export const isWordTag = (tag: Tag) =>
  ![
    Tag.InternalPunct,
    Tag.Comma,
    Tag.SentenceFinalPunct,
    Tag.WordRemnant,
    Tag.NonWord,
    Tag.Whitespace,
    Tag.Number
  ].includes(tag);
export const isPunctuationTag = (tag: Tag) =>
  [Tag.InternalPunct, Tag.SentenceFinalPunct, Tag.Comma].includes(tag);

type SpacyToken = {
  id: number;
  start: number;
  end: number;
  tag: Tag;
};

export type SentenceToken = SpacyToken & {
  token: string;
};

type SpacyData = {
  text: string;
  tokens: SpacyToken[];
};

const removePunctuation = (word: string) => word.replace(/[.,/#!?$%^&*;:{}=\-_`~()]/g, '').trim();

export const tagSentence = async (TAG_API: string, sentence: string): Promise<SentenceToken[]> => {
  return fetch(`${TAG_API}?s=${encodeURIComponent(sentence)}`)
    .then(async (response) => response.json())
    .then((data: SpacyData) => {
      return data.tokens.map((t) => ({
        id: t.id,
        start: t.start,
        end: t.end,
        tag: t.tag,
        token: removePunctuation(data.text.slice(t.start, t.end))
      }));
    });
};

export const tagSentenceBatch = async (
  TAG_API: string,
  sentences: string[],
  batchSize = 1,
  tqdm = undefined
): Promise<SentenceToken[][]> => {
  const taggedSentences: SentenceToken[][] = [];

  const idxs = [...Array(Math.ceil(sentences.length / batchSize)).keys()];

  const itt = tqdm && sentences.length > batchSize ? tqdm(idxs) : idxs;

  for (const i of itt) {
    taggedSentences.push(
      ...(await fetch(TAG_API, {
        method: 'POST',
        body: JSON.stringify({ s: sentences.slice(i, i + batchSize).map(encodeURIComponent) }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(async (response) => response.json())
        .then((data: SpacyData[]) => {
          return data.map((d) =>
            d.tokens?.map((t) => ({
              id: t.id,
              start: t.start,
              end: t.end,
              tag: t.tag,
              token: removePunctuation(d.text.slice(t.start, t.end))
            }))
          );
        }))
    );
  }

  return taggedSentences;
};

export const matchSentence = (
  sentence: SentenceToken[],
  lookupTables: LookupTables
): (Word | undefined)[] => {
  const matched: (Word | undefined)[] = [];
  let firstVerbMatchedIdx = -1;
  let firstVerbSentenceIdx = -1;

  for (let i = 0; i < sentence.length; i++) {
    const token = sentence[i];

    if (isPunctuationTag(token.tag)) {
      firstVerbMatchedIdx = -1;
      firstVerbSentenceIdx = -1;
      continue;
    }

    if (isNounTag(token.tag)) {
      matched.push(lookupTables.nounLookupTable[token.token]);
    } else if (isAdjectiveTag(token.tag)) {
      if (
        firstVerbMatchedIdx !== -1 &&
        (i === sentence.length - 1 || isPunctuationTag(sentence[i + 1].tag))
      ) {
        matched[firstVerbMatchedIdx] =
          lookupTables.verbLookupTable[token.token + sentence[firstVerbSentenceIdx].token] ??
          matched[firstVerbMatchedIdx];
        matched.push(undefined);
      } else {
        matched.push(lookupTables.adjectiveLookupTable[token.token]);
      }
    } else if (isVerbTag(token.tag)) {
      if (firstVerbMatchedIdx === -1) {
        firstVerbMatchedIdx = matched.length;
        firstVerbSentenceIdx = i;
      }
      matched.push(lookupTables.verbLookupTable[token.token]);
    } else if (firstVerbMatchedIdx !== -1 && token.tag === Tag.SeparableVerbalParticle) {
      matched[firstVerbMatchedIdx] =
        lookupTables.verbLookupTable[token.token + sentence[firstVerbSentenceIdx].token] ??
        matched[firstVerbMatchedIdx];
      matched.push(undefined);
    } else if (token.tag === Tag.Adverb) {
      if (
        firstVerbMatchedIdx !== -1 &&
        (i === sentence.length - 1 || isPunctuationTag(sentence[i + 1].tag))
      ) {
        matched[firstVerbMatchedIdx] =
          lookupTables.verbLookupTable[token.token + sentence[firstVerbSentenceIdx].token] ??
          matched[firstVerbMatchedIdx];
      }
      matched.push(undefined);
    } else {
      matched.push(undefined);
    }
  }

  return matched;
};

export const getVocabWords = (
  sentence: string,
  TAG_API: string,
  lookupTables: LookupTables
): Promise<(Word | undefined)[]> =>
  tagSentence(TAG_API, sentence).then((tagged) => {
    return matchSentence(tagged, lookupTables);
  });
