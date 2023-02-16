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
  checkout(path: string, ...callbacks: any[]): this;
  copy(path: string, ...callbacks: any[]): this;
  delete(path: string, ...callbacks: any[]): this;
  get(path: string, ...callbacks: any[]): this;
  head(path: string, ...callbacks: any[]): this;
  lock(path: string, ...callbacks: any[]): this;
  merge(path: string, ...callbacks: any[]): this;
  mkactivity(path: string, ...callbacks: any[]): this;
  mkcol(path: string, ...callbacks: any[]): this;
  move(path: string, ...callbacks: any[]): this;
  notify(path: string, ...callbacks: any[]): this;
  options(path: string, ...callbacks: any[]): this;
  patch(path: string, ...callbacks: any[]): this;
  post(path: string, ...callbacks: any[]): this;
  propfind(path: string, ...callbacks: any[]): this;
  purge(path: string, ...callbacks: any[]): this;
  put(path: string, ...callbacks: any[]): this;
  report(path: string, ...callbacks: any[]): this;
  search(path: string, ...callbacks: any[]): this;
  subscribe(path: string, ...callbacks: any[]): this;
  trace(path: string, ...callbacks: any[]): this;
  unlock(path: string, ...callbacks: any[]): this;
  unsubscribe(path: string, ...callbacks: any[]): this;
  view(path: string, ...callbacks: any[]): this;
  any(methods: string | string[], path: string, ...callbacks: any[]): this;
  all(path: string, ...callbacks: any[]): this;
  use(...callbacks: any): this;
  group(path: string, callback: any): this;
  domain(host: string, callback: any): this;
  setName(name: string): this;
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

export declare function use(...callbacks: any): Route[];

export declare function path(
  method: string | string[],
  path: string,
  ...callbacks: any[]
): Route;

export declare function all(path: string, ...callbacks: any[]): Route;

export declare function domain(host: string, routes: any): Route[];
