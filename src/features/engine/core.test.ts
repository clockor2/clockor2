import { regression } from "./core";

describe('testing something', () => {
    test('something should error', () => {
        const res = regression([], [], [], [])
        expect(res[0]).toHaveProperty('mode')
    });
  });