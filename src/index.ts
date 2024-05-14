import * as fs from 'fs';
import * as xml2js from 'xml2js';

const gpxFolderPath = 'src/gpx-files';

function gpxProcess(filePath: string) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');

        xml2js.parseString(data, (err, result) => {
            if (err) {
                console.error('Erro ao analisar o arquivo GPX:', err);
                return;
            }
            // console.log(result.gpx.wpt)
            function applyParametrization(object) {
                for (const propriedade in object) {
                    if (!propriedade.includes("qte")) {
                        if (typeof object[propriedade] === "object") {
                            for (const key in object[propriedade]) {
                                object[propriedade][key] = parametrization(result, key, "qualitativo");
                            }
                        }
                    }
                    else if (propriedade.includes("sinalizacao_horizontal")) {
                        console.log(propriedade)
                        if (typeof object[propriedade] === "object") {
                            for (const key in object[propriedade]) {
                                object[propriedade][key] = parametrization(result, key, propriedade);
                            }
                        }
                    }
                    else if (propriedade.includes("larguras_estrutura")) {
                        if (typeof object[propriedade] === "object") {
                            for (const key in object[propriedade]) {
                                object[propriedade][key] = parametrization(result, key, propriedade);
                            }
                        }
                    }
                    else if (propriedade.includes("controle_de_velocidade")) {
                        if (typeof object[propriedade] === "object") {
                            for (const key in object[propriedade]) {
                                object[propriedade][key] = parametrization(result, key, propriedade);
                            }
                        }
                    }
                    else if (propriedade.includes("iluminacao_estrutura")) {
                        if (typeof object[propriedade] === "object") {
                            for (const key in object[propriedade]) {
                                object[propriedade][key] = parametrization(result, key, propriedade);
                            }
                        }
                    }
                }

            }
            const assessmentParams = JSON.parse(fs.readFileSync("src/references/params.json", 'utf-8'))
            applyParametrization(assessmentParams)
            console.log(assessmentParams)
        });
    } catch (error) {
        console.error('Erro ao processar o arquivo GPX:', error);
    }
}

function processarTodosArquivosGpx() {
    try {
        const fileNames = fs.readdirSync(gpxFolderPath);

        console.log(`Foram encontrados ${fileNames.length} arquivos`)
        for (const fileName of fileNames) {
            const filePath = `${gpxFolderPath}/${fileName}`;
            gpxProcess(filePath);
        }
    } catch (error) {
        console.error('Erro ao ler os arquivos da pasta:', error);
    }
}

function parametrization(data: object, param: string, type: string) {
    switch (type) {
        case "qualitativo":
            return data.gpx.wpt.some((elem, index) => {
                if (!!data.gpx.wpt[index + 1]) {
                    if (!data.gpx.wpt[index + 1].name.includes("Remover")) {
                        return elem.name[0] === param
                    }
                }
            })
            break;

        case "sinalizacao_horizontal_qte":
            return data.gpx.wpt.reduce((sum, elem, index) => {
                if (!!data.gpx.wpt[index + 1]) {
                    if (!data.gpx.wpt[index + 1].name[0].includes("Remover")) {
                        if (elem.name[0] === param) {
                            return sum + 1
                        } return sum
                    } return sum
                } return sum
            }, 0)
            break;

        case "controle_de_velocidade_qte":
            return data.gpx.wpt.reduce((sum, elem, index) => {
                if (!!data.gpx.wpt[index + 1]) {
                    if (!data.gpx.wpt[index + 1].name[0].includes("Remover")) {
                        if (elem.name[0] === param) {
                            return sum + 1
                        } return sum
                    } return sum
                } else if (elem.name[0] === param) {
                    return sum + 1
                } return sum
            }, 0)
            break;
        case "iluminacao_estrutura_qte":
            return data.gpx.wpt.reduce((sum, elem, index) => {
                if (!!data.gpx.wpt[index + 1]) {
                    if (!data.gpx.wpt[index + 1].name[0].includes("Remover")) {
                        if (elem.name[0] === param) {
                            return sum + 1
                        } return sum
                    } return sum
                } else if (elem.name[0] === param) {
                    return sum + 1
                } return sum
            }, 0)
            break;


        // case adaptado para quem fez avalia;'ao no comeco e esqueceu de atualizar o app
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
            })
            return value;
            break;

        default:
            break;
    }

}

processarTodosArquivosGpx()