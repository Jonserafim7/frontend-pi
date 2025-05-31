import { defineConfig } from "orval"

const API_URL = "http://localhost:3000"

export default defineConfig({
  academic_scheduling_api: {
    input: `${API_URL}/api-docs-json`,
    output: {
      target: "src/api-generated/client",
      schemas: "src/api-generated/model",
      mode: "tags-split",
      namingConvention: "kebab-case",
      client: "react-query",
      httpClient: "axios",
      prettier: true,
      override: {
        mutator: {
          path: "src/lib/orval-axios-instance.ts",
          name: "orvalCustomInstance",
        },
        query: {
          shouldSplitQueryKey: true,
        },
      },
    },
  },
  academic_scheduling_api_zod: {
    input: `${API_URL}/api-docs-json`,
    output: {
      target: "src/api-generated/zod-schemas",
      client: "zod",
      mode: "tags-split",
    },
  },
})
