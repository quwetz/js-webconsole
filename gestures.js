export {init};


function init(el){     
    el.addEventListener("touchstart", handleStart);
    el.addEventListener("touchend", handleEnd);
    el.addEventListener("touchcancel", handleCancel);
    el.addEventListener("touchmove", handleMove); 
    const gestures = {
        // store functions to call when a gesture happens
        strokeUp: [],
        strokeRight: [],
        strokeDown: [],
        strokeLeft: [],
    };
    const api = {
        subscribe,
        unsubscribe,
    };
    const ongoingTouches = new Map();

    
    return api;

    function subscribe(gesture, func) {
        gestures[gesture].push(func);
    }
    function unsubscribe(gesture, func) {
        var index = gestures[gesture].indexOf(func);
        if (index == -1) {
            throw new Error('Function is not registered');
        }
        gestures[gesture].splice(index, 1);
    }
    function handleStart(evt) {
        evt.preventDefault();
        const touches = evt.changedTouches;
        for(let i = 0; i < touches.length; i++){
            ongoingTouches.set(touches[i].identifier, {x: touches[i].screenX, y: touches[i].screenY,});
        }
    }
    function handleEnd(evt) {
        evt.preventDefault();
        const touches = evt.changedTouches;
        for(let i = 0; i < touches.length; i++){
            const id = touches[i].identifier;
            const totalAngle = Math.atan2(
                touches[i].screenY - ongoingTouches.get(id).y, 
                touches[i].screenX - ongoingTouches.get(id).x
                );
            ongoingTouches.delete[id];
            detectStroke(totalAngle);
        }
    } 
    function handleCancel(evt) {
        evt.preventDefault();
        const touches = evt.changedTouches;
        for(let i = 0; i < touches.length; i++){
            const id = touches[i].identifier;
            ongoingTouches.delete[id];
        }        
    }
    function handleMove(evt) {
        evt.preventDefault();
    }
    
    function detectStroke(angle){
        // Note the inverted y axis on screen coordinates
        if (Math.abs(angle) < Math.PI * 0.2) {
            gestures.strokeRight.forEach(fn => fn());
        } else if (Math.abs(angle) > Math.PI * 0.8) {
            gestures.strokeLeft.forEach(fn => fn());
        } else if (Math.PI * 0.3 < angle && angle < Math.PI * 0.7) {
            gestures.strokeDown.forEach(fn => fn());
        } else if (Math.PI * -0.7 < angle && angle < Math.PI * -0.3) {
            gestures.strokeUp.forEach(fn => fn());
        }
    }
}


