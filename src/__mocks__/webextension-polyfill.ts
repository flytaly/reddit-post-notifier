import { vi } from 'vitest';

function deepMock(obj = {} as any): any {
    return new Proxy(obj, {
        get(target, path, receiver) {
            if (!Reflect.has(target, path)) {
                obj[path] = vi.fn();
                return deepMock(obj[path]);
            }

            if (path === 'mockImplementation')
                return target[path];

            /* Without this part, the following error occurs when using toHaveBeenCalledWith in vitest.
             * TypeError: 'get' on proxy: property 'prototype' is a read-only and non-configurable data property on the proxy target
             * but the proxy did not return its actual value (expected '[object Array]' but got '[object Array]')
             *
             * But even without the erorr it still doesn't work properly, though
             * */
            /* const config = Object.getOwnPropertyDescriptor(target, path); */
            /* if (config && config.configurable === false && config.writable === false) { */
            /*     return target[path]; */
            /* } */

            const val = Reflect.get(target, path, receiver);
            if (typeof val !== 'function' && typeof val !== 'object')
                return val;

            return deepMock(obj[path]);
        },
        apply(target, thisArg, args) {
            return target.apply(thisArg, args);
        },
    });
}

export default deepMock({});
