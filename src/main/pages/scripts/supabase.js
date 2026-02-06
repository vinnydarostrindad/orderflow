import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://tplzbipcemddykwlhxlp.supabase.co",
  "sb_publishable_fKmHxGth34OM0NrdQQMZGg_vTz0ZE9F",
);

export default {
  getUrl(bucket, filePath) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data;
  },
};
