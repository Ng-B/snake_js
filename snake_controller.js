var JSON_actuel; // a chargé le fichier JSON dans l'objet
var MONDE= [];
var SNAKE = [];
var key = "right_arrow"; // enregistreur de touche enfoncée
var prev_key = "up_arrow"; // previous pressed key recorder
var play =false;   // enregistreur de touche précédent enfoncé
var walls = [];

function init() {
    // nous chargeons le fichier JSON à partir du localStorage
    loadJSON(function(response) {
        // Analyser la chaîne JSON en objet
        JSON_actuel = JSON.parse(response);

    });
    // nous attendons les touches enfoncées
    document.addEventListener('keyup', function (event) {
        if (event.defaultPrevented) {
            return;
        }

        var main_key = event.key || event.keyCode;

        // nous mettons à jour "key" et "prev_key" en conséquence
        if (main_key === 'ArrowUp' || main_key === 'AUp' || main_key === 38) {
            prev_key =key;
            key = "up_arrow";
        } else if (main_key === 'ArrowLeft' || main_key === 'ALef' || main_key === 37) {
            prev_key =key;
            key = "left_arrow";
        } else if(main_key === 'ArrowDown' || main_key === 'ADw' || main_key === 40){
            prev_key =key;
            key = "down_arrow";
        }else if(main_key === 'ArrowRight' || main_key === 'ADw' || main_key === 39){
            prev_key =key;
            key = "right_arrow";
        }
    });


}

function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");

    //on accède au localStorage pour récupérer le type de difficulté
    let difficulty = localStorage.getItem("difficulty");

    if(difficulty == 1){
        xobj.open('GET', 'difficulty1.json5', true);
    } else if (difficulty == 2){
        xobj.open('GET', 'difficulte2.json5', true);
    } else {
        xobj.open('GET', 'difficulte3.json5', true);

    }
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            //L'utilisation d'un rappel anonymees est requise, .open ne retournera PAS de valeur mais retournera simplement undefined en mode asynchrone
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function instancie_walls() { // fonction qui initialise les walls selon le fichier JSON

    // variables utiles
    let i2 = 1;
    let j2 = 1;
    let queuele = 0;
    let insere = false;

    // nous instancions les variables waals et snake
    for (i = 0; i < JSON_actuel.walls.length; i++) {
        walls[i] = JSON_actuel.walls[i];
    }
    for (i = 0; i < JSON_actuel.snake.length; i++) {
        SNAKE[i] = JSON_actuel.snake[i];
    }


    while (i2 <= JSON_actuel.dimensions[0]) {
        let coordonnees = []; // tableau que nous allons insérer dans MONDE []
        j2=1;
        while (j2 <= JSON_actuel.dimensions[1]) {
            insere = false;  // on met inséré à false car rien n'est ajouté dans les coordonnées []
            while (queuele < JSON_actuel.walls.length) {
                if (i2 === j2) { // en raison de la répétition des nombres, nous devons vérifier les emplacements
                    if (JSON_actuel.walls[queuele].indexOf(i2) == 0 && JSON_actuel.walls[queuele].indexOf(j2,1) == 1) {  // si une position WALL est trouvée
                        coordonnees.push("WALL");  // on l'ajoute au vecteur
                        insere = true; // inséré est maintenant vrai car les coordonnées [] ne sont pas vides
                    }
                } else {
                    if (JSON_actuel.walls[queuele].indexOf(i2) === 0 && JSON_actuel.walls[queuele].indexOf(j2) === 1) { // si pas de répétition
                        coordonnees.push("WALL");  // on l'ajoute au vecteur
                        insere = true;  // inséré est maintenant vrai car les coordonnées [] ne sont pas vides
                    }
                }
                queuele++; //incrementation
            }

            queuele = 0; //es coordonnées des walls sont terminées, nous redémarrons donc pour la nourriture

            while (queuele < JSON_actuel.food.length) {
                if (i2 === j2) { // en raison de la répétition des nombres, nous devons vérifier les emplacements
                    if (JSON_actuel.food[queuele].indexOf(i2) === 0 && JSON_actuel.food[queuele].lastIndexOf(j2) === 1) {
                        coordonnees.push("FOOD");// on l'ajoute au vecteur
                        insere = true; // inséré est maintenant vrai car les coordonnées [] ne sont pas vides
                    }
                } else {
                    if (JSON_actuel.food[queuele].indexOf(i2) === 0 && JSON_actuel.food[queuele].indexOf(j2) === 1) { // nourriture trouvée
                        coordonnees.push("FOOD"); //même logique que ci-dessus
                        insere = true; //même logique que ci-dessus
                    }
                }
                queuele++; //incrementation
            }

            queuele = 0; //les coordonnées de la nourriture sont faites, donc on recommence pour les positions des serpents

            while (queuele < JSON_actuel.snake.length) {
                if (i2 === j2) { // en raison de la répétition des nombres, nous devons vérifier les emplacements
                    if (JSON_actuel.snake[queuele].indexOf(i2) === 0 && JSON_actuel.snake[queuele].lastIndexOf(j2) === 1) {
                        coordonnees.push("SNAKE");// on l'ajoute au vecteur
                        insere = true;// inséré est maintenant vrai car les coordonnées [] ne sont pas vides
                    }
                } else {
                    if (JSON_actuel.snake[queuele].indexOf(i2) === 0 && JSON_actuel.snake[queuele].indexOf(j2) === 1) {
                        coordonnees.push("SNAKE"); //même logique que ci-dessus
                        insere = true //même logique que ci-dessus
                    }
                }
                queuele++; //incrementation
            }
            queuele = 0;

            if (insere == false) { //si rien n'est trouvé, nous ajoutons une position vide aux coordonnées []
                coordonnees.push("EMPTY");
            }
            j2++; //incrementation
        }
        MONDE.push(coordonnees); //on ajoute les coordonnées vectorielles au vecteur MONDE, c'est un vecteur dans un vecteur
        i2++; //incrementation
    }
}


function build() {

    instancie_walls(); //nous appelons la fonction d'initialisation des coordonnées ci-dessus

    // on vérifie l'existence d'un tableau dans la page HTML
    let body_test = document.getElementsByTagName('body')[0];
    let table_test = document.getElementById("table");
    //s'il existe on le supprime
    if (table_test)
        body_test.removeChild(table_test);

    // nous créons une table
    let table = document.createElement("table");
    table.setAttribute("id", "table");

    let i = 0;
    let j = 0;

    let body = document.getElementsByTagName('body')[0];


    //construction du corps HTML
    while(i< JSON_actuel.dimensions[0]){
        let row = table.insertRow(i);
        while(j<JSON_actuel.dimensions[1]){
            if (MONDE[i][j] == "SNAKE"){     // si SNAKE trouvé, nous ajoutons un "S" à la table
                let cellule1 = row.insertCell(j);
                cellule1.innerHTML = "S";
            } else if (MONDE[i][j] == "WALL") { // si WALL est trouvé, nous ajoutons un "|" à la table
                let cellule1 = row.insertCell(j);
                cellule1.innerHTML = "|";
            } else if(MONDE[i][j] == "FOOD"){ // si FOOD trouvé, nous ajoutons un "0" au tableau
                let cellule1 = row.insertCell(j);
                cellule1.innerHTML = "O";
            } else {   // si VIDE est trouvé, nous ajoutons un "_" à la table
                let cellule1 = row.insertCell(j);
                cellule1.innerHTML = "_";
            }
            j++;
        }
        j=0;
        i++;
    }

    body.appendChild(table); //on ajoute la table à <body>

    let boutons = document.getElementsByTagName("BUTTON");
    boutons[1].disabled = false;

}

function build2() {


    // nous reconstruisons la table
    let table = document.createElement("table");
    table.setAttribute("id", "table");

    let i = 0;
    let j = 0;

    // nous récupérons le corps
    let body = document.getElementsByTagName('body')[0];



    while(i< JSON_actuel.dimensions[0]){
        let row = table.insertRow(i);
        while(j<JSON_actuel.dimensions[1]){
            if (MONDE[i][j] == "SNAKE"){  // si SNAKE trouvé, nous ajoutons un "S" à la table
                let cellule1 = row.insertCell(j);
                cellule1.innerHTML = "S";
            } else if (MONDE[i][j] == "WALL") { // si WALL est trouvé, nous ajoutons un "|" à la table
                let cellule1 = row.insertCell(j);
                cellule1.innerHTML = "|";
            } else if(MONDE[i][j] == "FOOD"){ // si FOOD trouvé, nous ajoutons un "0" au tableau
                let cellule1 = row.insertCell(j);
                cellule1.innerHTML = "O";
                cellule1.setAttribute("style", "background-color: red;");
            } else {
                let cellule1 = row.insertCell(j); ////  si VIDE est trouvé, nous ajoutons un "_" à la table
                cellule1.innerHTML = "_";
            }

            j++;
        }
        j=0;
        i++;
    }

    body.appendChild(table);
    return;
}

async function start_game() { // fonction qui démarre le jeu

    play=true;
    while (play) { // boucle qui continue pendant que le jeu est encore en cours et que la partie n'est pas terminée
        if(key){
            // nous devons trouver la tête du serpent
            let tete = SNAKE[SNAKE.length-1][0];
            let queue = SNAKE[SNAKE.length-1][1];

            if(key == "right_arrow" && prev_key != "right_arrow" && prev_key != "left_arrow" && !collision_snake(tete,queue+1)){ // si direction droite et pas de collision avec lui-même
                SNAKE.push([tete,queue+1]);
            } else if(key == "left_arrow" && prev_key != "right_arrow" && prev_key != "left_arrow" && !collision_snake(tete,queue-1)){ // si direction gauche et pas de collision avec lui-même
                SNAKE.push([tete,queue-1]);
            } else if(key =="up_arrow" && prev_key != "up_arrow" && prev_key != "down_arrow" && !collision_snake(tete-1,queue)){ // si direction haut et pas de collision avec lui-même
                SNAKE.push([tete-1,queue]);
            } else if(key == "down_arrow" && prev_key != "up_arrow" && prev_key != "down_arrow" && !collision_snake(tete+1,queue)){ // si direction vers le bas et pas de collision avec lui-même
                SNAKE.push([tete+1,queue]);
            } else { // si la direction est dans la direction opposée, nous bloquons le jeu
                alert("Action bloquee GAME OVER");
                let boutons = document.getElementsByTagName("BUTTON");
                boutons[1].disabled = true; // nous désactivons le bouton de lecture
                break;
            }

            let mem_1 = SNAKE[0][0]; // nous mémorisons la queue du SERPENT
            let mem_2 = SNAKE[0][1]; // nous mémorisons la tête du SERPENT

            if(collision_food(SNAKE[SNAKE.length-1][0],SNAKE[SNAKE.length-1][1])){ //si SNAKE entre en collision avec de la nourriture
                set_random_food(); // il mange la nourriture, le SERPENT grossit et une autre nourriture est préparée
            } else {
                SNAKE.shift(); //sinon décallé la queue (normal)
            }


            if(collision( SNAKE[SNAKE.length-1][0],SNAKE[SNAKE.length-1][1])){ // si SNAKE entre en collision avec un mur
                alert("Game Over"); // le jeu se termine comme ci-dessus
                play = false;
                let boutons = document.getElementsByTagName("BUTTON");
                boutons[1].disabled = true;
                break;
            }

            // on recrée la variable MONDE avec la nouvelle position du serpent
            redefine_MONDE(mem_1,mem_2,SNAKE[SNAKE.length-1][0],SNAKE[SNAKE.length-1][1]);

            // si des tables existent déjà, les supprimer
            let body = document.getElementsByTagName('body')[0];
            let table = document.getElementById("table");
            if (table)
                body.removeChild(table);
            // nous recréons la page visuelle HTML
            build2();
            // on attend quelques millisecondes que le joueur réagisse, en accords avec le fichier de difficulté JSON
            await sleep(JSON_actuel.delay);

        }
    }


}


// vérifier si le serpent entre en collision avec un mur
function collision(d,l) {
    let i = 0;

    while(i < walls.length) {
        if(walls[i][0] == d && walls[i][1] == l){
            return true; // si la collision retourne true
        }
        i++;
    }
    return false; // sinon retourner faux
}

// fonction sleep() pendant quelques millisecondes spécifiées afin que le jeu ne soit pas trop rapide pour le joueur
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// vérifier si le serpent entre en collision avec lui-même
function collision_snake(d,l) {
    let i = 0;

    while(i < SNAKE.length) {
        if(SNAKE[i][0] == d && SNAKE[i][1] == l){
            return true; // si collision, retourne true
        }
        i++;
    }
    return false; // sinon retourner faux
}


// vérifier si le serpent entre en collision avec un aliment
function collision_food(d1,e1) {
    if(JSON_actuel.food[0][0] == d1 && JSON_actuel.food[0][1] == e1 ){
        return true;// si collision, retourne true
    } else {
        return false; // sinon retourner faux
    }

}

// après avoir mangé un aliment, un nouvel aliment doit être réglé
function set_random_food() {
    let new_i = Math.floor(Math.random() * JSON_actuel.dimensions[0]); // position aléatoire x confinée dans la dimension du MONDE
    let new_j =  Math.floor(Math.random() * JSON_actuel.dimensions[1]); //position aléatoire y confinée dans la dimension du MONDE

    // si de la nourriture tombe accidentellement sur le mur ou sur le serpent
    if (collision(new_i, new_j) || collision_snake(new_i, new_j)){
        set_random_food();
    } else {
        //nous initialisons une nouvelle position FOOD
        JSON_actuel.food[0][0]= new_i+1;
        JSON_actuel.food[0][1]= new_j+1;
        if (MONDE[new_i][new_j] != "WALL"){ // si le MUR est déjà présent on l'écrase pour placer la nourriture
            MONDE[new_i][new_j] = "FOOD";
        } else {
            MONDE[2][2] = "FOOD"; // par défaut
        }
    }

}

// fonction qui modifie la variable MONDE en fonction des nouvelles positions du SNAKE
function redefine_MONDE(d1,e1,d2,e2) {
    let i = 0;
    let j = 0;
    while(i < MONDE.length) {
        while (j < JSON_actuel.dimensions[1]){
            if( i == (d1-1) && j ==(e1-1) ){
                MONDE[i][j] = "EMPTY";
            }
            if( i == (d2-1) && j ==(e2-1) ){
                MONDE[i][j] = "SNAKE";
            }
            j++;
        }
        j=0;
        i++;
    }
}