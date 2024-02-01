import { DynamicModule, Module, OnApplicationBootstrap } from '@nestjs/common';
import { CommandBus } from './command-bus';
import { EventBus } from './event-bus';
import { EventPublisher } from './event-publisher';
import { IEvent } from './interfaces';
import { QueryBus } from './query-bus';
import { ExplorerService } from './services/explorer.service';
import { UnhandledExceptionBus } from './unhandled-exception-bus';
import { CommandInterceptionExecutor } from './command-interception-executor';

@Module({
  providers: [
    CommandBus,
    QueryBus,
    EventBus,
    UnhandledExceptionBus,
    EventPublisher,
    ExplorerService,
    CommandInterceptionExecutor,
  ],
  exports: [
    CommandBus,
    QueryBus,
    EventBus,
    UnhandledExceptionBus,
    EventPublisher,
  ],
})
export class CqrsModule<EventBase extends IEvent = IEvent>
  implements OnApplicationBootstrap
{
  /**
   * Registers the CQRS Module globally.
   * @returns DynamicModule
   */
  static forRoot(): DynamicModule {
    return {
      module: CqrsModule,
      global: true,
    };
  }

  constructor(
    private readonly explorerService: ExplorerService<EventBase>,
    private readonly eventBus: EventBus<EventBase>,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly commandInterceptor: CommandInterceptionExecutor,
  ) {}

  onApplicationBootstrap() {
    const { events, queries, sagas, commands, interceptors } =
      this.explorerService.explore();

    this.eventBus.register(events);
    this.commandBus.register(commands);
    this.queryBus.register(queries);
    this.eventBus.registerSagas(sagas);
    this.commandInterceptor.register(interceptors);
  }
}
