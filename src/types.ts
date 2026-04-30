export type SuperContext<T> = {
  Provider: React.Provider<T>;
  Consumer: React.ComponentType<{
    children: (value: T) => React.ReactNode;
  }>;
  useProvided: () => T;
};

export type Based<T, U> = T & {
  Base: React.ComponentType<U>;
};
