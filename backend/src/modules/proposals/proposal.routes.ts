// src/modules/proposals/proposal.routes.ts

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  getProposal,
  autoSaveDraft,
  getDraftByProjectId,
  getMyDrafts,
  submitProposal,
  initializeDraft,
  patchSubmittedProposal,
} from "./proposal.controller";
import {
  draftProposalSchema,
  ProposalProjectParamsSchema,
  submitProposalSchema,
  submittedProposalPatchSchema,
  proposalDataResponseSchema,
} from "./proposal.schema";
import { authMiddleware } from "../../middlewares/auth.middleware";

const proposalRoutes = new OpenAPIHono();

proposalRoutes.use("*", authMiddleware);

const ErrorSchema = z.object({
  message: z.string(),
});

const DataResponseSchema = z.object({
  data: z.any().nullable().optional(),
  message: z.string().optional(),
  success: z.boolean().optional(),
});

//
// GET /drafts/my
//
proposalRoutes.openapi(
  createRoute({
    method: "get",
    path: "/drafts/my",
    tags: ["Proposals"],
    responses: {
      200: {
        description: "Current user's proposal drafts",
        content: {
          "application/json": {
            schema: DataResponseSchema,
          },
        },
      },
    },
  }),
  (c) => {
    return getMyDrafts(c);
  },
);

//
// GET /projects/{projectId}/draft
//
proposalRoutes.openapi(
  createRoute({
    method: "get",
    path: "/projects/{projectId}/draft",
    tags: ["Proposals"],
    request: {
      params: ProposalProjectParamsSchema,
    },
    responses: {
      200: {
        description: "Proposal draft",
        content: {
          "application/json": {
            schema: DataResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid project id",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  (c) => {
    const { projectId } = c.req.valid("param");
    return getDraftByProjectId(c, projectId);
  },
);

//
// POST /projects/{projectId}/draft
//
proposalRoutes.openapi(
  createRoute({
    method: "patch",
    path: "/projects/{projectId}",
    tags: ["Proposals"],
    request: {
      params: ProposalProjectParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: submittedProposalPatchSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Updated submitted proposal",
        content: {
          "application/json": {
            schema: DataResponseSchema,
          },
        },
      },
      403: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  (c) => {
    const { projectId } = c.req.valid("param");
    const body = c.req.valid("json");
    return patchSubmittedProposal(c, projectId, body);
  },
);

proposalRoutes.openapi(
  createRoute({
    method: "post",
    path: "/projects/{projectId}/draft",
    tags: ["Proposals"],
    request: {
      params: ProposalProjectParamsSchema,
    },
    responses: {
      201: {
        description: "Initialized proposal draft",
        content: {
          "application/json": {
            schema: DataResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid project id",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  (c) => {
    const { projectId } = c.req.valid("param");
    return initializeDraft(c, projectId);
  },
);

//
// PATCH /projects/{projectId}/draft
//
proposalRoutes.openapi(
  createRoute({
    method: "patch",
    path: "/projects/{projectId}/draft",
    tags: ["Proposals"],
    request: {
      params: ProposalProjectParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: draftProposalSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Auto-saved proposal draft",
        content: {
          "application/json": {
            schema: DataResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid request",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  (c) => {
    const { projectId } = c.req.valid("param");
    const body = c.req.valid("json");

    return autoSaveDraft(c, projectId, body);
  },
);

//
// GET /projects/{projectId}
//
proposalRoutes.openapi(
  createRoute({
    method: "get",
    path: "/projects/{projectId}",
    tags: ["Proposals"],
    request: {
      params: ProposalProjectParamsSchema,
    },
    responses: {
      200: {
        description: "Submitted proposal",
        content: {
          "application/json": {
            schema: proposalDataResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid project id",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  (c) => {
    const { projectId } = c.req.valid("param");
    return getProposal(c, projectId);
  },
);

//
// POST /projects/{projectId}/submit
//
proposalRoutes.openapi(
  createRoute({
    method: "post",
    path: "/projects/{projectId}/submit",
    tags: ["Proposals"],
    request: {
      params: ProposalProjectParamsSchema,
      body: {
        content: {
          "application/json": {
            schema: submitProposalSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Submitted proposal",
        content: {
          "application/json": {
            schema: DataResponseSchema,
          },
        },
      },
      400: {
        description: "Invalid request",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  (c) => {
    const { projectId } = c.req.valid("param");
    const body = c.req.valid("json");

    return submitProposal(c, projectId, body);
  },
);

export default proposalRoutes;
