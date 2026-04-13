import { resolve } from 'path';
import * as dotenv from 'dotenv';

/** Load before any module reads process.env (e.g. AppModule + TypeORM). */
dotenv.config({ path: resolve(process.cwd(), '.env') });
