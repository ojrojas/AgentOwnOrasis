import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	// Adjust the path to match the location of your test files
	files: 'oroasis/src/test/**/*.test.ts',

	// Include supported file extensions
	extensions: ['.ts', '.tsx', '.js', '.jsx'],
});
