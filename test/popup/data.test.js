import storage from './mocks/storage.mock';
import { getData } from '../../scripts/popup/data';

const subreddits = require('../fixtures/subreddits');
const queriesList = require('../fixtures/queries-list');
const queries = require('../fixtures/queries');

describe('data', () => {
    let data;
    afterEach(() => jest.clearAllMocks());

    test('should return data', async () => {
        data = await getData();

        expect(data.subrData).toEqual(subreddits);
        expect(data.queryData).toEqual(queries);
        expect(data.watchQueries).toEqual(queriesList);

        expect(storage.getSubredditData).toHaveBeenCalled();
        expect(storage.getQueriesData).toHaveBeenCalled();
        expect(storage.getQueriesList).toHaveBeenCalled();
    });

    test('should use cached data instead of storage', async () => {
        const data2 = await getData();
        expect(data2).toBe(data);

        expect(data2.watchQueries).toEqual(queriesList);

        expect(storage.getSubredditData).not.toHaveBeenCalled();
        expect(storage.getQueriesData).not.toHaveBeenCalled();
        expect(storage.getQueriesList).not.toHaveBeenCalled();
    });
});
