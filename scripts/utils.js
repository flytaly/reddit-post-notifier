/* eslint-disable import/prefer-default-export */
export const mapObjToQueryStr = params => Object.entries(params).map(pair => pair.join('=')).join('&');

export const wait = (ms = 5000) => new Promise(resolve => setTimeout(resolve, ms));
