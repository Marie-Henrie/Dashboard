async function addCatToTieto() {

    try {
        const apiUrl = 'https://data.fingrid.fi/api/datasets/30';
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
            'x-api-key': '573e8b8a70c64554bc134ffdeb9f82ec'
            }    
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log("name",data);
        console.log("name",data.nameFi);
        console.log("name",data.unitFi);
        console.log("name",data.id);
        const combinedData = "nameFi:"+ data.nameFi +"\n" + "unitFi:" + data.unitFi;

        //saveCsvToFile(data.nameFi.toString(), "example.txt");
        saveCsvToFile(combinedData, "example.txt");
    } catch (error) {
        console.error('Error fetching data:', error);
    }

         
 
}
const fs = require('fs');

function saveCsvToFile(text, filename) {
    fs.writeFile(filename, text, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('File saved as', filename);
        }
    });
}



// Call the function to add fetched data to the elements
addCatToTieto();
