const RealDate = Date;

export function mockDate(date: string | number | Date) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Date = class extends RealDate {
        constructor() {
            super(date);
            return new RealDate(date);
        }
    };
}

export function restoreDate() {
    global.Date = RealDate;
}
