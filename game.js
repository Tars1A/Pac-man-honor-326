const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
const gamepads = navigator.getGamepads();
const score = document.getElementById("score");
let count = 0;
window.addEventListener("gamepadconnected",event =>{
    console.log("gamepad is connected:");
    console.log(event.gamepad);
});

window.addEventListener("gamepaddisconnected",event =>{
    console.log("gamepad is disconnected:");
    console.log(event.gamepad);
});
class Boundary{
    static height = 40;
    static width  = 40;
    constructor(position){
        this.position  = position;
        this.width = 40;
        this.height = 40;
    }
    draw(){
        c.fillStyle = "blue";
        c.fillRect(this.position.x,this.position.y,this.width,this.height);
    }
}
class Player{
    constructor({position,velocity}){
        this.position = position;
        this.velocity = velocity;
        this.radius  = 15;
    }
    draw(){
        c.beginPath();
        c.arc(this.position.x,this.position.y,this.radius,0, Math.PI *2);
        c.fillStyle = 'yellow';
        c.fill();
        c.closePath();
    }
    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}
class Ghost{
    static speed = 2;
    constructor({position,velocity,color= "red"}){
        this.position = position;
        this.velocity = velocity;
        this.radius  = 15;
        this.color = color;
        this.prev_collisions = [];
        this.speed =2;
    }
    draw(){
        c.beginPath();
        c.arc(this.position.x,this.position.y,this.radius,0, Math.PI *2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }
    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}
class Pellet{
    constructor(position){
        this.position = position;
        this.radius  = 5;
    }
    draw(){
        c.beginPath();
        c.arc(this.position.x,this.position.y,this.radius,0, Math.PI *2);
        c.fillStyle = 'white';
        c.fill();
        c.closePath();
    }
}
let last_key = ' ';
let last_button = ' ';
function colliderec({circle,rectangle}){
    const padding = Boundary.width/2 - circle.radius - 1;
    return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding
        && circle.position.x +  circle.radius + circle.velocity.x >= rectangle.position.x - padding
        && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding && circle.position.x - circle.radius + circle.velocity.x 
        <= rectangle.position.x + rectangle .width + padding );
}
let animation_id;
function update(){
    const gamepads = navigator.getGamepads();
    if(gamepads[0]){
        console.log(gamepads[0]);
        const gamepadState = {
                        'up':gamepads[0].buttons[12].pressed,
                        'down':gamepads[0].buttons[13].pressed,
                        'left':gamepads[0].buttons[14].pressed,
                        'right':gamepads[0].buttons[15].pressed,
        };
       return gamepadState;
    }
    const gamepadState = {
        'up':false,
        'down':false,
        'left':false,
        'right':false,
};
    return gamepadState;
}
function animate() {
    state = update();
    console.log(state);
    animation_id = requestAnimationFrame(animate);
    window.requestAnimationFrame(update);
    c.clearRect(0,0,canvas.width,canvas.height);
    // if(keys.ArrowUp.pressed && last_key === 'up' || (state['up'] === true))
    if((state['up'] === true)){
        for(let i = 0;i < boundaries.length;i++){
            const bound = boundaries[i];
          if(colliderec({
                circle:{...pacman,velocity:{x:0,y:-5}},rectangle:bound
            })){
        pacman.velocity.y = 0;
        break;
        }else{
            pacman.velocity.y = -5;
        }};
    }
    else if((state['left'] === true)){
        // console.log("here");
        for(let i = 0;i < boundaries.length;i++){
            const bound = boundaries[i];
          if(colliderec({
                circle:{...pacman,velocity:{x:-5,y:0}},rectangle:bound
            })){
        pacman.velocity.x = 0;
        break;
        }else{
            pacman.velocity.x = -5;
        }};
    }
    // else if(keys.ArrowDown.pressed && last_key === 'down'){
    else if(state['down'] === true){
        for(let i = 0;i < boundaries.length;i++){
            const bound = boundaries[i];
          if(colliderec({
                circle:{...pacman,velocity:{x:0,y:5}},rectangle:bound
            })){
        pacman.velocity.y = 0;
        break;
        }else{
            pacman.velocity.y = 5;
        }};
    }
    // else if(keys.ArrowRight.pressed && last_key === 'right'){
        else if(state['right'] === true){
        for(let i = 0;i < boundaries.length;i++){
            const bound = boundaries[i];
          if(colliderec({
                circle:{...pacman,velocity:{x:5,y:0}},rectangle:bound
            })){
        pacman.velocity.x = 0;
        break;
        }else{
            pacman.velocity.x = 5;
        }};
    }
    pellets.forEach((circ,i)=>{
        circ.draw();
        if (Math.hypot(circ.position.x - pacman.position.x,circ.position.y - pacman.position.y) < circ.radius + pacman.radius){
            count +=1;
            score.innerHTML = count;
            pellets.splice(i,1);
        }
    });
    boundaries.forEach((bound) => {
        bound.draw();
        if(colliderec({circle:pacman,rectangle:bound})){
                console.log("we are colliding");
                pacman.velocity.x = 0;
                pacman.velocity.y = 0;
            }
    }); 
    pacman.update();
    ghosts.forEach((ghost) =>{
        ghost.update();
        if (Math.hypot(ghost.position.x - pacman.position.x,ghost.position.y - pacman.position.y) < ghost.radius + pacman.radius){
            cancelAnimationFrame(animation_id);
        }
        const collisions = [];
        boundaries.forEach((bound) => {
            if(!collisions.includes('right') && colliderec({
                circle:{...ghost,velocity:{x:5,y:0}},rectangle:bound
            })){
                collisions.push('right');
            }
            if(!collisions.includes('left') && colliderec({
                circle:{...ghost,velocity:{x:-5,y:0}},rectangle:bound
            })){
                collisions.push('left');
            }
            if(!collisions.includes('up') && colliderec({
                circle:{...ghost,velocity:{x:0,y:-5}},rectangle:bound
            })){
                collisions.push('up');
            }
            if(!collisions.includes('down') && colliderec({
                circle:{...ghost,velocity:{x:0,y:5}},rectangle:bound
            })){
                collisions.push('down');
            }
        });
        // console.log(collisions);
        if(collisions.length > ghost.prev_collisions.length){
        ghost.prev_collisions = collisions;
        }
        
        if(JSON.stringify(collisions) !== JSON.stringify(ghost.prev_collisions)){
            console.log("hello");
            if(ghost.velocity.x > 0) ghost.prev_collisions.push('right');
            else if(ghost.velocity.x < 0) ghost.prev_collisions.push('left');
            else if(ghost.velocity.y > 0) ghost.prev_collisions.push('down');
            else if(ghost.velocity.y < 0) ghost.prev_collisions.push('up');
        const pathways = ghost.prev_collisions.filter(collide =>{return !collisions.includes(collide)});
        console.log(pathways); 
        const direction = pathways[Math.floor(Math.random()*pathways.length)];
        switch(direction){
            case 'down':
                ghost.velocity.y = ghost.speed;
                ghost.velocity.x = 0;
                break;
            case 'up':
                ghost.velocity.y = -ghost.speed;
                ghost.velocity.x = 0;
                break;
            case 'left':
                ghost.velocity.y = 0;
                ghost.velocity.x = -ghost.speed;
                break;
            case 'right':
                ghost.velocity.y = 0;
                ghost.velocity.x = ghost.speed;
                break;
        }
            ghost.prev_collisions = [];
        }
    });
    
       
    // pacman.velocity.y = 0;
    // pacman.velocity.x = 0;
    console.log(last_key);
}

const map = 
[
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 4, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 4, 0],
	[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
	[0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
	[2, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 2, 2, 2],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 3, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[0, 2, 2, 2, 1, 1, 1, 0, 3, 3, 3, 0, 1, 1, 1, 2, 2, 2, 0],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[2, 2, 2, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 2, 2, 2],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
	[0, 4, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 4, 0],
	[0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
	[0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
for (let i = 1 ;i < map.length - 1; i++){
    for(let j = 1 ;j < map[0].length - 1;j++ ){
        if (map[i][j] != 0){
            map[i][j] =9;
        }
    }
}

const boundaries = [];
const pellets = [];
const ghosts = [new Ghost({position: {x:Boundary.width*6 + Boundary.width/2 ,y:Boundary.height + Boundary.height/2},
velocity:{x:Ghost.speed,y:0}
,color:"red"}),new Ghost({position: {x:Boundary.width*8 + Boundary.width/2 ,y:Boundary.height*4 + Boundary.height/2},
velocity:{x:Ghost.speed,y:0}
,color:"pink"})];
map.forEach((row,i) => {
    row.forEach((symbol,j) => {
        if(symbol === 0){
            boundaries.push(new Boundary({x:Boundary.width*j,y:Boundary.height*i}));
        }
        if (symbol === 9){
            pellets.push(new Pellet({x:j * Boundary.width + Boundary.width/2 ,y: i * Boundary.height + Boundary.height/2}))
        }
    })
});
console.log(boundaries);
const pacman = new Player({
    position : {x:Boundary.width + Boundary.width/2 ,y:Boundary.height + Boundary.height/2},
    velocity : {x:0,y:0}
});
const keys = {
    ArrowUp: {pressed : false},
    ArrowDown: {pressed : false},
    ArrowLeft: {pressed :false},
    ArrowRight: {pressed : false}

};
animate();
addEventListener('keydown',({key}) =>{
    switch(key){
        case 'ArrowUp': keys.ArrowUp.pressed = true;
        last_key = 'up';
        break;
        case 'ArrowDown':keys.ArrowDown.pressed = true;
        last_key = 'down';
        break;
        case 'ArrowLeft':keys.ArrowLeft.pressed = true;
        last_key = 'left';
        break;
        case 'ArrowRight':keys.ArrowRight.pressed = true;
        last_key = 'right';
        break;
    }
    console.log(pacman.velocity);
});

addEventListener('keyup',({key}) =>{
    switch(key){
        case 'ArrowUp': keys.ArrowUp.pressed = false;
        break;
        case 'ArrowDown':keys.ArrowDown.pressed = false;
        break;
        case 'ArrowLeft':keys.ArrowLeft.pressed = false;
        break;
        case 'ArrowRight':keys.ArrowRight.pressed = false ;
        break;
    }
    console.log(pacman.velocity);
});
