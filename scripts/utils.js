/* eslint-disable import/prefer-default-export */
export const mapObjToQueryStr = params => Object.entries(params).map(pair => pair.join('=')).join('&');
