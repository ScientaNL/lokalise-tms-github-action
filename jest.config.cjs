module.exports = {
	clearMocks: true,
	resolver: "<rootDir>/jest.esm-resolver.cjs",
	moduleFileExtensions: ['js', 'ts'],
	testMatch: ['**/*.test.ts'],
	transform: {
		'^.+\\.ts$': ['ts-jest', {usaeESM: true}],
	},
	verbose: true,
};
