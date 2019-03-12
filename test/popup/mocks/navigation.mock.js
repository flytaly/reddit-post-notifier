import nav from '../../../scripts/popup/navigation';

jest.spyOn(nav, 'navigate').mockImplementation(async () => {});

export default nav;
