const AirtablePlus = require('airtable-plus');

export default class AirtableService {

    constructor(baseID, apiKey, tableName){
        this.airtable = new AirtablePlus({
            baseID,
            apiKey,
            tableName,
        });
    }

    addDriver ({driverId, driverName, urlImage, bestPitStopDuration}){
        return this.airtable.create(
            {driverId, 
            'Driver Name': driverName, 
            'Image': [{
                url: urlImage
            }],
            'Best Pits Stop Duration': bestPitStopDuration
            });
    }

}