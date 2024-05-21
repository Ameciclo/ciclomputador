import { iDataForms, iGPXData, iGPXNode, iDataFormsMetadata } from '../interfaces';
import { readJSONFileSync } from './fileUtils';
import { iDuo, iDuos } from '../interfaces/iDuos';

export function applyParametrization(object: iDataForms, result: iGPXData) {
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

export function parametrization(data: iGPXData, param: string, type: string) {
    switch (type) {
        case "metadata":
            const codigo_da_area = data.gpx.metadata[0].desc[0].toLowerCase();
            const dadosAreaAvaliacao = readJSONFileSync("./src/references/area.json");
            const duplas: iDuos = readJSONFileSync("./src/references/duos.json");
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
