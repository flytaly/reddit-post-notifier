import storage from '../storage';

const data = {
    subrData: null,
};

export async function updateData() {
    data.subrData = await storage.getSubredditData();
}

export async function getData() {
    if (!data.subrData) {
        await updateData();
    }
    return data;
}

export default { getData, updateData };
