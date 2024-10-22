export enum WordType {
  Noun = 'noun',
  Verb = 'verb',
  Adjective = 'adjective'
}
export const WordTypes = Object.values(WordType);

export type Word = Noun | Verb | Adjective;

export type WordInfo = {
  searchWord: string;
  pageWord: string;
  fileName: string;
  type: WordType;
  gender: Gender;
};

export enum Level {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2'
}
export const Levels = Object.values(Level);

export type WordBase = {
  lemma: string;
  type: WordType;
  level?: Level;
  translations?: string[];
  frequency?: number;
};

export enum Gender {
  Masculine = 'm',
  Feminine = 'f',
  Neuter = 'n'
}
export const Genders = Object.values(Gender);

export enum Case {
  Nominative = 'nominative',
  Accusative = 'accusative',
  Dative = 'dative',
  Genitive = 'genitive'
}
export const Cases = Object.values(Case);

export enum Form {
  Singular = 'singular',
  Plural = 'plural'
}
export const Forms = Object.values(Form);

export type Noun = WordBase & {
  gender: Gender | null;
  noArticle: boolean;
  singularOnly: boolean;
  pluralOnly: boolean;
  cases: {
    [key in Case]: {
      [key in Form]: string;
    };
  };
};

export enum Pronoun {
  Ich = 'ich',
  Du = 'du',
  Es = 'es',
  Ihr = 'ihr',
  Sie = 'Sie'
}
export const Pronouns = Object.values(Pronoun);

export type Conjugation = {
  [key in Pronoun]: string;
};

export type Verb = WordBase & {
  separable: boolean;
  present: Conjugation;
  simple: Conjugation;
  conjunctive1: Conjugation;
  conjunctive2: Conjugation;
  imperative: { du: string; ihr: string; Sie: string } | null;
  perfect: string;
  gerund: string;
  zuinfinitive: string;
};

export enum GenderedForm {
  Masculine = 'm',
  Feminine = 'f',
  Neuter = 'n',
  Plural = 'p'
}
export const GenderedForms = Object.values(GenderedForm);

export type Declension = {
  [key in Case]: {
    [key in GenderedForm]: string;
  };
};

export type Adjective = WordBase & {
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
