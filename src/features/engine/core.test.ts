import { something } from "./core";

describe('testing something', () => {
    test('something should error', () => {
        const res = something([], [])
        expect(res[0]).toHaveProperty('mode')
    });
  });