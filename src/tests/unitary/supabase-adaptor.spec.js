import { expect, jest } from "@jest/globals";

const supabaseMock = {
  bucket: null,
  fileName: null,
  fileContent: null,
  config: null,
};
let uploadFileError = false;
jest.unstable_mockModule("@supabase/supabase-js", () => ({
  createClient: (supabaseUrl, supabaseKey) => {
    createClient.supabaseUrl = supabaseUrl;
    createClient.supabaseKey = supabaseKey;

    return {
      storage: {
        from: (bucket) => {
          supabaseMock.bucket = bucket;

          return {
            upload: (fileName, fileContent, config) => {
              supabaseMock.fileName = fileName;
              supabaseMock.fileContent = fileContent;
              supabaseMock.config = config;

              return uploadFileError
                ? { data: "any_data", error: new Error() }
                : { data: "any_data", error: null };
            },
          };
        },
      },
    };
  },
}));

process.env.SUPABASE_SERVICE_KEY = "any_supabase_service_key";

import MissingParamError from "../../utils/errors/missing-param-error.js";
import DependencyError from "../../utils/errors/dependency-error.js";
const { createClient } = await import("@supabase/supabase-js");
const sut = (await import("../../infra/adaptors/supabase-adapter.js")).default;

describe("Supabase Adapter", () => {
  test("Should call createClient with correct params", () => {
    expect(createClient.supabaseUrl).toBe(
      "https://tplzbipcemddykwlhxlp.supabase.co",
    );
    expect(createClient.supabaseKey).toBe("any_supabase_service_key");
  });

  describe("uploadFile Method", () => {
    test("Should throw if no bucket is provided", async () => {
      await expect(sut.uploadFile()).rejects.toThrow(
        new MissingParamError("bucket"),
      );
    });

    test("Should throw if no fileName is provided", async () => {
      await expect(sut.uploadFile("any_bucket")).rejects.toThrow(
        new MissingParamError("fileName"),
      );
    });

    test("Should throw if no file is provided", async () => {
      await expect(
        sut.uploadFile("any_bucket", "any_file_name"),
      ).rejects.toThrow(new MissingParamError("file"));
    });

    test("Should call supabase.storage.from with correct params", async () => {
      await sut.uploadFile("any_bucket", "any_file_name", {
        content: "any",
        contentType: "any_content_type",
      });

      expect(supabaseMock.bucket).toBe("any_bucket");
    });

    test("Should call supabase.storage.from.upload with correct params", async () => {
      await sut.uploadFile("any_bucket", "any_file_name", {
        content: "any_content",
        contentType: "any_content_type",
      });

      expect(supabaseMock.fileName).toBe("any_file_name");
      expect(supabaseMock.fileContent).toBe("any_content");
      expect(supabaseMock.config).toEqual({
        contentType: "any_content_type",
      });
    });

    test("Should throw if something goes wrong", async () => {
      uploadFileError = true;

      const params = [
        "any_bucket",
        "any_file_name",
        {
          content: "any_content",
          contentType: "any_content_type",
        },
      ];
      await expect(sut.uploadFile(...params)).rejects.toThrow(DependencyError);

      uploadFileError = false;
    });
  });
});
