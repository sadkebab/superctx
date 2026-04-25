import { createContext, use } from "react";
import type { PropsWithChildren } from "react";
import type { Rooted, SuperContext } from "./types";
import { MissingProviderError } from "./errors";

type InitialValue<T> =
  | { initialValue: T }
  | { getInitialValue: () => T }
  | { notProvidedMessage: string };

export function createSuperContext<T>(options: InitialValue<T>): SuperContext<T> {
  const initialValue = "initialValue" in options ? options.initialValue : null;
  const ReactContext = createContext<T | null>(initialValue);

  const useProvided: () => T = () => {
    const context = use(ReactContext);

    if (context === null && "getInitialValue" in options) {
      return options.getInitialValue();
    }

    if (context === null && "notProvidedMessage" in options) {
      throw new MissingProviderError(options.notProvidedMessage);
    }

    return context as T;
  };

  const Consumer = ({ children }: { children: (value: T) => React.ReactNode }) => {
    const value = useProvided();
    return children(value);
  };

  return {
    Provider: ReactContext.Provider,
    Consumer,
    useProvided,
  };
}

export function addRoot<T, U extends PropsWithChildren = PropsWithChildren>(
  context: SuperContext<T>,
  root: (Provider: React.Provider<T>) => React.ComponentType<U>,
): Rooted<SuperContext<T>, U> {
  return {
    ...context,
    Root: root(context.Provider),
  };
}
