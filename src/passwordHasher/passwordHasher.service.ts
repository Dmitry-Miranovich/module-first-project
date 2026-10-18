import { Injectable } from '@nestjs/common';
import { IPasswordHasher } from './passwordHasher.interface.js';
import { genSalt, hash, compare, getRounds } from 'bcrypt';

@Injectable()
export class PasswordHasherService implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    const saltRounds = 10;
    const password_hash = await new Promise<string>((resolve) => {
      genSalt(saltRounds, (err, salt) => {
        if (err) {
          throw new Error('Error with generating salt');
        }
        hash(password, salt, (err, hash_value) => {
          if (err) {
            throw new Error('Error while hashing password');
          }
          resolve(hash_value);
        });
      });
    });
    return password_hash;
  }
  async verify(password: string, hash: string | undefined): Promise<boolean> {
    return await new Promise((resolve) => {
      if (!hash) {
        throw new Error('Failed: Hash is undefined');
      }
      compare(password, hash, (err, res) => {
        if (err) {
          throw new Error('Failed: password verification');
        }
        resolve(res);
      });
    });
  }
  needsRehash(hash: string): boolean {
    const currentRounds = 10;
    try {
      return getRounds(hash) < currentRounds;
    } catch {
      return true;
    }
  }
}
