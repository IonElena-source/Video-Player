//coordonatele pentru controalele desenate de noi
let control1 = { x: 0, y: 0, xFinal: 0, YFinal: 0, width: 0, height: 0 }
let control2 = { x: 0, y: 0, xFinal: 0, YFinal: 0, width: 0, height: 0 }
let control3 = { x: 0, y: 0, xFinal: 0, YFinal: 0, width: 0, height: 0 }
let control4 = { x: 0, y: 0, xFinal: 0, YFinal: 0, width: 0, height: 0 }
let control5 = { x: 0, y: 0, xFinal: 0, YFinal: 0, width: 0, height: 0 }
let progressBar = { x: 0, y: 0, xFinal: 0, YFinal: 0, width: 0, height: 0 }


//vector ce va contine coordonatele controalelor desenate
const coordonateControls = [control1, control2, control3, control4, control5]

//variabila globala unde vom tine videoclipul curent
var video_curent = {
    name: "",
    video: null,
    effect: "",
    previewActive: false,
    preview: null,
    previewX: 0,
    previewCurrentTime: 0,
    redareAutomata: false,
    currentEffect: ""

}

//stocam textul corespunzator controlului de play desenat,pentru a schimba textul atunci cand videoclipul este pe pauza
var textPlay = "PLAY";

//functie pentru adaugarea unui videoclip in ultimul  chenarul desenat si crearea urmatorului chenar gol
addVideo();


selectVideo();//functie pentru selectarea unui videoclip din playlist


changeOrder();//functie ce permite schimbarea ordinii videoclipurilor prin drag and drop


operationVideo();//functie pentru atasarea de event listen uri si a textului specific fiecarui control

//////-----------FUNCTII IMPLEMENTATE----------/////////////////////


function addVideo() {

    let videos = document.getElementsByClassName("video");
    let video = videos[videos.length - 1]
    let td_buttons_delete_prim = document.getElementsByClassName("button-delete-prim");
    for (let i = 0; i < td_buttons_delete_prim.length; i++) {
        let tdButton = td_buttons_delete_prim[i];
        tdButton.addEventListener("click", deleteVideo)
    }

    let td_nume_video = document.getElementsByClassName("td-nume-video")[videos.length - 1];
    let source = document.createElement("source");

    video.addEventListener("dragover", function (e) {
        e.preventDefault();
    });
    video.addEventListener("drop", function (e) {
        e.preventDefault();
        let data = e.dataTransfer;//dataTransfer intoarce un obiect de tip DataTransfer in care sunt tinute item-urile in timpul unei operatii drag and drop
        let files = data.files;

        //altfel adaugam videoclip nou
        if (files.length > 0) {
            let file = files[0];

            let fileReader = new FileReader();
            fileReader.addEventListener("load", function (e) {

                let dataURL = e.target.result;
                let source = document.createElement("source")
                source.src = dataURL;
                console.log(dataURL)
                //e.target=obiectul fileReader
                video.dataset.nume=file.name;
                let ok = false;
                //verificam daca videocalipul pe care vrem sa il incarcam exista deja
                let videosDone = document.getElementsByClassName("done");
                for (let i = 0; i < videosDone.length; i++) {
                    if (videosDone[i].src === source.src) {
                        ok = true;
                    }
                }
                if (ok === true) {
                    alert("Exista deja acest videoclip")
                    return;
                }
                video.src = dataURL;
                //setam proprietate data-nume cu numele fisierului,pentru al afisa in playlist si pentru a ne putea folosi la functia de redareAutomata
                video.setAttribute("data-nume", file.name);
                td_nume_video.appendChild(document.createTextNode(file.name))
                let canvas = document.getElementById("canvas-video")
                video.setAttribute("width", canvas.width);
                video.setAttribute("height", canvas.height);
                



                video.classList.add("done")
                //adaugam done si la parintele elementului video,adica la elementul td care il contine
                let parentVideo = video.parentElement;
                parentVideo.classList.remove("td-video")
                parentVideo.classList.add("td-video-done")
                console.log(parentVideo)

                let tBody = document.getElementById("playlist-tBody");
                let trNou = document.createElement("tr");

                let td_video_nou = document.createElement("td");
                td_video_nou.classList.add("td-video");


                let div_nume_video_nou = document.createElement("div");
                div_nume_video_nou.classList.add("td-nume-video")


                let videoNou = document.createElement("video");
                videoNou.classList.add("video");
                videoNou.dataset.ordine = Number(video.dataset.ordine) + 1;

                td_video_nou.appendChild(div_nume_video_nou);
                td_video_nou.appendChild(videoNou);

                //adaugam buton pentru delete
                let tdButton = document.createElement("td");
                let buttonDelete = document.createElement("button");
                buttonDelete.classList.add("button-delete");

                let iElement = document.createElement("i");//"far fa-trash-alt";
                iElement.classList.add("far");
                iElement.classList.add("fa-trash-alt")

                buttonDelete.appendChild(iElement);

                //adaugare listener pentru gestionarea butonului de stergere
                buttonDelete.addEventListener("click", deleteVideo);
                tdButton.appendChild(buttonDelete);
                trNou.appendChild(td_video_nou);
                trNou.appendChild(tdButton);
                tBody.append(trNou);


                //apelam recursiv functiile de schimbare a ordiniii si de delectare a videolcipurilor,pentru a fi valabile si pt noile videoclipuri selectate
                addVideo();
                changeOrder();
                selectVideo();

            })

            fileReader.readAsDataURL(file);
        }
    })


}

//functie pt schimbare ordinii prin drag and drop
function changeOrder() {
    let videos = document.getElementsByClassName("video");
    //sourceA si soruceB vor fii videoclipurile ce se vor intreschimba
    let sourceA;
    let sourceB;
    let numeVideoA;
    let numeVideoB;
    let videoA;
    let videoB;
    for (let i = 0; i < videos.length; i++) {
        let video = videos[i];

        if (video.src === "") {
            //ca nu sa ne incurce ultimul rand din tabel gol,fara niciun videoclip,ne asiguram ca facem drag an drop doar intre videolcipuri incarcate

            return;
        }
        //setam fiecare videoclip sa fie draggable
        video.setAttribute("draggable", true);
        //cand incepe evenimentul de drag preluam td-ul respectiv videoclipului dragat
        video.addEventListener("dragstart", (ev) => {


            sourceA = ev.target.parentElement;//td-ul care cuprinde si numele si videoclipul

            numeVideoA = sourceA.children[0];//scoatem primul copil al td-ului care este numele acestuia

            videoA = sourceA.children[1];//scoatem videoclipul din td-ul respectiv


        })
        //cand se intru cu videoclipul de dragat pe o portiune drop valida,preiau sursa B
        video.addEventListener("dragenter", (e) => {

            sourceB = e.target.parentElement;
            numeVideoB = sourceB.children[0];
            videoB = sourceB.children[1]



        })
        //cand dam drumul la click-ul apasat,eliberam sursa A,atunvi acestea s evor interschimba
        video.addEventListener("dragend", () => {


            sourceA.appendChild(numeVideoB)
            sourceA.appendChild(videoB)

            sourceB.appendChild(numeVideoA)
            sourceB.appendChild(videoA)
        })




    }

}

//functie pt stergerea unui videoclip
function deleteVideo() {
    let target = this;
    //butonul se afla intr-un td,luam td-ul respectiv
    let parentButtonTd = target.parentElement;
    //luam elementul de tip tr-al butonului respectiv cu ajutorul td-ului obtinut mai devreme
    let parentRow = parentButtonTd.parentElement;
    if (video_curent.video == parentRow.children[0].children[1]) {
        video_curent.video = null
        //daca stergem un element din playlist in timp ce acesta este si videoclipul selectat curent si este desenat pe canvas,
        //in momentul stergerii golim si canvasul
        let canvas = document.getElementById("canvas-video");
        let context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height)

    }
    if (parentRow.children[0].children[0].innerText.length !== 0) {

        //luam corpul
        let tBody = document.getElementById("playlist-tBody");
        //stergem randul din tabel
        tBody.removeChild(parentRow);
    }
    else {
        alert("nu exista videoclip de sters")

        //nu putem sterge un videoclip neincarcat
    }


}


//functie pt desenarea preview-ului care se va apela de fiecare data cand suntem cu cursorul pe progres-bar


function drawControls() {
    let canvas = document.getElementById("canvas-video");
    let context = canvas.getContext("2d");
    //o sa desenam contraoele pe un dreptunghi din canvas de width 100 si height 100
    context.strokeStyle = `rgba(199,220,235,0.5)`;//o-transprarent 1-opac,0.5-semitransparent


    let nrControale = 5;//o sa avemm 5 controale
    //latimea controalelor va fii egala,vedem cat este latimea unui control astfel incat sa incapa 5 controale egale
    let latimeControl = canvas.width / nrControale;
    //distanta va fii 20 la suta din latimea normala a unui control
    let distanta = latimeControl - (latimeControl * 0.8)
    //canvas.width-distanta*6-latimea finala totala a controalelor
    let widthFinalControl = (canvas.width - distanta * 6) / nrControale;
    for (let i = 0; i < nrControale; i++) {

        let heightControl = 50;
        let xControl = (i * widthFinalControl) + distanta * (i + 1);//i+1 pt a avea distanta si inaintea de desenarea primului control

        //ca sa porneasca de jos desenarea,ne deplasam cu y pana la inaltimea canvasului dupa care scadem inaltimea unui control

        let yControl = 545;//ca sa las 5 px distanta intre controlere si linia de jos a canvasului,scan
        coordonateControls[i].x = xControl;
        coordonateControls[i].y = yControl;
        coordonateControls[i].width = widthFinalControl
        coordonateControls[i].height = heightControl
        coordonateControls[i].xFinal = xControl + widthFinalControl;
        coordonateControls[i].YFinal = yControl + heightControl;
        context.strokeRect(xControl, yControl, widthFinalControl, heightControl)



    }
    context.fillStyle = `rgba(255,255,255,0.5)`





    //desenare progressBar
    context.fillRect(0, 530, 800, 10);

    //desenare texte in butoane
    context.strokeWidth = 10;
    context.fillStyle = `rgba(255,255,255,0.5)`
    context.font = "20px Arial";
    let textMetrics = context.measureText("PREVIOUS");

    //obtinem lungime ca sa desenam text-u fix la jumatatea butoanelor,astfe jumatatea textului sa fie pe jumatatea controlului
    context.fillText("PREVIOUS", coordonateControls[0].x + coordonateControls[0].width / 2 - textMetrics.width / 2, coordonateControls[0].y + coordonateControls[0].height / 2)
    textMetrics = context.measureText(textPlay);
    context.fillText(textPlay, coordonateControls[1].x + coordonateControls[1].width / 2 - textMetrics.width / 2, coordonateControls[1].y + coordonateControls[1].height / 2)
    textMetrics = context.measureText("NEXT");
    context.fillText("NEXT", coordonateControls[2].x + coordonateControls[2].width / 2 - textMetrics.width / 2, coordonateControls[2].y + coordonateControls[2].height / 2)
    context.font = "30px Arial";
    textMetrics = context.measureText("+");
    context.fillText("+", coordonateControls[3].x + coordonateControls[3].width / 2 - textMetrics.width / 2, coordonateControls[2].y + coordonateControls[3].height / 2)
    textMetrics = context.measureText("-");
    context.fillText("-", coordonateControls[4].x + +coordonateControls[4].width / 2 - textMetrics.width / 2, coordonateControls[2].y + coordonateControls[4].height / 2)


    progressBar.x = 0;
    progressBar.y = 530
    progressBar.width = 800;
    progressBar.height = 10;
    progressBar.xFinal = 800;
    progressBar.YFinal = 540;

    //aplicare de functionalitate progressBar
    //regula de 3 simpla
    //atasez aici functionalitate deoarece se va reapela de fiecare data cand imaginea din canvas se schimba cu ajutorul requestAnimationFrame

    if (video_curent.video != null) {
        let durata = video_curent.video.duration;
        //daca tot progress-ul bar se va umple atunci cand proprietatea de currentTime va fii egala cu durata,adica a ajuns la sfarsit
        //la un moment curent din progressBar cat din acesta se va umple
        //800 este latimea totatala a canvasului,puteam sa scriu canvas.width
        let widthCurrent = (800 * video_curent.video.currentTime) / durata
        context.fillStyle = `rgba(255,255,255,1)`
        //desenam cu latimea curenta la aceeasi x,y si cu aceeasi ianltime
        context.fillRect(0, 530, widthCurrent, 10)


    }

}
//functie de selectarea a unui videoclip dintr un playlist,putem sa dam click si pe nume sau pe video,amandoua sunt din acelasi td
function selectVideo() {
    //luam toate td-urile cu videoclipuri incarcate si le adaugam event listenuri,acceasta functie se va reapela in functie de adaugare a unui videoclip
    //astfel incat cand aduagam un videolcip nou sa poata fi si acesta selectat
    var itemsSelected = document.getElementsByClassName("td-video-done");
    let canvas = document.getElementById("canvas-video");
    let context = canvas.getContext("2d");
    for (let i = 0; i < itemsSelected.length; i++) {
        let itemSelected = itemsSelected[i];

        itemSelected.addEventListener("click", (ev) => {

            if (video_curent.video !== null) {
                video_curent.video.pause();
                video_curent.video.currentTime = 0;
                //la selectarea altui videoclip dezactivam functia de preview cadru
                video_curent.previewActive = false;
                document.getElementById("statusPreviewCadru").innerText = "Functia de preview cadru este dezactivata"
                video_curent.video = null;
                video_curent.nume = "";
            }

            //apelam functie de desenare a controaelor
            drawControls();
            ev.preventDefault();
            //verificam daca am dat click pe nume sau pe video si extragem videoclipul
            if (ev.target.classList.contains("td-nume-video")) {


                video_curent.nume = ev.target.innerText;
                video_curent.video = ev.target.parentElement.children[1]


            }
            else {
                video_curent.nume = ev.target.parentElement.children[0].innerText;

                video_curent.video = ev.target;


            }
            video_curent.video.height = canvas.width;
            video_curent.video.style.width = canvas.width;
            video_curent.video.style.height = canvas.height;
            video_curent.video.height = canvas.height;

            video_curent.video.addEventListener("play", () => {
                //functie de redesenare cand pornim videoclipul
                requestAnimationFrame(drawVideo)

            })
            //desenam videoclipul selectat pe canvas
            drawVideo();

        })

        redareAutomata();


    }



}

//de explicat
function getRGBColor(hex) {
    var colorValue;
    if (hex[0] === '#') {
        hex = hex.substr(1);//in caz ca primim codul hexa al culorii scapam de primul caracter,pentru a putea parsa restul
    }
    colorValue = parseInt(hex, 16);//transformam numarul din format hexadecimal in  intreg

    return {
        r: colorValue >> 16,
        g: (colorValue >> 8) & 255,
        b: colorValue & 255
    }
}

//functie pt crearea unui gradient
function createGradient(colorA, colorB) {
    var gradient = [];//vom avea un vector de valori,pornind de la culoarea A,scazand intensitatea acestia si crescand intensitatea lui culorii B
    //astfel intensitatea lui A va pleca de la 255 si va ajunge la 0 iar intensitatea lui B va pleca de la 0 si va ajunge la 255
    var maxValue = 255;
    var A = getRGBColor(colorA);//stocam culoarea primita in format RGB
    var B = getRGBColor(colorB);
    for (let i = 0; i <= maxValue; i++) {
        let intensityB = i;
        var intensityA = maxValue - intensityB;
        gradient[i] = {
            //aceasta formula combina cele 2 culori bazate pe intensitatea sa
            r: (intensityA * A.r + intensityB * B.r) / maxValue,
            g: (intensityA * A.g + intensityB * B.g) / maxValue,
            b: (intensityA * A.b + intensityB * B.b) / maxValue
        }
    }
    return gradient;

}
//functie de desenare a videoclipului curent
function drawVideo() {

    let canvas = document.getElementById("canvas-video");
    let context = canvas.getContext("2d");
    let canvas_effect = document.createElement("canvas");
    let contextEffect = canvas_effect.getContext("2d");

    if (video_curent.video !== null) {

        context.restore();//resturam setarile corespunzatoare efectului
        context.drawImage(video_curent.video, 0, 0, canvas.width, canvas.height);
        if (video_curent.currentEffect === "flipOrizontal") {
            //flip orizontal
            //reintializam matricea de transformare pentru a reveni la setarile initiale,si pentru a nu se cumula translatia si scalarea
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.translate(0, canvas.height);//ne mutam la sfarsitul canvasului,pentur a incepe de jos desenare
            context.scale(1, -1);//incepem sa deseam de jos in sus
            context.save();//salvam setarile pentru a le avea atunci cand desenam imaginea
        }
        if (video_curent.currentEffect === "flipVertical") {
            //flip vertical
            //reintializam matricea de transformare pentru a reveni la setarile initiale,si pentru a nu se cumula translatia si scalarea
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.translate(canvas.width, 0);//ne mutam cu dreapta //canvas-ului si incepem de acolo scrierea
            context.scale(-1, 1);//incepem sa desenam de la dreapta la stanga
            context.save();

        }
        if (video_curent.currentEffect !== "") {
            //verificam daca avem un efect setat inafara de celalte 2 cu flip-ul
            context.drawImage(video_curent.video, 0, 0, canvas.width, canvas.height)
            let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            let data = imageData.data;
            if (video_curent.currentEffect === "glitch") {
                for (let i = 0; i < data.length; i += 4) {


                    let rOffset = 20;
                    let gOffset = -10;
                    let bOffset = 10

                    let r = data[i]
                    let g = data[i + 1]
                    let b = data[i + 2]
                    data[i + 0 + rOffset * 4] = data[i + 0]
                    data[i + 1 + gOffset * 4] = data[i + 1]
                    data[i + 2 + bOffset * 4] = data[i + 3]



                }
                context.putImageData(imageData, 0, 0)
            }

            if (video_curent.currentEffect === "gradient") {
                let gradientefect = createGradient("#ff0000", "#000000");
                for (let i = 0; i < data.length; i += 4) {


                    let r = data[i]
                    let g = data[i + 1]
                    let b = data[i + 2]

                    data[i] = gradientefect[r].r
                    data[i + 1] = gradientefect[g].g;
                    data[i + 2] = gradientefect[b].b


                }
                context.putImageData(imageData, 0, 0)
            }
            if (video_curent.currentEffect === "falseColor") {
                //efectul FalseColor presupune inversarea culorilor asfel RGB devine GBR
                for (let i = 0; i < data.length; i += 4) {

                    let r = data[i]
                    let g = data[i + 1]
                    let b = data[i + 2]

                    data[i] = g
                    data[i + 1] = b
                    data[i + 2] = r

                }
                context.putImageData(imageData, 0, 0)
            }




        }
        //reinitializam matricea de transformarea curenta pentru a reveni la setaril initiale cand desenam controalele
        context.setTransform(1, 0, 0, 1, 0, 0);

        //daca preview-ul este activat si daca avem un videoclip selectat
        if (video_curent.previewActive === true) {
            if (video_curent.preview !== null) {
                //ne creeam un elemnt de tip video 
                   //ne am luat un videoclipPreview pentru a afce acest lucru,pentru a nu muta si momentul de timp al videoclipul selectat
                   //deorecem vom muta durata curenta de timp a videoclipului nou la momeentul de timp corespunzator pozitiei cursorului pe porgressBar in
                let videoPreview = document.createElement("video");
                //i dam sursa videoclipul nostru curent
                videoPreview.src = video_curent.video.src;
                //ne regasim canvas-ul folosit pentru preview
                let canvasPreview = document.getElementById("canvas-preview");
                //il facem sa nu mai apara si aici
                canvasPreview.style.display = "none"
                let contextPreview = canvasPreview.getContext("2d");
                //in currentTime stocam momentul de timp la care suntem cand ne ducem cu cursorul pe progressBar
                //ducem videoclipul pentru preview la momentul corespunzator pozitiei cursorului pe progressBar
             
                videoPreview.currentTime = video_curent.currentTime;
                contextPreview.drawImage(videoPreview, 0, 0, canvasPreview.width, canvasPreview.height);


                videoPreview.addEventListener("canplay", () => {
                    contextPreview.drawImage(videoPreview, 0, 0, canvasPreview.width, canvasPreview.height);
                })
                //desenam din contexPreview in contextul nostru desupra progressBar-ului,un dreptunghi cu 100 si 50 cu imaginea de la momentul corespunzator
                contextPreview.drawImage(videoPreview, 0, 0, canvasPreview.width, canvasPreview.height);
                context.drawImage(canvasPreview, video_curent.previewX, progressBar.y - 2 * progressBar.height - 50, 100, 50)


            }

        }
        //apelam aici functia de desenare a controalelor pentru a se apela atunci cand imaginea se schimba,sa se redeseneze si controalele
        drawControls()

        requestAnimationFrame(drawVideo)


    }
}


//tratarea operatiilor de play,pause,next,previous si tratrea volumului
function operationVideo() {
    let canvas = document.getElementById("canvas-video");
    let context = canvas.getContext("2d");

    //desenarea simbolurilor specifice operatiilor

    canvas.addEventListener("click", (ev) => {

        if (video_curent.video !== null) {

            //daca cursorul se afla pe primul button

            if (ev.offsetX >= coordonateControls[0].x && ev.offsetX < coordonateControls[0].xFinal &&

                ev.offsetY >= coordonateControls[0].y && ev.offsetY < coordonateControls[0].YFinal

            ) {
                video_curent.video.pause();
                video_curent.video.currentTime = 0;
                //butonul de previous
                let index;
                let videos = document.getElementsByClassName("done");

                //regasesc in lista de videoclipuri din playlist,videoclipul recent
                for (let i = 0; i < videos.length; i++) {
                    let video = videos[i];

                    if (video.dataset.nume === video_curent.nume) {
                        index = i;
                    }
                }
                //videoclipul la care vreau sa aplic operatia de previous trebuie sa porneasca de la al doilea videoclip
                if (index >= 1) {
                    let videoPrevious = document.getElementsByClassName("done")[index - 1];
                    if (videoPrevious !== null) {

                        video_curent.nume = videoPrevious.dataset.nume;
                        video_curent.video = videoPrevious;
                    }
                }
                else {
                    //aici pot implementa astfel incat cand sunt pe primul videoclip si dau previous,sa imi ia de la sfarsit lista de playlist
                    alert("Nu exista videoclip anterior")
                }
            }

            //daca cursorul se afla intre dimensiunile butonului de play
            if (ev.offsetX >= coordonateControls[1].x && ev.offsetX < coordonateControls[1].xFinal &&
                ev.offsetY >= coordonateControls[1].y && ev.offsetY < coordonateControls[1].YFinal
            ) {

                //verific starea videoclipului curent
                if (video_curent.video.paused) {

                    video_curent.video.play();
                    textPlay = "PAUSE"



                }
                else {
                    video_curent.video.pause();
                    textPlay = "PLAY"

                }

            }

            //suntem pe butonul de next
            if (ev.offsetX >= coordonateControls[2].x && ev.offsetX < coordonateControls[2].xFinal &&

                ev.offsetY >= coordonateControls[2].y && ev.offsetY < coordonateControls[2].YFinal) {

                video_curent.video.pause();
                video_curent.video.currentTime = 0;
                let index;
                let videos = document.getElementsByClassName("done");
                console.log(videos.length)

                //regasesc in lista de videoclipuri din playlist,videoclipul recent
                for (let i = 0; i < videos.length; i++) {
                    let video = videos[i];

                    if (video.dataset.nume === video_curent.nume) {

                        index = i;
                    }


                }

            //verific daca sunt pe ultimul videoclip sau nu
                if (index < videos.length - 1) {
                    let videoNext = document.getElementsByClassName("video")[index + 1];
                    if (videoNext !== null) {

                        video_curent.nume = videoNext.dataset.nume;
                        video_curent.video = videoNext;
                        //redesenz videoclipul curent,deoarece acum este schimbat
                        drawVideo();
                    

                    }
                }
                else {
                    //suntem pe utlimul videoclip si o luam de la capat
                    //alert("Nu exista videoclip urmator")
                    let videoNext = document.getElementsByClassName("video")[0];
                    if (videoNext !== null) {

                        video_curent.nume = videoNext.dataset.nume;
                        video_curent.video = videoNext;
                        //redesenz videoclipul curent,deoarece acum este schimbat
                        drawVideo();


                    }
                }


            }

            //ne aflam cu cursorul pe butonul de + pt volum
            if (ev.offsetX >= coordonateControls[3].x && ev.offsetX < coordonateControls[3].xFinal &&

                ev.offsetY >= coordonateControls[3].y && ev.offsetY < coordonateControls[3].YFinal) {

                //volumul unui videoclip ia valori intre [0,1]
                //daca este egal cu 1,nu putem creste valoare volumului
                //pt a creste valoarea volumului acesta trebuuie sa fie sub 1
                if (video_curent.video.volume < 1) {

                    video_curent.video.volume = video_curent.video.volume + 0.1;
                }


                let videosDone = document.getElementsByClassName("done");
                let videoStocat;
                for (let i = 0; i < videosDone.length; i++) {
                    if (videosDone[i].src === video_curent.nume) {
                        videoStocat = videosDone[i];
                    }
                }



            }



            if (ev.offsetX >= coordonateControls[4].x && ev.offsetX < coordonateControls[4].xFinal
                && ev.offsetY >= coordonateControls[4].y && ev.offsetY < coordonateControls[4].YFinal
            ) {

                //pt a scadea valoarea volumului acesta trebuie sa fie mai mare ca 0,deoarece valoarea minima posibila a volumului este 0
                if (video_curent.video.volume > 0) {

                    video_curent.video.volume = video_curent.video.volume - 0.1;
                }


           
            }

            if (ev.offsetX >= progressBar.x && ev.offsetX < progressBar.xFinal
                && ev.offsetY >= progressBar.y && ev.offsetY < progressBar.YFinal
            ) {

                //la durata totala a videoclipului va corespunde toata latimea barei
                //regula de 3 simpla, daca atunci cand se va termina videoclipul vom fii la finalul progressbar-ului adica la coordonata 800
                //cand vom avea alt offset la ce moment din video vom fi
                let durata = video_curent.video.duration;
                let xCurrent = (durata * ev.offsetX) / 800;
                video_curent.video.currentTime = xCurrent;




            }

        }
        else {
            alert("Nu exista videoclip selectat")
        }

    })
    //tratare evenimentului atunci cand suntem cu cursorul pe progressBar
    canvas.addEventListener("mousemove", (ev) => {

        //suntem pe progressBar
        if (ev.offsetX >= progressBar.x && ev.offsetX <= progressBar.xFinal
            && ev.offsetY >= progressBar.y && ev.offsetY < progressBar.YFinal) {
            //regula de trei simpla

            let durata = video_curent.video.duration;
            //cand sunt cu cursorul pe progressBar,regasesc pozitia la care sunt
            //daca atunci cand videoclipul se termina sunt la sfarsitul progressBar-ului adica la un width de 800
            let xCurrent = (durata * ev.offsetX) / 800;
            //preview-cadru,setam toate atributele ce tin de preview ale obiectului nostruCurent ,pentru a ne putea folosi la desenare previw-ului atunci cand suntem cu cursorul pe progresBar
            video_curent.preview = video_curent.nume
            video_curent.previewX = ev.offsetX
            //in currentTime stocam momentul de timp la care suntem cand ne ducem cu cursorul pe progressBar
            video_curent.currentTime = xCurrent;
            //facem ca aspectul cursorului sa fie de tip pointer,ca la un click
            canvas.style.cursor = "pointer"

        }

        else {
            canvas.style.cursor = "default"
            video_curent.preview = null
        }

    })



}

//functie de redare automata,aceasta trebuie sa fie activata prin buton
function redareAutomata() {
    if (video_curent.video !== null) {
        //verificam ca avem un videoclip curent selectat
        //tratam evenimentul de ajungere la capat a videoclipului
        video_curent.video.addEventListener("ended", () => {
            let indexVideoCurent;
            let videos = document.getElementsByClassName("done");
            //calculam pe ce pozitie se afla acesta in playlist folosindu-ne de proprietate data-nume
            for (let i = 0; i < videos.length; i++) {
                let video = videos[i];
                if (video.dataset.nume === video_curent.nume) {
                    indexVideoCurent = i;//pastram pozitia vidoeclipului selectat
                }
            }
            ///verificam sa nu fie ultimul
            if (indexVideoCurent < videos.length - 1) {
                //obtinem videoclipul curent prin regasirea in playlist dupa pozitia pastrata si adaugam +1,pentru al regasi pe urmatorul
                
                let videoNext = document.getElementsByClassName("done")[indexVideoCurent + 1];
                //urmatorul videoclip devine videoclipul curent
                video_curent.nume = videoNext.dataset.nume;
                video_curent.video = videoNext;
                //il pornim noi automat
                video_curent.video.play();
                //apelam recursiv functia 
                redareAutomata();


            }
            else {
                //daca e ultimul sa o ia de la inceput
                if (indexVideoCurent === videos.length - 1) {
                    //gasim primul element din playlist
                    let videoNext = document.getElementsByClassName("done")[0];
                    video_curent.nume = videoNext.dataset.nume;
                    video_curent.video = videoNext;
                    video_curent.video.play();
                    //apelam recursiv functia
                    redareAutomata();

                }

            }


        })
    }


}





//pentru a permite scrollarea in sus/jos daca luam prin drag un videoclip si ne ducem cu el in sus
let playlist_div = document.getElementsByClassName("playlist-div")[0];
playlist_div.addEventListener("dragover", () => {

})

//ne mai luam un canvasPreview pentru a ne putea ajuta de acesta la functia de previewCadru
let canvasPreview = document.getElementById("canvas-preview");
//il ascundem in pagina
canvasPreview.style.display = "none"

//adaugam functionalitate de redareAutomata atunci cand dam click pe butonul de redare automata prin setarea unui flag a videoclipul curent
document.getElementById("redareAutomata").addEventListener("click", () => {
    if (video_curent.redareAutomata === false) {
        document.getElementById("statusRedareAutomata").innerText = "Redarea automata este activata"
        video_curent.redareAutomata === true
        redareAutomata();
    }


})
//adaugam functionalitatea de previewCadru atunci cand dam click pe butonul de previewCadru prin setarea unui flag a videoclipului curent
document.getElementById("btnPreviewCadru").addEventListener("click", () => {
    if (video_curent.previewActive === false) {
        video_curent.previewActive = true;
        document.getElementById("statusPreviewCadru").innerText = "Functia preview cadru este activata"
    }
    else {
        video_curent.previewActive = false;
        document.getElementById("statusPreviewCadru").innerText = "Functia preview cadru este dezactivata"
    }
})

//adaugare efectului curent in videoclipul nostru curent selectat atunci cand dam click pe unul dintre butoane cu efecte
document.getElementById("btnGradientEffect").addEventListener("click", () => {

    video_curent.currentEffect = "gradient"

})
document.getElementById("btnGlitchEffect").addEventListener("click", () => {
    console.log("GLITCH")
    video_curent.currentEffect = "glitch"

})
document.getElementById("btnFlipVertical").addEventListener("click", () => {
    video_curent.currentEffect = "flipVertical"
})

document.getElementById("btnFlipOrizontal").addEventListener("click", () => {
    video_curent.currentEffect = "flipOrizontal"
})
document.getElementById("btnFalseColor").addEventListener("click", () => {
    video_curent.currentEffect = "falseColor"
})