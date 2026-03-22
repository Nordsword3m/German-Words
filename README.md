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
  translations: { [key in LanguageCode]: string[] };
  frequency?: number;
};
```

- `lemma`: The base form/lemma, aka what you would search for in a dictionary (e.g. `'laufen'`, `'Hund'`, `'grün'`, `'weglaufen'`).
- `type`: The type of word. `WordType` is an enum with the following values:
  - `noun`
  - `verb`
  - `adjective`
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
  superSeparable: boolean;
  modal: boolean;
  reflexive: boolean;
  present: Conjugation;
  simple: Conjugation;
  imperative: Imperative;
  perfect: string;
  gerund: string;
  zuinfinitive: string;
  withSein: boolean;
};
```

- `separable`: A boolean indicating if the verb is separable. The separation is visible in conjugated forms, where the prefix appears at the end of the clause separated by a space (e.g. `'rufe an'` for `'anrufen'`). Note, some verbs can be both separable and inseparable (e.g. `'umfahren'`).
- `superSeparable`: A boolean indicating if the verb has two separable parts.
- `modal`: A boolean indicating if the verb is a modal verb (e.g. `dürfen`, `können`, `müssen`).
- `reflexive`: A boolean indicating if the verb is a reflexive verb.
- `present`: The present tense conjugation of the verb.
- `simple`: The simple past tense conjugation of the verb.
- `imperative`: An object containing the imperative forms of the verb (`du` and `ihr`). For modal verbs this object is still present, but its values are empty/ignored; callers should either guard with `!verb.modal` or check for non-empty strings before using them.
- `perfect`: The perfect tense form of the verb, also known as the past participle.
- `gerund`: The gerund form of the verb.
- `zuinfinitive`: The zu-infinitive form of the verb (e.g. `'zu laufen'`, `'zu rufen'`, `'zu kommen'`).
- `withSein`: A boolean indicating if `sein` is used as the helper verb (false indicates `haben`).

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
  predicativeOnly: boolean;
  notDeclinable: boolean;
  strong: Declension;
  weak: Declension;
  mixed: Declension;
  comparative?: string;
  superlative?: string;
  commonNouns?: string[];
};
```

- `singularOnly`: A boolean indicating if the adjective only has a singular form (e.g. `eins`).
- `predicativeOnly`: A boolean indicating if the adjective only has a predicative form (e.g. `allein`, `egal`, `mehr`).
- `notDeclinable`: A boolean indicating if the adjective is not declinable (e.g. `klasse`, `super`, `mehr`).
- `strong`: The strong declension of the adjective.
- `weak`: The weak declension of the adjective.
- `mixed`: The mixed declension of the adjective.
- `comparative`: The comparative form of the adjective.
- `superlative`: The superlative form of the adjective.
- `commonNouns`: A list of noun lemmas commonly used with this adjective as they appear in the Leipzig Web-public Germany 2019 1M Corpora.

`Declension` is an object that holds each gendered form of the adjective for each case. It is defined as follows:

```typescript
type Declension = {
  [key in Case]: {
    [key in GenderedForm]: string | null;
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

This data is parsed and processed from `https://kaikki.org/dictionary/downloads/de/de-extract.jsonl`, the dataset that backs `https://de.wiktionary.org`. The generated data was then ran through some validators to ensure that the data was as clean as possible.

## Ephesians 4:6

Don’t use foul or abusive language. Let everything you say be good and helpful, so that your words will be an encouragement to those who hear them.
