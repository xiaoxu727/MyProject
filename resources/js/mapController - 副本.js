 <!--GLOBAL VARIABLES-->
 var mapURL = 'http://shaofei.cartodb.com/api/v2/viz/1d8be4d0-7af0-11e4-9666-0e4fddd5de28/viz.json';
 var pointURl = 'http://shaofei.cartodb.com/api/v2/viz/58848f86-7d7c-11e4-b795-0e4fddd5de28/viz.json';
 var center_lat = '37.33';
 var center_lon = '-121.56';
 var initZoomLevel = 10;
 var map = null;
 var pointLayer = null; //点图层
 var scoreLayer = null; // 得分图层

 <!--DOCUMENT HANDLES-->
 $(document).ready(function() {
     main();
 });

 function main() {
     cartodb.createVis('map', mapURL, {
         shareable: true,
         title: true,
         description: true,
         search: true,
         tiles_loader: true,
         center_lat: center_lat,
         center_lon: center_lon,
         zoom: initZoomLevel
     })
         .done(function(vis, layers) {
             // layer 0 is the base layer, layer 1 is cartodb layer
             // setInteraction is disabled by default
             // layers[1].setInteraction(true);
             // layers[1].on('featureOver', function(e, pos, latlng, data) {
             //     cartodb.log.log(e, pos, latlng, data);
             // });
             scoreLayer = layers[1];

             var sublayer = layers[1].getSubLayer(0);

             createSelector(sublayer);

             // you can get the native map to work with it
             map = vis.getNativeMap();
             // now, perform any operations you need
             // map.setZoom(3);
             // map.panTo([50.5, 30.5]);

             cartodb.createLayer(map, pointURl)
                 .addTo(map)
                 .on('done', function(layer) {
                     var sublayer = layer.getSubLayer(0);
                     createSelector(sublayer);
                     pointLayer = layer;
                 })
                 .on('error', function(err) {
                     alert('some error occurred:' + err);
                 });
         })
         .error(function(err) {
             console.log(err);
         });
     // var map = new L.map('map', {
     //     center: [center_lat, center_lon], //[lat,lon]
     //     zoom: initZoomLevel
     // });
     // cartodb.createLayer(map, mapURL)
     //     .addTo(map)
     //     .on('done', function(layer) {
     //         var sublayer = layer.getSubLayer(0);
     //         createSelector(sublayer);

     //     })
     //     .on('error', function(err) {
     //         alert('some error occurred:' + err);
     //     });
 }

 function createSelector(layer) {
     var sql = new cartodb.SQL({
         user: 'shaofei'
     });
     var $options = $('#layer_selector li');
     $options.click(function(e) {
         //get the count of the selected layer
         var $li = $(e.target);
         var count = $li.attr('data');

         var layerName = $li.attr('layerName');

         //deselect all and select the click one
         $options.removeClass('selected');
         $li.addClass('selected');

         // //create query based on count from layer
         // var query = "select * from data";

         // if (count != null) {
         //     query = "select * from data where q001001 >" + count;
         // }
         // // execute the sql
         // layer.setSQL(query);

         map.removeLayer(pointLayer);
         map.removeLayer(scoreLayer);

         if (layerName == "pointLayer") {
             map.addLayer(pointLayer);
         } else if (layerName == "scoreLayer") {
             map.addLayer(scoreLayer);
         }
         // if ($li.attr('class') == "selected") {
         //     $li.removeClass('selected');
         //     if (layerName == 'pointLayer') {

         //         map.removeLayer(pointLayer);

         //     } else if (layerName == "scoreLayer") {

         //         map.removeLayer(scoreLayer);
         //     }

         // } else {
         //     $li.addClass('selected');
         //     if (layerName == 'pointLayer') {
         //         map.addLayer(pointLayer);
         //     } else if (layerName == 'scoreLayer') {
         //         map.addLayer(scoreLayer);
         //     }
         // }
     });
 }