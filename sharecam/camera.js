let fluxCamera = null;


function activerCamera(){


    navigator.mediaDevices.getUserMedia({

        video: true,
        audio: true

    })


    .then(function(flux){


        fluxCamera = flux;


        let video = document.getElementById("camera");


        video.srcObject = flux;


    })


    .catch(function(erreur){

        alert("Erreur caméra : " + erreur);

    });


}




function arreterCamera(){


    if(fluxCamera){


        fluxCamera.getTracks().forEach(function(track){

            track.stop();

        });


        document.getElementById("camera").srcObject = null;


    }


}
