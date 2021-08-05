import { interfaces } from 'inversify';
import {
  createPreferenceProxy,
  PreferenceProxy,
  PreferenceService,
  PreferenceContribution,
  PreferenceSchema,
} from '@theia/core/lib/browser/preferences';
import { CompilerWarningLiterals, CompilerWarnings } from '../common/protocol';

export const ArduinoConfigSchema: PreferenceSchema = {
  type: 'object',
  properties: {
    'arduino.language.log': {
      type: 'boolean',
      description:
        "True if the Arduino Language Server should generate log files into the sketch folder. Otherwise, false. It's false by default.",
      default: false,
    },
    'arduino.compile.verbose': {
      type: 'boolean',
      description: 'True for verbose compile output. False by default',
      default: false,
    },
    'arduino.compile.warnings': {
      enum: [...CompilerWarningLiterals],
      description:
        "Tells gcc which warning level to use. It's 'None' by default",
      default: 'None',
    },
    'arduino.upload.verbose': {
      type: 'boolean',
      description: 'True for verbose upload output. False by default.',
      default: false,
    },
    'arduino.upload.verify': {
      type: 'boolean',
      default: false,
    },
    'arduino.window.autoScale': {
      type: 'boolean',
      description:
        'True if the user interface automatically scales with the font size.',
      default: true,
    },
    'arduino.window.zoomLevel': {
      type: 'number',
      description:
        'Adjust the zoom level of the window. The original size is 0 and each increment above (e.g. 1) or below (e.g. -1) represents zooming 20% larger or smaller. You can also enter decimals to adjust the zoom level with a finer granularity.',
      default: 0,
    },
    'arduino.ide.autoUpdate': {
      type: 'boolean',
      description:
        'True to enable automatic update checks. The IDE will check for updates automatically and periodically.',
      default: true,
    },
    'arduino.board.certificates': {
      type: 'string',
      description: 'List of certificates that can be uploaded to boards',
      default: '',
    },
    'arduino.sketchbook.showAllFiles': {
      type: 'boolean',
      description:
        'True to show all sketch files inside the sketch. It is false by default.',
      default: false,
    },
    'arduino.cloud.enabled': {
      type: 'boolean',
      description:
        'True if the sketch sync functions are enabled. Defaults to true.',
      default: true,
    },
    'arduino.cloud.pull.warn': {
      type: 'boolean',
      description:
        'True if users should be warned before pulling a cloud sketch. Defaults to true.',
      default: true,
    },
    'arduino.cloud.push.warn': {
      type: 'boolean',
      description:
        'True if users should be warned before pushing a cloud sketch. Defaults to true.',
      default: true,
    },
    'arduino.cloud.pushpublic.warn': {
      type: 'boolean',
      description:
        'True if users should be warned before pushing a public sketch to the cloud. Defaults to true.',
      default: true,
    },
    'arduino.cloud.sketchSyncEnpoint': {
      type: 'string',
      description:
        'The endpoint used to push and pull sketches from a backend. By default it points to Arduino Cloud API.',
      default: 'https://api2.arduino.cc/create',
    },
    'arduino.auth.clientID': {
      type: 'string',
      description: 'The OAuth2 client ID.',
      default: 'C34Ya6ex77jTNxyKWj01lCe1vAHIaPIo',
    },
    'arduino.auth.domain': {
      type: 'string',
      description: 'The OAuth2 domain.',
      default: 'login.arduino.cc',
    },
    'arduino.auth.audience': {
      type: 'string',
      description: 'The 0Auth2 audience.',
      default: 'https://api.arduino.cc',
    },
    'arduino.auth.registerUri': {
      type: 'string',
      description: 'The URI used to register a new user.',
      default: 'https://auth.arduino.cc/login#/register',
    },
  },
};

export interface ArduinoConfiguration {
  'arduino.language.log': boolean;
  'arduino.compile.verbose': boolean;
  'arduino.compile.warnings': CompilerWarnings;
  'arduino.upload.verbose': boolean;
  'arduino.upload.verify': boolean;
  'arduino.window.autoScale': boolean;
  'arduino.window.zoomLevel': number;
  'arduino.ide.autoUpdate': boolean;
  'arduino.board.certificates': string;
  'arduino.sketchbook.showAllFiles': boolean;
  'arduino.cloud.enabled': boolean;
  'arduino.cloud.pull.warn': boolean;
  'arduino.cloud.push.warn': boolean;
  'arduino.cloud.pushpublic.warn': boolean;
  'arduino.cloud.sketchSyncEnpoint': string;
  'arduino.auth.clientID': string;
  'arduino.auth.domain': string;
  'arduino.auth.audience': string;
  'arduino.auth.registerUri': string;
}

export const ArduinoPreferences = Symbol('ArduinoPreferences');
export type ArduinoPreferences = PreferenceProxy<ArduinoConfiguration>;

export function createArduinoPreferences(
  preferences: PreferenceService
): ArduinoPreferences {
  return createPreferenceProxy(preferences, ArduinoConfigSchema);
}

export function bindArduinoPreferences(bind: interfaces.Bind): void {
  bind(ArduinoPreferences).toDynamicValue((ctx) => {
    const preferences = ctx.container.get<PreferenceService>(PreferenceService);
    return createArduinoPreferences(preferences);
  });
  bind(PreferenceContribution).toConstantValue({
    schema: ArduinoConfigSchema,
  });
}
