let canalChat = null;
import {
createClient
}
from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";



// TES INFOS SUPABASE

const SUPABASE_URL =
"https://wovafqrqmsnairmpbpfk.supabase.co";


const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdmFmcXJxbXNuYWlybXBicGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NjgxOTQsImV4cCI6MjEwMTU0NDE5NH0.qlRNoh-PW4yEL-4EFRBB_3HgdnAqDGJE_1p7ZE4oTks";



const supabase =
createClient(
SUPABASE_URL,
SUPABASE_KEY
);



let salonActuel="";




// =================
// CESAR
// =================


function cesar(texte,cle){

let resultat="";


for(let c of texte){


if(/[a-zA-Z]/.test(c)){


let base =
c===c.toUpperCase()
?65
:97;


resultat += String.fromCharCode(

(c.charCodeAt(0)-base+cle)%26+base

);


}

else{

resultat += c;

}

}


return resultat;

}





// =================
// REJOINDRE
// =================


window.connexionSalon = async function(){


salonActuel =
document.getElementById("salon").value;


if(salonActuel.length !== 12){

alert("Le code doit contenir 12 chiffres");

return;

}


document.getElementById("messages").innerHTML="";



chargerMessages();



canalChat = supabase
.channel("chat-" + salonActuel)
.on(
"postgres_changes",
{
event: "INSERT",
schema: "public",
table: "messages",
filter: "salon=eq." + salonActuel
},
(payload) => {

afficher(
payload.new.pseudo,
payload.new.message
);

}
)
.subscribe();

}





// =================
// ENVOYER
// =================

window.envoyer = async function(){

    let pseudo = document.getElementById("pseudo").value;

    let texte = document.getElementById("texte").value;

    let cle = Number(document.getElementById("cle").value);


    let crypte = cesar(texte, cle);


    let resultat = await supabase
        .from("messages")
        .insert({
            salon: salonActuel,
            pseudo: pseudo,
            message: crypte
        });


    console.log("RESULTAT SUPABASE :", resultat);


    document.getElementById("texte").value = "";

}






async function chargerMessages(){


let {data, error} = await supabase
.from("messages")
.select("*")
.eq("salon", salonActuel)
.order("id");


if(error){
    console.log(error);
    return;
}


data.forEach(m => {

    afficher(
        m.pseudo,
        m.message
    );

});


}





function afficher(pseudo,message){


document
.getElementById("messages")
.innerHTML +=

"<p>"+
pseudo+
" : "+
message+
"</p>";


}






// =================
// DECODEUR
// =================


window.decoder=function(){


let texte =
document.getElementById("crypte").value;


let cle =
Number(
document.getElementById("cleDecode").value
);



document.getElementById("resultat").innerHTML =

cesar(
texte,
-cle
);


}
