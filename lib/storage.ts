import { getServiceSupabase } from "./supabase/server";

type UploadBody = ArrayBuffer | Buffer | Uint8Array;

function toArrayBuffer(buffer: UploadBody) {
  if (buffer instanceof ArrayBuffer) return buffer;
  const view = buffer as Uint8Array;
  return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
}

export async function uploadBuffer(bucket: string, path: string, buffer: UploadBody, contentType: string) {
  const supabase = getServiceSupabase();
  const body = new Uint8Array(toArrayBuffer(buffer));
  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    upsert: true,
    contentType
  });
  if (error) throw error;
  return `${bucket}/${path}`;
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function downloadBuffer(bucket: string, path: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
