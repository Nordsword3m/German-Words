export const WordTypes = ["noun", "verb", "adjective"];
export type WordType = typeof WordTypes[number];

export type Word = Noun | Verb | Adjective;

export const Levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
export type Level = typeof Levels[number];

export type WordBase = {
  lemma: string;
  type: WordType;
  level: Level | null;
  translations: string[];
};

export const Genders = ["m", "f", "n"];
export type Gender = typeof Genders[number];

export const Cases = ["nominative", "accusative", "dative", "genitive"];
export type Case = typeof Cases[number];

export const Forms = ["singular", "plural"];
export type Form = typeof Forms[number];

export type Noun = WordBase & {
  gender: Gender;
  noArticle: boolean;
  singularOnly: boolean;
  pluralOnly: boolean;
  cases: {
    [key in Case]: {
      [key in Form]: string;
    };
  };
};

export const Pronouns = ["ich", "du", "es", "wir", "ihr", "Sie"];
export type Pronoun = typeof Pronouns[number]

export type Conjugation = {
  [key in Pronoun]: string;
};

export type Verb = WordBase & {
  separable: boolean;
  present: Conjugation;
  simple: Conjugation;
  conjunctive1: Conjugation;
  conjunctive2: Conjugation;
  imperative: { "du": string, "wir": string, "ihr": string, "Sie": string } | null;
  perfect: string;
  gerund: string;
  zuinfinitive: string;
};

export const GenderedForms = [...Genders, "p"];
export type GenderedForm = typeof GenderedForms[number];

export type Declension = {
  [key in Case]: {
    [key in GenderedForm]: string;
  };
};

export type Adjective = WordBase & {
  singularOnly: boolean;
  pluralOnly: boolean;
  predicativeOnly: boolean;
  noMixed: boolean;
  strong: Declension;
  weak: Declension;
  mixed: Declension;
  comparative: string;
  superlative: string;
};