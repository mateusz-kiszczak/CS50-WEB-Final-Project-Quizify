//The Fisher Yates Method
const shuffleArray = (arr) => {
    const shuffled = [...arr];

    for (let i = shuffled.length -1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i+1));
        let k = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = k;
    }

    return shuffled;
};



export default shuffleArray;