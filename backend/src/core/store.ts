import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export class JsonStore<T> {
  private data: T[] = [];
  private loaded = false;
  private writeQueue = Promise.resolve();

  constructor(private readonly filePath: string, private readonly seed: () => T[]) {}

  async init() {
    if (this.loaded) return;
    await mkdir(path.dirname(this.filePath), { recursive: true });
    try { this.data = JSON.parse(await readFile(this.filePath, 'utf8')) as T[]; }
    catch (error: any) {
      if (error.code !== 'ENOENT') throw error;
      this.data = this.seed();
      await this.persist();
    }
    this.loaded = true;
  }

  all() { return this.data; }
  find(id: string) { return this.data.find((item) => (item as { id?: string }).id === id); }
  async add(item: T) { this.data.unshift(item); await this.persist(); return item; }
  async save() { await this.persist(); }

  private async persist() {
    this.writeQueue = this.writeQueue.then(async () => {
      const temporary = `${this.filePath}.tmp`;
      await writeFile(temporary, JSON.stringify(this.data, null, 2), 'utf8');
      await rename(temporary, this.filePath);
    });
    return this.writeQueue;
  }
}
