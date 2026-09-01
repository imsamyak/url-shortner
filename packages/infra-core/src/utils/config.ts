
type ConfigFactory = (namespace: string) => unknown;
type EnvironmentConfigs = Readonly<Record<string, ConfigFactory>>;
type ConfigRegistry = Readonly<Record<string, EnvironmentConfigs>>;

type ConfigName<Configs extends ConfigRegistry> = Extract<
    {
        [Environment in keyof Configs]: keyof Configs[Environment];
    }[keyof Configs],
    string
>;

type ConfigBuilder<
    Configs extends ConfigRegistry,
    Name extends ConfigName<Configs>,
> = Extract<
    {
        [Environment in keyof Configs]: Name extends keyof Configs[Environment]
        ? Configs[Environment][Name]
        : never;
    }[keyof Configs],
    ConfigFactory
>;

type LoadedConfig<
    Configs extends ConfigRegistry,
    Name extends ConfigName<Configs>,
> = ReturnType<
    ConfigBuilder<Configs, Name>
>;

function hasOwn<Container extends object, Key extends PropertyKey>(
    container: Container,
    key: Key,
): key is Key & keyof Container {
    return Object.hasOwn(container, key);
}

export function buildConfigLoader<const Configs extends ConfigRegistry>(
    configRegistry: Configs,
) {
    return function loadConfig<Name extends ConfigName<Configs>>(
        env: string,
        name: Name,
        namespace: string,
    ): LoadedConfig<Configs, Name> {
        if (!hasOwn(configRegistry, env)) {
            throw new Error(
                `Environment "${env}" is not configured. Available environments: ${Object.keys(configRegistry).join(", ")}.`,
            );
        }

        const environmentConfig = configRegistry[env];

        if (!hasOwn(environmentConfig, name)) {
            throw new Error(
                `Config "${name}" does not exist in environment "${env}".`,
            );
        }

        const configBuilder: unknown = Reflect.get(environmentConfig, name);

        if (typeof configBuilder !== "function") {
            throw new TypeError(
                `Config "${name}" in environment "${env}" must be a function.`,
            );
        }

        // Runtime checks establish the correlation that TypeScript cannot retain
        // when both the environment and property name are selected dynamically.
        return (
            configBuilder as (
                resolvedNamespace: string,
            ) => LoadedConfig<Configs, Name>
        )(namespace);
    };
}

export default buildConfigLoader;