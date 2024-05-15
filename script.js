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
let start = 0;
let end = 0;

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
    // Encuentra el nodo de inicio y el nodo de destino
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
    // Llama a la función A* para encontrar el camino
    let path = aStar(startNode, endNode, nodes);
    // Devuelve el camino encontrado
    return path;
}

function manhattan(nodeA, nodeB) {
    var dx = Math.abs(nodeB.x - nodeA.x)/10;
    var dy = Math.abs(nodeB.y - nodeA.y)/10;
    return dx + dy;
}

function heuristic(nodeA, nodeB) {
    var dx = nodeB.x/nodeB.width - nodeA.x/nodeA.width;
    var dy = nodeB.y/nodeB.height - nodeA.y/nodeA.height;
    return Math.sqrt(dx * dx + dy * dy);
}

// Función A*
function aStar(startNode, endNode){
    return manhattan(startNode, endNode);
}

function render(arr){
    drawNodes(arr);
    let path = findPath(arr);
    console.log(path)
}

function main() {
    let arr = generateNodes();
    
    setInterval(render, 100, arr);
}

main();
//console.log("lenght: " + x.length);

