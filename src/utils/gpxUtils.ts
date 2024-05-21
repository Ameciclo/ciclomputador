import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { readFileSync, readJSONFileSync, writeFileSync, fileExists, createDirectorySync } from './fileUtils';
import { applyParametrization } from './parametrizationUtils';

const gpxFolderPath = 'src/gpx-files';

export function processGPXFile(filePath: string) {
    try {
        const data = readFileSync(filePath);
        xml2js.parseString(data, (err, result) => {
            if (err) {
                console.error('Erro ao analisar o arquivo GPX:', err);
                return;
            }

            const assessmentParams = readJSONFileSync("src/references/params.json");
            applyParametrization(assessmentParams, result);

            const resultFolderPath = './src/result';
            const resultFilePath = `${resultFolderPath}/data.json`;

            createDirectorySync(resultFolderPath);
            saveJSON(assessmentParams, resultFilePath);
            console.log(`GPX ${result.gpx.metadata[0].name[0]} processado...`);
        });
    } catch (error) {
        console.error('Erro ao processar o arquivo GPX:', error);
    }
}

export function processAllGPXFiles() {
    try {
        const fileNames = fs.readdirSync(gpxFolderPath);
        console.log(`Foram encontrados ${fileNames.length} arquivos`);
        console.log("Processando dados GPX");
        for (const fileName of fileNames) {
            const filePath = `${gpxFolderPath}/${fileName}`;
            processGPXFile(filePath);
        }
    } catch (error) {
        console.error('Erro ao ler os arquivos da pasta:', error);
    }
}

function saveJSON(data: any, filename: string) {
    let dataArray: any[] = [];

    if (fileExists(filename)) {
        dataArray = readJSONFileSync(filename);
    }

    const newId = dataArray.length + 1;
    const newData = { id: newId, ...data };
    dataArray.push(newData);

    writeFileSync(filename, dataArray);
}
