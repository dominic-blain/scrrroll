/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
export default {
    // no easing, no acceleration
    linear: t => t,
    // accelerating from zero velocity
    InQuad: t => t*t,
    // decelerating to zero velocity
    OutQuad: t => t*(2-t),
    // acceleration until halfway, then deceleration
    InOutQuad: t => t<.5 ? 2*t*t : -1+(4-2*t)*t,
    // accelerating from zero velocity 
    InCubic: t => t*t*t,
    // decelerating to zero velocity 
    OutCubic: t => (--t)*t*t+1,
    // acceleration until halfway, then deceleration 
    InOutCubic: t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1,
    // accelerating from zero velocity 
    InQuart: t => t*t*t*t,
    // decelerating to zero velocity 
    OutQuart: t => 1-(--t)*t*t*t,
    // acceleration until halfway, then deceleration
    InOutQuart: t => t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t,
    // accelerating from zero velocity
    InQuint: t => t*t*t*t*t,
    // decelerating to zero velocity
    OutQuint: t => 1+(--t)*t*t*t*t,
    // acceleration until halfway, then deceleration 
    InOutQuint: t => t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t
  }