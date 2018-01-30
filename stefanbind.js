import 'ol/ol.css';
import ol from 'ol/control/control';
//import 'javascript-autocomplete/auto-complete.css'; //additional includes für UE4
//import View from 'ol/view';
//import Map from 'ol/map';

// import TileLayer from 'ol/layer/tile';
// import Stamen from 'ol/source/stamen';
import VectorLayer from 'ol/layer/vector';
import Vector from 'ol/source/vector';
import VectorSource from 'ol/source/vector';
import GeoJSON from 'ol/format/geojson';
import Style from 'ol/style/style';
import IconStyle from 'ol/style/icon';
//import Circle from 'ol/style/circle';
//import Text from 'ol/style/text';
//import Fill from 'ol/style/fill';
//import Stroke from 'ol/style/stroke';
import proj from 'ol/proj';
import {apply} from 'ol-mapbox-style';
import AutoComplete from 'javascript-autocomplete'; //additional includes für UE4
import Overlay from 'ol/overlay';
//import coordinate from 'ol/coordinate';


function validateForm() {
  var name = document.forms['geowebInsert']['name'].value;
  var email = document.forms['geowebInsert']['email'].value;
  var place = document.forms['geowebInsert']['place'].value;
  if (name == '') {
    alert('Name ist Pflichtfeld!');
    return false;
  } else if (email == '') {
    alert('Email ist Pflichtfeld!');
    return false;
  } else if (place == '') {
    alert('Ort ist Pflichtfeld!');
    return false;
  }
}

//BASE MAP
const map = apply(
  'map',
  'style.json'
);

//ADRESS LOOKUP
var searchResult = new VectorLayer({
  zIndex: 1
});
map.addLayer(searchResult);

new AutoComplete({
  selector: 'input[name="q"]',
  source: function(term, response) {
    var source = new VectorSource({
      format: new GeoJSON(),
      url: 'https://photon.komoot.de/api/?q=' + term
    });
    source.on('change', function() {
      var texts = source.getFeatures().map(function(feature) {
        var properties = feature.getProperties();
        return (properties.city || properties.name || '') + ', ' +
          (properties.street || '') + ' ' +
          (properties.housenumber || '');
      });
      response(texts);
      map.getView().fit(source.getExtent(), {
        maxZoom: 19,
        duration: 250
      });
    });
    searchResult.setSource(source);
  }
});

//OVERLAYS-POPUPS
var overlay = new Overlay({
  id: 'info',
  element: document.getElementById('popupinfo'),
  positioning: 'bottom-center',
  offset: [0, -10]
});
var overlay2 = new Overlay({
  id: 'insertForm',
  element: document.getElementById('popupform'),
  positioning: 'bottom-center',
  offset: [0, -10]
});
map.addOverlay(overlay);
map.addOverlay(overlay2);

function removeForm() {
  overlay2.setPosition();
}

const bezirkeLayer = new VectorLayer({
  source: new Vector({
    url: 'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BEZIRKSGRENZEOGD&srsName=EPSG:4326&outputFormat=json',
    format: new GeoJSON()
  }),
  zIndex: 2
});
map.addLayer(bezirkeLayer);

const ruheLayer1 = new VectorLayer({
  id: 'r1',
  source: new Vector({
    url: 'https://student.ifip.tuwien.ac.at/geoweb/2017/g07/map/postgis_li_geojson.php?type=R&cat=1',
    format: new GeoJSON()
  }),
  zIndex: 3
});
map.addLayer(ruheLayer1);

const ruheLayer2 = new VectorLayer({
  id: 'r2',
  source: new Vector({
    url: 'https://student.ifip.tuwien.ac.at/geoweb/2017/g07/map/postgis_li_geojson.php?type=R&cat=2',
    format: new GeoJSON()
  }),
  zIndex: 3
});
map.addLayer(ruheLayer2);

const ruheLayer3 = new VectorLayer({
  id: 'r3',
  source: new Vector({
    url: 'https://student.ifip.tuwien.ac.at/geoweb/2017/g07/map/postgis_li_geojson.php?type=R&cat=3',
    format: new GeoJSON()
  }),
  zIndex: 3
});
map.addLayer(ruheLayer3);

const laermLayer = new VectorLayer({
  id: 'l1',
  source: new Vector({
    url: 'https://student.ifip.tuwien.ac.at/geoweb/2017/g07/map/postgis_li_geojson.php?type=L',
    format: new GeoJSON()
  }),
  zIndex: 3
});
map.addLayer(laermLayer);

//map.addControl(new ol.Control.LayerSwitcher());

ruheLayer1.setStyle(function(feature) {
  return new Style({
    image: new IconStyle({
      src: './data/marker_oase1.png',
      anchor: [0.5, 1]
    })
    /*
    image: new Circle({
      radius: 7,
      fill: new Fill({
        color: 'rgba(12, 232, 12, 1)'
      }),
      stroke: new Stroke({
        color: 'rgba(127, 127, 127, 1)',
        width: 1
      })
    })
    */
  });
});

ruheLayer2.setStyle(function(feature) {
  return new Style({
    image: new IconStyle({
      src: './data/marker_oase2.png',
      anchor: [0.5, 1]
    })
  });
});

ruheLayer3.setStyle(function(feature) {
  return new Style({
    image: new IconStyle({
      src: './data/marker_oase3.png',
      anchor: [0.5, 1]
    })
  });
});

laermLayer.setStyle(function(feature) {
  return new Style({
    image: new IconStyle({
      src: './data/marker_noise1.png',
      anchor: [0.5, 1]
    })
  });
});

ruheLayer1.set('name', 'r1', true);
ruheLayer2.set('name', 'r2', true);
ruheLayer3.set('name', 'r3', true);
laermLayer.set('name', 'l1', true);

map.on('singleclick', function(e) {
  var overlayPos = overlay.getPosition();
  var overlayPos2 = overlay2.getPosition();

  if (overlayPos != undefined || overlayPos2 != undefined) {
    //falls eines der beiden overlays angezeigt wird
    //wegschalten und raus
    overlay.setPosition();
    overlay2.setPosition();
    return;
  }
  var markup = '';
  map.forEachFeatureAtPixel(e.pixel, function(feature) {
    var properties = feature.getProperties();
    markup += `${markup && '<hr>'}<table>`;
    for (var property in properties) {
      if (property != 'geometry') {
        markup += `<tr><th class="ruhe">${property}</th><td>${properties[property]}</td></tr>`;
      }
    }
    markup += '</table>';
  }, {
    layerFilter: (l) => l === ruheLayer1 || l === ruheLayer2 || l === ruheLayer3
  });
  if (!markup) {
    map.forEachFeatureAtPixel(e.pixel, function(feature) {
      var properties = feature.getProperties();
      markup += `${markup && '<hr>'}<table>`;
      for (var property in properties) {
        if (property != 'geometry') {
          markup += `<tr><th class="laerm">${property}</th><td>${properties[property]}</td></tr>`;
        }
      }
      markup += '</table>';
    }, {
      layerFilter: (l) => l === laermLayer
    });
  }
  if (markup) {
    document.getElementById('popupinfo-content').innerHTML = markup;
    overlay.setPosition(e.coordinate);
    overlay2.setPosition();
  } else {
    overlay.setPosition();
    overlay2.setPosition();
    var pos = proj.toLonLat(e.coordinate);
    // NEUER AUFRUF POPUP MARKUP
    markup += `${markup && '<hr>'}`;
    markup += '<h2>Ruheoase <font color="black">oder</font> <font color="#E62E00">Lärmort</font></h2>';
    markup += `<form class="insertForm" id="geowebInsert" onreset="return removeForm();" onsubmit="return validateForm();" method="POST" action="https://student.ifip.tuwien.ac.at/geoweb/2017/g07/php/insert_point.php?pos=${pos.join(' ')}">`;
    markup += '<fieldset class="insertForm">';
    markup += '  <input type="radio" id="laerm1" name="laerm" value="R" checked="checked">';
    markup += '  <label for="laerm1">Ruheoase</label>';
    markup += '  <input type="radio" id="laerm2" name="laerm" value="L">';
    markup += '  <label for="laerm2">Lärmzone</label>';
    markup += '</fieldset>';
    markup += '<fieldset class="insertForm">';
    markup += '  <input type="radio" id="privacat1" name="privcat" value="1" checked="checked">';
    markup += '  <label for="privacat1">öffentlich</label>';
    markup += '    <input type="radio" id="privacat2" name="privcat" value="2">';
    markup += '    <label for="privacat2">halböffentlich</label>';
    markup += '  <input type="radio" id="privacat3" name="privcat" value="3">';
    markup += '  <label for="privacat3">privat</label>';
    markup += '  </fieldset>';
    markup += '<table>';
    markup +=  '<tr><td class="laerm">Name<font color="red"> * Pflichtfeld</font></td><td><input class="laerm" type="text" name="name" /></td></tr>';
    markup +=  '<tr><td class="laerm">Email<font color="red"> *</font></td><td><input class="laerm" type="text" name="email" />(wird nicht angezeigt)</td></tr>';
    markup +=  '<tr><td class="laerm">Ort<font color="red"> *</font></td><td><input class="laerm" type="text" name="place" /></td></tr>';
    markup +=  '<tr><td class="laerm">Beschreibung</td><td><textarea rows="3" id="inputFormdesc" name="desc" wrap="hard"/>Beschreibung hinzufügen</textarea></td></tr>';
    markup += ' <tr><td></td>';
    markup += ' <td><input id ="cancel" type="reset" value="cancel"><input type="submit" value="send"></td></tr></table></form>';
    //MARKUP ANZEIGEN
    document.getElementById('popupform-content').innerHTML = markup;
    overlay2.setPosition(e.coordinate);

    (function() {
      var qs = function(s) {
            return document.querySelector(s);
          },
          form = qs('form');
      form.onsubmit = function(e) {
        return validateForm();
      };
      form.onreset = function(e) {
        return removeForm();
      };
    }());
  }
});

function setLayerInputChangeFnc(InputName, LayerName) {
  $(InputName).change(function() {
    if (this.checked) {
      changeLayerVisiblity(LayerName, true);
    } else {
      changeLayerVisiblity(LayerName, false);
    }
  });
}

setLayerInputChangeFnc("#v_r1", 'r1');
setLayerInputChangeFnc("#v_r2", 'r2');
setLayerInputChangeFnc("#v_r3", 'r3');
setLayerInputChangeFnc("#v_l1", 'l1');

//DEBUG
// var countChecked = function() {
//   var n = $( "input:checked" ).length;
//   $("#debug").text( n + (n === 1 ? " is" : " are") + " checked!" );
// };
// countChecked();
// $( "input[type=checkbox]" ).on( "click", countChecked );

function setLayerVisiblity(layer, on_off) {
  layer.setVisible(on_off);
}
function changeLayerVisiblity(layerName, on_off) {
  map.getLayers().forEach(function(layer, i) {
    if (layer.get('name') === layerName) {
      setLayerVisiblity(layer, on_off);
    }

  });
}
