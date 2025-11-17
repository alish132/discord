function setTimeoutPromisified(delay: number){
    return new Promise((res) => {
        setTimeout(res, delay);
    })
}

setTimeoutPromisified(5000).then(() => console.log("5s have passed"))