import { defineConfig } from '@playwright/test';
import { testConfig } from './src/config/test.config';

export default defineConfig(testConfig);
