type Predicate<T> = (x: T) => boolean;

/**
 * Usage:
 * ```typescript
 * const factory = when(something)
 *   .match( (x) => someLogicReturningTrue )
 *   .then( () => anyLogicToProduceResult )
 *   .byDefault( () => defaultLogicWhenNoMatches )
 *
 * // later in code
 * const result = factory.make()
 * ```
 * @param subject
 */
export function when<T>(subject: T) {
  let factories: {
    pred: Predicate<T>;
    factory: Function;
  }[] = [];

  let predicateQueued: Predicate<T> | null = null;
  let defaultFactory: Function | null = null;

  const matcher = {
    match: (predicate: Predicate<T>) => {
      predicateQueued = predicate;
      return matcher;
    },

    then: (factory: Function) => {
      if (predicateQueued === null) {
        throw "Missing .is() call before .then()";
      }
      factories.push({
        pred: predicateQueued,
        factory: factory,
      });
      predicateQueued = null;
      return matcher;
    },

    byDefault: (factory: Function) => {
      defaultFactory = factory;
      return matcher;
    },

    make: (): string => {
      if (defaultFactory === null) {
        throw "Use .byDefault() as a default factory";
      }
      const found = factories.find(({ pred }) => pred(subject));
      if (found) {
        return found.factory();
      }
      return defaultFactory();
    },
  };

  return matcher;
}
