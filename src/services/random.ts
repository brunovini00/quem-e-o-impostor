import * as Crypto from 'expo-crypto';
import { randomIntFromUint32 } from '../domain';
export function secureRandomInt(max: number): number {
  return randomIntFromUint32(max, () => Crypto.getRandomValues(new Uint32Array(1))[0]!);
}
export const newId = () => Crypto.randomUUID();
