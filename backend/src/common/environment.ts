import { config } from 'dotenv';
import { environmentFile } from './project-paths';

config({ path: environmentFile, quiet: true });
