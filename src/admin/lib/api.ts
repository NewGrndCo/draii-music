import { supabase } from '@/integrations/supabase/client';

export const ADMIN_TOKEN_KEY = 'admin_auth_token';

export const getAdminToken = () => sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';

type AdminOp =
  | 'list' | 'insert' | 'update' | 'delete' | 'stats'
  | 'storage.signedUploadUrl';

export type AdminTable =
  | 'songs' | 'events' | 'merch' | 'donations'
  | 'artist_profile' | 'listens' | 'mailing_list';

interface AdminCallArgs {
  op: AdminOp;
  table?: AdminTable;
  payload?: any;
  id?: string;
  bucket?: string;
  path?: string;
}

export async function adminCall<T = any>(args: AdminCallArgs): Promise<T> {
  const token = getAdminToken();
  const { data, error } = await supabase.functions.invoke('admin-mutate', {
    body: { token, ...args },
  });
  if (error) throw new Error(error.message || 'Request failed');
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export const adminList = <T = any>(table: AdminTable) =>
  adminCall<{ data: T[] }>({ op: 'list', table }).then(r => r.data);

export const adminInsert = <T = any>(table: AdminTable, payload: any) =>
  adminCall<{ data: T }>({ op: 'insert', table, payload }).then(r => r.data);

export const adminUpdate = <T = any>(table: AdminTable, id: string, payload: any) =>
  adminCall<{ data: T }>({ op: 'update', table, id, payload }).then(r => r.data);

export const adminDelete = (table: AdminTable, id: string) =>
  adminCall<{ ok: true }>({ op: 'delete', table, id });

export const adminStats = () =>
  adminCall<{ songs: any[]; events: any[]; merch: any[]; donations: any[]; listens: any[] }>({ op: 'stats' });

export async function adminUploadFile(bucket: string, path: string, file: Blob) {
  const sig = await adminCall<{ signedUrl: string; token: string; path: string; publicUrl: string }>({
    op: 'storage.signedUploadUrl', bucket, path,
  });
  const upload = await fetch(sig.signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!upload.ok) throw new Error('Upload failed');
  return sig.publicUrl;
}
