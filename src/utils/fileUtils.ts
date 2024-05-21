import * as fs from 'fs';

export function readFileSync(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
}

export function writeFileSync(filePath: string, data: any) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function readJSONFileSync(filePath: string): any {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
}

export function createDirectorySync(dirPath: string) {
    if (!fileExists(dirPath)) {
        fs.mkdirSync(dirPath);
    }
}
