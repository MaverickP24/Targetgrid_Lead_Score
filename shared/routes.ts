import { z } from 'zod';
import { insertLeadSchema, insertEventSchema, insertRuleSchema, leads, scoringRules, events, scoreHistory } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  leads: {
    list: {
      method: 'GET' as const,
      path: '/api/leads',
      responses: {
        200: z.array(z.custom<typeof leads.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/leads/:id',
      responses: {
        200: z.custom<typeof leads.$inferSelect & { history: typeof scoreHistory.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/leads',
      input: insertLeadSchema,
      responses: {
        201: z.custom<typeof leads.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/leads/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  events: {
    ingest: {
      method: 'POST' as const,
      path: '/api/events',
      input: insertEventSchema.extend({ email: z.string().email().optional() }).omit({ leadId: true }).merge(z.object({ leadId: z.number().optional() })),
      responses: {
        201: z.object({
          success: z.boolean(),
          scoreUpdated: z.boolean(),
          newScore: z.number().optional()
        }),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/events',
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect>()),
      },
    }
  },
  rules: {
    list: {
      method: 'GET' as const,
      path: '/api/rules',
      responses: {
        200: z.array(z.custom<typeof scoringRules.$inferSelect>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/rules/:id',
      input: insertRuleSchema.partial(),
      responses: {
        200: z.custom<typeof scoringRules.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    reset: {
      method: 'POST' as const,
      path: '/api/rules/reset',
      responses: {
        200: z.array(z.custom<typeof scoringRules.$inferSelect>()),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export const ws = {
  receive: {
    scoreUpdate: z.object({
      leadId: z.number(),
      newScore: z.number(),
      scoreChange: z.number(),
      reason: z.string()
    }),
    leadCreated: z.object({
      lead: z.custom<typeof leads.$inferSelect>()
    })
  }
};
