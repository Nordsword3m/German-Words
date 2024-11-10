// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const keys = <Type extends string>(obj: { [key in Type]: any }) => Object.keys(obj) as Type[];
export const entries = <KeyType extends string, ValueType>(obj: { [key in KeyType]: ValueType }) =>
  Object.entries(obj) as [KeyType, ValueType][];
export const fromEntries = <KeyType extends string, ValueType>(e: [KeyType, ValueType][]) =>
  Object.fromEntries(e) as { [key in KeyType]: ValueType };

export const filterObject = <Type>(
  obj: { [key: string]: Type },
  condition: (k: string, v: Type) => boolean
): { [key: string]: Type } => {
  return fromEntries(entries(obj).filter(([k, v]) => condition(k, v)));
};

export const filterObjectFalsey = <Type>(obj: {
  [key: string]: Type | false | null | undefined;
}): { [key: string]: Type } => {
  return filterObject(obj, (_, v) => Boolean(v)) as { [key: string]: Type };
};

export const mapObject = <keyVal extends string, oldVal, newVal>(
  obj: { [k in keyVal]: oldVal },
  func: (k: keyVal, v: oldVal) => [keyVal, newVal]
) => {
  return fromEntries(entries(obj).map(([k, v]) => func(k, v)));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const flattenObject = (obj: { [key: string]: any }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: { [key: string]: any } = {};

  for (const i in obj) {
    if (typeof obj[i] === 'object' && !Array.isArray(obj[i])) {
      const temp = flattenObject(obj[i]);
      for (const j in temp) {
        result[i + '.' + j] = temp[j];
      }
    } else {
      result[i] = obj[i];
    }
  }
  return result;
};

export const getAllValues = (obj: object): string[] => {
  return Object.values(flattenObject(obj));
};

export const filterFalsey = <Type>(arr: (Type | false | null | undefined)[]): Type[] => arr.filter(Boolean) as Type[];

export const removeEmojis = (text: string): string => text.replaceAll(/[^\p{L}\p{N}\p{P}\p{Z}^$\n+]/gu, '');
