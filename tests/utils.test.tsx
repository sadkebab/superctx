import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { createSuperContext } from "../src/superctx";
import { useProviders, Consumer } from "../src/utils";

afterEach(() => {
  cleanup();
});

describe("resolve", () => {
  it("should resolve single context value", () => {
    const context1 = createSuperContext({
      initialValue: "value1",
    });

    const TestComponent = () => {
      const values = useProviders([context1]);
      return <div>{values[0]}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByText("value1")).toBeDefined();
  });

  it("should resolve multiple context values", () => {
    const context1 = createSuperContext({
      initialValue: "value1",
    });
    const context2 = createSuperContext({
      initialValue: 42,
    });
    const context3 = createSuperContext({
      initialValue: { name: "test" },
    });

    const TestComponent = () => {
      const values = useProviders([context1, context2, context3]);
      return (
        <div>
          {values[0]}-{values[1]}-{values[2].name}
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByText("value1-42-test")).toBeDefined();
  });

  it("should resolve values from Providers", () => {
    const context1 = createSuperContext({
      initialValue: "initial1",
    });
    const context2 = createSuperContext({
      initialValue: "initial2",
    });

    const TestComponent = () => {
      const values = useProviders([context1, context2]);
      return (
        <div>
          {values[0]}-{values[1]}
        </div>
      );
    };

    render(
      <context1.Provider value="provided1">
        <context2.Provider value="provided2">
          <TestComponent />
        </context2.Provider>
      </context1.Provider>,
    );

    expect(screen.getByText("provided1-provided2")).toBeDefined();
  });

  it("should work with getInitialValue option", () => {
    const context1 = createSuperContext({
      getInitialValue: () => "computed1",
    });
    const context2 = createSuperContext({
      getInitialValue: () => "computed2",
    });

    const TestComponent = () => {
      const values = useProviders([context1, context2]);
      return (
        <div>
          {values[0]}-{values[1]}
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByText("computed1-computed2")).toBeDefined();
  });

  it("should handle empty array", () => {
    const values = useProviders([]);

    expect(values).toEqual([]);
  });

  it("should preserve order of contexts", () => {
    const context1 = createSuperContext({
      initialValue: "first",
    });
    const context2 = createSuperContext({
      initialValue: "second",
    });
    const context3 = createSuperContext({
      initialValue: "third",
    });

    const TestComponent = () => {
      const values = useProviders([context1, context2, context3]);
      return (
        <div>
          {values[0]}-{values[1]}-{values[2]}
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByText("first-second-third")).toBeDefined();
  });
});

describe("Resolver component", () => {
  it("should render children with resolved values", () => {
    const context1 = createSuperContext({
      initialValue: "value1",
    });
    const context2 = createSuperContext({
      initialValue: "value2",
    });

    render(
      <Consumer providers={[context1, context2]}>
        {(values) => (
          <div>
            {values[0]}-{values[1]}
          </div>
        )}
      </Consumer>,
    );

    expect(screen.getByText("value1-value2")).toBeDefined();
  });

  it("should work with multiple contexts of different types", () => {
    const context1 = createSuperContext({
      initialValue: "string",
    });
    const context2 = createSuperContext({
      initialValue: 42,
    });
    const context3 = createSuperContext({
      initialValue: true,
    });

    render(
      <Consumer providers={[context1, context2, context3]}>
        {(values) => (
          <div>
            {values[0]}-{values[1]}-{String(values[2])}
          </div>
        )}
      </Consumer>,
    );

    expect(screen.getByText("string-42-true")).toBeDefined();
  });

  it("should use Provider values when available", () => {
    const context1 = createSuperContext({
      initialValue: "initial1",
    });
    const context2 = createSuperContext({
      initialValue: "initial2",
    });

    render(
      <context1.Provider value="provided1">
        <context2.Provider value="provided2">
          <Consumer providers={[context1, context2]}>
            {(values) => (
              <div>
                {values[0]}-{values[1]}
              </div>
            )}
          </Consumer>
        </context2.Provider>
      </context1.Provider>,
    );

    expect(screen.getByText("provided1-provided2")).toBeDefined();
  });

  it("should work with getInitialValue option", () => {
    const context1 = createSuperContext({
      getInitialValue: () => "computed1",
    });
    const context2 = createSuperContext({
      getInitialValue: () => "computed2",
    });

    render(
      <Consumer providers={[context1, context2]}>
        {(values) => (
          <div>
            {values[0]}-{values[1]}
          </div>
        )}
      </Consumer>,
    );

    expect(screen.getByText("computed1-computed2")).toBeDefined();
  });

  it("should handle single context", () => {
    const context1 = createSuperContext({
      initialValue: "single",
    });

    render(<Consumer providers={[context1]}>{(values) => <div>{values[0]}</div>}</Consumer>);

    expect(screen.getByText("single")).toBeDefined();
  });

  it("should handle empty deps array", () => {
    render(<Consumer providers={[]}>{(values) => <div>Count: {values.length}</div>}</Consumer>);

    expect(screen.getByText("Count: 0")).toBeDefined();
  });

  it("should work with nested Providers", () => {
    const context1 = createSuperContext({
      initialValue: "outer",
    });
    const context2 = createSuperContext({
      initialValue: "inner",
    });

    render(
      <context1.Provider value="outer-provided">
        <context2.Provider value="inner-provided">
          <Consumer providers={[context1, context2]}>
            {(values) => (
              <div>
                {values[0]}-{values[1]}
              </div>
            )}
          </Consumer>
        </context2.Provider>
      </context1.Provider>,
    );

    expect(screen.getByText("outer-provided-inner-provided")).toBeDefined();
  });

  it("should work with complex object values", () => {
    const context1 = createSuperContext({
      initialValue: { name: "test", id: 1 },
    });
    const context2 = createSuperContext({
      initialValue: { count: 42 },
    });

    render(
      <Consumer providers={[context1, context2]}>
        {(values) => (
          <div>
            {values[0].name}-{values[0].id}-{values[1].count}
          </div>
        )}
      </Consumer>,
    );

    expect(screen.getByText("test-1-42")).toBeDefined();
  });
});
