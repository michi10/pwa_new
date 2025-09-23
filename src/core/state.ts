export type Subscriber<T> = (value: T) => void;

export class Store<T> {
  private value: T;
  private subscribers: Set<Subscriber<T>> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    return this.value;
  }

  set(next: T): void {
    this.value = next;
    this.notify();
  }

  update(mutator: (current: T) => T): void {
    this.value = mutator(this.value);
    this.notify();
  }

  subscribe(subscriber: Subscriber<T>): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.value);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notify() {
    for (const subscriber of this.subscribers) {
      subscriber(this.value);
    }
  }
}

export type EventHandler<T> = (detail: T) => void;

export class EventBus<Events extends Record<string, unknown>> {
  private listeners: { [K in keyof Events]?: Set<EventHandler<Events[K]>> } = {};

  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]!.add(handler);
    return () => {
      this.listeners[event]!.delete(handler);
    };
  }

  emit<K extends keyof Events>(event: K, detail: Events[K]): void {
    this.listeners[event]?.forEach((handler) => handler(detail));
  }
}
