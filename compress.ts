import { Adjective, Case, Cases, Form, Forms, GenderedForm, GenderedForms, Level, Noun, Pronouns, Verb, Word, WordBase } from "./types";

const compressionSteps: [string, string][] = [
  ["=er|=e|=es|=e|=en|=e|=es|=e|=em|=er|=em|=en|=en|=er|=en|=er\t=e|=e|=e|=en|=en|=e|=e|=en|=en|=en|=en|=en|=en|=en|=en|=en\t=er|=e|=es|=en|=en|=e|=es|=en|=en|=en|=en|=en|=en|=en|=en|=en", "$a%"],
  ["=ster|=ste|=stes|=ste|=sten|=ste|=stes|=ste|=stem|=ster|=stem|=sten|=sten|=ster|=sten|=ster\t=ste|=ste|=ste|=sten|=sten|=ste|=ste|=sten|=sten|=sten|=sten|=sten|=sten|=sten|=sten|=sten\t=ster|=ste|=stes|=sten|=sten|=ste|=stes|=sten|=sten|=sten|=sten|=sten|=sten|=sten|=sten|=sten", "$b%"],
  ["=le|=lst|=lt|=lt|=ln\t=lte|=ltest|=lte|=ltet|=lten\t=le|=lst|=le|=lt|=ln\t=lte|=ltest|=lte|=ltet|=lten", "$c%"],
  ["=e|=st|=t|=t|=en\t=te|=test|=te|=tet|=ten\t=e|=est|=e|=et|=en\t=te|=test|=te|=tet|=ten\t=e du\t=t ihr\t=en Sie\t=t\t=end\tzu =en", "$d%"],
  ["f\tf\tf\tf\t=|=en|=|=en|=|=en|=|=en", "$e%"],
  ["|=t|=t|=en\t=te|=test|=te|=tet|=ten\t=e|=est|=e|=et|=en\t=te|=test|=te|=tet|=ten\t=e du\t=t ihr\t=en Sie", "$f%"],
  ["\tf\tf\tf\tf\tf\tf\t$a%\t=", "$g%"],
  ["\tf\tf\tf\tf\t=|=n|=|=n|=|=n|=|=n\n", "$h%"],
  ["\tf\tf\tf\t=|=e|=|=e|=|=en|=es|=e\n", "$i%"],
  ["\tf\t=e|=est|=et|=et|=en\t=ete|=etest|=ete|=etet|=eten\t=e|=est|=e|=et|=en\t=ete|=etest|=ete|=etet|=eten\t=e du\t=et ihr\t=en Sie\t", "$j%"],
  ["t ~|=en ~\t=te ~|=test ~|=te ~|=tet ~|=ten ~\t=e ", "$k%"],
  ["\tt\t=e ~|=st ~|=t ~|=$k%~|=est ~|=e ~|=e$k%du ~\t=t ihr ~\t=en Sie ~\t~ge=t\t~=end\t~zu=en", "$l%"],
  ["\tf\tf\tf\tf\tf\tf\t$b%\t=er\tf\tam =sten\t", "$m%"],
  ["|=rt|=rn\t=rte|=rtest|=rte|=rtet|=rten\t=re", "$n%"],
  ["en ~\t=e ~|=est ~|=e ~|=et ~|=en ~\t", "$o%"],
  ["\tf\t=e|=st$f%\tge=t\t=end\tzu =en\n", "$p%"],
  ["\tf\tf\tf\t=|=|=|=|=|=", "$q%"],
  ["sten\tf\t\nadjective\t", "$r%"],
  ["\tf\tf\tf\tt\tf\tf\t$a%\t\tf\t\tf\t", "$s%"],
  ["\tf\tt\tf\t=||=||=||=", "$t%"],
  ["00$g%er\tf\tam =sten\tf\t", "$u%"],
  ["du ~\t=t ihr ~\t=en Sie ~\t~ge", "$v%"],
  ["\t~=end\t~zu=en\nverb\ther", "$w%"],
  ["\t\tf\tf\tf\tf\tf\tf\t$b%\t=r\tf\tam =", "$x%"],
  ["\tf\tf\tf\t=|=s|=|=s|=|=s|=s|=s\n", "$y%"],
  ["\tf\tf\tf\t=|=e|=|=e|=|=en|=s|=e\n", "$z%"],
];

export const compressWords = (words: Word[]): string => {
  let compressed = words.map((word): string[] => {
    const wordData: string[] = [word.type, word.lemma, word.level ?? "", word.translations?.join("|") ?? "", word.frequency?.toString() ?? ""];

    if (word.type === "noun") {
      const noun = word as Noun;
      return [
        ...wordData,
        noun.gender,
        noun.noArticle ? "t" : "f",
        noun.singularOnly ? "t" : "f",
        noun.pluralOnly ? "t" : "f",
        Cases.map(kase => Forms.map(form => noun.cases[kase][form]?.replace(word.lemma, "=") ?? "")).flat().join("|"),
      ];
    } else if (word.type === "verb") {
      const verb = word as Verb;

      const replaceBits = (s: string) => {
        const fauxLemma = verb.lemma.split("_").slice(-1)[0].slice(0, -2);

        let res = s?.replaceAll(fauxLemma, "=");

        if (verb.separable) {
          res = res?.replaceAll(verb.lemma.split("_")[0], "~");
        }

        return res ?? "";
      }

      return [
        ...wordData,
        verb.separable ? "t" : "f",
        Pronouns.map(pronoun => replaceBits(verb.present[pronoun])).join("|"),
        Pronouns.map(pronoun => replaceBits(verb.simple[pronoun])).join("|"),
        Pronouns.map(pronoun => replaceBits(verb.conjunctive1[pronoun])).join("|"),
        Pronouns.map(pronoun => replaceBits(verb.conjunctive2[pronoun])).join("|"),
        replaceBits(verb.imperative?.du ?? ""),
        replaceBits(verb.imperative?.ihr ?? ""),
        replaceBits(verb.imperative?.Sie ?? ""),
        replaceBits(verb.perfect),
        replaceBits(verb.gerund),
        replaceBits(verb.zuinfinitive),
      ];
    } else if (word.type === "adjective") {
      const adjective = word as Adjective;
      const fauxLemma = adjective.lemma.endsWith("sten") ? adjective.lemma.slice(0, -4) : adjective.lemma;
      return [
        ...wordData,
        adjective.singularOnly ? "t" : "f",
        adjective.pluralOnly ? "t" : "f",
        adjective.predicativeOnly ? "t" : "f",
        adjective.absolute ? "t" : "f",
        adjective.notDeclinable ? "t" : "f",
        adjective.noMixed ? "t" : "f",
        Cases.map(kase => GenderedForms.map(form => adjective.strong[kase][form]?.replace(fauxLemma, "=") ?? "")).flat().join("|"),
        Cases.map(kase => GenderedForms.map(form => adjective.weak[kase][form]?.replace(fauxLemma, "=") ?? "")).flat().join("|"),
        Cases.map(kase => GenderedForms.map(form => adjective.mixed[kase][form]?.replace(fauxLemma, "=") ?? "")).flat().join("|"),
        adjective.comparative?.replace(fauxLemma, "="),
        adjective.isComparative ? "t" : "f",
        adjective.noComparative ? "t" : "f",
        adjective.superlative?.replace(fauxLemma, "="),
        adjective.isSuperlative ? "t" : "f",
        adjective.superlativeOnly ? "t" : "f",
        adjective.commonNouns?.join("|") ?? "",
      ];
    }
  }).filter(Boolean).map((wordData: string[]) => wordData.join("\t")).join("\n");

  compressionSteps.forEach(([from, to]) => {
    compressed = compressed.replaceAll(from, to);
  });

  return compressed;
};

export const decompressWords = (compressed: string): Word[] => {
  let uncompressed = compressed;

  [...compressionSteps].reverse().forEach(([from, to]) => {
    uncompressed = uncompressed.replaceAll(to, from);
  });

  const result: Word[] = uncompressed.split("\n").map((line: string) => {
    const raw = line.split("\t");

    const [type, lemma, level, translations, frequency] = raw;
    const base: WordBase = {
      lemma,
      type,
    }

    if (frequency) {
      base.frequency = parseFloat(frequency);
    }

    if (level) {
      base.level = level as Level;
    }

    if (translations.length > 0) {
      base.translations = translations.split("|");
    }


    if (type === "noun") {
      const [gender, noArticle, singularOnly, pluralOnly, casesRaw] = raw.slice(5);

      const cases = casesRaw.split("|").reduce((acc, cur, i) => {
        const kase = Cases[Math.floor(i / Forms.length)];
        const form = Forms[i % Forms.length];

        if (!acc[kase]) {
          acc[kase] = {};
        }

        if (!acc[kase][form]) {
          acc[kase][form] = cur === "" ? null : cur.replace("=", lemma);
        }

        return acc;
      }, {} as { [key in Case]: { [key in Form]: string } });

      const noun: Noun = {
        ...base,
        gender: gender === "" ? null : gender,
        noArticle: noArticle === "t",
        singularOnly: singularOnly === "t",
        pluralOnly: pluralOnly === "t",
        cases: cases,
      }

      return noun;
    } else if (type === "verb") {
      const [separable, presentRaw, simpleRaw, conjunctive1Raw, conjunctive2Raw, imperativeDu, imperativeIhr, imperativeSie, perfect, gerund, zuinfinitive] = raw.slice(5);

      const replaceBits = (s: string) => {
        const fauxLemma = lemma.split("_").slice(-1)[0].slice(0, -2);

        let res = s?.replaceAll("=", fauxLemma);

        if (separable === "t") {
          res = res?.replaceAll("~", lemma.split("_")[0]);
        }

        return res ?? "";
      }

      const present = replaceBits(presentRaw).split("|");
      const simple = replaceBits(simpleRaw).split("|");
      const conjunctive1 = replaceBits(conjunctive1Raw).split("|");
      const conjunctive2 = replaceBits(conjunctive2Raw).split("|");

      const verb: Verb = {
        ...base,
        separable: separable === "t",
        present: Object.fromEntries(Pronouns.map((pronoun, i) => [pronoun, present[i]])),
        simple: Object.fromEntries(Pronouns.map((pronoun, i) => [pronoun, simple[i]])),
        conjunctive1: Object.fromEntries(Pronouns.map((pronoun, i) => [pronoun, conjunctive1[i]])),
        conjunctive2: Object.fromEntries(Pronouns.map((pronoun, i) => [pronoun, conjunctive2[i]])),
        imperative: null,
        perfect: replaceBits(perfect),
        gerund: replaceBits(gerund),
        zuinfinitive: replaceBits(zuinfinitive),
      };

      if (imperativeDu !== "") {
        verb.imperative = {
          du: replaceBits(imperativeDu),
          ihr: replaceBits(imperativeIhr),
          Sie: replaceBits(imperativeSie),
        };
      }

      return verb;
    } else if (type === "adjective") {
      const [singularOnly, pluralOnly, predicativeOnly, absolute, notDeclinable, noMixed, strongRaw, weakRaw, mixedRaw, comparative, isComparative, noComparative, superlative, isSuperlative, superlativeOnly, commonNounsRaw] = raw.slice(5);

      const fauxLemma = lemma.endsWith("sten") ? lemma.slice(0, -4) : lemma;

      const strong = strongRaw.replaceAll("=", fauxLemma).split("|").reduce((acc, cur, i) => {
        const kase = Cases[Math.floor(i / GenderedForms.length)];
        const form = GenderedForms[i % GenderedForms.length];

        if (!acc[kase]) {
          acc[kase] = {};
        }

        if (!acc[kase][form]) {
          acc[kase][form] = cur === "" ? null : cur.replace("=", lemma);
        }

        return acc;
      }, {} as { [key in Case]: { [key in GenderedForm]: string } });

      const weak = weakRaw.replaceAll("=", fauxLemma).split("|").reduce((acc, cur, i) => {
        const kase = Cases[Math.floor(i / GenderedForms.length)];
        const form = GenderedForms[i % GenderedForms.length];

        if (!acc[kase]) {
          acc[kase] = {};
        }

        if (!acc[kase][form]) {
          acc[kase][form] = cur === "" ? null : cur.replace("=", lemma);
        }

        return acc;
      }, {} as { [key in Case]: { [key in GenderedForm]: string } });

      const mixed = mixedRaw.replaceAll("=", fauxLemma).split("|").reduce((acc, cur, i) => {
        const kase = Cases[Math.floor(i / GenderedForms.length)];
        const form = GenderedForms[i % GenderedForms.length];

        if (!acc[kase]) {
          acc[kase] = {};
        }

        if (!acc[kase][form]) {
          acc[kase][form] = cur === "" ? null : cur.replace("=", lemma);
        }

        return acc;
      }, {} as { [key in Case]: { [key in GenderedForm]: string } });

      const adjective: Adjective = {
        ...base,
        singularOnly: singularOnly === "t",
        pluralOnly: pluralOnly === "t",
        predicativeOnly: predicativeOnly === "t",
        absolute: absolute === "t",
        notDeclinable: notDeclinable === "t",
        noMixed: noMixed === "t",
        strong,
        weak,
        mixed,
        isComparative: isComparative === "t",
        noComparative: noComparative === "t",
        isSuperlative: isSuperlative === "t",
        superlativeOnly: superlativeOnly === "t",
      }

      if (comparative) {
        adjective.comparative = comparative.replaceAll("=", fauxLemma);
      }

      if (superlative) {
        adjective.superlative = superlative.replaceAll("=", fauxLemma);
      }

      if (commonNounsRaw) {
        adjective.commonNouns = commonNounsRaw.split("|");
      }

      return adjective;
    }
  });

  return result;
};