window.matchMedia = jest.fn((media) => ({
    matches: false,
    media,
    addEventListener: jest.fn(),
}));
