import storage from '../../../scripts/storage';
// import options from '../../fixtures/options';

jest.mock('../../../scripts/storage.js', () => {
    const options = require('../../fixtures/options');
    const subreddits = require('../../fixtures/subreddits');
    const queriesList = require('../../fixtures/queries-list');
    const queries = require('../../fixtures/queries');

    return ({
        getOptions: jest.fn(async () => options),
        getSubredditData: jest.fn(async () => subreddits),
        getQueriesList: jest.fn(async () => queriesList),
        getQueriesData: jest.fn(async () => queries),
        removeAllPosts: jest.fn(),
        removePostsFrom: jest.fn(),
        removePost: jest.fn(),
    });
});

export default storage;
