import "@testing-library/jest-dom";

import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

Object.defineProperty(global.crypto, "randomUUID", {
  value: () => "test-uuid",
});

Object.defineProperty(URL, "createObjectURL", {
  value: () => "blob:test-url",
});

Object.defineProperty(URL, "revokeObjectURL", {
  value: () => {},
});