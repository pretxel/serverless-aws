const _ = require('lodash');
const F1Service = require('./services/f1').default;
const AirtableService = require('./services/airtable').default;


if (!global._babelPolyfill) {
    require("babel-polyfill");
}

// Order the best pit stop by driver
const calculateBestPitstop = (allPitStops) => {
    const orderPitStop = _.orderBy(allPitStops.map(pitStop =>  Object.assign({},pitStop,{duration:parseFloat(pitStop.duration)})), ['duration']);
    return orderPitStop[0];
}


// Filter by driverId
const driverPitStop = (driver, pitStops) => {
    const pitStopFlat = _.flatten(pitStops)
    const allPitStops = pitStopFlat.filter(pitstop => pitstop.driverId === driver.driverId);
    const bestPitStopDuration = calculateBestPitstop(allPitStops).duration;
    return Object.assign({}, driver, {bestPitStopDuration});
}

// Generate the final list of driver with best pit stop
const generateDriversPitstops = (drivers, pitStops) => {
    return drivers.map(driver => driverPitStop (driver, pitStops)) ;
}



exports.f1 = async(event, context, callback) => {
    try{
        // Only 2020
        const currentYear = 2020;
        const f1Service = new F1Service({year: currentYear})
        const airtableService = new AirtableService(
            process.env.AIRTABLE_BASE_ID, 
            process.env.AIRTABLE_API_KEY, 
            process.env.AIRTABLE_TABLE
        );

        // Get drivers and pit stops
        const [drivers, allPitStops] = await Promise.all([
            f1Service.getDrivers(), 
            f1Service.getAllPitstops()
        ]);

        const driversPitStop = generateDriversPitstops(drivers, allPitStops)

        // Update all drivers to airtable
        const resultsSettled = await Promise.allSettled(
            driversPitStop.map(driverPitStip => 
                airtableService.addDriver(
                    {driverId: driverPitStip.driverId, 
                    driverName: `${driverPitStip.givenName} ${driverPitStip.familyName}`, 
                    urlImage: driverPitStip.image, 
                    bestPitStopDuration: driverPitStip.bestPitStopDuration
                })
            )
        );
                
        // Collect all errors
        const errors = resultsSettled.filter(settled => settled.status === 'rejected');

        const response = {
            statusCode: 200,
            body: JSON.stringify({driversPitStop, warning: errors}),
        };
        return callback(null, response);
    }catch(e){
        return callback(Error(e));
    }
}