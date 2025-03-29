import fs from 'fs/promises';
import yaml from 'js-yaml';

interface IDataStore {
  [key: string]: any;
}

export default class DataStore {
  private data: IDataStore;

  constructor(private path: string) {
    this.data = {};
  }

  async load() {
    try {
      const fileContents = await fs.readFile(this.path, 'utf-8');
      this.data = yaml.load(fileContents) as IDataStore;
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        // File doesn't exist, initialize empty data object
        this.data = {};
        await this.save();
      } else {
        throw err;
      }
    }
  }

  async save() {
    const yamlData = yaml.dump(this.data);
    await fs.writeFile(this.path, yamlData, 'utf-8');
  }

  get(key: string) {
    return this.data[key];
  }

  set(key: string, value: any) {
    this.data[key] = value;
    return this.save();
  }

  setAll(data: IDataStore) {
    this.data = data;
    return this.save();
  }

  getAll() {
    return this.data;
  }
}
