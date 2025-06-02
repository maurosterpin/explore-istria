import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "attraction_rating_list";

const saveIdList = async (list: number[]) => {
  try {
    const jsonValue = JSON.stringify(list);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error("Error saving rating list", e);
  }
};

const loadIdList = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    const res = jsonValue != null ? JSON.parse(jsonValue) : [];

    return res;
  } catch (e) {
    console.error("Error loading rating list", e);
    return [];
  }
};

const addIdToList = async (id: number) => {
  const list = await loadIdList();
  if (!list.includes(id)) {
    list.push(id);
    await saveIdList(list);
  }
};

export { saveIdList, loadIdList, addIdToList };
