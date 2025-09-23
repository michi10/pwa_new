import type { TabRoute } from './stores';

const ROUTES: TabRoute[] = ['dashboard', 'map', 'calendar', 'rain', 'info'];

export type RouteChangeHandler = (route: TabRoute) => void;

export class Router {
  private current: TabRoute;
  private handlers: Set<RouteChangeHandler> = new Set();

  constructor(defaultRoute: TabRoute = 'dashboard') {
    this.current = defaultRoute;
  }

  start(): void {
    this.current = this.parseRoute(location.hash) ?? this.current;
    window.addEventListener('hashchange', () => {
      const next = this.parseRoute(location.hash) ?? this.current;
      if (next !== this.current) {
        this.current = next;
        this.notify();
      }
    });
    if (!location.hash) {
      this.go(this.current);
    } else {
      this.notify();
    }
  }

  onChange(handler: RouteChangeHandler): () => void {
    this.handlers.add(handler);
    handler(this.current);
    return () => this.handlers.delete(handler);
  }

  go(route: TabRoute): void {
    if (!ROUTES.includes(route)) {
      route = 'dashboard';
    }
    if (this.current === route && location.hash === `#${route}`) {
      this.notify();
      return;
    }
    location.hash = `#${route}`;
  }

  private notify() {
    this.handlers.forEach((handler) => handler(this.current));
  }

  private parseRoute(hash: string): TabRoute | undefined {
    const route = hash.replace('#', '') as TabRoute;
    if (ROUTES.includes(route)) {
      return route;
    }
    return undefined;
  }
}

export const router = new Router('dashboard');
