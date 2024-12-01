function randomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return { r, g, b };
}

function toRad(deg) {
    return deg * (Math.PI / 180.0);
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function selectedSpinRange(){
    let res;
    //[1(10%),2(10%),3(30%),4(50%)]
    //let itemProbRanges = items.map(item => item.probalility)
    let pindex = randomRange(0,100);
    let t = 0;
    for(let i = 0; i< items.length; i++){
        t += itemProbs[items[i]];
        if(pindex <= t){
            res = items[i];
            break;
        }
    }
    return res;
    
}
function easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
}

function getPercent(input, min, max) {
    return (((input - min) * 100) / (max - min)) / 100;
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const centerX = width / 2;
const centerY = height / 2;
const radius = width / 2;

let items = [];
let targetedRange =0;
let currentDeg = 0;
let step = 0;
let colors = [];
let itemDegs = {};
let itemProbs = [];
let speed = 0;
let maxRotation = 1080;
let pause = false;
let lastWinner = null;

document.addEventListener("DOMContentLoaded", async () => {
    await fetchPrizes();  // Tải danh sách phần thưởng từ cơ sở dữ liệu
    createWheel();
    let occurence = {};
    let count =0;

});


const drawWheel = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgb(33,33,33)`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    let startDeg = currentDeg ;
    items.forEach((item, i) => {
        const endDeg = startDeg + step;
        const color = colors[i];
        ctx.fillStyle = `rgb(${color.r - 30},${color.g - 30},${color.b - 30})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 2, toRad(startDeg), toRad(endDeg));
        ctx.lineTo(centerX, centerY);
        ctx.fill();

        ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 30, toRad(startDeg), toRad(endDeg));
        ctx.lineTo(centerX, centerY);
        ctx.fill();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(toRad((startDeg + endDeg) / 2));
        ctx.textAlign = "center";

        let fontSize = 24;
        if (items[i].length > 15) fontSize = 16;
        else if (items[i].length > 10) fontSize = 20;

        ctx.font = `bold ${fontSize}px serif`;
        ctx.fillStyle = color.r > 150 || color.g > 150 || color.b > 150 ? "#000" : "#fff";
        
        let displayText = items[i].length > 20 ? items[i].slice(0, 17) + "..." : items[i];
        ctx.fillText(displayText, 130, 10);
        ctx.restore();

        //itemDegs[item] = { startDeg, endDeg };
        startDeg += step;
    });
};

const createWheel = () => {
    step = 360 / items.length;
    colors = items.map(() => randomColor());
    itemDegs = {};
    currentDeg = maxRotation;
    let startDeg;
    let endDeg;
    items.forEach(item => {
        startDeg = currentDeg - step;
        endDeg = currentDeg;
        itemDegs[item] = {startDeg,endDeg}
        currentDeg = startDeg;
    });
    currentDeg = 0;
    drawWheel();
};

const resetWheel = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    createWheel();
};

const checkWinner = () => {
    const winningDeg = (currentDeg % 360 + 360) % 360;
    const triangleDeg = currentDeg;

    items.some(item => {
        const { startDeg, endDeg } = itemDegs[item];
        const start = startDeg;
        const end = endDeg;
        const isWinner = triangleDeg >= start && triangleDeg < end || (start > end && (triangleDeg >= start || triangleDeg < end));
        if (isWinner) {
            // document.getElementById("winnerMessage").innerText = `Bạn đã trúng "${item}"!`;
            // document.getElementById("winnerModal").style.display = 'flex';
            // lastWinner = item;
            console.log("done spin "+ currentDeg);
            console.log("win: " + item);
            return true;
        }
        return false;
    });
};

const animate = () => {
    if (pause) return;
    speed = easeOutSine(getPercent(currentDeg, targetedRange, 0)) *15;
    if (speed < 0.1) {
        speed = 0;
        pause = true;
        checkWinner();
        return;
    }
    
    currentDeg += speed ;
    
    drawWheel();
    requestAnimationFrame(animate);
};

const spin = () => {
    if (speed !== 0) return;
    currentDeg = 0;
    createWheel();
    let selectedItem = selectedSpinRange();
    console.log("selected: " + selectedItem)
    targetedRange = randomRange(itemDegs[selectedItem].startDeg,itemDegs[selectedItem].endDeg);
    pause = false;
    console.log("begin spin "+ currentDeg);
    requestAnimationFrame(animate);
};

const closeModal = () => {
    document.getElementById("winnerModal").style.display = 'none';
};

async function fetchPrizes() {
    try {
        
        const gifts = [{name: "q1", probability: 40},{name: "q0 yahallo", probability: 40},{name: "q2",probability: 10},{name: "a suck q3",probability: 10}];
        gifts.forEach(item => {
            items.push(item.name)
            itemProbs[item.name] = item.probability;

        })
        createWheel(); 
    } catch (error) {
        console.error('Error fetching gifts:', error);
    }
}

