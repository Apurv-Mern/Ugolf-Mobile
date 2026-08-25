import AsyncStorage from '@react-native-async-storage/async-storage';

// SAVE DATA
export const setStorageData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);

    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.log('SET STORAGE ERROR:', error);
  }
};

// GET DATA
export const getStorageData = async key => {
  try {
    const value = await AsyncStorage.getItem(key);

    return value != null ? JSON.parse(value) : null;
  } catch (error) {
    console.log('GET STORAGE ERROR:', error);
  }
};

// REMOVE DATA  
export const removeStorageData = async key => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log('REMOVE STORAGE ERROR:', error);
  }
};

// CLEAR STORAGE
export const clearStorage = async () => {
  try {
    const hasOnboarded = await AsyncStorage.getItem('HAS_ONBOARDED');
    const rememberedEmail = await AsyncStorage.getItem('REMEMBERED_EMAIL');
    await AsyncStorage.clear();
    if (hasOnboarded !== null) {
      await AsyncStorage.setItem('HAS_ONBOARDED', hasOnboarded);
    }
    if (rememberedEmail !== null) {
      await AsyncStorage.setItem('REMEMBERED_EMAIL', rememberedEmail);
    }
  } catch (error) {
    console.log('CLEAR STORAGE ERROR:', error);
  }
};




export const saveGuestCart = async cart => {
  await setStorageData('GUEST_CART', cart);
};

export const getGuestCart = async () => {
  return (await getStorageData('GUEST_CART')) || [];
};

export const clearGuestCart = async () => {
  await removeStorageData('GUEST_CART');
};