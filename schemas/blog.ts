import { z } from 'zod'

export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  category: z.string(),
  image: z.string().optional(),
  tags: z.array(z.string()).optional()
}) 