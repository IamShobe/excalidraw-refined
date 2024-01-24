/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/api/v1/scenes/": {
    /** Get Scenes */
    get: operations["get_scenes_api_v1_scenes__get"];
    /** Create Scene */
    post: operations["create_scene_api_v1_scenes__post"];
  };
  "/api/v1/scenes/{scene_id}": {
    /** Get Scene */
    get: operations["get_scene_api_v1_scenes__scene_id__get"];
    /** Update Scene */
    put: operations["update_scene_api_v1_scenes__scene_id__put"];
    /** Delete Scene */
    delete: operations["delete_scene_api_v1_scenes__scene_id__delete"];
  };
  "/api/v1/scene-files/": {
    /** Add Scene File */
    post: operations["add_scene_file_api_v1_scene_files__post"];
  };
  "/api/v1/scene-files/{file_id}": {
    /** Get Scene File */
    get: operations["get_scene_file_api_v1_scene_files__file_id__get"];
  };
  "/": {
    /** Hello */
    get: operations["hello__get"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /** BaseSceneWithRevision */
    BaseSceneWithRevision: {
      /** Name */
      name: string;
      /** Description */
      description: string;
      /**
       * Picture
       * Format: binary
       */
      picture: string;
      /**
       * Data
       * Format: binary
       */
      data: string;
    };
    /** CursorPage[SceneSummary] */
    CursorPage_SceneSummary_: {
      /** Items */
      items: components["schemas"]["SceneSummary"][];
      /** Limit */
      limit: number;
      /** Total */
      total: number;
      /** Count */
      count: number;
      /** Next Cursor */
      next_cursor: string | null;
    };
    /** EnrichedSceneWithRevision */
    EnrichedSceneWithRevision: {
      /** Name */
      name: string;
      /** Description */
      description: string;
      /**
       * Picture
       * Format: binary
       */
      picture: string;
      /**
       * Data
       * Format: binary
       */
      data: string;
      /** Id */
      id: string;
      /** Revision Id */
      revision_id: string;
      /** Files Ids */
      files_ids?: string[];
    };
    /** HTTPValidationError */
    HTTPValidationError: {
      /** Detail */
      detail?: components["schemas"]["ValidationError"][];
    };
    /** SceneFile */
    SceneFile: {
      /** Name */
      name: string;
      /**
       * Data
       * Format: binary
       */
      data: string;
    };
    /** SceneFileWithId */
    SceneFileWithId: {
      /** Name */
      name: string;
      /**
       * Data
       * Format: binary
       */
      data: string;
      /** Id */
      id: string;
    };
    /** SceneSummary */
    SceneSummary: {
      /** Id */
      id: string;
      /**
       * Created
       * Format: date-time
       */
      created: string;
      /**
       * Last Updated
       * Format: date-time
       */
      last_updated: string;
      /** Revision Id */
      revision_id: string;
      /** Name */
      name: string;
      /** Description */
      description: string;
      /**
       * Picture
       * Format: binary
       */
      picture: string;
    };
    /** ValidationError */
    ValidationError: {
      /** Location */
      loc: (string | number)[];
      /** Message */
      msg: string;
      /** Error Type */
      type: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export interface operations {

  /** Get Scenes */
  get_scenes_api_v1_scenes__get: {
    parameters: {
      query?: {
        name_filter?: string;
        cursor?: string;
        limit?: number;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["CursorPage_SceneSummary_"];
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  /** Create Scene */
  create_scene_api_v1_scenes__post: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["BaseSceneWithRevision"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["EnrichedSceneWithRevision"];
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  /** Get Scene */
  get_scene_api_v1_scenes__scene_id__get: {
    parameters: {
      path: {
        scene_id: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["EnrichedSceneWithRevision"];
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  /** Update Scene */
  update_scene_api_v1_scenes__scene_id__put: {
    parameters: {
      path: {
        scene_id: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["BaseSceneWithRevision"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["EnrichedSceneWithRevision"];
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  /** Delete Scene */
  delete_scene_api_v1_scenes__scene_id__delete: {
    parameters: {
      path: {
        scene_id: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          "application/json": unknown;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  /** Add Scene File */
  add_scene_file_api_v1_scene_files__post: {
    parameters: {
      query: {
        revision_id: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["SceneFile"];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["SceneFileWithId"];
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  /** Get Scene File */
  get_scene_file_api_v1_scene_files__file_id__get: {
    parameters: {
      path: {
        file_id: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          "application/json": components["schemas"]["SceneFileWithId"];
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          "application/json": components["schemas"]["HTTPValidationError"];
        };
      };
    };
  };
  /** Hello */
  hello__get: {
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          "application/json": unknown;
        };
      };
    };
  };
}
