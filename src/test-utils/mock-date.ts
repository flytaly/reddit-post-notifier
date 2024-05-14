const RealDate = Date;

export function mockDate(date: string | number | Date) {
    (globalThis as any).Date = class extends RealDate {
        constructor() {
            super(date);
            return new RealDate(date);
        }

        static now() {
            return new RealDate(date).getTime();
        }
    };
    return new RealDate(date);
}

export function restoreDate() {
    globalThis.Date = RealDate;
}
