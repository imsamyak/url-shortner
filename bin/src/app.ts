import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { App } from 'aws-cdk-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function pickConstructor(mod: any) {
  if (!mod) return null;
  if (typeof mod === 'function') return mod;
  if (mod.default && typeof mod.default === 'function') return mod.default;

  return null;
}

function parseArgs(): Record<string, string> {
  return process.argv.slice(2).reduce((acc: Record<string, string>, a) => {
    if (!a.startsWith('--')) return acc;
    const [k, v = ''] = a.slice(2).split('=');
    acc[k] = v;
    return acc;
  }, {});
}

async function loadModule<T = any>(filePath: string): Promise<T> {
  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(`${filePath}.ts`)) filePath = `${filePath}.ts`;
    else if (fs.existsSync(`${filePath}.js`)) filePath = `${filePath}.js`;
    else throw new Error(`Module not found: ${filePath}`);
  }
  const url = pathToFileURL(filePath).href;
  const mod = await import(url);
  return (mod.default ?? mod) as T;
}

async function main(): Promise<void> {
  const app = new App();

  const args = parseArgs();
  const realm: string = app.node.tryGetContext('realm') || args.realm || 'asgard';
  const environment: string =
    app.node.tryGetContext('environment') || args.environment || 'thor';
  const service: string = app.node.tryGetContext('service') || args.service || 'app';
  const stack: string = app.node.tryGetContext('stack') || args.stack || 'app';

  console.log('Parsed args:', { realm, environment, service, stack });

  console.log(
    `Instantiating app for realm="${realm}", environment="${environment}", service="${service}", stack="${stack}"`
  );

  // Load config from bin/src/config/<realm>/<environment>/<stack>.config
  const cfgPath: string = path.join(
    __dirname,
    'src',
    'config',
    realm,
    environment,
    `${stack}.config`
  );

  let config = await loadModule(cfgPath);
  if (config.default && typeof config.default === 'object') {
    config = config.default;
  }

  if (!config.name) {
    throw new Error(`Config is missing required "name" field: ${cfgPath}`);
  }

  // Add required config fields
  config.realm = realm;
  config.environment = environment;
  config.service = service;

  // Load stack module from bin/src/stacks/<stack>.stack
  const stackPath = path.join(
    __dirname,
    'src',
    'stacks',
    `${stack}.stack`
  );

  const StackClass = await loadModule(stackPath);
  const StackConstructor = pickConstructor(StackClass);

  // Build Stack name
  const stackName = `dls-${config.realm}-${config.environment}-${config.name}`;

  // Build Stack props
  const props = {
    ...config,
    env: { region: config.region || 'us-east-1' }
  };

  console.log(`Creating stack "${stackName}" with props:`, props);

  new StackConstructor(app, stackName, props);

  const assembly = app.synth();
  console.log('synth complete, assembly dir:', assembly.directory);
}

(async () => {
  try {
    await main();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
