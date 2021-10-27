import type { TextId, IndexOpts } from './index';
import { Index } from './index';

export type DocField = { field: string; options?: IndexOpts };

export class Document {
    fields: DocField[];
    indexes: Record<string, Index> = {};
    //** id field name */
    id: TextId;

    constructor({ fields, id = 'id' }: { fields: DocField[]; id?: TextId }) {
        this.fields = fields;
        fields.forEach((f) => {
            if (f.field) this.indexes[f.field] = new Index(f.options);
        });
        this.id = id;
    }

    add(document: Record<string, unknown>) {
        this.fields.forEach((f) => {
            const text = document[f.field];
            if (text) this.indexes[f.field].add(document[this.id] as TextId, document[f.field] as string);
        });
    }
}
