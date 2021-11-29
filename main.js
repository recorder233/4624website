// Firebase App (the core Firebase SDK) is always required and must be listed first
// import firebase from "firebase/app";
// If you are using v7 or any earlier version of the JS SDK, you should import firebase using namespace import
// import * as firebase from "firebase/app"

// Add the Firebase products that you want to use

//sha256 hash of "admin"
var stored_userName = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"

var stored_password = "33445260df1bc49114eeeda3d7e30ea3b4ac318f5e6bb7ad339e6a5a03be9336"

var loginCheck = false

var map

var currFeature

var db

var featureList = []
//database set for the local array
var listSet = {
    recordList: [],
    choiceList: [],
    contactInformationList: [],
    dateList: [],
    geoList: [],
    graphList: [],
    additionalInfoList: [],
    idList: [],
    totalLength: 0
};

async function download() {
    downloadCSV(listSet.recordList)
}



function login_tab(src) {
    if (src) {
        return '<a class="login" href="./logout.html">Logout<\a>'
    }
    else {
        return '<a class="login" href="./login.html">Admin Login<\a>'
    }
}

async function login() {
    var userName = document.getElementById("user-name").value
    var userPass = document.getElementById("user-pass").value

    var nameHash = await encrypt(userName)
    var passHash = await encrypt(userPass)

    if (nameHash == stored_userName && passHash == stored_password) {
        addCookie("userName", nameHash)
        addCookie("userPass", passHash)
        window.location.href = "./home.html"
    }
    else {
        alert("invalid user name or password")
    }
}

function logout() {
    addCookie("userName", "")
    addCookie("userPass", "")
    window.location.href = "./home.html"
}

function login_check() {
    var cookie = document.cookie
    cookie = cookie.split("; ")
    try {
        userName = cookie[0].split("=")[1]
        userPass = cookie[1].split("=")[1]
        if (userName == stored_userName && userPass == stored_password) {
            loginCheck = true
        }
        else {
            loginCheck = false
        }
    }
    catch {
        loginCheck = false
    }
}

async function encrypt(message) {
    var msgBuffer = new TextEncoder().encode(message);
    // hash the message
    var hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    // convert ArrayBuffer to Array
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    // convert bytes to hex string                  
    var hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function addCookie(name, data) {
    var date = new Date()
    date.setMonth(date.getMonth() + 12)
    document.cookie = name + "=" + data + ";expires=" + date + ";path=/"
}


//The async function for getData from Firestore.
async function getData() {
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyB9rBDXS8U1NGi6ZPhZJ-haGdbzA0X0S9Q",
        authDomain: "apptrackwildlifediseases-388bf.firebaseapp.com",
        databaseURL: "https://apptrackwildlifediseases-388bf-default-rtdb.firebaseio.com",
        projectId: "apptrackwildlifediseases-388bf",
        storageBucket: "apptrackwildlifediseases-388bf.appspot.com",
        messagingSenderId: "703120852758",
        appId: "1:703120852758:web:03f40aecdee475eaabb237",
        measurementId: "G-EFTH3P88CH"
    };
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    await db.collection('users').get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                let obj = doc.data()
                listSet.recordList.push(obj)
            });
        })
        .catch((err) => {
            console.log('error getting documents', err)
        })
    await new Promise((resolve, reject)=>{
        setTimeout(() => {
            //set timeout to allow the function have enough time to get the data from firestore and it save in local
            let i = 0
            listSet.totalLength = listSet.recordList.length
            for (i; i < listSet.totalLength; i++) {
                listSet.idList.push(listSet.recordList[i]['UUID'])
                listSet.choiceList.push(listSet.recordList[i]['Choice'])
                listSet.dateList.push(listSet.recordList[i]['Date'])
                listSet.geoList.push(listSet.recordList[i]['Geo Info'])
                listSet.graphList.push(listSet.recordList[i]['ImageURL'])
                listSet.contactInformationList.push(listSet.recordList[i]['Contact Information'])
                listSet.recordList[i]['Longtitude, Latitude'] = listSet.recordList[i]['Geo Info']
                listSet.additionalInfoList.push(listSet.recordList[i]['Additional Information'])
                delete listSet.recordList[i]['Geo Info']
                listSet.recordList[i]['Additional Information'] = listSet.recordList[i]['Additional Information'].replace(/,/g, "_")
            }
            resolve()
    
        }, 500)

    })
    

}


async function buildTable(login){
    await getData()
    var table = document.getElementById("table")
    var tbody = document.createElement("tbody")
    var firstLine = document.createElement("tr")
    var firstCol = document.createElement("td")
    var secondCol = document.createElement("td")
    var thirdCol = document.createElement("td")
    table.replaceChildren()
    table.appendChild(tbody)
    tbody.appendChild(firstLine)
    firstCol.appendChild(document.createTextNode("Time"))
    secondCol.appendChild(document.createTextNode("Uploader"))
    thirdCol.appendChild(document.createTextNode("Picture"))
    firstLine.appendChild(firstCol)
    firstLine.appendChild(secondCol)
    firstLine.appendChild(thirdCol)
    console.log(listSet)
    for (var i = 0; i < listSet.totalLength; i++){
        var line = document.createElement("tr")
        line.id = i
        var time = document.createElement("td")
        time.appendChild(document.createTextNode(listSet.dateList[i]))
        line.appendChild(time)
        var contact = document.createElement("td")
        contact.appendChild(document.createTextNode(listSet.contactInformationList[i]))
        line.appendChild(contact)
        var pictureSlot = document.createElement("td")
        pictureSlot.className = "pictureSlot"
        var picture = document.createElement("img")
        picture.src = listSet.graphList[i]
        picture.width = 200
        picture.height = 225
        pictureSlot.appendChild(picture)
        line.appendChild(pictureSlot)
        table.appendChild(line)
        if(login){
            var removeSlot = document.createElement("td")
            removeSlot.className = "removeSlot"
            var removebut = document.createElement("button")
            removebut.className = "removeButton"
            removebut.onclick = function(action){
                //deleteData(i)
                var currLine = action.originalTarget.parentNode.parentNode
                var index = currLine.id
                
                if (confirm("Are you sure you want to remove this from the database")){
                    currLine.remove()
                    console.log(index)
                    db.collection('users').doc(listSet.idList[index]).delete()
                }
            }
            removebut.appendChild(document.createTextNode("delete"))
            removeSlot.appendChild(removebut)
            line.appendChild(removeSlot)
        }
    }

    
}
//The function to convert json array to csv
function convertArrayOfObjectsToCSV(args) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;
    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = ',';
    lineDelimiter = '\n';

    keys = Object.keys(data[0]);
    console.log(keys)
    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function (item) {
        ctr = 0;
        keys.forEach(function (key) {
            if (ctr > 0) result += columnDelimiter;
            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });
    return result;
}


//The downloadCSV for creating a new CSV file.
function downloadCSV(args) {
    var data, filename, link;
    var csv = convertArrayOfObjectsToCSV({
        data: listSet.recordList
    });
    if (csv == null) return;

    filename = 'firebaseData.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
}

function deleteFromMap(i) {
    if (confirm("Are you sure you want to remove this from the database")){
        map.removeLayer(i.toString())
        db.collection('users').doc(listSet.idList[i]).delete()
    }
}




function showMap(login) {
    // This is to call the getData function for making the json to save into the CSV file.
    getData()
    mapboxgl.accessToken = 'pk.eyJ1IjoiYXBwdHJhY2t3aWxkbGlmZWRpc2Vhc2VzIiwiYSI6ImNrbGk5eXQzazAwYXkydXFhZ2dsbmQ0cWwifQ.z2OPpF0KioD0K4yrAavDgg';
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        //Define the center of the map
        center: [-80.413940, 37.229572],
        zoom: 11.15
    });
    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', function () {
        setTimeout(() => {
            var i = 0
            for (i; i < listSet.totalLength; i++) {
                if (!login) {
                    featureList[i] =
                    // The popup is clicked and if not loged in the following information will shown
                    {
                        'type': 'Feature',
                        'properties': {

                            'description':
                                '<p> ' +
                                'The picture was taken at ' + listSet.dateList[i]
                                + '<br> <img width = "200" height = "225" src ="' + listSet.graphList[i] + '">'
                                + '</p>',
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': listSet.geoList[i]
                        }
                    }
                }
                else {
                    featureList[i] =
                    //The popup is clicked and if loged in the following information will shown
                    {
                        'type': 'Feature',
                        'properties': {

                            'description':
                                '<p> ' +
                                'The picture was taken at ' + listSet.dateList[i]
                                + '<br> <img width = "200" height = "225" src ="' + listSet.graphList[i] + '">'
                                + '</p>' + '<button onclick="deleteFromMap(' + i + ')"class="removeButton">delete</button>',
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': listSet.geoList[i]
                        }
                    }
                }
            }

            map.loadImage(
                'https://image.flaticon.com/icons/png/512/1176/1176403.png',
                function (error, image) {
                    if (error) throw error;
                    map.addImage('marker', image);
                    for (var i = 0; i < featureList.length; i++) {
                        map.addSource(i.toString(), {
                            'type': 'geojson',
                            'data': {
                                'type': 'FeatureCollection',
                                'features': [featureList[i]]
                            }
                        });
                        // Add a layer showing the places.
                        map.addLayer({
                            'id': i.toString(),
                            'type': 'symbol',
                            'source': i.toString(),
                            'layout': {
                                'icon-image': 'marker',
                                'icon-allow-overlap': true,
                                'icon-size': 0.06
                            }
                        });
                        // When a click event occurs on a feature in the places layer, open a popup at the
                        // location of the feature, with description HTML from its properties.
                        map.on('click', i.toString(), function (e) {
                            currFeature = e
                            var coordinates = e.features[0].geometry.coordinates.slice();
                            // var description = e.features[0].properties.description;
                            var description = e.features[0].properties.description;

                            // Ensure that if the map is zoomed out such that multiple
                            // copies of the feature are visible, the popup appears
                            // over the copy being pointed to.
                            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                            }

                            new mapboxgl.Popup()
                                .setLngLat(coordinates)
                                .setHTML(description)
                                .addTo(map);
                        });

                        // Change the cursor to a pointer when the mouse is over the places layer.
                        map.on('mouseenter', i.toString(), function () {
                            map.getCanvas().style.cursor = 'pointer';
                        });

                        // Change it back to a pointer when it leaves.
                        map.on('mouseleave', i.toString(), function () {
                            map.getCanvas().style.cursor = '';
                        });
                    }
                });

        }, 1000)
    });
}