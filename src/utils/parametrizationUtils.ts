import { iDataForms, iGPXData, iGPXNode, iDataFormsMetadata, iDataErrors, iCrossData, iCross as iCross, iCiclomapData } from '../interfaces';
import { readJSONFileSync } from './fileUtils';
import { iDuo, iDuos } from '../interfaces/iDuos';

export function applyParametrization(data: any, result: iGPXData, fileName: string) {

    function setDataConcatTrueValues(param: string) {
        return Object.keys(data[param]).filter(key => data[param][key] !== 0).join(', ')
    };

    function setErrors() {
        let error: iDataErrors = {} as iDataErrors;

        const metadataError = () => {
            if (data.metadata.err) {
                error["metadata"] = data.metadata.err as string;
                return error;
            }
        }
        const emptyFieldError = () => {
            Object.keys(data.result).forEach((element) => {
                const validKeys = [
                    "crosses",
                    "typology_mapped",
                    "flow_direction",
                    "traffic_flow",
                    "localization",
                    "contiguos_lanes",
                    "segregator_type",
                    "protection_conditions_evaluation",
                    "pavement_type",
                    "pavement_condition_evaluation",
                    "sinuosity_evaluation",
                    "shading_evaluation",
                    "ridable_width",
                    "buffer_width",
                    "road_width",
                    "horizontal_pattern_evaluation",
                    "painting_condition_evaluation",
                    "no_visible_crossing_signs"
                ];

                const nullElement = (data: iDataForms) => data.result[element] as number <= 0 || data.result[element] === "" || data.result[element] === null || data.result[element] === undefined;
                if (validKeys.includes(element) && nullElement(data)) {
                    if (!error["emptyValues"]) {
                        error["emptyValues"] = [];
                    }
                    error["emptyValues"].push(element);
                }
            });
        };
        const warningsError = () => {
            error["warnings"] = { press_remove_button: 0 };
            error.warnings["press_remove_button"] = data.outros.Remover as number;
        }

        metadataError();
        if (!error.metadata) emptyFieldError()
        warningsError();

        return error;
    };

    function setAppData() {
        for (const propriedade in data) {
            if (propriedade === "metadata") {
                data[propriedade] = parametrization(result, fileName, propriedade);
            } else if (propriedade !== "result") {
                for (const key in data[propriedade]) {
                    data[propriedade][key] = parametrization(result, key, propriedade);
                }
            }
        }
    };

    function setResultData() {
        if (!data.metadata.err) {
            data.result.cod = data.metadata["cod"];
            data.result.timestamp = data.metadata["Carimbo de data/hora"];
            data.result.evaluator_1 = data.metadata["Avaliador(a) 1"];
            data.result.evaluator_2 = data.metadata["Avaliador(a) 2"];
            data.result.date = data.metadata["Data"];
            data.result.start_time = data.metadata["Hora Início"];
            data.result.end_time = data.metadata["Hora Fim"];
            data.result.section_start = "";
            data.result.section_end = "";
            data.result.section_name = data.metadata["trecho"];
            data.result.seg_length = data.metadata["extensao_km"];
        }
        data.result.gpx_name = data.metadata.ciclomapData["gpx_name"];
        data.result.code = data.metadata.ciclomapData["code"];
        data.result.scode = data.metadata.ciclomapData["scode"];
        data.result.city = data.metadata.ciclomapData["city"];
        data.result.street = data.metadata.ciclomapData["street"];
        data.result.typology = data.metadata.ciclomapData["typology"];
        data.result.typology_evaluated = setDataConcatTrueValues("tipo_da_via");
        data.result.crosses = data.metadata.ciclomapData["cruzamentos"];
        data.result.flow_direction = setDataConcatTrueValues("fluxo-ciclo");
        data.result.traffic_flow = setDataConcatTrueValues("fluxo-via");
        data.result.localization = setDataConcatTrueValues("localizacao_via");
        data.result.speed_limit = setDataConcatTrueValues("placas").split(", ").filter((placa) => placa.includes("km")).join(", ");
        data.result.contiguos_lanes = setDataConcatTrueValues("faixas_via");
        data.result.segregator_type = setDataConcatTrueValues("segregadores");
        data.result.protection_conditions_evaluation = setDataConcatTrueValues("protecao");
        data.result.access_evaluation = setDataConcatTrueValues("segregadores_avaliacao");
        data.result.all_access_count = Object.keys(data["acesso_ciclovias"]).reduce((acc, crr) => Number(data["acesso_ciclovias"][crr]) + acc, 0);
        data.result.way_with_access = data.acesso_ciclovias["Via transversal COM acesso à ciclovia"];
        data.result.ways_without_access = data.acesso_ciclovias["Via transversal SEM acesso à ciclovia"];
        data.result.other_access = data.acesso_ciclovias["Acesso sem uma via transversal"];
        data.result.pavement_type = setDataConcatTrueValues("pavimento");
        data.result.pavement_condition_evaluation = setDataConcatTrueValues("pavimento_avaliacao");
        data.result.sinuosity_evaluation = setDataConcatTrueValues("sinuosidade");
        data.result.shading_evaluation = setDataConcatTrueValues("sombreamento");
        data.result.car_risk_situations = setDataConcatTrueValues("riscos");
        data.result.bus_stops_along = data.riscos["Ponto de embarque de ônibus interrompe a ciclo"];
        data.result.structure_side_change_without_speed_reducers_or_lights = data.riscos["A ciclo troca de lado na via, sem redutores de velocidade ou semáforos"];
        data.result.structure_abrupt_end_in_counterflow = data.riscos["Termina ciclo com ciclista na contramão"];
        data.result.other_car_risk_situations = data.riscos["Outro risco. EXPLIQUE."];
        data.result.all_risks_situations_count = Object.keys(data["riscos"]).reduce((sum, risc_name) => Number(data["riscos"][risc_name]) + sum, 0);
        data.result.permanent_obstacles_asphalt_related = setDataConcatTrueValues("obstaculos_qte");
        data.result.manhole_covers = data.obstaculos_qte["Bueiro"];
        data.result.roots = data.obstaculos_qte["Raíz"];
        data.result.potholes = data.obstaculos_qte["Buraco"];
        data.result.deep_gutters_along_structure = data.obstaculos_qte["Vala profunda"];
        data.result.unevenness_obstacles = data.obstaculos_qte["Desnível"];
        data.result.other_obstacles = data.obstaculos_qte["Outro obstáculo"];
        data.result.all_obstacles_count = Object.keys(data["obstaculos_qte"]).reduce((sum, obstacle_name) => Number(data["obstaculos_qte"][obstacle_name]) + sum, 0);
        data.result.ridable_width = data.larguras_estrutura_qte["Área transitável da ciclo (cm)"];
        data.result.buffer_width = data.larguras_estrutura_qte["Área de amortecimento da ciclo (cm)"];
        data.result.road_width = data.larguras_estrutura_qte["Faixa de carros logo ao lado da ciclo (cm)"];
        data.result.parking = setDataConcatTrueValues("estacionamento_na_via");
        data.result.vertical_speed_signs_count = Object.keys(data["placas"]).reduce((sum, plate) => {
            if (plate.includes("km")) {
                return Number(data["placas"][plate]) + sum;
            }
            return sum;
        }, 0)
        data.result.horizontal_speed_sign_count = data.controle_de_velocidade_qte["Pintura da velocidade no piso"];
        data.result.pedestrian_crossings_count = data.controle_de_velocidade_qte["Travessia de pedestre em nível (lombofaixa)"];
        data.result.speed_bumps_count = data.controle_de_velocidade_qte["Lombadas físicas"];
        data.result.electronic_speed_control_count = data.controle_de_velocidade_qte["Radar/Lombada Eletrônica"];
        data.result.differentiated_floor = data.controle_de_velocidade_qte["Piso diferenciado"];
        data.result.other_control_elements_count = data.controle_de_velocidade_qte["Outro controle"];
        data.result.start_indication = Object.keys(data["placas"]).some((tipo) => tipo === "Início" && data.placas[tipo] !== 0);
        data.result.end_indication = Object.keys(data["placas"]).some((tipo) => tipo === "Fim" && data.placas[tipo] !== 0)
        data.result.on_way_vertical_signs_count = data.placas["R-34"];
        data.result.crosses_with_vertical_sign_count = data.placas["A-30"];
        data.result.crosses_without_vertical_sign_count = Number(data.result.crosses) - Number(data.placas["A-30"]);
        data.result.horizontal_pattern_evaluation = setDataConcatTrueValues("padrao_de_pintura_vermelha");
        data.result.painting_condition_evaluation = setDataConcatTrueValues("pintura_vermelha_situacao");
        data.result.good_conditions_crossing_signs = data.sinalizacao_horizontal_qte["Em cruzamento BOA condição"];
        data.result.bad_conditions_crossing_signs = data.sinalizacao_horizontal_qte["Em cruzamento MÁ condição"];
        data.result.no_visible_crossing_signs = Number(data.result.crosses) - Number(data.sinalizacao_horizontal_qte["Em cruzamento MÁ condição"]) - Number(data.sinalizacao_horizontal_qte["Em cruzamento BOA condição"]);
        data.result.good_conditions_picto_signs = data.sinalizacao_horizontal_qte["Pictograma BOA condição"];
        data.result.bad_conditions_picto_signs = data.sinalizacao_horizontal_qte["Pictograma MÁ condição"];
        data.result.good_conditions_arrow_signs = data.sinalizacao_horizontal_qte["Seta BOA condição"];
        data.result.bad_conditions_arrow_signs = data.sinalizacao_horizontal_qte["Seta MÁ condição"];
        data.result.dedicated_ligthing = data.iluminacao_estrutura_qte["Iluminação dedicada para ciclistas"];
        data.result.same_side_ligthing = data.iluminacao_estrutura_qte["Iluminação geral na via do mesmo lado da estrutura"];
        data.result.other_side_ligthing = data.iluminacao_estrutura_qte["Iluminação geral na via do outro lado da infraestrutura"];
        data.result.both_side_ligthing = data.iluminacao_estrutura_qte["Iluminação geral dos dois lados da via"];
        data.result.comments = data.outros["Comentarios"];
        data.result.photos = data.outros["Fotos"];
        data.result.audios = data.outros["Audios"];
        data.result.structure_photos = "";
        data.result.geo_id = "";
        data.result.error = setErrors();
    };

    setAppData();
    setResultData();
}

export function parametrization(data: iGPXData, param: string, type: string) {
    const dadosAreaAvaliacao = readJSONFileSync("./src/references/area.json");
    const dadosAreaAvaliacaoCiclomapa = readJSONFileSync("./src/references/files_and_codes.json")
    const dadosAreaAvaliacaoCruzamentos = readJSONFileSync("./src/references/cruzamentos.json")
    const duplas: iDuos = readJSONFileSync("./src/references/duos.json");
    const params: iDataForms = readJSONFileSync("./src/references/params.json")
    const dadosCruzamentos: iCrossData[] = readJSONFileSync("./src/references/cruzamentos.json")


    switch (type) {
        case "metadata":
            const codigo_da_area = data.gpx.metadata[0].desc ? data.gpx.metadata[0].desc[0].toLowerCase() : "codigo de area nao informado";
            let result: any = {};
            const metadataRefElement = dadosAreaAvaliacao.find((elem: iDataFormsMetadata) => {
                const codigo = elem.cod.toLowerCase();
                return codigo.includes(codigo_da_area);
            });
            result = metadataRefElement ? metadataRefElement : result;
            result["cod"] = codigo_da_area;
            result["gpx_name"] = param;

            function setDuoNames() {
                const foundDuo = duplas.find((dupla: iDuo) => dupla["cod"] === result["dupla"]);
                if (foundDuo) {
                    result["Avaliador(a) 1"] = foundDuo.names[0];
                    result["Avaliador(a) 2"] = foundDuo.names[1];
                }
            }

            function setTimestamps() {
                const fileName = param;

                const regexTimestamp = /\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}/;
                const matchTimestamp = fileName.match(regexTimestamp);

                if (matchTimestamp) {
                    const timestamp = matchTimestamp[0].replace('_', 'T').replace(/-/g, (match, offset) => (offset > 10 ? ':' : '-'));
                    const timestampDateParse = new Date(timestamp);
                    result["Carimbo de data/hora"] = timestampDateParse;
                } else {
                    result["Carimbo de data/hora"] = "Falha ao encontrar Data e Hora";
                    result["Data"] = "Falha ao encontrar Data";
                    result["Hora Início"] = "Falha ao encontrar Hora Início";
                }

                const regexDate = /\d{4}-\d{2}-\d{2}/;
                const matchDate = fileName.match(regexDate);

                if (matchDate) result["Data"] = matchDate[0].split("-").join("/")

                const regexTime = /_(\d{2}-\d{2}-\d{2})/;
                const matchTime = fileName.match(regexTime);

                if (matchTime) result["Hora Início"] = matchTime[1].split("-").join(":");

                const lastPointCap = data.gpx.wpt.pop().time[0];
                const lastTimePointCap = lastPointCap.substr(11, 8);
                result["Hora Fim"] = lastTimePointCap;
            }


            function setCrosses(crossesData: iCrossData[], ciclomapData: iCiclomapData[]) {
                function parseCrosses(dataCrossesArr: iCrossData[]): iCross[] {
                    const result: { [key: string]: iCross } = {};

                    dataCrossesArr.forEach((item) => {
                        const codeStr = item.code.toString().replace(/^0+/, '');
                        if (result[codeStr]) {
                            result[codeStr].cruzamentos += 1;
                        } else {
                            result[codeStr] = { code: item.code, cruzamentos: 1 };
                        }
                    });

                    return Object.values(result);
                }

                const mergeData = (codeCrossesArr: iCross[], ciclomapDataArr: iCiclomapData[]): iCiclomapData[] => {
                    return ciclomapDataArr.map((item) => {
                        const itemCodeStr = item.code.toString().replace(/^0+/, '');
                        const crosses = codeCrossesArr.find((c) => {
                            const crossCodeStr = c.code.toString().replace(/^0+/, '');
                            return crossCodeStr === itemCodeStr;
                        });
                        return {
                            ...item,
                            cruzamentos: crosses ? crosses.cruzamentos : 0,
                        };
                    });
                };

                const crossesByCode = parseCrosses(crossesData);
                const finalCiclomapMetadataObjOfArr = mergeData(crossesByCode, ciclomapData);

                return finalCiclomapMetadataObjOfArr;
            }

            const finalCiclomapData = setCrosses(dadosCruzamentos, dadosAreaAvaliacaoCiclomapa)

            const ciclomapDataRef = finalCiclomapData.find((elem: iCiclomapData) => elem.gpx_name.includes(param));

            result["ciclomapData"] = ciclomapDataRef;
            setTimestamps();
            setDuoNames();

            return result;
            break;

        case "larguras_estrutura_qte":
            let value = 0;
            for (const elem of data.gpx.wpt) {
                const point = elem.name[0];
                const pointIsWidth = /^\d+(cm)?$/.test(point);
                if (pointIsWidth) {
                    const newValue = parseFloat(point.replace("cm", ""));
                    switch (param) {
                        case "Área de amortecimento da ciclo (cm)":
                            if (newValue < 50) {
                                value = newValue;
                            }
                            break;

                        case "Área transitável da ciclo (cm)":
                            if (newValue >= 50 && newValue <= 250) {
                                value = newValue;
                            }
                            break;

                        case "Faixa de carros logo ao lado da ciclo (cm)":
                            if (newValue > 250 && newValue < 800) {
                                value = newValue;
                            }
                            break;

                        case "Total da via (incluindo a ciclo) (cm)":
                            if (newValue >= 800) {
                                value = newValue;
                            }
                            break;

                        default:
                            break;
                    }
                }
            }
            return value;

        case "outros":
            switch (param) {
                case "Remover":
                    return data.gpx.wpt.reduce((acc, crr) => {
                        if (crr.name[0].includes(param)) {
                            return acc + 1;
                        }
                        return acc;
                    }, 0);

                case "Comentarios":
                    return data.gpx.wpt.map((elem) => {
                        const point = elem.name[0];
                        let keys: Array<string> = [];
                        Object.keys(params).forEach(key => {
                            if (typeof params[key] === 'object' && params[key] !== null) {
                                keys = keys.concat(Object.keys(params[key]));
                            }
                        });
                        return keys.some((elem) => elem === point) ? undefined : point;
                    })
                        .filter((elem) => elem)
                        .filter((elem) => elem !== "Foto")
                        .filter((elem) => !/^\d+$/.test(elem))
                        .filter((elem) => !elem.includes("cm"))
                        .filter((elem) => !elem.includes("Remover"))
                        .filter((elem) => !elem.includes("Gravação de voz"));

                case "Fotos":
                    return data.gpx.wpt
                        .map((elem) => elem.link)
                        .filter((elem) => elem)
                        .map((elem) => elem[0].text[0])
                        .filter((elem) => elem.includes(".jpg"));

                case "Audios":
                    return data.gpx.wpt
                        .map((elem) => elem.link)
                        .filter((elem) => elem)
                        .map((elem) => elem[0].text[0])
                        .filter((elem) => elem.includes(".3gpp"));

                default:
                    return null;
            }
            break;

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
