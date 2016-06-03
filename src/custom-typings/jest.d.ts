declare function afterEach(fn: any): void;
declare function beforeEach(fn: any): void;
declare function describe(name: string, fn: any): void;
declare function it(name: string, fn: any): void;
declare function pit(name: string, fn: any): void;

declare function xdescribe(name: string, fn: any): void;
declare function xit(name: string, fn: any): void;

declare function expect(actual: any): any;
declare function spyOn(object: any, method: any): any;

interface NodeRequire {
  requireActual(moduleName: string): any;
}

declare namespace jest {
  function autoMockOff(): void;
  function dontMock(moduleName: string): void;
  function genMockFunction(): any;
  function mock(moduleName: string): void;
  function setMock(moduleName: string, fn: any): void;
  function runAllTimers(): void;
}