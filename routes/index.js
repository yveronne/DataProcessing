const axios = require('axios');
const Excel = require('exceljs');
const dataStorageURL = "http://46.101.191.86:3000";
const dataURL = "http://192.168.8.100:5002/data";

module.exports = (app) => {

    app.get('/datas', function (req, res) {
        axios.get(dataStorageURL+'/api/datas')
            .then(function (response) {
                res.status(200).send(response.data)
            })
            .catch(function (error) {
                res.status(400).send({"message" : "Une erreur est survenue"})
            })
    });

    app.get('/archived', function(req, res){
        const start = req.query.start;
        const end = req.query.end;

        axios.get(dataStorageURL+'/api/stations')
            .then(function(response){
                const stations = response.data;

                axios.get(dataStorageURL+'/api/datasInterval?start='+ start +'&end='+ end)
                    .then(function (response) {
                        const datas = response.data;
                        const workbook = new Excel.Workbook();
                        workbook.creator = 'Weather_Station';
                        workbook.created = new Date();
                        const sheet = workbook.addWorksheet('Données météorologiques du '+start+ ' au '+end);

                        sheet.columns = [
                            {header: 'Date', key: 'date', width: 30},
                            {header: 'Type de données', key: 'type', width: 30},
                            {header: 'Valeur', key: 'value', width: 30},
                            {header: 'Station', key: 'station', width: 30},
                        ];

                        datas.forEach(function(data){
                            var statie = stations.find(function(station){
                                return station.id === data.sensor.stationID;
                            });
                            sheet.addRow({date: data.date, type: data.type, value: data.value, station : statie.name});
                        });

                        if(req.query.format === 'csv'){
                            workbook.csv.writeFile('./files/Datas_'+start+'_'+end+'.csv')
                                .then(function(){
                                    res.download('./files/Datas_'+start+'_'+end+'.csv');
                                })
                                .catch(function(error){
                                    res.status(400).send(error);
                                });
                        }
                        else {
                            workbook.xlsx.writeFile('./files/Datas_'+start+'_'+end+'.xlsx')
                                .then(function(){
                                    res.download('./files/Datas_'+start+'_'+end+'.xlsx');
                                })
                                .catch(function(error){
                                    res.status(400).send(error);
                                });
                        }


                    })
                    .catch(function (error) {
                        res.status(400).send(error);
                    })
            });

    });

    const getDatas = () => axios.get(dataURL)
        .then(function(response){
            const errors = [];
            const datas = response.data.data;
            /*const datas = [
                {
                    "date" : 'February 1, 2019 16:27:00',
                    "id" : 45,
                    "latitude" : 24,
                    "longitude" : 120,
                    "temperature" : 200,
                    "humidite" : 50,
                    "pression" : 10,
                    "lumiere" : 60,
                },
                {
                    "date" : 'February 1, 2019 16:27:00',
                    "id" : 1,
                    "latitude" : 24,
                    "longitude" : 120,
                    "temperature" : 120,
                    "humidite" : 40,
                    "pression" : 50,
                    "lumiere" : 85,
                },
                {
                    "date" : 'February 1, 2019 16:27:00',
                    "id" : 1,
                    "latitude" : 24,
                    "longitude" : 120,
                    "temperature" : 110,
                    "humidite" : 45,
                    "pression" : 15,
                    "lumiere" : 15,
                },
                {
                    "date" : 'February 1, 2019 16:27:00',
                    "id" : 1,
                    "latitude" : 34,
                    "longitude" : 150,
                    "temperature" : 150,
                    "humidite" : 48,
                    "pression" : 17,
                    "lumiere" : 10,
                }
            ];*/
            console.log(datas);
            datas.forEach(data => {

                //Insert the datas of the station

                var idStation = null;
                var latitude = null;
                var longitude = null;
                var keys = Object.keys(data);  // get the keys of the json array representing the datas of the station
                var values = Object.values(data); //get the values

                for (var i = 0; i < keys.length; i++) {
                    idStation = data.id;
                    latitude = data.latitude;
                    longitude = data.longitude;

                    if(keys[i] !== 'id' && keys[i] !== 'date' && keys[i] !== 'latitude' && keys[i] !== 'longitude') {

                        const type = keys[i];
                        const value = values[i];
                        const date = new Date(data.date);

                        axios.get(dataStorageURL+'/api/stations/' + idStation + '/sensors?type=' + type)
                            .then(function (response) {

                                const sensor = response.data;
                                const sensorID = sensor.id;

                                axios.post(dataStorageURL+'/api/' + sensorID + '/datas', {
                                    type: type,
                                    value: value,
                                    sensorID: sensorID,
                                    date: new Date(date*1000)
                                })
                                    .then(function (response) {

                                    })
                                    .catch(function (error) {
                                        errors.push("Erreur lors de l'enregistrement des données");
                                        console.log(errors);
                                        console.log(errors.length);

                                    })
                            })
                            .catch(function (error) {
                                errors.push(error);
                                console.log(errors);


                            })
                    }
                }
                axios.put(dataStorageURL+'/api/stations/' + idStation, {
                    latitude: latitude,
                    longitude: longitude
                })
                    .then(function (response) {

                    })
                    .catch(function (error) {
                        // res.status(400).send(error)
                        errors.push("Une erreur est survenue lors de la modification de la station");
                        console.log(errors);

                    })
            });
            if(errors.length > 0){
                console.log(errors);
            }
            else console.log("Ok!")
    });

    setInterval(getDatas, 2000);

    app.get('/forecastdatas', function (req, res) {
        axios.get(dataStorageURL+'/api/forecastdatas')
            .then(function (response) {
                res.status(200).send(response.data)
            })
            .catch(function (error) {
                res.status(400).send(error.response.data.errors[0].message)
            })
    });

};