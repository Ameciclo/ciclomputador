export default interface iGPXData {
    gpx: {
        $: {
            xmlns: string;
            version: string;
            creator: string;
            'xmlns:xsi': string;
            'xsi:schemaLocation': string;
        };
        metadata: any; 
        wpt: any[]; 
        trk: any[]; 
    };
}
