document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fetchData').addEventListener('click', function() {
        const sites = document.getElementById('sites').value || 'Helsinki';
        const starttime = new Date(document.getElementById('starttime').value).toISOString();
        const endtime = new Date(document.getElementById('endtime').value).toISOString();
        const timestep = parseInt(document.getElementById('timestep').value) * 60 * 1000; // Convert to milliseconds

        const SERVER_URL = "http://opendata.fmi.fi/wfs";
        const STORED_QUERY_OBSERVATION = "fmi::observations::weather::multipointcoverage";

        const connection = new fi.fmi.metoclient.metolib.WfsConnection();
        if (connection.connect(SERVER_URL, STORED_QUERY_OBSERVATION)) {
            connection.getData({
                requestParameter: "td",
                begin: new Date(starttime),
                end: new Date(endtime),
                timestep: timestep,
                sites: sites,
                callback: function(data, errors) {
                    handleCallback(data, errors);
                    connection.disconnect();
                }
            });
        } else {
            console.error("Failed to connect to the WFS server.");
            document.getElementById('weatherData').innerHTML = "<p>Failed to connect to the WFS server.</p>";
        }
    });

    function handleCallback(data, errors) {
        if (errors) {
            console.error("Error fetching data:", errors);
            document.getElementById('weatherData').innerHTML = `<p>Error fetching data: ${errors}</p>`;
            return;
        }

        let result = "<h2>Weather Observations:</h2>";

        // Process the data (assuming it's in XML format)
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "application/xml");

        // Handle XML namespaces
        const namespaces = {
            wfs: "http://www.opengis.net/wfs/2.0",
            gml: "http://www.opengis.net/gml/3.2",
            om: "http://www.opengis.net/om/2.0"
        };

        const members = xmlDoc.getElementsByTagNameNS(namespaces.wfs, "member");

        for (let i = 0; i < members.length; i++) {
            const station = members[i];
            const stationNameElem = station.getElementsByTagNameNS(namespaces.gml, "name")[0];
            const stationName = stationNameElem ? stationNameElem.textContent : 'N/A';

            const resultElements = station.getElementsByTagNameNS(namespaces.om, "result");

            let temperature = null;
            let windSpeed = null;

            for (let j = 0; j < resultElements.length; j++) {
                const resultElement = resultElements[j];
                const observedPropertyElems = resultElement.getElementsByTagNameNS(namespaces.om, "observedProperty");
                const observedProperty = observedPropertyElems.length > 0 ? observedPropertyElems[0] : null;
                const propertyHref = observedProperty ? observedProperty.getAttributeNS("http://www.w3.org/1999/xlink", "href") : null;

                if (propertyHref && propertyHref.includes("t2m")) {
                    const valueElem = resultElement.getElementsByTagNameNS(namespaces.gml, "value")[0];
                    temperature = valueElem ? valueElem.textContent : 'N/A';
                } else if (propertyHref && propertyHref.includes("ws_10min")) {
                    const valueElem = resultElement.getElementsByTagNameNS(namespaces.gml, "value")[0];
                    windSpeed = valueElem ? valueElem.textContent : 'N/A';
                }
            }

            if (temperature && windSpeed) {
                result += `<p><strong>${stationName}</strong><br>Temperature: ${temperature} °C<br>Wind Speed: ${windSpeed} m/s</p>`;
            }
        }

        document.getElementById('weatherData').innerHTML = result;
    }
});
