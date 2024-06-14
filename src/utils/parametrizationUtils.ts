import { iDataForms, iGPXData, iGPXNode, iDataFormsMetadata } from '../interfaces';
import { readJSONFileSync } from './fileUtils';
import { iDuo, iDuos } from '../interfaces/iDuos';

export function applyParametrization(data: iDataForms, result: iGPXData, fileName: string) {
    for (const propriedade in data) {
        if (propriedade === "metadata") {
            data[propriedade] = parametrization(result, fileName, propriedade);
        } else if (propriedade !== "resume") {
            for (const key in data[propriedade]) {
                data[propriedade][key] = parametrization(result, key, propriedade);
            }
        }
    }

    function setData(param: string) {
        return Object.keys(data[param]).filter(key => data[param][key] !== 0).join(', ')
    }


    if (!data.err) {
        data.resume.timestamp = data.metadata["Carimbo de data/hora"];
        data.resume.evaluator_1 = data.metadata["Avaliador(a) 1"];
        data.resume.evaluator_2 = data.metadata["Avaliador(a) 2"];
        data.resume.date = data.metadata["Data"];
        data.resume.start_time = data.metadata["Hora Início"];
        data.resume.end_time = data.metadata["Hora Fim"];
        data.resume.street = data.metadata["Ciclofaixa Rua do Futuro"];
        data.resume.section_start = "DEFINIR";
        data.resume.section_end = "DEFINIR";
        data.resume.section_name = data.metadata["trecho"];
        data.resume.typology = data.metadata["tipologia"];
        data.resume.seg_length = data.metadata["extensao_km"];

    }
    data.resume.typology_evaluate = setData("tipo_da_via");
    data.resume.flow_direction = setData("fluxo-ciclo");
    data.resume.traffic_flow = setData("fluxo-via");
    data.resume.localization = setData("localizacao_via");
    data.resume.speed_limit = setData("placas").split(", ").filter((placa) => placa.includes("km")).join(", ");
    data.resume.contiguos_lanes = setData("faixas_via");
    data.resume.segregator_type = setData("segregadores");
    data.resume.protection_conditions_evaluation = setData("protecao");
    data.resume.access_evaluation = setData("segregadores_avaliacao");
    data.resume.all_access_count = Object.keys(data["acesso_ciclovias"]).reduce((acc, crr) => Number(data["acesso_ciclovias"][crr]) + acc, 0);
    data.resume.way_with_access = data.acesso_ciclovias["Via transversal COM acesso à ciclovia"];
    data.resume.ways_without_access = data.acesso_ciclovias["Via transversal SEM acesso à ciclovia"];
    data.resume.ways_access_ath_allows_car_intrusion = data.acesso_ciclovias["Acesso sem uma via transversal"];
    data.resume.pavement_type = setData("pavimento");
    data.resume.pavement_condition_evaluation = setData("pavimento_avaliacao");
    data.resume.sinuosity_evaluation = setData("sinuosidade");
    data.resume.shading_evaluation = setData("sombreamento");
    data.resume.car_risk_situations = setData("riscos");
    data.resume.bus_stops_along = data.riscos["Ponto de embarque de ônibus interrompe a ciclo"];
    data.resume.crossings_no_speed_reduction = "DEFINIR";
    data.resume.conversion_path_allows_car_intrusion = "DEFINIR";
    data.resume.structure_side_change_without_speed_reducers_or_lights = data.riscos["A ciclo troca de lado na via, sem redutores de velocidade ou semáforos"];
    data.resume.car_turning_left_with_cyclist_invisibility = "DEFINIR";
    data.resume.structure_abrupt_end_in_counterflow = data.riscos["Termina ciclo com ciclista na contramão"];
    data.resume.other_car_risk_situations = data.riscos["Outro risco. EXPLIQUE."];
    data.resume.all_risks_situations_count = Object.keys(data["riscos"]).reduce((sum, risc_name) => Number(data["riscos"][risc_name]) + sum, 0);
    data.resume.permanent_obstacles_asphalt_related = setData("obstaculos_qte");
    data.resume.manhole_covers = data.obstaculos_qte["Bueiro"];
    data.resume.roots = data.obstaculos_qte["Raíz"];
    data.resume.potholes = data.obstaculos_qte["Buraco"];
    data.resume.deep_gutters_along_structure = data.obstaculos_qte["Vala profunda"];
    data.resume.unevenness_obstacles = data.obstaculos_qte["Desnível"];
    data.resume.other_obstacles = data.obstaculos_qte["Outro obstáculo"];
    data.resume.all_obstacles_count = Object.keys(data["obstaculos_qte"]).reduce((sum, obstacle_name) => Number(data["obstaculos_qte"][obstacle_name]) + sum, 0);
    data.resume.if_gutters_width = "DEFINIR";
    data.resume.ridable_width = data.larguras_estrutura_qte["Área transitável da ciclo (cm)"];
    data.resume.buffer_width = data.larguras_estrutura_qte["Área de amortecimento da ciclo (cm)"];
    data.resume.side_lane_width = data.larguras_estrutura_qte["Faixa de carros logo ao lado da ciclo (cm)"];
    data.resume.road_width = data.larguras_estrutura_qte["Total da via (incluindo a ciclo) (cm)"];
    data.resume.parking = setData("estacionamento_na_via");
    data.resume.max_speed_control = setData("controle_de_velocidade_qte");
    data.resume.vertical_speed_signs_count = "DEFINIR";
    data.resume.horizontal_speed_sign_count = data.controle_de_velocidade_qte["Pintura da velocidade no piso"];
    data.resume.pedestrian_crossings_count = data.controle_de_velocidade_qte["Travessia de pedestre em nível (lombofaixa)"];
    data.resume.speed_bumps_count = data.controle_de_velocidade_qte["Lombadas físicas"];
    data.resume.electronic_speed_control_count = data.controle_de_velocidade_qte["Radar/Lombada Eletrônica"];
    data.resume.other_control_elements_count = data.controle_de_velocidade_qte["Outro controle"];
    data.resume.start_indication = "DEFINIR";
    data.resume.end_indication = "DEFINIR";
    data.resume.on_way_vertical_signs_count = data.placas["R-34"];
    data.resume.crosses_with_vertical_sign_count = "DEFINIR";
    data.resume.crosses_without_vertical_sign_count = "DEFINIR";
    data.resume.horizontal_pattern_evaluation = setData("padrao_de_pintura_vermelha");
    data.resume.painting_condition_evaluation = setData("pintura_vermelha_situacao");
    data.resume.good_conditions_crossing_signs = data.sinalizacao_horizontal_qte["Em cruzamento BOA condição"];
    data.resume.bad_conditions_crossing_signs = data.sinalizacao_horizontal_qte["Em cruzamento MÁ condição"];
    data.resume.no_visible_crossing_signs = "DEFINIR";
    data.resume.pictograms_along_structure_existence = "DEFINIR";
    data.resume.good_conditions_picto_signs = data.sinalizacao_horizontal_qte["Pictograma BOA condição"];
    data.resume.bad_conditions_picto_signs = data.sinalizacao_horizontal_qte["Pictograma MÁ condição"];
    data.resume.arrows_along_structure_existence = "DEFINIR";
    data.resume.good_conditions_arrow_signs = data.sinalizacao_horizontal_qte["Seta BOA condição"];
    data.resume.bad_conditions_arrow_signs = data.sinalizacao_horizontal_qte["Seta MÁ condição"];;
    data.resume.dedicated_ligthing = data.iluminacao_estrutura_qte["Iluminação dedicada para ciclistas"];
    data.resume.same_side_ligthing = data.iluminacao_estrutura_qte["Iluminação geral na via do mesmo lado da estrutura"];
    data.resume.other_side_ligthing = data.iluminacao_estrutura_qte["Iluminação geral na via do outro lado da infraestrutura"];
    data.resume.notes_comments = "";
    data.resume.front_page_photo = "DEFINIR";
    data.resume.back_page_photo = "DEFINIR";
    data.resume.structure_photos = "DEFINIR";
    data.resume.comments = "DEFINIR";
    data.resume.geo_id = "DEFINIR";
    data.resume.form_id = "DEFINIR";
}

export function parametrization(data: iGPXData, param: string, type: string) {
    const dadosAreaAvaliacao = readJSONFileSync("./src/references/area.json");
    const duplas: iDuos = readJSONFileSync("./src/references/duos.json");
    switch (type) {
        case "metadata":
            const codigo_da_area = data.gpx.metadata[0].desc[0].toLowerCase();
            const result = dadosAreaAvaliacao.find((elem: iDataFormsMetadata) => {
                const codigo = elem.cod.toLowerCase();
                return codigo.includes(codigo_da_area);
            });
            if (result) {
                result["cod"] = codigo_da_area;
            } else {
                return { "err": `No arquivo GPX '${param.replace(".gpx", "")}', o código da ciclo parece ter algo errado... cod: ${codigo_da_area}` }
            }

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
                    const timestamp = matchTimestamp[0];
                    result["Carimbo de data/hora"] = timestamp
                } else {
                    result["Carimbo de data/hora"] = "Falha ao encontrar Data e Hora";
                    result["Data"] = "Falha ao encontrar Data";
                    result["Hora Início"] = "Falha ao encontrar Hora Início";

                }

                const regexDate = /\d{4}-\d{2}-\d{2}/;
                const matchDate = fileName.match(regexDate);

                if (matchDate) result["Data"] = matchDate[0]

                const regexTime = /_(\d{2}-\d{2}-\d{2})/;
                const matchTime = fileName.match(regexTime);

                if (matchTime) result["Hora Início"] = matchTime[1]

            }

            setTimestamps();
            setDuoNames();

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
            break;

        case "outros":
            if (param === "Remover") return data.gpx.wpt.reduce((acc, crr) => {
                if (crr.name[0].includes(param)) {
                    return acc + 1;
                };
                return acc;
            }, 0);
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
