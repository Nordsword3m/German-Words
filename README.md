# German Dictionary

A list of JSON objects each containing a German word and a bunch of information about that word, and it's different forms. This list is far from a complete list of German words, but it does contain a good number of common words and their forms.

This repo only contains the data, types and the functions used to validate this data. It does not contain the scraper or parser used to generate this data as those are likely to change in the future and also contain api keys.

## Structure

### WordBase

Each word entry in this list has a set of common properties allowing them to be represented by the following type

```typescript
type WordBase = {
  lemma: string;
  type: WordType;
  level?: Level;
  translations: { [key in LanguageCode]: string[] };
  frequency?: number;
};
```

- `lemma`: The base form/lemma, aka what you would search for in a dictionary (e.g. `'laufen'`, `'Hund'`, `'grün'`, `'weglaufen'`).
- `type`: The type of word. `WordType` is an enum with the following values:
  - `noun`
  - `verb`
  - `adjective`
- `level`: The CEFR language proficiency level of the word. Note, not every word has an associated level. `Level` is an enum with the following values:
  - `A1`
  - `A2`
  - `B1`
  - `B2`
  - `C1`
  - `C2`
- `translations`: An object containing a list translations for the word in different languages.
- `frequency`: The frequency of this word, as it appears in the Leipzig Web-public Germany 2019 1M Corpora. Note, not every word has an associated frequency. The frequency is a number between 0 and 1, where 1 means the word appears in every sentence.

### Word Types

Each entry in the list can be classified into on of three types: Noun, Verb, or Adjective. Each type extends the `WordBase` type providing additional information specific to that type.

#### Noun

Each noun entry in the list is represented by the following type

```typescript
type Noun = WordBase & {
  type: WordType.Noun;
  gender: Gender | null;
  noArticle: boolean;
  singularOnly: boolean;
  pluralOnly: boolean;
  cases: {
    [key in Case]: {
      [key in Form]: string | null;
    };
  };
};
```

- `gender`: The gramatical of the noun. `Gender` is an enum with the following values:
  - `m` (masculine)
  - `f` (feminine)
  - `n` (neuter)
- `noArticle`: A boolean indicating if the noun is used without an article (e.g. `Frankfurt`).
- `singularOnly`: A boolean indicating if the noun only has a singular form (e.g. `Eis`, `Mathematik`, `Mülltrennung`).
- `pluralOnly`: A boolean indicating if the noun only has a plural form (e.g. `Leute`, `Eltern`, `Fachleute`).
- `cases`: An object containing the different forms of the noun for each case. `Case` is an enum with the following values:

  - `nominative`
  - `accusative`
  - `dative`
  - `genitive`

  `Form` is an enum with the following values:

  - `singular`
  - `plural`

#### Verb

Each verb entry in the list is represented by the following type

```typescript
type Verb = WordBase & {
  type: WordType.Verb;
  separable: boolean;
  withSein: boolean;
  present: Conjugation;
  simple: Conjugation;
  conjunctive1: Conjugation;
  conjunctive2: Conjugation;
  imperative: Imperative | null;
  perfect: string;
  gerund: string;
  zuinfinitive: string;
};
```

- `separable`: A boolean indicating if the verb is separable. The sepearation is indicated by a dot `·` in `WordBase.lemma` (e.g. `'weg·laufen'`, `'an·rufen'`, `'mit·kommen'`). Note, some verbs can be both separable and inseparable (e.g. `'anerkennen'` can be both `'an·erkennen'` and `'anerkennen'`).
- `withSein`: A boolean indicating if `sein` is used as the helper verb (false indicates `haben`).
- `present`: The present tense conjugation of the verb.
- `simple`: The simple past tense conjugation of the verb.
- `conjunctive1`: The first conjunctive conjugation of the verb.
- `conjunctive2`: The second conjunctive conjugation of the verb.
- `imperative`: An object containing the imperative forms of the verb. If the verb does not have an imperative form, this object becomes `null`.
- `perfect`: The perfect tense form of the verb, also known as the past participle.
- `gerund`: The gerund form of the verb.
- `zuinfinitive`: The zu-infinitive form of the verb (e.g. `'zu laufen'`, `'zu rufen'`, `'zu kommen'`).

`Conjugation` is an object that holds each form of the verb respective to the pronoun in a specified tense. It is defined as follows:

```typescript
type Conjugation = {
  [key in Pronoun]: string;
};
```

`Pronoun` is an enum with the following values:

- `ich`
- `du`
- `es`
- `ihr`
- `Sie`
  Note conjugaions with `er` and `sie` are assumed to always be the same as `es`. This is also assumed for `wir` and `Sie`

#### Adjective

Each adjective entry in the list is represented by the following type

```typescript
type Adjective = WordBase & {
  type: WordType.Adjective;
  singularOnly: boolean;
  pluralOnly: boolean;
  predicativeOnly: boolean;
  absolute: boolean;
  notDeclinable: boolean;
  noMixed: boolean;
  strong: Declension;
  weak: Declension;
  mixed: Declension;
  comparative?: string;
  isComparative: boolean;
  noComparative: boolean;
  superlative?: string;
  isSuperlative: boolean;
  superlativeOnly: boolean;
  commonNouns?: string[];
};
```

- `singularOnly`: A boolean indicating if the adjective only has a singular form (e.g. `eins`).
- `pluralOnly`: A boolean indicating if the adjective only has a plural form (e.g. `acht`, `neun`).
- `predicativeOnly`: A boolean indicating if the adjective only has a predicative form (e.g. `allein`, `egal`, `mehr`).
- `noMixed`: A boolean indicating if the adjective does not have a mixed declension (e.g. `eins`).
- `absolute`: A boolean indicating if the adjective is an absolute adjective, aka doesn't have any comparative forms (e.g. `extra`, `vegan`, `kostenlos`).
- `notDeclinable`: A boolean indicating if the adjective is not declinable (e.g. `klasse`, `super`, `mehr`).
- `strong`: The strong declension of the adjective.
- `weak`: The weak declension of the adjective.
- `mixed`: The mixed declension of the adjective.
- `comparative`: The comparative form of the adjective.
- `isComparative`: A boolean indicating if the adjective is a comparative form (e.g. 'weniger`, `kleiner`, `schneller`).
- `superlative`: The superlative form of the adjective.
- `isSuperlative`: A boolean indicating if the adjective is a superlative form (e.g. `falschesten`, `ältesten`, `klügsten`).
- `commonNouns`: A list of noun lemmas commonly used with this adjective as they appear in the Leipzig Web-public Germany 2019 1M Corpora.

`Declension` is an object that holds each gendered form of the adjective for each case. It is defined as follows:

```typescript
type Declension = {
  [key in Case]: {
    [key in GenderedForm]: string;
  };
};
```

`GenderedForm` is an extension of the `Gender` enum with the following values:

- `m` (masculine)
- `f` (feminine)
- `n` (neuter)
- `p` (plural)

## Motivation

I created this list as I couldn't find a good list of German words with their different forms that was also free of charge. I needed a list of German words for a project I was working on and decided to create my own.

## Method

This data is scraped from `https://www.verbformen.de` using a scraper written in TypeScript. The generated data was then ran through some validators to ensure that the data was as clean as possible.

## Ephesians 4:6

Don’t use foul or abusive language. Let everything you say be good and helpful, so that your words will be an encouragement to those who hear them.
