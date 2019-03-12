import storage from '../storage';

export const data = {
    subrData: null,
    queryData: null,
    watchQueries: null,
};

export async function updateData() {
    data.subrData = await storage.getSubredditData();
    data.queryData = await storage.getQueriesData();
    data.watchQueries = await storage.getQueriesList();
}

export async function getData() {
    if (!data.subrData || !data.queryData || !data.watchQueries) {
        await updateData();
    }
    return data;
}

export default { getData, updateData };
