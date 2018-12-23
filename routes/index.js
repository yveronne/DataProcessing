const axios = require('axios');
const Excel = require('exceljs');

module.exports = (app) => {

    app.get('/datas', function (req, res) {
        axios.get('http://localhost:3000/api/datas')
            .then(function (response) {
                res.status(200).send(response.data)
            })
            .catch(function (error) {
                res.status(400).send(error.response.data.errors[0].message)
            })
    });

    app.get('/archived', function(req, res){
        const start = req.query.start;
        const end = req.query.end;
        axios.get('http://localhost:3000/api/datasInterval?start='+ start +'&end='+ end)
            .then(function (response) {
                const datas = response.data;
                const workbook = new Excel.Workbook();
                workbook.creator = 'Weather_Station';
                workbook.created = new Date();
                const sheet = workbook.addWorksheet('Données météorologiques du '+start+ ' au '+end);

                sheet.columns = [
                    {header: 'Date', key: 'date', width: 20},
                    {header: 'Type de données', key: 'type', width: 10},
                    {header: 'Valeur', key: 'value', width: 10},
                    {header: 'Capteur', key: 'sensor', width: 10},
                ];

                datas.forEach(function(data){
                    sheet.addRow({date: data.date, type: data.type, value: data.value, sensor: data.sensorID});
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
                // res.status(400).send(error.response.data.errors[0].message);
                res.status(400).send(error);
            })
    });

    app.post('/datas', function (req, res) { // todo validation and errors & success messages
        const errors = [];
        const datas = req.body;
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

                    axios.get('http://localhost:3000/api/stations/' + idStation + '/sensors?type=' + type)
                        .then(function (response) {

                            const sensor = response.data;
                            const sensorID = sensor.id;

                            axios.post('http://localhost:3000/api/' + sensorID + '/datas', {
                                type: type,
                                value: value,
                                sensorID: sensorID,
                                date: date
                            })
                                .then(function (response) {

                                })
                                .catch(function (error) {
                                    errors.push(error.response.data.errors[0].message);
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
            axios.put('http://localhost:3000/api/stations/' + idStation, {
                latitude: latitude,
                longitude: longitude
            })
                .then(function (response) {

                })
                .catch(function (error) {
                    // res.status(400).send(error)
                    errors.push(error.response.data.errors[0].message);
                    console.log(errors);

                })
        });
        if(errors.length > 0){
            res.status(400).send(errors);
        }
        else res.status(200).send({
            message: "Les données ont été correctement insérées"
        })

    });

    app.get('/forecastdatas', function (req, res) {
        axios.get('http://localhost:3000/api/forecastdatas')
            .then(function (response) {
                res.status(200).send(response.data)
            })
            .catch(function (error) {
                res.status(400).send(error.response.data.errors[0].message)
            })
    });


};