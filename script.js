var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d")
var rows = canvas.height/10;
var cols = canvas.width/10;
document.addEventListener("click", clickHandler, false);
document.addEventListener("keydown", keyDownHandler, false);
//document.addEventListener("keyup", keyUpHandler, false);

let mousex = 0;
let mousey = 0;
let firstRender = true;
const nodetypes = new Map();
nodetypes.set("start", "green");
nodetypes.set("end", "red");
nodetypes.set("wall", "black");
nodetypes.set("path", "white");
let currStat = "wall";
let search = false;


function clickHandler(e) {
    mousex = e.clientX - canvas.offsetLeft;
    mousey = e.clientY - canvas.offsetTop;
    firstRender = false;
    //console.log("x: " + mousex + " y: " + mousey);
}
function keyDownHandler(e) {
    if(e.keyCode == 49) {
        currStat = "start";
    }
    if(e.keyCode == 50) {
        currStat = "end";
    }
    if(e.keyCode == 51) {
        currStat = "wall";
    }
    if(e.keyCode == 52) {
        currStat = "path";    
    }
    if(e.keyCode == 53) {
        search = true;        
    }
    if(e.keyCode == 54) {
        search = false;
    }
}

class node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = canvas.width/(cols);
        this.height = canvas.height/(rows);
        this.isVisited = false;
        this.prev = undefined;
        this.next = undefined;
        this.color = "white";
        this.type = "path";
        this.g = Infinity; // Costo real desde el nodo inicial
        this.h = Infinity; // Costo heurístico al nodo de destino
        this.f = Infinity;
    }
    changeColor(color, type) {
        this.color = color;
        this.type = type;
    }
}

function generateNodes(){
    let nodes = [];
    for (let i = 0; i < cols; i++) {
        let row = [];
        for (let j = 0; j < rows; j++) {
            row.push(new node(i*10, j*10));            
        }
        nodes.push(row)
    }
    return nodes;
}

function drawNodes(nodes) {
    paintNode(nodes);
    for (let i = 0; i < nodes.length; i++) {
        for(let j = 0; j < nodes[i].length; j++){
            ctx.beginPath();
            ctx.rect(nodes[i][j].x, nodes[i][j].y, nodes[i][j].width, nodes[i][j].height);
            //console.log(nodes[i][j].color);
            ctx.fillStyle = nodes[i][j].color;
            ctx.fill();
            ctx.closePath();
        }        
    }    
}

function paintNode(nodes){    
    let x = Math.floor(mousex/10);
    let y = Math.floor(mousey/10);
    //console.log(x, ' ', y)
    if(firstRender && x == 0 && y == 0){
        //firstRender = false;
        return;
    }
    if(x < cols && x>=0 && y>=0 && y < rows){
        //console.log(currStat);
        nodes[x][y].changeColor(nodetypes.get(currStat), currStat);               
    }    
}

function findPath(nodes) {
    let startNode, endNode;
    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes[i].length; j++) {
            if (nodes[i][j].type === "start") {
                startNode = nodes[i][j];
            } else if (nodes[i][j].type === "end") {
                endNode = nodes[i][j];
            }
        }
    }
    let path = aStar(startNode, endNode, nodes);
    // Devuelve el camino encontrado
    return path;
}

function manhattan(nodeA, nodeB) {
    var dx = Math.abs(nodeB.x - nodeA.x)/10;
    var dy = Math.abs(nodeB.y - nodeA.y)/10;
    return dx + dy;
}


// Función A*
function aStar(startNode, endNode, nodes){
    var openSet = [];
    openSet.push(startNode);

    while (openSet.length > 0) {
        // Encuentra el nodo en el conjunto abierto con el costo más bajo
        var currentNode = openSet[0];
        for (var i = 1; i < openSet.length; i++) {
            if (openSet[i].f < currentNode.f) {
                currentNode = openSet[i];
            }
        }

        // Si el nodo actual es el nodo de destino, hemos terminado
        if (currentNode === endNode) {
            var path = [];
            var temp = currentNode;
            while (temp) {
                path.push(temp);
                temp = temp.prev;
            }
            return path.reverse();
        }

        // Elimina el nodo actual del conjunto abierto y agrégalo al conjunto cerrado
        openSet = openSet.filter(function(node) {
            return node !== currentNode;
        });

        // Marca el nodo actual como visitado
        currentNode.isVisited = true;

        // Explora los nodos vecinos del nodo actual
        var neighbors = [];
        var x = currentNode.x/10;
        var y = currentNode.y/10;
        if (x < nodes.length - 1) {
            neighbors.push(nodes[x + 1][y]);
        }
        if (x > 0) {            
            neighbors.push(nodes[x - 1][y]);
        }
        if (y < nodes[0].length - 1) {
            neighbors.push(nodes[x][y + 1]);
        }
        if (y > 0) {
            neighbors.push(nodes[x][y - 1]);
        }

        neighbors.forEach(function(neighbor) {
            if (!neighbor.isVisited && neighbor.type !== "wall") {
                var tempG = currentNode.g + 1; // Costo real desde el nodo inicial hasta este vecino
                if (tempG < neighbor.g) {
                    neighbor.prev = currentNode;
                    neighbor.g = tempG;
                    neighbor.h = manhattan(neighbor, endNode);
                    neighbor.f = neighbor.g + neighbor.h;
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        });
    }
    // Si no se encuentra un camino, devuelve un arreglo vacío
    return [];
}

function render(arr){
    drawNodes(arr);
    if(search){
        let path = findPath(arr);
        console.log(path)
    }
    
}

function main() {
    let arr = generateNodes();
    
    setInterval(render, 100, arr);
}

main();
//console.log("lenght: " + x.length);

