import * as fs from 'fs';
import * as xml2js from 'xml2js';
import iDataForms from './interfaces/iDataForms';
import iGPXData from './interfaces/iGPXData';
import iGPXNode from './interfaces/iGPXNode';
import iDataFormsMetadata from './interfaces/iDataFormsMetadata';
import { iDuo, iDuos } from './interfaces/iDuos';

const gpxFolderPath = 'src/gpx-files';

function gpxProcess(filePath: string) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');

        xml2js.parseString(data, (err, result) => {
            if (err) {
                console.error('Erro ao analisar o arquivo GPX:', err);
                return;
            }

            function applyParametrization(object: iDataForms) {
                for (const propriedade in object) {
                    if (!propriedade.includes("qte")) {
                        if (typeof object[propriedade] === "object") {
                            for (const key in object[propriedade]) {
                                object[propriedade][key] = parametrization(result, key, "geral");
                            }
                        }
                    }
                    if (propriedade == "metadata") {
                        const KEY_ON_DATA = "desc";
                        object[propriedade] = parametrization(result, KEY_ON_DATA, "metadata");
                    }
                    
                    else if (propriedade.includes("sinalizacao_horizontal") ||
                        propriedade.includes("larguras_estrutura") ||
                        propriedade.includes("controle_de_velocidade") ||
                        propriedade.includes("iluminacao_estrutura") ||
                        propriedade.includes("obstaculos")) {
                        if (typeof object[propriedade] === "object") {
                            for (const key in object[propriedade]) {
                                object[propriedade][key] = parametrization(result, key, propriedade);
                            }
                        }
                    }
                }
            }
            function saveJSON(data: any, filename: string) {
                let dataArray: any[] = [];

                if (fs.existsSync(filename)) {
                    dataArray = JSON.parse(fs.readFileSync(filename, 'utf-8'));
                }

                const newId = dataArray.length + 1;
                const newData = { id: newId, ...data };
                dataArray.push(newData);

                fs.writeFileSync(filename, JSON.stringify(dataArray, null, 2));
            }

            const resultFolderPath = './src/result';
            const resultFilePath = `${resultFolderPath}/data.json`;

            if (!fs.existsSync(resultFolderPath)) {
                fs.mkdirSync(resultFolderPath);
            }

            const assessmentParams = JSON.parse(fs.readFileSync("src/references/params.json", 'utf-8'));
            applyParametrization(assessmentParams);
            saveJSON(assessmentParams, resultFilePath);
            console.log(`GPX ${result.gpx.metadata[0].name[0]} processado...`)
        });
    } catch (error) {
        console.error('Erro ao processar o arquivo GPX:', error);
    }
}

function processarTodosArquivosGpx() {
    try {
        const fileNames = fs.readdirSync(gpxFolderPath);

        console.log(`Foram encontrados ${fileNames.length} arquivos`);
        console.log("Processando dados GPX")
        for (const fileName of fileNames) {
            const filePath = `${gpxFolderPath}/${fileName}`;
            gpxProcess(filePath);
        }
    } catch (error) {
        console.error('Erro ao ler os arquivos da pasta:', error);
    }
}

function parametrization(data: iGPXData, param: string, type: string) {
    switch (type) {
        case "metadata":
            const codigo_da_area = data.gpx.metadata[0].desc[0].toLowerCase();
            const dadosAreaAvaliacao = JSON.parse(fs.readFileSync("./src/references/area.json", 'utf-8'));
            const duplas: iDuos = JSON.parse(fs.readFileSync("./src/references/duos.json", 'utf-8'));
            const result = dadosAreaAvaliacao.find((elem: iDataFormsMetadata) => {
                const codigo = elem.cod.toLowerCase();
                return codigo.includes(codigo_da_area);
            });
            result["cod"] = codigo_da_area;
            let names;
            const foundDuo = duplas.find((dupla: iDuo) => dupla["cod"] === result["dupla"]);
            if (foundDuo) {
                names = foundDuo.names.join(" e ");
            } else {
                names = result["dupla"];
            }
            result["dupla"] = names;

            return result;
        case "geral":
            return data.gpx.wpt.some((elem: iGPXNode, index: number) => {
                if (!!data.gpx.wpt[index + 1]) {
                    if (!data.gpx.wpt[index + 1].name.includes("Remover")) {
                        return elem.name[0] === param
                    }
                }
            });
        case "sinalizacao_horizontal_qte":
        case "controle_de_velocidade_qte":
        case "iluminacao_estrutura_qte":
            return data.gpx.wpt.reduce((sum, elem, index) => {
                if (!!data.gpx.wpt[index + 1]) {
                    if (!data.gpx.wpt[index + 1].name[0].includes("Remover")) {
                        if (elem.name[0] === param) {
                            return sum + 1;
                        }
                    }
                } else if (elem.name[0] === param) {
                    return sum + 1;
                }
                return sum;
            }, 0);
        case "larguras_estrutura_qte":
            let value = 0;
            data.gpx.wpt.forEach((elem, index) => {
                const proximoElementoExiste = !!data.gpx.wpt[index + 1];
                const proximoSegundoElementoExiste = !!data.gpx.wpt[index + 2];
                const antepenultimoElementoNaoExiste = !(index === data.gpx.wpt.length - 2);
                if (proximoElementoExiste && proximoSegundoElementoExiste && antepenultimoElementoNaoExiste) {
                    const naoContemElementoRemover = !data.gpx.wpt[index + 1].name[0].includes("Remover");
                    const naoContemElementoRemoverAposValorEmCentimetro = !data.gpx.wpt[index + 2].name[0].includes("Remover")
                    if (naoContemElementoRemover && naoContemElementoRemoverAposValorEmCentimetro) {
                        if (param.includes("Área transitável") && elem.name[0].includes("Área transitável")) {
                            value = data.gpx.wpt[index + 1].name[0]
                        }
                        if (param.includes("Área de amortecimento") && elem.name[0].includes("Faixa de amortecimento")) {
                            value = data.gpx.wpt[index + 1].name[0]
                        }
                        if (param.includes("Faixa de carros") && elem.name[0].includes("Faixa de rolamento")) {
                            value = data.gpx.wpt[index + 1].name[0]
                        }
                        if (param.includes("Total da via") && elem.name[0].includes("Total da via")) {
                            value = data.gpx.wpt[index + 1].name[0]
                        }
                    }
                }
            });
            return value;
        default:
            break;
    }
}

processarTodosArquivosGpx();
