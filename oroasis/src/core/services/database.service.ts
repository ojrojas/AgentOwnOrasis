import { ExtensionContext } from 'vscode';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export class DatabaseService {

    constructor(context: ExtensionContext)
    {
        const dbPath = path.join(context.globalStorageUri.fsPath, 'chat.db');
    }

}