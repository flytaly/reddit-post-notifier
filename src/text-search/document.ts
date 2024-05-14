import { intersect } from './search-helpers';
import type { IndexOpts, TextId } from './index';
import { Index } from './index';

export interface DocField { field: string; options?: IndexOpts }
export interface DocSearch { field: string; query: string }

export class Document {
    fields: DocField[];
    indexes: Record<string, Index> = {};
    //* * id field name */
    id: TextId;

    constructor({ fields, id = 'id' }: { fields: DocField[]; id?: TextId }) {
        this.fields = fields;
        fields.forEach((f) => {
            if (f.field)
                this.indexes[f.field] = new Index(f.options);
        });
        this.id = id;
    }

    add(document: Record<string, unknown>) {
        this.fields.forEach((f) => {
            const text = document[f.field];
            if (text)
                this.indexes[f.field].add(document[this.id] as TextId, document[f.field] as string);
        });
    }

    search(searchData: DocSearch[]): TextId[] {
        let result: TextId[] = [];
        for (let i = 0; i < searchData.length; i++) {
            const { field, query } = searchData[i] || {};
            const fieldIndex = this.indexes[field];
            if (!fieldIndex || !query)
                continue;
            const matchIds = fieldIndex.search(query);
            if (!matchIds.length)
                return [];
            if (!result.length) {
                result = matchIds;
            }
            else {
                result = intersect([result, matchIds]);
                if (!result.length)
                    return [];
            }
        }

        return result;
    }
}
