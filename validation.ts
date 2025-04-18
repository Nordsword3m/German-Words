import {
  Adjective,
  WordBase,
  Cases,
  Forms,
  GenderedForms,
  Genders,
  Levels,
  Noun,
  Pronouns,
  Verb,
  WordTypes,
  LanguageCode,
  LanguageCodes
} from './types';

class Validator {
  errors: { [key: string]: string } = {};

  assertValid(obj: object) {
    if (Object.keys(this.errors).length > 0) {
      throw new Error(
        `\nObject: ${JSON.stringify(obj, null, 2)}\n\nErrors:${JSON.stringify(
          this.errors,
          null,
          2
        )}`
      );
    }
  }

  validatePresence(fieldName: string, field: string): boolean {
    if (!field) {
      this.errors[fieldName] = "Can't be blank";
      return false;
    }

    return true;
  }

  validateWord(
    fieldName: string,
    word: string | null | undefined,
    allowedChars = '',
    numbersAllowed = false,
    nullAllowed = false
  ): boolean {
    if (word === null && nullAllowed) {
      return true;
    }

    const regex = new RegExp(
      `^[a-zA-ZäöüÄÖÜßé${allowedChars}${numbersAllowed ? '0-9' : ''}]+$`,
      'g'
    );

    if (!word || !regex.test(word)) {
      this.errors[fieldName] = `Invalid '${word}'`;
      return false;
    }

    return true;
  }

  validateRange(fieldName: string, field: number, min: number, max: number): boolean {
    if (field < min || field > max) {
      this.errors[fieldName] = `'${field}' is not in range ${min} - ${max}`;
      return false;
    }

    return true;
  }

  validateOneOfType<T>(fieldName: string, field: T, validValues: T[]) {
    if (this.validatePresence(fieldName, field as string) && !validValues.includes(field)) {
      this.errors[fieldName] = `'${field}' must be one of ${validValues.join(', ')}`;
    }
  }

  validateOneOfTypeOrNull<T>(fieldName: string, field: T, validValues: T[]) {
    if (field !== null && !validValues.includes(field)) {
      this.errors[fieldName] = `'${field}' must be one of ${validValues.join(', ')}`;
    }
  }

  validateIsBoolean(fieldName: string, field: boolean) {
    if (typeof field !== 'boolean') {
      this.errors[fieldName] = `'${field}' must be a boolean`;
    }
  }

  validateContains(fieldName: string, field: string, substring: string) {
    if (!field.includes(substring)) {
      this.errors[fieldName] = `'${field}' must include '${substring}'`;
    }
  }

  validateNotContains(fieldName: string, field: string, substring: string) {
    if (field.includes(substring)) {
      this.errors[fieldName] = `'${field}' must not include '${substring}'`;
    }
  }

  validateCondition(fieldName: string, condition: () => boolean, msg: string) {
    if (!condition()) {
      this.errors[fieldName] = msg;
    }
  }

  validateIsNull(fieldName: string, field: string | null) {
    if (field !== null) {
      this.errors[fieldName] = `'${field}' must be undefined`;
    }
  }

  validateIsUndefined(fieldName: string, field: string | undefined) {
    if (field !== undefined) {
      this.errors[fieldName] = `'${field}' must be undefined`;
    }
  }

  validateWordCount(fieldName: string, field: string, count: number) {
    if (field.split(' ').length !== count) {
      this.errors[fieldName] = `'${field}' must have ${count} words`;
    }
  }

  validateEqual(fieldName: string, val1: string | null, val2: string | null) {
    if (val1 !== val2) {
      this.errors[fieldName] = `'${val1}' must be equal to '${val2}'`;
    }
  }
}

export const validateWordBase = (word: WordBase) => {
  const validator = new Validator();

  validator.validateWord('word', word.lemma, '·');
  validator.validateCondition(
    'word',
    () => (word.lemma.match(/·/g) || []).length <= 1,
    "Word must have at most one '·'"
  );
  validator.validateOneOfType('type', word.type, WordTypes);

  if (word.level) {
    validator.validateOneOfType('level', word.level, Levels);
  }

  const allowedChars: { [key in LanguageCode]: string } = {
    en: " \\-\\'éè”&",
    fr: " \\-\\'”&àâäéèêëïîôöùûüÿçæœÀÂÄÉÈÊÏÎÔÖÙÛÜŸÇÆŒ"
  };

  LanguageCodes.forEach((lang) => {
    word.translations[lang].forEach((translations, i) => {
      validator.validateWord(`translations.${lang}.[${i}]`, translations, allowedChars[lang], true);
    });
  });

  validator.assertValid(word);
};

export const validateNoun = (noun: Noun) => {
  const validator = new Validator();

  validator.validateIsBoolean('singularOnly', noun.singularOnly);
  validator.validateIsBoolean('pluralOnly', noun.pluralOnly);
  validator.validateCondition(
    'singularOnly/pluralOnly',
    () => !noun.singularOnly || !noun.pluralOnly,
    "Can't be singularOnly and pluralOnly at the same time"
  );
  validator.validateIsBoolean('noArticle', noun.noArticle);

  if (noun.noArticle) {
    validator.validateIsNull('gender', noun.gender);
  } else {
    if (!noun.pluralOnly) {
      validator.validateOneOfTypeOrNull('gender', noun.gender, Genders);
    }
  }

  Cases.forEach((c) => {
    if (!noun.singularOnly && !noun.pluralOnly) {
      Forms.forEach((f) => {
        validator.validateWord(`${c}.${f}`, noun.cases[c][f]);
      });
    } else if (noun.singularOnly) {
      validator.validateWord(`${c}.singular`, noun.cases[c].singular);
      validator.validateIsNull(`${c}.plural`, noun.cases[c].plural);
    } else if (noun.pluralOnly) {
      validator.validateIsNull(`${c}.singular`, noun.cases[c].singular);
      validator.validateWord(`${c}.plural`, noun.cases[c].plural);
    }
  });

  validator.assertValid(noun);
};

export const validateVerb = (verb: Verb) => {
  const validator = new Validator();

  validator.validateIsBoolean('separable', verb.separable);

  const separableChar = verb.separable ? ' ' : '';

  if (verb.separable) {
    validator.validateContains('lemma', verb.lemma, '·');
    validator.validateCondition(
      'zuinfinitive',
      () =>
        /[a-zäöüß]zu[a-zäöü]/.test(verb.zuinfinitive) ||
        /[a-zäöüß] zu [a-zäöü]/.test(verb.zuinfinitive),
      "'zu' must be sandwiched"
    );
  } else {
    validator.validateNotContains('lemma', verb.lemma, '·');
    validator.validateContains('zuinfinitive', verb.zuinfinitive, 'zu');
  }

  const numBaseWords = verb.separable ? verb.present.ich.split(' ').length : 1;

  Pronouns.forEach((p) => {
    validator.validateWord(`present.${p}`, verb.present[p], '/' + separableChar);
    validator.validateWordCount(`present.${p}`, verb.present[p], numBaseWords);

    validator.validateWord(`simple.${p}`, verb.simple[p], '/' + separableChar);
    validator.validateWordCount(`simple.${p}`, verb.simple[p], numBaseWords);

    validator.validateWord(`conjunctive1.${p}`, verb.conjunctive1[p], separableChar);
    validator.validateWordCount(`conjunctive1.${p}`, verb.conjunctive1[p], numBaseWords);

    validator.validateWord(`conjunctive2.${p}`, verb.conjunctive2[p], '/' + separableChar);
    validator.validateWordCount(`conjunctive2.${p}`, verb.conjunctive2[p], numBaseWords);
  });

  if (verb.imperative) {
    validator.validateWord('imperative.du', verb.imperative.du, ' ');
    validator.validateWordCount('imperative.du', verb.imperative.du, numBaseWords + 1);

    validator.validateWord('imperative.ihr', verb.imperative.ihr, ' ');
    validator.validateWordCount('imperative.ihr', verb.imperative.ihr, numBaseWords + 1);

    validator.validateWord('imperative.Sie', verb.imperative.Sie, ' ');
    validator.validateWordCount('imperative.Sie', verb.imperative.Sie, numBaseWords + 1);

    validator.validateWord('perfect', verb.perfect, ' ');
    validator.validateWord('gerund', verb.gerund, ' ');
    validator.validateWord('zuinfinitive', verb.zuinfinitive, ' ');
  }

  validator.assertValid(verb);
};

export const validateAdjective = (adjective: Adjective) => {
  const validator = new Validator();

  validator.validateIsBoolean('predicativeOnly', adjective.predicativeOnly);
  validator.validateIsBoolean('pluralOnly', adjective.pluralOnly);
  validator.validateIsBoolean('isComparative', adjective.isComparative);
  validator.validateIsBoolean('isSuperlative', adjective.isSuperlative);

  validator.validateCondition(
    'predicativeOnly/pluralOnly',
    () => !adjective.predicativeOnly || !adjective.pluralOnly,
    "Can't be predicativeOnly and pluralOnly at the same time"
  );
  validator.validateCondition(
    'singularOnly/pluralOnly',
    () => !adjective.singularOnly || !adjective.pluralOnly,
    "Can't be singularOnly and pluralOnly at the same time"
  );

  validator.validateCondition(
    'isComparative/isSuperlative',
    () => !adjective.isComparative || !adjective.isSuperlative,
    "Can't be isComparative and isSuperlative at the same time"
  );

  if (adjective.absolute) {
    validator.validateIsUndefined('absolute', adjective.comparative);
    validator.validateIsUndefined('absolute', adjective.superlative);
  } else {
    if (adjective.superlativeOnly) {
      validator.validateIsUndefined('superlativeOnly', adjective.comparative);
    } else {
      if (adjective.noComparative) {
        validator.validateIsUndefined('comparative', adjective.comparative);
      } else {
        validator.validateWord('comparative', adjective.comparative, '', false, true);
      }
    }

    validator.validateWord('superlative', adjective.superlative, ' ', false, true);
  }

  if (adjective.notDeclinable) {
    if (!adjective.pluralOnly) {
      validator.validateEqual(
        'notDeclinable',
        adjective.strong.nominative.m,
        adjective.weak.genitive.f
      );
    } else {
      validator.validateEqual(
        'notDeclinable',
        adjective.strong.nominative.p,
        adjective.weak.genitive.p
      );
    }
  }

  Cases.forEach((c) => {
    GenderedForms.forEach((g) => {
      if (
        adjective.predicativeOnly ||
        (adjective.singularOnly && g === 'p') ||
        (adjective.pluralOnly && g !== 'p')
      ) {
        validator.validateIsNull(`strong.${c}.${g}`, adjective.strong[c][g]);
        validator.validateIsNull(`weak.${c}.${g}`, adjective.weak[c][g]);
        validator.validateIsNull(`mixed.${c}.${g}`, adjective.mixed[c][g]);
      } else {
        validator.validateWord(`strong.${c}.${g}`, adjective.strong[c][g]);
        validator.validateWord(`weak.${c}.${g}`, adjective.weak[c][g]);

        if (adjective.noMixed) {
          validator.validateIsNull(`mixed.${c}.${g}`, adjective.mixed[c][g]);
        } else {
          validator.validateWord(`mixed.${c}.${g}`, adjective.mixed[c][g]);
        }
      }
    });
  });

  validator.assertValid(adjective);
};
