import { Word } from './types';
import { filterFalsey, removeEmojis } from './utils';
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

export enum SpacyCase {
  Nom = 'Nom',
  Acc = 'Acc',
  Dat = 'Dat',
  Gen = 'Gen'
}

export type SpacyToken = {
  text: string;
  case: SpacyCase;
  tag: Tag;
};

export const tagSentence = async (
  TAG_API: string,
  sentence: string,
  logger?: (msg: string, data: object | string | number) => void
): Promise<SpacyToken[] | undefined> => {
  const url = `${TAG_API}?s=${encodeURIComponent(removeEmojis(sentence))}`;
  return await fetch(url)
    .then(async (response) => {
      const raw = await response.text();

      try {
        const parsed = JSON.parse(raw) as SpacyToken[];
        logger?.('Tagged sentence', { sentence, parsed });
        return parsed;
      } catch (err) {
        logger?.('Failed to process tagged sentence', {
          sentence,
          raw,
          err: (err as Error).message
        });
        return undefined;
      }
    })
    .catch((err) => {
      logger?.('Failed to tag sentence', { sentence, url, err: (err as Error).message });
      return undefined;
    });
};

export const tagSentenceBatch = async (
  TAG_API: string,
  sentences: string[],
  batchSize = 1,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tqdm: any = undefined
): Promise<SpacyToken[][]> => {
  const taggedSentences: SpacyToken[][] = [];

  const idxs = [
    ...Array(Math.ceil(sentences.length / batchSize))
      .fill(0)
      .map((_, i) => i * batchSize)
  ];

  const itt = tqdm && sentences.length > batchSize ? tqdm(idxs) : idxs;

  for (const i of itt) {
    taggedSentences.push(
      ...(await fetch(TAG_API, {
        method: 'POST',
        body: JSON.stringify({
          s: filterFalsey(sentences.slice(i, i + batchSize))
            .map(removeEmojis)
            .map(encodeURIComponent)
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(async (response) => response.json())
        .then((data: SpacyToken[][]) => {
          return data;
        }))
    );
  }

  return filterFalsey(taggedSentences);
};

export const matchSentence = (
  sentence: SpacyToken[],
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
      matched.push(lookupTables.nounLookupTable[token.text.toLowerCase()]);
    } else if (isAdjectiveTag(token.tag)) {
      if (
        firstVerbMatchedIdx !== -1 &&
        (i === sentence.length - 1 || isPunctuationTag(sentence[i + 1].tag))
      ) {
        matched[firstVerbMatchedIdx] =
          lookupTables.verbLookupTable[
            token.text.toLowerCase() + sentence[firstVerbSentenceIdx].text.toLowerCase()
          ] ?? matched[firstVerbMatchedIdx];
        matched.push(undefined);
      } else {
        matched.push(lookupTables.adjectiveLookupTable[token.text.toLowerCase()]);
      }
    } else if (isVerbTag(token.tag)) {
      if (firstVerbMatchedIdx === -1) {
        firstVerbMatchedIdx = matched.length;
        firstVerbSentenceIdx = i;
      }
      matched.push(lookupTables.verbLookupTable[token.text.toLowerCase()]);
    } else if (firstVerbMatchedIdx !== -1 && token.tag === Tag.SeparableVerbalParticle) {
      matched[firstVerbMatchedIdx] =
        lookupTables.verbLookupTable[
          token.text.toLowerCase() + sentence[firstVerbSentenceIdx].text.toLowerCase()
        ] ?? matched[firstVerbMatchedIdx];
      matched.push(undefined);
    } else if (token.tag === Tag.Adverb) {
      if (
        firstVerbMatchedIdx !== -1 &&
        (i === sentence.length - 1 || isPunctuationTag(sentence[i + 1].tag))
      ) {
        matched[firstVerbMatchedIdx] =
          lookupTables.verbLookupTable[
            token.text.toLowerCase() + sentence[firstVerbSentenceIdx].text.toLowerCase()
          ] ?? matched[firstVerbMatchedIdx];
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
): Promise<(Word | undefined)[] | undefined> =>
  tagSentence(TAG_API, sentence).then((tagged) => {
    if (!tagged) return undefined;
    return matchSentence(tagged, lookupTables);
  });
