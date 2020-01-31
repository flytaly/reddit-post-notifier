import renderQueryListBlock from '../../../scripts/popup/renderQueryList';

jest.mock('../../../scripts/popup/renderQueryList', () => jest.fn(() => {
    const block = global.document.createElement('ul');
    block.classList.add('query-list');
    return block;
}));


export default renderQueryListBlock;
