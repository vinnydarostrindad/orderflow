import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://gyhsfpdaqfyhmbmigsuo.supabase.co",
  "sb_publishable_xIhra3q79QiqxIpZEJVgpw_f3-s_oUq",
);

export default {
  getUrl(bucket, filePath) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data;
  },
};
