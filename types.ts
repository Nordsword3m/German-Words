export enum WordType {
  Noun = 'noun',
  Verb = 'verb',
  Adjective = 'adjective'
}
export const WordTypes = Object.values(WordType);

export type Word = Noun | Verb | Adjective;

export type WordInfo = {
  searchWord: string;
  pageWord: string | null;
  fileName: string | null;
  type: WordType | null;
  gender: Gender | null;
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

export enum LanguageCode {
  English = 'en',
  French = 'fr'
}
export const LanguageCodes = Object.values(LanguageCode);

export type WordBase = {
  lemma: string;
  type: WordType;
  level?: Level;
  translations: { [key in LanguageCode]: string[] };
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

export const ShortCases = ['Nom.', 'Acc.', 'Dat.', 'Gen.'];
export type ShortCase = (typeof ShortCases)[number];
export const toShortCase = (c: Case): ShortCase => {
  switch (c) {
    case Case.Nominative:
      return 'Nom.';
    case Case.Accusative:
      return 'Acc.';
    case Case.Dative:
      return 'Dat.';
    case Case.Genitive:
      return 'Gen.';
  }
};

export enum Form {
  Singular = 'singular',
  Plural = 'plural'
}
export const Forms = Object.values(Form);

export type Noun = WordBase & {
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

export type Imperative = {
  [Pronoun.Du]: string;
  [Pronoun.Ihr]: string;
  [Pronoun.Sie]: string;
};

export type Verb = WordBase & {
  type: WordType.Verb;
  separable: boolean;
  present: Conjugation;
  simple: Conjugation;
  conjunctive1: Conjugation;
  conjunctive2: Conjugation;
  imperative: Imperative | null;
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
export const toShortGenderedForm = (g: GenderedForm) => {
  switch (g) {
    case GenderedForm.Masculine:
      return 'Masc';
    case GenderedForm.Feminine:
      return 'Fem';
    case GenderedForm.Neuter:
      return 'Neut';
    case GenderedForm.Plural:
      return 'Plural';
  }
};

export type Declension = {
  [key in Case]: {
    [key in GenderedForm]: string | null;
  };
};

export enum DeclensionType {
  Strong = 'strong',
  Weak = 'weak',
  Mixed = 'mixed'
}
export const DeclensionTypes = Object.values(DeclensionType);

export enum Ending {
  E = 'e',
  Er = 'er',
  En = 'en',
  Em = 'em',
  Es = 'es'
}
export const Endings = Object.values(Ending);

export type Adjective = WordBase & {
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
