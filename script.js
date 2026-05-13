
let rows = 15;
let cols = 15;
let mines = 25;

let board = [];
let gameOver = false;

let timer = 0;
let timerInterval;

const boardEl = document.getElementById('board');
const mineCountEl = document.getElementById('mineCount');
const timerEl = document.getElementById('timer');


function changeDifficulty(){

const diff = document.getElementById('difficulty').value;

if(diff === 'easy'){
rows = 15;
cols = 15;
mines = 25;
}

if(diff === 'medium'){
rows = 20;
cols = 20;
mines = 65;
}

if(diff === 'hard'){
rows = 25;
cols = 25;
mines = 100;
}

boardEl.style.gridTemplateColumns =
`repeat(${cols}, var(--cell-size))`;

renderBestScore();
startGame();
}

function startTimer(){

clearInterval(timerInterval);

timer = 0;
timerEl.textContent = timer;

timerInterval = setInterval(()=>{

timer++;
timerEl.textContent = timer;

},1000);

}


function startGame(){

explosionTimeouts.forEach(t=>clearTimeout(t));
explosionTimeouts = [];

board = [];
gameOver = false;

boardEl.innerHTML = '';

mineCountEl.textContent = mines;

startTimer();

for(let r=0;r<rows;r++){

board[r] = [];

for(let c=0;c<cols;c++){

board[r][c] = {
mine:false,
open:false,
flag:false,
number:0,
exploded:false
};

}

}

placeMines();
calculateNumbers();

updateCellSize();

boardEl.style.gridTemplateColumns =
`repeat(${cols}, var(--cell-size))`;

renderBoard();

}

function placeMines(){

let placed = 0;

while(placed < mines){

let r = Math.floor(Math.random()*rows);
let c = Math.floor(Math.random()*cols);

if(!board[r][c].mine){

board[r][c].mine = true;
placed++;

}

}

}

function calculateNumbers(){

for(let r=0;r<rows;r++){
for(let c=0;c<cols;c++){

if(board[r][c].mine) continue;

let count = 0;

for(let dr=-1;dr<=1;dr++){
for(let dc=-1;dc<=1;dc++){

let nr = r + dr;
let nc = c + dc;

if(nr>=0 && nr<rows && nc>=0 && nc<cols){

if(board[nr][nc].mine){
count++;
}

}

}
}

board[r][c].number = count;

}
}

}

function renderBoard(){

boardEl.innerHTML = '';

for(let r=0;r<rows;r++){
for(let c=0;c<cols;c++){

const cell = document.createElement('div');

cell.className = 'cell';

const data = board[r][c];

if(data.open){

cell.classList.add('open');

if(data.mine){

cell.classList.add('mine');

if(data.exploded){
cell.classList.add('explode');
}

cell.textContent = '💣';

}else if(data.number > 0){

cell.textContent = data.number;

}

}

if(data.flag && !data.open){

cell.textContent = '🚩';

}

cell.addEventListener('click',()=>openCell(r,c));

cell.addEventListener('dblclick',()=>autoOpenAround(r,c));

cell.addEventListener('contextmenu',(e)=>{

e.preventDefault();
toggleFlag(r,c);

});

boardEl.appendChild(cell);

}
}

}

function openCell(r,c){

if(gameOver) return;

const data = board[r][c];

if(data.open || data.flag) return;

data.open = true;

if(data.mine){

data.exploded = true;

revealMines();

gameOver = true;

clearInterval(timerInterval);

renderBoard();

const totalBombs = mines;
const totalDelay = totalBombs * 25;

setTimeout(()=>{

}, totalDelay + 300);
return;

}

if(data.number === 0){

for(let dr=-1;dr<=1;dr++){
for(let dc=-1;dc<=1;dc++){

let nr = r + dr;
let nc = c + dc;

if(nr>=0 && nr<rows && nc>=0 && nc<cols){

if(
!board[nr][nc].open &&
!board[nr][nc].flag
){

openCell(nr,nc);

}
}

}
}

}

checkWin();
renderBoard();

}

function autoOpenAround(r,c){

const data = board[r][c];

if(!data.open || data.number === 0) return;

let flagCount = 0;

for(let dr=-1;dr<=1;dr++){
for(let dc=-1;dc<=1;dc++){

let nr = r + dr;
let nc = c + dc;

if(nr>=0 && nr<rows && nc>=0 && nc<cols){

if(board[nr][nc].flag){
flagCount++;
}

}

}
}

if(flagCount === data.number){

for(let dr=-1;dr<=1;dr++){
for(let dc=-1;dc<=1;dc++){

let nr = r + dr;
let nc = c + dc;

if(nr>=0 && nr<rows && nc>=0 && nc<cols){

if(!board[nr][nc].open && !board[nr][nc].flag){

openCell(nr,nc);

}

}

}
}

}

}

function toggleFlag(r,c){

if(gameOver) return;

const data = board[r][c];

if(data.open) return;

data.flag = !data.flag;

let flags = 0;

for(let r=0;r<rows;r++){
for(let c=0;c<cols;c++){

if(board[r][c].flag){
flags++;
}

}
}

mineCountEl.textContent = mines - flags;

renderBoard();

}

let explosionTimeouts = [];

function revealMines(){

explosionTimeouts = [];

let delay = 0;

for(let r=0;r<rows;r++){
for(let c=0;c<cols;c++){

if(board[r][c].mine){

const timeout = setTimeout(()=>{

if(gameOver){

board[r][c].open = true;

if(!board[r][c].exploded){
board[r][c].exploded = true;
}

renderBoard();

}

},delay);

explosionTimeouts.push(timeout);

delay += 25;

}

}
}

}

function launchFireworks(){

const rect = boardEl.getBoundingClientRect();

function burst(delay, offsetX){

setTimeout(()=>{

for(let i=0;i<80;i++){

const particle = document.createElement('div');

particle.className = 'firework';

particle.style.left =
(rect.left + rect.width/2 + offsetX) + 'px';

particle.style.top =
(rect.top + rect.height/2) + 'px';

particle.style.background =
`hsl(${Math.random()*360},100%,50%)`;

particle.style.setProperty(
'--x',
`${(Math.random()-0.5)*500}px`
);

particle.style.setProperty(
'--y',
`${(Math.random()-0.5)*500}px`
);

document.body.appendChild(particle);

setTimeout(()=>{
particle.remove();
},3000);

}

},delay);

}

burst(0,-120);     
burst(400,120);    
burst(800,0);      

}

function checkWin(){

let safeCells = rows * cols - mines;
let opened = 0;

for(let r=0;r<rows;r++){
for(let c=0;c<cols;c++){

if(board[r][c].open && !board[r][c].mine){
opened++;
}

}
}

if(opened === safeCells){

gameOver = true;

clearInterval(timerInterval);

const diff = document.getElementById('difficulty').value;

const key = `minesweeper_best_${diff}`;

const best = Number(localStorage.getItem(key));

if(!best || timer < best){
localStorage.setItem(key,timer);
}

renderBestScore();

launchFireworks();

}

}

function renderBestScore(){

const diff = document.getElementById('difficulty').value;

const key = `minesweeper_best_${diff}`;

const best = localStorage.getItem(key);

document.getElementById('bestTime').textContent =
best ? best + 's' : '-';

}

function updateCellSize(){

const screenWidth = window.innerWidth;

const containerPadding = 60;

const availableWidth = screenWidth - containerPadding;

let size = Math.floor(availableWidth / cols);

size = Math.max(16, size);

size = Math.min(32, size);

document.documentElement
.style
.setProperty('--cell-size', size + 'px');

}

window.addEventListener('resize',()=>{

updateCellSize();

boardEl.style.gridTemplateColumns =
`repeat(${cols}, var(--cell-size))`;

});

renderBestScore();
startGame();

