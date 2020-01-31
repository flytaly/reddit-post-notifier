import storage from '../storage';

let options = null;

async function getOptions() {
    if (!options) options = await storage.getOptions();
    return options;
}

export default getOptions;
