import { z } from 'zod';
import { isValidMbid } from './identifiers';
export const searchQuerySchema = z.string().trim().min(2).max(120);
export const mbidSchema = z.string().refine(isValidMbid);
