// SPDX-License-Identifier: AGPL-3.0-or-later

export function newElements<T>(
  firstArray: T[],
  secondArray: T[],
  equalityPredicate: (a: T, b: T) => boolean,
): T[] {
  return secondArray.filter((secondArrayElement) => {
    const withinFirst = firstArray.some((firstArrayElement) =>
      equalityPredicate(firstArrayElement, secondArrayElement),
    );
    return !withinFirst;
  });
}

export function elementDiff<T>(
  firstArray: T[],
  secondArray: T[],
  equalityPredicate: (a: T, b: T) => boolean,
): { added: T[]; removed: T[] } {
  return {
    added: newElements(firstArray, secondArray, equalityPredicate),
    removed: newElements(secondArray, firstArray, equalityPredicate),
  };
}

export function quoteList(items: string[]) {
  return `'${items.join("', '")}'`;
}

// TODO: Update function to be safer and have better edge case handling
export function getByPath(
  object: Record<string, any> | undefined,
  path: string[],
): any | undefined {
  let objPointer = object;
  for (const pathElement of path) {
    if (objPointer === undefined) break;
    objPointer = objPointer[pathElement];
  }
  return objPointer;
}

export function range(
  start: number,
  stop: number,
  step: number = 1,
): Array<number> {
  return Array(Math.floor((stop - start) / step + 1))
    .fill(start)
    .map((_, index) => start + index * step);
}
