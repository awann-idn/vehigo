import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';

export interface UploadResult {
  path: string;
  signedUrl?: string;
}

export async function pickAndCompressImage(
  aspect: [number, number] = [4, 3]
): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Izin akses galeri diperlukan untuk memilih foto.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.8,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const selectedUri = result.assets[0].uri;

  // Kompres gambar agar tidak membebani kuota & storage
  const manipResult = await ImageManipulator.manipulateAsync(
    selectedUri,
    [{ resize: { width: 1280 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  return manipResult.uri;
}

export async function uploadDocument(
  userId: string,
  docType: 'ktp' | 'sim' | 'nib' | 'vehicle',
  fileUri: string
): Promise<UploadResult> {
  const filename = `${docType}_${Date.now()}.jpg`;
  const storagePath = `${userId}/${filename}`;
  const bucketName =
    docType === 'vehicle'
      ? 'vehicle-photos'
      : docType === 'sim'
        ? 'sim'
        : 'ktp';

  const response = await fetch(fileUri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Gagal mengunggah ${docType}: ${uploadError.message}`);
  }

  if (docType !== 'vehicle') {
    const { error: documentError } = await supabase.from('documents').insert([
      {
        user_id: userId,
        kind: docType,
        storage_path: storagePath,
        status: 'pending',
      },
    ]);
    if (documentError) {
      throw new Error(`Dokumen terunggah tetapi gagal dicatat: ${documentError.message}`);
    }
  }

  // Semua bucket bersifat privat, jadi preview memakai signed URL sementara.
  const { data: signedData } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(storagePath, 3600); // 1 jam

  return {
    path: storagePath,
    signedUrl: signedData?.signedUrl,
  };
}
