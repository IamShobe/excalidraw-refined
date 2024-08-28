module.exports = {
  backend: {
    output: {
      mode: 'tags-split',
      target: 'src/gen/api/backend.ts',
      schemas: 'src/gen/model',
      client: 'react-query',
      mock: true,
      override: {
        operations: {
          get_scenes_api_v1_scenes__get: {
            query: {
              useQuery: true,
              useInfinite: true,
              useInfiniteQueryParam: 'cursor',
              options: {
                staleTime: 10000,
              },
            },
          },
        },
        mutator: {
          path: './src/api/axios.ts',
          name: 'customInstance',
        },
      },
    },
    input: {
      target: 'http://localhost:8080/openapi.json',
    },
  },
};
