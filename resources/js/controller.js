/**
 * VER  : 1.0.2
 * DEV  : Christian van der Meij / AIRROSOFT
 * DATE : 20140901
 */


<!-- GLOBAL VARIABLES -->
//var chartUrl = 'http://macbek.cartodb.com/api/v2/viz/122b84f0-4964-11e4-9661-0e4fddd5de28/viz.json';
var chartUrl = 'http://shaofei.cartodb.com/api/v2/viz/1d8be4d0-7af0-11e4-9666-0e4fddd5de28/viz.json';
var tableName = 'scc';
var selectedclub = f 'all';
var chartTitle = 'De Nederlandse supporterskaart';
var smallDevice = false;
var protect = false;

// NEED ALSO BE ADJUSTED IN LESS FILE
var toggleResolution = 641;

<!-- DOCUMENT HANDLERS -->
$(document).ready(function() {

    if (protect === true) {
        $(function() {
            $(this).bind("contextmenu", function(e) {
                e.preventDefault();
            });
        });
    }

    $("#dutch").show();
    $("#german").hide();
    $("#english").hide();

    $("#dutch-btn").click(function() {
        $("#dutch").show();
        $("#german").hide();
        $("#english").hide();
    });
    $("#german-btn").click(function() {
        $("#dutch").hide();
        $("#german").show();
        $("#english").hide();
    });
    $("#english-btn").click(function() {
        $("#dutch").hide();
        $("#german").hide();
        $("#english").show();
    });

    //.infoscherm languagechooser .infospacer
    $("#dutch, #english, #german").click(function() {
        $('.infoscherm').hide();
    });

    $(".tekstclose, .iconclose").click(function() {
        $('.infoscherm').hide();
    });

    $(".info, .iconinfo, .kaartverantwoording").click(function() {
        $('.infoscherm').show();
    });

    $(".infoscherm").hide();

    $(".infodiv-hr-top").hide();
    $(".infodiv-hr-bottom").hide();
    $('#close').append('Sluit X');
    $('#closelid').append('Sluit');

    logoNaarWindow(null);

    if ($(window).width() < toggleResolution) {
        $('.infodiv').css("width", windowWidth);
        $('.cartodb-searchbox').hide();
        smallDevice = true;
    }
    if ($(window).width() > toggleResolution) {
        $('.infodiv').css("width", '200px');
        smallDevice = false;
    }

    var windowHeight = getViewPortHeight();
    var windowWidth = getViewPortWidth();

    $(window).resize(function() {
        var windowHeight = getViewPortHeight();
        $('#map').height(windowHeight);
    });

    $(window).resize(function() {
        reload();
        if ($(window).width() < toggleResolution) {
            $('.infodiv').css("width", windowWidth);
            $('.cartodb-searchbox').hide();
        } else {
            $('.infodiv').css("width", '200px');
        }
    });

    $('#close, #closelid, #show-info:not(.infodiv-select, #selectedclub)').click(function(event) {

        event.preventDefault();

        if (event.currentTarget == event.target) {

            if ($('.infodiv').hasClass("isDown")) {

                // DESKTOP UP
                if (smallDevice === false) {
                    $('.infodiv').animate({
                        height: '424px'
                    }, 250);
                    $('#close').empty();
                    $('#close').append('Sluit X');

                } else {
                    // SMALDEVICE UP
                    $('.infodiv').animate({
                        height: '220px'
                    }, 250);
                    $('.infodiv').show();
                    $('#closelid').animate({
                        bottom: '240px'
                    }, 250);
                    $('#closelid').text('Sluit');
                }
                $('.infodiv').removeClass("isDown");

            } else {

                // DESKTOP DOWN
                if (smallDevice === false) {
                    $('.infodiv').animate({
                        height: '100px'
                    }, 250);
                    $('#close').empty();
                    $('#close').append('Open ^');

                    // SMALDEVICE DOWN
                } else {
                    $('#closelid').animate({
                        bottom: '0px'
                    }, 250);
                    $('#closelid').text('Open');
                    $('.infodiv').animate({
                        height: '-80px'
                    }, 250);
                    $('.infodiv').hide();

                }
                $('.infodiv').addClass("isDown");
            }
            return false;
        }
    });


    $('#map').height(windowHeight);
    main();

});

<!-- CHART OPTIONS -->
if ($(window).width() > toggleResolution) {
    var optionsCarto = {
        shareable: false,
        title: true,
        description: false,
        search: true,
        tiles_loader: false,
        center_lat: 52.28,
        center_lon: 5.80,
        zoom: 9,
        fullscreen: false,
        layer_selector: false,
        cartodb_logo: false,
        infowindow: false,
        legends: false,
        scrollwheel: true,
        loaderControl: true
    }
}
if ($(window).width() < toggleResolution) {
    var optionsCarto = {
        shareable: false,
        title: true,
        description: false,
        search: false,
        tiles_loader: false,
        center_lat: 52.175,
        center_lon: 6.6,
        zoom: 9,
        fullscreen: false,
        layer_selector: false,
        cartodb_logo: false,
        infowindow: false,
        legends: false,
        scrollwheel: true,
        loaderControl: true
    }

}

<!-- CARTODB STANDARD FUNCTIONS -->

function main() {

    cartodb.createVis('map', chartUrl, optionsCarto)

    .done(function(vis, layers) {


        window.layers = layers;
        window.vis = vis;

        var layer = layers[1].getSubLayer(0);
        createSelector(layer);

        layers[1].setInteraction(true);

        layers[1].on('featureOver', function(e, pos, latlng, data) {
            if (mobileDevice() === false) {
                dataNaarWindow(data);
            }

        });

        layers[1].on('featureClick', function(e, pos, latlng, data) {
            dataNaarWindow(data);
        });

        $('.cartodb-searchbox').find('input.text').attr('placeholder', 'Naar plaats zoeken');
        $('.title').html('<img src="resources/images/tubantia-logo-200px.png" style="vertical-align: middle; height:18px"/><span style="vertical-align: middle;">&nbsp;&nbsp;' + chartTitle + '</span>');

    })
        .error(function(err) {
            console.log(err);
        });

}

<!-- CUSTOM SQL FUNCTIONS -->
function createSelector(layer) {

    setColor(layer);

    var $options = $('#selectedclub');

    $options.change(function(e) {
        var $select = $(e.target);
        var club = $select.val();

        selectedclub = club;
        logoNaarWindow(club);

        if (club == 'all' || club == null || club == '') {

            var query = "SELECT * FROM " + tableName;
            layer.setSQL(query);
            setColor(layer);

        }

        if (club !== 'all') {
            var query = "SELECT * FROM " + tableName + " WHERE " + club + " > '0'";
            layer.setSQL(query);
            setColor(layer);
        }
    });
}

<!-- COLOR FUNCTION -->
function setColor(layer) {

    if (selectedclub == 'all' || selectedclub === null || selectedclub == 'undefined') {


        layer.set({
            "cartocss": "#layer {polygon-fill :#ffffff; polygon-opacity : 0.8; line-color : #000000; line-width : 0.5; line-opacity : 1; }" +
                "#layer [club = 'ajx'] { polygon-fill : " + getColorValue('ajx') + "; }" +
                "#layer [club = 'fey'] { polygon-fill : " + getColorValue('fey') + "; }" +
                "#layer [club = 'psv'] { polygon-fill : " + getColorValue('psv') + "; }" +
                "#layer [club = 'vit'] { polygon-fill : " + getColorValue('vit') + "; }" +
                "#layer [club = 'sch'] { polygon-fill : " + getColorValue('sch') + "; }" +
                "#layer [club = 'ado'] { polygon-fill : " + getColorValue('ado') + "; }" +
                "#layer [club = 'aza'] { polygon-fill : " + getColorValue('aza') + "; }" +
                "#layer [club = 'exc'] { polygon-fill : " + getColorValue('exc') + "; }" +
                "#layer [club = 'fcd'] { polygon-fill : " + getColorValue('fcd') + "; }" +
                "#layer [club = 'fcg'] { polygon-fill : " + getColorValue('fcg') + "; }" +
                "#layer [club = 'fct'] { polygon-fill : " + getColorValue('fct') + "; }" +
                "#layer [club = 'fcu'] { polygon-fill : " + getColorValue('fcu') + "; }" +
                "#layer [club = 'gae'] { polygon-fill : " + getColorValue('gae') + "; }" +
                "#layer [club = 'her'] { polygon-fill : " + getColorValue('her') + "; }" +
                "#layer [club = 'nac'] { polygon-fill : " + getColorValue('nac') + "; }" +
                "#layer [club = 'pec'] { polygon-fill : " + getColorValue('pec') + "; }" +
                "#layer [club = 'scc'] { polygon-fill : " + getColorValue('scc') + "; }" +
                "#layer [club = 'wii'] { polygon-fill : " + getColorValue('wii') + "; }" +
                "#layer [club = 'alm'] { polygon-fill : " + getColorValue('alm') + "; }" +
                "#layer [club = 'bos'] { polygon-fill : " + getColorValue('bos') + "; }" +
                "#layer [club = 'dgs'] { polygon-fill : " + getColorValue('dgs') + "; }" +
                "#layer [club = 'ein'] { polygon-fill : " + getColorValue('ein') + "; }" +
                "#layer [club = 'fce'] { polygon-fill : " + getColorValue('fce') + "; }" +
                "#layer [club = 'fco'] { polygon-fill : " + getColorValue('fco') + "; }" +
                "#layer [club = 'fort'] { polygon-fill : " + getColorValue('fort') + "; }" +
                "#layer [club = 'hel'] { polygon-fill : " + getColorValue('hel') + "; }" +
                "#layer [club = 'mvv'] { polygon-fill : " + getColorValue('mvv') + "; }" +
                "#layer [club = 'nec'] { polygon-fill : " + getColorValue('nec') + "; }" +
                "#layer [club = 'rjc'] { polygon-fill : " + getColorValue('rjc') + "; }" +
                "#layer [club = 'rkc'] { polygon-fill : " + getColorValue('rkc') + "; }" +
                "#layer [club = 'spa'] { polygon-fill : " + getColorValue('spa') + "; }" +
                "#layer [club = 'tel'] { polygon-fill : " + getColorValue('tel') + "; }" +
                "#layer [club = 'vol'] { polygon-fill : " + getColorValue('vol') + "; }" +
                "#layer [club = 'vvv'] { polygon-fill : " + getColorValue('vvv') + "; }" +
                "#layer [club = 'Geen dominante club'] { polygon-fill : #d3cfcf; polygon-opacity: 0.3;}" +
                "#layer [club = 'Geen seizoenskaarthouders'] { polygon-fill : #ffffff; polygon-opacity: 0.5;}" +
                "#layer [sccper100inw >= 926.67] { polygon-opacity : 0.9; }" +
                "#layer [sccper100inw <= 6.04] { polygon-opacity : 0.7; }" +
                "#layer [sccper100inw <= 3.66] { polygon-opacity : 0.6; }" +
                "#layer [sccper100inw <= 2.34] { polygon-opacity : 0.5;}" +
                "#layer [sccper100inw <= 1.17] { polygon-opacity : 0.2;}"
        });

    } else {
        layer.set({
            "cartocss": "#layer {line-color: #000000;line-width: 0.5;line-opacity: 1}" +
                "#layer {polygon-fill: " + getColorValue(selectedclub) + ";}" +
                "#layer [ " + selectedclub + " >= 200] {polygon-opacity: 0.9;}" +
                "#layer [ " + selectedclub + " <= 100] {polygon-opacity: 0.7;}" +
                "#layer [ " + selectedclub + " <= 50] {polygon-opacity: 0.6;}" +
                "#layer [ " + selectedclub + " <= 25] {polygon-opacity: 0.5;}" +
                "#layer [ " + selectedclub + " <= 10] {polygon-opacity: 0.2;}" +
                "#layer [ " + selectedclub + " = null] {polygon-opacity: 0.0;}"
        });
    }

}

function getColorValue(selectedclub) {

    var color_all = '#000000';
    var color_ado = '#74c476';
    var color_ajx = '#dd1c77';
    var color_aza = '#850200';
    var color_exc = '#ff0000';
    var color_fey = '#e06f5a';
    var color_fcd = '#78c679';
    var color_fcg = '#006d2c';
    var color_fct = '#de2d26';
    var color_fcu = '#756bb1';
    var color_gae = '#252525';
    var color_her = '#000000';
    var color_nac = '#000000';
    var color_pec = '#41b6c4';
    var color_psv = '#6300ff';
    var color_scc = '#fecc5c';
    var color_sch = '#3E7BB6';
    var color_vit = '#fecc5c';
    var color_wii = '#2E5387';
    var color_alm = '#000000';
    var color_bos = '#41b6c4';
    var color_dgs = '#41b6c4';
    var color_ein = '#41b6c4';
    var color_fce = '#FF5C00';
    var color_fco = '#54278f';
    var color_fort = '#006d2c';
    var color_hel = '#de2d26';
    var color_mvv = '#de2d26';
    var color_nec = '#31a354';
    var color_rjc = '#000000';
    var color_rkc = '#f7ff00';
    var color_spa = '#de2d26';
    var color_tel = '#41b6c4';
    var color_vol = '#fe9929';
    var color_vvv = '#f7ff00';


    if (selectedclub == 'all' || selectedclub === null || selectedclub == 'undefined') {
        var varString = 'color_all';
        var returnvalue = eval(varString);
        return returnvalue;
    } else {
        var varString = 'color_' + selectedclub;
        var returnvalue = eval(varString);
        return returnvalue;
    }
}

<!-- CUSTOM LOGO INTO INFO WINDOW FUNCTION -->
function logoNaarWindow(club) {
    var baseurl = 'resources/images/logos/club-';
    $(".infodiv-clublogo").empty();
    if (club == 'all' || club === null || club == undefined) {
        $(".infodiv-clublogo").append('<img height="60" src="' + baseurl + 'ere.png"/>');
        $(".infodiv-clublogo").append('<img height="60" src="' + baseurl + 'jup.png"/>');
    } else {
        $(".infodiv-clublogo").append('<img height="60" src="' + baseurl + club + '.png"/>');
    }
}

<!-- CUSTOM CALCULATION FUNCTION -->
function percentage(totaal, clubdata) {
    // var result = Math.round((parseInt(clubdata) / parseInt(totaal)) * 100);
    var result = ((parseInt(clubdata) / parseInt(totaal)) * 100).toFixed(1);
    result = (result < 10) ? '0' + result : result;
    return result;
}

<!-- CALCULATION SCREEN SIZES -->
function getViewPortHeight() {
    return $(window).height();
}

function getViewPortWidth() {
    return $(window).width();
}

function mobileDevice() {

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}

function reload() {
    location.reload();
}

<!-- CUSTOM INFO WINDOW FUNCTION -->
function dataNaarWindow(data) {

    var baseurl = 'resources/images/logos/club-';

    $(".infodiv-header").empty();
    $(".infodiv-content").empty();
    $(".infodiv-footer").empty();
    $(".infodiv-hr-top").show();
    $(".infodiv-hr-bottom").show();

    // CHECK VALUES

    if (data.totaal > 0 && !undefined && !null) {
        var totaal = data.totaal;
    } else {
        var totaal = 0;
    }
    if (data.gemeente == undefined) {
        var plaatsnaam = '';
    } else {
        var plaatsnaam = data.gemeente + ' / ';
    }
    if (data.postcode == undefined) {
        var postcode = '';
    } else {
        var postcode = data.postcode;
    }
    if (data.wijk == undefined) {
        var wijk = '';
    } else {
        var wijk = data.wijk;
    }

    $(".infodiv-header").append('<span class="plaats">' + plaatsnaam + '</span><span class="wijk"><i>' + wijk + '</i></span>');

    if (!smallDevice) {
        $(".infodiv-header").append('<br>');
    } else {
        $(".infodiv-header").append('<span class="wijk"> / </span>');
    }

    $(".infodiv-header").append('<span class="postcode">Postcode:</span><span class="postcode-nr">' + postcode + '</span>');
    $(".infodiv-header").append('<span class="inwoners"> / Inwoners:</span><span class="inwoners-nr">' + data.inwoners + '</span><br>');
    $(".infodiv-header").append('<br>');

    var sortedclubs = [{
            name: "ado",
            clubnaam: "ADO Den Haag",
            waarde: data.ado
        }, {
            name: "ajx",
            clubnaam: "Ajax",
            waarde: data.ajx
        }, {
            name: "aza",
            clubnaam: "AZ Alkmaar",
            waarde: data.aza
        }, {
            name: "exc",
            clubnaam: "Excelsior",
            waarde: data.exc
        }, {
            name: "fey",
            clubnaam: "Feyenoord",
            waarde: data.fey
        }, {
            name: "fcd",
            clubnaam: "FC Dordrecht",
            waarde: data.fcd
        }, {
            name: "fcg",
            clubnaam: "FC Groningen",
            waarde: data.fcg
        }, {
            name: "fct",
            clubnaam: "FC Twente",
            waarde: data.fct
        }, {
            name: "fcu",
            clubnaam: "FC Utrecht",
            waarde: data.fcu
        }, {
            name: "gae",
            clubnaam: "Go Ahead Eagles",
            waarde: data.gae
        }, {
            name: "her",
            clubnaam: "Heracles Almelo",
            waarde: data.her
        }, {
            name: "nac",
            clubnaam: "NAC Breda",
            waarde: data.nac
        }, {
            name: "pec",
            clubnaam: "PEC Zwolle",
            waarde: data.pec
        }, {
            name: "psv",
            clubnaam: "PSV",
            waarde: data.psv
        }, {
            name: "scc",
            clubnaam: "SC Cambuur",
            waarde: data.scc
        }, {
            name: "sch",
            clubnaam: "SC Heerenveen",
            waarde: data.sch
        }, {
            name: "vit",
            clubnaam: "Vitesse",
            waarde: data.vit
        }, {
            name: "wii",
            clubnaam: "Willem II",
            waarde: data.wii
        }, {
            name: "alm",
            clubnaam: "Almere City FC",
            waarde: data.alm
        }, {
            name: "bos",
            clubnaam: "FC Den Bosch",
            waarde: data.bos
        }, {
            name: "dgs",
            clubnaam: "De Graafschap",
            waarde: data.dgs
        }, {
            name: "ein",
            clubnaam: "FC Eindhoven",
            waarde: data.ein
        }, {
            name: "fce",
            clubnaam: "FC Emmen",
            waarde: data.fce
        }, {
            name: "fco",
            clubnaam: "FC Oss",
            waarde: data.fco
        }, {
            name: "fort",
            clubnaam: "Fortuna Sittard",
            waarde: data.fort
        }, {
            name: "hel",
            clubnaam: "Helmond Sport",
            waarde: data.hel
        }, {
            name: "mvv",
            clubnaam: "MVV Maastricht",
            waarde: data.mvv
        }, {
            name: "nec",
            clubnaam: "NEC Nijmegen",
            waarde: data.nec
        }, {
            name: "rjc",
            clubnaam: "Roda JC",
            waarde: data.rjc
        }, {
            name: "rkc",
            clubnaam: "RKC Waalwijk",
            waarde: data.rkc
        }, {
            name: "spa",
            clubnaam: "Sparta Rotterdam",
            waarde: data.spa
        }, {
            name: "tel",
            clubnaam: "SC Telstar",
            waarde: data.tel
        }, {
            name: "vol",
            clubnaam: "FC Volendam",
            waarde: data.vol
        }, {
            name: "vvv",
            clubnaam: "VVV Venlo",
            waarde: data.vvv
        }

    ].sort(function(obj1, obj2) {
        return obj2.waarde - obj1.waarde;
    });

    // SMALL SCREEN
    if ($(window).width() < toggleResolution) {

        if (selectedclub == 'all') {
            $.each(sortedclubs, function(index, club) {
                if (club.waarde > 0) {
                    var calculatie = percentage(totaal, club.waarde);
                    var imgsource = '<img class="clublogoklein" src="' + baseurl + club.name + '.png"/>'
                    $(".infodiv-content").append(
                        '<div class="datacontainer">' +
                        imgsource +
                        '<div class="clubnaam">' + club.clubnaam + '</div>' +
                        '<div class="clubdatacombi">' + calculatie + '%' + ' (' + club.waarde + ') </div>' +
                        '</div>'
                    );
                }
            });

        } else if (selectedclub != 'all') {

            $.each(sortedclubs, function(index, club) {
                if (club.name == selectedclub) {
                    var calculatie = percentage(totaal, club.waarde);
                    var imgsource = '<img class="clublogoklein" src="' + baseurl + club.name + '.png"/>'
                    $(".infodiv-content").append(
                        '<div class="datacontainer">' +
                        imgsource +
                        '<div class="clubnaam">' + club.clubnaam + '</div>' +
                        '<div class="clubdatacombi">' + calculatie + '%' + ' (' + club.waarde + ') </div>' +
                        '</div>'
                    );
                }
            });

        }
    }


    // DESKTOP
    if ($(window).width() > toggleResolution) {

        if (selectedclub == 'all') {
            $.each(sortedclubs, function(index, club) {
                if (club.waarde > 0) {
                    var calculatie = percentage(totaal, club.waarde);
                    var imgsource = '<img class="clublogoklein" src="' + baseurl + club.name + '.png"/>'
                    $(".infodiv-content").append(
                        imgsource +
                        '<span class="clubnaam">' + club.clubnaam + '</span>' +
                        '<span class="clubpercentage">' + calculatie + '%</span>' +
                        '<span class="clubdata">' + club.waarde + '</span><br>'
                    );
                }
            });

        } else if (selectedclub != 'all') {

            $.each(sortedclubs, function(index, club) {
                if (club.name == selectedclub) {
                    var calculatie = percentage(totaal, club.waarde);
                    var imgsource = '<img class="clublogoklein" src="' + baseurl + club.name + '.png"/>'
                    $(".infodiv-content").append(
                        imgsource +
                        '<span class="clubnaam">' + club.clubnaam + '</span>' +
                        '<span class="clubpercentage">' + calculatie + '%</span>' +
                        '<span class="clubdata">' + club.waarde + '</span><br>'
                    );
                }
            });

        }
    }

    $(".infodiv-footer").append('<span class="totaal">Totaal aantal kaarten: </span><span class="totaal-nr">' + totaal + '</span>');

}