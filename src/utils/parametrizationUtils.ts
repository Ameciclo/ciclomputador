import { iDataForms, iGPXData, iGPXNode, iDataFormsMetadata } from '../interfaces';
import { readJSONFileSync } from './fileUtils';
import { iDuo, iDuos } from '../interfaces/iDuos';

export function applyParametrization(data: iDataForms, result: iGPXData, fileName: string) {
    for (const propriedade in data) {
        if (propriedade === "metadata") {
            data[propriedade] = parametrization(result, fileName, "metadata");
        } else {
            for (const key in data[propriedade]) {
                data[propriedade][key] = parametrization(result, key, propriedade);
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
            if (result) {
                result["cod"] = codigo_da_area;
            } else {
                return `No arquivo GPX '${param.replace(".gpx", "")}', o código da ciclo parece ter algo errado... cod: ${codigo_da_area}`
            }
            let names;
            const foundDuo = duplas.find((dupla: iDuo) => dupla["cod"] === result["dupla"]);
            if (foundDuo) {
                names = foundDuo.names.join(" e ");
            } else {
                names = result["dupla"];
            }
            result["dupla"] = names;

            return result;
            break;

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
                        if (elem.name[0] === param) {
                            value = parseFloat(data.gpx.wpt[index + 1].name[0].replace('cm', ''));
                        }
                    }
                }
            });
            return value;
        default:
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
            break;
    }




}
