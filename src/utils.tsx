import type { SuperContext } from "./types";
import type { ReactNode } from "react";

type AggregateConsumerProps<T extends readonly SuperContext<any>[]> = {
  deps: readonly [...T];
  children: (values: {
    [K in keyof T]: T[K] extends SuperContext<infer U> ? NonNullable<U> : never;
  }) => ReactNode;
};

export function Providers<T extends readonly SuperContext<any>[]>(
  props: AggregateConsumerProps<T>,
) {
  const contextValues = useProviders(props.deps);
  return props.children(contextValues as any);
}

export function useProviders<T extends readonly SuperContext<any>[]>(deps: readonly [...T]) {
  return deps.map((context) => context.useProvided()) as {
    [K in keyof T]: T[K] extends SuperContext<infer U> ? NonNullable<U> : never;
  };
}
