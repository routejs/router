declare interface matchedRoute {
  host: string;
  method: string;
  path: string;
  callbacks: any[];
  params: object;
  subdomains: object;
}

declare interface Route {
  host: string;
  hostRegexp: RegExp;
  method: string;
  path: string;
  pathRegexp: RegExp;
  group: string;
  name: string;
  params: string[];
  subdomains: string[];
  callbacks: any[];
  caseSensitive: boolean;
  setName(name: string): this;
  match(options: {
    host: string;
    method: string;
    path: string;
  }): boolean | matchedRoute;
}

declare type handler = (req: any, res: any) => void;

interface RouterOptions {
  caseSensitive?: boolean;
  host?: string;
}

export declare class Router {
  constructor(options?: RouterOptions);
  checkout(path: string, ...callbacks: any[]): Route;
  copy(path: string, ...callbacks: any[]): Route;
  delete(path: string, ...callbacks: any[]): Route;
  get(path: string, ...callbacks: any[]): Route;
  head(path: string, ...callbacks: any[]): Route;
  lock(path: string, ...callbacks: any[]): Route;
  merge(path: string, ...callbacks: any[]): Route;
  mkactivity(path: string, ...callbacks: any[]): Route;
  mkcol(path: string, ...callbacks: any[]): Route;
  move(path: string, ...callbacks: any[]): Route;
  notify(path: string, ...callbacks: any[]): Route;
  options(path: string, ...callbacks: any[]): Route;
  patch(path: string, ...callbacks: any[]): Route;
  post(path: string, ...callbacks: any[]): Route;
  propfind(path: string, ...callbacks: any[]): Route;
  purge(path: string, ...callbacks: any[]): Route;
  put(path: string, ...callbacks: any[]): Route;
  report(path: string, ...callbacks: any[]): Route;
  search(path: string, ...callbacks: any[]): Route;
  subscribe(path: string, ...callbacks: any[]): Route;
  trace(path: string, ...callbacks: any[]): Route;
  unlock(path: string, ...callbacks: any[]): Route;
  unsubscribe(path: string, ...callbacks: any[]): Route;
  view(path: string, ...callbacks: any[]): Route;
  any(methods: string | string[], path: string, ...callbacks: any[]): Route;
  all(path: string, ...callbacks: any[]): Route;
  use(...callbacks: any): Route;
  group(path: string, callback: any[]): Route;
  domain(host: string, callback: any[]): Route;
  routes(): Route[];
  route(name: string, params: any[]): string | null;
  handle(options: {
    requestHost: string;
    requestMethod: string;
    requestUrl: string;
    request: any;
    response: any;
  }): void;
  handler(): handler;
}

export declare function use(...callbacks: any): Route;

export declare function path(
  method: string | string[],
  path: string,
  ...callbacks: any[]
): Route;

export declare function all(path: string, ...callbacks: any[]): Route;

export declare function domain(host: string, routes: any): Route;
