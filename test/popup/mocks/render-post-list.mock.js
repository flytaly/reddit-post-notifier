import renderPostList, { insertNewPosts } from '../../../scripts/popup/renderPostList';

jest.mock('../../../scripts/popup/renderPostList', () => ({
    __esModule: true,
    insertNewPosts: jest.fn(),
    default: jest.fn(() => {
        const block = global.document.createElement('ul');
        block.classList.add('post-list');
        return block;
    }),
}));

export { insertNewPosts };
export default renderPostList;
