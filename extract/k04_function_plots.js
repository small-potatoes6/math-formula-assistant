/*
 * Clean vector plots for K04.
 *
 * The source table uses scanned figure crops. These specifications replace
 * those crops at render time without changing any formula or explanation.
 */

const e = Math.exp(1)
const pi = Math.PI

const PLOTTERS = {
  'x+lnx': x => (x > 0 ? x + Math.log(x) : NaN),
  'e^x+x': x => Math.exp(x) + x,
  'lnx-x': x => (x > 0 ? Math.log(x) - x : NaN),
  'e^x-x': x => Math.exp(x) - x,
  'xlnx': x => (x > 0 ? x * Math.log(x) : NaN),
  'xe^x': x => x * Math.exp(x),
  'lnx/x': x => (x > 0 ? Math.log(x) / x : NaN),
  'e^x/x': x => (x === 0 ? NaN : Math.exp(x) / x),
  'x/lnx': x => (x > 0 && x !== 1 ? x / Math.log(x) : NaN),
  'x/e^x': x => x / Math.exp(x),
  'sinx+x': x => Math.sin(x) + x,
  'cosx+x': x => Math.cos(x) + x,
  'x-sinx': x => x - Math.sin(x),
  'x-cosx': x => x - Math.cos(x),
  'xsinx': x => x * Math.sin(x),
  'xcosx': x => x * Math.cos(x),
  'sinx/x': x => (x === 0 ? NaN : Math.sin(x) / x),
  'cosx/x': x => (x === 0 ? NaN : Math.cos(x) / x),
  'x/sinx': x => (x === 0 || Math.sin(x) === 0 ? NaN : x / Math.sin(x)),
  'x/cosx': x => (Math.abs(Math.cos(x)) < 1e-10 ? NaN : x / Math.cos(x))
}

const K04_PLOTS = {
  'k04-p07-r1-left': {
    plotter: 'x+lnx',
    xMin: -0.55,
    xMax: 4,
    yMin: -4,
    yMax: 4
  },
  'k04-p07-r1-right': {
    plotter: 'e^x+x',
    xMin: -2.2,
    xMax: 1.05,
    yMin: -3,
    yMax: 5
  },
  'k04-p07-r2-left': {
    plotter: 'lnx-x',
    xMin: -0.55,
    xMax: 5,
    yMin: -3.5,
    yMax: 1.2,
    points: [{ x: 1, y: -1 }]
  },
  'k04-p07-r2-right': {
    plotter: 'e^x-x',
    xMin: -2.2,
    xMax: 2.2,
    yMin: -0.8,
    yMax: 5.2,
    points: [{ x: 0, y: 1 }]
  },
  'k04-p07-r3-left': {
    plotter: 'xlnx',
    xMin: -0.55,
    xMax: 2.6,
    yMin: -1.1,
    yMax: 2.5,
    points: [{ x: 1 / e, y: -1 / e }]
  },
  'k04-p07-r3-right': {
    plotter: 'xe^x',
    xMin: -4.5,
    xMax: 1.15,
    yMin: -1,
    yMax: 3.1,
    points: [{ x: -1, y: -1 / e }]
  },
  'k04-p07-r4-left': {
    plotter: 'lnx/x',
    xMin: -0.55,
    xMax: 6,
    yMin: -3.5,
    yMax: 1.4,
    points: [{ x: e, y: 1 / e }]
  },
  'k04-p07-r4-right': {
    plotter: 'e^x/x',
    xMin: -2.2,
    xMax: 2.7,
    yMin: -3,
    yMax: 8,
    asymptotesX: [0],
    points: [{ x: 1, y: e }]
  },
  'k04-p07-r5-left': {
    plotter: 'x/lnx',
    xMin: -0.55,
    xMax: 6,
    yMin: -6,
    yMax: 8,
    asymptotesX: [1],
    points: [{ x: e, y: e }]
  },
  'k04-p07-r5-right': {
    plotter: 'x/e^x',
    xMin: -2.5,
    xMax: 6,
    yMin: -2,
    yMax: 2,
    points: [{ x: 1, y: 1 / e }]
  },
  'k04-p07-r6-left': {
    plotter: 'sinx+x',
    xMin: -2 * pi,
    xMax: 2 * pi,
    yMin: -7.5,
    yMax: 7.5
  },
  'k04-p07-r6-right': {
    plotter: 'cosx+x',
    xMin: -2 * pi,
    xMax: 2 * pi,
    yMin: -7.5,
    yMax: 7.5
  },
  'k04-p08-r1-left': {
    plotter: 'x-sinx',
    xMin: -2 * pi,
    xMax: 2 * pi,
    yMin: -7.5,
    yMax: 7.5
  },
  'k04-p08-r1-right': {
    plotter: 'x-cosx',
    xMin: -2 * pi,
    xMax: 2 * pi,
    yMin: -7.5,
    yMax: 7.5
  },
  'k04-p08-r2-left': {
    plotter: 'xsinx',
    xMin: -3 * pi,
    xMax: 3 * pi,
    yMin: -9.5,
    yMax: 9.5
  },
  'k04-p08-r2-right': {
    plotter: 'xcosx',
    xMin: -3 * pi,
    xMax: 3 * pi,
    yMin: -9.5,
    yMax: 9.5
  },
  'k04-p08-r3-left': {
    plotter: 'sinx/x',
    xMin: -3 * pi,
    xMax: 3 * pi,
    yMin: -0.55,
    yMax: 1.2,
    points: [{ x: 0, y: 1, hollow: true }]
  },
  'k04-p08-r3-right': {
    plotter: 'cosx/x',
    xMin: -3 * pi,
    xMax: 3 * pi,
    yMin: -2.2,
    yMax: 2.2,
    asymptotesX: [0]
  },
  'k04-p08-r4-left': {
    plotter: 'x/sinx',
    xMin: -3 * pi,
    xMax: 3 * pi,
    yMin: -9.5,
    yMax: 9.5,
    asymptotesX: [-2 * pi, -pi, pi, 2 * pi],
    points: [{ x: 0, y: 1, hollow: true }]
  },
  'k04-p08-r4-right': {
    plotter: 'x/cosx',
    xMin: -3 * pi,
    xMax: 3 * pi,
    yMin: -9.5,
    yMax: 9.5,
    asymptotesX: [
      -2.5 * pi,
      -1.5 * pi,
      -0.5 * pi,
      0.5 * pi,
      1.5 * pi,
      2.5 * pi
    ]
  }
}

function evaluatePlot(plot, x) {
  const plotter = PLOTTERS[plot.plotter]
  return plotter ? plotter(x) : NaN
}

module.exports = {
  K04_PLOTS,
  evaluatePlot
}
