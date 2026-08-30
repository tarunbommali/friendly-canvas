import { z } from "zod";

const positionOverrideSchema = z
  .object({
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  })
  .passthrough()
  .optional();

const baseElementSchema = z
  .object({
    id: z.string(),
    x: z.number(),
    y: z.number(),
    rotation: z.number().optional().default(0),
    zIndex: z.number().optional().default(1),
    originX: z.string().optional(),
    originY: z.string().optional(),
    scaleX: z.number().optional(),
    scaleY: z.number().optional(),
    isChrome: z.boolean().optional(),
    isPlaceholder: z.boolean().optional(),
    positionOverride: positionOverrideSchema,
    width: z.number().optional(),
    height: z.number().optional(),
    textAlign: z.string().optional(),
    fontWeight: z.union([z.string(), z.number()]).optional(),
    strokeDashArray: z.array(z.number()).nullable().optional(),
  })
  .passthrough();

const rectElementSchema = baseElementSchema.extend({
  type: z.literal("rect"),
  width: z.number(),
  height: z.number(),
  fill: z.string(),
  stroke: z.string().optional().default("#000000"),
  strokeWidth: z.number().optional().default(0),
});

const circleElementSchema = baseElementSchema.extend({
  type: z.literal("circle"),
  radius: z.number(),
  fill: z.string(),
  stroke: z.string().optional().default("#000000"),
  strokeWidth: z.number().optional().default(0),
});

const textFields = {
  text: z.string(),
  fontSize: z.number(),
  fontFamily: z.string().optional().default("Inter"),
  fill: z.string().optional().default("#000000"),
};

const textElementSchema = baseElementSchema.extend({
  type: z.literal("text"),
  ...textFields,
});

const headlineElementSchema = baseElementSchema.extend({
  type: z.literal("headline"),
  ...textFields,
});

const badgeElementSchema = baseElementSchema.extend({
  type: z.literal("badge"),
  ...textFields,
});

const imageElementSchema = baseElementSchema.extend({
  type: z.literal("image"),
  src: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const elementSchema = z.discriminatedUnion("type", [
  rectElementSchema,
  circleElementSchema,
  textElementSchema,
  headlineElementSchema,
  badgeElementSchema,
  imageElementSchema,
]);

const slideSchema = z
  .object({
    id: z.string(),
    backgroundColor: z.string().optional().default("#ffffff"),
    bgPattern: z.string().optional(),
    imagePrompt: z.string().optional(),
    visualDirective: z.string().optional(),
    assetName: z.array(z.string()).optional(),
    elements: z.array(elementSchema),
  })
  .passthrough();

export const carouselDocumentSchema = z
  .object({
    schemaVersion: z.number(),
    metadata: z
      .object({
        title: z.string(),
        width: z.number(),
        height: z.number(),
        aspectRatio: z.string().optional().default("4:5"),
        bgPattern: z.string().optional(),
        textAlign: z.string().optional(),
      })
      .passthrough(),
    activeSlideId: z.string(),
    slides: z.array(slideSchema),
  })
  .passthrough();
