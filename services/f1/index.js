const got = require('got');
const slug = require('slug')

export default class F1Service {

    constructor({year}){
        this.BASE_URL = 'http://ergast.com/api/f1';
        this.CONTENT_URL = 'https://www.formula1.com/content/fom-website';
        this.RESPONSE_TYPE = '.json';
        this.YEAR = year;
    }

    parseJSON(response) {
        if (response.statusCode !== 200){
            throw Error('Internal Error');
        }
        const bodyJSON = JSON.parse(response.body);

        if (!bodyJSON.MRData){
            throw Error('Internal Error');
        }

        return bodyJSON.MRData;
    }
 

    async getDrivers(){
        const driversResponse = await got(`${this.BASE_URL}/${this.YEAR}/drivers${this.RESPONSE_TYPE}`);

        const bodyJSON = this.parseJSON(driversResponse);
        let drivers  = [];

        if (bodyJSON.DriverTable && bodyJSON.DriverTable.Drivers){
            const {Drivers:driversRaw } = bodyJSON.DriverTable;
            drivers= driversRaw.map(dRaw => (
                {   driverId: dRaw.driverId, 
                    givenName: dRaw.givenName , 
                    familyName:dRaw.familyName,
                    slugName: `${slug(`${dRaw.givenName} ${dRaw.familyName}`)}`,
                    image: `${this.CONTENT_URL}/en/drivers/${slug(`${dRaw.givenName} ${dRaw.familyName}`)}/_jcr_content/image.img.1024.medium.jpg/1584013014200.jpg`
                })
            );
        }

        return drivers;
    }


    async getRaces(){
        const racesResponse = await got(`${this.BASE_URL}/${this.YEAR}/results${this.RESPONSE_TYPE}?limit=1000`);
  
        let races = [];

        const bodyJSON = this.parseJSON(racesResponse);

        if (bodyJSON.RaceTable && bodyJSON.RaceTable.Races){
            const {Races:racesRaw } = bodyJSON.RaceTable;
            races = racesRaw;
        }

        return races
    }

    async getPitspot (round){
        const pitstopsResponse = await got(`${this.BASE_URL}/${this.YEAR}/${round}/pitstops${this.RESPONSE_TYPE}?limit=1000`);
        const bodyJSON = this.parseJSON(pitstopsResponse);
        let pitstops = [];
        if (bodyJSON.RaceTable && bodyJSON.RaceTable.Races){
            const {Races:racesRaw } = bodyJSON.RaceTable;
            pitstops = racesRaw[0].PitStops;
        }
        return pitstops;
    }

    async getAllPitstops(){

        const races = await this.getRaces();
    
        const allpitstipSettled = await Promise.allSettled(races.map(( race , index ) => this.getPitspot((index + 1))));

        const allPitStop = allpitstipSettled.filter(pitSettled => pitSettled.status === 'fulfilled').map(pitVal => pitVal.value);

        return allPitStop;
    }

}

