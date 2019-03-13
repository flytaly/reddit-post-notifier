import storage from '../storage';

export const data = {
    subrData: null,
    queryData: null,
    watchQueries: null,
    messageData: null,
};

export async function updateData() {
    data.subrData = await storage.getSubredditData();
    data.queryData = await storage.getQueriesData();
    data.watchQueries = await storage.getQueriesList();
    data.messageData = await storage.getMessageData();
}

export async function getData() {
    if (!data.subrData || !data.queryData || !data.watchQueries || !data.messageData) {
        await updateData();
    }
    return data;
}

export default { getData, updateData };
