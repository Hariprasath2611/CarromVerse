import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase.config';

export async function uploadProfileImage(
  userId: string,
  imageBlob: Blob | Uint8Array,
  contentType: string = 'image/jpeg'
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized.');
  }

  const storageRef = ref(storage, `profiles/${userId}/profile-image`);
  const metadata = {
    contentType,
  };

  await uploadBytes(storageRef, imageBlob, metadata);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

export async function getProfileImageUrl(userId: string): Promise<string | null> {
  if (!storage) return null;

  try {
    const storageRef = ref(storage, `profiles/${userId}/profile-image`);
    return await getDownloadURL(storageRef);
  } catch (error) {
    // If no custom profile image exists
    return null;
  }
}

