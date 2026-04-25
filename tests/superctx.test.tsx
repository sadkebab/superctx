import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { useState } from "react";
import type { PropsWithChildren } from "react";
import { createSuperContext, addRoot } from "../src/superctx";
import { MissingProviderError } from "../src/errors";

afterEach(() => {
  cleanup();
});

describe("createSuperContext", () => {
  describe("with initialValue option", () => {
    it("should create a context with initial value", () => {
      const context = createSuperContext({
        initialValue: "test-value",
      });

      const TestComponent = () => {
        const value = context.useProvided();
        return <div>{value}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText("test-value")).toBeDefined();
    });

    it("should allow Provider to override initial value", () => {
      const context = createSuperContext({
        initialValue: "initial",
      });

      const TestComponent = () => {
        const value = context.useProvided();
        return <div>{value}</div>;
      };

      render(
        <context.Provider value="provided">
          <TestComponent />
        </context.Provider>,
      );

      expect(screen.getByText("provided")).toBeDefined();
    });

    it("should use initial value when no Provider is present", () => {
      const context = createSuperContext({
        initialValue: "default-value",
      });

      const TestComponent = () => {
        const value = context.useProvided();
        return <div>{value}</div>;
      };

      render(<TestComponent />);

      expect(screen.getByText("default-value")).toBeDefined();
    });
  });

  describe("with getInitialValue option", () => {
    it("should call getInitialValue when context is null", () => {
      const getInitialValue = vi.fn(() => "computed-value");
      const context = createSuperContext({
        getInitialValue,
      });

      const TestComponent = () => {
        const value = context.useProvided();
        return <div>{value}</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText("computed-value")).toBeDefined();
      expect(getInitialValue).toHaveBeenCalledTimes(1);
    });

    it("should not call getInitialValue when Provider provides value", () => {
      const getInitialValue = vi.fn(() => "computed-value");
      const context = createSuperContext({
        getInitialValue,
      });

      const TestComponent = () => {
        const value = context.useProvided();
        return <div>{value}</div>;
      };

      render(
        <context.Provider value="provided-value">
          <TestComponent />
        </context.Provider>,
      );

      expect(screen.getByText("provided-value")).toBeDefined();
      expect(getInitialValue).not.toHaveBeenCalled();
    });

    it("should call getInitialValue for each access when no Provider", () => {
      const getInitialValue = vi.fn(() => "computed-value");
      const context = createSuperContext({
        getInitialValue,
      });

      const TestComponent = () => {
        const value1 = context.useProvided();
        const value2 = context.useProvided();
        return (
          <div>
            {value1}-{value2}
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByText("computed-value-computed-value")).toBeDefined();
      expect(getInitialValue).toHaveBeenCalledTimes(2);
    });
  });

  describe("with throwMessage option", () => {
    it("should throw MissingProviderError when no Provider is present", () => {
      const context = createSuperContext({
        notProvidedMessage: "Context provider is required",
      });

      const TestComponent = () => {
        const value = context.useProvided() as string;
        return <div>{value}</div>;
      };

      expect(() => render(<TestComponent />)).toThrow(MissingProviderError);
    });

    it("should not throw when Provider is present", () => {
      const context = createSuperContext({
        notProvidedMessage: "Context provider is required",
      });

      const TestComponent = () => {
        const value = context.useProvided() as string;
        return <div>{value}</div>;
      };

      render(
        <context.Provider value="provided-value">
          <TestComponent />
        </context.Provider>,
      );

      expect(screen.getByText("provided-value")).toBeDefined();
    });

    it("should throw error with custom message", () => {
      const context = createSuperContext({
        notProvidedMessage: "Custom error message",
      });

      const TestComponent = () => {
        try {
          const value = context.useProvided() as string;
          return <div>{value}</div>;
        } catch (error) {
          expect(error).toBeInstanceOf(MissingProviderError);
          expect((error as Error).message).toBe("Custom error message");
          throw error;
        }
      };

      expect(() => render(<TestComponent />)).toThrow(MissingProviderError);
    });
  });

  describe("Consumer component", () => {
    it("should render children with context value", () => {
      const context = createSuperContext({
        initialValue: "consumer-value",
      });

      render(<context.Consumer>{(value) => <div>Value: {value}</div>}</context.Consumer>);

      expect(screen.getByText("Value: consumer-value")).toBeDefined();
    });

    it("should use Provider value when available", () => {
      const context = createSuperContext({
        initialValue: "initial",
      });

      render(
        <context.Provider value="provided">
          <context.Consumer>{(value) => <div>Value: {value}</div>}</context.Consumer>
        </context.Provider>,
      );

      expect(screen.getByText("Value: provided")).toBeDefined();
    });

    it("should work with getInitialValue option", () => {
      const context = createSuperContext({
        getInitialValue: () => "computed",
      });

      render(<context.Consumer>{(value) => <div>Value: {value}</div>}</context.Consumer>);

      expect(screen.getByText("Value: computed")).toBeDefined();
    });
  });

  describe("with complex types", () => {
    it("should work with object values", () => {
      const context = createSuperContext({
        initialValue: { name: "test", count: 42 },
      });

      const TestComponent = () => {
        const value = context.useProvided();
        return (
          <div>
            {value.name}-{value.count}
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByText("test-42")).toBeDefined();
    });

    it("should work with null values when explicitly provided", () => {
      const context = createSuperContext({
        initialValue: null as string | null,
      });

      const TestComponent = () => {
        const value = context.useProvided();
        return <div>{value === null ? "null" : value}</div>;
      };

      render(<TestComponent />);

      expect(screen.getByText("null")).toBeDefined();
    });
  });
});

describe("rooted", () => {
  it("should create a Root component from Provider", () => {
    // Create Root inside a component to avoid accessing Value during rooted call
    const TestWrapper = () => {
      const context = createSuperContext({
        initialValue: "initial",
      });

      const Root = addRoot(context, (Provider) => {
        return ({ children }) => {
          const [state] = useState("rooted-value");

          return <Provider value={state}>{children}</Provider>;
        };
      });

      const TestComponent = () => {
        const value = context.useProvided() as string;
        return <div>{value}</div>;
      };

      const RootComponent = Root.Root;

      return (
        <RootComponent>
          <TestComponent />
        </RootComponent>
      );
    };

    render(<TestWrapper />);
    expect(screen.getByText("rooted-value")).toBeDefined();
  });

  it("should preserve all context properties", () => {
    const TestWrapper = () => {
      const context = createSuperContext({
        initialValue: "initial",
      });
      const Root = addRoot(context, (Provider) => {
        return ({ children }) => <Provider value="rooted">{children}</Provider>;
      });

      // Test that Root.Root works (Provider functionality)
      const TestComponent1 = () => {
        const value = context.useProvided() as string;
        return <div>{value}</div>;
      };

      // const RootComponent = Root.Root;
      return (
        <Root.Root>
          <TestComponent1 />
        </Root.Root>
      );
    };

    render(<TestWrapper />);
    expect(screen.getByText("rooted")).toBeDefined();

    // Test that Consumer works
    const TestComponent2 = () => {
      const context = createSuperContext({
        initialValue: "initial",
      });
      const Root = addRoot(context, (Provider) => {
        return ({ children }) => <Provider value="test">{children}</Provider>;
      });
      return <Root.Consumer>{(value) => <div>Consumer: {value}</div>}</Root.Consumer>;
    };
    render(<TestComponent2 />);
    expect(screen.getByText("Consumer: initial")).toBeDefined();
  });

  it("should allow Root to accept custom props", () => {
    const context = createSuperContext({
      initialValue: "initial",
    });

    const TestWrapper = () => {
      const Root = addRoot(context, (Provider) => {
        return ({ prefix, children }: PropsWithChildren<{ prefix: string }>) => (
          <Provider value={`${prefix}-value`}>{children}</Provider>
        );
      });

      const TestComponent = () => {
        const value = context.useProvided() as string;
        return <div>{value}</div>;
      };

      const RootComponent = Root.Root;
      return (
        <RootComponent prefix="custom">
          <TestComponent />
        </RootComponent>
      );
    };

    render(<TestWrapper />);
    expect(screen.getByText("custom-value")).toBeDefined();
  });
});
