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
nodetypes.set("path", "blue");
nodetypes.set("clear", "white");
let currStat = "wall";
let search = false;
let clear = false;

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
        currStat = "clear";    
    }
    if(e.keyCode == 53) {
        search = true;        
    }
    if(e.keyCode == 54) {
        clear = true;
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
        this.type = "clear";
        this.g = Infinity; // Costo real desde el nodo inicial
        this.h = 0; // Costo heurístico al nodo de destino
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
    let x = Math.floor(mousex / (canvas.width / cols));
    let y = Math.floor(mousey / (canvas.height / rows));
    if(firstRender && x == 0 && y == 0){
        return;
    }
    if(x < cols && x >= 0 && y >= 0 && y < rows){
        nodes[x][y].changeColor(nodetypes.get(currStat), currStat);               
    }    
}

function findStartEnd(nodes) {
    let startNode, endNode;
    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes[i].length; j++) {
            if (nodes[i][j].type === "start") {
                if (startNode) {
                    startNode.type = "path"; // Solo puede haber un nodo de inicio
                }
                startNode = nodes[i][j];
            } else if (nodes[i][j].type === "end") {
                if (endNode) {
                    endNode.type = "path"; // Solo puede haber un nodo de fin
                }
                endNode = nodes[i][j];
            }
        }
    }
    return { startNode, endNode };
}

function drawPath(path, nodes) {
    console.log('path: ',path);    
    for (let i = 1; i < path.length; i++) {
        let x = path[i].x/10;
        let y = path[i].y/10;
        nodes[x][y].changeColor(nodetypes.get("path"), "path");
    }
}


function findPath(startNode, endNode, nodes) {
    var openSet = [];

    startNode.g = 0;

    openSet.push(startNode);  

    while (openSet.length > 0) {
        
        var currentNode = openSet[0];
        for (var i = 1; i < openSet.length; i++) {
            if (openSet[i].f < currentNode.f) {
                currentNode = openSet[i];
            }
        }
        
        if (currentNode === endNode) {
            var path = [];
            var temp = currentNode;
            while (temp) {
                path.push(temp);
                temp = temp.prev;
            }
            //drawPath(path.reverse());
            return path.reverse();
        }

        openSet = openSet.filter(function(node) {
            return node !== currentNode;
        });

        currentNode.isVisited = true;

        var x = Math.floor(currentNode.x / (canvas.width / cols));
        var y = Math.floor(currentNode.y / (canvas.height / rows));

        var neighbors = [];
        if (x < cols - 1) {
            neighbors.push(nodes[x + 1][y]);
        }
        if (x > 0) {            
            neighbors.push(nodes[x - 1][y]);
        }
        if (y < rows - 1) {
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
    return [];
}

function manhattan(nodeA, nodeB) {
    var dx = Math.abs(nodeB.x - nodeA.x)/10;
    var dy = Math.abs(nodeB.y - nodeA.y)/10;
    return dx + dy;
}


function render(arr){
    if(clear){
        for (let i = 0; i < arr.length; i++) {
            for(let j = 0; j < arr[i].length; j++){
                arr[i][j].changeColor(nodetypes.get("clear"), "clear");
            }
        }
        clear = false;
    }

    drawNodes(arr);    
    if(search){
        let { startNode, endNode } = findStartEnd(arr);
        console.log(startNode, endNode)
        let path = findPath(startNode, endNode, arr);
        //console.log(path);
        drawPath(path,arr);
        search = false; // Detiene la búsqueda después de encontrar el camino
    }
    
    
}

function main() {
    let arr = generateNodes();
    
    setInterval(render, 100, arr);
}

main();
//console.log("lenght: " + x.length);

