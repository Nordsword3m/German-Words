# GitHub Copilot Instructions

## Project Overview

This repository is a dataset of German words with type-safe TypeScript definitions. Each word entry is a JSON object containing the word's base form (lemma), type, translations, frequency, and grammatical forms.

## Repository Structure

- `types.ts` — All TypeScript types and enums for the data model
- `validation.ts` — Validators for each word type (`validateWordBase`, `validateNoun`, `validateVerb`, `validateAdjective`)
- `wordLookup.ts` — Functions to build lookup tables from word arrays and generate selected lookup forms for each word
- `nlp.ts` — NLP helpers: POS tag enums (`Tag`), sentence-matching logic (`matchSentence`, `getVocabWords`), and an API client (`ApiCall`) for the spaCy tagging service
- `utils.ts` — General-purpose utility functions (`keys`, `entries`, `filterFalsey`, `removeEmojis`, etc.)
- `data/` — The word data split across numbered JSON files plus `all.json`
- `tsconfig.json` — TypeScript configuration

## Key Types (defined in `types.ts`)

### `WordBase`
Common properties shared by all word entries:
```typescript
type WordBase = {
  lemma: string;              // base/dictionary form
  type: WordType;             // 'noun' | 'verb' | 'adjective'
  translations: { [key in LanguageCode]: string[] };  // 'en' and 'fr'
  frequency?: number;         // 0–1 from Leipzig Web-public Germany 2019 1M Corpora
};
```

### `Noun`
Extends `WordBase` with gender, article flags, and declined case forms:
```typescript
type Noun = WordBase & {
  type: WordType.Noun;
  gender: Gender | null;      // 'm' | 'f' | 'n' | null (when noArticle)
  noArticle: boolean;         // e.g. proper nouns like 'Frankfurt'
  singularOnly: boolean;
  pluralOnly: boolean;
  cases: { [key in Case]: { [key in Form]: string | null } };
};
```
`Case` values: `nominative`, `accusative`, `dative`, `genitive`
`Form` values: `singular`, `plural`

### `Verb`
Extends `WordBase` with conjugation tables and boolean flags:
```typescript
type Verb = WordBase & {
  type: WordType.Verb;
  separable: boolean;         // prefix separated by '·' in lemma (e.g. 'weg·laufen')
  superSeparable: boolean;    // two separable parts
  modal: boolean;             // modal verb (dürfen, können, etc.)
  reflexive: boolean;         // reflexive verb
  present: Conjugation;       // present tense forms
  simple: Conjugation;        // simple past (Präteritum) forms
  imperative: Imperative;     // du/ihr imperative forms (always present; for modal verbs usually empty/ignored — use verb.modal guard)
  perfect: string;            // past participle (Partizip II)
  gerund: string;             // gerund form
  zuinfinitive: string;       // zu-infinitive (e.g. 'zu laufen', 'wegzulaufen')
  withSein: boolean;          // true if perfect uses 'sein', false for 'haben'
};
```
`Conjugation` maps each `Pronoun` (`ich`, `du`, `es`, `ihr`, `Sie`) to a string.
`er`/`sie` forms are always the same as `es`; `wir` forms are always the same as `Sie`.

### `Adjective`
Extends `WordBase` with declension tables:
```typescript
type Adjective = WordBase & {
  type: WordType.Adjective;
  singularOnly: boolean;
  predicativeOnly: boolean;   // only used predicatively (e.g. 'allein', 'egal')
  notDeclinable: boolean;     // not declined (e.g. 'klasse', 'super')
  strong: Declension;
  weak: Declension;
  mixed: Declension;
  comparative?: string;
  superlative?: string;
  commonNouns?: string[];     // noun lemmas frequently used with this adjective
};
```
`Declension` maps `Case` × `GenderedForm` (`m`, `f`, `n`, `p`) to `string | null`.

## Conventions

- All enum values have a corresponding array constant (`WordTypes`, `Genders`, `Cases`, `Forms`, `Pronouns`, `GenderedForms`, etc.) produced with `Object.values()`.
- Separable verbs have a `·` in their lemma and a space in conjugated forms (e.g. `'rufe an'`). `switchSeparable` in `wordLookup.ts` converts these to lookup-friendly forms.
- Validation throws on the first invalid object and includes the full object + error map in the message.
- Lookup tables (`getLookupTables`) build lowercased `string → Word` maps by enumerating selected lookup forms for each word via `getNounLookups`, `getVerbLookups`, and `getAdjectiveLookups`.
- `getWordId` in `nlp.ts` produces a unique ID per word: `lemma + type (+ gender for nouns)`.
