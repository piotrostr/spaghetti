import pinoPretty from 'pino-pretty';
import pino, { BaseLogger } from 'pino';

export { logger };
export type { Logger };

type Logger = BaseLogger & {
  child(bindings: pino.Bindings): Logger;
};

const logLevel =
  process.env.NODE_ENV === 'test' ? 'warn' : process.env.LOG_LEVEL ?? 'info';

const logger =
  process.env.NODE_ENV === 'production'
    ? pino({ level: logLevel })
    : pino(
        { level: logLevel },
        pinoPretty({
          levelFirst: true,
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
        })
      );
