document.getElementById('ipv4Form').addEventListener('submit', function (event) {
    event.preventDefault();


    const ipv4 = document.getElementById('ipv4').value;
    const prefix = parseInt(document.getElementById('prefix').value);

    if (!isValidIPv4(ipv4)) {
        alert('Por favor, ingresa una dirección IPv4 válida.');
        return;
    }

    if (prefix < 1 || prefix > 32) {
        alert('Por favor, ingresa un prefijo entre 1 y 32.');
        return;
    }

    const ajax_url_load_v4 = "https://www.iptp.net/en_US/page-load-ajax-v4";

    $.ajax({
        type: "post",
        dataType: "json",
        url: ajax_url_load_v4,
        data: {
            action: "ipv4",
            csubnet: prefix,
            cip: ipv4,
        },
        success: function (response) {
            if (response.data) {
                const jsonData = convertHtmlToJson(response.data);





                // Extraer información del JSON
                const ipUtil = jsonData['Network Address:'];
                const broadcastIP = jsonData['Broadcast Address:'];
                const usableRange = jsonData['Usable Host IP Range:'].split(' - ');
                const usableStart = usableRange[0];
                const usableEnd = usableRange[1];
                const highlightedBinary = formatBinaryIPv4(jsonData['Binary ID:'], prefix);
                const subnetMask = jsonData['Subnet Mask:'];
                const ipClass = determineIPClass(ipv4);
                const isPrivate = isPrivateIP(ipv4) ? 'Sí' : 'No';

                const hexID = jsonData['Hex ID:'];
                const iPv4MappedAddress = jsonData['IPv4 Mapped Address:'];
                const totalHosts = jsonData['Total Number of Hosts:'];
                const usableHosts = jsonData['Number of Usable Hosts:'];

                // Mostrar detalles en la interfaz
                document.getElementById('ipv4Info').innerHTML = `
                    <strong>Dirección IPv4:</strong> ${ipv4}<br>
                    <strong>Prefijo:</strong> ${prefix}<br>
                    <strong>IPv4 en Binario:</strong> ${highlightedBinary}<br>
                    <strong>Máscara de Subred:</strong> ${subnetMask}<br>
                    <strong>Total de Hosts:</strong> ${totalHosts}<br>
                    <strong>Número de Hosts Usables:</strong> ${usableHosts}
                `;

                document.getElementById('networkDetails').innerHTML = `
                    <strong>IP de Red:</strong> ${ipUtil}<br>
                    <strong>Dirección de Broadcast:</strong> ${broadcastIP}<br>
                    <strong>Rango de IP útiles:</strong> ${usableStart} - ${usableEnd}<br>
                    <strong>IPv4 Mapped Address:</strong> ${iPv4MappedAddress}<br>
                              <strong>Hex ID:</strong> ${hexID}<br>
                `;

                document.getElementById('classificationDetails').innerHTML = `
                    <strong>Clase de IP:</strong> ${ipClass}<br>
                    <strong>¿Es IP privada?</strong> ${isPrivate}
                `;

                // Mostrar el resultado en la interfaz
                $('.kq-ip1').removeClass('d-none');
                $('.kq-ip1').html(JSON.stringify(jsonData, null, 2)); // Mostrar como texto JSON
                document.getElementById('result').classList.remove('d-none');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Error en la solicitud: ' + textStatus);
        }
    });

});


function formatBinaryIPv4(binary, prefix) {
    // Dividir la dirección binaria en cuatro grupos de 8 bits
    const groups = [];
    for (let i = 0; i < 4; i++) {
        const start = i * 8;
        const end = start + 8;
        groups.push(binary.slice(start, end));
    }

    // Resaltar los bits del prefijo en rojo
    const highlightedBinary = groups.map((group, index) => {
        if (index < Math.floor(prefix / 8)) {
            return `<span style="color: red;">${group}</span>`; // Resaltar grupos completos
        } else if (index === Math.floor(prefix / 8)) {
            const bitsToHighlight = prefix % 8;
            return `<span style="color: red;">${group.slice(0, bitsToHighlight)}</span>${group.slice(bitsToHighlight)}`; // Resaltar parte del grupo
        }
        return group; // Dejar grupos restantes sin resaltar
    }).join('.'); // Unir grupos con puntos

    return highlightedBinary;
}

function determineIPClass(ipv4) {
    const firstOctet = parseInt(ipv4.split('.')[0]);
    if (firstOctet < 128) return 'A';
    else if (firstOctet < 192) return 'B';
    else if (firstOctet < 224) return 'C';
    else if (firstOctet < 240) return 'D';
    return 'E';
}

function isPrivateIP(ipv4) {
    const [firstOctet, secondOctet] = ipv4.split('.').map(Number);
    return (firstOctet === 10) ||
        (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) ||
        (firstOctet === 192 && secondOctet === 168);
}
function convertHtmlToJson(html) {
    var jsonResult = {};
    var $html = $(html); // Convertir el HTML a un objeto jQuery

    // Iterar sobre cada fila de la tabla
    $html.find('tr').each(function () {
        var key = $(this).find('td').eq(0).text().trim();
        var value = $(this).find('td').eq(1).text().trim();
        jsonResult[key] = value; // Agregar al objeto JSON
    });

    return jsonResult;
}

function isValidIPv4(ipv4) {
    const parts = ipv4.split('.');
    return parts.length === 4 && parts.every(part => {
        const num = parseInt(part);
        return num >= 0 && num <= 255;
    });
}
