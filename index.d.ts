declare type callback = (req: any, res: any, next?: any) => void;

declare type errorHandler = (err: any, req: any, res: any, next?: any) => void;

declare interface matchedRoute {
  host: string;
  method: string;
  path: string;
  callbacks: Array<callback | errorHandler>;
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
  callbacks: Array<callback | errorHandler>;
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

declare class Router {
  constructor(options?: RouterOptions);
  checkout(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  copy(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  delete(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  get(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  head(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  lock(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  merge(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  mkactivity(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  mkcol(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  move(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  notify(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  options(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  patch(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  post(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  propfind(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  purge(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  put(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  report(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  search(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  subscribe(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  trace(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  unlock(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  unsubscribe(
    path: string,
    ...callbacks: Array<callback | errorHandler>
  ): Route;
  view(path: string, ...callbacks: Array<callback | errorHandler>): Route;
  any(
    methods: string | string[],
    path: string,
    ...callbacks: Array<callback | errorHandler>
  ): Route;
  all(path: string, ...callbacks: Array<callback | errorHandler>): Route;
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

export default Router;

export declare function use(...callbacks: any): Route;

export declare function path(
  method: string | string[],
  path: string,
  ...callbacks: Array<callback | errorHandler>
): Route;

export declare function all(
  path: string,
  ...callbacks: Array<callback | errorHandler>
): Route;

export declare function domain(host: string, routes: any): Route;
