		//Classe para emular o objeto de geolocalizacao
		function Position(latitude, longitude, altitude, accurary, altitudeAccuracy, heading, speed) {
			this.coords = function(latitude, longitude, altitude, accurary, altitudeAccuracy, heading, speed) {
				this.latitude = latitude;
				this.longitude = longitude;
				this.altitude = altitude;
				this.accuracy = accuracy;
				this.altitudeAccuracy = altitudeAccuracy;
				this.heading = heading;
				this.speed = speed;
			}
		}
		
		var Position2 = {
			coords : {
				latitude : "",
				longitude : "",
				altitude : "",
				accuracy : "",
				altitudeAccuracy : "",
				heading : "",
				speed : ""
			}
		}
		
		
		
		//Funcoes especificas do Phonegap
		
		var celular_modelo = "";	
		var celular_plataforma = "";
		var celular_uuid = "";
		var celular_versao = "";
		var isPhoneGapReady = false;
		var isConnected = false;
		var isHighSpeed = false;
		var status_bateria = "aguarde...";
		var watchID;
		var retorno_rastreio = "(nao houve o envio de dados)";
		
		// Wait for device API libraries to load
		// device APIs are available
		//
		
		document.addEventListener("deviceready", onDeviceReady, false);
		 
		function onDeviceReady() {
			
			isPhoneGapReady = true;
			// detect for network access
			networkDetection();
			// attach events for online and offline detection
			document.addEventListener("online", onOnline, false);
			document.addEventListener("offline", onOffline, false);
			document.addEventListener("batterystatus", onBatteryStatus, false);
			
			var conteudo = "";
			conteudo = conteudo + 'Modelo: '    + device.model    + '<br />';
			conteudo = conteudo + 'Plataforma: ' + device.platform + '<br />';
			conteudo = conteudo + 'UUID: '     + device.uuid     + '<br />';
			conteudo = conteudo + 'Vers�o: '  + device.version  + '<br />';
			conteudo = conteudo + 'Bateria: '  + status_bateria  + '<br />';
			
			celular_modelo = device.model;
			celular_plataforma = device.platform;
			celular_uuid = device.uuid;
			celular_versao = device.version;
			
			$("#deviceproperties").append(conteudo);
		}
		
		 // alert dialog dismissed
		function alertDismissed() {
			// do something
		}
		
		function formatAMPM() {
			var date = new Date();
			var hours = date.getHours();
			var days = date.getDay(); 
			var minutes = date.getMinutes();
			var ampm = hours >= 12 ? 'pm' : 'am';
			hours = hours % 12;
			hours = hours ? hours : 12; // the hour '0' should be '12'
			minutes = minutes < 10 ? '0'+minutes : minutes;
			var strTime = date + ' ' + hours + ':' + minutes + ' ' + ampm;
			return strTime;
		}
		
		
		function networkDetection() {
			if (isPhoneGapReady) {
				// as long as the connection type is not none,
				// the device should have Internet access
				
				isConnected = true;
				isHighSpeed = true;
				//O codigo abaixo somente funciona no dispositivo
				//if (navigator.network.connection.type != Connection.NONE) {
				//	isConnected = true;
				//}
				// determine whether this connection is high-speed
				//switch (navigator.network.connection.type) {
				//	case Connection.UNKNOWN:
				//	case Connection.CELL_2G:
				//	isHighSpeed = false;
				//	break;
				//	default:
				//	isHighSpeed = true;
				//	break;
				//}
			}
		}
		
		function onOnline() {
			isConnected = true;
		}
		function onOffline() {
			isConnected = false;
		}
		
		function onBatteryStatus(battery_info) {
			status_bateria = battery_info.level + '%';
		}
		
			
		
		$(document).on('pageshow', '#posicao', function(){ 
			if (isPhoneGapReady){
				if (isConnected) {
					// load the google api
					var fileref=document.createElement('script');
					fileref.setAttribute("type","text/javascript");
					fileref.setAttribute("src",	"http://maps.googleapis.com/maps/api/js?sensor=true&callback=" + "getGeolocation");
					document.getElementsByTagName("head")[0].appendChild(fileref);
				} else {
					navigator.notification.alert('N�o existe conex�o com a Internet', alertDismissed, 'Rastreio Mobile', 'OK');
					$.mobile.changePage("#pageone");
				}
			} else {
				navigator.notification.alert('O aplicativo n�o est� pronto!', alertDismissed, 'Rastreio Mobile', 'OK');
				$.mobile.changePage("#pageone");
			}
		});
				
		//Funcoes para exibir o mapa
		function getGeolocation() {
			$.mobile.loading('show', {
				theme: "a",
				text: "Aguarde...",
				textonly: true,
				textVisible: true
			});
			// get the user's gps coordinates and display map
			var options = {
			maximumAge: 3000,
			timeout: 5000,
			enableHighAccuracy: true
			};
			navigator.geolocation.getCurrentPosition(loadMap, geoError, options);
		}
		
		function loadMap(position) {
			var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			var myOptions = {
			zoom: 16,
			center: latlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			
			var mapObj = document.getElementById("map_canvas");
			var map = new google.maps.Map(mapObj, myOptions);
			var marker = new google.maps.Marker({
			position: latlng,
			map: map,
			title:"You"
			});
			$.mobile.loading('hide'); 
		}
		
		function geoError(error) {
			alert('codigo: ' + error.code + '\n' + 'mensagem: ' + error.message + '\n');
		}
		
		function ajaxCallBackRASTREIO(retString){
			retorno_rastreio = retString;
		}
		
		//Funcoes para o rastremanto automatico
		function onSuccessRastreio(position){
			
			var var_latitude = position.coords.latitude;
			var var_longitude = position.coords.longitude;
			var var_altitude = position.coords.altitude;
			var var_accuracy = position.coords.accuracy;
			var var_altitude_accuracy = position.coords.altitudeAccuracy;
			var var_heading = position.coords.heading;
			var var_speed = position.coords.speed;
			
			//Zerando campos que podem vir nulos
			if(!var_altitude) {
				var_altitude = 0;
			}
			if(!var_altitude_accuracy) {
				var_altitude_accuracy = 0;
			}
			if(!var_heading) {
				var_heading = 0;
			}
			if(!var_speed) {
				var_speed = 0;
			}
			
			
			
			$.ajax({
			type: "POST",
			url: "http://www.interiornaweb.com.br/rastreio_mobile_teste.php",
			dataType:"text",
			data: {latitude: var_latitude, longitude: var_longitude, altitude: var_altitude, accuracy: var_accuracy, altitude_accuracy: var_altitude_accuracy, heading: var_heading, speed: var_speed, gravar: "SIM" },
			async: true,
			error: function(request, status, error) {
				
				//alert(request.responseText);	
				ajaxCallBackRASTREIO("(Houve um problema de comunicacao com os nossos sistemas)");
			}
			}).done(function(data) {
				//Nao faz nada
				
				if (data == 1){
					ajaxCallBackRASTREIO("(Dados gravados com sucesso - ultima atualizacao:" + formatAMPM() + ")");
					var element = document.getElementById("posicao_atual");
					element.innerHTML = "Latitude: " + position.coords.latitude + "<br />" +
					"Longitude: " + position.coords.longitude + "<br />"+ "Altitude: " + var_altitude + "<br />" + "Accuracy:" + var_accuracy + "<br />" + "Altitude Accuracy:" + var_altitude_accuracy + "<br/>" + "Heading: " + var_heading + "<br/>" + "Speed: " + var_speed + "<br />Dados gravados com sucesso - ultima atualizacao:" + formatAMPM() + ")<hr />";
				} else {
					ajaxCallBackRASTREIO("(Houve um problema ao gravar os dados)");
				}
			});
			var element = document.getElementById("posicao_atual");
			element.innerHTML = "Latitude: " + position.coords.latitude + "<br />" +
			"Longitude: " + position.coords.longitude + "<br />"+ "Altitude: " + var_altitude + "<br />" + "Accuracy:" + var_accuracy + "<br />" + "Altitude Accuracy:" + var_altitude_accuracy + "<br/>" + "Heading: " + var_heading + "<br/>" + "Speed: " + var_speed + "<br />" + retorno_rastreio + "<hr />";
		}	
		
		
		function DesativarRastreio(){
			//Habilitar em producao
			navigator.geolocation.clearWatch(watchID);
			clearTimeout(watchID);
			$.mobile.changePage("#pageone");			
		}
		
		$(document).on('pageshow', '#rastreio', function(){ 
			if (isPhoneGapReady){
				if (isConnected) {
					//rastreando
					navigator.notification.alert('iniciando o rastreio...', alertDismissed, 'Rastreio Mobile', 'OK');
					objeto_position = new Position("43,425397", "-80,442334", 100, 10, 10, 0, 0);
					console.log(objeto_position);
					//Ambiente de testes
					//watchID = setInterval(onSuccessRastreio(objeto_position), 3000);
					//Habilitar em producao
					//watchID = navigator.geolocation.watchPosition(onSuccessRastreio, geoError,{timeout: 10000, enableHighAccuracy: false, frequency: 10000 }); //10 segundos
					
					watchID = setInterval(function(){navigator.geolocation.getCurrentPosition(onSuccessRastreio, geoError, ,{timeout: 10000, enableHighAccuracy: false});},10000); //10 segundos
					
				} else {
					navigator.notification.alert('N�o existe conex�o com a Internet', alertDismissed, 'Rastreio Mobile', 'OK');
					$.mobile.changePage("#pageone");
				}
			} else {
				navigator.notification.alert('O aplicativo n�o est� pronto!', alertDismissed, 'Rastreio Mobile', 'OK');
				$.mobile.changePage("#pageone");
			}
		});
		
		