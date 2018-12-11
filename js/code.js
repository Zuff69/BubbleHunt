$(function () {
    init();
});

function init() {
    // structure

    // paramètre (données non modifiables et non modifiées par le jeu) - variables globales
    intervalleRafraichissement = 40;
    intervalleNouvelleBulle = 2 * 1000; // 2 secondes
    proportionBullesNoires = 10;
    tempsLimite = 180*1000; // 3 minutes
    listeCouleurs = { "B": "#0000ff", "V": "#00c000", "N": "#555" };
    intervalleChangementVitesse = 20 * 1000; // 20 secondes
    incrementVitesse = 10;
    rayonBulleBleue = 10;
    rayonMinBullesNoires = 10;
    rayonMaxBullesNoires = 50;

    // initialisation des variables
     monCanvas = document.getElementById("dessin");
    context = monCanvas.getContext("2d");

    // gestionnaires
    reinitialisation();
    $("#boutonJouer").click(function () {
        afficheEcranSelectionne("ecranJeu");
    });
    $("#boutonQuitter").click(function () {
        reinitialisation();
        afficheEcranSelectionne("ecranAccueil");
    });
    $("#boutonAccueil").click(function () {
        reinitialisation();
        afficheEcranSelectionne("ecranAccueil");
    });
    $("#boutonRejouer").click(function () {
        reinitialisation();
        afficheEcranSelectionne("ecranJeu");
    });
    // interactivité sur le canvas
    monCanvas.addEventListener("mousemove", positionSouris, false);

    // moteur de règles
    inter = setInterval(regles, intervalleRafraichissement);
    //animer();

    // lancement : affichage de la page d'accueil
    afficheEcranSelectionne("ecranAccueil");
}

function reinitialisation() {
    tempsJeu = 0;
    ecranCourant = null;
    niveauCourant = 1;
    score = 0;
    // position de la souris
    xSourisCanvas = monCanvas.width / 2;
    ySourisCanvas = monCanvas.height / 2;

    // liste des bulles
    listeBulles = [];

    // nombre total de bulles (sans bulle bleue)
    nbBulles = 0;

    // vitesse initiales des bulles en pixels par secondes
    vitesse = 10;

    // nombre initial de vie
    nombreVies = 3;
}

function positionSouris(e) {
    // position de la souris / page
    var xSourisDocument = e.pageX;
    var ySourisDocument = e.pageY;

    // position du canvas / page
    var xCanvas = monCanvas.offsetLeft;
    var yCanvas = monCanvas.offsetTop;

    // position souris / canvas
    xSourisCanvas = xSourisDocument - xCanvas;
    ySourisCanvas = ySourisDocument - yCanvas;

}

function afficheEcranSelectionne(ecranSelectionne) {
    ecranCourant = ecranSelectionne;
    $("#ecranAccueil").hide();
    $("#ecranJeu").hide();
    $("#ecranBilan").hide();
    $("#" + ecranSelectionne).show();
}

function regles() {
    if (ecranCourant === "ecranJeu") {
        //animation
        animer();
    } else if (ecranCourant === "ecranBilan") {
        //affichage du score final
        affichageScoreFinal();
    }
}

function animer() {
    // 1. temps de jeu
    if (tempsJeu > tempsLimite) {
        afficheEcranSelectionne("ecranBilan");
    }
    tempsJeu = tempsJeu + intervalleRafraichissement;
    if (tempsJeu % intervalleChangementVitesse === 0) {
        vitesse = vitesse + incrementVitesse;
        niveauCourant++;
    }


    // 2. création des bulles noire et verte - test sur le temps
    if (tempsJeu % intervalleNouvelleBulle === 0) {
        // création d'une nouvlle bulle -> test s'il est temps de créer une verte
        if (listeBulles.length % proportionBullesNoires === 0 && listeBulles.length !== 0) {
            creeBulle("V");
        } else {
            creeBulle("N");
        }
    }
    // 3. dessiner bulles
    context.clearRect(0, 0, monCanvas.width, monCanvas.height);
    for (var j = 0; j < listeBulles.length; j++) {
        var bulle = listeBulles[j];
        if (listeBulles[j][4] === true) {
            bulle[1] = bulle[1] + vitesse * intervalleRafraichissement / 1000;
            dessineBulle(bulle, j);
        }
    }
    // 4. dessiner bulle bleue
    dessineBulle([xSourisCanvas, ySourisCanvas, "B", rayonBulleBleue, true], null);

    // 5. mettre à jour de l'affichage
    majAffichage();

}


function creeBulle(couleur) {
    rayon = Math.floor((Math.random() * (rayonMaxBullesNoires - rayonMinBullesNoires)) + rayonMinBullesNoires);
    x = Math.floor(Math.random() * (monCanvas.width - 2 * rayon)) + rayon;
    y = -rayon;

    listeBulles.push([x, y, couleur, rayon, true]);
}

function dessineBulle(bulle, j) {
    // dessine la bulle
    context.beginPath();
    context.arc(bulle[0], bulle[1], bulle[3], 0, 2 * Math.PI, false);
    context.fillStyle = listeCouleurs[bulle[2]];
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = "#000";
    context.stroke();

    // cache la bulle s'il est sort COMPLETEMENT du canvas
    if (bulle[1] > monCanvas.height + bulle[3]) {
        bulle[4] = false;
    }

    // vérification de collision
    var dx = bulle[0] - xSourisCanvas;
    var dy = bulle[1] - ySourisCanvas;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < bulle[3] + rayonBulleBleue && j!= null) {
        // collision détectée !
        if (bulle[2]==="N") {
            nombreVies--;
            if (nombreVies===0) {
                afficheEcranSelectionne("ecranBilan");
            }
        } else if (bulle[2] === "V") {
            score++;
        }
        bulle[4] = false;
    }
}

function majAffichage() {
    $("#score").html("score : " + score);
    $("#niveau").html("niveau : " + niveauCourant);
    $("#vies").html("vies : " + nombreVies);
    $("#temps").html("temps : " + tempsJeu);
}

function affichageScoreFinal() {
    $("#scoreFinal").html("score final : " + score);
    $("#niveauFinal").html("niveau final : " + niveauCourant);
}