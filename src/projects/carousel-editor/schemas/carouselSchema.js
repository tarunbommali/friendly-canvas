import { z } from "zod";

const baseElementSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  rotation: z.number().default(0),
  zIndex: z.number().default(1),
});

const rectElementSchema = baseElementSchema.extend({
  type: z.literal("rect"),
  width: z.number(),
  height: z.number(),
  fill: z.string(),
  stroke: z.string().default("#000000"),
  strokeWidth: z.number().default(0),
});

const circleElementSchema = baseElementSchema.extend({
  type: z.literal("circle"),
  radius: z.number(),
  fill: z.string(),
  stroke: z.string().default("#000000"),
  strokeWidth: z.number().default(0),
});

const textElementSchema = baseElementSchema.extend({
  type: z.literal("text"),
  text: z.string(),
  fontSize: z.number(),
  fontFamily: z.string().default("Inter"),
  fill: z.string().default("#000000"),
});

const imageElementSchema = baseElementSchema.extend({
  type: z.literal("image"),
  src: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const elementSchema = z.discriminatedUnion("type", [
  rectElementSchema,
  circleElementSchema,
  textElementSchema,
  imageElementSchema,
]);

const slideSchema = z.object({
  id: z.string(),
  backgroundColor: z.string().default("#ffffff"),
  elements: z.array(elementSchema),
});

export const carouselDocumentSchema = z.object({
  schemaVersion: z.number(),
  metadata: z.object({
    title: z.string(),
    width: z.number(),
    height: z.number(),
    aspectRatio: z.string().default("4:5"),
  }),
  activeSlideId: z.string(),
  slides: z.array(slideSchema),
});
