import "ol/ol.css";
// import "javascript-autocomplete/auto-complete.css";
import proj from "ol/proj";
import GeoJSON from "ol/format/geojson";
import VectorLayer from "ol/layer/vector";
import VectorSource from "ol/source/vector";
import {
  apply
} from "ol-mapbox-style";
import AutoComplete from "javascript-autocomplete";
// import Map from "ol/canvasmap";
// import View from "ol/view";
// import TileLayer from "ol/layer/tile";
// import Stamen from "ol/source/stamen";
import Vector from "ol/source/vector";
import Style from "ol/style/style";
import Text from "ol/style/text";
import Stroke from "ol/style/stroke";
import XYZSource from "ol/source/xyz";
import Overlay from 'ol/overlay';
import coordinate from 'ol/coordinate';
import Circle from 'ol/style/circle';
import Fill from 'ol/style/fill';
import sync from 'ol-hashed';

//----------------MAP

const map = apply({
  target: "map",
  view: new View({
    center: proj.fromLonLat([16.37, 48.2]),
    zoom: 13
  })
});
map.addLayer(
  new TileLayer({
    source: new Stamen({
      layer: "terrain"
    })
  })
);

function fit() {
  map.getView().fit(source.getExtent(), {
    maxZoom: 19,
    duration: 250
  });
}

// Adresssuche -----

var selected;

function getAddress(feature) {
  var properties = feature.getProperties();
  return (
    (properties.city || properties.name || "") +
    " " +
    (properties.street || "") +
    " " +
    (properties.housenumber || "")
  );
}

var searchResult = new VectorLayer({
  zIndex: 9999
});
map.addLayer(searchResult);

var onload, source;
new AutoComplete({
  selector: 'input[name="q"]',
  source: function(term, response) {
    if (onload) {
      source.un("change", onload);
    }
    searchResult.setSource(null);
    source = new VectorSource({
      format: new GeoJSON(),
      url: "https://photon.komoot.de/api/?q=" + term
    });
    onload = function(e) {
      var texts = source.getFeatures().map(function(feature) {
        return getAddress(feature);
      });
      response(texts);
      fit();
    };
    source.once("change", onload);
    searchResult.setSource(source);
  },
  onSelect: function(e, term, item) {
    selected = item.getAttribute("data-val");
    source.getFeatures().forEach(function(feature) {
      if (getAddress(feature) !== selected) {
        source.removeFeature(feature);
      }
    });
    fit();
  }
});

//------ab hier DATENlayer

const layer0 = new VectorLayer({
  id: 'a0'
  source: new Vector({
    url: 'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:GRILLPLATZOGD&srsName=EPSG:4326&outputFormat=json',
    format: new GeoJSON()
  })
  zIndex: 3
});
map.addLayer(layer0);

// -----------

const layer1 = new VectorLayer({
    id: 'a1'
  source: new Vector({
    url: 'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BADESTELLENOGD&srsName=EPSG:4326&outputFormat=json',
    format: new GeoJSON()
  })
  zIndex: 3
});
map.addLayer(layer1);

//----------

const layer2 = new VectorLayer({
    id: 'a2'
  source: new Vector({
    url: 'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SPORTSTAETTENOGD&srsName=EPSG:4326&outputFormat=json',
    format: new GeoJSON()
  })
  zIndex: 3
});
map.addLayer(layer2);


// ----------

const layer3 = new VectorLayer({
    id: 'a3'
  source: new Vector({
    url: 'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:PARKANLAGEOGD&srsName=EPSG:4326&outputFormat=json',
    format: new GeoJSON()
  })
  zIndex: 3
});
map.addLayer(layer3);

// ------------------------STYLES

layer0.setStyle(function(feature) {
  return new Style({
    image: new Circle({
      radius: 4,
      fill: new Fill({
        color: 'rgba(255, 178, 102, 1)'
      }),
      stroke: new Stroke({
        color: 'rgba(127, 127, 127, 1)',
        width: 1
      })
    })
  });
});

layer1.setStyle(function(feature) {
  return new Style({
    image: new Circle({
      radius: 4,
      fill: new Fill({
        color: 'rgba(0, 128, 255, 1)'
      }),
      stroke: new Stroke({
        color: 'rgba(127, 127, 127, 1)',
        width: 1
      })
    })
  });
});

layer2.setStyle(function(feature) {
  return new Style({
    image: new Circle({
      radius: 4,
      fill: new Fill({
        color: 'rgba(128, 128, 128, 1)'
      }),
      stroke: new Stroke({
        color: 'rgba(127, 127, 127, 1)',
        width: 1
      })
    })
  });
});

layer3.setStyle(function(feature) {
  return new Style({
    image: new Circle({
      radius: 4,
      fill: new Fill({
        color: 'rgba(102, 204, 0, 1)'
      }),
      stroke: new Stroke({
        color: 'rgba(127, 127, 127, 1)',
        width: 1
      })
    })
  });
});

layer0.set('name', 'a0', true);
layer1.set('name', 'a1', true);
layer2.set('name', 'a2', true);
layer3.set('name', 'a3', true);

//-------------------------

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
    layerFilter: (l) => l === layer0 || l === layer1 || l === layer2
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
    markup += '<tr><td class="laerm">Name<font color="red"> * Pflichtfeld</font></td><td><input class="laerm" type="text" name="name" /></td></tr>';
    markup += '<tr><td class="laerm">Email<font color="red"> *</font></td><td><input class="laerm" type="text" name="email" />(wird nicht angezeigt)</td></tr>';
    markup += '<tr><td class="laerm">Ort<font color="red"> *</font></td><td><input class="laerm" type="text" name="place" /></td></tr>';
    markup += '<tr><td class="laerm">Beschreibung</td><td><textarea rows="3" id="inputFormdesc" name="desc" wrap="hard"/>Beschreibung hinzufügen</textarea></td></tr>';
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

setLayerInputChangeFnc("#v_a0", 'a0');
setLayerInputChangeFnc("#v_a1", 'a1');
setLayerInputChangeFnc("#v_a2", 'a2');
setLayerInputChangeFnc("#v_a3", 'a3');

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
