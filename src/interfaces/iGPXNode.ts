export default interface iGPXNode {
    $: {
        lat: string;
        lon: string;
    };
    ele: string[];
    time: string[];
    name: string[];
    sat: string[];
}
