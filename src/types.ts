export type SuperContext<T> = {
  Provider: React.Provider<T>;
  Consumer: React.ComponentType<{
    children: (value: T) => React.ReactNode;
  }>;
  useProvided: () => T;
};

export type Rooted<T, U> = T & {
  Root: React.ComponentType<U>;
};
