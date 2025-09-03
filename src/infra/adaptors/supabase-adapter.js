import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import MissingParamError from "../../utils/errors/missing-param-error.js";
import DependencyError from "../../utils/errors/dependency-error.js";

dotenv.config();
const supabase = createClient(
  "https://gyhsfpdaqfyhmbmigsuo.supabase.co",
  process.env.SUPABASE_SERVICE_KEY,
);

export default {
  async uploadFile(bucket, fileName, file) {
    if (!bucket) throw new MissingParamError("bucket");
    if (!fileName) throw new MissingParamError("fileName");
    if (!file) throw new MissingParamError("file");

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.content, {
        contentType: file.contentType,
      });

    if (error) {
      throw new DependencyError("@supabase/supabase-js", {
        message: "Failed to upload file to storage",
        cause: error,
      });
    }
  },
};
