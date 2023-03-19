
function resizeGame(game) {

    var canvas = document.querySelector('canvas');
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;

    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + 'px';
        canvas.style.height = (windowWidth / gameRatio) + 'px';
    } else {
        canvas.style.width = (windowHeight * gameRatio) + 'px';
        canvas.style.height = windowHeight + 'px';
    }

}



function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}


const database = {
    setScore: (value) => {
        localStorage.setItem('game_score', value);
    },
    getScore: () => {
        if( localStorage.hasOwnProperty('game_score'))
            return parseInt( localStorage.getItem('game_score'));
        return 0;
    }
}

