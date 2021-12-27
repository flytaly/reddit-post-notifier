# Full Text search and reddit post filter

Text search is using Flexsearch-like API but without all of its options.

**Index** creates an index of words.

**Document** create multiple indexes, one per field. Search return indexes of documents that match ALL queries.

**Post Filter** filter reddit posts by given rules. Every rule is a different document search. The posts should match ANY rule.

In other words, _rules_ combine as _OR_ operation, while document field _queries_ in a rule as _AND_ operation.

By default, some English endings of the words are stemming (simply deleting).

```javascript
const doc = new Document({
    fields: [
        { field: 'title', options: {} },
        { field: 'text', options: {} },
    ],
    id: 'id',
});
doc.add({ id: 1, title: '...', text: 'Lorem ipsum dolor sit amet' });
doc.add({ id: 2, title: '...', text: 'consectetur adipiscing elit' });
doc.search({ field: 'text', query: 'lorem' }); // [1]
```
