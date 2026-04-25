# SuperContext

An ergonomic superset of React's Context API for butter smooth dependency injection 🧈

## Overview

`supercontext` extends React's Context API with:

- ✅ Better TypeScript inference than native Context API
- ✅ Automatic error handling for missing providers
- ✅ Enhanced base context providers with `addRoot`
- ✅ Easy access to multiple contexts
- ✅ Lazy initialization of default values
- ✅ Zero dependencies (only uses React)

## Requirements

- React 19 or above

## Installation

```bash
pnpm add supercontext
```

## Usage

### Basic Context Creation

```tsx
import { createSuperContext } from "supercontext";

// Context that requires a provider
const UserContext = createSuperContext<{ name: string; email: string }>({
  notProvidedMessage: "User context not provided",
});

// Context with default value
const ThemeContext = createSuperContext<"light" | "dark">({
  initialValue: "light",
});

// Context with lazy initialization
const ConfigContext = createSuperContext<AppConfig>({
  getInitialValue: () => loadConfigFromStorage(),
});
```

### Using Contexts

```tsx
function UserProfile() {
  const user = UserContext.useProvided();

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Consumer pattern (alternative to hook)
function UserDisplay() {
  return <UserContext.Consumer>{(user) => <div>{user.name}</div>}</UserContext.Consumer>;
}
```

### Root Components with `addRoot`

Create root components that automatically provide context values:

```tsx
import { createSuperContext, addRoot } from "supercontext";

const Environment = addRoot(
  createSuperContext<NebulyEnvironment>({
    notProvidedMessage: "Environment not provided",
  }),
  (Provider) => {
    return ({ children }) => {
      const env = getEnvironmentValues();
      return <Provider value={env}>{children}</Provider>;
    };
  },
);

// Usage - just use the Root component
function App() {
  return (
    <Environment.Root>
      <YourApp />
    </Environment.Root>
  );
}

// Access the context anywhere
function Component() {
  const env = Environment.useProvided();
  return <div>{env.apiUrl}</div>;
}
```

### Working with Multiple Contexts

Use `useProviders` to access multiple contexts at once:

```tsx
import { useProviders } from "supercontext";

function MyComponent() {
  const [user, theme, environment] = useProviders([UserContext, ThemeContext, Environment]);

  return (
    <div className={theme}>
      <h1>{user.name}</h1>
      <p>API: {environment.apiUrl}</p>
    </div>
  );
}
```

### Providers Component

Use the `Providers` component for cleaner conditional rendering with multiple contexts:

```tsx
import { Providers } from "supercontext";

function DataDisplay() {
  return (
    <Providers deps={[UserContext, ProjectContext]}>
      {([user, project]) => (
        <div>
          <h1>{user.name}</h1>
          <h2>{project.name}</h2>
        </div>
      )}
    </Providers>
  );
}
```

## Real-World Examples

### Environment Configuration

```tsx
import { createSuperContext, addRoot } from "supercontext";

type NebulyEnvironment = {
  apiUrl: string;
  environment: "development" | "production";
  flags?: Record<string, boolean>;
};

export const Environment = addRoot(
  createSuperContext<NebulyEnvironment>({
    notProvidedMessage: "Environment not provided",
  }),
  (Provider) => {
    return ({ children }) => {
      const env = getEnvironmentValues();
      return <Provider value={env}>{children}</Provider>;
    };
  },
);

// Usage
function App() {
  return (
    <Environment.Root>
      <Router />
    </Environment.Root>
  );
}

function ApiClient() {
  const { apiUrl } = Environment.useProvided();
  // Use apiUrl to configure API client
}
```

### Theme Context

```tsx
import { createSuperContext, addRoot } from "supercontext";

export const Theme = addRoot(
  createSuperContext<"light" | "dark" | "system">({
    initialValue: "system",
  }),
  (Provider) => {
    return ({ children, defaultTheme = "system" }) => {
      const [theme, setTheme] = useState(defaultTheme);
      return <Provider value={theme}>{children}</Provider>;
    };
  },
);

// Usage
function App() {
  return (
    <Theme.Root defaultTheme="light">
      <YourApp />
    </Theme.Root>
  );
}
```

### Combining Multiple Contexts

```tsx
import { useProviders, Providers } from "supercontext";

// Access multiple contexts
function Dashboard() {
  const [user, project, environment] = useProviders([UserContext, ProjectContext, Environment]);

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Project: {project.name}</p>
      <p>Environment: {environment.environment}</p>
    </div>
  );
}

// Or use Providers component for conditional rendering
function ConditionalContent() {
  return (
    <Providers deps={[UserContext, FeatureFlags]}>
      {([user, flags]) => {
        if (flags.isAdmin && user.role === "admin") {
          return <AdminPanel />;
        }
        return <RegularContent />;
      }}
    </Providers>
  );
}
```

### Formatters with Locale

```tsx
import { createSuperContext, addRoot } from "supercontext";
import { DateFormatter, NumberFormatter, TimeFormatter } from "formatters";

export const Formatters = addRoot(
  createSuperContext<{
    numberFmt: NumberFormatter;
    timeFmt: TimeFormatter;
    dateFmt: DateFormatter;
  }>({
    notProvidedMessage: "Formatters are not provided",
  }),
  (Provider) => {
    return ({ children }) => {
      const { language } = Localization.useProvided();
      return (
        <Provider
          value={{
            numberFmt: new NumberFormatter({ locale: language }),
            timeFmt: new TimeFormatter({ locale: language }),
            dateFmt: new DateFormatter({ locale: language }),
          }}
        >
          {children}
        </Provider>
      );
    };
  },
);

// Usage
function PriceDisplay({ amount }: { amount: number }) {
  const { numberFmt } = Formatters.useProvided();
  return <span>{numberFmt.compactFloat(amount)}</span>;
}
```

## API Reference

### `createSuperContext<T>(options)`

Creates a super context with enhanced features.

**Options:**

- `initialValue: T`: Default value (context is always provided)
- `getInitialValue: () => T`: Lazy initialization function
- `notProvidedMessage: string`: Error message if provider is missing

**Returns:**

- `Provider`: React context provider component
- `Consumer`: React context consumer component
- `useProvided()`: Hook to access context value

### `addRoot<T, U>(context, rootFactory)`

Creates a root component for a context.

**Parameters:**

- `context`: A super context
- `rootFactory`: Function that takes Provider and returns a root component

**Returns:** Context with added `Root` component

### `useProviders<T>(deps)`

Hook to access multiple contexts at once.

**Parameters:**

- `deps`: Array of super contexts

**Returns:** Tuple of context values (typed)

### `Providers<T>(props)`

Component for conditional rendering with multiple contexts.

**Props:**

- `deps`: Array of super contexts
- `children`: Render function receiving context values

### `MissingProviderError`

Error class thrown when a required context is not provided.

## Error Handling

When a context is required but not provided, a `MissingProviderError` is thrown:

```typescript
import { MissingProviderError } from "supercontext";

try {
  const user = UserContext.useProvided();
} catch (error) {
  if (error instanceof MissingProviderError) {
    console.error("User context not provided");
  }
}
```
