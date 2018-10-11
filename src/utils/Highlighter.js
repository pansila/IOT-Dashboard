import ansi from 'ansi-styles'
import through2 from 'through2'

/*
const DEFAULT_HIGHLIGHT_COLOR = 'red' // If no color is specified, use red.
const DEFAULT_HIGHLIGHT_COLOR_PARAM = 'DEFAULT_HIGHLIGHT_COLOR_PARAM'
const NO_DASH_START_REGEX = /^[^-].*$/ // Text that does not start with a dash.
const DASH_START_REGEX = /^-.*$/

const validModifiers = {
  'ci': true, // case insensitive
  'cs': true, // case sensitive
  'esc': true, // escape regexp characters
  'wl': true // whole line
}

const validColors = {
  'black': true,
  'red': true,
  'green': true,
  'yellow': true,
  'blue': true,
  'magenta': true,
  'cyan': true,
  'white': true,
  'gray': true
}

const validBgColors = {
  'bgBlack': true,
  'bgRed': true,
  'bgGreen': true,
  'bgYellow': true,
  'bgBlue': true,
  'bgMagenta': true,
  'bgCyan': true,
  'bgWhite': true
}

const validStyles = {
  'reset': true,
  'bold': true,
  'dim': true,
  'italic': true,
  'underline': true,
  'inverse': true,
  'hidden': true,
  'strikethrough': true
}
*/

// Receives 'color1.color2...'.
// Returns {open:'ansi open codes', close:'ansi close codes'}
function buildAnsiColor (colorsStr) {
  let colorsArray = colorsStr.split('.')
  let ansiOpen = ''
  let ansiClose = ''
  for (let i = 0; i < colorsArray.length; i++) {
    let colorStr = colorsArray[i]
    ansiOpen += ansi[colorStr].open
    ansiClose = ansi[colorStr].close + ansiClose
  }
  return {open: ansiOpen, close: ansiClose}
}

/**
 * Text highlighting algorithm.
 * Iterates all highlightOptions and applies them in order such that last one will override the others.
 * For each step there is
 * a1..a2 - start/end match indexes for previous highlight option (HA)
 * b1..b2 - start/end match indexes for previous highlight option (HB)
 * As a general rule b1-b2 takes precedence over a1-a2. Following cases are possible.
 * Case1: a1...a2...b1...b2  or b1...b2...a1...a2
 *     Both intervals are distinct. They will be highlighted separately.
 *     HA - a1...a2
 *     HB - b1...b2
 * Case2: b1...a1...a2...b2
 *     HA will be removed.
 *     HB - b1...b2
 * Case3: b1...a1...b2...a2
 *     HB will override first section of HA
 *     HB - b1...b2
 *     HA - b2...a2
 * Case4: a1...b1...a2...b2
 *     HB will override last section of HA
 *     HB - b1...b2
 *     HA - a1...b1
 * Case5: a1...b1...b2...a2
 *     HB situated in the middle of HA. Three highlighting sections will be created:
 *     HA - a1...b1
 *     HB - b1...b2
 *     HA - b2...a2
 *
 */
function highlightLine (line, highlightOptions) {
  let sections = []
  for (let i = 0; i < highlightOptions.length; i++) {
    let highlightOption = highlightOptions[i]
    if (highlightOption) {
      while (true) {
        let match = highlightOption.patternRegex.exec(line)
        if (!match) {
          break
        }
        let b2 = highlightOption.patternRegex.lastIndex - 1
        let b1 = b2 - match[0].length + 1
        for (let j = 0; j < sections.length; j++) {
          let section = sections[j]
          if (section != null) {
            let a1 = section.start
            let a2 = section.end
            if (b1 <= a1 && b2 >= a2) { // Case 2
              // Remove section.
              sections[j] = null
            } else if (b1 <= a1 && b2 >= a1 && b2 < a2) { // Case 3
              section.start = b2 + 1
            } else if (b1 > a1 && b1 <= a2 && b2 >= a2) { // Case 4
              section.end = b1 - 1
            } else if (b1 > a1 && b2 < a2) { // 5
              sections.push({start: a1, end: b1 - 1, colorAnsi: sections[j].colorAnsi})
              sections.push({start: b2 + 1, end: a2, colorAnsi: sections[j].colorAnsi})
              sections[j] = null
            }
          }
        }
        sections.push({start: b1, end: b2, colorAnsi: highlightOption.colorAnsi})
      }
    }
  }
  let result = []
  let current = 0

  sections.sort(function (a, b) {
    if (a === null && b === null) {
      return 0
    }
    if (a === null && b !== null) {
      return 1
    }
    if (a !== null && b === null) {
      return -1
    }

    return a.start - b.start
  })

  for (let i = 0; i < sections.length; i++) {
    let section = sections[i]
    if (section) {
      result.push(line.substr(current, section.start - current))
      result.push(section.colorAnsi.open)
      result.push(line.substr(section.start, section.end - section.start + 1))
      result.push(section.colorAnsi.close)
      current = section.end + 1
    } else {
      break
    }
  }
  result.push(line.substr(current, line.length - current))

  return result.join('')
}

function buildColorFromText (highlightColorArg, defaultStyle) {
  let colorsText = highlightColorArg.split('.')
  let colorStr = defaultStyle
  for (let i = 0; i < colorsText.length; i++) {
    let colorText = colorsText[i]
    if (colorStr.length > 0) {
      colorStr += '.'
    }
    colorStr += colorText
  }
  return buildAnsiColor(colorStr)
}

/**
 * Highlights text according to 'options' and writes output to 'writer'.
 * Event emitter will send 'finished' and 'failed' when completed.
 * Options:
 * highlightOptions
 *      List of highlight options. Will be applied in the order they were specified by user.
 *      The first element is used for default highlights (for which no color was specified).
 *      If that element is null, no default highlights are used.
 *      Item format:
 *      {
 *          "patternArray": List of patterns as text
 *          "patternRegex": Regex representing concatenation of patternArray
 *          "colorText": Textual color combination
 *          "modifiers": {ci:true}
 *          "colorAnsi": {open:'ansi open codes', close:'ansi close codes'}
 *      },
 * }
 *
 */
function highlight (options) {
  // Transform highlight pattern into valid regexp.
  for (let i = 0; i < options.highlightOptions.length; i++) {
    let highlightOption = options.highlightOptions[i]
    if (highlightOption) {
      // Regex case option
      let caseOption = options.caseSensitive ? '' : 'i' // Case sensitive is default regex option
      if (highlightOption.modifiers['cs']) {
        caseOption = ''
      }
      if (highlightOption.modifiers['ci']) {
        caseOption = 'i'
      }
      let shouldEscape = highlightOption.modifiers['esc'] === true
      let wholeLine = highlightOption.modifiers['wl'] === true

      // Cache pattern as regex.
      let patternListStr = ''
      for (let j = highlightOption.patternArray.length - 1; j >= 0; j--) { // Iterate in reverse order because we want that last pattern to override the previous.
        if (patternListStr.length > 0) {
          patternListStr += '|'
        }
        let patternStr = highlightOption.patternArray[j]
        if (shouldEscape) {
          patternStr = escapeRegExp(patternStr)
        }
        if (wholeLine) {
          patternStr = '.*?' + patternStr + '.*'
        }
        patternListStr += patternStr
      }
      highlightOption.patternRegex = new RegExp(patternListStr, 'g' + caseOption)

      // Cache color
      highlightOption.colorAnsi = buildColorFromText(highlightOption.colorText, options.defaultStyle)
    }
  }

  function write (line, _, next) {
    this.push(highlightLine(line, options.highlightOptions))
    next()
  }

  return through2.obj(write, done => done())
}

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default highlight
